import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend directory (two levels up from this file) with encoding fallback
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
try:
    load_dotenv(env_path, encoding='utf-8')
except UnicodeDecodeError:
    try:
        load_dotenv(env_path, encoding='utf-16')
    except Exception:
        # If all encoding attempts fail, continue without .env
        pass
except FileNotFoundError:
    # .env file doesn't exist - continue with defaults
    pass

class Settings(BaseSettings):
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DB_NAME: str = "LearnApp"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    
    # OpenAI API key for AI service
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 