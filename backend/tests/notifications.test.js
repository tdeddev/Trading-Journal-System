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
const { router: notificationsRouter, createNotification } = require('../routes/notifications');
app.use('/api/notifications', mockAuth, notificationsRouter);

describe('Notifications API', () => {
  let testUser;
  let testNotifications = [];

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser();

    // Create some test notifications
    const notifications = [
      {
        notification_type: 'info',
        title: 'Test Info Notification',
        message: 'This is a test info notification',
        is_read: false
      },
      {
        notification_type: 'success',
        title: 'Test Success Notification',
        message: 'This is a test success notification',
        is_read: true
      },
      {
        notification_type: 'warning',
        title: 'Test Warning Notification', 
        message: 'This is a test warning notification',
        is_read: false
      }
    ];

    for (const notification of notifications) {
      const result = await executeQuery(
        'INSERT INTO notifications (user_id, notification_type, title, message, is_read) VALUES (?, ?, ?, ?, ?)',
        [testUser.id, notification.notification_type, notification.title, notification.message, notification.is_read]
      );
      testNotifications.push({ id: result.insertId, ...notification });
    }
  });

  afterAll(async () => {
    // Clean up test notifications
    for (const notification of testNotifications) {
      await executeQuery('DELETE FROM notifications WHERE id = ?', [notification.id]);
    }
    
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  describe('GET /api/notifications', () => {
    it('should get all notifications for user', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);

      // Verify notification structure
      const notification = response.body.data[0];
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('notification_type');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('is_read');
      expect(notification).toHaveProperty('created_at');
    });

    it('should limit notifications based on query parameter', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter unread notifications only', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ unread_only: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(notification => !notification.is_read)).toBe(true);
      expect(response.body.data.length).toBe(2); // 2 unread notifications
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return correct unread count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unread_count');
      expect(response.body.data.unread_count).toBe(2); // 2 unread notifications
    });
  });

  describe('POST /api/notifications/mark-read/:id', () => {
    it('should mark a notification as read', async () => {
      const unreadNotification = testNotifications.find(n => !n.is_read);
      
      const response = await request(app)
        .post(`/api/notifications/mark-read/${unreadNotification.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');

      // Verify notification is marked as read
      const checkResponse = await request(app)
        .get('/api/notifications/unread-count')
        .expect(200);

      expect(checkResponse.body.data.unread_count).toBe(1); // Should be 1 less
    });

    it('should return 200 even for already read notifications', async () => {
      const readNotification = testNotifications.find(n => n.is_read);
      
      const response = await request(app)
        .post(`/api/notifications/mark-read/${readNotification.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    beforeEach(async () => {
      // Reset some notifications to unread for this test
      await executeQuery(
        'UPDATE notifications SET is_read = FALSE WHERE user_id = ?',
        [testUser.id]
      );
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('All notifications marked as read');

      // Verify all notifications are marked as read
      const checkResponse = await request(app)
        .get('/api/notifications/unread-count')
        .expect(200);

      expect(checkResponse.body.data.unread_count).toBe(0);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationToDelete;

    beforeEach(async () => {
      // Create a notification specifically for deletion
      const result = await executeQuery(
        'INSERT INTO notifications (user_id, notification_type, title, message) VALUES (?, ?, ?, ?)',
        [testUser.id, 'info', 'Test Delete', 'This notification will be deleted']
      );
      notificationToDelete = { id: result.insertId };
    });

    it('should delete a notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationToDelete.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify notification is deleted by checking if it's not in the list
      const listResponse = await request(app)
        .get('/api/notifications')
        .expect(200);

      const deletedNotification = listResponse.body.data.find(n => n.id === notificationToDelete.id);
      expect(deletedNotification).toBeUndefined();
    });

    it('should handle deletion of non-existent notification gracefully', async () => {
      const response = await request(app)
        .delete('/api/notifications/99999')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('createNotification helper function', () => {
    it('should create a notification using helper function', async () => {
      await createNotification(
        testUser.id,
        'milestone',
        'Test Milestone',
        'This is a test milestone notification',
        123,
        'trade'
      );

      // Verify notification was created
      const response = await request(app)
        .get('/api/notifications')
        .expect(200);

      const createdNotification = response.body.data.find(n => n.title === 'Test Milestone');
      expect(createdNotification).toBeTruthy();
      expect(createdNotification.notification_type).toBe('milestone');
      expect(createdNotification.related_id).toBe(123);
      expect(createdNotification.related_type).toBe('trade');

      // Clean up
      await executeQuery('DELETE FROM notifications WHERE id = ?', [createdNotification.id]);
    });

    it('should handle errors gracefully in createNotification', async () => {
      // This should not throw an error even with invalid data
      await expect(
        createNotification(999999, 'invalid', 'Test', 'Test message')
      ).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error by using invalid user context
      const errorApp = express();
      errorApp.use(express.json());
      
      const errorAuth = (req, res, next) => {
        req.user = { userId: null, id: null };
        next();
      };
      
      errorApp.use('/api/notifications', errorAuth, notificationsRouter);

      const response = await request(errorApp)
        .get('/api/notifications')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to fetch notifications');
    });
  });
});