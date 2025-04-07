from fastapi import APIRouter, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.learning_path

@router.post("/quizzes")
async def create_quiz(
    title: str = Body(...),
    description: str = Body(...),
    category: str = Body(...),
    difficulty: str = Body(...),
    time_limit: int = Body(...),
    questions: List[dict] = Body(...)
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
        quiz["_id"] = str(result.inserted_id)
        
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/quizzes/{quiz_id}")
async def update_quiz(
    quiz_id: str,
    title: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    category: Optional[str] = Body(None),
    difficulty: Optional[str] = Body(None),
    time_limit: Optional[int] = Body(None),
    questions: Optional[List[dict]] = Body(None)
):
    try:
        update_data = {
            "updated_at": datetime.utcnow()
        }
        
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

        result = await db.quizzes.update_one(
            {"_id": ObjectId(quiz_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Quiz not found")

        updated_quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        updated_quiz["_id"] = str(updated_quiz["_id"])
        
        return updated_quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str):
    try:
        result = await db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Quiz not found")
            
        return {"status": "success", "message": "Quiz deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quizzes/stats")
async def get_quiz_stats():
    try:
        total_quizzes = await db.quizzes.count_documents({})
        quizzes_by_category = await db.quizzes.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]).to_list(None)
        quizzes_by_difficulty = await db.quizzes.aggregate([
            {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        return {
            "total_quizzes": total_quizzes,
            "by_category": quizzes_by_category,
            "by_difficulty": quizzes_by_difficulty
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 