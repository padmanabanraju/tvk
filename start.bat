@echo off
echo ========================================
echo  AI Trade Nexus - Quick Start
echo ========================================
echo.

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Starting development server...
echo ========================================
echo.
echo The app will open in your browser at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
