"""
Централизованное подключение к MongoDB для всего приложения
Оптимизировано для Vercel serverless environment
Убрана проблема с глобальными переменными - создается новое подключение для каждого запроса
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

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

async def get_client():
    """Получить MongoDB клиент (создает новое подключение каждый раз)"""
    try:
        print(f"🔄 Создаем СВЕЖЕЕ подключение к MongoDB...")
        print(f"🔗 URL: {MONGODB_URL[:50]}...")
        
        # Создаем НОВЫЙ клиент каждый раз для serverless
        client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=10000,  # Увеличили таймаут
            connectTimeoutMS=10000,          # Увеличили таймаут
            maxPoolSize=1,                   # Минимальный пул для serverless
            retryWrites=True,
            maxIdleTimeMS=30000             # Закрывать неактивные соединения через 30 сек
        )
        
        print(f"🔄 Тестируем подключение...")
        # Проверяем подключение
        await client.admin.command('ping')
        print(f"✅ MongoDB подключена успешно!")
        
        return client
        
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА подключения к MongoDB:")
        print(f"❌ Тип ошибки: {type(e).__name__}")
        print(f"❌ Сообщение: {str(e)}")
        print(f"❌ URL (частично): {MONGODB_URL[:50]}...")
        raise

async def get_database():
    """Получить базу данных LearnApp"""
    client = await get_client()
    db = client.LearnApp
    print("📂 База данных LearnApp готова")
    return db

# Синхронная версия для обратной совместимости (не рекомендуется использовать)
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