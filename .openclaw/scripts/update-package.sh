#!/bin/bash

echo "📦 Updating package.json with OpenClaw scripts..."

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if command -v jq &> /dev/null; then
    cp package.json package.json.bak
    
    jq '.scripts += {
        "openclaw:worker": "ts-node .openclaw/worker/index.ts",
        "openclaw:worker:dev": "ts-node --watch .openclaw/worker/index.ts",
        "openclaw:status": "curl -X GET http://localhost:3000/api/openclaw | jq",
        "openclaw:test": "ts-node .openclaw/tests/test-system.ts",
        "openclaw:clean": "rm -rf .openclaw/logs/* .openclaw/metrics/*",
        "openclaw:setup": "chmod +x .openclaw/scripts/*.sh && .openclaw/scripts/setup.sh",
        "openclaw:docker:up": "docker-compose -f .openclaw/docker-compose.yml up -d",
        "openclaw:docker:down": "docker-compose -f .openclaw/docker-compose.yml down",
        "openclaw:docker:logs": "docker-compose -f .openclaw/docker-compose.yml logs -f",
        "openclaw:migrate": "bash .openclaw/migrations/run.migrations.sh",
        "openclaw:validate": "ts-node .openclaw/hooks/pre-commit/validate.types.ts"
    }' package.json > package.json.tmp
    
    mv package.json.tmp package.json
    echo "✅ package.json updated successfully!"
else
    echo "⚠️  jq not found. Please add scripts manually."
fi
