# Finance Server & CI/CD Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nieuwe Proxmox VM "finance-server" opzetten, Chef Agent in Docker deployen via Octopus Deploy, automatisch getriggerd door GitHub Actions bij elke merge naar master.

**Architecture:** Proxmox VM (VMID 225, 192.168.0.225) met Docker + Octopus Polling Tentacle + GitHub Actions self-hosted runner. Runner bouwt Docker image lokaal op de finance server, maakt Octopus release aan, Octopus deployt via Tentacle met docker compose. Geen externe registry nodig — image staat al op de server doordat de runner lokaal draait.

**Tech Stack:** Proxmox `qm` CLI · Ubuntu 24.04 cloud-init · Docker CE + Compose plugin · Octopus Polling Tentacle · GitHub Actions self-hosted runner · `OctopusDeploy/create-release-action@v3` · `OctopusDeploy/deploy-release-action@v3`

---

## File Map

| Bestand | Actie | Doel |
|---------|-------|------|
| `Dockerfile` | Nieuw | Multi-stage build: React frontend + Python backend |
| `.dockerignore` | Nieuw | Sluit `.venv`, `node_modules`, `.git`, `.env` uit van build context |
| `.github/workflows/deploy.yml` | Nieuw | CI/CD: docker build → Octopus create-release → deploy |
| `/opt/chef-agent/docker-compose.yml` | Nieuw (op server) | Definieert chef-agent container op finance server |
| `/opt/chef-agent/.env` | Nieuw (op server) | Secrets: DATABASE\_URL, TELEGRAM\_BOT\_TOKEN, etc. |

---

## Phase 1: Proxmox VM aanmaken

### Task 1: Finance server VM aanmaken op Proxmox

**Files:** geen

- [ ] **Stap 1: SSH naar Proxmox host**

```bash
ssh root@192.168.0.197
```

- [ ] **Stap 2: Ubuntu 24.04 cloud image downloaden**

```bash
wget -q https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img \
  -O /var/lib/vz/template/iso/ubuntu-24.04-cloud.img
```

Verwacht: bestand van ~600 MB opgeslagen in `/var/lib/vz/template/iso/`

- [ ] **Stap 3: VM aanmaken**

```bash
qm create 225 \
  --name finance-server \
  --memory 4096 \
  --cores 4 \
  --net0 virtio,bridge=vmbr0 \
  --scsihw virtio-scsi-pci \
  --ostype l26 \
  --agent enabled=1 \
  --serial0 socket \
  --vga serial0
```

- [ ] **Stap 4: Cloud image importeren als schijf**

```bash
qm importdisk 225 /var/lib/vz/template/iso/ubuntu-24.04-cloud.img local-lvm
```

Verwacht: `Successfully imported disk as 'unused0:local-lvm:vm-225-disk-0'`

- [ ] **Stap 5: Schijf + cloud-init configureren**

Kies een sterk root wachtwoord en bewaar het — je hebt het nodig in Task 3 voor het Tentacle runbook.

```bash
qm set 225 \
  --scsi0 local-lvm:vm-225-disk-0,size=40G \
  --ide2 local-lvm:cloudinit \
  --boot order=scsi0 \
  --ipconfig0 ip=192.168.0.225/24,gw=192.168.0.1 \
  --nameserver 192.168.0.54 \
  --ciuser root \
  --cipassword "KIES_EEN_STERK_WACHTWOORD" \
  --sshkeys /root/.ssh/authorized_keys
```

- [ ] **Stap 6: VM starten en wachten op boot**

```bash
qm start 225
sleep 40
```

- [ ] **Stap 7: SSH toegang verifiëren**

```bash
ssh -o StrictHostKeyChecking=no root@192.168.0.225 "echo 'VM is bereikbaar'"
```

Verwacht: `VM is bereikbaar`

---

### Task 2: Docker installeren op de finance server

**Files:** geen

- [ ] **Stap 1: Docker CE installeren via officiële apt repository**

```bash
ssh root@192.168.0.225 << 'EOF'
set -e
apt-get update -qq
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
EOF
```

- [ ] **Stap 2: Docker verifiëren**

```bash
ssh root@192.168.0.225 "docker --version && docker compose version"
```

Verwacht:
```
Docker version 27.x.x, build ...
Docker Compose version v2.x.x
```

- [ ] **Stap 3: Test container draaien**

```bash
ssh root@192.168.0.225 "docker run --rm hello-world 2>&1 | grep 'Hello from Docker'"
```

Verwacht: `Hello from Docker!`

---

## Phase 2: Octopus Tentacle via runbook

### Task 3: Runbook "Install Polling Tentacle (VM)" aanmaken in Octopus

**Files:** geen (configuratie in Octopus UI op `http://192.168.0.210:8080`)

De bestaande "Install Polling Tentacle" runbook gebruikt `pct exec` (werkt alleen op LXC). Dit nieuwe runbook gebruikt SSH om de Tentacle op een VM te installeren.

- [ ] **Stap 1: Naar Octopus UI navigeren**

Open `http://192.168.0.210:8080` → Project **Homelab Operations** → Runbooks → **Add Runbook**

Naam: `Install Polling Tentacle (VM)`

- [ ] **Stap 2: Runbook process stap toevoegen**

Klik "Define your runbook process" → Add Step → Script → **Run a Script**

Stap naam: `Install Tentacle via SSH`

Script body:
```bash
#!/bin/bash
set -e

# sshpass installeren op de Octopus worker (LXC 210) als dat nog niet bestaat
if ! command -v sshpass &>/dev/null; then
  apt-get install -y sshpass
fi

# Script dat op de VM zelf wordt uitgevoerd
INSTALL_SCRIPT=$(cat << 'REMOTE'
set -e
apt-get update -qq
apt-get install -y --no-install-recommends libicu-dev curl

curl -sL https://octopus.com/downloads/latest/linux_x64/tentacle -o /tmp/tentacle.tar.gz
mkdir -p /opt/octopus/tentacle
tar xf /tmp/tentacle.tar.gz -C /opt/octopus/tentacle
ln -sf /opt/octopus/tentacle/Tentacle /usr/local/bin/Tentacle

Tentacle create-instance --instance Tentacle --config /etc/octopus/Tentacle.config
Tentacle new-certificate --instance Tentacle
Tentacle configure --instance Tentacle --app /home/Octopus/Applications
REMOTE
)

sshpass -p "${VM_SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${VM_IP} "bash -s" <<< "${INSTALL_SCRIPT}"

# Tentacle registreren bij Octopus als Polling Tentacle
sshpass -p "${VM_SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${VM_IP} \
  "/usr/local/bin/Tentacle register-with \
    --instance Tentacle \
    --server http://192.168.0.210:8080 \
    --apiKey ${OCTOPUS_API_KEY} \
    --name ${VM_NAME} \
    --role homelab-target \
    --environment home-lab \
    --comms-style TentacleActive \
  && /usr/local/bin/Tentacle service --install --start --instance Tentacle \
  && echo 'Tentacle geregistreerd en gestart'"
```

- [ ] **Stap 3: Projectvariabelen instellen als Prompted variables**

In Homelab Operations → Variables, voeg toe:

| Naam | Type | Beschrijving |
|------|------|-------------|
| `VM_IP` | Prompted | IP van de VM |
| `VM_NAME` | Prompted | Naam van de VM |
| `VM_SSH_PASSWORD` | Prompted + Sensitive | Root wachtwoord van de VM |
| `OCTOPUS_API_KEY` | Sensitive | `API-585964AE4A90970055BB2D016F110C1557E7B1B9` |

- [ ] **Stap 4: Runbook opslaan**

---

### Task 4: Runbook uitvoeren voor finance server

**Files:** geen

- [ ] **Stap 1: Runbook starten**

Octopus UI → Homelab Operations → Runbooks → "Install Polling Tentacle (VM)" → **Run**

Vul in:
- `VM_IP`: `192.168.0.225`
- `VM_NAME`: `finance-server`
- `VM_SSH_PASSWORD`: wachtwoord uit Task 1 stap 5

- [ ] **Stap 2: Log controleren na afloop**

Verwacht in de log:
```
Tentacle geregistreerd en gestart
```

- [ ] **Stap 3: Deployment target verifiëren**

Octopus UI → Infrastructure → Deployment Targets

Verwacht: `finance-server` zichtbaar met status **Healthy** en role `homelab-target`

---

## Phase 3: GitHub Actions self-hosted runner

### Task 5: Self-hosted runner installeren op finance server

**Files:** geen

- [ ] **Stap 1: Registration token ophalen**

Ga naar: `https://github.com/gavinguler/Chef-agent` → Settings → Actions → Runners → **New self-hosted runner**

Kies: Linux / x64. Kopieer de waarde na `--token` uit de weergegeven configuratieopdracht. Het token vervalt na 60 minuten.

- [ ] **Stap 2: Runner downloaden en uitpakken op de VM**

```bash
ssh root@192.168.0.225 << 'EOF'
set -e
mkdir -p /opt/actions-runner && cd /opt/actions-runner
curl -o runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf runner.tar.gz
EOF
```

- [ ] **Stap 3: Runner registreren**

Vervang `JOUW_TOKEN` met het token uit stap 1:

```bash
ssh root@192.168.0.225 \
  "cd /opt/actions-runner && ./config.sh \
    --url https://github.com/gavinguler/Chef-agent \
    --token JOUW_TOKEN \
    --name finance-server \
    --labels self-hosted,linux,finance-server \
    --unattended"
```

Verwacht: `Runner successfully added`

- [ ] **Stap 4: Runner als systemd service installeren**

```bash
ssh root@192.168.0.225 "cd /opt/actions-runner && ./svc.sh install && ./svc.sh start"
```

- [ ] **Stap 5: Runner online verifiëren**

Ga naar: `https://github.com/gavinguler/Chef-agent` → Settings → Actions → Runners

Verwacht: `finance-server` met status **Idle** (groen bolletje)

---

## Phase 4: Dockerfile en server-side bestanden

### Task 6: Dockerfile en .dockerignore schrijven

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Stap 1: .dockerignore schrijven**

Bestand: `/Users/gavinguler/Documents/github/Chef-agent/.dockerignore`

```
.venv/
.git/
.env
node_modules/
frontend/dist/
__pycache__/
*.pyc
*.pyo
tests/
docs/
alembic/versions/
*.md
.DS_Store
.playwright-mcp/
```

- [ ] **Stap 2: Dockerfile schrijven**

Bestand: `/Users/gavinguler/Documents/github/Chef-agent/Dockerfile`

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
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Stap 3: Docker image lokaal bouwen**

```bash
cd /Users/gavinguler/Documents/github/Chef-agent
docker build -t chef-agent:test .
```

Verwacht: build slaagt, laatste regels tonen `Successfully built` of `exporting layers`

- [ ] **Stap 4: Health endpoint testen in container**

```bash
docker run --rm -d -p 8001:8000 \
  -e DATABASE_URL="postgresql://chef_agent:changeme@host.docker.internal:5432/chef_agent" \
  -e TELEGRAM_BOT_TOKEN="test" \
  -e ANTHROPIC_API_KEY="test" \
  -e OLLAMA_BASE_URL="http://192.168.0.38:11434" \
  --name chef-test chef-agent:test

sleep 3
curl -sf http://localhost:8001/health
docker stop chef-test
```

Verwacht: `{"status":"ok"}`

- [ ] **Stap 5: Committen**

```bash
git add Dockerfile .dockerignore
git commit -m "feat: multi-stage Dockerfile voor chef-agent"
```

---

### Task 7: Server-side docker-compose.yml en .env aanmaken

**Files:** op de finance server onder `/opt/chef-agent/` — niet in de repo

- [ ] **Stap 1: Directory aanmaken**

```bash
ssh root@192.168.0.225 "mkdir -p /opt/chef-agent"
```

- [ ] **Stap 2: docker-compose.yml aanmaken**

```bash
ssh root@192.168.0.225 'cat > /opt/chef-agent/docker-compose.yml << '"'"'EOF'"'"'
services:
  chef-agent:
    image: chef-agent:latest
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
EOF'
```

- [ ] **Stap 3: Echte secrets ophalen van LXC 224**

```bash
ssh root@192.168.0.200 "find / -name .env 2>/dev/null | xargs grep -l DATABASE_URL 2>/dev/null | head -1 | xargs cat"
```

- [ ] **Stap 4: .env aanmaken op finance server met echte waarden**

```bash
ssh root@192.168.0.225 "cat > /opt/chef-agent/.env" << 'EOF'
DATABASE_URL=postgresql://chef_agent:ECHTE_WAARDE@192.168.0.170:5432/chef_agent
TELEGRAM_BOT_TOKEN=ECHTE_WAARDE
ANTHROPIC_API_KEY=ECHTE_WAARDE
OLLAMA_BASE_URL=http://192.168.0.38:11434
EOF
```

- [ ] **Stap 5: Permissions beveiligen**

```bash
ssh root@192.168.0.225 "chmod 600 /opt/chef-agent/.env"
```

---

## Phase 5: CI/CD configureren

### Task 8: Octopus deployment step configureren voor chef-agent

**Files:** geen (via Octopus MCP tool of UI)

> **Noot:** De runner draait op de finance server zelf, waardoor het gebouwde Docker image al lokaal aanwezig is. De deployment step hoeft het image daarom niet te laden vanuit een Octopus package — `docker compose up -d` pikt het lokale image automatisch op.

- [ ] **Stap 1: Bestaande deployment stappen controleren**

Controleer of het chef-agent project al stappen heeft via de Octopus MCP:
```
get_deployment_process(projectId: "Projects-7", spaceName: "Default")
```

Als er al stappen bestaan: verwijder ze via Octopus UI (chef-agent → Deployments → Process → stap verwijderen) zodat er geen dubbele stappen zijn.

- [ ] **Stap 2: Deployment step toevoegen via `add_deployment_step` MCP tool**

```
add_deployment_step(
  spaceName: "Default",
  projectId: "Projects-7",
  stepName: "Deploy chef-agent via Docker Compose",
  targetRole: "homelab-target",
  script: "cd /opt/chef-agent\ndocker compose down\ndocker compose up -d\necho \"Deploy voltooid — chef-agent draait op poort 8000\"\ndocker compose ps"
)
```

- [ ] **Stap 2: Deployment process verifiëren in Octopus UI**

Octopus UI → chef-agent → Deployments → Process

Verwacht: stap "Deploy chef-agent via Docker Compose" zichtbaar, assigned to role `homelab-target`

---

### Task 9: GitHub Actions workflow schrijven

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Stap 1: Workflow directory aanmaken**

```bash
mkdir -p /Users/gavinguler/Documents/github/Chef-agent/.github/workflows
```

- [ ] **Stap 2: deploy.yml schrijven**

Bestand: `.github/workflows/deploy.yml`

```yaml
name: Deploy Chef Agent

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Set release version
        id: version
        run: echo "sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Build Docker image
        run: docker build -t chef-agent:latest .

      - name: Create Octopus release
        uses: OctopusDeploy/create-release-action@v3
        with:
          api_key: ${{ secrets.OCTOPUS_API_KEY }}
          server: ${{ secrets.OCTOPUS_SERVER_URL }}
          space: Default
          project: chef-agent
          release_number: ${{ steps.version.outputs.sha }}

      - name: Deploy to home-lab
        uses: OctopusDeploy/deploy-release-action@v3
        with:
          api_key: ${{ secrets.OCTOPUS_API_KEY }}
          server: ${{ secrets.OCTOPUS_SERVER_URL }}
          space: Default
          project: chef-agent
          release_number: ${{ steps.version.outputs.sha }}
          environments: home-lab
          wait_for_deployment: "true"
```

- [ ] **Stap 3: Nog niet committen — eerst GitHub secrets instellen (Task 10)**

---

### Task 10: GitHub secrets instellen

**Files:** geen (GitHub repository settings)

- [ ] **Stap 1: OCTOPUS\_SERVER\_URL instellen**

Ga naar: `https://github.com/gavinguler/Chef-agent` → Settings → Secrets and variables → Actions → New repository secret

| Secret | Waarde |
|--------|--------|
| `OCTOPUS_SERVER_URL` | `http://192.168.0.210:8080` |

- [ ] **Stap 2: OCTOPUS\_API\_KEY instellen**

| Secret | Waarde |
|--------|--------|
| `OCTOPUS_API_KEY` | `API-585964AE4A90970055BB2D016F110C1557E7B1B9` |

- [ ] **Stap 3: Workflow committen en pushen**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: GitHub Actions CI/CD workflow voor automatische deploy via Octopus"
git push origin master
```

---

## Phase 6: Testen en opruimen

### Task 11: Eerste volledige deploy testen

**Files:** geen

- [ ] **Stap 1: GitHub Actions run monitoren**

Ga naar: `https://github.com/gavinguler/Chef-agent` → Actions → workflow "Deploy Chef Agent"

Verwacht: alle stappen groen — docker build, create-release, deploy-release

- [ ] **Stap 2: Octopus deployment monitoren**

Ga naar: `http://192.168.0.210:8080` → chef-agent → Deployments → Tasks

Verwacht: taak geslaagd, log eindigt met `Deploy voltooid`

- [ ] **Stap 3: Health endpoint verifiëren**

```bash
curl -s http://192.168.0.225:8000/health
```

Verwacht: `{"status":"ok"}`

- [ ] **Stap 4: Frontend verifiëren**

Open `http://192.168.0.225:8000` in een browser. Verwacht: React app laadt correct, weekplan en recepten zijn zichtbaar.

- [ ] **Stap 5: Container status verifiëren**

```bash
ssh root@192.168.0.225 "docker compose -f /opt/chef-agent/docker-compose.yml ps"
```

Verwacht: `chef-agent` met status `running`

---

### Task 12: LXC 224 stoppen en verwijderen

**Files:** geen

Voer dit pas uit nadat Task 11 volledig succesvol is.

- [ ] **Stap 1: LXC 224 stoppen**

```bash
ssh root@192.168.0.197 "pct stop 224"
```

Verwacht: geen output (stil succes)

- [ ] **Stap 2: LXC 224 verwijderen**

```bash
ssh root@192.168.0.197 "pct destroy 224"
```

Verwacht: `(100.00%) TASK OK`

---

### Task 13: Wiki updaten

**Files:** LLM Wiki via `propose_note` MCP tool

- [ ] **Stap 1: proxmox.md updaten**

Gebruik `propose_note` om `infrastructure/proxmox.md` bij te werken:
- Verwijder VMID 224 (`chef-agent`) uit de containers-tabel
- Voeg toe aan de VMs-tabel: `| 225 | finance-server | 192.168.0.225 | running | Finance server — Docker host voor chef-agent, bonnetje-app, finance-app |`

- [ ] **Stap 2: network.md updaten**

Voeg toe aan de netwerktabel:
`| 192.168.0.225 | 225 | finance-server | Proxmox VM | Finance server — Docker host voor chef-agent (poort 8000), bonnetje-app, finance-app |`

- [ ] **Stap 3: chef-agent.md updaten**

Update de deployment sectie:
- URL: `http://192.168.0.225:8000`
- LXC 224 → VM 225 (`finance-server`)
- Deployment methode: Docker op finance-server via Octopus Deploy + GitHub Actions CI/CD
