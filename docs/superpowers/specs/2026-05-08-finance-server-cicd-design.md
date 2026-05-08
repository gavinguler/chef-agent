# Finance Server & CI/CD Pipeline — Design

**Datum:** 2026-05-08  
**Project:** Chef Agent  
**Scope:** Nieuwe Proxmox VM "finance-server", Octopus Deploy deployment target, GitHub Actions CI/CD pipeline voor automatische deploys bij merge naar master.

---

## Doel

De Chef Agent app migreren van LXC 224 (Python direct) naar een nieuwe Proxmox VM (VMID 225) waar de app in Docker draait. CI/CD via GitHub Actions + Octopus Deploy zodat elke merge naar master automatisch een nieuwe deploy triggert. De finance server wordt de centrale Docker host voor meerdere apps (chef-agent nu, bonnetje-app en finance-app later).

---

## Infrastructuur

### Finance Server VM

| Eigenschap | Waarde |
|-----------|--------|
| Type | Proxmox VM (geen LXC — stabielere Docker support) |
| VMID | `225` |
| IP | `192.168.0.225` |
| Naam | `finance-server` |
| OS | Ubuntu 24.04 LTS |
| CPU | 4 cores |
| RAM | 4 GB |
| Disk | 40 GB |
| Software | Docker, Docker Compose, Octopus Polling Tentacle, GitHub Actions self-hosted runner |

### Bestaande LXC 224 (chef-agent, 192.168.0.200)

Wordt gestopt en verwijderd zodra de finance server operationeel is en de deploy succesvol is verlopen.

### Octopus Polling Tentacle

Geïnstalleerd via een **nieuw runbook** "Install Polling Tentacle (VM)" in het "Homelab Operations" project (Projects-1).

De bestaande "Install Polling Tentacle" runbook gebruikt `pct exec` — dat werkt alleen op LXC containers. Voor een VM is SSH vereist. Het nieuwe runbook SSHt rechtstreeks in de VM en installeert de Tentacle daar.

Vereiste variabelen voor het runbook:

| Variabele | Waarde |
|-----------|--------|
| `VM_IP` | `192.168.0.225` |
| `VM_NAME` | `finance-server` |
| `VM_SSH_PASSWORD` | Root wachtwoord van de VM (sensitive) |
| `OCTOPUS_API_KEY` | Sensitive project variabele |

Het runbook script (draait op de Octopus worker):
```bash
ssh root@$VM_IP "
  apt-get install -y --no-install-recommends libicu-dev
  curl -L https://octopus.com/downloads/latest/linux_x64/tentacle -o /tmp/tentacle.tar.gz
  mkdir -p /opt/octopus/tentacle && tar xf /tmp/tentacle.tar.gz -C /opt/octopus/tentacle
  /opt/octopus/tentacle/Tentacle configure --nologo --instance=Tentacle \
    --home=/etc/octopus --app=/home/Octopus/Applications \
    --commsStyle=TentacleActive \
    --server=http://192.168.0.210:8080 \
    --apiKey=$OCTOPUS_API_KEY \
    --role=homelab-target \
    --name=$VM_NAME \
    --env=home-lab
  /opt/octopus/tentacle/Tentacle service --install --start
"
```

De Tentacle registreert zichzelf automatisch in Octopus als deployment target met role `homelab-target`.

### GitHub Actions Self-hosted Runner

Draait op de finance server zelf. Geregistreerd onder de `gavinguler/Chef-agent` GitHub repo. Hierdoor kan GitHub Actions de lokale Octopus server bereiken op `192.168.0.210`.

---

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Triggert bij elke push naar `master`.

Stappen:
1. Checkout code
2. `docker build` → image opgeslagen als `.tar` pakket
3. Package pushen naar Octopus built-in feed via Octopus CLI
4. Octopus release aanmaken (versie = git SHA)
5. Octopus deploy-release naar environment `home-lab`

Vereiste GitHub secrets:
| Secret | Waarde |
|--------|--------|
| `OCTOPUS_SERVER_URL` | `http://192.168.0.210:8080` |
| `OCTOPUS_API_KEY` | Octopus API key |

### Octopus Deploy — project `chef-agent` (Projects-7)

Deployment step op de Tentacle van finance-server (role: `homelab-target`):

```bash
cd /opt/chef-agent
docker load -i #{Octopus.Action.Package.InstallationDirectoryPath}/chef-agent.tar
docker compose down && docker compose up -d
```

---

## App op de Finance Server

### Docker Compose (`/opt/chef-agent/docker-compose.yml`)

```yaml
services:
  chef-agent:
    image: chef-agent:latest
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
```

### Environment variabelen (`/opt/chef-agent/.env`)

Handmatig aangemaakt bij eerste setup (niet via Octopus, bevat secrets):

```
DATABASE_URL=postgresql://chef_agent:***@192.168.0.170:5432/chef_agent
TELEGRAM_BOT_TOKEN=***
ANTHROPIC_API_KEY=***
OLLAMA_BASE_URL=http://192.168.0.38:11434
```

PostgreSQL blijft op bestaande LXC 170 (`192.168.0.170:5432`). Geen databasemigratie nodig.

### Dockerfile (repo root)

Multi-stage build: frontend (React/Vite) wordt gebouwd en ingebakken in de Python container. De React SPA wordt geserveerd via de FastAPI catch-all route (bestaand gedrag).

```dockerfile
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Volledige Deploy Flow (na implementatie)

```
GitHub master ← merge
  → GitHub Actions (self-hosted runner op finance-server)
  → docker build
  → package push naar Octopus feed
  → Octopus create-release (versie = git SHA)
  → Octopus deploy-release → environment "home-lab"
  → Tentacle op finance-server:
      docker load
      docker compose down && docker compose up -d
  → Chef Agent bereikbaar op http://192.168.0.225:8000
```

---

## Toekomstige apps op finance-server

De finance server is opgezet als centrale Docker host. Later komen hier ook:

| App | Poort | Status |
|-----|-------|--------|
| chef-agent | 8000 | Dit project |
| bonnetje-app | 8001 | Toekomstig (nu op LXC 215) |
| finance-app | 4000 | Toekomstig (nu op LXC 216) |

Elke app krijgt een eigen Octopus project, eigen GitHub Actions workflow en eigen `/opt/<app>/` map met `docker-compose.yml` en `.env`.

---

## Implementatiestappen (overzicht)

1. Proxmox VM aanmaken (VMID 225, IP 192.168.0.225)
2. Ubuntu 24.04 installeren + Docker + Docker Compose
3. Nieuw runbook "Install Polling Tentacle (VM)" aanmaken in Homelab Operations + uitvoeren → Octopus deployment target
4. GitHub Actions self-hosted runner installeren op de VM
5. `Dockerfile` toevoegen aan de repo
6. `.github/workflows/deploy.yml` aanmaken
7. GitHub secrets instellen (`OCTOPUS_SERVER_URL`, `OCTOPUS_API_KEY`)
8. Octopus deployment step configureren voor project `chef-agent`
9. `/opt/chef-agent/docker-compose.yml` en `.env` aanmaken op de server
10. Eerste deploy testen
11. LXC 224 stoppen en verwijderen
12. Wiki updaten
