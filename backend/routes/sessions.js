const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, session_name, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['user_id = ?'];
    let queryParams = [req.user.userId];
    
    if (session_name) {
      whereConditions.push('session_name = ?');
      queryParams.push(session_name);
    }
    
    if (date_from) {
      whereConditions.push('session_date >= ?');
      queryParams.push(date_from);
    }
    
    if (date_to) {
      whereConditions.push('session_date <= ?');
      queryParams.push(date_to);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get sessions with trade count
    const [sessions] = await pool.execute(
      `SELECT s.*, 
        COUNT(t.id) as trade_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        COALESCE(SUM(t.pnl), 0) as calculated_pnl
       FROM trading_sessions s
       LEFT JOIN trades t ON s.id = t.session_id
       WHERE ${whereClause}
       GROUP BY s.id
       ORDER BY s.session_date DESC, s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM trading_sessions WHERE ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
});

// Get single session
router.get('/:id', auth, async (req, res) => {
  try {
    const [sessions] = await pool.execute(
      `SELECT s.*, 
        COUNT(t.id) as trade_count,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        COALESCE(SUM(t.pnl), 0) as calculated_pnl
       FROM trading_sessions s
       LEFT JOIN trades t ON s.id = t.session_id
       WHERE s.id = ? AND s.user_id = ?
       GROUP BY s.id`,
      [req.params.id, req.user.userId]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Get trades for this session
    const [trades] = await pool.execute(
      `SELECT t.*, ts.strategy_name 
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       WHERE t.session_id = ?
       ORDER BY t.entry_time ASC`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        session: sessions[0],
        trades
      }
    });
    
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session'
    });
  }
});

// Create new session
router.post('/', auth, async (req, res) => {
  try {
    const {
      session_name,
      session_date,
      market_bias,
      market_condition,
      pnl_target,
      risk_limit,
      notes,
      session_start,
      session_end
    } = req.body;
    
    // Validation
    if (!session_name || !session_date) {
      return res.status(400).json({
        success: false,
        message: 'Session name and date are required'
      });
    }
    
    const validSessions = ['London', 'New York', 'Tokyo', 'Sydney'];
    if (!validSessions.includes(session_name)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session name'
      });
    }
    
    // Check if session already exists for this date
    const [existing] = await pool.execute(
      'SELECT id FROM trading_sessions WHERE user_id = ? AND session_name = ? AND session_date = ?',
      [req.user.userId, session_name, session_date]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Session already exists for this date'
      });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO trading_sessions 
        (user_id, session_name, session_date, market_bias, market_condition, 
         pnl_target, risk_limit, notes, session_start, session_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        session_name,
        session_date,
        market_bias || 'Neutral',
        market_condition,
        pnl_target,
        risk_limit,
        notes,
        session_start,
        session_end
      ]
    );
    
    // Get the created session
    const [newSession] = await pool.execute(
      'SELECT * FROM trading_sessions WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: newSession[0]
    });
    
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

// Update session
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      market_bias,
      market_condition,
      pnl_target,
      risk_limit,
      notes,
      session_start,
      session_end
    } = req.body;
    
    // Check if session exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trading_sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    await pool.execute(
      `UPDATE trading_sessions SET 
        market_bias = COALESCE(?, market_bias),
        market_condition = COALESCE(?, market_condition),
        pnl_target = COALESCE(?, pnl_target),
        risk_limit = COALESCE(?, risk_limit),
        notes = COALESCE(?, notes),
        session_start = COALESCE(?, session_start),
        session_end = COALESCE(?, session_end),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [market_bias, market_condition, pnl_target, risk_limit, notes, session_start, session_end, req.params.id]
    );
    
    // Get updated session
    const [updated] = await pool.execute(
      'SELECT * FROM trading_sessions WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Session updated successfully',
      data: updated[0]
    });
    
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session'
    });
  }
});

// Delete session
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if session exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trading_sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Check if session has trades
    const [trades] = await pool.execute(
      'SELECT COUNT(*) as count FROM trades WHERE session_id = ?',
      [req.params.id]
    );
    
    if (trades[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete session with existing trades'
      });
    }
    
    await pool.execute(
      'DELETE FROM trading_sessions WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
});

// Get session statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(AVG(CASE WHEN t.pnl > 0 THEN t.pnl END), 0) as avg_win,
        COALESCE(AVG(CASE WHEN t.pnl < 0 THEN t.pnl END), 0) as avg_loss,
        COALESCE(AVG(t.duration_minutes), 0) as avg_duration,
        COUNT(DISTINCT t.symbol) as symbols_traded
       FROM trading_sessions s
       LEFT JOIN trades t ON s.id = t.session_id
       WHERE s.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    
    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const sessionStats = stats[0];
    sessionStats.win_rate = sessionStats.total_trades > 0 
      ? (sessionStats.winning_trades / sessionStats.total_trades * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      data: sessionStats
    });
    
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session statistics'
    });
  }
});

module.exports = router;