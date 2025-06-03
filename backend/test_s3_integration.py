#!/usr/bin/env python3
"""
Тестовый скрипт для проверки AWS S3 интеграции

Проверяет:
- Подключение к S3
- Создание bucket (если не существует)
- Загрузку файла
- Скачивание файла
- Удаление файла
- Генерацию presigned URLs

Использование:
    python test_s3_integration.py
"""

import asyncio
import os
import sys
import tempfile
import logging
from io import BytesIO

# Добавляем текущую директорию в path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Загрузка переменных окружения ПЕРЕД импортом s3_service
from dotenv import load_dotenv
load_dotenv()

from s3_service import S3Service

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class S3IntegrationTester:
    def __init__(self):
        self.s3_service = S3Service()
        self.test_results = {
            "connection": False,
            "upload": False,
            "download": False,
            "presigned_url": False,
            "delete": False
        }
        self.test_file_key = None
    
    def print_header(self, title: str):
        """Выводит заголовок теста"""
        print(f"\n{'='*50}")
        print(f"🧪 {title}")
        print('='*50)
    
    def print_result(self, test_name: str, success: bool, message: str = ""):
        """Выводит результат теста"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   ℹ️  {message}")
    
    async def test_connection(self):
        """Тест подключения к S3"""
        self.print_header("Тест подключения к S3")
        
        try:
            # Проверяем переменные окружения
            required_vars = [
                "AWS_ACCESS_KEY_ID",
                "AWS_SECRET_ACCESS_KEY",
                "AWS_S3_BUCKET_NAME"
            ]
            
            missing_vars = []
            for var in required_vars:
                if not os.getenv(var):
                    missing_vars.append(var)
            
            if missing_vars:
                self.print_result(
                    "Переменные окружения",
                    False,
                    f"Отсутствуют: {', '.join(missing_vars)}"
                )
                return False
            
            self.print_result("Переменные окружения", True, "Все настроены")
            
            # Проверяем доступность S3 сервиса
            if self.s3_service.is_available():
                self.print_result("S3 сервис", True, "Подключение установлено")
                
                # Проверяем bucket
                bucket_name = self.s3_service.bucket_name
                try:
                    self.s3_service.s3_client.head_bucket(Bucket=bucket_name)
                    self.print_result("S3 Bucket", True, f"Bucket '{bucket_name}' доступен")
                except Exception as e:
                    if "404" in str(e):
                        self.print_result("S3 Bucket", False, f"Bucket '{bucket_name}' не существует")
                        return False
                    else:
                        self.print_result("S3 Bucket", False, f"Ошибка доступа: {e}")
                        return False
                
                self.test_results["connection"] = True
                return True
            else:
                self.print_result("S3 сервис", False, "Подключение не установлено")
                return False
                
        except Exception as e:
            self.print_result("Подключение", False, f"Ошибка: {e}")
            return False
    
    async def test_upload(self):
        """Тест загрузки файла"""
        self.print_header("Тест загрузки файла")
        
        try:
            # Создаем тестовый файл
            test_content = b"Test document content for S3 integration testing"
            test_filename = "test_document.txt"
            
            # Имитируем UploadFile объект
            class MockUploadFile:
                def __init__(self, content: bytes, filename: str):
                    self.content = content
                    self.filename = filename
                    self.content_type = "text/plain"
                    self.size = len(content)
                    self._position = 0
                
                async def read(self):
                    return self.content
                
                async def seek(self, position: int):
                    self._position = position
            
            mock_file = MockUploadFile(test_content, test_filename)
            test_user_id = "test_user_123"
            
            # Загружаем файл
            result = await self.s3_service.upload_file(mock_file, test_user_id)
            
            self.test_file_key = result["s3_key"]
            
            self.print_result("Загрузка файла", True, f"S3 key: {self.test_file_key}")
            self.test_results["upload"] = True
            return True
            
        except Exception as e:
            self.print_result("Загрузка файла", False, f"Ошибка: {e}")
            return False
    
    async def test_download(self):
        """Тест скачивания файла"""
        self.print_header("Тест скачивания файла")
        
        if not self.test_file_key:
            self.print_result("Скачивание файла", False, "Нет ключа для скачивания")
            return False
        
        try:
            # Скачиваем файл
            content = await self.s3_service.download_file(self.test_file_key)
            
            # Проверяем содержимое
            expected_content = b"Test document content for S3 integration testing"
            if content == expected_content:
                self.print_result("Скачивание файла", True, f"Размер: {len(content)} байт")
                self.test_results["download"] = True
                return True
            else:
                self.print_result("Скачивание файла", False, "Содержимое не совпадает")
                return False
                
        except Exception as e:
            self.print_result("Скачивание файла", False, f"Ошибка: {e}")
            return False
    
    async def test_presigned_url(self):
        """Тест генерации presigned URL"""
        self.print_header("Тест presigned URL")
        
        if not self.test_file_key:
            self.print_result("Presigned URL", False, "Нет ключа для URL")
            return False
        
        try:
            # Генерируем presigned URL
            url = self.s3_service.get_file_url(self.test_file_key, expiration=300)  # 5 минут
            
            if url and url.startswith("https://"):
                self.print_result("Presigned URL", True, "URL сгенерирован")
                print(f"   🔗 URL: {url[:80]}...")
                self.test_results["presigned_url"] = True
                return True
            else:
                self.print_result("Presigned URL", False, "Некорректный URL")
                return False
                
        except Exception as e:
            self.print_result("Presigned URL", False, f"Ошибка: {e}")
            return False
    
    async def test_metadata(self):
        """Тест получения метаданных"""
        self.print_header("Тест метаданных файла")
        
        if not self.test_file_key:
            self.print_result("Метаданные", False, "Нет ключа для проверки")
            return False
        
        try:
            # Получаем метаданные
            metadata = await self.s3_service.get_file_metadata(self.test_file_key)
            
            if metadata:
                self.print_result("Метаданные", True, "Получены успешно")
                print(f"   📄 Content Type: {metadata.get('content_type')}")
                print(f"   📏 Size: {metadata.get('content_length')} байт")
                print(f"   📅 Modified: {metadata.get('last_modified')}")
                return True
            else:
                self.print_result("Метаданные", False, "Не удалось получить")
                return False
                
        except Exception as e:
            self.print_result("Метаданные", False, f"Ошибка: {e}")
            return False
    
    async def test_delete(self):
        """Тест удаления файла"""
        self.print_header("Тест удаления файла")
        
        if not self.test_file_key:
            self.print_result("Удаление файла", False, "Нет ключа для удаления")
            return False
        
        try:
            # Удаляем файл
            success = await self.s3_service.delete_file(self.test_file_key)
            
            if success:
                self.print_result("Удаление файла", True, "Файл удален")
                
                # Проверяем, что файл действительно удален
                try:
                    await self.s3_service.download_file(self.test_file_key)
                    self.print_result("Проверка удаления", False, "Файл все еще существует")
                    return False
                except Exception:
                    self.print_result("Проверка удаления", True, "Файл действительно удален")
                    self.test_results["delete"] = True
                    return True
            else:
                self.print_result("Удаление файла", False, "Не удалось удалить")
                return False
                
        except Exception as e:
            self.print_result("Удаление файла", False, f"Ошибка: {e}")
            return False
    
    async def run_all_tests(self):
        """Запускает все тесты"""
        print("🚀 Тестирование AWS S3 интеграции")
        print("="*50)
        
        # Список тестов
        tests = [
            ("Подключение", self.test_connection),
            ("Загрузка", self.test_upload),
            ("Скачивание", self.test_download),
            ("Presigned URL", self.test_presigned_url),
            ("Метаданные", self.test_metadata),
            ("Удаление", self.test_delete)
        ]
        
        # Выполняем тесты
        for test_name, test_func in tests:
            success = await test_func()
            if not success and test_name in ["Подключение"]:
                print(f"\n❌ Критическая ошибка в тесте '{test_name}'. Остальные тесты пропущены.")
                break
        
        # Выводим сводку
        self.print_summary()
    
    def print_summary(self):
        """Выводит сводку результатов"""
        print(f"\n{'='*50}")
        print("📊 СВОДКА РЕЗУЛЬТАТОВ")
        print('='*50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name.capitalize()}")
        
        print(f"\n📈 Результат: {passed_tests}/{total_tests} тестов пройдено")
        
        if passed_tests == total_tests:
            print("🎉 Все тесты пройдены! S3 интеграция работает корректно.")
        elif passed_tests >= total_tests // 2:
            print("⚠️  Большинство тестов пройдено, но есть проблемы.")
        else:
            print("❌ Много ошибок. Проверьте настройки AWS.")
        
        print("\n📝 Рекомендации:")
        if not self.test_results["connection"]:
            print("   • Проверьте AWS credentials и настройки")
            print("   • Убедитесь, что bucket существует")
            print("   • Проверьте права IAM пользователя")
        elif not self.test_results["upload"]:
            print("   • Проверьте права на запись в S3 bucket")
        elif not self.test_results["download"]:
            print("   • Проверьте права на чтение из S3 bucket")
        elif passed_tests == total_tests:
            print("   • Интеграция готова к использованию!")
            print("   • Можете переходить к миграции данных")

async def main():
    """Основная функция"""
    tester = S3IntegrationTester()
    
    try:
        await tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n⏹️ Тестирование прервано пользователем")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        print(f"\n💥 Критическая ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 