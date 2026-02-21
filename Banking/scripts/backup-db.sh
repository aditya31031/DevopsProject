#!/bin/bash
# MongoDB Backup Script — uploads to S3

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/mongo_backup_${TIMESTAMP}"
S3_BUCKET="${S3_BUCKET:-s3://banking-db-backups}"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"

echo "🗄️  Starting MongoDB backup — ${TIMESTAMP}"

# Dump the database
mongodump --uri="${MONGO_URI}" --out="${BACKUP_DIR}"

# Compress
tar -czf "${BACKUP_DIR}.tar.gz" -C /tmp "mongo_backup_${TIMESTAMP}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}.tar.gz" \
  "${S3_BUCKET}/backup_${TIMESTAMP}.tar.gz" \
  --storage-class STANDARD_IA

# Cleanup
rm -rf "${BACKUP_DIR}" "${BACKUP_DIR}.tar.gz"

echo "✅ Backup uploaded: ${S3_BUCKET}/backup_${TIMESTAMP}.tar.gz"

# Delete backups older than 30 days
aws s3 ls "${S3_BUCKET}/" | while read -r line; do
  BACKUP_DATE=$(echo $line | awk '{print $1}')
  BACKUP_FILE=$(echo $line | awk '{print $4}')
  if [[ $(date -d "$BACKUP_DATE" +%s) -lt $(date -d "30 days ago" +%s) ]]; then
    aws s3 rm "${S3_BUCKET}/${BACKUP_FILE}"
    echo "🗑️  Deleted old backup: ${BACKUP_FILE}"
  fi
done
