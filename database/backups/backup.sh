#!/bin/bash

# PostgreSQL Backup Script for PAMBASO Restaurant Management System
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
DB_NAME="${DB_NAME:-pambaso_db}"
DB_USER="${DB_USER:-pambaso_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pambaso_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if required tools are available
check_dependencies() {
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        log_error "gzip is not installed or not in PATH"
        exit 1
    fi
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    if ! PGPASSWORD="$PGPASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
        log_error "Cannot connect to database $DB_NAME on $DB_HOST:$DB_PORT"
        exit 1
    fi
    log_success "Database connection successful"
}

# Create database backup
create_backup() {
    log "Starting backup of database: $DB_NAME"
    log "Backup file: $BACKUP_FILE"
    
    # Create the backup
    if PGPASSWORD="$PGPASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --no-owner \
        --no-privileges \
        > "$BACKUP_FILE"; then
        
        log_success "Database backup created successfully"
        
        # Get backup file size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "Backup size: $BACKUP_SIZE"
        
        return 0
    else
        log_error "Failed to create database backup"
        return 1
    fi
}

# Compress backup file
compress_backup() {
    if [ -f "$BACKUP_FILE" ]; then
        log "Compressing backup file..."
        
        if gzip "$BACKUP_FILE"; then
            COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
            log_success "Backup compressed successfully"
            log "Compressed size: $COMPRESSED_SIZE"
            return 0
        else
            log_error "Failed to compress backup file"
            return 1
        fi
    else
        log_error "Backup file not found: $BACKUP_FILE"
        return 1
    fi
}

# Clean old backups
clean_old_backups() {
    log "Cleaning backups older than $RETENTION_DAYS days..."
    
    if [ -d "$BACKUP_DIR" ]; then
        # Find and delete old backup files
        OLD_BACKUPS=$(find "$BACKUP_DIR" -name "pambaso_backup_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" 2>/dev/null || true)
        
        if [ -n "$OLD_BACKUPS" ]; then
            echo "$OLD_BACKUPS" | while read -r file; do
                if [ -f "$file" ]; then
                    rm "$file"
                    log "Deleted old backup: $(basename "$file")"
                fi
            done
            log_success "Old backups cleaned successfully"
        else
            log "No old backups found to clean"
        fi
    fi
}

# Upload to S3 (optional)
upload_to_s3() {
    if [ -n "${BACKUP_S3_BUCKET:-}" ] && command -v aws &> /dev/null; then
        log "Uploading backup to S3..."
        
        S3_KEY="backups/$(basename "$COMPRESSED_FILE")"
        
        if aws s3 cp "$COMPRESSED_FILE" "s3://$BACKUP_S3_BUCKET/$S3_KEY"; then
            log_success "Backup uploaded to S3: s3://$BACKUP_S3_BUCKET/$S3_KEY"
        else
            log_error "Failed to upload backup to S3"
        fi
    fi
}

# Send notification (optional)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Add your notification logic here (email, Slack, Discord, etc.)
    # Example with curl for webhook:
    # if [ -n "${WEBHOOK_URL:-}" ]; then
    #     curl -X POST "$WEBHOOK_URL" \
    #         -H "Content-Type: application/json" \
    #         -d "{\"text\": \"Backup $status: $message\"}"
    # fi
    
    log "Notification: Backup $status - $message"
}

# Main backup function
main() {
    log "=== PAMBASO Database Backup Started ==="
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    create_backup_dir
    
    # Test database connection
    test_connection
    
    # Create backup
    if create_backup; then
        # Compress backup
        if compress_backup; then
            # Clean old backups
            clean_old_backups
            
            # Upload to S3 (if configured)
            upload_to_s3
            
            # Send success notification
            send_notification "SUCCESS" "Database backup completed successfully"
            
            log_success "=== PAMBASO Database Backup Completed Successfully ==="
            exit 0
        else
            send_notification "FAILED" "Backup compression failed"
            log_error "=== PAMBASO Database Backup Failed (Compression) ==="
            exit 1
        fi
    else
        send_notification "FAILED" "Database backup creation failed"
        log_error "=== PAMBASO Database Backup Failed ==="
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Backup interrupted"; exit 1' INT TERM

# Run main function
main "$@"