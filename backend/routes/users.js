const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.timezone, u.avatar_url, u.created_at, u.last_login,
        us.default_lot_size, us.default_risk_percent, us.preferred_timeframe,
        us.theme_preference, us.default_session, us.currency_display
       FROM users u
       LEFT JOIN user_settings us ON u.id = us.user_id
       WHERE u.id = ?`,
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, timezone } = req.body;
    
    await pool.execute(
      `UPDATE users SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        timezone = COALESCE(?, timezone),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, timezone, req.user.userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (settings.length === 0) {
      // Create default settings if they don't exist
      await pool.execute(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [req.user.userId]
      );
      
      const [newSettings] = await pool.execute(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [req.user.userId]
      );
      
      return res.json({
        success: true,
        data: newSettings[0]
      });
    }
    
    res.json({
      success: true,
      data: settings[0]
    });
    
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const {
      default_lot_size,
      default_risk_percent,
      preferred_timeframe,
      dashboard_layout,
      notification_settings,
      theme_preference,
      default_session,
      auto_calculate_pnl,
      currency_display,
      date_format,
      time_format
    } = req.body;
    
    // Ensure user settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM user_settings WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [req.user.userId]
      );
    }
    
    await pool.execute(
      `UPDATE user_settings SET 
        default_lot_size = COALESCE(?, default_lot_size),
        default_risk_percent = COALESCE(?, default_risk_percent),
        preferred_timeframe = COALESCE(?, preferred_timeframe),
        dashboard_layout = COALESCE(?, dashboard_layout),
        notification_settings = COALESCE(?, notification_settings),
        theme_preference = COALESCE(?, theme_preference),
        default_session = COALESCE(?, default_session),
        auto_calculate_pnl = COALESCE(?, auto_calculate_pnl),
        currency_display = COALESCE(?, currency_display),
        date_format = COALESCE(?, date_format),
        time_format = COALESCE(?, time_format),
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        default_lot_size,
        default_risk_percent,
        preferred_timeframe,
        dashboard_layout ? JSON.stringify(dashboard_layout) : null,
        notification_settings ? JSON.stringify(notification_settings) : null,
        theme_preference,
        default_session,
        auto_calculate_pnl,
        currency_display,
        date_format,
        time_format,
        req.user.userId
      ]
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// Get user dashboard summary
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get overall statistics
    const [overallStats] = await pool.execute(
      `SELECT 
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(AVG(CASE WHEN t.pnl > 0 THEN t.pnl END), 0) as avg_win,
        COALESCE(AVG(CASE WHEN t.pnl < 0 THEN t.pnl END), 0) as avg_loss,
        COUNT(DISTINCT t.symbol) as symbols_traded,
        COUNT(DISTINCT DATE(t.entry_time)) as trading_days
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed'`,
      [req.user.userId]
    );
    
    // Get recent trades
    const [recentTrades] = await pool.execute(
      `SELECT t.*, ts.strategy_name, s.session_name
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.user_id = ?
       ORDER BY t.entry_time DESC
       LIMIT 10`,
      [req.user.userId]
    );
    
    // Get monthly P&L
    const [monthlyPnL] = await pool.execute(
      `SELECT 
        DATE_FORMAT(t.exit_time, '%Y-%m') as month,
        SUM(t.pnl) as monthly_pnl,
        COUNT(t.id) as monthly_trades
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(t.exit_time, '%Y-%m')
       ORDER BY month ASC`,
      [req.user.userId]
    );
    
    // Get strategy performance
    const [strategyPerformance] = await pool.execute(
      `SELECT 
        ts.strategy_name,
        COUNT(t.id) as trades_count,
        SUM(t.pnl) as strategy_pnl,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins
       FROM trading_strategies ts
       LEFT JOIN trades t ON ts.id = t.strategy_id AND t.trade_status = 'Closed'
       WHERE ts.user_id = ?
       GROUP BY ts.id, ts.strategy_name
       HAVING trades_count > 0
       ORDER BY strategy_pnl DESC`,
      [req.user.userId]
    );
    
    // Calculate additional metrics
    const stats = overallStats[0];
    const winRate = stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades * 100) : 0;
    const profitFactor = stats.avg_loss !== 0 ? Math.abs(stats.avg_win / stats.avg_loss) : 0;
    
    res.json({
      success: true,
      data: {
        overall_stats: {
          ...stats,
          win_rate: winRate.toFixed(2),
          profit_factor: profitFactor.toFixed(4)
        },
        recent_trades: recentTrades,
        monthly_pnl: monthlyPnL,
        strategy_performance: strategyPerformance
      }
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get user activity log
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get recent activities (trades, sessions, strategies)
    const [activities] = await pool.execute(
      `(SELECT 'trade' as type, id, symbol as title, entry_time as activity_time, 
               CONCAT('Entered ', trade_type, ' position on ', symbol) as description
        FROM trades 
        WHERE user_id = ?
        ORDER BY entry_time DESC
        LIMIT 50)
       UNION ALL
       (SELECT 'session' as type, id, CONCAT(session_name, ' Session') as title, created_at as activity_time,
               CONCAT('Created ', session_name, ' session for ', session_date) as description
        FROM trading_sessions 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20)
       UNION ALL
       (SELECT 'strategy' as type, id, strategy_name as title, created_at as activity_time,
               CONCAT('Created strategy: ', strategy_name) as description
        FROM trading_strategies 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10)
       ORDER BY activity_time DESC
       LIMIT ? OFFSET ?`,
      [req.user.userId, req.user.userId, req.user.userId, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log'
    });
  }
});

module.exports = router;