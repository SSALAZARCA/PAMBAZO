#!/bin/bash

# PostgreSQL Installation Script for VPS
# This script installs and configures PostgreSQL for PAMBASO Restaurant Management System

set -e

# Configuration
PG_VERSION="15"
DB_NAME="pambaso_db"
DB_USER="pambaso_user"
DB_PASSWORD=""
PG_PORT="5432"
PG_DATA_DIR="/var/lib/postgresql/data"
BACKUP_DIR="/var/backups/postgresql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}ERROR: $1${NC}" >&2
}

log_success() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}WARNING: $1${NC}"
}

log_info() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${BLUE}INFO: $1${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -v, --version VERSION   PostgreSQL version to install (default: 15)"
    echo "  -d, --dbname NAME       Database name (default: pambaso_db)"
    echo "  -u, --user USER         Database user (default: pambaso_user)"
    echo "  -p, --password PASS     Database password (will prompt if not provided)"
    echo "  -P, --port PORT         PostgreSQL port (default: 5432)"
    echo "  --data-dir DIR          PostgreSQL data directory (default: /var/lib/postgresql/data)"
    echo "  --backup-dir DIR        Backup directory (default: /var/backups/postgresql)"
    echo "  --uninstall             Uninstall PostgreSQL and remove data"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Install with defaults"
    echo "  $0 -p mypassword                      # Install with specific password"
    echo "  $0 -v 14 -d myapp_db -u myapp_user    # Install with custom settings"
    echo "  $0 --uninstall                       # Uninstall PostgreSQL"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        log_error "Cannot detect operating system"
        exit 1
    fi
    
    log_info "Detected OS: $OS $OS_VERSION"
}

# Install PostgreSQL on Ubuntu/Debian
install_postgresql_debian() {
    log "Installing PostgreSQL on Debian/Ubuntu..."
    
    # Update package list
    apt-get update
    
    # Install required packages
    apt-get install -y wget ca-certificates
    
    # Add PostgreSQL official repository
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    
    # Update package list again
    apt-get update
    
    # Install PostgreSQL
    apt-get install -y postgresql-$PG_VERSION postgresql-client-$PG_VERSION postgresql-contrib-$PG_VERSION
    
    log_success "PostgreSQL $PG_VERSION installed successfully"
}

# Install PostgreSQL on CentOS/RHEL/Rocky
install_postgresql_rhel() {
    log "Installing PostgreSQL on RHEL/CentOS/Rocky..."
    
    # Install EPEL repository
    yum install -y epel-release
    
    # Install PostgreSQL repository
    yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm
    
    # Install PostgreSQL
    yum install -y postgresql${PG_VERSION}-server postgresql${PG_VERSION} postgresql${PG_VERSION}-contrib
    
    # Initialize database
    /usr/pgsql-${PG_VERSION}/bin/postgresql-${PG_VERSION}-setup initdb
    
    log_success "PostgreSQL $PG_VERSION installed successfully"
}

# Configure PostgreSQL
configure_postgresql() {
    log "Configuring PostgreSQL..."
    
    # Find PostgreSQL configuration directory
    local pg_config_dir
    if [ -d "/etc/postgresql/$PG_VERSION/main" ]; then
        pg_config_dir="/etc/postgresql/$PG_VERSION/main"
    elif [ -d "/var/lib/pgsql/$PG_VERSION/data" ]; then
        pg_config_dir="/var/lib/pgsql/$PG_VERSION/data"
    else
        log_error "Cannot find PostgreSQL configuration directory"
        exit 1
    fi
    
    # Backup original configuration files
    cp "$pg_config_dir/postgresql.conf" "$pg_config_dir/postgresql.conf.backup"
    cp "$pg_config_dir/pg_hba.conf" "$pg_config_dir/pg_hba.conf.backup"
    
    # Configure postgresql.conf
    cat >> "$pg_config_dir/postgresql.conf" << EOF

# PAMBASO Configuration
listen_addresses = '*'
port = $PG_PORT
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'ddl'

# Security
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
password_encryption = scram-sha-256
EOF
    
    # Configure pg_hba.conf for security
    cat > "$pg_config_dir/pg_hba.conf" << EOF
# PostgreSQL Client Authentication Configuration File
# PAMBASO Restaurant Management System

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             postgres                                peer
local   all             all                                     scram-sha-256

# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
host    $DB_NAME        $DB_USER        127.0.0.1/32            scram-sha-256

# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256

# Allow connections from Docker network (adjust as needed)
host    $DB_NAME        $DB_USER        172.16.0.0/12           scram-sha-256
host    $DB_NAME        $DB_USER        192.168.0.0/16          scram-sha-256

# Allow connections from specific IP ranges (uncomment and modify as needed)
# host    $DB_NAME        $DB_USER        10.0.0.0/8              scram-sha-256
EOF
    
    log_success "PostgreSQL configuration updated"
}

# Start and enable PostgreSQL service
start_postgresql() {
    log "Starting PostgreSQL service..."
    
    if command -v systemctl &> /dev/null; then
        systemctl enable postgresql
        systemctl start postgresql
        systemctl status postgresql --no-pager
    elif command -v service &> /dev/null; then
        service postgresql start
        chkconfig postgresql on
    else
        log_error "Cannot start PostgreSQL service (no systemctl or service command found)"
        exit 1
    fi
    
    log_success "PostgreSQL service started and enabled"
}

# Create database and user
setup_database() {
    log "Setting up database and user..."
    
    # Prompt for password if not provided
    if [ -z "$DB_PASSWORD" ]; then
        echo -n "Enter password for database user '$DB_USER': "
        read -s DB_PASSWORD
        echo
        
        if [ -z "$DB_PASSWORD" ]; then
            log_error "Password cannot be empty"
            exit 1
        fi
    fi
    
    # Create user and database
    sudo -u postgres psql << EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\q
EOF
    
    log_success "Database '$DB_NAME' and user '$DB_USER' created successfully"
}

# Create backup directory and scripts
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    chown postgres:postgres "$BACKUP_DIR"
    chmod 750 "$BACKUP_DIR"
    
    # Create backup script
    cat > "/usr/local/bin/pambaso-backup" << 'EOF'
#!/bin/bash
# PAMBASO Database Backup Script

DB_NAME="pambaso_db"
DB_USER="pambaso_user"
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pambaso_backup_$TIMESTAMP.sql"

# Create backup
sudo -u postgres pg_dump -d "$DB_NAME" -f "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "pambaso_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF
    
    chmod +x "/usr/local/bin/pambaso-backup"
    
    # Create daily backup cron job
    echo "0 2 * * * root /usr/local/bin/pambaso-backup" > /etc/cron.d/pambaso-backup
    
    log_success "Backup system configured"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian with UFW
        ufw allow $PG_PORT/tcp comment "PostgreSQL"
        log_success "UFW firewall rule added for port $PG_PORT"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL with firewalld
        firewall-cmd --permanent --add-port=$PG_PORT/tcp
        firewall-cmd --reload
        log_success "Firewalld rule added for port $PG_PORT"
    else
        log_warning "No supported firewall found. Please manually open port $PG_PORT"
    fi
}

# Show installation summary
show_summary() {
    log_success "=== PostgreSQL Installation Completed ==="
    echo ""
    log_info "Database Information:"
    log_info "  Host: localhost"
    log_info "  Port: $PG_PORT"
    log_info "  Database: $DB_NAME"
    log_info "  User: $DB_USER"
    log_info "  Password: [hidden]"
    echo ""
    log_info "Connection string:"
    log_info "  postgresql://$DB_USER:[password]@localhost:$PG_PORT/$DB_NAME"
    echo ""
    log_info "Useful commands:"
    log_info "  Connect to database: sudo -u postgres psql -d $DB_NAME"
    log_info "  Check service status: systemctl status postgresql"
    log_info "  View logs: journalctl -u postgresql"
    log_info "  Create backup: /usr/local/bin/pambaso-backup"
    echo ""
    log_info "Configuration files:"
    log_info "  Main config: /etc/postgresql/$PG_VERSION/main/postgresql.conf"
    log_info "  Access config: /etc/postgresql/$PG_VERSION/main/pg_hba.conf"
    log_info "  Backup directory: $BACKUP_DIR"
    echo ""
}

# Uninstall PostgreSQL
uninstall_postgresql() {
    log_warning "=== Uninstalling PostgreSQL ==="
    
    read -p "This will remove PostgreSQL and ALL data. Are you sure? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Uninstall cancelled"
        exit 0
    fi
    
    # Stop service
    systemctl stop postgresql || true
    systemctl disable postgresql || true
    
    # Remove packages
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get remove --purge -y postgresql-* postgresql-client-* postgresql-contrib-*
        apt-get autoremove -y
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
        yum remove -y postgresql*
    fi
    
    # Remove data and configuration
    rm -rf /var/lib/postgresql
    rm -rf /etc/postgresql
    rm -rf "$BACKUP_DIR"
    rm -f /usr/local/bin/pambaso-backup
    rm -f /etc/cron.d/pambaso-backup
    
    # Remove user
    userdel postgres || true
    groupdel postgres || true
    
    log_success "PostgreSQL uninstalled successfully"
}

# Main installation function
main() {
    local uninstall=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--version)
                PG_VERSION="$2"
                shift 2
                ;;
            -d|--dbname)
                DB_NAME="$2"
                shift 2
                ;;
            -u|--user)
                DB_USER="$2"
                shift 2
                ;;
            -p|--password)
                DB_PASSWORD="$2"
                shift 2
                ;;
            -P|--port)
                PG_PORT="$2"
                shift 2
                ;;
            --data-dir)
                PG_DATA_DIR="$2"
                shift 2
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --uninstall)
                uninstall=true
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                log_error "Unexpected argument: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if running as root
    check_root
    
    # Detect operating system
    detect_os
    
    # Handle uninstall
    if [ "$uninstall" = true ]; then
        uninstall_postgresql
        exit 0
    fi
    
    log "=== PostgreSQL Installation Started ==="
    log_info "Version: $PG_VERSION"
    log_info "Database: $DB_NAME"
    log_info "User: $DB_USER"
    log_info "Port: $PG_PORT"
    
    # Install PostgreSQL based on OS
    case $OS in
        ubuntu|debian)
            install_postgresql_debian
            ;;
        centos|rhel|rocky)
            install_postgresql_rhel
            ;;
        *)
            log_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
    
    # Configure PostgreSQL
    configure_postgresql
    
    # Start PostgreSQL service
    start_postgresql
    
    # Setup database and user
    setup_database
    
    # Setup backup system
    setup_backup
    
    # Configure firewall
    configure_firewall
    
    # Show summary
    show_summary
}

# Handle script interruption
trap 'log_error "Installation interrupted"; exit 1' INT TERM

# Run main function
main "$@"