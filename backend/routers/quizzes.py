from fastapi import APIRouter, HTTPException, Depends, Body
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Dict, Optional
from models import QuizBase, QuizResponse
from middleware import require_admin

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

@router.get("/api/quizzes", response_model=List[QuizResponse])
async def get_quizzes():
    try:
        print("Starting to fetch quizzes...")
        quizzes = []
        cursor = db.quizzes.find()
        async for quiz_doc in cursor:
            try:
                print(f"Processing quiz: {quiz_doc}")
                # Преобразуем _id в строку для правильной сериализации
                quiz_doc["id"] = str(quiz_doc["_id"])
                del quiz_doc["_id"]  # Удаляем _id, так как он уже преобразован в id
                quizzes.append(quiz_doc)
                print(f"Successfully processed quiz: {quiz_doc.get('title', 'Unknown')}")
            except Exception as e:
                print(f"Error processing quiz: {quiz_doc.get('title', 'Unknown')}")
                print(f"Quiz document: {quiz_doc}")
                print(f"Error details: {str(e)}")
                continue
        print(f"Total quizzes processed: {len(quizzes)}")
        return quizzes
    except Exception as e:
        print(f"Error fetching quizzes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quizzes: {str(e)}"
        )

@router.get("/api/quizzes/{quiz_id}", response_model=QuizResponse)
async def get_quiz(quiz_id: str):
    try:
        print(f"Attempting to fetch quiz with ID: {quiz_id}")
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            print(f"Quiz not found with ID: {quiz_id}")
            raise HTTPException(status_code=404, detail="Тест не найден")
        print(f"Found quiz: {quiz}")
        # Преобразуем _id в строку для правильной сериализации
        quiz["id"] = str(quiz["_id"])
        del quiz["_id"]  # Удаляем _id, так как он уже преобразован в id
        return quiz
    except Exception as e:
        print(f"Error fetching quiz {quiz_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz: {str(e)}"
        )

# Защищенные маршруты для администраторов
@router.post("/api/quizzes", dependencies=[Depends(require_admin)])
async def create_quiz(
    title: str = Body(...),
    description: str = Body(...),
    category: str = Body(...),
    difficulty: str = Body(...),
    time_limit: int = Body(...),
    questions: List[Dict] = Body(...)
):
    try:
        quiz = {
            "title": title,
            "description": description,
            "category": category,
            "difficulty": difficulty,
            "time_limit": time_limit,
            "questions": questions,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.quizzes.insert_one(quiz)
        quiz["id"] = str(result.inserted_id)
        
        return quiz
    except Exception as e:
        print(f"Error creating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/quizzes/{quiz_id}", dependencies=[Depends(require_admin)])
async def update_quiz(
    quiz_id: str,
    title: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    category: Optional[str] = Body(None),
    difficulty: Optional[str] = Body(None),
    time_limit: Optional[int] = Body(None),
    questions: Optional[List[Dict]] = Body(None)
):
    try:
        # Создаем словарь для обновления, включая только переданные поля
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if category is not None:
            update_data["category"] = category
        if difficulty is not None:
            update_data["difficulty"] = difficulty
        if time_limit is not None:
            update_data["time_limit"] = time_limit
        if questions is not None:
            update_data["questions"] = questions
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.quizzes.update_one(
            {"_id": ObjectId(quiz_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
            if not quiz:
                raise HTTPException(status_code=404, detail="Тест не найден")
            
        return {"message": "Тест успешно обновлен"}
    except Exception as e:
        print(f"Error updating quiz {quiz_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/quizzes/{quiz_id}", dependencies=[Depends(require_admin)])
async def delete_quiz(quiz_id: str):
    try:
        result = await db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Тест не найден")
        return {"message": "Тест успешно удален"}
    except Exception as e:
        print(f"Error deleting quiz {quiz_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 