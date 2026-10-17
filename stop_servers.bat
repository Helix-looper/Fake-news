@echo off
title Stop Fake News Servers
setlocal

echo ====================================================================
echo        Stopping Fake News Servers (Ports 8000 and 5173)
echo ====================================================================
echo.

echo Terminating processes listening on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":8000 .*LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

echo Terminating processes listening on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5173 .*LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Server processes stopped.
ping 127.0.0.1 -n 3 >nul
