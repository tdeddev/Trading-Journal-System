-- Trading Journal System Database Schema
-- 6 Main Tables as per project plan

-- 1. Users Table - User Management & Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'GMT',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Trading Sessions Table - Session Tracking
CREATE TABLE IF NOT EXISTS trading_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_name ENUM('London', 'New York', 'Tokyo', 'Sydney') NOT NULL,
    session_date DATE NOT NULL,
    market_bias ENUM('Bullish', 'Bearish', 'Neutral') DEFAULT 'Neutral',
    market_condition VARCHAR(100),
    pnl_target DECIMAL(10,2),
    risk_limit DECIMAL(10,2),
    actual_pnl DECIMAL(10,2) DEFAULT 0,
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    notes TEXT,
    session_start TIMESTAMP,
    session_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id, session_date),
    INDEX idx_session_name (session_name)
);

-- 3. Trading Strategies Table - Strategy Management
CREATE TABLE IF NOT EXISTS trading_strategies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    strategy_name VARCHAR(100) NOT NULL,
    strategy_type ENUM('Pullback', 'Fibonacci', 'Mean Reversion', 'Custom') NOT NULL,
    description TEXT,
    success_rate DECIMAL(5,2) DEFAULT 0,
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    avg_win DECIMAL(10,2) DEFAULT 0,
    avg_loss DECIMAL(10,2) DEFAULT 0,
    profit_factor DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_strategy (user_id, strategy_type),
    UNIQUE KEY unique_user_strategy (user_id, strategy_name)
);

-- 4. Trades Table - Core Trade Data
CREATE TABLE IF NOT EXISTS trades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id INT,
    strategy_id INT,
    symbol VARCHAR(20) NOT NULL, -- XAUUSD, GBPUSD, NAS100, DJI
    trade_type ENUM('Long', 'Short') NOT NULL,
    entry_price DECIMAL(12,5) NOT NULL,
    exit_price DECIMAL(12,5),
    stop_loss DECIMAL(12,5),
    take_profit DECIMAL(12,5),
    lot_size DECIMAL(8,2) NOT NULL,
    pnl DECIMAL(10,2) DEFAULT 0,
    pnl_pips DECIMAL(8,2) DEFAULT 0,
    commission DECIMAL(8,2) DEFAULT 0,
    swap DECIMAL(8,2) DEFAULT 0,
    trade_status ENUM('Open', 'Closed', 'Cancelled') DEFAULT 'Open',
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NULL,
    duration_minutes INT,
    emotion ENUM('Confident', 'Anxious', 'Greedy', 'Fearful', 'Patient', 'Impulsive', 'Disciplined', 'Revenge'),
    trade_quality ENUM('Excellent', 'Good', 'Average', 'Poor') DEFAULT 'Average',
    notes TEXT,
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES trading_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id) ON DELETE SET NULL,
    INDEX idx_user_trades (user_id, entry_time),
    INDEX idx_symbol (symbol),
    INDEX idx_trade_status (trade_status),
    INDEX idx_entry_time (entry_time)
);

-- 5. Trade Images Table - Image Management
CREATE TABLE IF NOT EXISTS trade_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_id INT NOT NULL,
    image_type ENUM('Before', 'During', 'After', 'Analysis', 'Setup') NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    image_size INT,
    image_caption VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    INDEX idx_trade_images (trade_id, image_type)
);

-- 6. User Settings Table - Personalization
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    default_lot_size DECIMAL(8,2) DEFAULT 0.01,
    default_risk_percent DECIMAL(5,2) DEFAULT 2.00,
    preferred_timeframe VARCHAR(10) DEFAULT '1H',
    dashboard_layout JSON,
    notification_settings JSON,
    theme_preference ENUM('Light', 'Dark') DEFAULT 'Light',
    default_session ENUM('London', 'New York', 'Tokyo', 'Sydney') DEFAULT 'London',
    auto_calculate_pnl BOOLEAN DEFAULT true,
    currency_display VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(10) DEFAULT '24H',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Insert Default Trading Strategies
INSERT INTO trading_strategies (user_id, strategy_name, strategy_type, description) VALUES
(1, 'London Session Pullback', 'Pullback', 'Pullback strategy during London market hours'),
(1, 'NY Fibonacci Retracement', 'Fibonacci', 'Fibonacci retracement during New York session'),
(1, 'Tokyo Mean Reversion', 'Mean Reversion', 'Mean reversion strategy during Tokyo session');

-- Create Indexes for Performance
CREATE INDEX idx_trades_performance ON trades(user_id, entry_time, pnl);
CREATE INDEX idx_sessions_performance ON trading_sessions(user_id, session_date, actual_pnl);
CREATE INDEX idx_strategies_performance ON trading_strategies(user_id, success_rate, total_trades);

-- 7. Notifications Table - User Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type ENUM('info', 'success', 'warning', 'error', 'milestone', 'achievement') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    related_id INT NULL,
    related_type VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, is_read, created_at),
    INDEX idx_notification_type (notification_type)
);

-- Create Views for Analytics
CREATE VIEW v_user_performance AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(t.id) as total_trades,
    SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
    SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
    ROUND(SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(t.id), 2) as win_rate,
    SUM(t.pnl) as total_pnl,
    AVG(CASE WHEN t.pnl > 0 THEN t.pnl ELSE NULL END) as avg_win,
    AVG(CASE WHEN t.pnl < 0 THEN t.pnl ELSE NULL END) as avg_loss
FROM users u
LEFT JOIN trades t ON u.id = t.user_id AND t.trade_status = 'Closed'
GROUP BY u.id, u.username;