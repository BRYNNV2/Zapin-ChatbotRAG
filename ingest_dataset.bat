@echo off
echo ================================================================
echo   Batch Ingestion Dokumen Zapin ke Vector Store (Di Belakang Layar)
echo ================================================================
cd /d "%~dp0"
.\backend\venv\Scripts\python.exe backend\ingest_all.py %*
pause
