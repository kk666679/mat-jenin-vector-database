@echo off
REM Matjenin AI - Windows Runner Script
REM This script helps set up and run the Matjenin AI application on Windows

echo ==========================================
echo   Matjenin AI - Application Runner
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm not found. Please install npm
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm: %NPM_VERSION%

REM Check Docker
where docker >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [OK] Docker: %DOCKER_VERSION%
) else (
    echo [WARN] Docker not found. Infrastructure services won't be available.
)

echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo Dependencies installed successfully
) else (
    echo Dependencies already installed
)

echo.

REM Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env
    ) else (
        echo Creating default .env file...
        (
            echo # Database ^(SQL Server^)
            echo DATABASE_URL="sqlserver://localhost:1433;database=matjenin_ai;user=sa;password=YourStrong!Password;trustServerCertificate=true"
            echo.
            echo # Redis
            echo REDIS_URL="redis://localhost:6379"
            echo.
            echo # Weaviate
            echo WEAVIATE_URL="http://localhost:8080"
            echo.
            echo # Application
            echo NEXTAUTH_SECRET="your-secret-key-change-in-production"
            echo NEXTAUTH_URL="http://localhost:3000"
            echo.
            echo # AI Providers ^(at least one required^)
            echo # OPENAI_API_KEY=""
            echo # ANTHROPIC_API_KEY=""
            echo # GOOGLE_API_KEY=""
        ) > .env
    )
    echo Created .env file
    echo Please edit .env with your configuration
) else (
    echo .env file exists
)

echo.

REM Parse command line arguments
if "%~1"=="" (
    echo Running default: starting development server
    echo.
    call npm run dev
    goto :eof
)

if /i "%~1"=="infra" goto :infra
if /i "%~1"=="infrastructure" goto :infra
if /i "%~1"=="db" goto :db
if /i "%~1"=="setup-db" goto :db
if /i "%~1"=="database" goto :db
if /i "%~1"=="dev" goto :dev
if /i "%~1"=="development" goto :dev
if /i "%~1"=="prod" goto :prod
if /i "%~1"=="production" goto :prod
if /i "%~1"=="worker" goto :worker
if /i "%~1"=="grpc" goto :grpc
if /i "%~1"=="all" goto :all
if /i "%~1"=="start" goto :all
if /i "%~1"=="help" goto :help
goto :dev

:infra
echo Starting infrastructure services...
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker not found. Cannot start infrastructure services.
    exit /b 1
)

if not exist "docker-compose.yml" (
    echo Creating docker-compose.yml...
    (
        echo version: '3.8'
        echo.
        echo services:
        echo   sqlserver:
        echo     image: mcr.microsoft.com/mssql/server:2022-latest
        echo     container_name: matjenin-sqlserver
        echo     environment:
        echo       - ACCEPT_EULA=Y
        echo       - SA_PASSWORD=YourStrong^!Password
        echo       - MSSQL_PID=Developer
        echo     ports:
        echo       - "1433:1433"
        echo     volumes:
        echo       - sqlserver_data:/var/opt/mssql
        echo.
        echo   redis:
        echo     image: redis:7-alpine
        echo     container_name: matjenin-redis
        echo     ports:
        echo       - "6379:6379"
        echo     volumes:
        echo       - redis_data:/data
        echo.
        echo   weaviate:
        echo     image: semitechnologies/weaviate:latest
        echo     container_name: matjenin-weaviate
        echo     ports:
        echo       - "8080:8080"
        echo     environment:
        echo       - QUERY_DEFAULTS_LIMIT=25
        echo       - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
        echo       - PERSISTENCE_DATA_PATH=/var/lib/weaviate
        echo     volumes:
        echo       - weaviate_data:/var/lib/weaviate
        echo.
        echo volumes:
        echo   sqlserver_data:
        echo   redis_data:
        echo   weaviate_data:
    ) > docker-compose.yml
)

docker-compose up -d
echo Infrastructure services started
goto :eof

:db
echo Setting up database...
echo Generating Prisma client...
call npm run db:generate
echo Pushing schema to database...
call npm run db:push
echo Database setup complete!
goto :eof

:dev
echo Starting development server...
call npm run dev
goto :eof

:prod
echo Building application...
call npm run build
echo Starting production server...
call npm run start
goto :eof

:worker
echo Starting background worker...
call npm run worker
goto :eof

:grpc
echo Starting gRPC server...
call npm run grpc
goto :eof

:all
call :infra
call :db
echo.
echo ==========================================
echo Starting all services...
echo ==========================================
echo.
echo Starting Next.js application...
start "Next.js" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo Starting background worker...
start "Worker" cmd /k "npm run worker"
echo.
echo ==========================================
echo All services started!
echo ==========================================
echo.
echo Application: http://localhost:3000
echo gRPC Server: localhost:50051
echo.
echo Press Ctrl+C in each window to stop services
goto :eof

:help
echo Usage: run.bat [command]
echo.
echo Commands:
echo   infra, infrastructure   Start infrastructure services ^(SQL Server, Redis, Weaviate^)
echo   db, setup-db, database  Setup database ^(generate Prisma client and push schema^)
echo   dev, development        Start development server
echo   prod, production        Build and start production server
echo   worker                  Start background job worker
echo   grpc                    Start gRPC server
echo   all, start              Start all services ^(infra + db + app + worker^)
echo   help                    Show this help message
echo.
echo Examples:
echo   run.bat infra           Start infrastructure services only
echo   run.bat db              Setup database only
echo   run.bat dev             Start development server
echo   run.bat all             Start everything
goto :eof

