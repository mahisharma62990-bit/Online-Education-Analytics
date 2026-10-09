@echo off
echo Starting Online Education Analytics...
echo.

echo [1/2] Starting Backend (http://localhost:8000)...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && py -m uvicorn app.main:app --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (http://localhost:5173)...
start "Frontend - Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo   Backend API  : http://localhost:8000
echo   API Docs     : http://localhost:8000/docs
echo   Frontend App : http://localhost:5173
echo.
echo Login credentials (password: password123)
echo   Admin      : admin@edu.local
echo   Instructor : instructor@edu.local
echo   Student    : student@edu.local
echo.
pause
