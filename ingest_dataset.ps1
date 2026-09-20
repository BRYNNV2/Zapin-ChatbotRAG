Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Batch Ingestion Dokumen Zapin ke Vector Store (Di Belakang Layar)" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

& ".\backend\venv\Scripts\python.exe" "backend\ingest_all.py" $args
