#!/bin/bash

# Database Setup Script for Matjenin AI
# This script helps set up the Prisma database with PostgreSQL

echo "🚀 Setting up database..."

# Check if PRISMA_DATABASE_URL is set
if [ -z "$PRISMA_DATABASE_URL" ]; then
    echo "⚠️  PRISMA_DATABASE_URL is not set. Using .env.local if available."
    source .env.local 2>/dev/null || true
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=./sdk/db/prisma/schema.prisma

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated successfully"

# Push database schema
echo "🗄️  Pushing database schema..."
npx prisma db push --schema=./sdk/db/prisma/schema.prisma

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    exit 1
fi

echo "✅ Database schema pushed successfully"

# Optional: Seed database
if [ "$1" == "--seed" ]; then
    echo "🌱 Seeding database..."
    npx tsx prisma/seed.ts
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully"
    else
        echo "⚠️  Database seeding failed (this is OK if using a remote database)"
    fi
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  - Run 'npm run dev' to start the development server"
echo "  - Run 'npm run worker' to start the document processing worker"
echo "  - Run 'npm run db:seed' to seed the database with sample data"

