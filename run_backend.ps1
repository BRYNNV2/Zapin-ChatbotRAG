Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Menjalankan Backend AI Cultural Assistant (Zapin RAG)  " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

& ".\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
