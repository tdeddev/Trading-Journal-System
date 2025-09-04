const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, unread_only = false } = req.query;
    const userId = req.user.id;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let queryParams = [userId];

    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    queryParams.push(parseInt(limit));

    const notifications = await executeQuery(query, queryParams);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

router.post('/mark-read/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    await executeQuery(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await executeQuery(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    await executeQuery(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await executeQuery(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: { unread_count: result[0].unread_count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    await executeQuery(
      'INSERT INTO notifications (user_id, notification_type, title, message, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, title, message, relatedId, relatedType]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

const checkAndCreateTradeNotifications = async (userId) => {
  try {
    const trades = await executeQuery(
      'SELECT COUNT(*) as total_trades, SUM(pnl) as total_pnl, AVG(pnl) as avg_pnl FROM trades WHERE user_id = ? AND trade_status = "Closed"',
      [userId]
    );

    if (trades[0].total_trades > 0) {
      const { total_trades, total_pnl, avg_pnl } = trades[0];

      if (total_trades % 10 === 0) {
        await createNotification(
          userId,
          'milestone',
          'Trading Milestone!',
          `Congratulations! You've completed ${total_trades} trades.`,
          null,
          'trades'
        );
      }

      if (total_pnl >= 1000) {
        await createNotification(
          userId,
          'achievement',
          'Profit Achievement!',
          `Great job! Your total profit has reached $${total_pnl.toFixed(2)}.`,
          null,
          'profit'
        );
      }

      const recentLosses = await executeQuery(
        'SELECT COUNT(*) as loss_count FROM trades WHERE user_id = ? AND pnl < 0 AND entry_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)',
        [userId]
      );

      if (recentLosses[0].loss_count >= 3) {
        await createNotification(
          userId,
          'warning',
          'Risk Alert',
          'You have 3 or more losing trades in the last 24 hours. Consider reviewing your strategy.',
          null,
          'risk'
        );
      }
    }
  } catch (error) {
    console.error('Check trade notifications error:', error);
  }
};

module.exports = { router, createNotification, checkAndCreateTradeNotifications };