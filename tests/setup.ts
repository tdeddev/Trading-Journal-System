import puppeteer from 'puppeteer';

declare global {
  var browser: puppeteer.Browser;
}

beforeAll(async () => {
  global.browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
});

afterAll(async () => {
  if (global.browser) {
    await global.browser.close();
  }
});