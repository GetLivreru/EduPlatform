from fastapi import APIRouter, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict
import os
from dotenv import load_dotenv
from datetime import datetime
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.learning_path

class QuizAttemptCreate(BaseModel):
    quiz_id: str

@router.post("/")
async def create_quiz_attempt(attempt_data: QuizAttemptCreate):
    try:
        print(f"Creating quiz attempt for quiz_id: {attempt_data.quiz_id}")
        
        # Проверяем существование теста
        quiz = await db.quizzes.find_one({"_id": ObjectId(attempt_data.quiz_id)})
        if not quiz:
            print(f"Quiz not found with ID: {attempt_data.quiz_id}")
            raise HTTPException(status_code=404, detail="Тест не найден")

        # Создаем новую попытку
        attempt = {
            "quiz_id": ObjectId(attempt_data.quiz_id),
            "start_time": datetime.utcnow(),
            "status": "in_progress",
            "answers": [],
            "score": None
        }
        
        result = await db.quiz_attempts.insert_one(attempt)
        attempt["_id"] = str(result.inserted_id)
        attempt["quiz_id"] = str(attempt["quiz_id"])
        
        print(f"Created quiz attempt: {attempt}")
        return attempt
    except Exception as e:
        print(f"Error creating quiz attempt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/answer")
async def submit_answer(attempt_id: str, answer: Dict):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Add answer to attempt
        answer["submitted_at"] = datetime.utcnow()
        await db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {"$push": {"answers": answer}}
        )

        return {"status": "success", "message": "Answer submitted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/finish")
async def finish_quiz(attempt_id: str):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Calculate score
        correct_answers = 0
        for answer in attempt["answers"]:
            question = next((q for q in quiz["questions"] if q["_id"] == answer["question_id"]), None)
            if question and answer["selected_option"] == question["correct_answer"]:
                correct_answers += 1

        score = (correct_answers / len(quiz["questions"])) * 100

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
            "total_questions": len(quiz["questions"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{attempt_id}")
async def get_attempt(attempt_id: str):
    try:
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")

        # Convert ObjectId to string
        attempt["_id"] = str(attempt["_id"])
        attempt["quiz_id"] = str(attempt["quiz_id"])
        
        return attempt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 