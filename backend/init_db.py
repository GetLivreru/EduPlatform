from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.LearnApp

    try:
        # Очищаем существующие коллекции
        await db.quizzes.delete_many({})
        await db.learning_paths.delete_many({})


        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_db()) 