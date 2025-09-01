#!/bin/bash
# Restore script for backup: full_backup_20250830_184909.sql.gz
# Usage: ./restore_backup_20250830_184909.sh

echo "Restoring database from backup: full_backup_20250830_184909.sql.gz"
echo "This will overwrite the current database!"

read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Restoring database..."
gunzip -c backups/full_backup_20250830_184909.sql.gz | docker exec -i nearmate-mysql mysql -uroot -proot nearmateadmin

if [ $? -eq 0 ]; then
    echo "Database restored successfully!"
else
    echo "Database restore failed!"
    exit 1
fi
