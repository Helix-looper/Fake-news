@echo off
title Fake News - Frontend (Vite)
setlocal

echo ====================================================================
echo        Starting Vite React Frontend Server (Port 5173)
echo ====================================================================
echo.

cd /d "%~dp0frontend"

if not exist "%~dp0frontend\node_modules" (
    echo [NOTICE] node_modules not detected. Running npm install first...
    call npm install
)

npm run dev

pause
