# PAMBASO Restaurant Management System - Deployment Guide

This guide provides comprehensive instructions for deploying the PAMBASO Restaurant Management System to a VPS server with PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [SSL Configuration](#ssl-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Rocky Linux 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended
- **Network**: Public IP address with ports 80, 443, and 22 accessible

### Required Software

- Docker and Docker Compose (recommended) OR
- Node.js 18+, PostgreSQL 15+, Nginx
- Git
- SSL certificate (Let's Encrypt recommended)

### Domain Setup

- Domain name pointing to your VPS IP
- DNS A record configured
- Optional: Subdomain for API (e.g., api.yourdomain.com)

## Server Preparation

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# OR
sudo yum update -y  # CentOS/RHEL

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common  # Ubuntu/Debian
# OR
sudo yum install -y curl wget git unzip  # CentOS/RHEL

# Create application user
sudo useradd -m -s /bin/bash pambaso
sudo usermod -aG sudo pambaso

# Create application directory
sudo mkdir -p /opt/pambaso
sudo chown pambaso:pambaso /opt/pambaso
```

### 2. Firewall Configuration

```bash
# Ubuntu/Debian with UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (if external access needed)
sudo ufw --force enable

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5432/tcp  # PostgreSQL
sudo firewall-cmd --reload
```

### 3. Install Docker (Recommended Method)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pambaso

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

## Database Setup

### Option A: Docker PostgreSQL (Recommended)

1. **Clone the repository**:

```bash
su - pambaso
cd /opt/pambaso
git clone <your-repository-url> .
```

2. **Configure environment variables**:

```bash
# Copy and edit production environment file
cp .env.production .env
nano .env
```

Update the following variables:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pambaso_db
DB_USER=pambaso_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Server Configuration
SERVER_PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# SSL Configuration (if using HTTPS)
SSL_CERT_PATH=/etc/ssl/certs/yourdomain.crt
SSL_KEY_PATH=/etc/ssl/private/yourdomain.key
```

3. **Start the database**:

```bash
# Start only PostgreSQL service
docker-compose up -d postgres

# Wait for database to be ready
docker-compose logs -f postgres
```

4. **Apply database migrations**:

```bash
# Make migration script executable
chmod +x database/migrations/migrate.sh

# Run migrations
./database/migrations/migrate.sh -H localhost -p your_secure_password_here
```

### Option B: Native PostgreSQL Installation

1. **Install PostgreSQL using the provided script**:

```bash
# Make installation script executable
chmod +x database/install-postgresql.sh

# Run installation (will prompt for database password)
sudo ./database/install-postgresql.sh -d pambaso_db -u pambaso_user
```

2. **Apply database schema**:

```bash
# Apply initial schema
sudo -u postgres psql -d pambaso_db -f database/init/01-init-database.sql

# Or use migration script
./database/migrations/migrate.sh -p your_database_password
```

### Database Security Configuration

1. **Configure PostgreSQL for production**:

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Add/modify these settings:

```conf
# Connection settings
listen_addresses = 'localhost'  # Only local connections
max_connections = 100

# Security settings
ssl = on
password_encryption = scram-sha-256

# Performance settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

2. **Configure access control**:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Ensure these lines exist:

```conf
# Local connections
local   all             postgres                                peer
local   pambaso_db      pambaso_user                            scram-sha-256

# IPv4 local connections
host    pambaso_db      pambaso_user        127.0.0.1/32        scram-sha-256
host    pambaso_db      pambaso_user        ::1/128             scram-sha-256
```

3. **Restart PostgreSQL**:

```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

## Application Deployment

### Option A: Docker Deployment (Recommended)

1. **Build and start all services**:

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

2. **Verify deployment**:

```bash
# Test backend API
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:80
```

### Option B: Native Deployment

1. **Install Node.js**:

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

2. **Build the application**:

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Build backend
npm run server:build
```

3. **Install and configure Nginx**:

```bash
# Install Nginx
sudo apt install -y nginx

# Copy Nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/pambaso
sudo ln -s /etc/nginx/sites-available/pambaso /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

4. **Create systemd service for backend**:

```bash
sudo nano /etc/systemd/system/pambaso-backend.service
```

Add the following content:

```ini
[Unit]
Description=PAMBASO Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=pambaso
WorkingDirectory=/opt/pambaso
Environment=NODE_ENV=production
EnvironmentFile=/opt/pambaso/.env
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pambaso-backend

[Install]
WantedBy=multi-user.target
```

5. **Start the backend service**:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pambaso-backend
sudo systemctl start pambaso-backend
sudo systemctl status pambaso-backend
```

## SSL Configuration

### Using Let's Encrypt (Recommended)

1. **Install Certbot**:

```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

2. **Obtain SSL certificate**:

```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Set up automatic renewal**:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Manual SSL Certificate

If using a custom SSL certificate:

```bash
# Copy certificate files
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo cp your-certificate.crt /etc/ssl/certs/yourdomain.crt
sudo cp your-private-key.key /etc/ssl/private/yourdomain.key
sudo chmod 644 /etc/ssl/certs/yourdomain.crt
sudo chmod 600 /etc/ssl/private/yourdomain.key
```

## Monitoring and Maintenance

### Database Backup

1. **Set up automated backups**:

```bash
# Make backup script executable
chmod +x database/backups/backup.sh

# Test backup
./database/backups/backup.sh

# Add to crontab for daily backups at 2 AM
echo "0 2 * * * /opt/pambaso/database/backups/backup.sh" | crontab -
```

2. **Monitor backup logs**:

```bash
# View backup logs
tail -f /var/log/pambaso-backup.log
```

### System Monitoring

1. **Monitor application logs**:

```bash
# Docker deployment
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Native deployment
sudo journalctl -u pambaso-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

2. **Monitor system resources**:

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor in real-time
htop
iotop
nethogs
```

### Health Checks

1. **Create health check script**:

```bash
cat > /opt/pambaso/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for PAMBASO
echo "=== PAMBASO Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Check backend API
echo "Backend API:"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "  ✓ Backend is responding"
else
    echo "  ✗ Backend is not responding"
fi

# Check frontend
echo "Frontend:"
if curl -s http://localhost:80 > /dev/null; then
    echo "  ✓ Frontend is responding"
else
    echo "  ✗ Frontend is not responding"
fi

# Check database
echo "Database:"
if sudo -u postgres psql -d pambaso_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✓ Database is responding"
else
    echo "  ✗ Database is not responding"
fi

# Check disk space
echo "Disk Usage:"
df -h / | tail -1 | awk '{print "  Root: " $5 " used"}'
df -h /var | tail -1 | awk '{print "  /var: " $5 " used"}' 2>/dev/null || echo "  /var: Same as root"

# Check memory usage
echo "Memory Usage:"
free -h | grep Mem | awk '{print "  RAM: " $3 "/" $2 " (" int($3/$2*100) "% used)"}'

echo ""
echo "=== End Health Check ==="
EOF

chmod +x /opt/pambaso/health-check.sh
```

2. **Run health checks**:

```bash
# Manual health check
./health-check.sh

# Schedule regular health checks
echo "*/15 * * * * /opt/pambaso/health-check.sh >> /var/log/pambaso-health.log 2>&1" | crontab -
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test database connection
psql -h localhost -U pambaso_user -d pambaso_db

# Check listening ports
sudo netstat -tlnp | grep 5432
```

#### Backend API Issues

```bash
# Check backend service status
sudo systemctl status pambaso-backend

# Check backend logs
sudo journalctl -u pambaso-backend -f

# Check if backend is listening
sudo netstat -tlnp | grep 3001

# Test backend directly
curl -v http://localhost:3001/api/health
```

#### Frontend Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check if Nginx is listening
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Performance Optimization

#### Database Optimization

```sql
-- Connect to database
psql -U pambaso_user -d pambaso_db

-- Check database size
SELECT pg_size_pretty(pg_database_size('pambaso_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;

-- Update table statistics
ANALYZE;
```

#### System Optimization

```bash
# Optimize PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# For 4GB RAM server, adjust these settings:
# shared_buffers = 1GB
# effective_cache_size = 3GB
# work_mem = 8MB
# maintenance_work_mem = 256MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# random_page_cost = 1.1
# effective_io_concurrency = 200

# Restart PostgreSQL after changes
sudo systemctl restart postgresql
```

### Backup and Recovery

#### Database Recovery

```bash
# List available backups
ls -la /var/backups/postgresql/

# Restore from backup
./database/backups/restore.sh /var/backups/postgresql/pambaso_backup_20231201_020000.sql.gz
```

#### Application Recovery

```bash
# Restore from Git repository
cd /opt/pambaso
git fetch origin
git reset --hard origin/main

# Rebuild application
npm install
npm run build
npm run server:build

# Restart services
sudo systemctl restart pambaso-backend
sudo systemctl restart nginx
```

### Security Checklist

- [ ] Firewall configured and enabled
- [ ] SSH key-based authentication enabled
- [ ] Database password is strong and secure
- [ ] JWT secret is cryptographically secure
- [ ] SSL certificate is valid and auto-renewing
- [ ] Database access is restricted to localhost
- [ ] Application runs as non-root user
- [ ] Regular security updates are applied
- [ ] Backup system is working and tested
- [ ] Log monitoring is in place

### Support

For additional support:

1. Check application logs for specific error messages
2. Review this deployment guide for missed steps
3. Consult the project documentation
4. Contact the development team with specific error details

---

**Note**: Replace `yourdomain.com` with your actual domain name throughout this guide. Ensure all passwords and secrets are secure and unique for your deployment.