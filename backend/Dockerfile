# 🐍 Multi-stage build для оптимизации размера образа
FROM python:3.9-slim as builder

# 📋 Установка системных зависимостей для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 🔧 Создание виртуального окружения
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 📦 Копирование requirements и установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 🚀 Production образ
FROM python:3.9-slim

# 👤 Создание пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 📋 Установка runtime зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 📁 Копирование виртуального окружения из builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 🏠 Настройка рабочей директории
WORKDIR /app

# 📂 Копирование кода приложения
COPY . .

# 🔐 Изменение владельца файлов
RUN chown -R appuser:appuser /app

# 👤 Переключение на непривилегированного пользователя
USER appuser

# 🌐 Открытие порта
EXPOSE 8000

# ✅ Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 🚀 Команда запуска
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"] 