import os
import uuid
from typing import Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, UploadFile
import logging
from datetime import datetime

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class S3Service:
    """Сервис для работы с AWS S3"""
    
    def __init__(self):
        # AWS настройки из переменных окружения
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        self.bucket_name = os.getenv("AWS_S3_BUCKET_NAME", "eduplatfrom")
        
        # Проверяем настройки
        if not self.aws_access_key_id or not self.aws_secret_access_key:
            logger.error("❌ AWS credentials не настроены")
            self.s3_client = None
            return
        
        try:
            # Инициализируем S3 клиент
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            
            # Проверяем соединение
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"✅ S3 клиент инициализирован, bucket: {self.bucket_name}")
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                logger.warning(f"⚠️ Bucket {self.bucket_name} не существует, пытаемся создать...")
                self._create_bucket()
            else:
                logger.error(f"❌ Ошибка подключения к S3: {e}")
                self.s3_client = None
        except NoCredentialsError:
            logger.error("❌ AWS credentials не найдены")
            self.s3_client = None
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка при инициализации S3: {e}")
            self.s3_client = None
    
    def _create_bucket(self):
        """Создает bucket если он не существует"""
        try:
            if self.aws_region == 'us-east-1':
                # Для us-east-1 не нужно указывать LocationConstraint
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                self.s3_client.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.aws_region}
                )
            logger.info(f"✅ Bucket {self.bucket_name} создан")
        except Exception as e:
            logger.error(f"❌ Ошибка создания bucket: {e}")
            self.s3_client = None
    
    def is_available(self) -> bool:
        """Проверяет доступность S3 сервиса"""
        return self.s3_client is not None
    
    async def upload_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """
        Загружает файл в S3 и возвращает метаданные
        
        Args:
            file: Загружаемый файл
            user_id: ID пользователя
            
        Returns:
            Dict с метаданными файла
        """
        if not self.is_available():
            raise HTTPException(
                status_code=500,
                detail="S3 сервис недоступен. Проверьте AWS настройки."
            )
        
        try:
            # Генерируем уникальное имя файла
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Читаем содержимое файла
            file_content = await file.read()
            
            # Метаданные для S3
            metadata = {
                'original-filename': file.filename,
                'uploaded-by': user_id,
                'upload-date': datetime.utcnow().isoformat(),
                'content-type': file.content_type,
                'file-size': str(len(file_content))
            }
            
            # Загружаем в S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=unique_filename,
                Body=file_content,
                ContentType=file.content_type,
                Metadata=metadata
            )
            
            logger.info(f"✅ Файл {file.filename} загружен в S3 как {unique_filename}")
            
            # Возвращаем метаданные для сохранения в MongoDB
            return {
                "s3_key": unique_filename,
                "original_filename": file.filename,
                "content_type": file.content_type,
                "file_size": len(file_content),
                "s3_bucket": self.bucket_name,
                "s3_region": self.aws_region,
                "uploaded_by": user_id,
                "uploaded_at": datetime.utcnow()
            }
            
        except ClientError as e:
            logger.error(f"❌ Ошибка загрузки в S3: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка загрузки файла в S3: {str(e)}"
            )
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка при загрузке: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка при загрузке файла: {str(e)}"
            )
    
    async def download_file(self, s3_key: str) -> bytes:
        """
        Скачивает файл из S3
        
        Args:
            s3_key: Ключ файла в S3
            
        Returns:
            Содержимое файла в байтах
        """
        if not self.is_available():
            raise HTTPException(
                status_code=500,
                detail="S3 сервис недоступен"
            )
        
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return response['Body'].read()
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                logger.error(f"❌ Файл {s3_key} не найден в S3")
                raise HTTPException(
                    status_code=404,
                    detail="Файл не найден"
                )
            else:
                logger.error(f"❌ Ошибка скачивания из S3: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка скачивания файла: {str(e)}"
                )
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка при скачивании: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка при скачивании файла: {str(e)}"
            )
    
    async def delete_file(self, s3_key: str) -> bool:
        """
        Удаляет файл из S3
        
        Args:
            s3_key: Ключ файла в S3
            
        Returns:
            True если успешно удален
        """
        if not self.is_available():
            logger.warning("S3 сервис недоступен для удаления файла")
            return False
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"✅ Файл {s3_key} удален из S3")
            return True
            
        except ClientError as e:
            logger.error(f"❌ Ошибка удаления файла из S3: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка при удалении: {e}")
            return False
    
    def get_file_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Генерирует временную ссылку для скачивания файла
        
        Args:
            s3_key: Ключ файла в S3
            expiration: Время жизни ссылки в секундах (по умолчанию 1 час)
            
        Returns:
            Временная ссылка или None если ошибка
        """
        if not self.is_available():
            return None
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            logger.error(f"❌ Ошибка генерации presigned URL: {e}")
            return None
    
    async def get_file_metadata(self, s3_key: str) -> Optional[Dict[str, Any]]:
        """
        Получает метаданные файла из S3
        
        Args:
            s3_key: Ключ файла в S3
            
        Returns:
            Метаданные файла или None если ошибка
        """
        if not self.is_available():
            return None
        
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            
            return {
                'content_type': response.get('ContentType'),
                'content_length': response.get('ContentLength'),
                'last_modified': response.get('LastModified'),
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                logger.warning(f"⚠️ Файл {s3_key} не найден в S3")
                return None
            else:
                logger.error(f"❌ Ошибка получения метаданных: {e}")
                return None
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка при получении метаданных: {e}")
            return None

# Глобальный экземпляр сервиса
s3_service = S3Service() 