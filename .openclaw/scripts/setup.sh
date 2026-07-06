#!/bin/bash

echo "🔧 Setting up OpenClaw system..."

# Create required directories
mkdir -p .openclaw/logs
mkdir -p .openclaw/metrics
mkdir -p .openclaw/backup
mkdir -p .openclaw/models
mkdir -p .openclaw/cache

# Set permissions
chmod +x .openclaw/scripts/*.sh
chmod +x .openclaw/worker/index.ts
chmod +x .openclaw/tests/test-system.ts
chmod +x .openclaw/migrations/run.migrations.sh

# Install dependencies
echo "📦 Installing OpenClaw dependencies..."
npm install bullmq ioredis @xenova/transformers @tensorflow/tfjs pino pino-pretty zod

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .openclaw/.env .env
fi

echo "✅ OpenClaw setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm run openclaw:worker     - Start worker"
echo "  npm run openclaw:test       - Run tests"
echo "  npm run openclaw:status     - Check status"
echo "  npm run openclaw:docker:up  - Start Docker services"
echo "  npm run openclaw:docker:down - Stop Docker services"
echo "  npm run openclaw:migrate    - Run database migrations"
echo ""
echo "🚀 Next steps:"
echo "  1. npm run openclaw:docker:up"
echo "  2. npm run openclaw:worker"
echo "  3. npm run openclaw:test"
