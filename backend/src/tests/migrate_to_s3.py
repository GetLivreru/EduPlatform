#!/usr/bin/env python3
"""
Скрипт миграции документов из MongoDB в AWS S3

Этот скрипт переносит файлы, которые ранее хранились в MongoDB,
в AWS S3 и обновляет метаданные в базе данных.

Использование:
    python migrate_to_s3.py

Переменные окружения:
    MONGODB_URL - URL подключения к MongoDB
    AWS_ACCESS_KEY_ID - AWS Access Key
    AWS_SECRET_ACCESS_KEY - AWS Secret Key  
    AWS_REGION - AWS регион (по умолчанию us-east-1)
    AWS_S3_BUCKET_NAME - имя S3 bucket
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from typing import List, Dict, Any

# Добавляем текущую директорию в path для импорта модулей
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from aws.s3_service import S3Service
import tempfile
import uuid

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DocumentMigrator:
    def __init__(self):
        # MongoDB подключение
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://Lida:oayjqe2005@cluster0.ejidejg.mongodb.net/?retryWrites=true&w=majority")
        self.client = AsyncIOMotorClient(self.mongodb_url)
        self.db = self.client.LearnApp
        
        # S3 сервис
        self.s3_service = S3Service()
        
        # Статистика миграции
        self.stats = {
            "total_documents": 0,
            "migrated": 0,
            "skipped": 0,
            "errors": 0
        }
    
    async def connect(self):
        """Проверка подключений"""
        try:
            # Проверяем MongoDB
            await self.client.admin.command('ping')
            logger.info("✅ MongoDB подключение установлено")
            
            # Проверяем S3
            if not self.s3_service.is_available():
                raise Exception("S3 сервис недоступен")
            logger.info("✅ S3 сервис доступен")
            
            return True
        except Exception as e:
            logger.error(f"❌ Ошибка подключения: {e}")
            return False
    
    async def find_old_documents(self) -> List[Dict[str, Any]]:
        """Находит документы старого формата (без s3_key)"""
        try:
            # Ищем документы, у которых нет поля s3_key
            cursor = self.db.documents.find({
                "$or": [
                    {"s3_key": {"$exists": False}},
                    {"s3_key": None},
                    {"s3_key": ""}
                ]
            })
            
            documents = []
            async for doc in cursor:
                documents.append(doc)
            
            logger.info(f"📄 Найдено {len(documents)} документов для миграции")
            return documents
            
        except Exception as e:
            logger.error(f"❌ Ошибка поиска документов: {e}")
            return []
    
    async def migrate_document(self, document: Dict[str, Any]) -> bool:
        """Мигрирует один документ в S3"""
        try:
            doc_id = document["_id"]
            filename = document.get("filename", f"document_{doc_id}")
            
            logger.info(f"🔄 Миграция документа: {filename} (ID: {doc_id})")
            
            # Проверяем, есть ли файловые данные в старом формате
            if "file_data" not in document and "content" not in document:
                logger.warning(f"⚠️ Документ {doc_id} не содержит файловых данных")
                self.stats["skipped"] += 1
                return False
            
            # Получаем данные файла
            file_data = document.get("file_data") or document.get("content")
            if not file_data:
                logger.warning(f"⚠️ Пустые данные файла для документа {doc_id}")
                self.stats["skipped"] += 1
                return False
            
            # Определяем метаданные
            content_type = document.get("content_type", "application/octet-stream")
            user_id = document.get("uploaded_by", "unknown")
            file_size = len(file_data) if isinstance(file_data, bytes) else len(str(file_data))
            
            # Генерируем уникальный ключ для S3
            file_extension = filename.split('.')[-1] if '.' in filename else 'bin'
            s3_key = f"{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Загружаем в S3
            try:
                self.s3_service.s3_client.put_object(
                    Bucket=self.s3_service.bucket_name,
                    Key=s3_key,
                    Body=file_data,
                    ContentType=content_type,
                    Metadata={
                        'original-filename': filename,
                        'uploaded-by': user_id,
                        'migrated-from': 'mongodb',
                        'migration-date': datetime.utcnow().isoformat()
                    }
                )
                
                logger.info(f"✅ Файл загружен в S3: {s3_key}")
                
            except Exception as e:
                logger.error(f"❌ Ошибка загрузки в S3: {e}")
                self.stats["errors"] += 1
                return False
            
            # Обновляем документ в MongoDB
            update_data = {
                "s3_key": s3_key,
                "s3_bucket": self.s3_service.bucket_name,
                "s3_region": self.s3_service.aws_region,
                "original_filename": filename,
                "file_size": file_size,
                "migrated_at": datetime.utcnow()
            }
            
            # Удаляем старые поля с данными файла
            unset_fields = {}
            if "file_data" in document:
                unset_fields["file_data"] = ""
            if "content" in document:
                unset_fields["content"] = ""
            
            update_query = {"$set": update_data}
            if unset_fields:
                update_query["$unset"] = unset_fields
            
            await self.db.documents.update_one(
                {"_id": doc_id},
                update_query
            )
            
            logger.info(f"✅ Метаданные обновлены в MongoDB для документа {doc_id}")
            self.stats["migrated"] += 1
            return True
            
        except Exception as e:
            logger.error(f"❌ Ошибка миграции документа {document.get('_id')}: {e}")
            self.stats["errors"] += 1
            return False
    
    async def migrate_all(self):
        """Выполняет миграцию всех документов"""
        logger.info("🚀 Начало миграции документов в S3")
        
        # Проверяем подключения
        if not await self.connect():
            logger.error("❌ Не удалось установить подключения. Миграция прервана.")
            return False
        
        # Находим документы для миграции
        documents = await self.find_old_documents()
        self.stats["total_documents"] = len(documents)
        
        if not documents:
            logger.info("ℹ️ Документы для миграции не найдены")
            return True
        
        # Подтверждение от пользователя
        print(f"\n📋 Найдено {len(documents)} документов для миграции.")
        print("⚠️  ВНИМАНИЕ: Это действие изменит структуру данных в MongoDB!")
        print("💾 Рекомендуется создать резервную копию базы данных перед продолжением.")
        
        confirm = input("\n❓ Продолжить миграцию? (да/нет): ").lower().strip()
        if confirm not in ['да', 'yes', 'y', 'д']:
            logger.info("❌ Миграция отменена пользователем")
            return False
        
        # Выполняем миграцию
        logger.info(f"🔄 Начинаем миграцию {len(documents)} документов...")
        
        for i, document in enumerate(documents, 1):
            logger.info(f"📄 Прогресс: {i}/{len(documents)}")
            await self.migrate_document(document)
            
            # Пауза между документами
            await asyncio.sleep(0.1)
        
        # Выводим статистику
        self.print_statistics()
        return True
    
    def print_statistics(self):
        """Выводит статистику миграции"""
        print("\n" + "="*50)
        print("📊 СТАТИСТИКА МИГРАЦИИ")
        print("="*50)
        print(f"📄 Всего документов: {self.stats['total_documents']}")
        print(f"✅ Успешно мигрировано: {self.stats['migrated']}")
        print(f"⏩ Пропущено: {self.stats['skipped']}")
        print(f"❌ Ошибок: {self.stats['errors']}")
        
        if self.stats['total_documents'] > 0:
            success_rate = (self.stats['migrated'] / self.stats['total_documents']) * 100
            print(f"📈 Процент успеха: {success_rate:.1f}%")
        
        print("="*50)
        
        if self.stats['migrated'] > 0:
            print("✅ Миграция завершена успешно!")
            print("ℹ️  Файлы теперь хранятся в AWS S3")
            print("ℹ️  Метаданные обновлены в MongoDB")
        else:
            print("⚠️  Ни один документ не был мигрирован")

async def main():
    """Основная функция"""
    print("🚀 Скрипт миграции документов в AWS S3")
    print("="*50)
    
    migrator = DocumentMigrator()
    
    try:
        success = await migrator.migrate_all()
        
        if success:
            print("\n🎉 Миграция завершена!")
        else:
            print("\n❌ Миграция не выполнена")
            
    except KeyboardInterrupt:
        print("\n⏹️ Миграция прервана пользователем")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        print(f"\n💥 Критическая ошибка: {e}")
    finally:
        # Закрываем соединения
        migrator.client.close()

if __name__ == "__main__":
    asyncio.run(main()) 