#!/bin/bash
# Octopus deployment process script
# Add this as a "Run a Script" step in the Octopus deployment process
# Step target: role "chef-agent"
set -e

APP_DIR=/opt/chef-agent
echo "=== Deploying Chef Agent ==="
cd "$APP_DIR"

echo "Pulling latest code from main..."
git fetch origin master
git reset --hard origin/master

echo "Installing Python dependencies..."
.venv/bin/pip install -r requirements.txt --quiet

echo "Building frontend..."
cd frontend
npm ci --silent
npm run build
cd "$APP_DIR"

echo "Running database migrations..."
.venv/bin/alembic upgrade head

echo "Restarting service..."
systemctl restart chef-agent
sleep 2
systemctl is-active --quiet chef-agent \
  && echo "chef-agent is running" \
  || { echo "chef-agent failed to start!"; journalctl -u chef-agent -n 20; exit 1; }

echo "=== Deploy complete! ==="
