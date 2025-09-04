import puppeteer, { Page } from 'puppeteer';

describe('Trading Journal System - Basic Tests', () => {
  let page: Page;

  beforeEach(async () => {
    page = await global.browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    await page.close();
  });

  test('should be able to navigate to Google (sample test)', async () => {
    await page.goto('https://www.google.com');
    const title = await page.title();
    expect(title).toContain('Google');
  });

  test('should be able to take screenshot', async () => {
    await page.goto('https://www.google.com');
    await page.waitForSelector('input[name="q"]', { timeout: 5000 });
    
    // Take screenshot without saving to file for this test
    const screenshot = await page.screenshot({ 
      fullPage: true,
      encoding: 'base64'
    });
    
    expect(screenshot).toBeTruthy();
    expect(typeof screenshot).toBe('string');
    
    const searchInput = await page.$('input[name="q"]');
    expect(searchInput).toBeTruthy();
  });

  test('should handle login form testing (placeholder)', async () => {
    // This will be replaced with actual login tests when backend is ready
    await page.goto('data:text/html,<html><body><h1>Trading Journal Login</h1><form><input type="email" name="email" placeholder="Email"><input type="password" name="password" placeholder="Password"><button type="submit">Login</button></form></body></html>');
    
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    
    const emailValue = await page.$eval('input[name="email"]', (el: any) => el.value);
    expect(emailValue).toBe('test@example.com');
  });

  test('should test responsive design', async () => {
    await page.goto('data:text/html,<html><body><h1>Trading Journal</h1></body></html>');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    const mobileTitle = await page.$eval('h1', (el: any) => getComputedStyle(el).fontSize);
    
    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    const desktopTitle = await page.$eval('h1', (el: any) => getComputedStyle(el).fontSize);
    
    // Both should be valid CSS values
    expect(mobileTitle).toMatch(/\d+px/);
    expect(desktopTitle).toMatch(/\d+px/);
  });
});