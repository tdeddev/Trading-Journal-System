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
const tradesRouter = require('../routes/trades');
app.use('/api/trades', mockAuth, tradesRouter);

describe('Trades API', () => {
  let testUser;
  let testTrade;

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser();
  });

  afterAll(async () => {
    // Clean up
    if (testTrade) {
      await executeQuery('DELETE FROM trades WHERE id = ?', [testTrade.id]);
    }
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  describe('POST /api/trades', () => {
    it('should create a new trade', async () => {
      const tradeData = {
        symbol: 'XAUUSD',
        trade_type: 'Long',
        entry_price: 1950.50,
        stop_loss: 1940.00,
        take_profit: 1970.00,
        lot_size: 0.10,
        entry_time: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/trades')
        .send(tradeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.symbol).toBe(tradeData.symbol);
      expect(response.body.data.trade_type).toBe(tradeData.trade_type);
      expect(parseFloat(response.body.data.entry_price)).toBe(tradeData.entry_price);

      testTrade = response.body.data;
    });

    it('should validate required fields', async () => {
      const invalidTradeData = {
        symbol: 'XAUUSD'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/trades')
        .send(invalidTradeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate trade type', async () => {
      const invalidTradeData = {
        symbol: 'XAUUSD',
        trade_type: 'Invalid',
        entry_price: 1950.50,
        lot_size: 0.10,
        entry_time: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/trades')
        .send(invalidTradeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/trades', () => {
    beforeEach(async () => {
      // Ensure we have a test trade
      if (!testTrade) {
        const tradeData = {
          symbol: 'GBPUSD',
          trade_type: 'Short',
          entry_price: 1.2500,
          lot_size: 0.05,
          entry_time: new Date().toISOString()
        };

        const response = await request(app)
          .post('/api/trades')
          .send(tradeData);
        
        testTrade = response.body.data;
      }
    });

    it('should get all trades for user', async () => {
      const response = await request(app)
        .get('/api/trades')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('trades');
      expect(Array.isArray(response.body.data.trades)).toBe(true);
      expect(response.body.data.trades.length).toBeGreaterThan(0);
    });

    it('should filter trades by symbol', async () => {
      const response = await request(app)
        .get('/api/trades')
        .query({ symbol: testTrade.symbol })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trades.every(trade => trade.symbol === testTrade.symbol)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/trades')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trades.length).toBeLessThanOrEqual(5);
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/trades/:id', () => {
    it('should get a specific trade', async () => {
      const response = await request(app)
        .get(`/api/trades/${testTrade.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTrade.id);
      expect(response.body.data.symbol).toBe(testTrade.symbol);
    });

    it('should return 404 for non-existent trade', async () => {
      const response = await request(app)
        .get('/api/trades/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/trades/:id/close', () => {
    let openTrade;

    beforeEach(async () => {
      // Create a new open trade for closing
      const tradeData = {
        symbol: 'EURUSD',
        trade_type: 'Long',
        entry_price: 1.0850,
        lot_size: 0.10,
        entry_time: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/trades')
        .send(tradeData);
      
      openTrade = response.body.data;
    });

    afterEach(async () => {
      if (openTrade) {
        await executeQuery('DELETE FROM trades WHERE id = ?', [openTrade.id]);
        openTrade = null;
      }
    });

    it('should close a trade successfully', async () => {
      const closeData = {
        exit_price: 1.0900,
        exit_time: new Date().toISOString(),
        trade_quality: 'Good'
      };

      const response = await request(app)
        .put(`/api/trades/${openTrade.id}/close`)
        .send(closeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trade_status).toBe('Closed');
      expect(parseFloat(response.body.data.exit_price)).toBe(closeData.exit_price);
      expect(response.body.data.pnl).toBeGreaterThan(0); // Should be profitable
    });

    it('should calculate P&L correctly for losing trade', async () => {
      const closeData = {
        exit_price: 1.0800, // Lower than entry price for a long trade
        exit_time: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/trades/${openTrade.id}/close`)
        .send(closeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pnl).toBeLessThan(0); // Should be a loss
    });

    it('should validate required fields for closing', async () => {
      const response = await request(app)
        .put(`/api/trades/${openTrade.id}/close`)
        .send({}) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PUT /api/trades/:id', () => {
    it('should update trade notes and tags', async () => {
      const updateData = {
        notes: 'Updated trade notes for testing',
        tags: 'test, updated, jest',
        emotion: 'Confident',
        trade_quality: 'Excellent'
      };

      const response = await request(app)
        .put(`/api/trades/${testTrade.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(response.body.data.tags).toBe(updateData.tags);
      expect(response.body.data.emotion).toBe(updateData.emotion);
    });
  });

  describe('DELETE /api/trades/:id', () => {
    let tradeToDelete;

    beforeEach(async () => {
      // Create a trade specifically for deletion
      const tradeData = {
        symbol: 'USDJPY',
        trade_type: 'Short',
        entry_price: 145.50,
        lot_size: 0.01,
        entry_time: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/trades')
        .send(tradeData);
      
      tradeToDelete = response.body.data;
    });

    it('should delete a trade', async () => {
      const response = await request(app)
        .delete(`/api/trades/${tradeToDelete.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify trade is deleted
      const getResponse = await request(app)
        .get(`/api/trades/${tradeToDelete.id}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
      tradeToDelete = null; // Mark as deleted
    });

    it('should return 404 when deleting non-existent trade', async () => {
      const response = await request(app)
        .delete('/api/trades/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});