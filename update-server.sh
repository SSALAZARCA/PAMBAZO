#!/bin/bash

# Script para actualizar la configuración del backend en el servidor

# Crear directorio para el backend si no existe
mkdir -p /var/www/html/api

# Crear archivo .env con la configuración correcta
cat > /var/www/html/api/.env << 'EOF'
# Production PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambaso_db
DB_USER=postgres
DB_PASSWORD=your_secure_production_password

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://31.97.128.11

# SSL Configuration (for production)
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/pambaso/app.log

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Pool Configuration
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
EOF

# Reiniciar el servicio del backend si está corriendo
if pgrep -f "node.*server" > /dev/null; then
    echo "Reiniciando el backend..."
    pkill -f "node.*server"
    sleep 2
fi

echo "Configuración actualizada exitosamente"
echo "CORS_ORIGIN configurado para: http://31.97.128.11"