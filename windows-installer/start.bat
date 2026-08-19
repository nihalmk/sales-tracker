@echo off
setlocal EnableDelayedExpansion
title Sales Tracker

rem Everything is resolved relative to this script's own folder, so it
rem works no matter where the installer put it (Program Files, a per-user
rem folder, a USB stick, etc).
set "ROOT=%~dp0"
set "MONGO_EXE=%ROOT%mongodb\bin\mongod.exe"
set "NODE_EXE=%ROOT%node\node.exe"
set "APP_DIR=%ROOT%app"
set "DATA_DIR=%ROOT%data\db"
set "LOG_DIR=%ROOT%logs"
set "MONGO_PORT=27017"

if not exist "%DATA_DIR%" mkdir "%DATA_DIR%" >nul 2>&1
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>&1

echo ============================================
echo   Sales Tracker - starting up
echo ============================================
echo.

if not exist "%MONGO_EXE%" (
    echo ERROR: MongoDB was not found at:
    echo   %MONGO_EXE%
    echo This installation looks incomplete or corrupted. Please reinstall Sales Tracker.
    pause
    exit /b 1
)
if not exist "%NODE_EXE%" (
    echo ERROR: Node.js was not found at:
    echo   %NODE_EXE%
    echo This installation looks incomplete or corrupted. Please reinstall Sales Tracker.
    pause
    exit /b 1
)

echo Checking MongoDB...
call :CHECK_PORT
if "%MONGO_UP%"=="1" (
    echo   Already running - reusing it.
    goto MONGO_READY
)

echo   Starting MongoDB in the background...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%start-mongo.ps1"
if errorlevel 1 (
    echo.
    echo ERROR: Failed to launch MongoDB. See the error above for details.
    pause
    exit /b 1
)

set TRIES=0
:WAIT_MONGO
timeout /t 1 /nobreak >nul
call :CHECK_PORT
if "%MONGO_UP%"=="1" goto MONGO_READY
set /a TRIES+=1
if !TRIES! LSS 30 goto WAIT_MONGO

echo.
echo ERROR: MongoDB did not start within 30 seconds.
echo Check these for details:
echo   %LOG_DIR%\mongod.log
echo   %LOG_DIR%\mongod-launch.log
echo   %LOG_DIR%\mongod-launch.err.log
pause
exit /b 1

:MONGO_READY
echo   MongoDB is ready.
echo.
echo Starting the Sales Tracker app...
echo (a browser window will open automatically once it's ready)
echo.
echo Keep this window open while you are using Sales Tracker.
echo Closing it stops the app (MongoDB keeps running in the background -
echo use "Stop Sales Tracker" from the Start Menu to shut it down too).
echo.

set "MONGO_URI=mongodb://127.0.0.1:%MONGO_PORT%/sales-tracker"
set "PORT=3000"
set "NODE_ENV=production"

rem Placeholders only - the app's Emailer class throws on startup (not just
rem when actually sending mail) if these are unset at all, since it's
rem constructed eagerly during server boot (src/accounts/setup.ts). Real
rem password-reset emails still won't send with fake values - see the
rem README's "Known simplifications" note - but the app itself will start.
rem To enable real email sending, replace these with real Mailgun
rem credentials instead.
set "MAILGUN_API_KEY=not-configured"
set "MAILGUN_DOMAIN=not-configured"

rem So the "DB Backup" feature can find mongoexport.exe if you've dropped
rem the separate MongoDB Database Tools into mongodb\bin alongside
rem mongod.exe - see the README's DB backup troubleshooting note. Harmless
rem if you haven't - the app just doesn't need this for anything else.
set "PATH=%ROOT%mongodb\bin;%PATH%"

cd /d "%APP_DIR%"
"%NODE_EXE%" dist\src\server\index.js

echo.
echo Sales Tracker has stopped.
pause
exit /b 0

:CHECK_PORT
powershell -NoProfile -Command "try { (New-Object Net.Sockets.TcpClient('127.0.0.1', %MONGO_PORT%)).Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 (set "MONGO_UP=1") else (set "MONGO_UP=0")
exit /b
