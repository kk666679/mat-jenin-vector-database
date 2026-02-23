@echo off
REM Database Setup Script for Matjenin AI (Windows)
REM This script helps set up the Prisma database with PostgreSQL

echo 🚀 Setting up database...

REM Check if PRISMA_DATABASE_URL is set
if "%PRISMA_DATABASE_URL%"=="" (
    echo ⚠️  PRISMA_DATABASE_URL is not set. Using .env.local if available.
    set /p PRISMA_DATABASE_URL=<.env.local 2>nul
)

REM Generate Prisma Client
echo 📦 Generating Prisma Client...
call npx prisma generate --schema=./sdk/db/prisma/schema.prisma

if errorlevel 1 (
    echo ❌ Failed to generate Prisma Client
    exit /b 1
)

echo ✅ Prisma Client generated successfully

REM Push database schema
echo 🗄️  Pushing database schema...
call npx prisma db push --schema=./sdk/db/prisma/schema.prisma

if errorlevel 1 (
    echo ❌ Failed to push database schema
    exit /b 1
)

echo ✅ Database schema pushed successfully

REM Check for --seed argument
if "%1"=="--seed" (
    echo 🌱 Seeding database...
    call npx tsx prisma/seed.ts
    
    if errorlevel 1 (
        echo ⚠️  Database seeding failed ^(this is OK if using a remote database^)
    ) else (
        echo ✅ Database seeded successfully
    )
)

echo.
echo 🎉 Database setup complete!
echo.
echo Next steps:
echo   - Run "npm run dev" to start the development server
echo   - Run "npm run worker" to start the document processing worker
echo   - Run "npm run db:seed" to seed the database with sample data

