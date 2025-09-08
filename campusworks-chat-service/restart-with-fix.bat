@echo off
echo Fixing and restarting CampusWorks Chat Service...
echo.

REM Stop any running node processes
taskkill /f /im node.exe >nul 2>&1

REM Copy config file
if exist "config.env" (
    echo Copying config.env to .env...
    copy config.env .env >nul
    echo Configuration updated.
) else (
    echo Warning: config.env not found
)

REM Install dependencies
echo Installing dependencies...
npm install

REM Create logs directory
if not exist "logs" mkdir logs

REM Start the service
echo Starting chat service with fixes...
echo.
echo The service will now start with:
echo - Correct JWT secret
echo - Fallback authentication
echo - Enhanced debugging
echo.
echo Press Ctrl+C to stop the service
echo.

npm start
