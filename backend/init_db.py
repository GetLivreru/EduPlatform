from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.learning_path

    # Тестовые квизы
    test_quizzes = [
        {
            "title": "Базовая математика",
            "description": "Тест на базовые математические знания",
            "category": "math",
            "questions": [
                {
                    "text": "Сколько будет 2 + 2?",
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": 1
                },
                {
                    "text": "Чему равно 5 * 5?",
                    "options": ["20", "25", "30", "35"],
                    "correct_answer": 1
                },
                {
                    "text": "Решите уравнение: x + 3 = 7",
                    "options": ["2", "3", "4", "5"],
                    "correct_answer": 2
                }
            ],
            "difficulty": "beginner",
            "time_limit": 10
        },
        {
            "title": "Продвинутая математика",
            "description": "Тест на продвинутые математические знания",
            "category": "math",
            "questions": [
                {
                    "text": "Найдите производную функции f(x) = x^2",
                    "options": ["2x", "x", "2", "x^2"],
                    "correct_answer": 0
                },
                {
                    "text": "Решите уравнение: 2x + 5 = 15",
                    "options": ["5", "6", "7", "8"],
                    "correct_answer": 0
                }
            ],
            "difficulty": "intermediate",
            "time_limit": 15
        },
        {
            "title": "Introduction to C++",
            "description": "Тест на базовые знания C++",
            "category": "programming",
            "questions": [
                {
                    "text": "Какой оператор используется для вывода в консоль в C++?",
                    "options": ["print()", "cout <<", "System.out.println()", "printf()"],
                    "correct_answer": 1
                },
                {
                    "text": "Как объявить целочисленную переменную в C++?",
                    "options": ["int x;", "var x;", "integer x;", "number x;"],
                    "correct_answer": 0
                },
                {
                    "text": "Какой оператор используется для ввода с клавиатуры в C++?",
                    "options": ["cin >>", "input()", "scanf()", "read()"],
                    "correct_answer": 0
                },
                {
                    "text": "Как объявить массив из 5 целых чисел в C++?",
                    "options": ["int arr[5];", "array arr[5];", "int[] arr = new int[5];", "vector<int> arr(5);"],
                    "correct_answer": 0
                },
                {
                    "text": "Какой оператор используется для условного выполнения кода в C++?",
                    "options": ["if", "when", "case", "select"],
                    "correct_answer": 0
                },
                {
                    "text": "Как объявить функцию в C++?",
                    "options": ["function name() {}", "def name():", "void name() {}", "method name() {}"],
                    "correct_answer": 2
                },
                {
                    "text": "Какой оператор используется для цикла в C++?",
                    "options": ["for", "loop", "while", "repeat"],
                    "correct_answer": 0
                },
                {
                    "text": "Как объявить указатель в C++?",
                    "options": ["int* ptr;", "pointer ptr;", "ref ptr;", "&ptr;"],
                    "correct_answer": 0
                },
                {
                    "text": "Как создать объект класса в C++?",
                    "options": ["ClassName obj;", "new ClassName();", "ClassName obj = new ClassName();", "create ClassName obj;"],
                    "correct_answer": 0
                },
                {
                    "text": "Какой оператор используется для динамического выделения памяти в C++?",
                    "options": ["new", "malloc", "alloc", "create"],
                    "correct_answer": 0
                }
            ],
            "difficulty": "beginner",
            "time_limit": 35
        },
        {
            "title": "Introduction to ICT",
            "description": "Тест на базовые знания информационных технологий",
            "category": "ict",
            "questions": [
                {
                    "text": "Что означает аббревиатура ICT?",
                    "options": ["Information and Communication Technology", "International Computer Technology", "Internet Communication Tools", "Integrated Computer Technology"],
                    "correct_answer": 0
                },
                {
                    "text": "Какое устройство является основным компонентом компьютера?",
                    "options": ["Процессор", "Монитор", "Клавиатура", "Мышь"],
                    "correct_answer": 0
                },
                {
                    "text": "Что такое операционная система?",
                    "options": ["Программа для работы с файлами", "Система управления компьютером", "Антивирусная программа", "Текстовый редактор"],
                    "correct_answer": 1
                },
                {
                    "text": "Какой протокол используется для передачи веб-страниц?",
                    "options": ["FTP", "HTTP", "SMTP", "TCP"],
                    "correct_answer": 1
                },
                {
                    "text": "Что такое IP-адрес?",
                    "options": ["Уникальный идентификатор компьютера в сети", "Пароль для входа в систему", "Название программы", "Тип файла"],
                    "correct_answer": 0
                },
                {
                    "text": "Что такое база данных?",
                    "options": ["Программа для создания документов", "Структурированный набор данных", "Графический редактор", "Веб-браузер"],
                    "correct_answer": 1
                },
                {
                    "text": "Что такое облачные вычисления?",
                    "options": ["Хранение данных на локальном компьютере", "Использование удаленных серверов для хранения и обработки данных", "Тип антивирусной программы", "Метод шифрования данных"],
                    "correct_answer": 1
                },
                {
                    "text": "Что такое кибербезопасность?",
                    "options": ["Создание веб-сайтов", "Защита компьютерных систем от атак", "Программирование игр", "Разработка мобильных приложений"],
                    "correct_answer": 1
                },
                {
                    "text": "Что такое искусственный интеллект?",
                    "options": ["Тип компьютерного вируса", "Способность машин имитировать человеческий интеллект", "Метод шифрования данных", "Тип базы данных"],
                    "correct_answer": 1
                },
                {
                    "text": "Что такое Big Data?",
                    "options": ["Маленькие файлы", "Большие объемы структурированных и неструктурированных данных", "Тип компьютерной игры", "Метод программирования"],
                    "correct_answer": 1
                }
            ],
            "difficulty": "beginner",
            "time_limit": 35
        }
    ]

    # Тестовые пути обучения
    test_learning_paths = [
        {
            "subject": "math",
            "level": "beginner",
            "content": [
                {
                    "day": 1,
                    "topics": ["Основы арифметики", "Сложение и вычитание"],
                    "exercises": ["Решите 5 примеров на сложение", "Решите 5 примеров на вычитание"]
                },
                {
                    "day": 2,
                    "topics": ["Умножение и деление"],
                    "exercises": ["Решите 5 примеров на умножение", "Решите 5 примеров на деление"]
                }
            ],
            "duration_days": 7
        }
    ]

    try:
        # Очищаем существующие коллекции
        await db.quizzes.delete_many({})
        await db.learning_paths.delete_many({})

        # Добавляем тестовые данные
        if test_quizzes:
            result = await db.quizzes.insert_many(test_quizzes)
            print(f"Добавлено {len(result.inserted_ids)} квизов")
        
        if test_learning_paths:
            result = await db.learning_paths.insert_many(test_learning_paths)
            print(f"Добавлено {len(result.inserted_ids)} путей обучения")

        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_db()) 