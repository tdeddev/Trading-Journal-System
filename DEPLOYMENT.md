# Trading Journal System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Docker Deployment](#docker-deployment)
6. [Production Deployment](#production-deployment)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **MySQL**: 8.0 or higher
- **Redis**: 6.x or higher (for caching and sessions)
- **Docker & Docker Compose**: Latest stable versions
- **Nginx**: Latest stable version (for reverse proxy)
- **Git**: For version control

### Minimum Server Specifications
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 1Gbps connection

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/trading-journal-system.git
cd trading-journal-system
```

### 2. Environment Variables

#### Backend Configuration
Create `.env` file in the `backend` directory:
```bash
cp backend/.env.production backend/.env
```

Edit the `.env` file with your production values:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=trading_user
DB_PASSWORD=your_secure_password
DB_NAME=trading_journal_prod
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
```

#### Frontend Configuration
Create `.env` file in the `frontend` directory:
```bash
cp frontend/.env.production frontend/.env
```

Edit the `.env` file:
```env
NUXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
NUXT_APP_BASE_URL=https://your-domain.com
```

## Database Setup

### 1. MySQL Installation & Configuration

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### On CentOS/RHEL:
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

### 2. Database Creation
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database and user
CREATE DATABASE trading_journal_prod;
CREATE USER 'trading_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON trading_journal_prod.* TO 'trading_user'@'localhost';
FLUSH PRIVILEGES;

-- Import schema
USE trading_journal_prod;
source /path/to/backend/sql/schema.sql;
```

### 3. Redis Installation
```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

## Local Development

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Database (if using Docker)
docker run --name trading-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=trading_journal -p 3306:3306 -d mysql:8.0
```

### 3. Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npx playwright test
```

## Docker Deployment

### 1. Production Build with Docker Compose
```bash
# Create production environment file
cp .env.example .env

# Edit .env with your production values
nano .env

# Build and start services
docker-compose up -d --build
```

### 2. Docker Services Overview
- **database**: MySQL 8.0 database
- **redis**: Redis cache server
- **backend**: Node.js API server
- **frontend**: Nuxt.js application
- **nginx**: Reverse proxy and load balancer

### 3. Docker Commands
```bash
# View logs
docker-compose logs -f [service_name]

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up -d --build [service_name]

# Scale services
docker-compose up -d --scale backend=3
```

## Production Deployment

### 1. Server Setup

#### Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Configure Firewall
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/trading-journal-system.git
cd trading-journal-system

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy
docker-compose -f docker-compose.yml up -d --build

# Verify deployment
docker-compose ps
curl -f http://localhost/health
```

### 3. Database Migration
```bash
# Run initial migration
docker-compose exec backend node -e "require('./config/database').testConnection()"

# Import schema (if needed)
docker-compose exec database mysql -u trading_user -p trading_journal_prod < /docker-entrypoint-initdb.d/schema.sql
```

## SSL Certificate Setup

### 1. Using Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. Update Nginx Configuration
```bash
# Edit nginx.conf to enable HTTPS server block
nano nginx.conf

# Restart nginx service
docker-compose restart nginx
```

### 3. Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

## Monitoring & Logging

### 1. Application Logs
```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Log rotation
sudo logrotate -f /etc/logrotate.d/docker-compose
```

### 2. Health Monitoring
```bash
# Health check endpoints
curl http://localhost/health
curl http://localhost:5000/health

# Database health
docker-compose exec database mysql -u trading_user -p -e "SELECT 1"

# Redis health
docker-compose exec redis redis-cli ping
```

### 3. Performance Monitoring
```bash
# System resources
docker stats

# Database performance
docker-compose exec database mysql -u root -p -e "SHOW PROCESSLIST"

# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## Backup & Recovery

### 1. Database Backup
```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="trading_journal_backup_$DATE.sql"

mkdir -p $BACKUP_DIR
docker-compose exec -T database mysqldump -u trading_user -p'your_password' trading_journal_prod > "$BACKUP_DIR/$BACKUP_FILE"
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "trading_journal_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Schedule daily backup
echo "0 2 * * * /path/to/backup-db.sh" | crontab -
```

### 2. File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz -C /var/lib/docker/volumes/trading_journal_system_uploads_data/_data .
```

### 3. Recovery Procedure
```bash
# Database restore
gunzip -c trading_journal_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T database mysql -u trading_user -p trading_journal_prod

# Uploads restore
tar -xzf uploads_backup_YYYYMMDD.tar.gz -C /var/lib/docker/volumes/trading_journal_system_uploads_data/_data/
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
docker-compose exec database mysql -u root -p -e "SELECT 1"

# Verify credentials
docker-compose exec backend node -e "require('./config/database').testConnection()"

# Check network connectivity
docker-compose exec backend ping database
```

#### 2. Frontend Build Issues
```bash
# Clear build cache
docker-compose exec frontend rm -rf .nuxt .output node_modules/.cache

# Rebuild frontend
docker-compose up -d --build frontend
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
sudo certbot certificates

# Verify nginx configuration
nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload
```

#### 4. Performance Issues
```bash
# Check system resources
free -h
df -h
docker stats

# Optimize database
docker-compose exec database mysqlcheck -u root -p --optimize --all-databases

# Clear application cache
docker-compose exec redis redis-cli FLUSHALL
```

### Log Analysis
```bash
# Backend errors
docker-compose logs backend | grep -i error

# Database slow queries
docker-compose exec database mysql -u root -p -e "SELECT * FROM information_schema.PROCESSLIST WHERE TIME > 5"

# Nginx error logs
docker-compose logs nginx | grep -i error
```

### Support & Maintenance

#### Regular Maintenance Tasks
- Weekly database optimization
- Monthly log rotation
- Quarterly security updates
- Bi-annual dependency updates

#### Security Checklist
- [ ] SSL certificates are valid and auto-renewing
- [ ] Database credentials are strong and rotated
- [ ] JWT secrets are secure and unique
- [ ] Firewall rules are properly configured
- [ ] All dependencies are updated
- [ ] Backup procedures are tested
- [ ] Monitoring alerts are functional

For additional support, please refer to the project documentation or create an issue in the GitHub repository.