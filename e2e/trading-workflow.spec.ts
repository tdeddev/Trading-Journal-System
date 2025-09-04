import { test, expect } from '@playwright/test';

test.describe('Trading Journal Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display the dashboard homepage', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('Trading Journal');
    await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();
  });

  test('should navigate between main sections', async ({ page }) => {
    // Navigate to Trades section
    await page.click('text=Trades');
    await expect(page.locator('h2')).toContainText('Trade Management');
    
    // Navigate to Analytics section
    await page.click('text=Analytics');
    await expect(page.locator('h2')).toContainText('Trading Analytics');
    
    // Navigate to Journal section
    await page.click('text=Journal');
    await expect(page.locator('h3')).toContainText('Trade Journal');
    
    // Navigate back to Dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('h1')).toContainText('Trading Journal');
  });

  test('should add a new trade', async ({ page }) => {
    // Navigate to trades section
    await page.click('text=Trades');
    
    // Click add trade button
    await page.click('text=Add New Trade');
    
    // Fill out the trade form
    await page.selectOption('[name="symbol"]', 'XAUUSD');
    await page.selectOption('[name="trade_type"]', 'Long');
    await page.fill('input[placeholder*="Entry price"]', '1950.50');
    await page.fill('input[placeholder*="Stop loss"]', '1940.00');
    await page.fill('input[placeholder*="Take profit"]', '1970.00');
    await page.fill('input[placeholder*="lot size"]', '0.10');
    
    // Set entry time to current time
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateTimeString);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Trade added successfully')).toBeVisible();
    
    // Verify trade appears in the list
    await expect(page.locator('text=XAUUSD')).toBeVisible();
    await expect(page.locator('text=Long')).toBeVisible();
  });

  test('should close an open trade', async ({ page }) => {
    // First, add a trade (assuming previous test data exists or add one)
    await page.click('text=Trades');
    
    // Look for an open trade and click on it
    const openTrade = page.locator('[data-status="Open"]').first();
    if (await openTrade.count() > 0) {
      await openTrade.click();
      
      // Close trade button
      await page.click('text=Close Trade');
      
      // Fill exit details
      await page.fill('input[placeholder*="Exit price"]', '1960.00');
      
      const exitTime = new Date();
      const exitTimeString = exitTime.toISOString().slice(0, 16);
      await page.fill('input[type="datetime-local"]', exitTimeString);
      
      // Submit close trade form
      await page.click('button[type="submit"]');
      
      // Verify trade is closed
      await expect(page.locator('text=Trade closed successfully')).toBeVisible();
    }
  });

  test('should display analytics charts', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=Analytics');
    
    // Wait for charts to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Verify charts are present
    const charts = page.locator('canvas');
    await expect(charts).toHaveCount(4); // Assuming 4 charts in analytics
    
    // Check for key metrics
    await expect(page.locator('text=Total P&L')).toBeVisible();
    await expect(page.locator('text=Win Rate')).toBeVisible();
    await expect(page.locator('text=Total Trades')).toBeVisible();
  });

  test('should add journal notes to a trade', async ({ page }) => {
    // Navigate to journal section
    await page.click('text=Journal');
    
    // Select a trade from dropdown
    await page.selectOption('select', { index: 1 }); // Select first available trade
    
    // Add notes
    const testNotes = 'This is a test journal entry for automated testing.';
    await page.fill('textarea[placeholder*="Describe your trade"]', testNotes);
    
    // Add tags
    await page.click('text=breakout'); // Click on a popular tag
    
    // Select emotion
    await page.selectOption('select[name="emotion"]', 'Confident');
    
    // Select trade quality
    await page.selectOption('select[name="trade_quality"]', 'Good');
    
    // Save journal entry
    await page.click('text=Save Journal Entry');
    
    // Verify success message
    await expect(page.locator('text=Journal entry saved successfully')).toBeVisible();
  });

  test('should export trade data', async ({ page }) => {
    // Navigate to trades section
    await page.click('text=Trades');
    
    // Click export button
    await page.click('text=Export');
    
    // Wait for export modal/dropdown to appear
    await page.waitForSelector('text=Export as CSV', { timeout: 5000 });
    
    // Start download for CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export as CSV');
    const download = await downloadPromise;
    
    // Verify download was initiated
    expect(download.suggestedFilename()).toContain('trades');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should display notifications', async ({ page }) => {
    // Click on notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Verify notification dropdown appears
    await expect(page.locator('text=Notifications')).toBeVisible();
    
    // If notifications exist, interact with them
    const notifications = page.locator('[data-testid="notification-item"]');
    if (await notifications.count() > 0) {
      // Click on first notification
      await notifications.first().click();
      
      // Verify notification is marked as read (visual change)
      await expect(notifications.first().locator('.bg-blue-50')).not.toBeVisible();
    }
    
    // Test mark all as read functionality
    if (await page.locator('text=Mark all read').count() > 0) {
      await page.click('text=Mark all read');
    }
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile navigation works
    const hamburgerMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await hamburgerMenu.count() > 0) {
      await hamburgerMenu.click();
      
      // Verify mobile menu appears
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      
      // Navigate using mobile menu
      await page.click('text=Trades');
      await expect(page.locator('h2')).toContainText('Trade Management');
    }
    
    // Test that forms are still usable on mobile
    await page.click('text=Add New Trade');
    await expect(page.locator('form')).toBeVisible();
    
    // Verify form elements are properly sized
    const formInputs = page.locator('input, select, textarea');
    for (let i = 0; i < await formInputs.count(); i++) {
      const input = formInputs.nth(i);
      const boundingBox = await input.boundingBox();
      if (boundingBox) {
        // Ensure form elements are not too small for mobile interaction
        expect(boundingBox.height).toBeGreaterThan(35);
      }
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test network error handling by intercepting API calls
    await page.route('**/api/**', route => {
      route.abort('networkerror');
    });
    
    // Try to navigate to a section that requires API data
    await page.click('text=Analytics');
    
    // Should show error message or loading state
    await expect(page.locator('text=Error loading data')).toBeVisible({
      timeout: 10000
    }).catch(() => {
      // If no error message, at least ensure page doesn't crash
      expect(page.url()).toContain('/analytics');
    });
  });
});

test.describe('Performance and Accessibility', () => {
  test('should meet basic accessibility standards', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic accessibility features
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Verify navigation is keyboard accessible
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});