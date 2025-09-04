const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const csv = require('fast-csv');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Helper function to get export data
async function getExportData(userId, type, filters = {}) {
  let query = '';
  let params = [userId];
  
  switch (type) {
    case 'trades':
      query = `
        SELECT 
          t.id,
          t.symbol,
          t.trade_type,
          t.entry_price,
          t.exit_price,
          t.lot_size,
          t.entry_time,
          t.exit_time,
          t.pnl,
          t.pnl_pips,
          t.commission,
          t.swap,
          t.stop_loss,
          t.take_profit,
          t.duration_minutes,
          t.emotion,
          t.trade_quality,
          t.trade_status,
          t.notes,
          t.tags,
          ts.strategy_name,
          s.session_name,
          DATE(t.entry_time) as trade_date,
          CASE 
            WHEN t.pnl > 0 THEN 'Win'
            WHEN t.pnl < 0 THEN 'Loss'
            ELSE 'Neutral'
          END as outcome
        FROM trades t
        LEFT JOIN trading_strategies ts ON t.strategy_id = ts.id
        LEFT JOIN trading_sessions s ON t.session_id = s.id
        WHERE t.user_id = ?
      `;
      
      // Add filters
      if (filters.symbol) {
        query += ' AND t.symbol = ?';
        params.push(filters.symbol);
      }
      if (filters.strategy_id) {
        query += ' AND t.strategy_id = ?';
        params.push(filters.strategy_id);
      }
      if (filters.session_id) {
        query += ' AND t.session_id = ?';
        params.push(filters.session_id);
      }
      if (filters.trade_status && filters.trade_status !== 'all') {
        query += ' AND t.trade_status = ?';
        params.push(filters.trade_status);
      }
      if (filters.date_from) {
        query += ' AND t.entry_time >= ?';
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        query += ' AND t.entry_time <= ?';
        params.push(filters.date_to);
      }
      
      query += ' ORDER BY t.entry_time DESC';
      break;
      
    case 'sessions':
      query = `
        SELECT 
          s.id,
          s.session_name,
          s.session_date,
          s.start_time,
          s.end_time,
          s.market_conditions,
          s.emotional_state,
          s.total_trades,
          s.winning_trades,
          s.losing_trades,
          s.actual_pnl,
          s.notes,
          CASE 
            WHEN s.total_trades > 0 THEN ROUND((s.winning_trades / s.total_trades) * 100, 2)
            ELSE 0 
          END as win_rate_percent
        FROM trading_sessions s
        WHERE s.user_id = ?
        ORDER BY s.session_date DESC, s.start_time DESC
      `;
      break;
      
    case 'strategies':
      query = `
        SELECT 
          s.id,
          s.strategy_name,
          s.strategy_type,
          s.description,
          s.is_active,
          s.created_at,
          COUNT(t.id) as total_trades,
          SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
          SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
          COALESCE(SUM(t.pnl), 0) as total_pnl,
          COALESCE(AVG(t.pnl), 0) as avg_pnl,
          COALESCE(MAX(t.pnl), 0) as best_trade,
          COALESCE(MIN(t.pnl), 0) as worst_trade,
          CASE 
            WHEN COUNT(t.id) > 0 THEN ROUND((SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) / COUNT(t.id)) * 100, 2)
            ELSE 0 
          END as win_rate_percent
        FROM trading_strategies s
        LEFT JOIN trades t ON s.id = t.strategy_id AND t.trade_status = 'Closed'
        WHERE s.user_id = ?
        GROUP BY s.id, s.strategy_name, s.strategy_type, s.description, s.is_active, s.created_at
        ORDER BY total_pnl DESC
      `;
      break;
      
    default:
      throw new Error('Invalid export type');
  }
  
  const [results] = await pool.execute(query, params);
  return results;
}

// Export trades as CSV
router.get('/trades/csv', auth, async (req, res) => {
  try {
    const filters = {
      symbol: req.query.symbol,
      strategy_id: req.query.strategy_id,
      session_id: req.query.session_id,
      trade_status: req.query.trade_status,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    
    const data = await getExportData(req.user.userId, 'trades', filters);
    
    // Set response headers
    const filename = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Create CSV stream
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    
    // Write data
    data.forEach(row => {
      csvStream.write({
        'Trade ID': row.id,
        'Symbol': row.symbol,
        'Type': row.trade_type,
        'Entry Price': row.entry_price,
        'Exit Price': row.exit_price || 'N/A',
        'Lot Size': row.lot_size,
        'Entry Time': row.entry_time,
        'Exit Time': row.exit_time || 'N/A',
        'P&L': row.pnl || 'N/A',
        'P&L Pips': row.pnl_pips || 'N/A',
        'Commission': row.commission || 0,
        'Swap': row.swap || 0,
        'Stop Loss': row.stop_loss || 'N/A',
        'Take Profit': row.take_profit || 'N/A',
        'Duration (Minutes)': row.duration_minutes || 'N/A',
        'Status': row.trade_status,
        'Outcome': row.outcome,
        'Strategy': row.strategy_name || 'N/A',
        'Session': row.session_name || 'N/A',
        'Emotion': row.emotion || 'N/A',
        'Quality': row.trade_quality || 'N/A',
        'Notes': row.notes || '',
        'Tags': row.tags || ''
      });
    });
    
    csvStream.end();
    
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV'
    });
  }
});

// Export trades as Excel
router.get('/trades/excel', auth, async (req, res) => {
  try {
    const filters = {
      symbol: req.query.symbol,
      strategy_id: req.query.strategy_id,
      session_id: req.query.session_id,
      trade_status: req.query.trade_status,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    
    const data = await getExportData(req.user.userId, 'trades', filters);
    
    // Transform data for Excel
    const excelData = data.map(row => ({
      'Trade ID': row.id,
      'Symbol': row.symbol,
      'Type': row.trade_type,
      'Entry Price': row.entry_price,
      'Exit Price': row.exit_price || 'N/A',
      'Lot Size': row.lot_size,
      'Entry Time': row.entry_time,
      'Exit Time': row.exit_time || 'N/A',
      'P&L': row.pnl || 'N/A',
      'P&L Pips': row.pnl_pips || 'N/A',
      'Commission': row.commission || 0,
      'Swap': row.swap || 0,
      'Stop Loss': row.stop_loss || 'N/A',
      'Take Profit': row.take_profit || 'N/A',
      'Duration (Minutes)': row.duration_minutes || 'N/A',
      'Status': row.trade_status,
      'Outcome': row.outcome,
      'Strategy': row.strategy_name || 'N/A',
      'Session': row.session_name || 'N/A',
      'Emotion': row.emotion || 'N/A',
      'Quality': row.trade_quality || 'N/A',
      'Notes': row.notes || '',
      'Tags': row.tags || ''
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const colWidths = [];
    Object.keys(excelData[0] || {}).forEach((key, index) => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      colWidths[index] = { width: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set response headers
    const filename = `trades_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
    
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export Excel'
    });
  }
});

// Export sessions as CSV
router.get('/sessions/csv', auth, async (req, res) => {
  try {
    const data = await getExportData(req.user.userId, 'sessions');
    
    const filename = `sessions_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    
    data.forEach(row => {
      csvStream.write({
        'Session ID': row.id,
        'Session Name': row.session_name,
        'Date': row.session_date,
        'Start Time': row.start_time,
        'End Time': row.end_time || 'N/A',
        'Market Conditions': row.market_conditions || 'N/A',
        'Emotional State': row.emotional_state || 'N/A',
        'Total Trades': row.total_trades || 0,
        'Winning Trades': row.winning_trades || 0,
        'Losing Trades': row.losing_trades || 0,
        'Win Rate %': row.win_rate_percent,
        'Actual P&L': row.actual_pnl || 0,
        'Notes': row.notes || ''
      });
    });
    
    csvStream.end();
    
  } catch (error) {
    console.error('Sessions CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sessions CSV'
    });
  }
});

// Export strategies as CSV
router.get('/strategies/csv', auth, async (req, res) => {
  try {
    const data = await getExportData(req.user.userId, 'strategies');
    
    const filename = `strategies_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    
    data.forEach(row => {
      csvStream.write({
        'Strategy ID': row.id,
        'Strategy Name': row.strategy_name,
        'Type': row.strategy_type,
        'Description': row.description || '',
        'Active': row.is_active ? 'Yes' : 'No',
        'Created': row.created_at,
        'Total Trades': row.total_trades,
        'Winning Trades': row.winning_trades,
        'Losing Trades': row.losing_trades,
        'Win Rate %': row.win_rate_percent,
        'Total P&L': row.total_pnl,
        'Average P&L': parseFloat(row.avg_pnl).toFixed(2),
        'Best Trade': parseFloat(row.best_trade).toFixed(2),
        'Worst Trade': parseFloat(row.worst_trade).toFixed(2)
      });
    });
    
    csvStream.end();
    
  } catch (error) {
    console.error('Strategies CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export strategies CSV'
    });
  }
});

// Complete analytics export (All data in Excel workbook)
router.get('/complete/excel', auth, async (req, res) => {
  try {
    // Get all data
    const [trades, sessions, strategies] = await Promise.all([
      getExportData(req.user.userId, 'trades'),
      getExportData(req.user.userId, 'sessions'),
      getExportData(req.user.userId, 'strategies')
    ]);
    
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Trades sheet
    if (trades.length > 0) {
      const tradesData = trades.map(row => ({
        'Trade ID': row.id,
        'Symbol': row.symbol,
        'Type': row.trade_type,
        'Entry Price': row.entry_price,
        'Exit Price': row.exit_price || 'N/A',
        'Lot Size': row.lot_size,
        'Entry Time': row.entry_time,
        'Exit Time': row.exit_time || 'N/A',
        'P&L': row.pnl || 'N/A',
        'Status': row.trade_status,
        'Strategy': row.strategy_name || 'N/A',
        'Session': row.session_name || 'N/A'
      }));
      
      const wsTrading = XLSX.utils.json_to_sheet(tradesData);
      XLSX.utils.book_append_sheet(wb, wsTrading, 'Trades');
    }
    
    // Sessions sheet
    if (sessions.length > 0) {
      const sessionsData = sessions.map(row => ({
        'Session ID': row.id,
        'Session Name': row.session_name,
        'Date': row.session_date,
        'Total Trades': row.total_trades || 0,
        'Win Rate %': row.win_rate_percent,
        'P&L': row.actual_pnl || 0
      }));
      
      const wsSessions = XLSX.utils.json_to_sheet(sessionsData);
      XLSX.utils.book_append_sheet(wb, wsSessions, 'Sessions');
    }
    
    // Strategies sheet
    if (strategies.length > 0) {
      const strategiesData = strategies.map(row => ({
        'Strategy Name': row.strategy_name,
        'Type': row.strategy_type,
        'Active': row.is_active ? 'Yes' : 'No',
        'Total Trades': row.total_trades,
        'Win Rate %': row.win_rate_percent,
        'Total P&L': row.total_pnl
      }));
      
      const wsStrategies = XLSX.utils.json_to_sheet(strategiesData);
      XLSX.utils.book_append_sheet(wb, wsStrategies, 'Strategies');
    }
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const filename = `trading_journal_complete_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
    
  } catch (error) {
    console.error('Complete Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export complete data'
    });
  }
});

module.exports = router;