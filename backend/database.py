"""
Централизованное подключение к MongoDB для всего приложения
Оптимизировано для Vercel serverless environment
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

# Load .env файл
env_path = os.path.join(os.path.dirname(__file__), '.env')
try:
    load_dotenv(env_path, encoding='utf-8')
except:
    pass

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Глобальные переменные для подключений
_client = None
_db = None

async def get_client():
    """Получить MongoDB клиент (создает если не существует)"""
    global _client
    if _client is None:
        try:
            # Создаем клиент с настройками для serverless
            _client = AsyncIOMotorClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=5000,  # 5 секунд таймаут
                connectTimeoutMS=5000,          # 5 секунд на подключение
                maxPoolSize=1,                  # Минимальный пул для serverless
                retryWrites=True
            )
            # Проверяем подключение
            await _client.admin.command('ping')
            print(f"✅ MongoDB подключена: {MONGODB_URL[:50]}...")
        except Exception as e:
            print(f"❌ Ошибка подключения к MongoDB: {e}")
            _client = None
            raise
    return _client

async def get_database():
    """Получить базу данных LearnApp"""
    global _db
    if _db is None:
        client = await get_client()
        _db = client.LearnApp
        print("📂 База данных LearnApp готова")
    return _db

# Синхронная версия для импорта (будет создавать подключения по требованию)
def get_sync_client():
    """Синхронная версия получения клиента"""
    try:
        return AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            maxPoolSize=1,
            retryWrites=True
        )
    except Exception as e:
        print(f"❌ Ошибка создания MongoDB клиента: {e}")
        return None

# Экспортируем синхронные версии для обратной совместимости
client = get_sync_client()
db = client.LearnApp if client else None 