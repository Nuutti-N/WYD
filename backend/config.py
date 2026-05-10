
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database_url
    DATABASE_URL: str

    # Auth
    algorithm: str = "HS256"
    jwt_key: str
    jwt_refresh_key: str

    class Config:
        env_file = ".env"


settings = Settings()
