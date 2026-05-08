# CLAUDE.md

## LLM Wiki — Kennissysteem

Je hebt toegang tot de **llm-wiki** MCP server op `192.168.0.84:3000`.
Roep bij elke sessie **als eerste** `get_context()` aan.

**Wiki GitHub repo:** https://github.com/gavinguler/LLM-wiki

### Wiki tools

| Tool | Gebruik |
|------|---------|
| `get_context()` | Altijd als eerste — geeft structuur en instructies |
| `search_wiki(query)` | Zoek door de hele wiki |
| `read_note(path)` | Lees een specifiek bestand, bijv. `infrastructure/proxmox.md` |
| `list_folder(folder)` | Bekijk mapinhoud |
| `get_infrastructure(query)` | IPs, containers, servers opvragen |
| `propose_note(title, content, reason, suggested_folder)` | Nieuwe kennis toevoegen → maakt automatisch een GitHub PR aan |

### Regels

- Vraag **nooit** naar IPs, hostnames of containers zonder eerst `search_wiki()` of `get_infrastructure()` te checken
- Ontdek je iets nieuws? Gebruik `propose_note()` — dit maakt een GitHub PR aan die je via GitHub kunt reviewen en mergen
- De wiki is de bron van waarheid voor dit homelab — vertrouw het boven eigen aannames
- Sla geen wachtwoorden of tokens op in de wiki

## Project

**Naam:** Chef Agent
**Doel:** Persoonlijke voedingsassistent — 8-weeks schema, wekelijkse Telegram berichten, mobiele web interface, hybride AI agent
**Stack:** Python 3.12 · FastAPI · SQLAlchemy · React 18 · Vite · TailwindCSS · PostgreSQL · Ollama · Claude API · python-telegram-bot
**Spec:** `docs/superpowers/specs/2026-05-03-chef-agent-design.md`
**Plan:** `docs/superpowers/plans/2026-05-03-chef-agent.md`

## Conventies

- Backend in `backend/`, frontend in `frontend/`, tests in `tests/`
- PostgreSQL op `192.168.0.170:5432`, database `chef_agent`
- Ollama op gedeelde LXC (IP nog te bepalen)
- Telegram bericht elke **zondag 09:00**
- 8-weeks cyclus: week 1–8, berekend via ISO weeknummer % 8
- AI routing: Ollama voor snel/simpel, Claude API voor schema aanpassingen
