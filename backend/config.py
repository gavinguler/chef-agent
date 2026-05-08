from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    test_database_url: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    cycle_anchor_year: int = 2026
    cycle_anchor_iso_week: int = 18  # ISO week die overeenkomt met cyclus week 1
    github_token: str = ""  # PAT met contents:write op gavinguler/LLM-wiki

settings = Settings()
