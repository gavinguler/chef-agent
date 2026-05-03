.PHONY: up down migrate seed test dev pull-model

up:
	docker compose up -d

down:
	docker compose down

migrate:
	.venv/bin/alembic upgrade head

seed:
	.venv/bin/python -m backend.db.seed

test:
	.venv/bin/pytest tests/ -v

dev:
	.venv/bin/uvicorn backend.main:app --reload --port 8000

pull-model:
	docker compose exec ollama ollama pull llama3.1:8b
