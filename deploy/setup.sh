#!/bin/bash
set -e

echo "=== Chef Agent Proxmox Setup ==="
echo "Container IP: 192.168.0.200"

# Vereisten
apt-get update && apt-get install -y python3.12 python3.12-venv python3-pip git postgresql-client

# Gebruiker aanmaken
useradd -m -s /bin/bash chef || true

# App directory
mkdir -p /opt/chef-agent
cd /opt/chef-agent

# Code clonen of updaten
git clone https://github.com/gavinguler/chef-agent.git . 2>/dev/null || git pull

# Python venv
python3.12 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

# Frontend build
if command -v node &>/dev/null; then
  cd frontend && npm ci && npm run build && cd ..
  echo "Frontend gebouwd in frontend/dist/"
fi

# Environment file
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "BELANGRIJK: Vul .env in met echte waarden!"
  echo "  DATABASE_URL=postgresql://chef_agent:***@192.168.0.170:5432/chef_agent"
  echo "  TELEGRAM_BOT_TOKEN=..."
  echo "  TELEGRAM_CHAT_ID=..."
  echo "  ANTHROPIC_API_KEY=..."
  echo "  OLLAMA_BASE_URL=http://<ollama-ip>:11434"
  echo ""
  echo "Daarna: systemctl start chef-agent"
  exit 0
fi

# Database migraties
.venv/bin/alembic upgrade head

# Seed data
.venv/bin/python -m backend.db.seed

# Systemd service
cp deploy/chef-agent.service /etc/systemd/system/
chown -R chef:chef /opt/chef-agent
systemctl daemon-reload
systemctl enable chef-agent
systemctl start chef-agent

echo ""
echo "=== Setup klaar! ==="
echo "Status: systemctl status chef-agent"
echo "Logs:   journalctl -u chef-agent -f"
echo "URL:    http://192.168.0.200:8000"
