# 🔄 Кеширование с Redis

## 📋 Обзор

EduPlatform использует Redis для высокопроизводительного кеширования и управления сессиями.

## 🎯 Что кешируется

### 👤 Пользовательские данные
- **Сессии пользователей** - JWT токены и метаданные
- **Профили пользователей** - базовая информация для быстрого доступа
- **Права доступа** - роли и разрешения пользователей

### 📚 Образовательный контент
- **Список квизов** - кеш популярных и недавних квизов
- **Результаты квизов** - временное кеширование результатов
- **AI рекомендации** - кеш персональных рекомендаций
- **Метаданные документов** - информация о загруженных файлах

### 🔒 Безопасность
- **Rate limiting** - счетчики запросов по IP
- **Временные токены** - одноразовые коды и ссылки
- **Blacklist токенов** - заблокированные JWT токены

## ⚙️ Конфигурация

### 🔧 Настройки Redis

```python
# backend/config/redis_config.py
import redis.asyncio as redis
import os

REDIS_CONFIG = {
    "host": os.getenv("REDIS_HOST", "localhost"),
    "port": int(os.getenv("REDIS_PORT", 6379)),
    "password": os.getenv("REDIS_PASSWORD"),
    "db": int(os.getenv("REDIS_DB", 0)),
    "encoding": "utf-8",
    "decode_responses": True,
    "socket_timeout": 5,
    "socket_connect_timeout": 5,
    "retry_on_timeout": True,
    "health_check_interval": 30
}

class RedisManager:
    def __init__(self):
        self.redis = None
    
    async def connect(self):
        self.redis = redis.Redis(**REDIS_CONFIG)
        return self.redis
    
    async def disconnect(self):
        if self.redis:
            await self.redis.close()

redis_manager = RedisManager()
```

### ⏱️ TTL настройки

```python
# Время жизни кеша (в секундах)
CACHE_TTL = {
    "user_session": 3600,           # 1 час
    "user_profile": 1800,           # 30 минут
    "quiz_list": 600,               # 10 минут
    "quiz_results": 300,            # 5 минут
    "ai_recommendations": 7200,     # 2 часа
    "rate_limit": 60,               # 1 минута
    "temp_tokens": 900,             # 15 минут
    "blacklist": 86400              # 24 часа
}
```

## 🚀 Использование

### 📦 Кеширование пользователей

```python
# backend/services/cache_service.py
import json
from typing import Optional, Dict, Any
from .redis_config import redis_manager

class CacheService:
    def __init__(self):
        self.redis = None
    
    async def initialize(self):
        self.redis = await redis_manager.connect()
    
    async def set_user_session(
        self, 
        user_id: str, 
        session_data: Dict[str, Any], 
        ttl: int = 3600
    ):
        """Сохранение пользовательской сессии"""
        key = f"session:{user_id}"
        await self.redis.setex(
            key, 
            ttl, 
            json.dumps(session_data)
        )
    
    async def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получение пользовательской сессии"""
        key = f"session:{user_id}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None
    
    async def invalidate_user_session(self, user_id: str):
        """Удаление пользовательской сессии"""
        key = f"session:{user_id}"
        await self.redis.delete(key)

cache_service = CacheService()
```

### 📚 Кеширование квизов

```python
async def cache_quiz_list(category: str, quizzes: list, ttl: int = 600):
    """Кеширование списка квизов по категории"""
    key = f"quizzes:{category}"
    await cache_service.redis.setex(
        key, 
        ttl, 
        json.dumps(quizzes, default=str)
    )

async def get_cached_quiz_list(category: str) -> Optional[list]:
    """Получение закешированного списка квизов"""
    key = f"quizzes:{category}"
    data = await cache_service.redis.get(key)
    return json.loads(data) if data else None
```

### 🛡️ Rate Limiting

```python
async def check_rate_limit(
    ip_address: str, 
    limit: int = 100, 
    window: int = 60
) -> bool:
    """Проверка rate limit для IP адреса"""
    key = f"rate_limit:{ip_address}"
    
    # Получаем текущее количество запросов
    current = await cache_service.redis.get(key)
    
    if current is None:
        # Первый запрос - устанавливаем счетчик
        await cache_service.redis.setex(key, window, 1)
        return True
    
    if int(current) >= limit:
        return False
    
    # Увеличиваем счетчик
    await cache_service.redis.incr(key)
    return True
```

## 🔧 Middleware интеграция

### 🔒 Аутентификация с кешем

```python
# backend/middleware/auth_middleware.py
from fastapi import Request, HTTPException
from .cache_service import cache_service

async def get_current_user_cached(request: Request):
    """Получение текущего пользователя с кешированием"""
    token = extract_token(request)
    
    # Проверяем blacklist
    is_blacklisted = await cache_service.redis.get(f"blacklist:{token}")
    if is_blacklisted:
        raise HTTPException(status_code=401, detail="Token blacklisted")
    
    # Пытаемся получить из кеша
    user_data = await cache_service.get_user_session(user_id)
    if user_data:
        return User(**user_data)
    
    # Если нет в кеше - получаем из БД и кешируем
    user = await get_user_from_db(user_id)
    if user:
        await cache_service.set_user_session(
            user_id, 
            user.dict(), 
            ttl=3600
        )
    
    return user
```

### ⚡ Кеширующий декоратор

```python
from functools import wraps
import asyncio

def cache_result(ttl: int = 300, key_prefix: str = ""):
    """Декоратор для кеширования результатов функций"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Генерируем ключ кеша
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Пытаемся получить из кеша
            cached = await cache_service.redis.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Выполняем функцию
            result = await func(*args, **kwargs)
            
            # Кешируем результат
            await cache_service.redis.setex(
                cache_key, 
                ttl, 
                json.dumps(result, default=str)
            )
            
            return result
        return wrapper
    return decorator

# Использование
@cache_result(ttl=600, key_prefix="quiz")
async def get_popular_quizzes(category: str):
    """Получение популярных квизов (с кешированием)"""
    return await db.quizzes.find({"category": category}).sort("views", -1).limit(10)
```

## 📊 Мониторинг

### 📈 Метрики Redis

```python
async def get_redis_stats():
    """Получение статистики Redis"""
    info = await cache_service.redis.info()
    return {
        "used_memory": info.get("used_memory_human"),
        "connected_clients": info.get("connected_clients"),
        "total_commands_processed": info.get("total_commands_processed"),
        "keyspace_hits": info.get("keyspace_hits"),
        "keyspace_misses": info.get("keyspace_misses"),
        "hit_rate": info.get("keyspace_hits", 0) / 
                   (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1))
    }
```

### 🔍 Debugging

```python
async def debug_cache_keys(pattern: str = "*"):
    """Отладка ключей кеша"""
    keys = await cache_service.redis.keys(pattern)
    result = {}
    
    for key in keys:
        ttl = await cache_service.redis.ttl(key)
        size = await cache_service.redis.memory_usage(key)
        result[key] = {
            "ttl": ttl,
            "size_bytes": size,
            "type": await cache_service.redis.type(key)
        }
    
    return result
```

## 🚀 Best Practices

### ✅ Рекомендации

1. **Используйте префиксы** для группировки ключей
2. **Устанавливайте TTL** для всех ключей
3. **Сериализуйте данные** в JSON для читаемости
4. **Мониторьте память** Redis регулярно
5. **Используйте pipeline** для batch операций

### ❌ Чего избегать

1. **Не храните большие объекты** (>100MB)
2. **Не используйте Redis как основную БД**
3. **Не забывайте про TTL** - память не бесконечна
4. **Не делайте синхронные вызовы** - только async
5. **Не игнорируйте ошибки** Redis подключения

## 🔧 Troubleshooting

### Частые проблемы

**❓ Redis не подключается**
```bash
# Проверить статус Redis
redis-cli ping

# Проверить логи
docker logs eduplatform-redis
```

**❓ Высокое потребление памяти**
```bash
# Анализ памяти
redis-cli --bigkeys

# Очистка кеша
redis-cli FLUSHDB
```

**❓ Медленные запросы**
```bash
# Мониторинг команд
redis-cli MONITOR

# Включить slow log
redis-cli CONFIG SET slowlog-log-slower-than 10000
```

---

*Кеширование - это искусство балансирования между скоростью и актуальностью данных* 🎨 