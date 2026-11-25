@echo off
echo ===============================================================
echo Starting Peer-to-Peer Academic Exchange Django Backend
echo http://127.0.0.1:8000
echo ===============================================================
cd /d "%~dp0backend"
call ".\venv\Scripts\activate.bat"
python manage.py runserver 127.0.0.1:8000
pause

