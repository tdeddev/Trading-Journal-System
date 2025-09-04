const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Advanced risk metrics
router.get('/advanced-metrics', auth, async (req, res) => {
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

    // Get detailed trade data for calculations
    const [trades] = await pool.execute(
      `SELECT t.pnl, t.duration_minutes, t.entry_time, t.exit_time,
              t.lot_size, t.symbol, t.trade_type, t.emotion,
              @running_total := @running_total + t.pnl AS cumulative_pnl
       FROM trades t
       CROSS JOIN (SELECT @running_total := 0) r
       WHERE t.user_id = ? AND t.trade_status = 'Closed' ${dateFilter}
       ORDER BY t.exit_time ASC`,
      [req.user.userId]
    );

    if (trades.length === 0) {
      return res.json({
        success: true,
        data: {
          total_trades: 0,
          sharpe_ratio: 0,
          sortino_ratio: 0,
          max_drawdown: 0,
          max_drawdown_duration: 0,
          calmar_ratio: 0,
          profit_factor: 0,
          expectancy: 0,
          recovery_factor: 0,
          payoff_ratio: 0,
          consecutive_wins: 0,
          consecutive_losses: 0,
          largest_win_streak: 0,
          largest_loss_streak: 0,
          avg_trade_duration: 0,
          risk_reward_ratio: 0,
          kelly_criterion: 0,
          var_95: 0,
          cvar_95: 0
        }
      });
    }

    // Calculate returns (P&L as percentage of account balance - simplified)
    const returns = trades.map(trade => parseFloat(trade.pnl) || 0);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // Standard deviation of returns
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Downside deviation (for Sortino ratio)
    const downsideReturns = returns.filter(ret => ret < 0);
    const downsideVariance = downsideReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / returns.length;
    const downsideStdDev = Math.sqrt(downsideVariance);
    
    // Sharpe Ratio (assuming 0% risk-free rate)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) : 0;
    
    // Sortino Ratio
    const sortinoRatio = downsideStdDev > 0 ? (avgReturn / downsideStdDev) : 0;
    
    // Drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownDuration = 0;
    let currentDrawdownStart = null;
    let longestDrawdownDuration = 0;
    
    trades.forEach((trade, index) => {
      const equity = parseFloat(trade.cumulative_pnl);
      
      if (equity > peak) {
        peak = equity;
        if (currentDrawdownStart !== null) {
          const duration = index - currentDrawdownStart;
          longestDrawdownDuration = Math.max(longestDrawdownDuration, duration);
          currentDrawdownStart = null;
        }
      } else {
        if (currentDrawdownStart === null) {
          currentDrawdownStart = index;
        }
        
        const drawdown = peak - equity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    });
    
    // If still in drawdown at end
    if (currentDrawdownStart !== null) {
      const duration = trades.length - 1 - currentDrawdownStart;
      longestDrawdownDuration = Math.max(longestDrawdownDuration, duration);
    }
    
    // Calmar Ratio (annualized return / max drawdown)
    const totalReturn = trades[trades.length - 1]?.cumulative_pnl || 0;
    const calmarRatio = maxDrawdown > 0 ? (totalReturn / maxDrawdown) : 0;
    
    // Profit Factor
    const winningTrades = trades.filter(t => parseFloat(t.pnl) > 0);
    const losingTrades = trades.filter(t => parseFloat(t.pnl) < 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : 0;
    
    // Expectancy
    const winRate = winningTrades.length / trades.length;
    const lossRate = losingTrades.length / trades.length;
    const avgWin = winningTrades.length > 0 ? (grossProfit / winningTrades.length) : 0;
    const avgLoss = losingTrades.length > 0 ? (grossLoss / losingTrades.length) : 0;
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
    
    // Recovery Factor
    const recoveryFactor = maxDrawdown > 0 ? (totalReturn / maxDrawdown) : 0;
    
    // Payoff Ratio
    const payoffRatio = avgLoss > 0 ? (avgWin / avgLoss) : 0;
    
    // Consecutive wins/losses calculation
    let currentStreak = 0;
    let currentStreakType = null;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    
    trades.forEach(trade => {
      const pnl = parseFloat(trade.pnl);
      const isWin = pnl > 0;
      
      if (isWin) {
        if (currentStreakType === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'win';
        }
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else if (pnl < 0) {
        if (currentStreakType === 'loss') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'loss';
        }
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      } else {
        currentStreak = 0;
        currentStreakType = null;
      }
    });
    
    // Average trade duration
    const avgTradeDuration = trades.reduce((sum, t) => sum + (parseInt(t.duration_minutes) || 0), 0) / trades.length;
    
    // Kelly Criterion (simplified)
    const kellyPercent = winRate > 0 && avgLoss > 0 ? (winRate - (lossRate / (avgWin / avgLoss))) * 100 : 0;
    
    // Value at Risk (95% confidence) - simplified
    returns.sort((a, b) => a - b);
    const var95Index = Math.floor(returns.length * 0.05);
    const var95 = returns[var95Index] || 0;
    
    // Conditional Value at Risk (Expected Shortfall)
    const tailReturns = returns.slice(0, var95Index + 1);
    const cvar95 = tailReturns.length > 0 ? (tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length) : 0;

    res.json({
      success: true,
      data: {
        total_trades: trades.length,
        sharpe_ratio: parseFloat(sharpeRatio.toFixed(4)),
        sortino_ratio: parseFloat(sortinoRatio.toFixed(4)),
        max_drawdown: parseFloat(maxDrawdown.toFixed(2)),
        max_drawdown_duration: longestDrawdownDuration,
        calmar_ratio: parseFloat(calmarRatio.toFixed(4)),
        profit_factor: parseFloat(profitFactor.toFixed(4)),
        expectancy: parseFloat(expectancy.toFixed(2)),
        recovery_factor: parseFloat(recoveryFactor.toFixed(4)),
        payoff_ratio: parseFloat(payoffRatio.toFixed(2)),
        consecutive_wins: maxWinStreak,
        consecutive_losses: maxLossStreak,
        largest_win_streak: maxWinStreak,
        largest_loss_streak: maxLossStreak,
        avg_trade_duration: parseFloat(avgTradeDuration.toFixed(1)),
        risk_reward_ratio: parseFloat(payoffRatio.toFixed(2)),
        kelly_criterion: parseFloat(kellyPercent.toFixed(2)),
        var_95: parseFloat(var95.toFixed(2)),
        cvar_95: parseFloat(cvar95.toFixed(2)),
        volatility: parseFloat(stdDev.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Advanced metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate advanced risk metrics'
    });
  }
});

// Trading psychology analysis
router.get('/psychology-analysis', auth, async (req, res) => {
  try {
    const [emotionData] = await pool.execute(
      `SELECT 
        emotion,
        COUNT(*) as trade_count,
        AVG(pnl) as avg_pnl,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
        MAX(pnl) as best_trade,
        MIN(pnl) as worst_trade,
        AVG(duration_minutes) as avg_duration
       FROM trades 
       WHERE user_id = ? AND trade_status = 'Closed' AND emotion IS NOT NULL
       GROUP BY emotion
       ORDER BY trade_count DESC`,
      [req.user.userId]
    );

    // Calculate emotion impact scores
    const emotionAnalysis = emotionData.map(emotion => {
      const winRate = emotion.trade_count > 0 ? (emotion.wins / emotion.trade_count * 100) : 0;
      const impactScore = parseFloat(emotion.avg_pnl) * (emotion.trade_count / 100); // Weight by frequency
      
      return {
        ...emotion,
        win_rate: parseFloat(winRate.toFixed(2)),
        impact_score: parseFloat(impactScore.toFixed(2)),
        avg_pnl: parseFloat(emotion.avg_pnl.toFixed(2)),
        avg_duration: parseFloat(emotion.avg_duration.toFixed(1))
      };
    });

    // Time-based performance analysis
    const [timeData] = await pool.execute(
      `SELECT 
        HOUR(entry_time) as hour_of_day,
        DAYOFWEEK(entry_time) as day_of_week,
        COUNT(*) as trade_count,
        AVG(pnl) as avg_pnl,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins
       FROM trades 
       WHERE user_id = ? AND trade_status = 'Closed'
       GROUP BY HOUR(entry_time), DAYOFWEEK(entry_time)
       ORDER BY trade_count DESC`,
      [req.user.userId]
    );

    const timeAnalysis = timeData.map(time => ({
      ...time,
      win_rate: time.trade_count > 0 ? ((time.wins / time.trade_count) * 100).toFixed(2) : 0,
      avg_pnl: parseFloat(time.avg_pnl.toFixed(2)),
      day_name: ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][time.day_of_week]
    }));

    res.json({
      success: true,
      data: {
        emotion_analysis: emotionAnalysis,
        time_analysis: timeAnalysis,
        recommendations: generatePsychologyRecommendations(emotionAnalysis, timeAnalysis)
      }
    });

  } catch (error) {
    console.error('Psychology analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform psychology analysis'
    });
  }
});

// Monte Carlo simulation for risk assessment
router.get('/monte-carlo', auth, async (req, res) => {
  try {
    const { simulations = 1000, periods = 252 } = req.query; // Default 1000 sims, 252 trading days
    
    // Get historical returns
    const [trades] = await pool.execute(
      `SELECT pnl FROM trades 
       WHERE user_id = ? AND trade_status = 'Closed' AND pnl IS NOT NULL
       ORDER BY exit_time DESC
       LIMIT 500`, // Use last 500 trades for simulation
      [req.user.userId]
    );

    if (trades.length < 10) {
      return res.json({
        success: false,
        message: 'Insufficient trade data for Monte Carlo simulation (minimum 10 trades required)'
      });
    }

    const returns = trades.map(t => parseFloat(t.pnl));
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length);

    // Run Monte Carlo simulations
    const simResults = [];
    for (let sim = 0; sim < parseInt(simulations); sim++) {
      let portfolioValue = 10000; // Starting portfolio value
      const simulation = [];
      
      for (let period = 0; period < parseInt(periods); period++) {
        // Generate random return based on historical distribution
        const randomReturn = gaussianRandom(avgReturn, stdDev);
        portfolioValue += randomReturn;
        simulation.push(portfolioValue);
      }
      
      simResults.push({
        simulation_id: sim,
        final_value: portfolioValue,
        total_return: portfolioValue - 10000,
        return_pct: ((portfolioValue - 10000) / 10000) * 100,
        path: simulation
      });
    }

    // Calculate statistics
    simResults.sort((a, b) => a.final_value - b.final_value);
    
    const var95 = simResults[Math.floor(simResults.length * 0.05)];
    const var99 = simResults[Math.floor(simResults.length * 0.01)];
    const median = simResults[Math.floor(simResults.length * 0.5)];
    const percentile75 = simResults[Math.floor(simResults.length * 0.75)];
    const percentile25 = simResults[Math.floor(simResults.length * 0.25)];

    res.json({
      success: true,
      data: {
        simulation_count: parseInt(simulations),
        periods: parseInt(periods),
        starting_value: 10000,
        statistics: {
          var_95: var95.final_value.toFixed(2),
          var_99: var99.final_value.toFixed(2),
          median: median.final_value.toFixed(2),
          percentile_75: percentile75.final_value.toFixed(2),
          percentile_25: percentile25.final_value.toFixed(2),
          best_case: simResults[simResults.length - 1].final_value.toFixed(2),
          worst_case: simResults[0].final_value.toFixed(2),
          avg_final_value: (simResults.reduce((sum, sim) => sum + sim.final_value, 0) / simResults.length).toFixed(2)
        },
        probability_of_loss: (simResults.filter(sim => sim.final_value < 10000).length / simResults.length * 100).toFixed(2),
        sample_paths: simResults.slice(0, 10).map(sim => sim.path) // Return 10 sample paths for visualization
      }
    });

  } catch (error) {
    console.error('Monte Carlo simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run Monte Carlo simulation'
    });
  }
});

// Helper function to generate psychology recommendations
function generatePsychologyRecommendations(emotionAnalysis, timeAnalysis) {
  const recommendations = [];
  
  // Emotion-based recommendations
  const bestEmotion = emotionAnalysis.reduce((best, current) => 
    current.avg_pnl > best.avg_pnl ? current : best, emotionAnalysis[0] || {});
  
  const worstEmotion = emotionAnalysis.reduce((worst, current) => 
    current.avg_pnl < worst.avg_pnl ? current : worst, emotionAnalysis[0] || {});

  if (bestEmotion && worstEmotion) {
    recommendations.push(`Your best performance occurs when feeling ${bestEmotion.emotion} (Avg: $${bestEmotion.avg_pnl})`);
    recommendations.push(`Avoid trading when feeling ${worstEmotion.emotion} (Avg: $${worstEmotion.avg_pnl})`);
  }

  // Time-based recommendations
  const bestHour = timeAnalysis.reduce((best, current) => 
    parseFloat(current.avg_pnl) > parseFloat(best.avg_pnl) ? current : best, timeAnalysis[0] || {});

  if (bestHour) {
    recommendations.push(`Consider focusing on ${bestHour.hour_of_day}:00 hour trading (Best avg: $${bestHour.avg_pnl})`);
  }

  return recommendations;
}

// Helper function for Gaussian random number generation
function gaussianRandom(mean, standardDeviation) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * standardDeviation + mean;
}

module.exports = router;