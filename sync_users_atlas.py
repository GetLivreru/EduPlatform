#!/usr/bin/env python3
"""
Скрипт для синхронизации пользователей между локальной MongoDB и Atlas
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def get_users_from_db(client, db_name="LearnApp"):
    """
    Получает список пользователей из базы данных
    """
    db = client[db_name]
    users_collection = db.users  # Предполагаем что пользователи в коллекции 'users'
    
    users = []
    async for user in users_collection.find({}):
        users.append(user)
    
    return users

async def sync_users():
    """
    Синхронизирует пользователей между локальной MongoDB и Atlas
    """
    print("👥 Синхронизация пользователей между локальной MongoDB и Atlas")
    print("=" * 60)
    
    # Подключения
    local_uri = "mongodb://localhost:27017"
    
    print("🔗 Введите Atlas Connection String:")
    atlas_uri = input("Atlas URI: ").strip()
    
    if not atlas_uri:
        print("❌ Atlas URI обязателен!")
        return
    
    # Добавляем базу данных если её нет
    if "/LearnApp" not in atlas_uri:
        if "?" in atlas_uri:
            atlas_uri = atlas_uri.replace("?", "/LearnApp?")
        else:
            atlas_uri = f"{atlas_uri}/LearnApp"
    
    try:
        # Подключение к локальной MongoDB
        print("🔌 Подключение к локальной MongoDB...")
        local_client = AsyncIOMotorClient(local_uri)
        await local_client.admin.command('ping')
        print("✅ Локальная MongoDB подключена")
        
        # Подключение к Atlas
        print("🌍 Подключение к Atlas...")
        atlas_client = AsyncIOMotorClient(atlas_uri)
        await atlas_client.admin.command('ping')
        print("✅ Atlas подключен")
        
        # Получаем пользователей из локальной БД
        print("\n📥 Получение пользователей из локальной БД...")
        local_users = await get_users_from_db(local_client)
        print(f"Найдено локальных пользователей: {len(local_users)}")
        
        # Получаем пользователей из Atlas
        print("📥 Получение пользователей из Atlas...")
        atlas_users = await get_users_from_db(atlas_client)
        print(f"Найдено пользователей в Atlas: {len(atlas_users)}")
        
        # Анализ различий
        print(f"\n🔍 Анализ различий...")
        
        # Создаем словари для быстрого поиска
        local_users_dict = {user.get('email', user.get('username', str(user.get('_id')))): user for user in local_users}
        atlas_users_dict = {user.get('email', user.get('username', str(user.get('_id')))): user for user in atlas_users}
        
        # Пользователи только в локальной БД
        only_local = []
        for key, user in local_users_dict.items():
            if key not in atlas_users_dict:
                only_local.append(user)
        
        # Пользователи только в Atlas
        only_atlas = []
        for key, user in atlas_users_dict.items():
            if key not in local_users_dict:
                only_atlas.append(user)
        
        # Показываем результаты
        print(f"👤 Пользователи только локально: {len(only_local)}")
        for user in only_local:
            print(f"   - {user.get('email', user.get('username', 'Unknown'))}")
        
        print(f"👤 Пользователи только в Atlas: {len(only_atlas)}")
        for user in only_atlas:
            print(f"   - {user.get('email', user.get('username', 'Unknown'))}")
        
        # Предлагаем варианты синхронизации
        if only_local or only_atlas:
            print(f"\n🔄 Варианты синхронизации:")
            print("1. Добавить локальных пользователей в Atlas")
            print("2. Добавить Atlas пользователей в локальную БД")
            print("3. Полная синхронизация (объединить всех)")
            print("4. Ничего не делать")
            
            choice = input("\nВыберите вариант (1-4): ").strip()
            
            if choice == "1":
                await sync_local_to_atlas(local_client, atlas_client, only_local)
            elif choice == "2":
                await sync_atlas_to_local(local_client, atlas_client, only_atlas)
            elif choice == "3":
                await sync_local_to_atlas(local_client, atlas_client, only_local)
                await sync_atlas_to_local(local_client, atlas_client, only_atlas)
            else:
                print("Синхронизация отменена")
        else:
            print("✅ Пользователи уже синхронизированы!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        # Закрываем соединения
        if 'local_client' in locals():
            local_client.close()
        if 'atlas_client' in locals():
            atlas_client.close()

async def sync_local_to_atlas(local_client, atlas_client, users_to_sync):
    """
    Добавляет пользователей из локальной БД в Atlas
    """
    if not users_to_sync:
        return
    
    print(f"\n➡️  Добавление {len(users_to_sync)} пользователей в Atlas...")
    
    atlas_db = atlas_client.LearnApp
    atlas_users = atlas_db.users
    
    for user in users_to_sync:
        try:
            # Удаляем _id чтобы MongoDB создал новый
            user_copy = user.copy()
            if '_id' in user_copy:
                del user_copy['_id']
            
            result = await atlas_users.insert_one(user_copy)
            print(f"✅ Добавлен: {user.get('email', user.get('username', 'Unknown'))}")
        except Exception as e:
            print(f"❌ Ошибка добавления {user.get('email', 'Unknown')}: {e}")

async def sync_atlas_to_local(local_client, atlas_client, users_to_sync):
    """
    Добавляет пользователей из Atlas в локальную БД
    """
    if not users_to_sync:
        return
    
    print(f"\n⬅️  Добавление {len(users_to_sync)} пользователей в локальную БД...")
    
    local_db = local_client.LearnApp
    local_users = local_db.users
    
    for user in users_to_sync:
        try:
            # Удаляем _id чтобы MongoDB создал новый
            user_copy = user.copy()
            if '_id' in user_copy:
                del user_copy['_id']
            
            result = await local_users.insert_one(user_copy)
            print(f"✅ Добавлен: {user.get('email', user.get('username', 'Unknown'))}")
        except Exception as e:
            print(f"❌ Ошибка добавления {user.get('email', 'Unknown')}: {e}")

async def show_all_users():
    """
    Показывает всех пользователей из обеих баз данных
    """
    print("👥 Просмотр всех пользователей")
    print("=" * 30)
    
    # Локальная база
    local_uri = "mongodb://localhost:27017"
    
    # Atlas
    print("🔗 Введите Atlas Connection String:")
    atlas_uri = input("Atlas URI: ").strip()
    
    if not atlas_uri:
        print("❌ Atlas URI обязателен!")
        return
    
    if "/LearnApp" not in atlas_uri:
        if "?" in atlas_uri:
            atlas_uri = atlas_uri.replace("?", "/LearnApp?")
        else:
            atlas_uri = f"{atlas_uri}/LearnApp"
    
    try:
        # Локальные пользователи
        print("\n🏠 Локальные пользователи:")
        try:
            local_client = AsyncIOMotorClient(local_uri)
            await local_client.admin.command('ping')
            local_users = await get_users_from_db(local_client)
            
            for i, user in enumerate(local_users, 1):
                email = user.get('email', 'Нет email')
                username = user.get('username', 'Нет username')
                created_at = user.get('created_at', 'Дата неизвестна')
                print(f"   {i}. {email} ({username}) - {created_at}")
            
            local_client.close()
            
        except Exception as e:
            print(f"   ❌ Ошибка локальной БД: {e}")
        
        # Atlas пользователи
        print("\n🌍 Atlas пользователи:")
        try:
            atlas_client = AsyncIOMotorClient(atlas_uri)
            await atlas_client.admin.command('ping')
            atlas_users = await get_users_from_db(atlas_client)
            
            for i, user in enumerate(atlas_users, 1):
                email = user.get('email', 'Нет email')
                username = user.get('username', 'Нет username') 
                created_at = user.get('created_at', 'Дата неизвестна')
                print(f"   {i}. {email} ({username}) - {created_at}")
            
            atlas_client.close()
            
        except Exception as e:
            print(f"   ❌ Ошибка Atlas: {e}")
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")

def main():
    print("🔄 Синхронизация пользователей MongoDB")
    print("Выберите действие:")
    print("1. Синхронизировать пользователей")
    print("2. Показать всех пользователей")
    print("3. Выход")
    
    choice = input("\nВаш выбор (1-3): ").strip()
    
    if choice == "1":
        asyncio.run(sync_users())
    elif choice == "2":
        asyncio.run(show_all_users())
    else:
        print("До свидания!")

if __name__ == "__main__":
    main() 