@echo off
echo ===================================================
echo Starting TrustShield AI - Security Operations Suite
echo Tagline: Detect the Fake. Protect the Brand. Stop the Threat.
echo ===================================================

start cmd /k "set PYTHONPATH=backend&& C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 >nul
start cmd /k "cd frontend&& C:\Users\Admin\AppData\Local\Programs\nodejs\PFiles64\nodejs\npm.cmd run dev"

echo Backend started at http://127.0.0.1:8000
echo Frontend dev server starting at http://localhost:5173
