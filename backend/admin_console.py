import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models import UserCreate
from passlib.context import CryptContext
import getpass

# Настройка подключения к MongoDB
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.quiz_platform
users_collection = db.users

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    print("Создание администратора")
    print("=====================")
    
    name = input("Введите ФИО: ")
    login = input("Введите email: ")
    password = getpass.getpass("Введите пароль: ")
    confirm_password = getpass.getpass("Подтвердите пароль: ")
    
    if password != confirm_password:
        print("Пароли не совпадают!")
        return
    
    # Проверяем, существует ли уже пользователь с таким email
    existing_user = await users_collection.find_one({"login": login})
    if existing_user:
        print("Пользователь с таким email уже существует!")
        return
    
    # Создаем нового пользователя
    hashed_password = pwd_context.hash(password)
    user = UserCreate(
        name=name,
        login=login,
        password=hashed_password,
        is_admin=True
    )
    
    # Сохраняем в базу данных
    result = await users_collection.insert_one(user.dict())
    print(f"\nАдминистратор успешно создан! ID: {result.inserted_id}")

async def list_admin_users():
    print("\nСписок администраторов")
    print("=====================")
    admins = users_collection.find({"is_admin": True})
    async for admin in admins:
        print(f"ID: {admin['_id']}")
        print(f"Имя: {admin['name']}")
        print(f"Email: {admin['login']}")
        print("---------------------")

async def main():
    while True:
        print("\nМеню администратора")
        print("1. Создать администратора")
        print("2. Показать список администраторов")
        print("3. Выход")
        
        choice = input("\nВыберите действие (1-3): ")
        
        if choice == "1":
            await create_admin_user()
        elif choice == "2":
            await list_admin_users()
        elif choice == "3":
            print("До свидания!")
            break
        else:
            print("Неверный выбор. Попробуйте снова.")

if __name__ == "__main__":
    asyncio.run(main()) 