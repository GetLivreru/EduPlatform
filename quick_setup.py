#!/usr/bin/env python3
"""
Быстрая настройка Atlas - без подключения, только создание .env файла
"""

def quick_atlas_setup():
    print("⚡ Быстрая настройка MongoDB Atlas")
    print("=" * 40)
    print("Этот скрипт просто создает .env файл для Atlas\n")
    
    # Получаем данные
    atlas_url = input("🔗 Введите ваш Atlas Connection String: ").strip()
    
    if not atlas_url:
        print("❌ Connection string обязателен!")
        return False
    
    # Добавляем базу данных если её нет
    if "/LearnApp" not in atlas_url:
        if "?" in atlas_url:
            atlas_url = atlas_url.replace("?", "/LearnApp?")
        else:
            atlas_url = f"{atlas_url}/LearnApp"
    
    # Создаем .env файл
    env_content = f"""# MongoDB Atlas Configuration
MONGODB_URL={atlas_url}

# Секретный ключ для JWT токенов
SECRET_KEY=your_super_secret_key_here_change_this_in_production

# CORS настройки для фронтенда
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000

# OpenAI API ключ (если используется)
OPENAI_API_KEY=your_openai_api_key_here
"""
    
    # Записываем файл
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Файл .env создан!")
        print("\n📋 Следующие шаги:")
        print("1. Запустите приложение: docker-compose -f docker-compose-atlas.yml up --build")
        print("2. Или: python sync_users_atlas.py (для синхронизации пользователей)")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка создания .env: {e}")
        return False

if __name__ == "__main__":
    quick_atlas_setup() 