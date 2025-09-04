require('dotenv').config({ path: '.env.test' });

const { executeQuery } = require('../config/database');

// Global test setup
beforeAll(async () => {
  // Create test database tables if they don't exist
  try {
    // You can add any global setup here
    console.log('Test setup complete');
  } catch (error) {
    console.error('Test setup error:', error);
  }
});

// Clean up after all tests
afterAll(async () => {
  // Clean up test data
  try {
    // You can add cleanup logic here if needed
    console.log('Test cleanup complete');
  } catch (error) {
    console.error('Test cleanup error:', error);
  }
});

// Helper function to create test user
global.createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password_hash: '$2b$12$test.hash.for.testing',
    first_name: 'Test',
    last_name: 'User',
    ...userData
  };
  
  const result = await executeQuery(
    'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
    [defaultUser.username, defaultUser.email, defaultUser.password_hash, defaultUser.first_name, defaultUser.last_name]
  );
  
  return { id: result.insertId, ...defaultUser };
};

// Helper function to clean up test user
global.cleanupTestUser = async (userId) => {
  await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
};