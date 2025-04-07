from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.learning_path

@router.get("/")
async def get_quizzes():
    try:
        quizzes = await db.quizzes.find().to_list(length=None)
        # Convert ObjectId to string for JSON serialization
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        return quizzes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str):
    try:
        # Convert string ID to ObjectId
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if quiz is None:
            raise HTTPException(status_code=404, detail="Quiz not found")
        quiz["_id"] = str(quiz["_id"])
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 