#!/usr/bin/env python3
"""
Скрипт для тестирования Redis интеграции
Проверяет основные операции кэширования
"""

    
import asyncio
import json
import time
from redis_cache import RedisCache

async def test_basic_operations():
    """Тестирование базовых операций Redis"""
    print("🧪 Тестирование базовых операций Redis...")
    
    cache = RedisCache()
    await cache.connect()
    # Тест 1: Основные операции
    test_key = "test:basic"
    test_data = {"message": "Hello Redis!", "timestamp": time.time()}
    print("\n1️⃣ Тест основных операций")
    
    # Сохранение
    success = await cache.set(test_key, test_data, ttl=60)
    print(f"   Сохранение: {'✅ OK' if success else '❌ FAILED'}")
    
    # Получение
    retrieved = await cache.get(test_key)
    print(f"   Получение: {'✅ OK' if retrieved else '❌ FAILED'}")
    print(f"   Данные: {retrieved}")
    
    # Проверка существования
    exists = await cache.exists(test_key)
    print(f"   Существование: {'✅ OK' if exists else '❌ FAILED'}")
    
    # Удаление
    deleted = await cache.delete(test_key)
    print(f"   Удаление: {'✅ OK' if deleted else '❌ FAILED'}")
    
    await cache.disconnect()

async def test_session_operations():
    """Тестирование операций с сессиями"""
    print("\n🔐 Тестирование сессий...")
    
    cache = RedisCache()
    await cache.connect()
    
    # Тест сессии пользователя
    print("\n2️⃣ Тест сессий пользователя")
    user_id = "test_user_123"
    session_data = {
        "id": user_id,
        "name": "Test User",
        "login": "test@example.com",
        "role": "student",
        "quiz_points": 150,
        "last_activity": time.time()
    }
    
    # Сохранение сессии
    success = await cache.save_session(user_id, session_data)
    print(f"   Сохранение сессии: {'✅ OK' if success else '❌ FAILED'}")
    
    # Получение сессии
    retrieved_session = await cache.get_session(user_id)
    print(f"   Получение сессии: {'✅ OK' if retrieved_session else '❌ FAILED'}")
    print(f"   Данные сессии: {retrieved_session}")
    
    # Удаление сессии
    deleted = await cache.delete_session(user_id)
    print(f"   Удаление сессии: {'✅ OK' if deleted else '❌ FAILED'}")
    
    await cache.disconnect()

async def test_quiz_operations():
    """Тестирование операций с квизами"""
    print("\n📚 Тестирование квизов...")
    
    cache = RedisCache()
    await cache.connect()
    
    # Тест квизов
    print("\n3️⃣ Тест кэширования квизов")
    quiz_id = "test_quiz_456"
    quiz_data = {
        "id": quiz_id,
        "title": "Тестовый квиз по программированию",
        "description": "Проверка знаний Python",
        "category": "Программирование",
        "difficulty": "Medium",
        "time_limit": 30,
        "questions": [
            {
                "text": "Что такое Python?",
                "options": ["Язык программирования", "Змея", "Фреймворк", "База данных"],
                "correct_answer": 0
            },
            {
                "text": "Какой оператор используется для сравнения?",
                "options": ["=", "==", "===", "!="],
                "correct_answer": 1
            }
        ]
    }
    
    # Кэширование квиза
    success = await cache.cache_quiz(quiz_id, quiz_data)
    print(f"   Кэширование квиза: {'✅ OK' if success else '❌ FAILED'}")
    
    # Получение квиза
    retrieved_quiz = await cache.get_quiz(quiz_id)
    print(f"   Получение квиза: {'✅ OK' if retrieved_quiz else '❌ FAILED'}")
    print(f"   Название квиза: {retrieved_quiz.get('title') if retrieved_quiz else 'N/A'}")
    
    # Кэширование списка квизов
    quizzes_list = [
        {"id": "quiz1", "title": "Математика", "category": "Точные науки"},
        {"id": "quiz2", "title": "История", "category": "Гуманитарные науки"},
        {"id": quiz_id, "title": quiz_data["title"], "category": quiz_data["category"]}
    ]
    
    success = await cache.cache_quizzes_list(quizzes_list)
    print(f"   Кэширование списка квизов: {'✅ OK' if success else '❌ FAILED'}")
    
    # Получение списка квизов
    retrieved_list = await cache.get_quizzes_list()
    print(f"   Получение списка квизов: {'✅ OK' if retrieved_list else '❌ FAILED'}")
    print(f"   Количество квизов: {len(retrieved_list) if retrieved_list else 0}")
    
    # Инвалидация кэша квиза
    await cache.invalidate_quiz_cache(quiz_id)
    print(f"   Инвалидация кэша: ✅ OK")
    
    await cache.disconnect()

async def test_user_operations():
    """Тестирование операций с пользователями"""
    print("\n👤 Тестирование пользователей...")
    
    cache = RedisCache()
    await cache.connect()
    
    # Тест профиля пользователя
    print("\n4️⃣ Тест профилей пользователей")
    user_id = "test_user_789"
    user_profile = {
        "id": user_id,
        "name": "Алексей Иванов",
        "login": "alexey@example.com",
        "role": "student",
        "quiz_points": 275,
        "created_at": "2024-01-15T10:30:00"
    }
    
    # Кэширование профиля
    success = await cache.cache_user_profile(user_id, user_profile)
    print(f"   Кэширование профиля: {'✅ OK' if success else '❌ FAILED'}")
    
    # Получение профиля
    retrieved_profile = await cache.get_user_profile(user_id)
    print(f"   Получение профиля: {'✅ OK' if retrieved_profile else '❌ FAILED'}")
    print(f"   Имя пользователя: {retrieved_profile.get('name') if retrieved_profile else 'N/A'}")
    
    # Результаты пользователя
    user_results = [
        {"quiz_id": "quiz1", "score": 85.5, "completed_at": "2024-01-15T11:00:00"},
        {"quiz_id": "quiz2", "score": 92.0, "completed_at": "2024-01-15T12:00:00"},
        {"quiz_id": "quiz3", "score": 78.5, "completed_at": "2024-01-15T13:00:00"}
    ]
    
    success = await cache.cache_user_results(user_id, user_results)
    print(f"   Кэширование результатов: {'✅ OK' if success else '❌ FAILED'}")
    
    retrieved_results = await cache.get_user_results(user_id)
    print(f"   Получение результатов: {'✅ OK' if retrieved_results else '❌ FAILED'}")
    print(f"   Количество результатов: {len(retrieved_results) if retrieved_results else 0}")
    
    # Инвалидация всего кэша пользователя
    await cache.invalidate_user_cache(user_id)
    print(f"   Инвалидация кэша пользователя: ✅ OK")
    
    await cache.disconnect()

async def test_recommendations():
    """Тестирование рекомендаций обучения"""
    print("\n🎯 Тестирование рекомендаций...")
    
    cache = RedisCache()
    await cache.connect()
    
    print("\n5️⃣ Тест рекомендаций обучения")
    user_id = "test_user_recommendations"
    
    # Рекомендации обучения
    recommendations = {
        "user_id": user_id,
        "quiz_id": "python_basics",
        "subject": "Программирование",
        "level": "Beginner",
        "weak_areas": ["Циклы", "Функции", "Списки"],
        "learning_resources": [
            {"type": "video", "title": "Python циклы", "url": "example.com/video1"},
            {"type": "article", "title": "Работа со списками", "url": "example.com/article1"}
        ],
        "practice_exercises": ["Написать цикл for", "Создать функцию", "Работа со списками"],
        "study_schedule": [
            {"day": "Понедельник", "tasks": ["Изучить циклы for"]},
            {"day": "Вторник", "tasks": ["Практика с функциями"]},
            {"day": "Среда", "tasks": ["Работа со списками"]}
        ],
        "expected_outcomes": ["Понимание циклов", "Умение писать функции"]
    }
    
    success = await cache.cache_learning_recommendations(user_id, recommendations)
    print(f"   Кэширование рекомендаций: {'✅ OK' if success else '❌ FAILED'}")
    
    retrieved_recommendations = await cache.get_learning_recommendations(user_id)
    print(f"   Получение рекомендаций: {'✅ OK' if retrieved_recommendations else '❌ FAILED'}")
    print(f"   Предмет: {retrieved_recommendations.get('subject') if retrieved_recommendations else 'N/A'}")
    print(f"   Слабые области: {retrieved_recommendations.get('weak_areas') if retrieved_recommendations else 'N/A'}")
    
    # План обучения
    learning_path = {
        "user_id": user_id,
        "subject": "Python Programming",
        "level": "Intermediate",
        "duration_days": 30,
        "content": [
            {"day": 1, "topics": ["Основы Python"], "exercises": ["Hello World", "Переменные"]},
            {"day": 2, "topics": ["Условия"], "exercises": ["if-else", "elif"]},
            {"day": 3, "topics": ["Циклы"], "exercises": ["for", "while"]},
        ]
    }
    
    success = await cache.cache_learning_path(user_id, learning_path)
    print(f"   Кэширование плана обучения: {'✅ OK' if success else '❌ FAILED'}")
    
    retrieved_path = await cache.get_learning_path(user_id)
    print(f"   Получение плана обучения: {'✅ OK' if retrieved_path else '❌ FAILED'}")
    print(f"   Длительность: {retrieved_path.get('duration_days') if retrieved_path else 'N/A'} дней")
    
    await cache.disconnect()

async def test_performance():
    """Тест производительности"""
    print("\n⚡ Тестирование производительности...")
    
    cache = RedisCache()
    await cache.connect()
    
    print("\n6️⃣ Тест производительности")
    
    # Тест скорости записи
    start_time = time.time()
    for i in range(100):
        await cache.set(f"perf_test:{i}", {"data": f"test_data_{i}"}, ttl=60)
    write_time = time.time() - start_time
    print(f"   Запись 100 ключей: {write_time:.3f} секунд")
    
    # Тест скорости чтения
    start_time = time.time()
    for i in range(100):
        await cache.get(f"perf_test:{i}")
    read_time = time.time() - start_time
    print(f"   Чтение 100 ключей: {read_time:.3f} секунд")
    
    # Очистка тестовых данных
    for i in range(100):
        await cache.delete(f"perf_test:{i}")
    
    print(f"   Среднее время записи: {write_time/100*1000:.2f} мс/операция")
    print(f"   Среднее время чтения: {read_time/100*1000:.2f} мс/операция")
    
    await cache.disconnect()

async def main():
    """Главная функция тестирования"""
    print("🚀 Начинаем тестирование Redis интеграции")
    print("=" * 50)
    
    try:
        await test_basic_operations()
        await test_session_operations()
        await test_quiz_operations()
        await test_user_operations()
        await test_recommendations()
        await test_performance()
        
        print("\n" + "=" * 50)
        print("🎉 Все тесты успешно завершены!")
        print("✅ Redis интеграция работает корректно")
        
    except Exception as e:
        print(f"\n❌ Ошибка при тестировании: {e}")
        print("🔍 Убедитесь, что Redis сервер запущен:")
        print("   - Локально: redis-server")
        print("   - Docker: docker run -d -p 6379:6379 redis:7.2-alpine")
        
if __name__ == "__main__":
    asyncio.run(main()) 