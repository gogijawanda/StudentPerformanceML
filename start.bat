@echo off
title Smart Academic Intelligence System (SAIS) Launcher
echo ============================================================
echo   Smart Academic Intelligence System (SAIS) - Quick Launcher
echo ============================================================
echo.

:: 1. Check if model artifacts exist; if not, train once
if not exist "models\sais_artifacts.joblib" (
    echo [INFO] Model artifacts not found. Training models once...
    python backend/train.py
    echo.
)

:: 2. Launch Backend in a separate window
echo [1/2] Starting Backend Server (FastAPI on http://127.0.0.1:8000)...
start "SAIS Backend (Port 8000)" cmd /k "python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

:: 3. Launch Frontend in a separate window
echo [2/2] Starting Frontend Dev Server (React on http://localhost:5173)...
start "SAIS Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

:: 4. Automatically open browser
echo.
echo Opening browser at http://localhost:5173...
timeout /t 4 >nul
start http://localhost:5173

echo.
echo ============================================================
echo   SUCCESS: Both servers are running!
echo   - Web Application: http://localhost:5173
echo   - Backend Swagger: http://127.0.0.1:8000/docs
echo.
echo   (To stop the app, simply close the two popup command windows)
echo ============================================================
pause

