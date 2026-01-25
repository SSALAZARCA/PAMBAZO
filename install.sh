#!/bin/bash

# 🚀 Script de Instalación Automática - PAMBASO
# Este script automatiza la instalación completa en un servidor VPS Ubuntu

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se ejecuta como root o con sudo
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root. Usa un usuario con privilegios sudo."
   exit 1
fi

# Verificar sistema operativo
if [[ ! -f /etc/os-release ]]; then
    print_error "No se puede determinar el sistema operativo"
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" ]]; then
    print_warning "Este script está optimizado para Ubuntu. Puede que no funcione correctamente en $PRETTY_NAME"
    read -p "¿Deseas continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Variables de configuración
APP_DIR="/var/www/pambaso"
APP_USER="$USER"
DOMAIN=""
EMAIL=""
USE_DOCKER="y"
INSTALL_SSL="y"

# Función para solicitar información al usuario
get_user_input() {
    print_status "Configuración inicial"
    echo
    
    read -p "Dominio para la aplicación (ej: mi-restaurante.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        print_warning "No se especificó dominio. Se configurará para localhost"
        DOMAIN="localhost"
    fi
    
    if [[ "$DOMAIN" != "localhost" ]]; then
        read -p "Email para certificado SSL: " EMAIL
        if [[ -z "$EMAIL" ]]; then
            print_warning "No se especificó email. SSL no se configurará automáticamente"
            INSTALL_SSL="n"
        fi
    else
        INSTALL_SSL="n"
    fi
    
    read -p "¿Usar Docker para el despliegue? (Y/n): " -n 1 -r USE_DOCKER
    echo
    if [[ -z "$USE_DOCKER" ]]; then
        USE_DOCKER="y"
    fi
    
    echo
    print_status "Configuración:"
    echo "  - Dominio: $DOMAIN"
    echo "  - Email: $EMAIL"
    echo "  - Docker: $([[ $USE_DOCKER =~ ^[Yy]$ ]] && echo "Sí" || echo "No")"
    echo "  - SSL: $([[ $INSTALL_SSL =~ ^[Yy]$ ]] && echo "Sí" || echo "No")"
    echo
    
    read -p "¿Continuar con esta configuración? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_error "Instalación cancelada"
        exit 1
    fi
}

# Actualizar sistema
update_system() {
    print_status "Actualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common ufw
    print_success "Sistema actualizado"
}

# Configurar firewall
setup_firewall() {
    print_status "Configurando firewall..."
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_success "Firewall configurado"
}

# Instalar Docker
install_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker ya está instalado"
        return
    fi
    
    print_status "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    
    # Instalar Docker Compose
    print_status "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker instalado correctamente"
}

# Instalar Node.js y PM2
install_nodejs() {
    if command -v node &> /dev/null; then
        print_success "Node.js ya está instalado"
        return
    fi
    
    print_status "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_status "Instalando PM2..."
    sudo npm install -g pm2
    
    # Configurar PM2 para inicio automático
    pm2 startup | grep -E '^sudo' | bash
    
    print_success "Node.js y PM2 instalados"
}

# Instalar PostgreSQL
install_postgresql() {
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL ya está instalado"
        return
    fi
    
    print_status "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Generar password aleatorio
    DB_PASSWORD=$(openssl rand -base64 32)
    
    print_status "Configurando base de datos..."
    sudo -u postgres psql << EOF
CREATE DATABASE pambaso;
CREATE USER pambaso_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE pambaso TO pambaso_user;
\q
EOF
    
    echo "DB_PASSWORD=$DB_PASSWORD" >> ~/.pambaso_env
    print_success "PostgreSQL configurado. Password guardado en ~/.pambaso_env"
}

# Instalar Redis
install_redis() {
    if command -v redis-server &> /dev/null; then
        print_success "Redis ya está instalado"
        return
    fi
    
    print_status "Instalando Redis..."
    sudo apt install -y redis-server
    
    # Configurar password para Redis
    REDIS_PASSWORD=$(openssl rand -base64 32)
    sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
    
    sudo systemctl restart redis-server
    sudo systemctl enable redis-server
    
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> ~/.pambaso_env
    print_success "Redis configurado. Password guardado en ~/.pambaso_env"
}

# Instalar Nginx
install_nginx() {
    if command -v nginx &> /dev/null; then
        print_success "Nginx ya está instalado"
        return
    fi
    
    print_status "Instalando Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx instalado"
}

# Clonar repositorio
clone_repository() {
    print_status "Clonando repositorio..."
    
    if [[ -d "$APP_DIR" ]]; then
        print_warning "El directorio $APP_DIR ya existe"
        read -p "¿Deseas eliminarlo y clonar de nuevo? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo rm -rf "$APP_DIR"
        else
            print_error "Instalación cancelada"
            exit 1
        fi
    fi
    
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $APP_USER:$APP_USER "$APP_DIR"
    
    # Si el repositorio no existe, crear estructura básica
    if [[ ! -d ".git" ]]; then
        print_warning "No se detectó repositorio Git. Copiando archivos locales..."
        cp -r . "$APP_DIR/"
    else
        git clone . "$APP_DIR"
    fi
    
    cd "$APP_DIR"
    sudo chown -R $APP_USER:$APP_USER .
    
    print_success "Repositorio clonado en $APP_DIR"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    # Generar secrets
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    
    # Leer passwords guardados
    if [[ -f ~/.pambaso_env ]]; then
        source ~/.pambaso_env
    fi
    
    # Crear archivo .env
    cat > .env << EOF
# Aplicación
NODE_ENV=production
APP_PORT=3000
APP_URL=https://$DOMAIN
DOMAIN=$DOMAIN

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambaso
DB_USER=pambaso_user
DB_PASSWORD=${DB_PASSWORD:-changeme}

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD:-changeme}

# JWT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://$DOMAIN

# Otros
BCRYPT_ROUNDS=12
SESSION_SECRET=$(openssl rand -base64 32)
UPLOAD_MAX_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF
    
    print_success "Variables de entorno configuradas"
}

# Instalar dependencias de la aplicación
install_app_dependencies() {
    print_status "Instalando dependencias de la aplicación..."
    npm install --production
    
    print_status "Construyendo frontend..."
    npm run build
    
    print_success "Aplicación preparada"
}

# Inicializar base de datos
init_database() {
    print_status "Inicializando base de datos..."
    
    if [[ -f "migrations/001_init_database.sql" ]]; then
        PGPASSWORD=${DB_PASSWORD:-changeme} psql -h localhost -U pambaso_user -d pambaso -f migrations/001_init_database.sql
    fi
    
    if [[ -f "migrations/002_seed_data.sql" ]]; then
        PGPASSWORD=${DB_PASSWORD:-changeme} psql -h localhost -U pambaso_user -d pambaso -f migrations/002_seed_data.sql
    fi
    
    print_success "Base de datos inicializada"
}

# Configurar PM2
setup_pm2() {
    print_status "Configurando PM2..."
    
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    print_success "PM2 configurado"
}

# Configurar Nginx
setup_nginx() {
    print_status "Configurando Nginx..."
    
    # Crear configuración del sitio
    sudo tee /etc/nginx/sites-available/pambaso > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF
    
    # Habilitar sitio
    sudo ln -sf /etc/nginx/sites-available/pambaso /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar configuración
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_success "Nginx configurado"
}

# Instalar SSL con Let's Encrypt
install_ssl() {
    if [[ $INSTALL_SSL != "y" ]] || [[ "$DOMAIN" == "localhost" ]]; then
        print_warning "SSL no configurado"
        return
    fi
    
    print_status "Instalando certificado SSL..."
    
    # Instalar Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Obtener certificado
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    # Configurar renovación automática
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
    
    print_success "SSL configurado correctamente"
}

# Despliegue con Docker
deploy_with_docker() {
    print_status "Desplegando con Docker..."
    
    # Configurar variables para Docker
    cp .env.example .env.docker
    sed -i "s/localhost/$DOMAIN/g" .env.docker
    
    # Construir y ejecutar
    docker-compose up -d --build
    
    # Esperar a que los servicios estén listos
    sleep 30
    
    # Inicializar base de datos
    docker-compose exec -T postgres psql -U pambaso_user -d pambaso < migrations/001_init_database.sql
    docker-compose exec -T postgres psql -U pambaso_user -d pambaso < migrations/002_seed_data.sql
    
    print_success "Aplicación desplegada con Docker"
}

# Verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    # Verificar servicios
    if [[ $USE_DOCKER =~ ^[Yy]$ ]]; then
        if docker-compose ps | grep -q "Up"; then
            print_success "Servicios Docker ejecutándose correctamente"
        else
            print_error "Problemas con servicios Docker"
        fi
    else
        if pm2 list | grep -q "online"; then
            print_success "Aplicación ejecutándose con PM2"
        else
            print_error "Problemas con PM2"
        fi
    fi
    
    # Verificar Nginx
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx ejecutándose correctamente"
    else
        print_error "Problemas con Nginx"
    fi
    
    # Verificar conectividad
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
        print_success "Aplicación respondiendo correctamente"
    else
        print_warning "La aplicación puede no estar respondiendo correctamente"
    fi
    
    echo
    print_success "¡Instalación completada!"
    echo
    echo "Información importante:"
    echo "  - URL de la aplicación: http://$DOMAIN"
    if [[ $INSTALL_SSL == "y" ]]; then
        echo "  - URL segura: https://$DOMAIN"
    fi
    echo "  - Directorio de la aplicación: $APP_DIR"
    echo "  - Logs de la aplicación: ~/.pm2/logs/ (PM2) o docker-compose logs (Docker)"
    echo "  - Configuración: $APP_DIR/.env"
    echo
    echo "Credenciales por defecto:"
    echo "  - Admin: admin@pambaso.com / admin123"
    echo "  - Owner: owner@pambaso.com / owner123"
    echo
    print_warning "¡IMPORTANTE! Cambia las credenciales por defecto después del primer login"
}

# Función principal
main() {
    echo "🍞 PAMBASO - Instalación Automática"
    echo "===================================="
    echo
    
    get_user_input
    update_system
    setup_firewall
    
    if [[ $USE_DOCKER =~ ^[Yy]$ ]]; then
        install_docker
        clone_repository
        setup_environment
        deploy_with_docker
    else
        install_nodejs
        install_postgresql
        install_redis
        clone_repository
        setup_environment
        install_app_dependencies
        init_database
        setup_pm2
    fi
    
    install_nginx
    setup_nginx
    install_ssl
    verify_installation
    
    # Limpiar archivos temporales
    rm -f ~/.pambaso_env
    
    echo
    print_success "🎉 ¡PAMBASO instalado exitosamente!"
}

# Ejecutar instalación
main "$@"