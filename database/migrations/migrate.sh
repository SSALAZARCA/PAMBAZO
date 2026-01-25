#!/bin/bash

# Database Migration Script for PAMBASO Restaurant Management System
# This script applies database migrations to PostgreSQL

set -e

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="pambaso_db"
DB_USER="pambaso_user"
DB_PASSWORD=""
MIGRATIONS_DIR="$(dirname "$0")"
MIGRATIONS_TABLE="schema_migrations"
LOG_FILE="/var/log/pambaso-migrations.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$message"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo -e "${RED}$message${NC}" >&2
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_warning() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_info() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  migrate                 Apply all pending migrations (default)"
    echo "  rollback [VERSION]      Rollback to specific version"
    echo "  status                  Show migration status"
    echo "  create NAME             Create new migration file"
    echo "  reset                   Reset database (WARNING: destroys all data)"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -H, --host HOST         Database host (default: localhost)"
    echo "  -P, --port PORT         Database port (default: 5432)"
    echo "  -d, --database NAME     Database name (default: pambaso_db)"
    echo "  -u, --user USER         Database user (default: pambaso_user)"
    echo "  -p, --password PASS     Database password (will prompt if not provided)"
    echo "  -f, --force             Force operation without confirmation"
    echo "  -v, --verbose           Verbose output"
    echo "  --dry-run               Show what would be done without executing"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Apply all pending migrations"
    echo "  $0 status                             # Show migration status"
    echo "  $0 create add_user_roles              # Create new migration"
    echo "  $0 rollback 20231201_120000           # Rollback to specific version"
    echo "  $0 -H db.example.com -p mypass migrate # Migrate remote database"
}

# Get database connection string
get_connection_string() {
    echo "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."
    
    if ! command -v psql &> /dev/null; then
        log_error "psql command not found. Please install PostgreSQL client."
        exit 1
    fi
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
        log_error "Cannot connect to database. Please check your connection parameters."
        exit 1
    fi
    
    log_success "Database connection successful"
}

# Create migrations table if it doesn't exist
create_migrations_table() {
    log_info "Creating migrations table if not exists..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_migrations_version ON $MIGRATIONS_TABLE(version);
EOF
    
    log_success "Migrations table ready"
}

# Get applied migrations
get_applied_migrations() {
    export PGPASSWORD="$DB_PASSWORD"
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT version FROM $MIGRATIONS_TABLE ORDER BY version;"
}

# Get pending migrations
get_pending_migrations() {
    local applied_migrations
    applied_migrations=$(get_applied_migrations | tr -d ' ' | grep -v '^$')
    
    local all_migrations
    all_migrations=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort | while read -r file; do
        basename "$file" .sql
    done)
    
    # Find migrations not in applied list
    echo "$all_migrations" | while read -r migration; do
        if [ -n "$migration" ] && ! echo "$applied_migrations" | grep -q "^$migration$"; then
            echo "$migration"
        fi
    done
}

# Calculate file checksum
calculate_checksum() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        # Fallback to md5
        md5sum "$file" | cut -d' ' -f1
    fi
}

# Apply single migration
apply_migration() {
    local migration_file="$1"
    local migration_name
    migration_name=$(basename "$migration_file" .sql)
    
    log_info "Applying migration: $migration_name"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would apply: $migration_file"
        return 0
    fi
    
    local checksum
    checksum=$(calculate_checksum "$migration_file")
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Start transaction and apply migration
    {
        echo "BEGIN;"
        cat "$migration_file"
        echo ""
        echo "INSERT INTO $MIGRATIONS_TABLE (version, filename, checksum) VALUES ('$migration_name', '$(basename "$migration_file")', '$checksum');"
        echo "COMMIT;"
    } | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
    
    if [ $? -eq 0 ]; then
        log_success "Migration applied: $migration_name"
    else
        log_error "Failed to apply migration: $migration_name"
        exit 1
    fi
}

# Apply all pending migrations
migrate() {
    log "=== Starting Database Migration ==="
    
    test_connection
    create_migrations_table
    
    local pending_migrations
    pending_migrations=$(get_pending_migrations)
    
    if [ -z "$pending_migrations" ]; then
        log_success "No pending migrations found. Database is up to date."
        return 0
    fi
    
    log_info "Found pending migrations:"
    echo "$pending_migrations" | while read -r migration; do
        log_info "  - $migration"
    done
    
    if [ "$FORCE" != true ] && [ "$DRY_RUN" != true ]; then
        echo ""
        read -p "Apply these migrations? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Migration cancelled"
            exit 0
        fi
    fi
    
    # Apply each migration
    echo "$pending_migrations" | while read -r migration; do
        if [ -n "$migration" ]; then
            local migration_file="$MIGRATIONS_DIR/$migration.sql"
            if [ -f "$migration_file" ]; then
                apply_migration "$migration_file"
            else
                log_error "Migration file not found: $migration_file"
                exit 1
            fi
        fi
    done
    
    log_success "=== Migration Completed ==="
}

# Show migration status
show_status() {
    log "=== Migration Status ==="
    
    test_connection
    create_migrations_table
    
    local applied_migrations
    applied_migrations=$(get_applied_migrations | tr -d ' ' | grep -v '^$')
    
    local pending_migrations
    pending_migrations=$(get_pending_migrations)
    
    echo ""
    log_info "Applied Migrations:"
    if [ -n "$applied_migrations" ]; then
        echo "$applied_migrations" | while read -r migration; do
            if [ -n "$migration" ]; then
                log_info "  ✓ $migration"
            fi
        done
    else
        log_info "  (none)"
    fi
    
    echo ""
    log_info "Pending Migrations:"
    if [ -n "$pending_migrations" ]; then
        echo "$pending_migrations" | while read -r migration; do
            if [ -n "$migration" ]; then
                log_warning "  ⏳ $migration"
            fi
        done
    else
        log_success "  (none - database is up to date)"
    fi
    echo ""
}

# Create new migration file
create_migration() {
    local migration_name="$1"
    
    if [ -z "$migration_name" ]; then
        log_error "Migration name is required"
        show_usage
        exit 1
    fi
    
    # Generate timestamp
    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    
    # Create filename
    local filename="${timestamp}_${migration_name}.sql"
    local filepath="$MIGRATIONS_DIR/$filename"
    
    # Create migration file
    cat > "$filepath" << EOF
-- Migration: $migration_name
-- Created: $(date)
-- Description: [Add description here]

-- Up Migration
BEGIN;

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

COMMIT;

-- Down Migration (for rollback - not automatically executed)
-- BEGIN;
-- DROP TABLE IF EXISTS example;
-- COMMIT;
EOF
    
    log_success "Migration created: $filepath"
    log_info "Please edit the file to add your migration SQL"
}

# Reset database (WARNING: destroys all data)
reset_database() {
    log_warning "=== Database Reset ==="
    log_warning "This will destroy ALL data in the database!"
    
    if [ "$FORCE" != true ]; then
        echo ""
        read -p "Are you absolutely sure? Type 'yes' to continue: " -r
        if [ "$REPLY" != "yes" ]; then
            log "Reset cancelled"
            exit 0
        fi
    fi
    
    test_connection
    
    log_info "Dropping all tables..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Drop all tables
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argtypes FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;
EOF
    
    log_success "Database reset completed"
    log_info "Run 'migrate' to apply all migrations from scratch"
}

# Rollback to specific version
rollback() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        log_error "Target version is required for rollback"
        show_usage
        exit 1
    fi
    
    log_warning "=== Database Rollback ==="
    log_warning "Rollback functionality is not implemented yet."
    log_warning "This would require down migrations in each migration file."
    log_info "For now, use 'reset' command and then 'migrate' to specific version."
    exit 1
}

# Main function
main() {
    local command="migrate"
    local force=false
    local verbose=false
    local dry_run=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -H|--host)
                DB_HOST="$2"
                shift 2
                ;;
            -P|--port)
                DB_PORT="$2"
                shift 2
                ;;
            -d|--database)
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
            -f|--force)
                force=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            migrate|status|reset)
                command="$1"
                shift
                ;;
            create)
                command="create"
                shift
                if [[ $# -gt 0 && ! $1 =~ ^- ]]; then
                    migration_name="$1"
                    shift
                fi
                ;;
            rollback)
                command="rollback"
                shift
                if [[ $# -gt 0 && ! $1 =~ ^- ]]; then
                    target_version="$1"
                    shift
                fi
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
    
    # Set global variables
    FORCE=$force
    VERBOSE=$verbose
    DRY_RUN=$dry_run
    
    # Prompt for password if not provided
    if [ -z "$DB_PASSWORD" ]; then
        echo -n "Enter database password for user '$DB_USER': "
        read -s DB_PASSWORD
        echo
        
        if [ -z "$DB_PASSWORD" ]; then
            log_error "Password cannot be empty"
            exit 1
        fi
    fi
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Execute command
    case $command in
        migrate)
            migrate
            ;;
        status)
            show_status
            ;;
        create)
            create_migration "$migration_name"
            ;;
        rollback)
            rollback "$target_version"
            ;;
        reset)
            reset_database
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_error "Migration interrupted"; exit 1' INT TERM

# Run main function
main "$@"