const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get overall performance analytics
router.get('/performance', auth, async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '1m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case '3m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case '6m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
        break;
      case '12m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
        break;
      case 'all':
      default:
        dateFilter = '';
    }
    
    // Overall performance metrics
    const [performance] = await pool.execute(
      `SELECT 
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_pnl,
        MAX(t.pnl) as best_trade,
        MIN(t.pnl) as worst_trade,
        AVG(CASE WHEN t.pnl > 0 THEN t.pnl END) as avg_win,
        AVG(CASE WHEN t.pnl < 0 THEN t.pnl END) as avg_loss,
        AVG(t.duration_minutes) as avg_duration,
        COUNT(DISTINCT t.symbol) as symbols_traded,
        COUNT(DISTINCT DATE(t.entry_time)) as active_days
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' ${dateFilter}`,
      [req.user.userId]
    );
    
    const stats = performance[0];
    const winRate = stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades * 100) : 0;
    const profitFactor = stats.avg_loss !== 0 && stats.avg_loss !== null ? Math.abs(stats.avg_win / stats.avg_loss) : 0;
    
    res.json({
      success: true,
      data: {
        ...stats,
        win_rate: winRate.toFixed(2),
        profit_factor: profitFactor.toFixed(4),
        risk_reward_ratio: stats.avg_win && stats.avg_loss ? Math.abs(stats.avg_win / stats.avg_loss).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics'
    });
  }
});

// Get equity curve data
router.get('/equity-curve', auth, async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '1m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case '3m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case '6m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
        break;
      case '12m':
        dateFilter = 'AND t.exit_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
        break;
      default:
        dateFilter = '';
    }
    
    const [equityData] = await pool.execute(
      `SELECT 
        DATE(t.exit_time) as trade_date,
        SUM(t.pnl) as daily_pnl,
        COUNT(t.id) as daily_trades
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' ${dateFilter}
       GROUP BY DATE(t.exit_time)
       ORDER BY trade_date ASC`,
      [req.user.userId]
    );
    
    // Calculate cumulative P&L
    let cumulativePnL = 0;
    const equityCurve = equityData.map(day => {
      cumulativePnL += parseFloat(day.daily_pnl);
      return {
        ...day,
        cumulative_pnl: cumulativePnL.toFixed(2)
      };
    });
    
    res.json({
      success: true,
      data: equityCurve
    });
    
  } catch (error) {
    console.error('Get equity curve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equity curve data'
    });
  }
});

// Get symbol performance breakdown
router.get('/symbols', auth, async (req, res) => {
  try {
    const [symbolData] = await pool.execute(
      `SELECT 
        t.symbol,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_pnl,
        MAX(t.pnl) as best_trade,
        MIN(t.pnl) as worst_trade,
        AVG(t.duration_minutes) as avg_duration
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed'
       GROUP BY t.symbol
       ORDER BY total_pnl DESC`,
      [req.user.userId]
    );
    
    // Calculate win rate for each symbol
    const symbolPerformance = symbolData.map(symbol => ({
      ...symbol,
      win_rate: symbol.total_trades > 0 ? (symbol.winning_trades / symbol.total_trades * 100).toFixed(2) : 0
    }));
    
    res.json({
      success: true,
      data: symbolPerformance
    });
    
  } catch (error) {
    console.error('Get symbol analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch symbol analytics'
    });
  }
});

// Get session performance analysis
router.get('/sessions', auth, async (req, res) => {
  try {
    const [sessionData] = await pool.execute(
      `SELECT 
        s.session_name,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_pnl,
        COUNT(DISTINCT DATE(t.entry_time)) as active_days
       FROM trading_sessions s
       LEFT JOIN trades t ON s.id = t.session_id AND t.trade_status = 'Closed'
       WHERE s.user_id = ?
       GROUP BY s.session_name
       ORDER BY total_pnl DESC`,
      [req.user.userId]
    );
    
    // Calculate session performance metrics
    const sessionPerformance = sessionData.map(session => ({
      ...session,
      win_rate: session.total_trades > 0 ? (session.winning_trades / session.total_trades * 100).toFixed(2) : 0,
      trades_per_day: session.active_days > 0 ? (session.total_trades / session.active_days).toFixed(2) : 0
    }));
    
    res.json({
      success: true,
      data: sessionPerformance
    });
    
  } catch (error) {
    console.error('Get session analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session analytics'
    });
  }
});

// Get emotion impact analysis
router.get('/emotions', auth, async (req, res) => {
  try {
    const [emotionData] = await pool.execute(
      `SELECT 
        t.emotion,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_pnl,
        MAX(t.pnl) as best_trade,
        MIN(t.pnl) as worst_trade
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' AND t.emotion IS NOT NULL
       GROUP BY t.emotion
       ORDER BY avg_pnl DESC`,
      [req.user.userId]
    );
    
    // Calculate emotion impact
    const emotionAnalysis = emotionData.map(emotion => ({
      ...emotion,
      win_rate: emotion.total_trades > 0 ? (emotion.winning_trades / emotion.total_trades * 100).toFixed(2) : 0
    }));
    
    res.json({
      success: true,
      data: emotionAnalysis
    });
    
  } catch (error) {
    console.error('Get emotion analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emotion analytics'
    });
  }
});

// Get monthly breakdown
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const [monthlyData] = await pool.execute(
      `SELECT 
        MONTH(t.exit_time) as month,
        MONTHNAME(t.exit_time) as month_name,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(t.pnl) as monthly_pnl,
        AVG(t.pnl) as avg_pnl,
        COUNT(DISTINCT DATE(t.exit_time)) as trading_days
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' AND YEAR(t.exit_time) = ?
       GROUP BY MONTH(t.exit_time), MONTHNAME(t.exit_time)
       ORDER BY month ASC`,
      [req.user.userId, year]
    );
    
    // Fill in missing months with zero data
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const fullYearData = months.map((monthName, index) => {
      const monthData = monthlyData.find(m => m.month === index + 1);
      return monthData ? {
        ...monthData,
        win_rate: monthData.total_trades > 0 ? (monthData.winning_trades / monthData.total_trades * 100).toFixed(2) : 0
      } : {
        month: index + 1,
        month_name: monthName,
        total_trades: 0,
        winning_trades: 0,
        monthly_pnl: 0,
        avg_pnl: 0,
        trading_days: 0,
        win_rate: 0
      };
    });
    
    res.json({
      success: true,
      data: fullYearData
    });
    
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly analytics'
    });
  }
});

// Get drawdown analysis
router.get('/drawdown', auth, async (req, res) => {
  try {
    const [tradeSequence] = await pool.execute(
      `SELECT 
        t.exit_time,
        t.pnl,
        @running_total := @running_total + t.pnl AS cumulative_pnl
       FROM trades t
       CROSS JOIN (SELECT @running_total := 0) r
       WHERE t.user_id = ? AND t.trade_status = 'Closed'
       ORDER BY t.exit_time ASC`,
      [req.user.userId]
    );
    
    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    
    const drawdownData = tradeSequence.map(trade => {
      const equity = parseFloat(trade.cumulative_pnl);
      
      if (equity > peak) {
        peak = equity;
        currentDrawdown = 0;
      } else {
        currentDrawdown = ((peak - equity) / peak * 100);
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
      }
      
      return {
        date: trade.exit_time,
        equity: equity,
        drawdown_percent: currentDrawdown.toFixed(2),
        peak: peak
      };
    });
    
    res.json({
      success: true,
      data: {
        max_drawdown: maxDrawdown.toFixed(2),
        drawdown_series: drawdownData
      }
    });
    
  } catch (error) {
    console.error('Get drawdown analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drawdown analytics'
    });
  }
});

// Get risk metrics
router.get('/risk', auth, async (req, res) => {
  try {
    const [riskData] = await pool.execute(
      `SELECT 
        COUNT(t.id) as total_trades,
        SUM(t.pnl) as total_pnl,
        AVG(t.pnl) as avg_return,
        STDDEV(t.pnl) as return_std,
        MAX(t.pnl) as max_gain,
        MIN(t.pnl) as max_loss,
        AVG(t.lot_size) as avg_position_size
       FROM trades t
       WHERE t.user_id = ? AND t.trade_status = 'Closed' AND t.pnl IS NOT NULL`,
      [req.user.userId]
    );
    
    const metrics = riskData[0];
    
    // Calculate risk metrics
    const sharpeRatio = metrics.return_std > 0 ? (metrics.avg_return / metrics.return_std).toFixed(4) : 0;
    const calmarRatio = 0; // Would need more complex calculation with drawdown
    
    res.json({
      success: true,
      data: {
        ...metrics,
        sharpe_ratio: sharpeRatio,
        calmar_ratio: calmarRatio,
        volatility: metrics.return_std ? metrics.return_std.toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error('Get risk analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk analytics'
    });
  }
});

module.exports = router;