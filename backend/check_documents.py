#!/usr/bin/env python3
"""
Скрипт диагностики документов в MongoDB

Проверяет структуру документов и показывает, какие поля присутствуют
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import json
from bson import ObjectId

# Загрузка переменных окружения
load_dotenv()

async def check_documents():
    """Проверяет структуру документов в MongoDB"""
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://Lida:oayjqe2005@cluster0.ejidejg.mongodb.net/?retryWrites=true&w=majority")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.LearnApp
    
    try:
        print("🔍 Анализ документов в MongoDB...")
        print("="*50)
        
        # Считаем общее количество документов
        total_count = await db.documents.count_documents({})
        print(f"📄 Всего документов: {total_count}")
        
        # Находим документы без s3_key
        no_s3_count = await db.documents.count_documents({
            "$or": [
                {"s3_key": {"$exists": False}},
                {"s3_key": None},
                {"s3_key": ""}
            ]
        })
        print(f"🔄 Документов без s3_key: {no_s3_count}")
        
        # Получаем несколько примеров документов
        print("\n📋 Примеры документов:")
        print("-" * 50)
        
        cursor = db.documents.find({}).limit(3)
        docs = []
        async for doc in cursor:
            docs.append(doc)
        
        for i, doc in enumerate(docs, 1):
            print(f"\n📄 Документ {i}:")
            print(f"   _id: {doc['_id']}")
            print(f"   Поля документа:")
            
            for key, value in doc.items():
                if key == '_id':
                    continue
                    
                if isinstance(value, bytes):
                    print(f"     {key}: <binary data, {len(value)} bytes>")
                elif isinstance(value, str) and len(value) > 100:
                    print(f"     {key}: <string, {len(value)} chars>")
                elif isinstance(value, ObjectId):
                    print(f"     {key}: {value}")
                else:
                    print(f"     {key}: {value}")
        
        # Проверяем уникальные поля
        print(f"\n🔍 Анализ всех полей в коллекции...")
        
        pipeline = [
            {"$project": {"arrayofkeyvalue": {"$objectToArray": "$$ROOT"}}},
            {"$unwind": "$arrayofkeyvalue"},
            {"$group": {"_id": "$arrayofkeyvalue.k", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        unique_fields = []
        async for field_info in db.documents.aggregate(pipeline):
            unique_fields.append(field_info)
        
        print(f"\n📊 Все поля в коллекции documents:")
        for field in unique_fields:
            print(f"   {field['_id']}: используется в {field['count']} документах")
        
        # Ищем документы с file_data или content
        file_data_count = await db.documents.count_documents({"file_data": {"$exists": True}})
        content_count = await db.documents.count_documents({"content": {"$exists": True}})
        
        print(f"\n📁 Документы с файловыми данными:")
        print(f"   file_data: {file_data_count} документов")
        print(f"   content: {content_count} документов")
        
        if file_data_count == 0 and content_count == 0:
            print("\n⚠️  ПРОБЛЕМА: Ни один документ не содержит файловых данных!")
            print("   Возможные причины:")
            print("   1. Документы уже мигрированы в S3")
            print("   2. Файлы сохранялись в другой коллекции")
            print("   3. Использовались другие названия полей")
            
            # Проверим GridFS
            gridfs_count = await db["fs.files"].count_documents({})
            if gridfs_count > 0:
                print(f"\n🗃️  Найдено {gridfs_count} файлов в GridFS!")
                print("   Файлы могут храниться в GridFS вместо обычных полей")
        
        print("\n" + "="*50)
        print("✅ Диагностика завершена")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_documents()) 