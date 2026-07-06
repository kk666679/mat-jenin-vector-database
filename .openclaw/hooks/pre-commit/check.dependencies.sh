#!/bin/bash

echo "🔍 Checking dependencies..."

# Check for outdated dependencies
if command -v npx &> /dev/null && [ -f "package.json" ]; then
    OUTDATED=$(npx npm-check-updates --target minor --format json 2>/dev/null || echo "{}")
    
    if [ "$OUTDATED" != "{}" ]; then
        echo "📦 Outdated dependencies found:"
        echo "$OUTDATED" | jq -r 'to_entries[] | "  \(.key): \(.value.current) -> \(.value.latest)"'
    else
        echo "✅ All dependencies are up to date"
    fi
fi

echo "✅ Dependency check completed"
