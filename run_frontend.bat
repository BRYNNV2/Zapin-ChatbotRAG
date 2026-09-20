@echo off
echo ========================================================
echo   Menjalankan Frontend AI Cultural Assistant (Zapin UI)
echo ========================================================
cd /d "%~dp0\frontend"
npx vite --port 5173 --host 127.0.0.1
pause
