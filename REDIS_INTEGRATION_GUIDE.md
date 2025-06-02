# 🚀 Redis Integration Guide

## 📋 Обзор

Redis интегрирован в вашу образовательную платформу для:
- **Кэширование** часто запрашиваемых данных
- **Сохранение сессий** пользователей
- **Ускорение работы** приложения

## 🎯 Что кэшируется в Redis

### 🔥 ВЫСОКИЙ ПРИОРИТЕТ (быстрый доступ)

#### 1. **Сессии пользователей** 
```redis
session:{user_id}
TTL: 30 минут
Данные: {id, name, login, role, quiz_points, last_activity}
```

#### 2. **Профили пользователей**
```redis
user:{user_id}
TTL: 30 минут  
Данные: {id, name, login, role, quiz_points, created_at}
```

#### 3. **Список всех квизов**
```redis
quizzes:all
TTL: 10 минут
Данные: [{id, title, category, difficulty, time_limit}...]
```

#### 4. **Детали конкретных квизов**
```redis
quiz:{quiz_id}
TTL: 1 час
Данные: {title, description, questions, category, difficulty...}
```

### 📊 СРЕДНИЙ ПРИОРИТЕТ (аналитика)

#### 5. **Результаты пользователя**
```redis
user_results:{user_id}
TTL: 2 часа
Данные: [{quiz_id, score, completed_at}...]
```

#### 6. **Рекомендации обучения**
```redis
recommendations:{user_id}
TTL: 6 часов
Данные: {weak_areas, resources, schedule...}
```

#### 7. **Персональный план обучения**
```redis
learning_path:{user_id}
TTL: 24 часа
Данные: {subject, level, content, duration...}
```

#### 8. **Статистика квизов**
```redis
quiz_stats:{quiz_id}
TTL: 1 час
Данные: {total_attempts, avg_score, completion_rate}
```

#### 9. **Топ пользователей**
```redis
leaderboard:top
TTL: 5 минут
Данные: [{user_id, name, points}...]
```

## 🛠️ Техническая реализация

### Файловая структура
```
backend/
├── redis_cache.py          # 🆕 Основной модуль Redis
├── main.py                 # ✅ Интеграция с FastAPI
├── routers/
│   ├── quizzes.py         # ✅ Кэширование квизов
│   └── ...
├── requirements.txt        # ✅ Redis зависимости
└── env_example.txt        # ✅ Пример конфигурации
```

### Ключевые методы Redis

#### **Основные операции**
```python
from redis_cache import cache

# Сохранить данные
await cache.set("key", data, ttl=3600)

# Получить данные  
data = await cache.get("key")

# Удалить ключ
await cache.delete("key")

# Проверить существование
exists = await cache.exists("key")
```

#### **Специализированные методы**
```python
# Сессии
await cache.save_session(user_id, session_data)
session = await cache.get_session(user_id)

# Квизы
await cache.cache_quiz(quiz_id, quiz_data)
quiz = await cache.get_quiz(quiz_id)

# Профили
await cache.cache_user_profile(user_id, profile_data)
profile = await cache.get_user_profile(user_id)

# Инвалидация кэша
await cache.invalidate_user_cache(user_id)
await cache.invalidate_quiz_cache(quiz_id)
```

## 🐳 Docker Setup

### Обновленный docker-compose.yml
```yaml
services:
  # Redis сервис
  redis:
    image: redis:7.2-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # Backend с Redis
  backend:
    build: ./backend
    environment:
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://admin:password123@mongodb:27017/LearnApp?authSource=admin
    depends_on:
      - mongodb
      - redis

volumes:
  redis_data:    # 🆕 Том для данных Redis
```

## 🚀 Запуск проекта

### 1. Локальная разработка
```bash
# Установка Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Запуск Redis
sudo systemctl start redis-server

# Проверка работы
redis-cli ping
# Ответ: PONG
```

```bash
# Установка зависимостей Python
cd backend
pip install -r requirements.txt

# Настройка переменных окружения
cp env_example.txt .env
# Отредактируйте .env файл

# Запуск backend
uvicorn main:app --reload
```

### 2. Docker запуск
```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка логов Redis
docker logs redis

# Подключение к Redis CLI
docker exec -it redis redis-cli
```

## 📊 Мониторинг и отладка

### Redis CLI команды
```bash
# Подключение
redis-cli

# Просмотр всех ключей
KEYS *

# Просмотр ключей по паттерну
KEYS session:*
KEYS quiz:*
KEYS user:*

# Получение значения
GET session:507f1f77bcf86cd799439011

# Проверка TTL
TTL quiz:507f1f77bcf86cd799439011

# Информация о Redis
INFO memory
INFO stats

# Очистка всех данных (осторожно!)
FLUSHALL
```

### Логирование в приложении
```python
# Примеры логов в коде:
print("📦 Профиль пользователя {user_id} получен из кэша")
print("💾 Список квизов сохранен в кэш")
print("🗑️ Кэш квиза {quiz_id} очищен после обновления")
```

## ⚡ Производительность

### Ожидаемые улучшения:
- **Квизы**: 80-90% запросов из кэша
- **Профили**: 70-85% запросов из кэша  
- **Сессии**: 95% запросов из кэша
- **Общая скорость**: улучшение на 2-5x

### Стратегии инвалидации:
```python
# При создании квиза
await cache.delete("quizzes:all")

# При обновлении квиза
await cache.invalidate_quiz_cache(quiz_id)

# При обновлении профиля
await cache.invalidate_user_cache(user_id)
```

## 🔧 Настройка производительности

### Рекомендуемые TTL
```python
# Быстро изменяющиеся данные
SESSION_TTL = 1800      # 30 минут
PROFILE_TTL = 1800      # 30 минут
LEADERBOARD_TTL = 300   # 5 минут

# Средне изменяющиеся данные  
QUIZ_LIST_TTL = 600     # 10 минут
QUIZ_TTL = 3600         # 1 час
USER_RESULTS_TTL = 7200 # 2 часа

# Медленно изменяющиеся данные
RECOMMENDATIONS_TTL = 21600  # 6 часов
LEARNING_PATH_TTL = 86400    # 24 часа
```

### Конфигурация Redis
```conf
# redis.conf рекомендации для продакшена
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10  
save 60 10000
```

## 🛡️ Безопасность

### Рекомендации:
1. **Не кэшировать пароли** и конфиденциальные данные
2. **Использовать TTL** для всех ключей
3. **Настроить аутентификацию** Redis в продакшене
4. **Мониторинг доступа** к Redis

### Продакшн настройки:
```bash
# Включить аутентификацию
requirepass your-strong-redis-password

# Отключить опасные команды
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

## 🎯 Для диплома

### Преимущества кэширования:
1. **Снижение нагрузки на MongoDB** на 60-80%
2. **Ускорение отклика API** в 2-5 раз
3. **Масштабируемость** для большого числа пользователей
4. **Персонализация** через кэш сессий и рекомендаций

### Архитектурные решения:
- **Двухуровневое хранение**: Redis (быстрый доступ) + MongoDB (надежность)
- **Автоматическая инвалидация** кэша при изменениях
- **Graceful degradation**: приложение работает без Redis
- **Мониторинг** производительности кэша

Это решение демонстрирует **современный подход** к оптимизации веб-приложений и является отличным дополнением к дипломному проекту! 🚀 