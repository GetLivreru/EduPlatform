from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.learning_path

@router.post("/start/{quiz_id}")
async def start_quiz(quiz_id: str):
    try:
        # Get quiz
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Create quiz attempt
        attempt = {
            "quiz_id": ObjectId(quiz_id),
            "start_time": datetime.utcnow(),
            "status": "in_progress",
            "answers": [],
            "score": None
        }
        
        result = await db.quiz_attempts.insert_one(attempt)
        attempt["_id"] = str(result.inserted_id)
        attempt["quiz_id"] = str(attempt["quiz_id"])
        
        return attempt
    except Exception as e:
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