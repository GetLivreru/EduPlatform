from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

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
        await learn_app_db.users.insert_many(users)
    print("Пользователи перенесены")
    
    # Перенос тестов
    print("Переносим тесты...")
    quizzes = await quiz_platform_db.quizzes.find().to_list(None)
    if quizzes:
        await learn_app_db.quizzes.insert_many(quizzes)
    print("Тесты перенесены")
    
    # Перенос учебных путей
    print("Переносим учебные пути...")
    learning_paths = await learning_path_db.learning_paths.find().to_list(None)
    if learning_paths:
        await learn_app_db.learning_paths.insert_many(learning_paths)
    print("Учебные пути перенесены")
    
    # Перенос попыток прохождения тестов
    print("Переносим попытки прохождения тестов...")
    quiz_attempts = await learning_path_db.quiz_attempts.find().to_list(None)
    if quiz_attempts:
        await learn_app_db.quiz_attempts.insert_many(quiz_attempts)
    print("Попытки прохождения тестов перенесены")
    
    print("Миграция завершена!")
    
    # Закрываем соединение
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data()) 