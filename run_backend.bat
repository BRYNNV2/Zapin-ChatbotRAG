@echo off
echo ========================================================
echo   Menjalankan Backend AI Cultural Assistant (Zapin RAG)
echo ========================================================
cd /d "%~dp0"
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
pause
