#!/bin/bash

# PostgreSQL Restore Script for PAMBASO Restaurant Management System
# This script restores the PostgreSQL database from a backup file

set -e

# Configuration
DB_NAME="${DB_NAME:-pambaso_db}"
DB_USER="${DB_USER:-pambaso_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="/backups"

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
    echo "Usage: $0 [OPTIONS] <backup_file>"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -f, --force             Force restore without confirmation"
    echo "  -l, --list              List available backup files"
    echo "  -d, --download <s3_key> Download backup from S3 before restore"
    echo ""
    echo "Examples:"
    echo "  $0 /backups/pambaso_backup_20231201_120000.sql.gz"
    echo "  $0 --list"
    echo "  $0 --force /backups/pambaso_backup_20231201_120000.sql.gz"
    echo "  $0 --download backups/pambaso_backup_20231201_120000.sql.gz"
}

# Check if required tools are available
check_dependencies() {
    if ! command -v psql &> /dev/null; then
        log_error "psql is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v gunzip &> /dev/null; then
        log_error "gunzip is not installed or not in PATH"
        exit 1
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    if ! PGPASSWORD="$PGPASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
        log_error "Cannot connect to database server on $DB_HOST:$DB_PORT"
        exit 1
    fi
    log_success "Database connection successful"
}

# List available backup files
list_backups() {
    log_info "Available backup files in $BACKUP_DIR:"
    
    if [ -d "$BACKUP_DIR" ]; then
        # List backup files with details
        find "$BACKUP_DIR" -name "pambaso_backup_*.sql.gz" -type f -exec ls -lh {} \; 2>/dev/null | \
        awk '{print $9 " (" $5 ", " $6 " " $7 " " $8 ")"}' | \
        sort -r
        
        # Count total backups
        BACKUP_COUNT=$(find "$BACKUP_DIR" -name "pambaso_backup_*.sql.gz" -type f 2>/dev/null | wc -l)
        log_info "Total backups found: $BACKUP_COUNT"
    else
        log_warning "Backup directory not found: $BACKUP_DIR"
    fi
}

# Download backup from S3
download_from_s3() {
    local s3_key="$1"
    local local_file="$BACKUP_DIR/$(basename "$s3_key")"
    
    if [ -z "${BACKUP_S3_BUCKET:-}" ]; then
        log_error "BACKUP_S3_BUCKET environment variable not set"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed or not in PATH"
        exit 1
    fi
    
    log "Downloading backup from S3..."
    log "S3 location: s3://$BACKUP_S3_BUCKET/$s3_key"
    log "Local file: $local_file"
    
    if aws s3 cp "s3://$BACKUP_S3_BUCKET/$s3_key" "$local_file"; then
        log_success "Backup downloaded successfully"
        echo "$local_file"
    else
        log_error "Failed to download backup from S3"
        exit 1
    fi
}

# Validate backup file
validate_backup_file() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Check if file is compressed
    if [[ "$backup_file" == *.gz ]]; then
        log "Validating compressed backup file..."
        if ! gunzip -t "$backup_file" 2>/dev/null; then
            log_error "Invalid or corrupted compressed backup file"
            exit 1
        fi
    else
        log "Validating uncompressed backup file..."
        if ! head -n 1 "$backup_file" | grep -q "PostgreSQL database dump" 2>/dev/null; then
            log_error "File does not appear to be a valid PostgreSQL backup"
            exit 1
        fi
    fi
    
    # Get file size
    local file_size=$(du -h "$backup_file" | cut -f1)
    log_success "Backup file validation successful (Size: $file_size)"
}

# Create database backup before restore
create_pre_restore_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local pre_backup_file="$BACKUP_DIR/pre_restore_backup_${timestamp}.sql.gz"
    
    log "Creating backup before restore..."
    
    if PGPASSWORD="$PGPASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --no-owner \
        --no-privileges \
        2>/dev/null | gzip > "$pre_backup_file"; then
        
        log_success "Pre-restore backup created: $pre_backup_file"
        return 0
    else
        log_warning "Failed to create pre-restore backup (database might not exist)"
        return 1
    fi
}

# Restore database from backup
restore_database() {
    local backup_file="$1"
    local temp_file="/tmp/restore_$(basename "$backup_file" .gz)"
    
    log "Starting database restore..."
    log "Backup file: $backup_file"
    log "Target database: $DB_NAME on $DB_HOST:$DB_PORT"
    
    # Decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        log "Decompressing backup file..."
        if gunzip -c "$backup_file" > "$temp_file"; then
            log_success "Backup file decompressed"
        else
            log_error "Failed to decompress backup file"
            exit 1
        fi
    else
        temp_file="$backup_file"
    fi
    
    # Restore database
    log "Restoring database from backup..."
    if PGPASSWORD="$PGPASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -f "$temp_file" \
        --quiet \
        --single-transaction; then
        
        log_success "Database restore completed successfully"
        
        # Clean up temporary file
        if [[ "$backup_file" == *.gz ]] && [ -f "$temp_file" ]; then
            rm "$temp_file"
        fi
        
        return 0
    else
        log_error "Database restore failed"
        
        # Clean up temporary file
        if [[ "$backup_file" == *.gz ]] && [ -f "$temp_file" ]; then
            rm "$temp_file"
        fi
        
        exit 1
    fi
}

# Verify restore
verify_restore() {
    log "Verifying database restore..."
    
    # Check if database exists and is accessible
    if PGPASSWORD="$PGPASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
        --quiet --tuples-only 2>/dev/null | grep -q "[0-9]"; then
        
        log_success "Database restore verification successful"
        
        # Show table count
        local table_count=$(PGPASSWORD="$PGPASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
            --quiet --tuples-only 2>/dev/null | tr -d ' ')
        
        log_info "Tables restored: $table_count"
        return 0
    else
        log_error "Database restore verification failed"
        return 1
    fi
}

# Confirmation prompt
confirm_restore() {
    local backup_file="$1"
    
    echo ""
    log_warning "WARNING: This will replace the current database with the backup!"
    log_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    log_info "Backup file: $backup_file"
    echo ""
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

# Main restore function
main() {
    local backup_file=""
    local force_restore=false
    local list_only=false
    local download_s3=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -f|--force)
                force_restore=true
                shift
                ;;
            -l|--list)
                list_only=true
                shift
                ;;
            -d|--download)
                download_s3="$2"
                shift 2
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Handle list option
    if [ "$list_only" = true ]; then
        list_backups
        exit 0
    fi
    
    # Handle S3 download
    if [ -n "$download_s3" ]; then
        backup_file=$(download_from_s3 "$download_s3")
    fi
    
    # Check if backup file is provided
    if [ -z "$backup_file" ]; then
        log_error "No backup file specified"
        show_usage
        exit 1
    fi
    
    log "=== PAMBASO Database Restore Started ==="
    
    # Test database connection
    test_connection
    
    # Validate backup file
    validate_backup_file "$backup_file"
    
    # Confirmation (unless forced)
    if [ "$force_restore" != true ]; then
        confirm_restore "$backup_file"
    fi
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    # Restore database
    if restore_database "$backup_file"; then
        # Verify restore
        if verify_restore; then
            log_success "=== PAMBASO Database Restore Completed Successfully ==="
            exit 0
        else
            log_error "=== PAMBASO Database Restore Failed (Verification) ==="
            exit 1
        fi
    else
        log_error "=== PAMBASO Database Restore Failed ==="
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Restore interrupted"; exit 1' INT TERM

# Run main function
main "$@"