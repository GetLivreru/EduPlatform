# 🎓 EduPlatform - AI-Powered Educational Platform

<div align="center">

![EduPlatform](https://img.shields.io/badge/EduPlatform-AI%20Learning-blue?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.9+-green?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-red?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)

**🌟 Революционная образовательная платформа с ИИ-генерацией контента 🌟**

*Персонализированное обучение через адаптивные квизы и умные рекомендации*

---

[🚀 **Live Demo**](https://your-demo-url.com) • [📖 **Documentation**](https://docs.your-url.com) • [🐛 **Issues**](https://github.com/your-repo/issues) • [💬 **Discussions**](https://github.com/your-repo/discussions)

</div>

## 📋 Содержание

- [✨ Особенности](#-особенности)
- [🏗️ Архитектура](#️-архитектура)
- [🛠️ Технологический стек](#️-технологический-стек)
- [🚀 Быстрый старт](#-быстрый-старт)
- [⚙️ Конфигурация](#️-конфигурация)
- [📊 API Документация](#-api-документация)
- [🧪 Тестирование](#-тестирование)
- [🚢 Деплой](#-деплой)
- [🤝 Участие в разработке](#-участие-в-разработке)
- [📚 Дополнительная документация](#-дополнительная-документация)
- [📄 Лицензия](#-лицензия)

## ✨ Особенности

<table>
<tr>
<td width="50%">

### 🎯 **Для студентов**
- 🧠 **AI-персонализация** - умные рекомендации на основе анализа ошибок
- 📚 **Адаптивные квизы** - сложность подстраивается под уровень знаний
- 🏆 **Геймификация** - очки, достижения, рейтинги
- 📊 **Отслеживание прогресса** - детальная аналитика обучения
- 🎮 **Интерактивность** - современный UX/UI дизайн
- 📱 **Кроссплатформенность** - работает на всех устройствах

</td>
<td width="50%">

### 👨‍🏫 **Для преподавателей**
- 📄 **AI-генерация квизов** - автоматическое создание из документов
- 📈 **Аналитика класса** - детальная статистика по ученикам
- 🗂️ **Управление контентом** - загрузка PDF, DOCX, TXT файлов
- ⚡ **Быстрое создание** - квизы за минуты, не часы
- 🎨 **Гибкие настройки** - сложность, количество вопросов
- 📋 **Отчетность** - экспорт результатов и статистики

</td>
</tr>
</table>

### 🤖 **AI-возможности**
- **GPT-4 Integration** - генерация качественных вопросов из текста
- **Smart Recommendations** - персональные советы по изучению материала
- **Adaptive Learning** - автоматическая настройка сложности
- **Content Analysis** - извлечение ключевых тем из документов

### ⚡ **Производительность**
- **Redis Caching** - кеширование пользовательских сессий и данных квизов
- **Fast Response** - молниеносная загрузка благодаря оптимизированному кешу
- **Session Management** - надежное управление сессиями пользователей
- **Rate Limiting** - защита от спама и DDoS атак

## 🏗️ Архитектура

```mermaid
graph TB
    subgraph "🖥️ Frontend Layer"
        A["React + TypeScript"]
        B["Redux Toolkit"]
        C["TailwindCSS"]
    end
    
    subgraph "🔗 API Gateway"
        D["FastAPI Backend"]
        E["JWT Authentication"]
        F["CORS Middleware"]
    end
    
    subgraph "🤖 AI Services"
        G["OpenAI GPT-4"]
        H["Content Processor"]
        I["Recommendation Engine"]
    end
    
    subgraph "💾 Data Layer"
        J["MongoDB Atlas"]
        K["AWS S3 Storage"]
        L["Redis Cache"]
    end
    
    subgraph "☁️ Infrastructure"
        M["Vercel Frontend"]
        N["AWS Lambda Backend"]
        O["CloudWatch Logs"]
    end
    
    A --> D
    B --> D
    D --> G
    D --> J
    D --> K
    H --> G
    I --> G
    D --> L
    M --> N
    N --> O
```

### 🔧 **Микросервисная архитектура**

| Сервис | Технология | Назначение |
|--------|------------|------------|
| **API Gateway** | FastAPI | Маршрутизация запросов, аутентификация |
| **Auth Service** | JWT + MongoDB | Управление пользователями и ролями |
| **Quiz Engine** | Python + AI | Генерация и обработка квизов |
| **File Processor** | PyMuPDF + python-docx | Извлечение текста из документов |
| **AI Service** | OpenAI API | Генерация контента и рекомендаций |
| **Cache Service** | Redis | Кеширование данных и сессий |
| **Storage Service** | AWS S3 | Хранение файлов и медиа |
| **Database** | MongoDB Atlas | Основное хранилище данных |

## 🛠️ Технологический стек

<div align="center">

### **Backend Architecture**
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)

### **Frontend Stack**
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)

### **AI & ML**
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)
![GPT-4](https://img.shields.io/badge/GPT--4-00A67E?style=flat-square&logo=openai&logoColor=white)

### **DevOps & Infrastructure**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

</div>

### 📦 **Основные зависимости**

#### Backend Dependencies
```python
fastapi>=0.104.0          # Современный веб-фреймворк
motor>=3.3.0              # Async MongoDB драйвер
redis>=5.0.0              # Redis клиент для кеширования
pydantic>=2.4.0           # Валидация данных
python-jose>=3.3.0        # JWT токены
bcrypt>=4.0.0             # Хеширование паролей
openai>=1.0.0             # GPT интеграция
boto3>=1.29.0             # AWS S3 клиент
PyMuPDF>=1.23.0           # PDF обработка
python-docx>=1.1.0        # Word документы
python-multipart>=0.0.6   # Загрузка файлов
```

#### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@reduxjs/toolkit": "^1.9.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.5.0",
  "react-router-dom": "^6.8.0",
  "framer-motion": "^10.16.0"
}
```

## 🚀 Быстрый старт

### 📋 Предварительные требования

```bash
# Системные требования
Python 3.9+
Node.js 16+
Git
MongoDB (Atlas или локальный)
Redis (для кеширования)
AWS аккаунт (для S3)
OpenAI API ключ
```

### ⚡ Установка за 60 секунд

<details>
<summary><b>🖥️ Локальная разработка</b></summary>

#### 1️⃣ Клонирование репозитория
```bash
git clone https://github.com/your-username/eduplatform.git
cd eduplatform
```

#### 2️⃣ Backend настройка
```bash
# Переход в папку backend
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация (Windows)
venv\Scripts\activate
# Активация (macOS/Linux)
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

#### 3️⃣ Frontend настройка
```bash
# Переход в папку frontend
cd ../frontend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Отредактируйте .env.local с настройками API
```

#### 4️⃣ Запуск разработки
```bash
# Запуск backend (в терминале 1)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Запуск frontend (в терминале 2)
cd frontend
npm run dev
```

🎉 **Готово!** Приложение доступно на:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

</details>

<details>
<summary><b>🐳 Docker Compose (рекомендуется)</b></summary>

```bash
# Клонирование репозитория
git clone https://github.com/your-username/eduplatform.git
cd eduplatform

# Настройка окружения
cp .env.example .env
# Отредактируйте .env с вашими настройками

# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

Приложение будет доступно на http://localhost:3000

**🔧 Включенные сервисы:**
- 🖥️ **Frontend** (React) - http://localhost:3000
- 🐍 **Backend** (FastAPI) - http://localhost:8000
- 🗄️ **MongoDB** - localhost:27017
- 🔄 **Redis** - localhost:6379
- 📊 **Mongo Express** (DB Admin) - http://localhost:8081

</details>

## ⚙️ Конфигурация

### 🔐 Переменные окружения

<details>
<summary><b>Backend Environment (.env)</b></summary>

```bash
# 🗄️ База данных
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/eduplatform

# 🔑 Безопасность
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# 🤖 OpenAI настройки
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# ☁️ AWS S3 настройки
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=eduplatform-files

# 🔄 Redis настройки
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# 🌐 CORS настройки
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# 📧 Email настройки (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

</details>

<details>
<summary><b>Frontend Environment (.env.local)</b></summary>

```bash
# 🔗 API настройки
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=EduPlatform

# 📊 Аналитика (опционально)
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# 🎨 Темизация
NEXT_PUBLIC_THEME_COLOR=#3B82F6
NEXT_PUBLIC_BRAND_NAME=EduPlatform
```

</details>

## 📊 API Документация

### 🔗 Endpoints Overview

| Категория | Endpoint | Метод | Описание |
|-----------|----------|-------|----------|
| **👤 Auth** | `/auth/login` | POST | Авторизация пользователя |
| **👤 Auth** | `/auth/register` | POST | Регистрация нового пользователя |
| **📚 Quizzes** | `/quizzes/` | GET | Получение списка квизов |
| **📚 Quizzes** | `/quizzes/{id}` | GET | Получение конкретного квиза |
| **🎯 Attempts** | `/quiz-attempts/` | POST | Создание попытки прохождения |
| **🎯 Attempts** | `/quiz-attempts/{id}/answer` | POST | Отправка ответа на вопрос |
| **👨‍🏫 Teachers** | `/teachers/upload-document` | POST | Загрузка документа и генерация квиза |
| **👨‍🏫 Teachers** | `/teachers/my-generated-quizzes` | GET | Квизы преподавателя |

### 📝 Примеры запросов

<details>
<summary><b>🔐 Авторизация</b></summary>

```bash
# Регистрация нового пользователя
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student123",
    "email": "student@example.com",
    "password": "securepassword",
    "role": "student"
  }'

# Авторизация
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student123&password=securepassword"
```

</details>

<details>
<summary><b>📚 Работа с квизами</b></summary>

```bash
# Получение списка квизов
curl -X GET "http://localhost:8000/quizzes/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Создание попытки прохождения
curl -X POST "http://localhost:8000/quiz-attempts/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quiz_id": "60c72b2f9b1d7c2d1c8b4567"}'

# Отправка ответа на вопрос
curl -X POST "http://localhost:8000/quiz-attempts/ATTEMPT_ID/answer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question_index": 0, "answer": 2}'
```

</details>

<details>
<summary><b>👨‍🏫 Функции преподавателя</b></summary>

```bash
# Загрузка документа и генерация квиза
curl -X POST "http://localhost:8000/teachers/upload-document" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "quiz_title=Основы программирования" \
  -F "difficulty=intermediate" \
  -F "questions_count=10"
```

</details>

### 📋 Схемы данных

<details>
<summary><b>👤 User Schema</b></summary>

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "student | teacher | admin",
  "quiz_points": "number",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

</details>

<details>
<summary><b>📚 Quiz Schema</b></summary>

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "easy | intermediate | hard",
  "questions": [
    {
      "question": "string",
      "options": ["string"],
      "correct_answer": "number"
    }
  ],
  "created_by": "string",
  "created_at": "datetime"
}
```

</details>

### 🔍 Интерактивная документация

После запуска backend сервера:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🧪 Тестирование

### 🔧 Backend тесты

```bash
cd backend

# Установка тестовых зависимостей
pip install pytest pytest-asyncio pytest-cov httpx

# Запуск всех тестов
pytest

# Запуск с покрытием кода
pytest --cov=. --cov-report=html

# Запуск конкретного теста
pytest tests/test_auth.py::test_login_success -v
```

### ⚛️ Frontend тесты

```bash
cd frontend

# Запуск unit тестов
npm test

# Запуск E2E тестов
npm run test:e2e

# Запуск с покрытием
npm run test:coverage
```

### 📊 Структура тестов

```
tests/
├── backend/
│   ├── test_auth.py           # Тесты авторизации
│   ├── test_quizzes.py        # Тесты квизов
│   ├── test_teachers.py       # Тесты функций преподавателя
│   └── test_ai_service.py     # Тесты AI сервиса
├── frontend/
│   ├── components/            # Тесты компонентов
│   ├── pages/                 # Тесты страниц
│   └── utils/                 # Тесты утилит
└── e2e/                       # End-to-end тесты
    ├── auth.spec.ts
    ├── quiz.spec.ts
    └── teacher.spec.ts
```

## 🚢 Деплой

### 🌐 Production деплой

<details>
<summary><b>☁️ Vercel (Frontend) + AWS Lambda (Backend)</b></summary>

#### Frontend (Vercel)
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
cd frontend
vercel --prod
```

#### Backend (AWS Lambda)
```bash
# Установка Serverless Framework
npm install -g serverless

# Настройка AWS credentials
aws configure

# Деплой
cd backend
serverless deploy --stage prod
```

</details>

<details>
<summary><b>🐳 Docker + Railway/Heroku</b></summary>

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

</details>

### 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          cd backend && pytest
          cd ../frontend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Backend
        run: serverless deploy --stage prod
```

## 🤝 Участие в разработке

### 🎯 Roadmap

- [x] **Базовая функциональность квизов**
- [x] **AI-генерация контента**
- [x] **Система аутентификации**
- [x] **Загрузка и обработка документов**
- [ ] **Мобильное приложение** (React Native)
- [ ] **Видео контент** поддержка
- [ ] **Групповые квизы** и соревнования
- [ ] **Интеграция с LMS** (Moodle, Canvas)
- [ ] **Голосовые ответы** и распознавание речи
- [ ] **AR/VR** интеграция для иммерсивного обучения

### 🐛 Как сообщить о баге

1. Проверьте [существующие issues](https://github.com/your-repo/issues)
2. Создайте новый issue с тегом `bug`
3. Опишите проблему подробно
4. Приложите скриншоты/логи если возможно

### 💡 Предложение новых функций

1. Создайте issue с тегом `enhancement`
2. Опишите функциональность и её пользу
3. Обсудите в [Discussions](https://github.com/your-repo/discussions)

### 🔧 Процесс разработки

```bash
# 1. Форк репозитория
git clone https://github.com/your-username/eduplatform.git

# 2. Создание ветки для функции
git checkout -b feature/amazing-feature

# 3. Commit изменений
git commit -m "feat: add amazing feature"

# 4. Push в ваш fork
git push origin feature/amazing-feature

# 5. Создание Pull Request
```

### 📝 Стандарты кода

- **Backend**: Black, flake8, mypy
- **Frontend**: ESLint, Prettier, TypeScript
- **Commits**: [Conventional Commits](https://conventionalcommits.org/)
- **Documentation**: Docstrings для всех функций

## 📚 Дополнительная документация

### 📖 Техническая документация
- 🔄 **[Кеширование с Redis](docs/CACHING.md)** - полное руководство по кешированию
- 🤖 **[AI Integration](docs/AI_INTEGRATION.md)** - интеграция с OpenAI GPT-4
- 🗄️ **[Database Schema](docs/DATABASE.md)** - схема базы данных MongoDB
- 🔒 **[Security Guide](docs/SECURITY.md)** - рекомендации по безопасности
- 📊 **[Monitoring](docs/MONITORING.md)** - мониторинг и логирование

### 🎯 Руководства пользователя
- 👨‍🏫 **[Teacher Guide](docs/TEACHER_GUIDE.md)** - руководство для преподавателей
- 👨‍🎓 **[Student Guide](docs/STUDENT_GUIDE.md)** - руководство для студентов
- 🔧 **[Admin Guide](docs/ADMIN_GUIDE.md)** - руководство администратора

### 🔧 Разработка
- 🏗️ **[Architecture](docs/ARCHITECTURE.md)** - детальная архитектура системы
- ⚡ **[Performance](docs/PERFORMANCE.md)** - оптимизация производительности
- 🧪 **[Testing Strategy](docs/TESTING.md)** - стратегия тестирования

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- 🤖 **OpenAI** за мощные языковые модели
- 📚 **FastAPI** за отличный Python фреймворк
- ⚛️ **React** сообщество за экосистему
- 🎨 **Tailwind CSS** за прекрасный дизайн-фреймворк
- 🗄️ **MongoDB** за гибкую базу данных

---

<div align="center">

**⭐ Поставьте звезду если проект был полезен! ⭐**

[🐦 Twitter](https://twitter.com/your-handle) • [💼 LinkedIn](https://linkedin.com/in/your-profile) • [📧 Email](mailto:your-email@example.com)

*Сделано с ❤️ и ☕ для будущего образования*

</div>
