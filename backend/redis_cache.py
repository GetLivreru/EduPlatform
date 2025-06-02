import redis.asyncio as redis
import json
import os
from typing import Optional, Dict, Any, List
from datetime import timedelta
import asyncio

class RedisCache:
    """Redis кэш для образовательной платформы"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Подключение к Redis"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Проверяем соединение
            await self.redis_client.ping()
            print("✅ Redis подключен успешно")
        except Exception as e:
            print(f"❌ Ошибка подключения к Redis: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Отключение от Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Получить данные из кэша"""
        if not self.redis_client:
            return None
        
        try:
            data = await self.redis_client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"Ошибка чтения из кэша {key}: {e}")
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Сохранить данные в кэш"""
        if not self.redis_client:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            await self.redis_client.set(key, serialized, ex=ttl)
            return True
        except Exception as e:
            print(f"Ошибка записи в кэш {key}: {e}")
            return False
    
    async def delete(self, key: str):
        """Удалить ключ из кэша"""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Ошибка удаления из кэша {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Проверить существование ключа"""
        if not self.redis_client:
            return False
        
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"Ошибка проверки ключа {key}: {e}")
            return False

    # === МЕТОДЫ ДЛЯ СЕССИЙ ===
    
    async def save_session(self, user_id: str, session_data: Dict[str, Any], ttl: int = 1800):
        """Сохранить пользовательскую сессию (30 минут)"""
        key = f"session:{user_id}"
        return await self.set(key, session_data, ttl)
    
    async def get_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получить данные сессии пользователя"""
        key = f"session:{user_id}"
        return await self.get(key)
    
    async def delete_session(self, user_id: str):
        """Удалить сессию пользователя"""
        key = f"session:{user_id}"
        return await self.delete(key)

    # === МЕТОДЫ ДЛЯ КВИЗОВ ===
    
    async def cache_quiz(self, quiz_id: str, quiz_data: Dict[str, Any], ttl: int = 3600):
        """Кэшировать данные квиза (1 час)"""
        key = f"quiz:{quiz_id}"
        return await self.set(key, quiz_data, ttl)
    
    async def get_quiz(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        """Получить квиз из кэша"""
        key = f"quiz:{quiz_id}"
        return await self.get(key)
    
    async def cache_quizzes_list(self, quizzes: List[Dict[str, Any]], ttl: int = 600):
        """Кэшировать список всех квизов (10 минут)"""
        key = "quizzes:all"
        return await self.set(key, quizzes, ttl)
    
    async def get_quizzes_list(self) -> Optional[List[Dict[str, Any]]]:
        """Получить список квизов из кэша"""
        key = "quizzes:all"
        return await self.get(key)
    
    async def cache_quizzes_by_category(self, category: str, quiz_ids: List[str], ttl: int = 900):
        """Кэшировать квизы по категории (15 минут)"""
        key = f"quizzes:category:{category}"
        return await self.set(key, quiz_ids, ttl)
    
    async def get_quizzes_by_category(self, category: str) -> Optional[List[str]]:
        """Получить квизы по категории из кэша"""
        key = f"quizzes:category:{category}"
        return await self.get(key)

    # === МЕТОДЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ===
    
    async def cache_user_profile(self, user_id: str, user_data: Dict[str, Any], ttl: int = 1800):
        """Кэшировать профиль пользователя (30 минут)"""
        key = f"user:{user_id}"
        return await self.set(key, user_data, ttl)
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получить профиль пользователя из кэша"""
        key = f"user:{user_id}"
        return await self.get(key)
    
    async def cache_user_results(self, user_id: str, results: List[Dict[str, Any]], ttl: int = 7200):
        """Кэшировать результаты пользователя (2 часа)"""
        key = f"user_results:{user_id}"
        return await self.set(key, results, ttl)
    
    async def get_user_results(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        """Получить результаты пользователя из кэша"""
        key = f"user_results:{user_id}"
        return await self.get(key)

    # === МЕТОДЫ ДЛЯ РЕКОМЕНДАЦИЙ ===
    
    async def cache_learning_recommendations(self, user_id: str, recommendations: Dict[str, Any], ttl: int = 21600):
        """Кэшировать рекомендации обучения (6 часов)"""
        key = f"recommendations:{user_id}"
        return await self.set(key, recommendations, ttl)
    
    async def get_learning_recommendations(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получить рекомендации из кэша"""
        key = f"recommendations:{user_id}"
        return await self.get(key)
    
    async def cache_learning_path(self, user_id: str, learning_path: Dict[str, Any], ttl: int = 86400):
        """Кэшировать персональный план обучения (24 часа)"""
        key = f"learning_path:{user_id}"
        return await self.set(key, learning_path, ttl)
    
    async def get_learning_path(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получить план обучения из кэша"""
        key = f"learning_path:{user_id}"
        return await self.get(key)

    # === МЕТОДЫ ДЛЯ СТАТИСТИКИ ===
    
    async def cache_quiz_stats(self, quiz_id: str, stats: Dict[str, Any], ttl: int = 3600):
        """Кэшировать статистику квиза (1 час)"""
        key = f"quiz_stats:{quiz_id}"
        return await self.set(key, stats, ttl)
    
    async def get_quiz_stats(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        """Получить статистику квиза из кэша"""
        key = f"quiz_stats:{quiz_id}"
        return await self.get(key)
    
    async def cache_leaderboard(self, leaderboard: List[Dict[str, Any]], ttl: int = 300):
        """Кэшировать топ пользователей (5 минут)"""
        key = "leaderboard:top"
        return await self.set(key, leaderboard, ttl)
    
    async def get_leaderboard(self) -> Optional[List[Dict[str, Any]]]:
        """Получить топ пользователей из кэша"""
        key = "leaderboard:top"
        return await self.get(key)

    # === УТИЛИТЫ ===
    
    async def invalidate_user_cache(self, user_id: str):
        """Очистить весь кэш пользователя"""
        patterns = [
            f"user:{user_id}",
            f"session:{user_id}",
            f"user_results:{user_id}",
            f"recommendations:{user_id}",
            f"learning_path:{user_id}"
        ]
        
        for pattern in patterns:
            await self.delete(pattern)
    
    async def invalidate_quiz_cache(self, quiz_id: str):
        """Очистить кэш квиза"""
        patterns = [
            f"quiz:{quiz_id}",
            f"quiz_stats:{quiz_id}",
            "quizzes:all"
        ]
        
        for pattern in patterns:
            await self.delete(pattern)

# Глобальный экземпляр Redis кэша
cache = RedisCache() 