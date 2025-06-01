#!/usr/bin/env python3
"""
Скрипт для тестирования системы ролей
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models import UserRole
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def test_roles():
    """
    Тестирует создание пользователей с разными ролями
    """
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.LearnApp
    
    # Тестовые пользователи с разными ролями
    test_users = [
        {
            "name": "Студент Тестов",
            "login": "student@test.com",
            "password": "password123",
            "role": UserRole.student.value,
            "quiz_points": 0,
            "created_at": datetime.now()
        },
        {
            "name": "Преподаватель Тестов",
            "login": "teacher@test.com", 
            "password": "password123",
            "role": UserRole.teacher.value,
            "quiz_points": 0,
            "created_at": datetime.now()
        },
        {
            "name": "Администратор Тестов",
            "login": "admin@test.com",
            "password": "password123", 
            "role": UserRole.admin.value,
            "quiz_points": 0,
            "created_at": datetime.now()
        }
    ]
    
    for user_data in test_users:
        # Проверяем, существует ли пользователь
        existing = await db.users.find_one({"login": user_data["login"]})
        if existing:
            print(f"Пользователь {user_data['login']} уже существует")
            continue
            
        # Хешируем пароль
        user_data["password"] = pwd_context.hash(user_data["password"])
        
        # Создаем пользователя
        result = await db.users.insert_one(user_data)
        print(f"Создан пользователь {user_data['name']} с ролью {user_data['role']} (ID: {result.inserted_id})")
    
    # Выводим статистику по ролям
    print("\nСтатистика пользователей по ролям:")
    for role in UserRole:
        count = await db.users.count_documents({"role": role.value})
        print(f"- {role.value}: {count} пользователей")
    
    # Проверяем миграцию старых пользователей с is_admin
    old_admins = await db.users.count_documents({"is_admin": True, "role": {"$exists": False}})
    if old_admins > 0:
        print(f"\nНайдено {old_admins} старых администраторов без роли")
        print("Мигрируем их...")
        await db.users.update_many(
            {"is_admin": True, "role": {"$exists": False}},
            {"$set": {"role": UserRole.admin.value}}
        )
        print("Миграция завершена")
    
    # Устанавливаем роль по умолчанию для пользователей без роли
    users_without_role = await db.users.count_documents({"role": {"$exists": False}})
    if users_without_role > 0:
        print(f"\nНайдено {users_without_role} пользователей без роли")
        print("Устанавливаем роль 'student' по умолчанию...")
        await db.users.update_many(
            {"role": {"$exists": False}},
            {"$set": {"role": UserRole.student.value}}
        )
        print("Обновление завершено")
    
    print("\nТестирование системы ролей завершено!")
    client.close()

if __name__ == "__main__":
    asyncio.run(test_roles()) 