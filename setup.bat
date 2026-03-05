@echo off
REM =========================================
REM PubSub Fanout - Setup Script for Windows
REM =========================================
REM This script sets up and starts the entire system on Windows
REM Requires: Node.js 18+, MongoDB, Redis (can use Docker or local)

setlocal enabledelayedexpansion

echo.
echo ===================================================
echo PubSub Fanout System - Windows Setup
echo ===================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    exit /b 1
)

echo [OK] npm is installed: 
npm --version

REM Check MongoDB
echo.
echo Checking MongoDB...
mongosh --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] mongosh not found. Using Docker fallback...
    docker run --name pubsub_mongo -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=mongo_password mongo:latest >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Could not start MongoDB with Docker
        echo Please start MongoDB manually and try again
        echo Options:
        echo   1. Install MongoDB Community Edition
        echo   2. Start Docker Desktop and MongoDB container
        pause
        exit /b 1
    )
    timeout /t 3
    echo [OK] MongoDB started in Docker
) else (
    echo [OK] MongoDB found: 
    mongosh --version
)

REM Check Redis
echo.
echo Checking Redis...
redis-cli --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] redis-cli not found. Using Docker fallback...
    docker run --name pubsub_redis -d -p 6379:6379 redis:latest redis-server --requirepass redis_password >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Could not start Redis with Docker
        echo Please start Redis manually and try again
        pause
        exit /b 1
    )
    timeout /t 3
    echo [OK] Redis started in Docker
) else (
    echo [OK] Redis found
    redis-cli --version
)

REM Install dependencies
echo.
echo Installing dependencies...
echo.

echo Installing root dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Success
echo.
echo ===================================================
echo SUCCESS! Setup complete
echo ===================================================
echo.
echo To start the system, run in different terminals:
echo.
echo Terminal 1 (Backend):
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd client
echo   npm start
echo.
echo Then open your browser to: http://localhost:3000
echo.
echo For logs, use:
echo   - Backend: http://localhost:5000/logs
echo   - Frontend: Browser Console (F12)
echo.
pause

