#!/bin/bash
# =====================================================================
# PythonAnywhere Automated Setup Script
# Peer-to-Peer Academic Book & Reviewer Exchange System
# =====================================================================

set -e

echo "=== 1. Detecting User & Directory Paths ==="
USER_NAME=$(whoami)
PROJECT_DIR="/home/$USER_NAME/Finals-Project"
VENV_DIR="/home/$USER_NAME/.virtualenvs/acadex-env"

echo "Current User: $USER_NAME"
echo "Project Path: $PROJECT_DIR"

cd "$PROJECT_DIR"

echo "=== 2. Setting Up Virtual Environment ==="
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment at $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

echo "=== 3. Installing Dependencies ==="
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== 4. Configuring Environment Variables ==="
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    # Default to SQLite for initial instant launch, user can switch to MySQL in .env anytime
    sed -i 's/USE_SQLITE=False/USE_SQLITE=True/g' backend/.env
fi

echo "=== 5. Running Database Migrations ==="
cd "$PROJECT_DIR/backend"
python manage.py migrate

echo "=== 6. Collecting Static Files ==="
python manage.py collectstatic --noinput

echo "=== 7. Populating Sample University Data ==="
python seed_data.py

echo ""
echo "====================================================================="
echo "Setup Complete!"
echo "Now follow these steps in your PythonAnywhere Web Dashboard:"
echo "1. Go to the 'Web' tab and click 'Add a new web app'."
echo "2. Choose 'Manual configuration' and select Python 3.10 (or 3.11)."
echo "3. Under 'Code':"
echo "   - Source code: /home/$USER_NAME/Finals-Project/backend"
echo "   - Working directory: /home/$USER_NAME/Finals-Project/backend"
echo "4. Under 'Virtualenv':"
echo "   - Path: /home/$USER_NAME/.virtualenvs/acadex-env"
echo "5. Under 'Static files':"
echo "   - URL: /static/    Path: /home/$USER_NAME/Finals-Project/backend/staticfiles"
echo "   - URL: /media/     Path: /home/$USER_NAME/Finals-Project/backend/media"
echo "6. Click your WSGI configuration file (/var/www/${USER_NAME}_pythonanywhere_com_wsgi.py) and paste:"
echo "---------------------------------------------------------------------"
cat << EOF
import os
import sys

username = '$USER_NAME'
path = f'/home/{username}/Finals-Project/backend'

if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
EOF
echo "---------------------------------------------------------------------"
echo "7. Click the green 'Reload <your-username>.pythonanywhere.com' button at the top!"
echo "====================================================================="
