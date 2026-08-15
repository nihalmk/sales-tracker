@echo off
setlocal EnableDelayedExpansion
title Sales Tracker - Stop

set "ROOT=%~dp0"
set "PID_FILE=%ROOT%mongod.pid"

if exist "%PID_FILE%" (
    set /p MONGO_PID=<"%PID_FILE%"
    echo Stopping MongoDB ^(process !MONGO_PID!^)...
    taskkill /PID !MONGO_PID! /F >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   Stopped.
    ) else (
        echo   It wasn't running ^(already stopped, or started outside Sales Tracker^).
    )
    del "%PID_FILE%" >nul 2>&1
) else (
    echo No record of a running MongoDB instance was found.
    echo If it's still running, stop it manually via Task Manager
    echo ^(look for mongod.exe^).
)

echo.
echo If the Sales Tracker app window is still open, close it too
echo ^(or press Ctrl+C inside it^) to fully stop the app.
pause
