@echo off
title Explainable Fake News Detection - Launcher
setlocal EnableDelayedExpansion

echo ====================================================================
echo        Explainable Fake News Detection System Launcher
echo ====================================================================
echo.

:: Check for backend virtual environment
if not exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo [WARNING] Virtual environment backend\venv\Scripts\activate.bat not found!
    echo Please make sure backend dependencies are installed.
    echo.
)

:: Step 1: Start Backend (FastAPI + Uvicorn)
echo [1/3] Launching Backend (FastAPI on http://localhost:8000)...
start "Fake News - Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && if exist "%~dp0backend\venv\Scripts\activate.bat" (call "%~dp0backend\venv\Scripts\activate.bat") && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Step 2: Start Frontend (Vite + React)
echo [2/3] Launching Frontend (Vite React on http://localhost:5173)...
start "Fake News - Frontend (Vite React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Step 3: Open Browser
echo [3/3] Opening web app in your default browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo ====================================================================
echo  Servers are starting in separate terminal windows:
echo    - Frontend UI:  http://localhost:5173
echo    - Backend API:  http://localhost:8000
echo    - API Docs:     http://localhost:8000/docs
echo ====================================================================
echo.
echo Note: If this is the first run, the ML model (~500MB) will download
echo       automatically in the backend terminal before analysis is ready.
echo.
echo You can close this launcher window at any time.
echo.
pause
