#!/bin/bash
set -e

echo "=== Chef Agent Proxmox Setup ==="
echo "Container IP: 192.168.0.200"

# Vereisten
apt-get update
apt-get install -y git curl postgresql-client python3-pip python3 python3-venv

PYTHON=python3

# Node.js 20 via NodeSource (distro-pakket te oud voor vite/react-router)
if ! node --version 2>/dev/null | grep -qE '^v(1[89]|[2-9][0-9])'; then
  apt-get remove -y --purge nodejs npm libnode-dev libnode108 libnode72 2>/dev/null || true
  apt-get autoremove -y 2>/dev/null || true
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Gebruiker aanmaken
useradd -m -s /bin/bash chef || true

# App directory
mkdir -p /opt/chef-agent
cd /opt/chef-agent

# Code clonen of updaten
git clone https://github.com/gavinguler/chef-agent.git . 2>/dev/null || git pull --ff-only

# Python venv
$PYTHON -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

# Frontend build
if command -v node &>/dev/null; then
  cd /opt/chef-agent/frontend && npm ci && npm run build
  echo "Frontend gebouwd in frontend/dist/"
fi

# Environment file
if [ ! -f /opt/chef-agent/.env ]; then
  cp /opt/chef-agent/.env.example /opt/chef-agent/.env
  echo ""
  echo "BELANGRIJK: Vul /opt/chef-agent/.env in met echte waarden:"
  echo "  DATABASE_URL=postgresql://chef_agent:***@192.168.0.170:5432/chef_agent"
  echo "  TELEGRAM_BOT_TOKEN=..."
  echo "  TELEGRAM_CHAT_ID=..."
  echo "  ANTHROPIC_API_KEY=..."
  echo "  OLLAMA_BASE_URL=http://<ollama-ip>:11434"
  echo ""
  echo "Na invullen, herstart het script: bash /opt/chef-agent/deploy/setup.sh"
  echo "Of start de service handmatig na migraties: systemctl start chef-agent"
  exit 0
fi

# Database migraties (vereist dat DATABASE_URL correct is in .env)
cd /opt/chef-agent
.venv/bin/alembic upgrade head

# Seed data
.venv/bin/python -m backend.db.seed

# Eigenaarschap instellen voor de service user
chown -R chef:chef /opt/chef-agent

# Systemd service
cp /opt/chef-agent/deploy/chef-agent.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable chef-agent
systemctl start chef-agent

echo ""
echo "=== Setup klaar! ==="
echo "Status: systemctl status chef-agent"
echo "Logs:   journalctl -u chef-agent -f"
echo "URL:    http://192.168.0.200:8000"
