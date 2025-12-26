# 🚀 GUÍA DE DESPLIEGUE - PROYECTO PAMBAZO 2.1

## 📋 Tabla de Contenidos
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Variables de Entorno](#variables-de-entorno)
6. [Comandos de Ejecución](#comandos-de-ejecución)
7. [Verificación del Sistema](#verificación-del-sistema)
8. [Despliegue en Producción](#despliegue-en-producción)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🖥️ 1. Requisitos del Sistema

### Requisitos Mínimos
- **Node.js**: 18.0.0 o superior
- **npm**: 9.0.0 o superior
- **PostgreSQL**: 13.0 o superior
- **RAM**: 2GB mínimo, 4GB recomendado
- **Almacenamiento**: 1GB libre
- **Sistema Operativo**: Windows 10+, macOS 10.15+, Ubuntu 20.04+

### Verificar Requisitos
```bash
# Verificar versión de Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar versión de npm
npm --version
# Debe mostrar: 9.x.x o superior

# Verificar PostgreSQL
psql --version
# Debe mostrar: psql (PostgreSQL) 13.x o superior
```

---

## ⚙️ 2. Configuración del Entorno

### Clonar o Descargar el Proyecto
```bash
# Si tienes el proyecto en Git
git clone <repository-url>
cd PAMBASO-2.1

# O si tienes el archivo comprimido
# Extraer y navegar al directorio
cd "PAMBASO 2.1"
```

### Estructura de Directorios Esperada
```
PAMBASO 2.1/
├── package.json
├── api-server-complete.cjs
├── api-server-websocket.cjs
├── api-server-secure.cjs
├── test-final-complete.cjs
├── .env.example
├── database/
├── migrations/
└── logs/
```

---

## 📦 3. Instalación de Dependencias

### Instalar Dependencias del Proyecto
```bash
# Instalar todas las dependencias
npm install

# Si hay problemas, limpiar e instalar
npm run clean
npm install

# Verificar instalación
npm list --depth=0
```

### Dependencias Principales Instaladas
```json
{
  "express": "^4.21.2",
  "socket.io": "^4.8.1",
  "pg": "^8.16.3",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "helmet": "^8.0.0",
  "cors": "^2.8.5",
  "winston": "^3.11.0",
  "joi": "^17.13.3"
}
```

---

## 🗄️ 4. Configuración de Base de Datos

### Opción A: PostgreSQL Local (Recomendado para Producción)

#### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Descargar desde: https://www.postgresql.org/download/windows/
```

#### Crear Base de Datos
```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE pambazo;
CREATE USER pambazo_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE pambazo TO pambazo_user;
\q
```

#### Ejecutar Migraciones
```bash
# Ejecutar migraciones automáticamente
npm run migrate

# O manualmente
psql -U pambazo_user -d pambazo -f migrations/001_create_new_schema_reestructured.sql
psql -U pambazo_user -d pambazo -f migrations/002_create_triggers_functions.sql
```

### Opción B: Usar Datos Mock (Desarrollo)
```bash
# El sistema puede funcionar con datos simulados
# No requiere PostgreSQL real
# Útil para desarrollo y pruebas rápidas
```

---

## 🔐 5. Variables de Entorno

### Crear Archivo .env
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus configuraciones
nano .env
```

### Configuración Completa .env
```bash
# === CONFIGURACIÓN DE BASE DE DATOS ===
DATABASE_URL=postgresql://pambazo_user:tu_password_seguro@localhost:5432/pambazo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambazo
DB_USER=pambazo_user
DB_PASSWORD=tu_password_seguro

# === CONFIGURACIÓN DE AUTENTICACIÓN ===
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_minimo_32_caracteres
JWT_EXPIRES_IN=24h

# === CONFIGURACIÓN DEL SERVIDOR ===
NODE_ENV=development
PORT=3001
WEBSOCKET_PORT=3001
SECURITY_PORT=3002

# === CONFIGURACIÓN DE CORS ===
CORS_ORIGIN=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# === CONFIGURACIÓN DE RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5

# === CONFIGURACIÓN DE LOGGING ===
LOG_LEVEL=info
LOG_FILE_MAX_SIZE=20m
LOG_FILE_MAX_FILES=14d

# === CONFIGURACIÓN DE SEGURIDAD ===
BCRYPT_ROUNDS=12
SESSION_SECRET=otro_secret_muy_seguro_para_sesiones

# === CONFIGURACIÓN DE PRODUCCIÓN (opcional) ===
# SSL_CERT_PATH=/path/to/cert.pem
# SSL_KEY_PATH=/path/to/key.pem
# REDIS_URL=redis://localhost:6379
```

### Variables de Entorno para Producción
```bash
# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@production-db:5432/pambazo
JWT_SECRET=production_jwt_secret_super_seguro
CORS_ORIGIN=https://tu-dominio.com
LOG_LEVEL=warn
```

---

## 🚀 6. Comandos de Ejecución

### Comandos Principales
```bash
# === DESARROLLO ===
# Ejecutar API completa (recomendado)
npm run server:dev
# o directamente:
node api-server-complete.cjs

# Ejecutar con WebSockets
npm run server:websocket
# o directamente:
node api-server-websocket.cjs

# Ejecutar servidor seguro
npm run server:secure
# o directamente:
node api-server-secure.cjs

# === FRONTEND ===
# Ejecutar frontend React
npm run client:dev

# Ejecutar frontend y backend juntos
npm run dev

# === TESTING ===
# Ejecutar test completo
npm run test:final
# o directamente:
node test-final-complete.cjs

# Test de seguridad
npm run security:test

# === PRODUCCIÓN ===
# Build para producción
npm run build

# Ejecutar en producción
npm run server:start
```

### Scripts Útiles
```bash
# Verificar estado de la base de datos
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'Error DB:' + err : 'DB OK:' + res.rows[0].now);
  pool.end();
});
"

# Generar hash de contraseña
node -e "
const bcrypt = require('bcrypt');
const password = 'tu_password';
bcrypt.hash(password, 12, (err, hash) => {
  console.log('Hash:', hash);
});
"
```

---

## ✅ 7. Verificación del Sistema

### Test de Conectividad
```bash
# 1. Verificar que el servidor inicie
node api-server-complete.cjs
# Debe mostrar: "🚀 Servidor iniciado en puerto 3001"

# 2. Test de health check
curl http://localhost:3001/api/v1/health
# Debe responder: {"status":"ok","timestamp":"..."}

# 3. Test de login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pambazo.com","password":"admin123"}'
# Debe responder con token JWT

# 4. Ejecutar test completo
npm run test:final
```

### Verificar Logs
```bash
# Ver logs en tiempo real
tail -f logs/combined-$(date +%Y-%m-%d).log

# Ver logs de errores
tail -f logs/error-$(date +%Y-%m-%d).log

# Ver logs de seguridad
tail -f logs/security-$(date +%Y-%m-%d).log
```

### Verificar Base de Datos
```bash
# Conectar a la base de datos
psql -U pambazo_user -d pambazo

# Verificar tablas
\dt

# Verificar datos
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;

# Salir
\q
```

---

## 🌐 8. Despliegue en Producción

### Preparación para Producción
```bash
# 1. Crear archivo de configuración de producción
cp .env.example .env.production

# 2. Configurar variables de producción
nano .env.production

# 3. Instalar dependencias de producción
npm ci --only=production

# 4. Ejecutar migraciones en producción
NODE_ENV=production npm run migrate
```

### Usando PM2 (Recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'pambazo-api',
      script: 'api-server-complete.cjs',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log'
    }
  ]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Ver estado
pm2 status

# Ver logs
pm2 logs pambazo-api

# Reiniciar
pm2 restart pambazo-api

# Parar
pm2 stop pambazo-api
```

### Usando Docker
```bash
# Crear Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "api-server-complete.cjs"]
EOF

# Construir imagen
docker build -t pambazo-api .

# Ejecutar contenedor
docker run -d \
  --name pambazo-api \
  -p 3001:3001 \
  --env-file .env.production \
  pambazo-api

# Ver logs
docker logs pambazo-api

# Parar contenedor
docker stop pambazo-api
```

### Configuración de Nginx
```nginx
# /etc/nginx/sites-available/pambazo
server {
    listen 80;
    server_name tu-dominio.com;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/pambazo/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/pambazo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 9. Monitoreo y Logs

### Configuración de Logs
```javascript
// Los logs se generan automáticamente en:
logs/
├── combined-YYYY-MM-DD.log    // Todos los logs
├── error-YYYY-MM-DD.log       // Solo errores
└── security-YYYY-MM-DD.log    // Eventos de seguridad
```

### Comandos de Monitoreo
```bash
# Ver logs en tiempo real
tail -f logs/combined-$(date +%Y-%m-%d).log

# Buscar errores específicos
grep "ERROR" logs/error-$(date +%Y-%m-%d).log

# Monitorear conexiones
grep "connected" logs/combined-$(date +%Y-%m-%d).log

# Ver estadísticas de requests
grep "GET\|POST\|PUT\|DELETE" logs/combined-$(date +%Y-%m-%d).log | wc -l
```

### Métricas del Sistema
```bash
# Uso de memoria
ps aux | grep node

# Conexiones de red
netstat -tulpn | grep :3001

# Espacio en disco
df -h

# Procesos de Node.js
pgrep -f node
```

---

## 🔧 10. Solución de Problemas

### Problemas Comunes

#### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -U pambazo_user -d pambazo -c "SELECT 1;"

# Verificar variables de entorno
echo $DATABASE_URL
```

#### Error: "Port 3001 already in use"
```bash
# Encontrar proceso usando el puerto
lsof -i :3001
# o en Windows:
netstat -ano | findstr :3001

# Terminar proceso
kill -9 <PID>
# o en Windows:
taskkill /PID <PID> /F
```

#### Error: "JWT token invalid"
```bash
# Verificar JWT_SECRET en .env
grep JWT_SECRET .env

# Regenerar token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pambazo.com","password":"admin123"}'
```

#### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node.js
node --version
```

### Logs de Debugging
```bash
# Habilitar logs de debug
DEBUG=* node api-server-complete.cjs

# Solo logs de Express
DEBUG=express:* node api-server-complete.cjs

# Solo logs de Socket.io
DEBUG=socket.io:* node api-server-websocket.cjs
```

### Comandos de Diagnóstico
```bash
# Test completo del sistema
npm run test:final

# Verificar configuración
node -e "console.log(process.env)" | grep -E "(DATABASE|JWT|PORT)"

# Test de conectividad de red
curl -I http://localhost:3001/api/v1/health

# Verificar permisos de archivos
ls -la logs/
ls -la .env
```

---

## 📞 Soporte y Contacto

### Información del Proyecto
- **Nombre**: PAMBAZO 2.1
- **Versión**: 1.0.0
- **Documentación**: `.trae/documents/`
- **Logs**: `logs/`

### Comandos de Emergencia
```bash
# Parar todos los procesos de Node.js
pkill -f node

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Limpiar logs antiguos
find logs/ -name "*.log" -mtime +30 -delete

# Backup de base de datos
pg_dump -U pambazo_user pambazo > backup_$(date +%Y%m%d).sql
```

---

*Guía de despliegue generada para el proyecto PAMBAZO 2.1 - Sistema de gestión para restaurante*