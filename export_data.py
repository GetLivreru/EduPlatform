import os
import subprocess
import sys
from datetime import datetime

def export_mongodb_data():
    """
    Экспорт данных из локальной MongoDB
    """
    
    # Конфигурация локальной MongoDB
    local_uri = "mongodb://localhost:27017"
    database_name = "LearnApp"
    
    # Создаем папку для экспорта
    export_dir = f"mongodb_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"🔄 Начинаем экспорт данных из базы '{database_name}'...")
    print(f"📁 Папка экспорта: {export_dir}")
    
    try:
        # Команда mongodump для экспорта
        cmd = [
            "mongodump",
            "--uri", local_uri,
            "--db", database_name,
            "--out", export_dir
        ]
        
        print(f"🚀 Выполняем команду: {' '.join(cmd)}")
        
        # Выполняем экспорт
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        print("✅ Экспорт завершен успешно!")
        print(f"📂 Данные сохранены в папке: {export_dir}")
        
        # Показываем статистику
        if os.path.exists(os.path.join(export_dir, database_name)):
            collections = os.listdir(os.path.join(export_dir, database_name))
            print(f"📊 Экспортированные коллекции: {len(collections)//2}")  # Делим на 2, так как для каждой коллекции есть .bson и .metadata.json
            for file in collections:
                if file.endswith('.bson'):
                    collection_name = file.replace('.bson', '')
                    file_size = os.path.getsize(os.path.join(export_dir, database_name, file))
                    print(f"   - {collection_name}: {file_size} bytes")
        
        return export_dir
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при экспорте: {e}")
        print(f"Stderr: {e.stderr}")
        return None
    except FileNotFoundError:
        print("❌ mongodump не найден. Убедитесь, что MongoDB Database Tools установлены.")
        print("💡 Скачать можно здесь: https://www.mongodb.com/try/download/database-tools")
        return None

if __name__ == "__main__":
    export_dir = export_mongodb_data()
    if export_dir:
        print(f"\n🎉 Экспорт завершен! Папка с данными: {export_dir}")
        print("\n📋 Следующие шаги:")
        print("1. Создайте кластер в MongoDB Atlas")
        print("2. Настройте сетевой доступ и пользователя")
        print("3. Используйте mongorestore для импорта данных")
    else:
        print("\n❌ Экспорт не удался. Проверьте ошибки выше.") 