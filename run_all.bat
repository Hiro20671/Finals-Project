@echo off
echo ===============================================================
echo Starting Peer-to-Peer Academic Exchange System
echo Starting Backend (Django 5) and Frontend (React + Vite)
echo ===============================================================

start "Django Backend Server (Port 8000)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

start "React Frontend App (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both servers launched!
echo Access Web Application: http://localhost:5173
echo Django API: http://127.0.0.1:8000/api/
echo Django Admin: http://127.0.0.1:8000/admin/

