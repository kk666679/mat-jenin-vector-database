#!/bin/bash

echo "📊 Updating metrics..."

# Collect commit metrics
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_AUTHOR=$(git log -1 --pretty=%an)
COMMIT_DATE=$(git log -1 --pretty=%ci)

# Log commit
echo "$COMMIT_DATE | $COMMIT_HASH | $COMMIT_AUTHOR | $COMMIT_MSG" >> .openclaw/metrics/commits.log

# Count files changed
FILES_CHANGED=$(git diff --name-only HEAD~1 HEAD | wc -l)
echo "$COMMIT_DATE | $FILES_CHANGED files changed" >> .openclaw/metrics/files-changed.log

echo "✅ Metrics updated"
