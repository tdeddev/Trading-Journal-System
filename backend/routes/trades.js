const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const { upload, processImages, deleteImage } = require('../middleware/upload');
const { createNotification, checkAndCreateTradeNotifications } = require('./notifications');
const router = express.Router();

// Helper function to calculate P&L
function calculatePnL(trade) {
  if (!trade.exit_price || !trade.entry_price || !trade.lot_size) return 0;
  
  const priceMultipliers = {
    'XAUUSD': 100,    // Gold
    'GBPUSD': 100000, // Forex major
    'EURUSD': 100000, // Forex major
    'USDJPY': 1000,   // Forex major (JPY pairs)
    'NAS100': 1,      // Index
    'DJI': 1,         // Index
    'SPX500': 1       // Index
  };
  
  const multiplier = priceMultipliers[trade.symbol] || 100000; // Default to forex
  const priceDiff = trade.trade_type === 'Long' 
    ? trade.exit_price - trade.entry_price
    : trade.entry_price - trade.exit_price;
    
  return parseFloat((priceDiff * trade.lot_size * multiplier).toFixed(2));
}

// Get all trades for user
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      symbol, 
      strategy_id, 
      session_id,
      trade_status = 'all',
      date_from, 
      date_to,
      sort_by = 'entry_time',
      sort_order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereConditions = ['t.user_id = ?'];
    let queryParams = [req.user.userId];
    
    if (symbol) {
      whereConditions.push('t.symbol = ?');
      queryParams.push(symbol);
    }
    
    if (strategy_id) {
      whereConditions.push('t.strategy_id = ?');
      queryParams.push(strategy_id);
    }
    
    if (session_id) {
      whereConditions.push('t.session_id = ?');
      queryParams.push(session_id);
    }
    
    if (trade_status !== 'all') {
      whereConditions.push('t.trade_status = ?');
      queryParams.push(trade_status);
    }
    
    if (date_from) {
      whereConditions.push('DATE(t.entry_time) >= ?');
      queryParams.push(date_from);
    }
    
    if (date_to) {
      whereConditions.push('DATE(t.entry_time) <= ?');
      queryParams.push(date_to);
    }
    
    const whereClause = whereConditions.join(' AND ');
    const validSortColumns = ['entry_time', 'exit_time', 'pnl', 'symbol', 'lot_size'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'entry_time';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get trades with strategy and session info
    const [trades] = await pool.execute(
      `SELECT t.*, 
        ts.strategy_name,
        s.session_name,
        DATE(t.entry_time) as trade_date
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE ${whereClause}
       ORDER BY t.${sortColumn} ${sortDirection}
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM trades t WHERE ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      data: {
        trades,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Get single trade
router.get('/:id', auth, async (req, res) => {
  try {
    const [trades] = await pool.execute(
      `SELECT t.*, 
        ts.strategy_name,
        s.session_name,
        s.session_date
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.id = ? AND t.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    
    if (trades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    // Get trade images
    const [images] = await pool.execute(
      'SELECT * FROM trade_images WHERE trade_id = ? ORDER BY upload_date ASC',
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        trade: trades[0],
        images
      }
    });
    
  } catch (error) {
    console.error('Get trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade'
    });
  }
});

// Create new trade
router.post('/', auth, async (req, res) => {
  try {
    const {
      session_id,
      strategy_id,
      symbol,
      trade_type,
      entry_price,
      stop_loss,
      take_profit,
      lot_size,
      entry_time,
      emotion,
      notes,
      tags
    } = req.body;
    
    // Validation
    if (!symbol || !trade_type || !entry_price || !lot_size || !entry_time) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, trade type, entry price, lot size, and entry time are required'
      });
    }
    
    const validTradeTypes = ['Long', 'Short'];
    if (!validTradeTypes.includes(trade_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade type'
      });
    }
    
    // Verify session and strategy belong to user if provided
    if (session_id) {
      const [sessionCheck] = await pool.execute(
        'SELECT id FROM trading_sessions WHERE id = ? AND user_id = ?',
        [session_id, req.user.userId]
      );
      if (sessionCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid session'
        });
      }
    }
    
    if (strategy_id) {
      const [strategyCheck] = await pool.execute(
        'SELECT id FROM trading_strategies WHERE id = ? AND user_id = ?',
        [strategy_id, req.user.userId]
      );
      if (strategyCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid strategy'
        });
      }
    }
    
    const [result] = await pool.execute(
      `INSERT INTO trades 
        (user_id, session_id, strategy_id, symbol, trade_type, entry_price, 
         stop_loss, take_profit, lot_size, entry_time, emotion, notes, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        session_id,
        strategy_id,
        symbol.toUpperCase(),
        trade_type,
        entry_price,
        stop_loss,
        take_profit,
        lot_size,
        entry_time,
        emotion,
        notes,
        tags
      ]
    );
    
    // Get the created trade
    const [newTrade] = await pool.execute(
      `SELECT t.*, ts.strategy_name, s.session_name 
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.id = ?`,
      [result.insertId]
    );
    
    // Create notification for new trade
    await createNotification(
      req.user.userId,
      'info',
      'New Trade Opened',
      `${symbol} ${trade_type} position opened at $${entry_price}`,
      result.insertId,
      'trade'
    );
    
    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      data: newTrade[0]
    });
    
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trade'
    });
  }
});

// Close trade
router.put('/:id/close', auth, async (req, res) => {
  try {
    const { exit_price, exit_time, commission = 0, swap = 0, trade_quality } = req.body;
    
    if (!exit_price || !exit_time) {
      return res.status(400).json({
        success: false,
        message: 'Exit price and time are required'
      });
    }
    
    // Get current trade
    const [trades] = await pool.execute(
      'SELECT * FROM trades WHERE id = ? AND user_id = ? AND trade_status = "Open"',
      [req.params.id, req.user.userId]
    );
    
    if (trades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Open trade not found'
      });
    }
    
    const trade = trades[0];
    
    // Calculate P&L
    const calculatedPnL = calculatePnL({
      ...trade,
      exit_price,
      commission,
      swap
    });
    
    const finalPnL = calculatedPnL - commission + swap;
    
    // Calculate duration
    const entryTime = new Date(trade.entry_time);
    const exitTimeDate = new Date(exit_time);
    const durationMinutes = Math.round((exitTimeDate - entryTime) / (1000 * 60));
    
    // Calculate pips (simplified)
    const pipMultipliers = {
      'USDJPY': 100,
      'XAUUSD': 10,
      'NAS100': 1,
      'DJI': 1
    };
    const pipMultiplier = pipMultipliers[trade.symbol] || 10000;
    const pnlPips = (exit_price - trade.entry_price) * pipMultiplier;
    const adjustedPnlPips = trade.trade_type === 'Long' ? pnlPips : -pnlPips;
    
    // Update trade
    await pool.execute(
      `UPDATE trades SET 
        exit_price = ?,
        exit_time = ?,
        pnl = ?,
        pnl_pips = ?,
        commission = ?,
        swap = ?,
        duration_minutes = ?,
        trade_quality = ?,
        trade_status = 'Closed',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        exit_price,
        exit_time,
        finalPnL,
        adjustedPnlPips,
        commission,
        swap,
        durationMinutes,
        trade_quality,
        req.params.id
      ]
    );
    
    // Update session statistics if trade belongs to a session
    if (trade.session_id) {
      await pool.execute(
        `UPDATE trading_sessions s SET
          total_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed'),
          winning_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed' AND pnl > 0),
          losing_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed' AND pnl < 0),
          actual_pnl = (SELECT COALESCE(SUM(pnl), 0) FROM trades WHERE session_id = s.id AND trade_status = 'Closed')
         WHERE id = ?`,
        [trade.session_id]
      );
    }
    
    // Get updated trade
    const [updatedTrade] = await pool.execute(
      `SELECT t.*, ts.strategy_name, s.session_name 
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    
    // Create notification for closed trade
    const trade = updatedTrade[0];
    const profitLoss = finalPnL >= 0 ? 'profit' : 'loss';
    const notificationType = finalPnL >= 0 ? 'success' : 'info';
    
    await createNotification(
      req.user.userId,
      notificationType,
      `Trade Closed - ${profitLoss.charAt(0).toUpperCase() + profitLoss.slice(1)}`,
      `${trade.symbol} ${trade.trade_type} closed with $${finalPnL.toFixed(2)} ${profitLoss}`,
      parseInt(req.params.id),
      'trade'
    );
    
    // Check and create milestone/risk notifications
    await checkAndCreateTradeNotifications(req.user.userId);
    
    res.json({
      success: true,
      message: 'Trade closed successfully',
      data: updatedTrade[0]
    });
    
  } catch (error) {
    console.error('Close trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close trade'
    });
  }
});

// Update trade
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      stop_loss,
      take_profit,
      emotion,
      trade_quality,
      notes,
      tags
    } = req.body;
    
    // Check if trade exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trades WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    await pool.execute(
      `UPDATE trades SET 
        stop_loss = COALESCE(?, stop_loss),
        take_profit = COALESCE(?, take_profit),
        emotion = COALESCE(?, emotion),
        trade_quality = COALESCE(?, trade_quality),
        notes = COALESCE(?, notes),
        tags = COALESCE(?, tags),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [stop_loss, take_profit, emotion, trade_quality, notes, tags, req.params.id]
    );
    
    // Get updated trade
    const [updated] = await pool.execute(
      `SELECT t.*, ts.strategy_name, s.session_name 
       FROM trades t
       LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
       LEFT JOIN trading_sessions s ON t.session_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Trade updated successfully',
      data: updated[0]
    });
    
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trade'
    });
  }
});

// Delete trade
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if trade exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT session_id FROM trades WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    const sessionId = existing[0].session_id;
    
    // Delete trade (images will be cascade deleted)
    await pool.execute(
      'DELETE FROM trades WHERE id = ?',
      [req.params.id]
    );
    
    // Update session statistics if trade belonged to a session
    if (sessionId) {
      await pool.execute(
        `UPDATE trading_sessions s SET
          total_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed'),
          winning_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed' AND pnl > 0),
          losing_trades = (SELECT COUNT(*) FROM trades WHERE session_id = s.id AND trade_status = 'Closed' AND pnl < 0),
          actual_pnl = (SELECT COALESCE(SUM(pnl), 0) FROM trades WHERE session_id = s.id AND trade_status = 'Closed')
         WHERE id = ?`,
        [sessionId]
      );
    }
    
    res.json({
      success: true,
      message: 'Trade deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trade'
    });
  }
});

// Upload images for trade
router.post('/:id/images', auth, upload, processImages, async (req, res) => {
  try {
    const tradeId = req.params.id;
    
    // Verify trade belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trades WHERE id = ? AND user_id = ?',
      [tradeId, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    if (!req.processedFiles || req.processedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }
    
    // Save image records to database
    const imageRecords = [];
    for (const file of req.processedFiles) {
      const [result] = await pool.execute(
        `INSERT INTO trade_images (trade_id, filename, original_filename, file_path, thumbnail_path, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tradeId, file.filename, file.originalName, file.filepath, file.thumbnailPath, file.size]
      );
      
      imageRecords.push({
        id: result.insertId,
        filename: file.filename,
        original_filename: file.originalName,
        file_path: file.filepath,
        thumbnail_path: file.thumbnailPath,
        file_size: file.size
      });
    }
    
    res.json({
      success: true,
      message: `${imageRecords.length} image(s) uploaded successfully`,
      data: imageRecords
    });
    
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

// Get images for trade
router.get('/:id/images', auth, async (req, res) => {
  try {
    const tradeId = req.params.id;
    
    // Verify trade belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM trades WHERE id = ? AND user_id = ?',
      [tradeId, req.user.userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    const [images] = await pool.execute(
      'SELECT * FROM trade_images WHERE trade_id = ? ORDER BY created_at DESC',
      [tradeId]
    );
    
    res.json({
      success: true,
      data: images
    });
    
  } catch (error) {
    console.error('Get trade images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trade images'
    });
  }
});

// Delete trade image
router.delete('/images/:imageId', auth, async (req, res) => {
  try {
    const imageId = req.params.imageId;
    
    // Get image info and verify ownership
    const [images] = await pool.execute(
      `SELECT ti.*, t.user_id 
       FROM trade_images ti
       JOIN trades t ON ti.trade_id = t.id
       WHERE ti.id = ?`,
      [imageId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const image = images[0];
    
    if (image.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Delete from database
    await pool.execute(
      'DELETE FROM trade_images WHERE id = ?',
      [imageId]
    );
    
    // Delete physical files
    await deleteImage(image.filename);
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete trade image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

module.exports = router;