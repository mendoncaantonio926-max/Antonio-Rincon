from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{(BASE_DIR / '.localdata' / 'pulso-politico.db').as_posix()}"


class Settings(BaseSettings):
    app_name: str = "Pulso Politico API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    jwt_secret_key: str = "pulso-politico-dev-secret-key-2026-change-before-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    database_url: str = DEFAULT_DATABASE_URL
    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
