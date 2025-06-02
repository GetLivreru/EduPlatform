#!/usr/bin/env python3
"""
Скрипт для настройки подключения к MongoDB Atlas
"""

import os
import re

def get_atlas_config():
    """
    Интерактивно собирает данные для подключения к Atlas
    """
    print("🌍 Настройка подключения к MongoDB Atlas")
    print("=" * 50)
    
    # Получаем connection string от пользователя
    print("\n📝 Введите данные вашего Atlas кластера:")
    print("(Эти данные можно найти в Atlas → Clusters → Connect)")
    
    cluster_url = input("🔗 Atlas Connection String (например: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net): ").strip()
    
    if not cluster_url:
        print("❌ Connection string обязателен!")
        return None
    
    # Проверяем и дополняем connection string
    if "/LearnApp" not in cluster_url:
        if "?" in cluster_url:
            cluster_url = cluster_url.replace("?", "/LearnApp?")
        else:
            cluster_url = f"{cluster_url}/LearnApp"
    
    if "retryWrites=true" not in cluster_url:
        if "?" in cluster_url:
            cluster_url = f"{cluster_url}&retryWrites=true&w=majority"
        else:
            cluster_url = f"{cluster_url}?retryWrites=true&w=majority"
    
    # Дополнительные настройки
    secret_key = input("🔐 SECRET_KEY (или нажмите Enter для генерации): ").strip()
    if not secret_key:
        import secrets
        secret_key = secrets.token_urlsafe(32)
        print(f"🔑 Сгенерированный SECRET_KEY: {secret_key}")
    
    openai_key = input("🤖 OPENAI_API_KEY (или нажмите Enter чтобы пропустить): ").strip()
    
    return {
        'MONGODB_URL': cluster_url,
        'SECRET_KEY': secret_key,
        'CORS_ORIGINS': 'http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000',
        'OPENAI_API_KEY': openai_key or 'your_openai_api_key_here'
    }

def create_env_file(config):
    """
    Создает .env файл с конфигурацией
    """
    env_content = f"""# MongoDB Atlas Configuration
MONGODB_URL={config['MONGODB_URL']}

# Секретный ключ для JWT токенов
SECRET_KEY={config['SECRET_KEY']}

# CORS настройки для фронтенда
CORS_ORIGINS={config['CORS_ORIGINS']}

# OpenAI API ключ
OPENAI_API_KEY={config['OPENAI_API_KEY']}
"""
    
    # Записываем в .env файл
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"✅ Файл .env создан успешно!")
    return True

def test_connection(mongodb_url):
    """
    Тестирует подключение к Atlas
    """
    print("\n🧪 Тестирование подключения к Atlas...")
    
    try:
        # Попытка импорта motor
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio
        
        async def test():
            client = AsyncIOMotorClient(mongodb_url)
            try:
                # Тест подключения
                await client.admin.command('ping')
                print("✅ Подключение к Atlas успешно!")
                
                # Проверяем базу данных
                db = client.LearnApp
                collections = await db.list_collection_names()
                print(f"📊 Найдено коллекций: {len(collections)}")
                
                for col in collections:
                    count = await db[col].count_documents({})
                    print(f"   - {col}: {count} документов")
                
                return True
            except Exception as e:
                print(f"❌ Ошибка подключения: {e}")
                return False
            finally:
                client.close()
        
        return asyncio.run(test())
        
    except ImportError:
        print("⚠️  Модуль motor не найден. Установите: pip install motor")
        return None

def main():
    print("🚀 Мастер настройки MongoDB Atlas")
    print("Этот скрипт поможет настроить ваше приложение для работы с Atlas\n")
    
    # Шаг 1: Сбор конфигурации
    config = get_atlas_config()
    if not config:
        print("❌ Конфигурация не получена. Выход.")
        return
    
    # Шаг 2: Создание .env файла
    print(f"\n📁 Создание .env файла...")
    if create_env_file(config):
        print("✅ Конфигурация сохранена в .env файле")
    
    # Шаг 3: Тестирование подключения
    test_result = test_connection(config['MONGODB_URL'])
    
    # Шаг 4: Следующие шаги
    print("\n📋 Следующие шаги:")
    print("1. ✅ Конфигурация Atlas готова")
    
    if test_result:
        print("2. ✅ Подключение к Atlas работает")
        print("3. 🚀 Запустите приложение: docker-compose -f docker-compose-atlas.yml up --build")
    elif test_result is None:
        print("2. ⚠️  Установите motor: pip install motor")
        print("3. 🧪 Протестируйте подключение вручную")
        print("4. 🚀 Запустите приложение: docker-compose -f docker-compose-atlas.yml up --build")
    else:
        print("2. ❌ Проверьте connection string и настройки Atlas")
        print("3. 🔍 Убедитесь что ваш IP добавлен в Network Access")
        print("4. 🔑 Проверьте логин/пароль пользователя")
    
    print("\n🎉 Настройка завершена!")

if __name__ == "__main__":
    main() 