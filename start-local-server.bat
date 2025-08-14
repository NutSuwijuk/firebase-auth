@echo off
echo ========================================
echo    Firebase Auth Local Server
echo ========================================
echo.
echo Starting local server...
echo.
echo Make sure you have:
echo 1. Created .env file with proper configuration
echo 2. Installed dependencies (npm install)
echo 3. Firebase service account key
echo.
echo Server will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo Please create .env file from env.example
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    echo.
)

echo 🚀 Starting server in development mode...
echo.
npm run dev

pause 