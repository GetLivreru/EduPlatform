from fastapi import APIRouter, HTTPException, Body, Path, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
from pydantic import BaseModel, Field
from middleware import get_current_user
from models import UserInDB

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

class QuizAttemptCreate(BaseModel):
    quiz_id: str = Field(..., description="ID теста для начала попытки")
    
    class Config:
        schema_extra = {
            "example": {
                "quiz_id": "60c72b2f9b1d7c2d1c8b4567"
            }
        }

class AnswerSubmit(BaseModel):
    question_index: int = Field(..., description="Индекс вопроса (начиная с 0)")
    answer: int = Field(..., description="Индекс выбранного варианта ответа (начиная с 0)")
    
    class Config:
        schema_extra = {
            "example": {
                "question_index": 0,
                "answer": 2
            }
        }

@router.post("/",
            summary="Создать попытку теста",
            description="Создает новую попытку прохождения теста (требуется аутентификация)",
            response_description="Информация о созданной попытке")
async def create_quiz_attempt(
    attempt_data: QuizAttemptCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        quiz_id = attempt_data.quiz_id
        print(f"Creating quiz attempt for quiz_id: {quiz_id} by user {current_user.id}")
        
        # Проверяем существование теста
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            print(f"Quiz not found with ID: {quiz_id}")
            raise HTTPException(status_code=404, detail="Тест не найден")

        # Создаем новую попытку
        attempt = {
            "quiz_id": ObjectId(quiz_id),
            "user_id": ObjectId(current_user.id),
            "start_time": datetime.utcnow(),
            "status": "in_progress",
            "answers": [],
            "score": None
        }
        
        result = await db.quiz_attempts.insert_one(attempt)
        attempt["_id"] = str(result.inserted_id)
        attempt["quiz_id"] = str(attempt["quiz_id"])
        attempt["user_id"] = str(attempt["user_id"])
        
        print(f"Created quiz attempt: {attempt}")
        return attempt
    except Exception as e:
        print(f"Error creating quiz attempt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/answer",
            summary="Отправить ответ на вопрос",
            description="Отправляет ответ на вопрос в рамках текущей попытки (требуется аутентификация)",
            response_description="Статус отправки ответа")
async def submit_answer(
    attempt_id: str = Path(..., description="ID попытки теста"),
    answer: AnswerSubmit = Body(..., description="Данные ответа на вопрос"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Add answer to attempt
        answer_data = answer.dict()
        answer_data["submitted_at"] = datetime.utcnow()
        await db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {"$push": {"answers": answer_data}}
        )

        return {"status": "success", "message": "Answer submitted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/finish",
            summary="Завершить попытку",
            description="Завершает попытку и рассчитывает итоговый результат (требуется аутентификация)",
            response_description="Результаты теста")
async def finish_quiz(
    attempt_id: str = Path(..., description="ID попытки теста"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Calculate score
        correct_answers = 0
        total_questions = len(quiz["questions"])
        
        for answer in attempt["answers"]:
            question_idx = answer.get("question_index")
            if 0 <= question_idx < total_questions:
                if answer["answer"] == quiz["questions"][question_idx]["correct_answer"]:
                    correct_answers += 1

        score = 0 if total_questions == 0 else (correct_answers / total_questions) * 100

        # Update attempt
        await db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {
                "$set": {
                    "status": "completed",
                    "end_time": datetime.utcnow(),
                    "score": score
                }
            }
        )

        return {
            "status": "completed",
            "score": score,
            "correct_answers": correct_answers,
            "total_questions": total_questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{attempt_id}",
           summary="Получить попытку",
           description="Возвращает информацию о попытке прохождения теста (требуется аутентификация)",
           response_description="Детальная информация о попытке")
async def get_attempt(
    attempt_id: str = Path(..., description="ID попытки теста"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Convert ObjectId to string
        attempt["_id"] = str(attempt["_id"])
        attempt["quiz_id"] = str(attempt["quiz_id"])
        attempt["user_id"] = str(attempt["user_id"])
        
        return attempt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 