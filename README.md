# Trading Journal System 📊

A comprehensive trading journal and analytics platform built with modern web technologies. Track your trades, analyze performance, and improve your trading strategy with advanced analytics and risk management tools.

![Trading Journal System](https://via.placeholder.com/800x400/2563eb/ffffff?text=Trading+Journal+System)

## ✨ Features

### 📈 Trade Management
- **Complete Trade Lifecycle**: Add, edit, close, and delete trades
- **Multiple Asset Classes**: Support for Forex, Gold, Indices (NAS100, DJI, SPX500)
- **Real-time P&L Calculation**: Automatic profit/loss calculations
- **Risk Management**: Stop-loss and take-profit tracking
- **Trade Images**: Upload and manage trade screenshots

### 📊 Advanced Analytics
- **Performance Dashboard**: Comprehensive trading statistics
- **Win/Loss Analytics**: Detailed win rate and streak analysis
- **Drawdown Analysis**: Maximum and current drawdown tracking
- **Symbol Performance**: Asset-specific performance metrics
- **Time-based Analysis**: Hourly, daily, and session performance
- **Risk Metrics**: Sharpe ratio, Sortino ratio, VaR, CVaR
- **Monte Carlo Simulation**: Portfolio risk assessment

### 📝 Trade Journal
- **Rich Note-Taking**: Detailed trade notes with templates
- **Tagging System**: Categorize trades with custom and popular tags
- **Emotional Tracking**: Record and analyze trading psychology
- **Trade Quality Assessment**: Rate trade execution quality

### 📤 Data Export
- **Multiple Formats**: Export to CSV and Excel
- **Filtered Exports**: Export specific date ranges and trade types
- **Comprehensive Reports**: Multi-sheet Excel workbooks with analytics

### 🔔 Notification System
- **Real-time Alerts**: Trade milestone and achievement notifications
- **Risk Warnings**: Automated risk alerts for consecutive losses
- **Performance Milestones**: Celebrate trading achievements
- **Toast Notifications**: Real-time in-app notifications

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Customizable interface themes
- **Responsive Design**: Mobile and tablet optimized
- **Interactive Charts**: Chart.js powered visualizations
- **Intuitive Navigation**: Clean and organized interface

## 🛠️ Technology Stack

### Frontend
- **Framework**: Nuxt.js 3 (Vue.js 3)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js & Vue-ChartJS
- **Icons**: Heroicons
- **State Management**: Pinia
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Caching**: Redis
- **Authentication**: JWT
- **File Processing**: Sharp (image processing)
- **File Upload**: Multer
- **Data Export**: Fast-CSV, XLSX

### DevOps & Testing
- **Testing**: Jest (Backend), Vitest (Frontend), Playwright (E2E)
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Health checks and logging

## 🏗️ Project Structure
```
trading_journal_system/
├── backend/               # Express.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Authentication & upload middleware
│   ├── routes/          # API endpoints
│   ├── sql/             # Database schema
│   ├── tests/           # Backend unit tests
│   └── uploads/         # File uploads directory
├── frontend/            # Nuxt.js frontend
│   ├── components/      # Vue components
│   ├── pages/          # Application pages
│   ├── stores/         # Pinia state stores
│   ├── tests/          # Component tests
│   └── nuxt.config.ts  # Nuxt configuration
├── e2e/                # End-to-end tests
│   └── trading-workflow.spec.ts
├── docker-compose.yml  # Docker configuration
├── nginx.conf         # Nginx configuration
├── DEPLOYMENT.md      # Deployment guide
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Redis 6+
- Docker & Docker Compose (optional)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/trading-journal-system.git
cd trading-journal-system
```

### 2. Environment Setup

#### Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
```

#### Frontend Configuration
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
```

### 3. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE trading_journal;
CREATE USER 'trading_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON trading_journal.* TO 'trading_user'@'localhost';

# Import schema
cd backend
mysql -u trading_user -p trading_journal < sql/schema.sql
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend App
cd frontend
npm run dev

# Terminal 3 - Redis (if not installed systemwide)
redis-server
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
# Clone and setup
git clone https://github.com/your-username/trading-journal-system.git
cd trading-journal-system

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Deploy with Docker Compose
docker-compose up -d --build

# Verify deployment
curl http://localhost/health
```

### Docker Services
- **Frontend**: Nuxt.js app (Port 3000)
- **Backend**: Express API (Port 5000)
- **Database**: MySQL 8.0 (Port 3306)
- **Redis**: Cache server (Port 6379)
- **Nginx**: Reverse proxy (Port 80/443)

## 📋 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Component tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### End-to-End Tests
```bash
npx playwright install  # Install browsers
npx playwright test     # Run E2E tests
```

## 📊 Database Schema

### Core Tables
- **users**: User management and authentication
- **trades**: Core trade data and P&L
- **trading_sessions**: Trading session tracking
- **trading_strategies**: Strategy management
- **trade_images**: Trade screenshot management
- **notifications**: User notification system
- **user_settings**: User preferences and configuration

### Key Features
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized query performance
- **Views**: Pre-computed analytics
- **JSON Fields**: Flexible configuration storage

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=trading_user
DB_PASSWORD=your_password
DB_NAME=trading_journal
JWT_SECRET=your_super_secure_secret
```

#### Frontend (.env)
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NUXT_APP_BASE_URL=http://localhost:3000
```

## 📈 Performance

### Optimization Features
- **Database Indexing**: Optimized queries
- **Redis Caching**: API response caching
- **Image Processing**: Automatic WebP conversion
- **Code Splitting**: Lazy-loaded components
- **Gzip Compression**: Nginx compression
- **CDN Ready**: Static asset optimization

### Monitoring
- **Health Checks**: Application and service health
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **Database Optimization**: Query performance analysis

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password security
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Cross-origin request security
- **Rate Limiting**: API abuse prevention
- **File Upload Security**: Type and size validation

### Security Best Practices
- Regular dependency updates
- Environment variable protection
- Database credential rotation
- SSL/TLS encryption
- Security headers implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Unit testing requirements
- **Conventional Commits**: Commit message standards

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Comprehensive deployment instructions
- **[API Documentation](docs/API.md)**: REST API reference
- **[Database Schema](docs/DATABASE.md)**: Database structure details
- **[Contributing Guidelines](CONTRIBUTING.md)**: Development contribution guide

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test database connection
cd backend
npm run db:test
```

#### Frontend Build Issues
```bash
# Clear cache and rebuild
cd frontend
rm -rf .nuxt .output node_modules/.cache
npm install
npm run build
```

#### Docker Issues
```bash
# View service logs
docker-compose logs -f [service_name]

# Rebuild services
docker-compose up -d --build

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chart.js** - Beautiful charts and visualizations
- **Tailwind CSS** - Utility-first CSS framework
- **Nuxt.js** - The intuitive Vue framework
- **Express.js** - Fast, minimalist web framework
- **MySQL** - Reliable relational database
- **Redis** - In-memory data structure store

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/trading-journal-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/trading-journal-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/trading-journal-system/discussions)
- **Email**: support@trading-journal.com

## 🎯 Roadmap

### Version 2.0 Planned Features
- [ ] Mobile applications (React Native)
- [ ] Advanced backtesting engine
- [ ] Social trading features
- [ ] Integration with broker APIs
- [ ] Machine learning trade predictions
- [ ] Advanced portfolio analytics
- [ ] Multi-user team features
- [ ] Real-time market data integration

---

⭐ **Star this repository if you find it helpful!** ⭐