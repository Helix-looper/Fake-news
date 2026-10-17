@echo off
title Fake News - Backend (FastAPI)
setlocal

echo ====================================================================
echo        Starting FastAPI Backend Server (Port 8000)
echo ====================================================================
echo.

cd /d "%~dp0backend"

if exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo Activating Python virtual environment...
    call "%~dp0backend\venv\Scripts\activate.bat"
) else (
    echo [WARNING] backend\venv not found. Falling back to system python.
)

echo Starting uvicorn server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
