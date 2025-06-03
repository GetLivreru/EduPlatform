# 🚀 AWS S3 Интеграция - Руководство по настройке

## 📋 Обзор

Ваша образовательная платформа теперь использует **AWS S3** для хранения документов (PDF, DOCX, TXT), которые преподаватели загружают для создания ИИ-тестов. Это обеспечивает:

- ✅ **Масштабируемость** - неограниченное хранилище
- ✅ **Надежность** - 99.999999999% (11 девяток) прочности данных
- ✅ **Производительность** - быстрый доступ к файлам
- ✅ **Безопасность** - управление доступом и шифрование
- ✅ **Экономичность** - оплата только за использованное пространство

---

## 🛠️ Что изменилось

### ❌ **ДО (MongoDB хранилище)**
```javascript
// Документы хранились внутри MongoDB
{
  _id: ObjectId,
  filename: "document.pdf",
  content_type: "application/pdf", 
  file_data: BinaryData,  // ❌ Файл в БД
  size: 1048576,
  uploaded_by: "user_id"
}
```

### ✅ **ПОСЛЕ (S3 + MongoDB метаданные)**
```javascript
// Только метаданные в MongoDB
{
  _id: ObjectId,
  s3_key: "user_id/uuid.pdf",        // 🔑 Ключ файла в S3
  s3_bucket: "eduplatform-documents", // 🪣 S3 bucket
  s3_region: "us-east-1",            // 🌍 AWS регион
  original_filename: "document.pdf",
  content_type: "application/pdf",
  file_size: 1048576,
  uploaded_by: "user_id"
}
```

---

## 🔧 Настройка AWS S3

### 1. Создание AWS аккаунта
1. Перейдите на [aws.amazon.com](https://aws.amazon.com)
2. Зарегистрируйтесь или войдите в консоль AWS
3. Активируйте AWS Free Tier (12 месяцев бесплатно)

### 2. Создание IAM пользователя
```bash
# В AWS Console:
IAM → Users → Create User
```

**Настройки пользователя:**
- **Username**: `eduplatform-s3-user`
- **Access type**: `Programmatic access`
- **Permissions**: `Attach existing policies directly`
- **Policy**: `AmazonS3FullAccess` (или создайте custom policy)

**Custom Policy (рекомендуется):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:CreateBucket"
            ],
            "Resource": [
                "arn:aws:s3:::eduplatform-documents",
                "arn:aws:s3:::eduplatform-documents/*"
            ]
        }
    ]
}
```

### 3. Получение учетных данных
После создания пользователя сохраните:
- ✅ **Access Key ID**: `AKIA...`
- ✅ **Secret Access Key**: `wJalrXUt...`

⚠️ **ВАЖНО**: Никогда не публикуйте эти ключи в коде!

### 4. Создание S3 Bucket
```bash
# В AWS Console:
S3 → Create bucket
```

**Настройки bucket:**
- **Bucket name**: `eduplatform-documents` (должно быть уникальным)
- **Region**: `us-east-1` (или ваш предпочтительный регион)
- **Block public access**: `Enabled` (по умолчанию)
- **Versioning**: `Disabled` (для экономии)
- **Encryption**: `Server-side encryption with Amazon S3 managed keys (SSE-S3)`

---

## ⚙️ Настройка проекта

### 1. Установка зависимостей
```bash
cd backend
pip install boto3==1.34.0 aioboto3==12.4.0
```

### 2. Переменные окружения
Добавьте в `.env`:
```env
# AWS S3 настройки
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=eduplatform-documents
```

### 3. Проверка подключения
```bash
cd backend
python -c "
from s3_service import s3_service
print('S3 доступен:', s3_service.is_available())
"
```

---

## 🔄 Миграция существующих данных

Если у вас уже есть документы в MongoDB, выполните миграцию:

### 1. Создайте резервную копию
```bash
mongodump --uri="mongodb://localhost:27017/LearnApp" --out=backup_before_s3_migration
```

### 2. Запустите миграцию
```bash
cd backend
python migrate_to_s3.py
```

Скрипт автоматически:
- ✅ Найдет документы без `s3_key`
- ✅ Загрузит файлы в S3
- ✅ Обновит метаданные в MongoDB
- ✅ Удалит файловые данные из MongoDB

---

## 🧪 Тестирование

### 1. Загрузка документа
```bash
curl -X POST "http://localhost:8000/teachers/upload-document" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "quiz_title=Тестовый квиз" \
  -F "difficulty=Medium" \
  -F "questions_count=5"
```

### 2. Получение списка документов
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/teachers/my-documents"
```

### 3. Скачивание документа
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/teachers/download/DOCUMENT_ID"
```

---

## 📊 API изменения

### Новые endpoints

#### `POST /teachers/upload-document`
**Изменения:**
- Файл загружается в S3
- Возвращает `s3_key` в ответе

#### `GET /teachers/my-documents`
**Новые поля в ответе:**
```json
{
  "documents": [
    {
      "id": "...",
      "s3_key": "user_id/uuid.pdf",
      "download_url": "https://presigned-url...",
      "file_exists": true,
      "original_filename": "document.pdf"
    }
  ]
}
```

#### `GET /teachers/download/{document_id}` *(новый)*
**Ответ:**
```json
{
  "download_url": "https://presigned-url...",
  "filename": "document.pdf",
  "expires_in": 3600,
  "file_size": 1048576
}
```

#### `DELETE /teachers/documents/{document_id}`
**Изменения:**
- Удаляет файл из S3
- Удаляет метаданные из MongoDB

---

## 🔒 Безопасность

### Presigned URLs
Для скачивания используются временные ссылки:
- ⏰ **Время жизни**: 1 час
- 🔐 **Доступ**: только автору документа
- 🛡️ **Защита**: подписаны AWS ключом

### Права доступа
- ✅ **Преподаватели**: загрузка, просмотр, удаление своих файлов
- ❌ **Студенты**: нет доступа к файлам
- ❌ **Админы**: нет доступа к ИИ генератору

### Валидация
```python
# Размер файла: максимум 10MB
if file.size > 10 * 1024 * 1024:
    raise HTTPException(400, "Файл слишком большой")

# Типы файлов: только PDF, DOCX, TXT
allowed_types = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "text/plain"
]
```

---

## 💰 Стоимость

### AWS S3 Free Tier (первые 12 месяцев)
- 📦 **Хранилище**: 5 GB
- 📤 **PUT запросы**: 2,000
- 📥 **GET запросы**: 20,000
- 🌐 **Передача данных**: 15 GB исходящего трафика

### После Free Tier
- 📦 **Хранилище**: ~$0.023 за GB в месяц
- 📤 **PUT запросы**: ~$0.0005 за 1,000 запросов
- 📥 **GET запросы**: ~$0.0004 за 1,000 запросов

**Пример для 100 документов (50MB):**
- Хранилище: ~$0.01/месяц
- Запросы: ~$0.001/месяц
- **Итого**: ~$0.01/месяц

---

## 🚨 Мониторинг и логи

### Backend логи
```python
# S3 операции логируются
logger.info(f"✅ Файл загружен в S3: {s3_key}")
logger.info(f"✅ Файл удален из S3: {s3_key}")
logger.error(f"❌ Ошибка загрузки в S3: {error}")
```

### CloudWatch (рекомендуется)
Настройте мониторинг в AWS:
- 📊 **Метрики**: размер bucket, количество объектов
- ⚠️ **Алерты**: превышение лимитов
- 📈 **Дашборды**: визуализация использования

---

## 🔧 Устранение неполадок

### Ошибка: "S3 сервис недоступен"
```bash
# Проверьте переменные окружения
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET_NAME

# Проверьте права IAM пользователя
aws s3 ls s3://eduplatform-documents --profile your-profile
```

### Ошибка: "Bucket не существует"
```python
# S3 сервис автоматически создаст bucket
# Или создайте вручную в AWS Console
```

### Ошибка: "Access Denied"
```bash
# Проверьте IAM policy
# Убедитесь, что пользователь имеет права на bucket
```

### Большие файлы
```python
# Для файлов >5GB используйте multipart upload
# Текущий лимит: 10MB (настраивается)
```

---

## 🎯 Рекомендации

### Production настройки
1. **Separate buckets**: dev, staging, production
2. **IAM roles**: вместо access keys для EC2/ECS
3. **VPC endpoints**: для приватного трафика
4. **Lifecycle policies**: автоудаление старых файлов
5. **Cross-region replication**: для резервирования

### Оптимизация
1. **CloudFront CDN**: для быстрой доставки файлов
2. **S3 Transfer Acceleration**: для загрузки из разных регионов
3. **S3 Intelligent Tiering**: автоматическая оптимизация стоимости

### Мониторинг
1. **AWS CloudTrail**: аудит API вызовов
2. **S3 access logs**: детальная аналитика
3. **Cost anomaly detection**: контроль расходов

---

## 🎉 Заключение

✅ **Интеграция S3 завершена!** Ваша образовательная платформа теперь:

1. 📁 **Масштабируемо хранит файлы** в AWS S3
2. 🚀 **Быстро обрабатывает документы** для ИИ анализа  
3. 🔒 **Безопасно управляет доступом** к файлам
4. 💰 **Экономично использует ресурсы**
5. 🔄 **Готова к production** развертыванию

**Следующие шаги:**
- Настройте AWS аккаунт и credentials
- Запустите миграцию существующих файлов
- Протестируйте загрузку и скачивание
- Настройте мониторинг и алерты

**Нужна помощь?** Обратитесь к документации AWS или создайте issue в репозитории! 🚀 