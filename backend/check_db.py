from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db():
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.learning_path

    # Проверяем коллекцию quizzes
    quizzes = await db.quizzes.find().to_list(length=100)
    print("\nQuizzes in database:")
    for quiz in quizzes:
        print(f"\nQuiz ID: {quiz['_id']}")
        print(f"Title: {quiz.get('title', 'N/A')}")
        print(f"Category: {quiz.get('category', 'N/A')}")
        print(f"Questions count: {len(quiz.get('questions', []))}")

if __name__ == "__main__":
    asyncio.run(check_db()) 