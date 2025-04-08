from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from bson import ObjectId

async def migrate_data():
    # Подключение к MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    
    # Старые базы данных
    quiz_platform_db = client.quiz_platform
    learning_path_db = client.learning_path
    
    # Новая база данных
    learn_app_db = client.LearnApp
    
    # Перенос пользователей
    print("Переносим пользователей...")
    users = await quiz_platform_db.users.find().to_list(None)
    if users:
        for user in users:
            existing_user = await learn_app_db.users.find_one({"login": user["login"]})
            if not existing_user:
                await learn_app_db.users.insert_one(user)
    print("Пользователи перенесены")
    
    # Перенос тестов из quiz_platform
    print("Переносим тесты из quiz_platform...")
    quizzes = await quiz_platform_db.quizzes.find().to_list(None)
    if quizzes:
        for quiz in quizzes:
            existing_quiz = await learn_app_db.quizzes.find_one({
                "title": quiz["title"],
                "category": quiz["category"]
            })
            if not existing_quiz:
                await learn_app_db.quizzes.insert_one(quiz)
    print("Тесты из quiz_platform перенесены")
    
    # Перенос тестов из learning_path
    print("Переносим тесты из learning_path...")
    learning_path_quizzes = await learning_path_db.quizzes.find().to_list(None)
    if learning_path_quizzes:
        for quiz in learning_path_quizzes:
            existing_quiz = await learn_app_db.quizzes.find_one({
                "title": quiz["title"],
                "category": quiz["category"]
            })
            if not existing_quiz:
                await learn_app_db.quizzes.insert_one(quiz)
    print("Тесты из learning_path перенесены")
    
    # Перенос учебных путей
    print("Переносим учебные пути...")
    learning_paths = await learning_path_db.learning_paths.find().to_list(None)
    if learning_paths:
        for path in learning_paths:
            existing_path = await learn_app_db.learning_paths.find_one({
                "subject": path["subject"],
                "level": path["level"]
            })
            if not existing_path:
                await learn_app_db.learning_paths.insert_one(path)
    print("Учебные пути перенесены")
    
    # Перенос попыток прохождения тестов
    print("Переносим попытки прохождения тестов...")
    quiz_attempts = await learning_path_db.quiz_attempts.find().to_list(None)
    if quiz_attempts:
        for attempt in quiz_attempts:
            existing_attempt = await learn_app_db.quiz_attempts.find_one({
                "_id": attempt["_id"]
            })
            if not existing_attempt:
                await learn_app_db.quiz_attempts.insert_one(attempt)
    print("Попытки прохождения тестов перенесены")
    
    print("Миграция завершена!")
    
    # Закрываем соединение
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data()) 