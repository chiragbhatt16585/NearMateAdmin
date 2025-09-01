#!/bin/bash

# NearMate Database Full Backup Script (Docker Version)
# This script creates a complete backup of the MySQL database using Docker

# Configuration
DB_CONTAINER="nearmate-mysql"
DB_NAME="nearmateadmin"
DB_USER="root"
DB_PASSWORD="root"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="full_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="full_backup_${TIMESTAMP}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   NearMate Database Full Backup${NC}"
echo -e "${BLUE}   (Docker Version)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
echo -e "Database: ${YELLOW}${DB_NAME}${NC}"
echo -e "Container: ${YELLOW}${DB_CONTAINER}${NC}"
echo ""

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: ${BACKUP_DIR}${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if MySQL container is running
echo -e "${BLUE}Checking MySQL container...${NC}"
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}Error: MySQL container is not running${NC}"
    echo -e "${YELLOW}Please start the MySQL container first${NC}"
    exit 1
fi
echo -e "${GREEN}MySQL container is running${NC}"

# Check if we can connect to the database
echo -e "${BLUE}Testing database connection...${NC}"
if ! docker exec "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to MySQL database${NC}"
    echo -e "${YELLOW}Please check database credentials${NC}"
    exit 1
fi
echo -e "${GREEN}Database connection successful${NC}"

# Get database size information
echo -e "${BLUE}Getting database information...${NC}"
DB_SIZE=$(docker exec "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -s -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB' FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
echo -e "Database size: ${YELLOW}${DB_SIZE} MB${NC}"

# Get table count
TABLE_COUNT=$(docker exec "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -s -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
echo -e "Table count: ${YELLOW}${TABLE_COUNT}${NC}"

# List all tables
echo -e "${BLUE}Tables in database:${NC}"
docker exec "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -s -e "SHOW TABLES FROM $DB_NAME;" | while read table; do
    if [ ! -z "$table" ]; then
        echo -e "  - ${YELLOW}${table}${NC}"
    fi
done

echo ""
echo -e "${BLUE}Starting full database backup...${NC}"
echo -e "Backup file: ${YELLOW}${BACKUP_FILE}${NC}"

# Create the backup using Docker exec
docker exec "$DB_CONTAINER" mysqldump \
    -u"$DB_USER" \
    -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --add-drop-table \
    --default-character-set=utf8mb4 \
    --set-charset \
    --comments \
    --complete-insert \
    --extended-insert \
    --hex-blob \
    "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database backup completed successfully!${NC}"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "Backup file size: ${YELLOW}${BACKUP_SIZE}${NC}"
    
    # Compress the backup
    echo -e "${BLUE}Compressing backup file...${NC}"
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        COMPRESSED_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
        echo -e "${GREEN}Backup compressed successfully!${NC}"
        echo -e "Compressed file size: ${YELLOW}${COMPRESSED_SIZE}${NC}"
        
        # Calculate compression ratio if bc is available
        if command -v bc >/dev/null 2>&1; then
            COMPRESSION_RATIO=$(echo "scale=1; $(wc -c < "$BACKUP_DIR/$BACKUP_FILE") * 100 / $(wc -c < "$BACKUP_DIR/$COMPRESSED_FILE")" | bc -l)
            echo -e "Compression ratio: ${YELLOW}${COMPRESSION_RATIO}%${NC}"
        fi
        
        # Remove uncompressed file
        rm -f "$BACKUP_DIR/$BACKUP_FILE"
        echo -e "Removed uncompressed backup file"
    else
        echo -e "${RED}Compression failed, keeping uncompressed backup${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}Backup Summary:${NC}"
    echo -e "  - Backup file: ${YELLOW}${BACKUP_DIR}/${COMPRESSED_FILE}${NC}"
    echo -e "  - Database: ${YELLOW}${DB_NAME}${NC}"
    echo -e "  - Tables: ${YELLOW}${TABLE_COUNT}${NC}"
    echo -e "  - Database size: ${YELLOW}${DB_SIZE} MB${NC}"
    echo -e "  - Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
    
    # List all backup files
    echo ""
    echo -e "${BLUE}All backup files in ${BACKUP_DIR}:${NC}"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | while read line; do
        echo -e "  ${YELLOW}${line}${NC}"
    done
    
else
    echo -e "${RED}Database backup failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Create a restore script
RESTORE_SCRIPT="restore_backup_${TIMESTAMP}.sh"
cat > "$RESTORE_SCRIPT" << EOF
#!/bin/bash
# Restore script for backup: ${COMPRESSED_FILE}
# Usage: ./${RESTORE_SCRIPT}

echo "Restoring database from backup: ${COMPRESSED_FILE}"
echo "This will overwrite the current database!"

read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "\$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Restoring database..."
gunzip -c backups/${COMPRESSED_FILE} | docker exec -i ${DB_CONTAINER} mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME}

if [ \$? -eq 0 ]; then
    echo "Database restored successfully!"
else
    echo "Database restore failed!"
    exit 1
fi
EOF

chmod +x "$RESTORE_SCRIPT"
echo -e "${BLUE}Restore script created: ${YELLOW}${RESTORE_SCRIPT}${NC}"
echo -e "${BLUE}You can use this script to restore the database if needed${NC}"

# Create a simple backup verification script
VERIFY_SCRIPT="verify_backup_${TIMESTAMP}.sh"
cat > "$VERIFY_SCRIPT" << EOF
#!/bin/bash
# Verify backup script for: ${COMPRESSED_FILE}

echo "Verifying backup file: ${COMPRESSED_FILE}"

# Check if backup file exists
if [ ! -f "backups/${COMPRESSED_FILE}" ]; then
    echo "Error: Backup file not found!"
    exit 1
fi

# Check file integrity
echo "Checking file integrity..."
if gunzip -t "backups/${COMPRESSED_FILE}"; then
    echo "✓ Backup file is not corrupted"
else
    echo "✗ Backup file is corrupted!"
    exit 1
fi

# Check file size
FILE_SIZE=\$(du -h "backups/${COMPRESSED_FILE}" | cut -f1)
echo "✓ Backup file size: \${FILE_SIZE}"

# Check if it's a valid SQL dump
echo "Checking SQL content..."
if gunzip -c "backups/${COMPRESSED_FILE}" | head -20 | grep -q "MySQL dump"; then
    echo "✓ Backup appears to be a valid MySQL dump"
else
    echo "⚠ Backup may not be a valid MySQL dump"
fi

echo "Backup verification completed!"
EOF

chmod +x "$VERIFY_SCRIPT"
echo -e "${BLUE}Verification script created: ${YELLOW}${VERIFY_SCRIPT}${NC}"
echo -e "${BLUE}Use this script to verify the backup integrity${NC}"
