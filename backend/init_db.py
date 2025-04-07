from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.learning_path

    # Тестовые квизы
    test_quizzes = [
        {
            "title": "Базовая математика",
            "description": "Тест на базовые математические знания",
            "category": "math",
            "questions": [
                {
                    "text": "Сколько будет 2 + 2?",
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": 1
                },
                {
                    "text": "Чему равно 5 * 5?",
                    "options": ["20", "25", "30", "35"],
                    "correct_answer": 1
                },
                {
                    "text": "Решите уравнение: x + 3 = 7",
                    "options": ["2", "3", "4", "5"],
                    "correct_answer": 2
                }
            ],
            "difficulty": "beginner",
            "time_limit": 10
        },
        {
            "title": "Продвинутая математика",
            "description": "Тест на продвинутые математические знания",
            "category": "math",
            "questions": [
                {
                    "text": "Найдите производную функции f(x) = x^2",
                    "options": ["2x", "x", "2", "x^2"],
                    "correct_answer": 0
                },
                {
                    "text": "Решите уравнение: 2x + 5 = 15",
                    "options": ["5", "6", "7", "8"],
                    "correct_answer": 0
                }
            ],
            "difficulty": "intermediate",
            "time_limit": 15
        }
    ]

    # Тестовые пути обучения
    test_learning_paths = [
        {
            "subject": "math",
            "level": "beginner",
            "content": [
                {
                    "day": 1,
                    "topics": ["Основы арифметики", "Сложение и вычитание"],
                    "exercises": ["Решите 5 примеров на сложение", "Решите 5 примеров на вычитание"]
                },
                {
                    "day": 2,
                    "topics": ["Умножение и деление"],
                    "exercises": ["Решите 5 примеров на умножение", "Решите 5 примеров на деление"]
                }
            ],
            "duration_days": 7
        }
    ]

    try:
        # Очищаем существующие коллекции
        await db.quizzes.delete_many({})
        await db.learning_paths.delete_many({})

        # Добавляем тестовые данные
        if test_quizzes:
            result = await db.quizzes.insert_many(test_quizzes)
            print(f"Добавлено {len(result.inserted_ids)} квизов")
        
        if test_learning_paths:
            result = await db.learning_paths.insert_many(test_learning_paths)
            print(f"Добавлено {len(result.inserted_ids)} путей обучения")

        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_db()) 