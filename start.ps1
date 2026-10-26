Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Smart Academic Intelligence System (SAIS) Quick Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path "models\sais_artifacts.joblib")) {
    Write-Host "[INFO] Training models once..." -ForegroundColor Yellow
    python backend/train.py
}

Write-Host "[1/2] Launching Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Launching Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k", "cd frontend && npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Both servers started! Open your browser at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

