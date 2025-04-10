from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check_collections():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.LearnApp
    
    # Получаем список всех коллекций
    collections = await db.list_collection_names()
    print("Коллекции в базе данных:")
    for collection in collections:
        print(f"- {collection}")
    
    # Проверяем содержимое коллекции users
    users = await db.users.find().to_list(length=None)
    print("\nПользователи в базе данных:")
    for user in users:
        print(f"- {user['name']} ({user['login']})")

if __name__ == "__main__":
    asyncio.run(check_collections()) 