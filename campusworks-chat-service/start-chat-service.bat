@echo off
echo Starting CampusWorks Chat Service...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/campusworks_chat').then(() => { console.log('MongoDB connected'); process.exit(0); }).catch(err => { console.log('MongoDB connection failed:', err.message); process.exit(1); });" 2>nul
if %errorlevel% neq 0 (
    echo Warning: MongoDB connection failed
    echo Please ensure MongoDB is running on localhost:27017
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Copy config file if .env doesn't exist
if not exist ".env" (
    if exist "config.env" (
        echo Creating .env file from config.env...
        copy config.env .env >nul
    ) else (
        echo Warning: config.env file not found
        echo Please create .env file with your configuration
    )
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Start the service
echo Starting chat service on port 3001...
echo.
echo Chat Service will be available at:
echo - HTTP: http://localhost:3001
echo - WebSocket: ws://localhost:3001
echo - Health Check: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the service
echo.

npm start
