import os
import subprocess
import sys
from datetime import datetime

def import_to_atlas():
    """
    Импорт данных в MongoDB Atlas
    """
    
    # Получаем информацию от пользователя
    print("🌍 Импорт данных в MongoDB Atlas")
    print("=" * 50)
    
    # Atlas connection string
    atlas_uri = input("🔗 Введите Atlas Connection String (без названия базы): ")
    if not atlas_uri:
        print("❌ Connection string обязателен!")
        return False
    
    # Добавляем название базы данных
    if "?" in atlas_uri:
        atlas_uri_with_db = atlas_uri.replace("?", "/LearnApp?")
    else:
        atlas_uri_with_db = f"{atlas_uri}/LearnApp"
    
    # Папка с экспортированными данными
    export_dir = input("📁 Введите путь к папке с экспортом (например: mongodb_export_20231201_120000): ")
    if not export_dir or not os.path.exists(export_dir):
        print("❌ Папка с экспортом не найдена!")
        return False
    
    database_name = "LearnApp"
    
    print(f"\n🔄 Начинаем импорт данных в Atlas...")
    print(f"📂 Источник: {export_dir}/{database_name}")
    print(f"🎯 Назначение: Atlas кластер")
    
    try:
        # Команда mongorestore для импорта
        cmd = [
            "mongorestore",
            "--uri", atlas_uri_with_db,
            "--dir", os.path.join(export_dir, database_name),
            "--drop"  # Удаляет существующие коллекции перед импортом
        ]
        
        print(f"🚀 Выполняем команду: mongorestore --uri [СКРЫТО] --dir {os.path.join(export_dir, database_name)} --drop")
        
        # Выполняем импорт
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        print("✅ Импорт завершен успешно!")
        print(f"📊 Результат: {result.stdout}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при импорте: {e}")
        print(f"Stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ mongorestore не найден. Убедитесь, что MongoDB Database Tools установлены.")
        print("💡 Скачать можно здесь: https://www.mongodb.com/try/download/database-tools")
        return False

def show_connection_examples():
    """
    Показывает примеры строк подключения
    """
    print("\n📝 Примеры Atlas Connection String:")
    print("mongodb+srv://username:password@cluster0.xxxxx.mongodb.net")
    print("mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority")
    print("\n💡 Как получить Connection String:")
    print("1. Зайдите в MongoDB Atlas")
    print("2. Выберите ваш кластер")
    print("3. Нажмите 'Connect'")
    print("4. Выберите 'Connect your application'")
    print("5. Скопируйте строку подключения")
    print("6. Замените <password> на ваш пароль")

if __name__ == "__main__":
    show_connection_examples()
    
    success = import_to_atlas()
    if success:
        print(f"\n🎉 Данные успешно импортированы в Atlas!")
        print("\n📋 Не забудьте:")
        print("1. Обновить MONGODB_URL в .env файле")
        print("2. Добавить IP-адреса всех участников команды в Network Access")
        print("3. Проверить работу приложения с новой базой данных")
    else:
        print("\n❌ Импорт не удался. Проверьте ошибки выше.") 