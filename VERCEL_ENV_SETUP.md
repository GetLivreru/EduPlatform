# Настройка переменных окружения в Vercel

## Проблема
В деплое на Vercel возникает ошибка "Ошибка при загрузке квизов" из-за неправильной настройки переменных окружения для MongoDB Atlas.

## Решение

### 1. Переменные окружения в Vercel Dashboard

Зайдите в ваш проект на [vercel.com](https://vercel.com) и добавьте следующие переменные окружения:

#### MongoDB Atlas
```
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.xxxxx.mongodb.net/LearnApp?retryWrites=true&w=majority
```

**Где заменить:**
- `YOUR_USERNAME` - имя пользователя базы данных MongoDB Atlas
- `YOUR_PASSWORD` - пароль пользователя (убедитесь что экранированы специальные символы)
- `YOUR_CLUSTER` - название вашего кластера
- `xxxxx` - уникальный идентификатор кластера

#### Другие обязательные переменные
```
SECRET_KEY=your_super_secret_key_change_this_in_production_minimum_32_characters
CORS_ORIGINS=https://edu-platform-five.vercel.app,http://localhost:5173
```

#### Опциональные переменные
```
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Проверка MongoDB Atlas настроек

1. **Network Access**: Убедитесь что в MongoDB Atlas добавлен IP `0.0.0.0/0` для доступа из Vercel
2. **Database User**: Проверьте что пользователь имеет права `readWrite` на базу `LearnApp`
3. **Connection String**: Проверьте что строка подключения корректна

### 3. Пример правильной строки подключения

```
mongodb+srv://eduplatform_user:MySecurePass123@cluster0.abc12.mongodb.net/LearnApp?retryWrites=true&w=majority
```

### 4. Повторный деплой

После добавления переменных окружения:
1. Сохраните настройки в Vercel Dashboard
2. Перейдите в раздел "Deployments"
3. Нажмите "Redeploy" на последний деплой

### 5. Проверка логов

После повторного деплоя проверьте логи в Vercel:
1. Откройте последний деплой
2. Перейдите в "Functions"
3. Найдите функцию `backend/main.py`
4. Проверьте логи на ошибки подключения к MongoDB

## Диагностика

Если проблема остается, проверьте:

1. **API доступность**: https://edu-platform-five.vercel.app/api
2. **Административная панель**: https://edu-platform-five.vercel.app/admin/users
3. **Логи Vercel**: В Dashboard → Functions → View Function Logs

## Частые ошибки

1. **Неэкранированные символы в пароле**: Используйте URL encoding для специальных символов
2. **Неправильный Network Access**: IP должен быть 0.0.0.0/0 или конкретные IP Vercel
3. **Неправильное имя базы**: Убедитесь что используется `LearnApp`
4. **CORS ошибки**: Проверьте что домен добавлен в CORS_ORIGINS 