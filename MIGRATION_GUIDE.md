# 🚀 Руководство по миграции MongoDB из локальной базы в Atlas

## 📋 Обзор
Это руководство поможет вам перенести данные из локальной MongoDB (MongoDB Compass) в MongoDB Atlas, чтобы ваша команда могла работать с общей облачной базой данных.

## 🛠️ Предварительные требования

### 1. Установка MongoDB Database Tools
Скачайте и установите MongoDB Database Tools с официального сайта:
- **Windows**: https://www.mongodb.com/try/download/database-tools
- Распакуйте архив и добавьте папку `bin` в PATH системы

### 2. Проверка установки
Откройте PowerShell и выполните:
```powershell
mongodump --version
mongorestore --version
```

## 🌟 Шаг 1: Создание кластера в MongoDB Atlas

### 1.1 Регистрация
1. Перейдите на https://www.mongodb.com/atlas
2. Зарегистрируйтесь или войдите в аккаунт
3. Создайте новый проект (например, "EduPlatform Team")

### 1.2 Создание кластера
1. Нажмите "Build a Database"
2. Выберите **FREE tier (M0 Sandbox)**
3. Выберите регион (рекомендуется ближайший к вашей команде)
4. Назовите кластер (например, "EduPlatform-Cluster")
5. Нажмите "Create Cluster"

### 1.3 Настройка безопасности

#### Создание пользователя:
1. В разделе "Security" → "Database Access"
2. Нажмите "Add New Database User"
3. Выберите "Password"
4. Имя пользователя: `eduplatform_user`
5. Пароль: создайте надежный пароль
6. Database User Privileges: "Read and write to any database"
7. Нажмите "Add User"

#### Настройка сетевого доступа:
1. В разделе "Security" → "Network Access"
2. Нажмите "Add IP Address"
3. Выберите "Add My Current IP Address" или "Allow Access from Anywhere" (для команды)
4. Нажмите "Confirm"

## 📦 Шаг 2: Экспорт данных из локальной MongoDB

### 2.1 Запуск локальной MongoDB
Убедитесь, что ваша локальная MongoDB запущена:
```powershell
# Если используете Docker
docker-compose up mongodb

# Или проверьте через MongoDB Compass
```

### 2.2 Экспорт данных
Запустите скрипт экспорта:
```powershell
python export_data.py
```

Скрипт создаст папку с экспортированными данными в формате `mongodb_export_YYYYMMDD_HHMMSS`.

## ⬆️ Шаг 3: Импорт данных в Atlas

### 3.1 Получение Connection String
1. В Atlas перейдите к вашему кластеру
2. Нажмите "Connect"
3. Выберите "Connect your application"
4. Выберите "Python" и версию "3.12 or later"
5. Скопируйте connection string
6. Замените `<password>` на пароль пользователя

**Пример**: 
```
mongodb+srv://eduplatform_user:YOUR_PASSWORD@eduplatform-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3.2 Импорт данных
Запустите скрипт импорта:
```powershell
python import_to_atlas.py
```

Введите:
- Atlas Connection String (без названия базы данных)
- Путь к папке с экспортом

## ⚙️ Шаг 4: Обновление конфигурации приложения

### 4.1 Создание .env файла
Создайте или обновите файл `.env`:
```env
# MongoDB Atlas Configuration
MONGODB_URL=mongodb+srv://eduplatform_user:YOUR_PASSWORD@eduplatform-cluster.xxxxx.mongodb.net/LearnApp?retryWrites=true&w=majority
SECRET_KEY=your_secret_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
OPENAI_API_KEY=your_openai_api_key_here
```

### 4.2 Обновление Docker Compose
Обновите `docker-compose.yml` для использования Atlas вместо локальной MongoDB:

```yaml
version: '3.8'
services:
  # Удалите или закомментируйте секцию mongodb
  # mongodb:
  #   image: mongo:6.0
  #   ...

  backend:
    build: ./backend
    container_name: backend
    restart: always
    environment:
      - MONGODB_URL=${MONGODB_URL}  # Используем переменную из .env
    # Удалите depends_on: mongodb
    ports:
      - "8000:8000"

  # Остальные сервисы остаются без изменений
  frontend:
    build: ./frontend
    container_name: frontend
    restart: always
    depends_on:
      - backend
    expose:
      - "80"

  nginx:
    image: nginx:1.25-alpine
    container_name: nginx-container
    depends_on:
      - frontend
    ports:
      - "80:80"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro

# Удалите или закомментируйте volumes для MongoDB
# volumes:
#   mongo_data:
```

## 🧪 Шаг 5: Тестирование

### 5.1 Проверка подключения
```powershell
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def test_connection():
    uri = 'YOUR_ATLAS_CONNECTION_STRING'
    client = AsyncIOMotorClient(uri)
    try:
        await client.admin.command('ping')
        print('✅ Подключение к Atlas успешно!')
        
        # Проверяем базу данных
        db = client.LearnApp
        collections = await db.list_collection_names()
        print(f'📊 Найдено коллекций: {len(collections)}')
        for col in collections:
            count = await db[col].count_documents({})
            print(f'   - {col}: {count} документов')
    except Exception as e:
        print(f'❌ Ошибка подключения: {e}')
    finally:
        client.close()

asyncio.run(test_connection())
"
```

### 5.2 Запуск приложения
```powershell
# Установите переменные окружения и запустите
docker-compose up --build
```

## 👥 Шаг 6: Предоставление доступа команде

### 6.1 Добавление IP-адресов команды
В Atlas → Security → Network Access:
1. Нажмите "Add IP Address"
2. Добавьте IP-адрес каждого участника команды
3. Или выберите "Allow Access from Anywhere" (менее безопасно)

### 6.2 Создание дополнительных пользователей (опционально)
Для каждого участника команды можете создать отдельного пользователя:
1. Database Access → Add New Database User
2. Настройте роли согласно потребностям (чтение/запись/админ)

### 6.3 Поделитесь с командой
Отправьте команде:
- Connection String
- Логин и пароль пользователя
- Инструкции по обновлению `.env` файла

## 📊 Мониторинг и управление

### Atlas Dashboard
- **Metrics**: Мониторинг производительности
- **Real Time**: Просмотр операций в реальном времени  
- **Profiler**: Анализ медленных запросов
- **Alerts**: Настройка уведомлений

### Backup
Atlas автоматически создает резервные копии для кластеров M10+. 
Для M0 (бесплатный) резервные копии не создаются автоматически.

## 🔒 Рекомендации по безопасности

1. **Используйте сильные пароли** для пользователей базы данных
2. **Ограничьте IP-адреса** - не используйте "Allow Access from Anywhere" в продакшене
3. **Настройте роли пользователей** - давайте минимально необходимые права
4. **Включите аудит** для критически важных операций
5. **Регулярно проверяйте** логи подключений

## 🆘 Устранение проблем

### Проблема: "mongodump not found"
**Решение**: Установите MongoDB Database Tools и добавьте в PATH

### Проблема: "Authentication failed"
**Решение**: Проверьте логин/пароль в connection string

### Проблема: "Connection refused"
**Решение**: Проверьте Network Access в Atlas и добавьте ваш IP

### Проблема: "Database not found"
**Решение**: Убедитесь, что название базы данных указано правильно в URI

## 📞 Поддержка
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Community Forums: https://community.mongodb.com/
- Stack Overflow: тег `mongodb-atlas`

---

## ✅ Чек-лист миграции

- [ ] Установлены MongoDB Database Tools
- [ ] Создан кластер в MongoDB Atlas  
- [ ] Настроен пользователь базы данных
- [ ] Настроен сетевой доступ
- [ ] Экспортированы данные из локальной MongoDB
- [ ] Импортированы данные в Atlas
- [ ] Обновлен .env файл
- [ ] Обновлен docker-compose.yml
- [ ] Протестировано подключение
- [ ] Запущено приложение с новой базой
- [ ] Предоставлен доступ команде

🎉 **Поздравляем! Миграция завершена!** 