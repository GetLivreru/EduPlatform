# 🤝 Руководство по участию в разработке

Добро пожаловать в EduPlatform! Мы рады, что вы хотите внести свой вклад в развитие образовательных технологий.

## 📋 Содержание

- [🎯 Как помочь проекту](#-как-помочь-проекту)
- [🐛 Сообщение о багах](#-сообщение-о-багах)
- [💡 Предложение новых функций](#-предложение-новых-функций)
- [🔧 Процесс разработки](#-процесс-разработки)
- [📝 Стандарты кода](#-стандарты-кода)
- [🧪 Тестирование](#-тестирование)
- [📚 Документация](#-документация)

## 🎯 Как помочь проекту

Есть множество способов внести вклад в EduPlatform:

- 🐛 **Найти и исправить баги**
- ✨ **Добавить новые функции**
- 📝 **Улучшить документацию**
- 🧪 **Написать тесты**
- 🎨 **Улучшить UI/UX**
- 🌍 **Перевести на другие языки**
- 📊 **Оптимизировать производительность**

## 🐛 Сообщение о багах

Прежде чем сообщить о баге:

1. **Поиск дубликатов**: Проверьте [существующие issues](https://github.com/your-repo/issues)
2. **Воспроизведение**: Убедитесь, что баг повторяется
3. **Окружение**: Подготовьте информацию о системе

### 📝 Шаблон бага

```markdown
**Описание бага**
Краткое описание того, что происходит.

**Шаги для воспроизведения**
1. Перейдите к '...'
2. Нажмите на '....'
3. Прокрутите вниз до '....'
4. Увидите ошибку

**Ожидаемое поведение**
Описание того, что должно было произойти.

**Скриншоты**
По возможности приложите скриншоты.

**Окружение:**
- OS: [например, Windows 10]
- Browser: [например, Chrome 91]
- Node.js: [например, 16.14.0]
- Python: [например, 3.9.7]

**Дополнительная информация**
Любая другая полезная информация.
```

## 💡 Предложение новых функций

Для предложения новых функций:

1. **Обсуждение**: Создайте [Discussion](https://github.com/your-repo/discussions)
2. **Описание**: Объясните проблему, которую решает функция
3. **Альтернативы**: Рассмотрите другие решения
4. **Реализация**: Предложите план реализации

### 📝 Шаблон функции

```markdown
**Описание функции**
Краткое описание новой функции.

**Мотивация**
Почему эта функция нужна? Какую проблему она решает?

**Детальное описание**
Подробное описание того, как функция должна работать.

**Возможные альтернативы**
Другие способы решения проблемы.

**Дополнительная информация**
Любые мокапы, диаграммы или примеры кода.
```

## 🔧 Процесс разработки

### 1️⃣ Подготовка окружения

```bash
# Форк репозитория
git clone https://github.com/your-username/eduplatform.git
cd eduplatform

# Установка зависимостей
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Настройка pre-commit hooks
pip install pre-commit
pre-commit install
```

### 2️⃣ Создание ветки

```bash
# Создание ветки для новой функции
git checkout -b feature/amazing-feature

# Создание ветки для исправления бага
git checkout -b bugfix/fix-login-issue

# Создание ветки для документации
git checkout -b docs/update-readme
```

### 3️⃣ Разработка

```bash
# Запуск в режиме разработки
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4️⃣ Коммиты

Используйте [Conventional Commits](https://conventionalcommits.org/):

```bash
# Примеры коммитов
git commit -m "feat: add quiz recommendation system"
git commit -m "fix: resolve login authentication issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for quiz service"
git commit -m "refactor: optimize database queries"
```

### 5️⃣ Pull Request

1. **Push в свой форк**:
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Создание PR** с описанием:
   - Что изменено
   - Почему изменено
   - Как тестировать
   - Скриншоты (если применимо)

## 📝 Стандарты кода

### 🐍 Backend (Python)

```bash
# Форматирование кода
black .
isort .

# Линтинг
flake8 .
mypy .

# Проверка безопасности
bandit -r .
```

**Настройки:**
- Максимальная длина строки: 88 символов
- Используйте type hints
- Документируйте функции с помощью docstrings
- Следуйте PEP 8

### ⚛️ Frontend (TypeScript/React)

```bash
# Форматирование
npm run format

# Линтинг
npm run lint

# Проверка типов
npm run type-check
```

**Настройки:**
- Используйте TypeScript для всех компонентов
- Следуйте React best practices
- Компоненты должны быть функциональными
- Используйте custom hooks для логики

### 📁 Структура файлов

```
backend/
├── routers/          # API маршруты
├── models/           # Модели данных
├── services/         # Бизнес-логика
├── utils/            # Утилиты
├── tests/            # Тесты
└── main.py           # Точка входа

frontend/
├── src/
│   ├── components/   # React компоненты
│   ├── pages/        # Страницы
│   ├── hooks/        # Custom hooks
│   ├── services/     # API клиенты
│   ├── utils/        # Утилиты
│   └── types/        # TypeScript типы
```

## 🧪 Тестирование

### Backend тесты

```bash
# Запуск всех тестов
pytest

# Тесты с покрытием
pytest --cov=. --cov-report=html

# Тесты конкретного модуля
pytest tests/test_auth.py -v
```

**Требования:**
- Покрытие кода: минимум 80%
- Unit тесты для всех функций
- Integration тесты для API endpoints
- Мокирование внешних сервисов

### Frontend тесты

```bash
# Unit тесты
npm test

# E2E тесты
npm run test:e2e

# Visual regression тесты
npm run test:visual
```

**Требования:**
- Тесты для всех компонентов
- Тесты для custom hooks
- E2E тесты для критических путей
- Accessibility тесты

## 📚 Документация

### API Документация

- Используйте docstrings для FastAPI endpoints
- Добавляйте примеры запросов/ответов
- Документируйте ошибки и коды статуса

```python
@router.post("/quizzes/", response_model=QuizResponse)
async def create_quiz(
    quiz: QuizCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Создание нового квиза.
    
    - **title**: Название квиза
    - **difficulty**: Уровень сложности (easy, medium, hard)
    - **questions**: Список вопросов
    
    Returns:
        QuizResponse: Созданный квиз с уникальным ID
        
    Raises:
        HTTPException: 400 если данные невалидны
        HTTPException: 401 если пользователь не авторизован
    """
```

### Компоненты React

```typescript
/**
 * Компонент для отображения квиза
 * 
 * @param quiz - Объект квиза для отображения
 * @param onAnswer - Callback для обработки ответов
 * @param isLoading - Флаг загрузки
 * 
 * @example
 * ```tsx
 * <QuizComponent 
 *   quiz={quizData} 
 *   onAnswer={handleAnswer}
 *   isLoading={false}
 * />
 * ```
 */
interface QuizComponentProps {
  quiz: Quiz;
  onAnswer: (answer: Answer) => void;
  isLoading: boolean;
}
```

## 🏷️ Версионирование

Мы используем [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Кардинальные изменения с нарушением обратной совместимости
- **MINOR** (0.1.0): Новые функции с сохранением обратной совместимости  
- **PATCH** (0.0.1): Исправления багов

## 🎉 Получение помощи

Если у вас есть вопросы:

- 💬 [GitHub Discussions](https://github.com/your-repo/discussions) - для общих вопросов
- 🐛 [GitHub Issues](https://github.com/your-repo/issues) - для багов и функций
- 📧 [Email](mailto:maintainers@eduplatform.com) - для приватных вопросов

## 🙏 Благодарности

Спасибо всем участникам, которые помогают развивать EduPlatform! Каждый вклад важен, независимо от размера.

---

**Помните**: Качество важнее количества. Лучше сделать одну функцию отлично, чем много функций плохо. 🚀 