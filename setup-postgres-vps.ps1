# Script para configurar PostgreSQL en el VPS
Write-Host "🔧 Configurando PostgreSQL en VPS para persistencia de usuarios..." -ForegroundColor Green

# Variables
$VPS_HOST = "31.97.128.11"
$VPS_USER = "root"
$PROJECT_PATH = "/var/www/pambazo"

# 1. Instalar PostgreSQL
Write-Host "`n📋 PASO 1: Instalando PostgreSQL..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "apt update"
ssh $VPS_USER@$VPS_HOST "apt install -y postgresql postgresql-contrib"

# 2. Iniciar PostgreSQL
Write-Host "`n🚀 PASO 2: Iniciando PostgreSQL..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "systemctl start postgresql"
ssh $VPS_USER@$VPS_HOST "systemctl enable postgresql"

# 3. Verificar estado
Write-Host "`n🔍 PASO 3: Verificando estado..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "systemctl status postgresql --no-pager"

# 4. Configurar base de datos
Write-Host "`n🗄️ PASO 4: Configurando base de datos..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "sudo -u postgres createdb pambaso_db"
ssh $VPS_USER@$VPS_HOST "sudo -u postgres createuser pambaso_user"
ssh $VPS_USER@$VPS_HOST "sudo -u postgres psql -c `"ALTER USER pambaso_user WITH ENCRYPTED PASSWORD 'pambaso123';`""
ssh $VPS_USER@$VPS_HOST "sudo -u postgres psql -c `"GRANT ALL PRIVILEGES ON DATABASE pambaso_db TO pambaso_user;`""

# 5. Crear archivo .env
Write-Host "`n🔧 PASO 5: Configurando variables de entorno..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cat > $PROJECT_PATH/.env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambaso_db
DB_USER=pambaso_user
DB_PASSWORD=pambaso123
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_2024
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://31.97.128.11,http://localhost:5173
EOF"

# 6. Crear migración SQL
Write-Host "`n📊 PASO 6: Creando migración..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cat > $PROJECT_PATH/migration_users.sql << 'EOF'
CREATE EXTENSION IF NOT EXISTS `"uuid-ossp`";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'owner', 'waiter', 'baker', 'employee', 'customer')),
    phone VARCHAR(20),
    address TEXT,
    avatar TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

INSERT INTO users (name, email, password, role, phone, address, is_active) VALUES 
('Administrador', 'admin@pambazo.com', '`$2b`$10`$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku', 'admin', '+57 300 123 4567', 'Oficina Principal', true),
('Luis Rodríguez', 'owner@pambazo.com', '`$2b`$10`$7eiseK8m9e7zrqDANwLz2uUGymm4zJRDU887phw.Z3S3LWyY/uBMu', 'owner', '+57 300 123 4567', 'Oficina Principal', true)
ON CONFLICT (email) DO NOTHING;

SELECT 'Tabla users creada correctamente' as status;
SELECT COUNT(*) as total_users FROM users;
EOF"

# 7. Ejecutar migración
Write-Host "`n🔄 PASO 7: Ejecutando migración..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cd $PROJECT_PATH && PGPASSWORD=pambaso123 psql -h localhost -U pambaso_user -d pambaso_db -f migration_users.sql"

# 8. Verificar conexión
Write-Host "`n🔍 PASO 8: Verificando conexión..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cd $PROJECT_PATH && PGPASSWORD=pambaso123 psql -h localhost -U pambaso_user -d pambaso_db -c `"SELECT COUNT(*) as total_users FROM users;`""

# 9. Compilar backend
Write-Host "`n🔨 PASO 9: Compilando backend..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cd $PROJECT_PATH && npm run build:backend"

# 10. Reiniciar servicios
Write-Host "`n🔄 PASO 10: Reiniciando servicios..." -ForegroundColor Magenta
ssh $VPS_USER@$VPS_HOST "cd $PROJECT_PATH && pm2 restart all"

Write-Host "`n🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "🔗 Aplicación: http://$VPS_HOST" -ForegroundColor Cyan