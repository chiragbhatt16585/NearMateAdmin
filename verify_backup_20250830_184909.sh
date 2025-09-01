#!/bin/bash
# Verify backup script for: full_backup_20250830_184909.sql.gz

echo "Verifying backup file: full_backup_20250830_184909.sql.gz"

# Check if backup file exists
if [ ! -f "backups/full_backup_20250830_184909.sql.gz" ]; then
    echo "Error: Backup file not found!"
    exit 1
fi

# Check file integrity
echo "Checking file integrity..."
if gunzip -t "backups/full_backup_20250830_184909.sql.gz"; then
    echo "✓ Backup file is not corrupted"
else
    echo "✗ Backup file is corrupted!"
    exit 1
fi

# Check file size
FILE_SIZE=$(du -h "backups/full_backup_20250830_184909.sql.gz" | cut -f1)
echo "✓ Backup file size: ${FILE_SIZE}"

# Check if it's a valid SQL dump
echo "Checking SQL content..."
if gunzip -c "backups/full_backup_20250830_184909.sql.gz" | head -20 | grep -q "MySQL dump"; then
    echo "✓ Backup appears to be a valid MySQL dump"
else
    echo "⚠ Backup may not be a valid MySQL dump"
fi

echo "Backup verification completed!"
