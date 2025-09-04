const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all strategies for user
router.get('/', auth, async (req, res) => {
  try {
    const { active_only = 'false' } = req.query;
    
    let whereCondition = 'user_id = ?';
    const queryParams = [req.user.userId];
    
    if (active_only === 'true') {
      whereCondition += ' AND is_active = true';
    }
    
    const [strategies] = await pool.execute(
      `SELECT s.*,
        COUNT(t.id) as total_trades_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades_count,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades_count,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(AVG(CASE WHEN t.pnl > 0 THEN t.pnl END), 0) as calculated_avg_win,
        COALESCE(AVG(CASE WHEN t.pnl < 0 THEN t.pnl END), 0) as calculated_avg_loss
       FROM trading_strategies s
       LEFT JOIN trades t ON s.id = t.strategy_id AND t.trade_status = 'Closed'
       WHERE ${whereCondition}
       GROUP BY s.id
       ORDER BY s.strategy_name ASC`,
      queryParams
    );
    
    // Calculate real-time statistics
    strategies.forEach(strategy => {
      if (strategy.total_trades_count > 0) {
        strategy.calculated_success_rate = (strategy.winning_trades_count / strategy.total_trades_count * 100).toFixed(2);
        strategy.calculated_profit_factor = strategy.calculated_avg_loss !== 0 
          ? (Math.abs(strategy.calculated_avg_win / strategy.calculated_avg_loss)).toFixed(4)
          : 0;
      } else {
        strategy.calculated_success_rate = 0;
        strategy.calculated_profit_factor = 0;
      }
    });
    
    res.json({
      success: true,
      data: strategies
    });
    
  } catch (error) {
    console.error('Get strategies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategies'
    });
  }
});

// Get single strategy
router.get('/:id', auth, async (req, res) => {
  try {
    const [strategies] = await pool.execute(
      `SELECT s.*,
        COUNT(t.id) as total_trades_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades_count,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades_count,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(AVG(CASE WHEN t.pnl > 0 THEN t.pnl END), 0) as avg_win_amount,
        COALESCE(AVG(CASE WHEN t.pnl < 0 THEN t.pnl END), 0) as avg_loss_amount
       FROM trading_strategies s
       LEFT JOIN trades t ON s.id = t.strategy_id AND t.trade_status = 'Closed'
       WHERE s.id = ? AND s.user_id = ?
       GROUP BY s.id`,
      [req.params.id, req.user.userId]
    );
    
    if (strategies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    // Get recent trades for this strategy
    const [recentTrades] = await pool.execute(
      `SELECT t.*, s.session_name
       FROM trades t
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.strategy_id = ? AND t.trade_status = 'Closed'
       ORDER BY t.exit_time DESC
       LIMIT 10`,
      [req.params.id]
    );
    
    const strategy = strategies[0];
    if (strategy.total_trades_count > 0) {
      strategy.calculated_success_rate = (strategy.winning_trades_count / strategy.total_trades_count * 100).toFixed(2);
      strategy.calculated_profit_factor = strategy.avg_loss_amount !== 0 
        ? (Math.abs(strategy.avg_win_amount / strategy.avg_loss_amount)).toFixed(4)
        : 0;
    }
    
    res.json({
      success: true,
      data: {
        strategy,
        recent_trades: recentTrades
      }
    });
    
  } catch (error) {
    console.error('Get strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategy'
    });
  }
});

// Create new strategy
router.post('/', auth, async (req, res) => {
  try {
    const { strategy_name, strategy_type, description } = req.body;
    
    // Validation
    if (!strategy_name || !strategy_type) {
      return res.status(400).json({
        success: false,
        message: 'Strategy name and type are required'
      });
    }
    
    const validTypes = ['Pullback', 'Fibonacci', 'Mean Reversion', 'Custom'];
    if (!validTypes.includes(strategy_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid strategy type'
      });
    }
    
    // Check if strategy name already exists for this user
    const [existing] = await pool.execute(
      'SELECT id FROM trading_strategies WHERE user_id = ? AND strategy_name = ?',
      [req.user.userId, strategy_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Strategy name already exists'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO trading_strategies (user_id, strategy_name, strategy_type, description) VALUES (?, ?, ?, ?)',
      [req.user.userId, strategy_name, strategy_type, description]
    );
    
    // Get the created strategy
    const [newStrategy] = await pool.execute(
      'SELECT * FROM trading_strategies WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Strategy created successfully',
      data: newStrategy[0]
    });
    
  } catch (error) {
    console.error('Create strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create strategy'
    });
  }
});

// Update strategy
router.put('/:id', auth, async (req, res) => {
  try {
    const { strategy_name, description, is_active } = req.body;
    
    // Check if strategy exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id, strategy_name FROM trading_strategies WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    // Check if new name conflicts with existing strategy (if name is being changed)
    if (strategy_name && strategy_name !== existing[0].strategy_name) {
      const [nameCheck] = await pool.execute(
        'SELECT id FROM trading_strategies WHERE user_id = ? AND strategy_name = ? AND id != ?',
        [req.user.userId, strategy_name, req.params.id]
      );
      
      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Strategy name already exists'
        });
      }
    }
    
    await pool.execute(
      `UPDATE trading_strategies SET 
        strategy_name = COALESCE(?, strategy_name),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [strategy_name, description, is_active, req.params.id]
    );
    
    // Get updated strategy
    const [updated] = await pool.execute(
      'SELECT * FROM trading_strategies WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Strategy updated successfully',
      data: updated[0]
    });
    
  } catch (error) {
    console.error('Update strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strategy'
    });
  }
});

// Delete strategy
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if strategy exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trading_strategies WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    // Check if strategy has trades
    const [trades] = await pool.execute(
      'SELECT COUNT(*) as count FROM trades WHERE strategy_id = ?',
      [req.params.id]
    );
    
    if (trades[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete strategy with existing trades. Consider deactivating instead.'
      });
    }
    
    await pool.execute(
      'DELETE FROM trading_strategies WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Strategy deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete strategy'
    });
  }
});

// Get strategy performance analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    // Monthly performance
    const [monthlyStats] = await pool.execute(
      `SELECT 
        DATE_FORMAT(t.exit_time, '%Y-%m') as month,
        COUNT(t.id) as trades_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losses,
        SUM(t.pnl) as monthly_pnl,
        AVG(t.pnl) as avg_pnl
       FROM trades t
       JOIN trading_strategies s ON t.strategy_id = s.id
       WHERE s.id = ? AND s.user_id = ? AND t.trade_status = 'Closed'
       GROUP BY DATE_FORMAT(t.exit_time, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`,
      [req.params.id, req.user.userId]
    );
    
    // Performance by symbol
    const [symbolStats] = await pool.execute(
      `SELECT 
        t.symbol,
        COUNT(t.id) as trades_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_pnl
       FROM trades t
       JOIN trading_strategies s ON t.strategy_id = s.id
       WHERE s.id = ? AND s.user_id = ? AND t.trade_status = 'Closed'
       GROUP BY t.symbol
       ORDER BY total_pnl DESC`,
      [req.params.id, req.user.userId]
    );
    
    // Performance by emotion
    const [emotionStats] = await pool.execute(
      `SELECT 
        t.emotion,
        COUNT(t.id) as trades_count,
        AVG(t.pnl) as avg_pnl,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins
       FROM trades t
       JOIN trading_strategies s ON t.strategy_id = s.id
       WHERE s.id = ? AND s.user_id = ? AND t.trade_status = 'Closed' AND t.emotion IS NOT NULL
       GROUP BY t.emotion
       ORDER BY avg_pnl DESC`,
      [req.params.id, req.user.userId]
    );
    
    // Win/Loss streaks
    const [streakData] = await pool.execute(
      `SELECT 
        t.exit_time,
        t.pnl,
        CASE WHEN t.pnl > 0 THEN 'Win' ELSE 'Loss' END as result
       FROM trades t
       JOIN trading_strategies s ON t.strategy_id = s.id
       WHERE s.id = ? AND s.user_id = ? AND t.trade_status = 'Closed'
       ORDER BY t.exit_time ASC`,
      [req.params.id, req.user.userId]
    );
    
    res.json({
      success: true,
      data: {
        monthly_performance: monthlyStats,
        symbol_performance: symbolStats,
        emotion_performance: emotionStats,
        streak_data: streakData
      }
    });
    
  } catch (error) {
    console.error('Get strategy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategy analytics'
    });
  }
});

// Update strategy statistics (manually refresh)
router.post('/:id/refresh-stats', auth, async (req, res) => {
  try {
    // Calculate fresh statistics
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(t.id) as total,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins,
        AVG(CASE WHEN t.pnl > 0 THEN t.pnl END) as avg_win,
        AVG(CASE WHEN t.pnl < 0 THEN t.pnl END) as avg_loss
       FROM trades t
       WHERE t.strategy_id = ? AND t.trade_status = 'Closed'`,
      [req.params.id]
    );
    
    const tradeStats = stats[0];
    const successRate = tradeStats.total > 0 ? (tradeStats.wins / tradeStats.total * 100) : 0;
    const profitFactor = tradeStats.avg_loss !== null && tradeStats.avg_loss !== 0 
      ? Math.abs(tradeStats.avg_win / tradeStats.avg_loss) 
      : 0;
    
    // Update strategy
    await pool.execute(
      `UPDATE trading_strategies SET
        total_trades = ?,
        winning_trades = ?,
        success_rate = ?,
        avg_win = ?,
        avg_loss = ?,
        profit_factor = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        tradeStats.total || 0,
        tradeStats.wins || 0,
        successRate,
        tradeStats.avg_win || 0,
        tradeStats.avg_loss || 0,
        profitFactor,
        req.params.id,
        req.user.userId
      ]
    );
    
    res.json({
      success: true,
      message: 'Strategy statistics refreshed successfully',
      data: {
        total_trades: tradeStats.total || 0,
        winning_trades: tradeStats.wins || 0,
        success_rate: successRate.toFixed(2),
        profit_factor: profitFactor.toFixed(4)
      }
    });
    
  } catch (error) {
    console.error('Refresh strategy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh strategy statistics'
    });
  }
});

module.exports = router;