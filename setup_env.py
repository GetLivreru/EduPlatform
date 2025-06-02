#!/usr/bin/env python3
"""
Скрипт для настройки файла .env для LearnApp AI
"""

import os
import secrets

def create_env_file():
    """Создает файл .env с базовыми настройками"""
    
    env_content = f"""# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017

# OpenAI Configuration
# ВАЖНО: Получите ключ на https://platform.openai.com/api-keys
# и замените 'your_openai_api_key_here' на ваш настоящий ключ
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration  
SECRET_KEY={secrets.token_urlsafe(32)}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Settings
DEBUG=True
"""
    
    # Определяем путь к .env файлу
    env_path = ".env"
    
    if os.path.exists(env_path):
        print("⚠️  Файл .env уже существует.")
        response = input("Хотите перезаписать его? (y/N): ")
        if response.lower() != 'y':
            print("❌ Отменено.")
            return
    
    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Файл .env успешно создан!")
        print("\n🔑 ВАЖНО! Настройте OpenAI API ключ:")
        print("1. Перейдите на https://platform.openai.com/api-keys")
        print("2. Создайте новый API ключ")
        print("3. Откройте файл .env и замените 'your_openai_api_key_here' на ваш ключ")
        print("\n🚀 После настройки ключа запустите сервер:")
        print("   cd backend")
        print("   uvicorn main:app --reload")
        
    except Exception as e:
        print(f"❌ Ошибка при создании файла .env: {e}")

def check_env():
    """Проверяет настройки в .env файле"""
    env_path = ".env"
    
    if not os.path.exists(env_path):
        print("❌ Файл .env не найден!")
        print("Запустите: python setup_env.py")
        return False
    
    # Загружаем переменные окружения из .env
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    checks = []
    
    # Проверяем MongoDB URL
    mongodb_url = os.getenv("MONGODB_URL")
    if mongodb_url and mongodb_url != "":
        checks.append(("✅", "MONGODB_URL", "настроен"))
    else:
        checks.append(("❌", "MONGODB_URL", "не настроен"))
    
    # Проверяем OpenAI API ключ
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key and openai_key != "your_openai_api_key_here":
        checks.append(("✅", "OPENAI_API_KEY", "настроен"))
    else:
        checks.append(("❌", "OPENAI_API_KEY", "НЕ НАСТРОЕН! Замените на реальный ключ"))
    
    # Проверяем SECRET_KEY
    secret_key = os.getenv("SECRET_KEY")
    if secret_key and secret_key != "your-secret-key-here":
        checks.append(("✅", "SECRET_KEY", "настроен"))
    else:
        checks.append(("❌", "SECRET_KEY", "не настроен"))
    
    print("\n🔍 Проверка настроек .env:")
    print("-" * 50)
    for status, key, message in checks:
        print(f"{status} {key}: {message}")
    
    return all(check[0] == "✅" for check in checks)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        check_env()
    else:
        create_env_file() 