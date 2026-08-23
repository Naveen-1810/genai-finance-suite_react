@echo off
title GenAI Finance Suite - Full Stack Launcher
echo =========================================
echo   Starting GenAI Finance Suite (React + FastAPI)
echo =========================================
cd /d "%~dp0"

start "Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173
pause
