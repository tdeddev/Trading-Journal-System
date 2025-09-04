const request = require('supertest');
const express = require('express');
const { executeQuery } = require('../config/database');

// Create test app
const app = express();
app.use(express.json());

// Mock auth middleware for testing
const mockAuth = (req, res, next) => {
  req.user = { userId: 1, id: 1 };
  next();
};

// Import routes with mocked auth
const analyticsRouter = require('../routes/analytics');
app.use('/api/analytics', mockAuth, analyticsRouter);

describe('Analytics API', () => {
  let testUser;
  let testTrades = [];

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser();

    // Create some test trades with different outcomes for analytics
    const trades = [
      {
        symbol: 'XAUUSD',
        trade_type: 'Long',
        entry_price: 1950.00,
        exit_price: 1970.00,
        lot_size: 0.10,
        pnl: 200.00,
        trade_status: 'Closed',
        entry_time: new Date('2024-01-01T10:00:00Z'),
        exit_time: new Date('2024-01-01T12:00:00Z')
      },
      {
        symbol: 'GBPUSD',
        trade_type: 'Short',
        entry_price: 1.2500,
        exit_price: 1.2450,
        lot_size: 0.05,
        pnl: 250.00,
        trade_status: 'Closed',
        entry_time: new Date('2024-01-02T10:00:00Z'),
        exit_time: new Date('2024-01-02T14:00:00Z')
      },
      {
        symbol: 'EURUSD',
        trade_type: 'Long',
        entry_price: 1.0850,
        exit_price: 1.0820,
        lot_size: 0.10,
        pnl: -300.00,
        trade_status: 'Closed',
        entry_time: new Date('2024-01-03T10:00:00Z'),
        exit_time: new Date('2024-01-03T11:00:00Z')
      }
    ];

    for (const trade of trades) {
      const result = await executeQuery(
        `INSERT INTO trades (
          user_id, symbol, trade_type, entry_price, exit_price, lot_size, 
          pnl, trade_status, entry_time, exit_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testUser.id, trade.symbol, trade.trade_type, trade.entry_price,
          trade.exit_price, trade.lot_size, trade.pnl, trade.trade_status,
          trade.entry_time, trade.exit_time
        ]
      );
      testTrades.push({ id: result.insertId, ...trade });
    }
  });

  afterAll(async () => {
    // Clean up test trades
    for (const trade of testTrades) {
      await executeQuery('DELETE FROM trades WHERE id = ?', [trade.id]);
    }
    
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  describe('GET /api/analytics/overview', () => {
    it('should return trading overview statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTrades');
      expect(response.body.data).toHaveProperty('winningTrades');
      expect(response.body.data).toHaveProperty('losingTrades');
      expect(response.body.data).toHaveProperty('winRate');
      expect(response.body.data).toHaveProperty('totalPnL');
      expect(response.body.data).toHaveProperty('avgWin');
      expect(response.body.data).toHaveProperty('avgLoss');

      // Verify calculations
      expect(response.body.data.totalTrades).toBe(3);
      expect(response.body.data.winningTrades).toBe(2);
      expect(response.body.data.losingTrades).toBe(1);
      expect(response.body.data.winRate).toBe(66.67);
      expect(response.body.data.totalPnL).toBe(150.00);
    });

    it('should filter overview by date range', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-02'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTrades).toBe(2); // Only first 2 trades
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should return monthly performance data', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .query({ period: 'monthly' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const monthlyData = response.body.data[0];
      expect(monthlyData).toHaveProperty('period');
      expect(monthlyData).toHaveProperty('trades');
      expect(monthlyData).toHaveProperty('pnl');
      expect(monthlyData).toHaveProperty('winRate');
    });

    it('should return daily performance data', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .query({ period: 'daily' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3); // 3 different days
    });
  });

  describe('GET /api/analytics/symbols', () => {
    it('should return symbol-wise performance', async () => {
      const response = await request(app)
        .get('/api/analytics/symbols')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3); // 3 different symbols

      const xauusdData = response.body.data.find(item => item.symbol === 'XAUUSD');
      expect(xauusdData).toBeTruthy();
      expect(xauusdData.totalTrades).toBe(1);
      expect(xauusdData.totalPnL).toBe(200.00);
      expect(xauusdData.winRate).toBe(100);
    });

    it('should sort symbols by total P&L', async () => {
      const response = await request(app)
        .get('/api/analytics/symbols')
        .query({ sortBy: 'pnl' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].totalPnL).toBeGreaterThanOrEqual(response.body.data[1].totalPnL);
    });
  });

  describe('GET /api/analytics/drawdown', () => {
    it('should return drawdown analysis', async () => {
      const response = await request(app)
        .get('/api/analytics/drawdown')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('maxDrawdown');
      expect(response.body.data).toHaveProperty('currentDrawdown');
      expect(response.body.data).toHaveProperty('drawdownPeriods');
      expect(response.body.data).toHaveProperty('equityCurve');

      expect(Array.isArray(response.body.data.drawdownPeriods)).toBe(true);
      expect(Array.isArray(response.body.data.equityCurve)).toBe(true);
    });
  });

  describe('GET /api/analytics/streaks', () => {
    it('should return win/loss streak analysis', async () => {
      const response = await request(app)
        .get('/api/analytics/streaks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentStreak');
      expect(response.body.data).toHaveProperty('longestWinStreak');
      expect(response.body.data).toHaveProperty('longestLossStreak');
      expect(response.body.data).toHaveProperty('streakHistory');

      expect(Array.isArray(response.body.data.streakHistory)).toBe(true);
    });
  });

  describe('GET /api/analytics/time-analysis', () => {
    it('should return time-based trading analysis', async () => {
      const response = await request(app)
        .get('/api/analytics/time-analysis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hourlyPerformance');
      expect(response.body.data).toHaveProperty('dailyPerformance');
      expect(response.body.data).toHaveProperty('sessionPerformance');

      expect(Array.isArray(response.body.data.hourlyPerformance)).toBe(true);
      expect(Array.isArray(response.body.data.dailyPerformance)).toBe(true);
      expect(Array.isArray(response.body.data.sessionPerformance)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-01'
        });

      // Should either return 400 or handle gracefully with default behavior
      expect([200, 400]).toContain(response.status);
    });

    it('should handle empty result sets gracefully', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-02'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTrades).toBe(0);
    });
  });
});