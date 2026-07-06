#!/bin/bash

echo "💾 Backing up workflows..."

# Create backup directory
BACKUP_DIR=".openclaw/backup/workflows-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy workflow definitions
cp -r .openclaw/workflows/definitions/*.ts "$BACKUP_DIR/" 2>/dev/null || true
cp -r .openclaw/workflows/templates/*.ts "$BACKUP_DIR/" 2>/dev/null || true

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" . 2>/dev/null || true
rm -rf "$BACKUP_DIR"

echo "✅ Workflows backed up to $BACKUP_DIR.tar.gz"
