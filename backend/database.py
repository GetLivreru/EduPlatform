"""
Централизованное подключение к MongoDB для всего приложения
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load .env файл
env_path = os.path.join(os.path.dirname(__file__), '.env')
try:
    load_dotenv(env_path, encoding='utf-8')
except:
    pass

# MongoDB connection - единое подключение для всего приложения
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Создаем глобальный клиент
_client = None
_db = None

def get_client():
    """Получить MongoDB клиент (создает если не существует)"""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URL)
        print(f"🔗 Создано новое подключение к MongoDB: {MONGODB_URL[:50]}...")
    return _client

def get_database():
    """Получить базу данных LearnApp"""
    global _db
    if _db is None:
        client = get_client()
        _db = client.LearnApp
        print("📂 Подключена база данных LearnApp")
    return _db

# Экспортируем для удобства
client = get_client()
db = get_database() 