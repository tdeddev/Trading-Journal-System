import puppeteer, { Page } from 'puppeteer';

describe('Trading Journal - Authentication Tests', () => {
  let page: Page;

  beforeEach(async () => {
    page = await global.browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    await page.close();
  });

  describe('User Registration', () => {
    test('should validate registration form', async () => {
      const registrationHTML = `
        <html>
          <head><title>Trading Journal - Register</title></head>
          <body>
            <h1>Create Account</h1>
            <form id="register-form">
              <input type="text" name="username" placeholder="Username" required>
              <input type="email" name="email" placeholder="Email" required>
              <input type="password" name="password" placeholder="Password" required>
              <input type="password" name="confirm_password" placeholder="Confirm Password" required>
              
              <select name="timezone">
                <option value="">Select Timezone</option>
                <option value="GMT">GMT (London)</option>
                <option value="EST">EST (New York)</option>
                <option value="JST">JST (Tokyo)</option>
                <option value="AEDT">AEDT (Sydney)</option>
              </select>
              
              <button type="submit">Create Account</button>
            </form>
            <div id="error-message" style="color: red; display: none;"></div>
            <script>
              document.getElementById('register-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const password = document.querySelector('input[name="password"]').value;
                const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
                const errorDiv = document.getElementById('error-message');
                
                if (password !== confirmPassword) {
                  errorDiv.textContent = 'Passwords do not match';
                  errorDiv.style.display = 'block';
                } else if (password.length < 6) {
                  errorDiv.textContent = 'Password must be at least 6 characters';
                  errorDiv.style.display = 'block';
                } else {
                  errorDiv.style.display = 'none';
                  alert('Registration successful!');
                }
              });
            </script>
          </body>
        </html>
      `;
      
      await page.goto(`data:text/html,${encodeURIComponent(registrationHTML)}`);
      
      // Fill form with valid data
      await page.type('input[name="username"]', 'testtrader');
      await page.type('input[name="email"]', 'test@trader.com');
      await page.type('input[name="password"]', 'password123');
      await page.type('input[name="confirm_password"]', 'password123');
      await page.select('select[name="timezone"]', 'GMT');
      
      // Test form validation
      await page.click('button[type="submit"]');
      
      // Should show success alert
      page.on('dialog', async dialog => {
        expect(dialog.message()).toBe('Registration successful!');
        await dialog.accept();
      });
    });

    test('should show password mismatch error', async () => {
      const registrationHTML = `
        <html>
          <head><title>Trading Journal - Register</title></head>
          <body>
            <form id="register-form">
              <input type="password" name="password" placeholder="Password" required>
              <input type="password" name="confirm_password" placeholder="Confirm Password" required>
              <button type="submit">Create Account</button>
            </form>
            <div id="error-message" style="color: red; display: none;"></div>
            <script>
              document.getElementById('register-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const password = document.querySelector('input[name="password"]').value;
                const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
                const errorDiv = document.getElementById('error-message');
                
                if (password !== confirmPassword) {
                  errorDiv.textContent = 'Passwords do not match';
                  errorDiv.style.display = 'block';
                }
              });
            </script>
          </body>
        </html>
      `;
      
      await page.goto(`data:text/html,${encodeURIComponent(registrationHTML)}`);
      
      await page.type('input[name="password"]', 'password123');
      await page.type('input[name="confirm_password"]', 'differentpassword');
      await page.click('button[type="submit"]');
      
      const errorMessage = await page.$eval('#error-message', (el: any) => el.textContent);
      const errorVisible = await page.$eval('#error-message', (el: any) => 
        getComputedStyle(el).display
      );
      
      expect(errorMessage).toBe('Passwords do not match');
      expect(errorVisible).toBe('block');
    });
  });

  describe('User Login', () => {
    test('should handle login form', async () => {
      const loginHTML = `
        <html>
          <head><title>Trading Journal - Login</title></head>
          <body>
            <h1>Login</h1>
            <form id="login-form">
              <input type="email" name="email" placeholder="Email" required>
              <input type="password" name="password" placeholder="Password" required>
              <button type="submit">Login</button>
              <a href="#forgot">Forgot Password?</a>
            </form>
            <div id="login-status"></div>
            <script>
              document.getElementById('login-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.querySelector('input[name="email"]').value;
                const password = document.querySelector('input[name="password"]').value;
                const status = document.getElementById('login-status');
                
                if (email === 'test@trader.com' && password === 'password123') {
                  status.textContent = 'Login successful!';
                  status.style.color = 'green';
                } else {
                  status.textContent = 'Invalid credentials';
                  status.style.color = 'red';
                }
              });
            </script>
          </body>
        </html>
      `;
      
      await page.goto(`data:text/html,${encodeURIComponent(loginHTML)}`);
      
      // Test successful login
      await page.type('input[name="email"]', 'test@trader.com');
      await page.type('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      const successMessage = await page.$eval('#login-status', (el: any) => el.textContent);
      expect(successMessage).toBe('Login successful!');
      
      // Clear form for next test
      await page.evaluate(() => {
        (document.querySelector('input[name="email"]') as HTMLInputElement).value = '';
        (document.querySelector('input[name="password"]') as HTMLInputElement).value = '';
        (document.getElementById('login-status') as HTMLElement).textContent = '';
      });
      
      // Test failed login
      await page.type('input[name="email"]', 'wrong@email.com');
      await page.type('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      const errorMessage = await page.$eval('#login-status', (el: any) => el.textContent);
      expect(errorMessage).toBe('Invalid credentials');
    });

    test('should have forgot password link', async () => {
      const loginHTML = `
        <html>
          <body>
            <form id="login-form">
              <input type="email" name="email" placeholder="Email">
              <input type="password" name="password" placeholder="Password">
              <button type="submit">Login</button>
              <a href="/forgot-password" id="forgot-link">Forgot Password?</a>
            </form>
          </body>
        </html>
      `;
      
      await page.goto(`data:text/html,${encodeURIComponent(loginHTML)}`);
      
      const forgotLink = await page.$('#forgot-link');
      expect(forgotLink).toBeTruthy();
      
      const linkText = await page.$eval('#forgot-link', (el: any) => el.textContent);
      expect(linkText).toBe('Forgot Password?');
    });
  });

  describe('JWT Token Handling', () => {
    test('should simulate JWT token storage', async () => {
      const tokenHTML = `
        <html>
          <head><title>JWT Token Test</title></head>
          <body>
            <button id="login-btn">Login</button>
            <button id="logout-btn" style="display: none;">Logout</button>
            <div id="token-status">Not logged in</div>
            <script>
              let token = null;
              
              document.getElementById('login-btn').addEventListener('click', function() {
                // Simulate JWT token creation
                token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdCIsImlhdCI6MTYzNzg4MzYwMH0.fake_signature';
                localStorage.setItem('jwt_token', token);
                
                document.getElementById('login-btn').style.display = 'none';
                document.getElementById('logout-btn').style.display = 'block';
                document.getElementById('token-status').textContent = 'Logged in with token';
              });
              
              document.getElementById('logout-btn').addEventListener('click', function() {
                token = null;
                localStorage.removeItem('jwt_token');
                
                document.getElementById('login-btn').style.display = 'block';
                document.getElementById('logout-btn').style.display = 'none';
                document.getElementById('token-status').textContent = 'Not logged in';
              });
              
              // Check if token exists on page load
              if (localStorage.getItem('jwt_token')) {
                document.getElementById('login-btn').style.display = 'none';
                document.getElementById('logout-btn').style.display = 'block';
                document.getElementById('token-status').textContent = 'Logged in with token';
              }
            </script>
          </body>
        </html>
      `;
      
      await page.goto(`data:text/html,${encodeURIComponent(tokenHTML)}`);
      
      // Test login
      await page.click('#login-btn');
      
      const tokenStatus = await page.$eval('#token-status', (el: any) => el.textContent);
      expect(tokenStatus).toBe('Logged in with token');
      
      const storedToken = await page.evaluate(() => localStorage.getItem('jwt_token'));
      expect(storedToken).toBeTruthy();
      expect(storedToken).toContain('eyJhbGciOiJIUzI1NiI');
      
      // Test logout
      await page.click('#logout-btn');
      
      const loggedOutStatus = await page.$eval('#token-status', (el: any) => el.textContent);
      expect(loggedOutStatus).toBe('Not logged in');
      
      const removedToken = await page.evaluate(() => localStorage.getItem('jwt_token'));
      expect(removedToken).toBeNull();
    });
  });
});