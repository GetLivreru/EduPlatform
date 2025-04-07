from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from models import QuizDB, QuizResponse, LearningPathDB, LearningPathResponse
from typing import List
import logging
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Learning Path API", description="API for personalized learning paths and quizzes")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.learning_path

@app.get("/")
async def root():
    return {"message": "Welcome to Learning Path API"}

@app.post("/quizzes/", response_model=QuizResponse)
async def create_quiz(quiz: QuizDB):
    try:
        quiz_dict = quiz.model_dump(by_alias=True, exclude={"id"})
        result = await db.quizzes.insert_one(quiz_dict)
        created_quiz = await db.quizzes.find_one({"_id": result.inserted_id})
        return QuizResponse(**{**created_quiz, "id": str(created_quiz["_id"])})
    except Exception as e:
        logger.error(f"Error creating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quizzes/{category}", response_model=List[QuizResponse])
async def get_quizzes(category: str):
    try:
        logger.info(f"Fetching quizzes for category: {category}")
        quizzes = await db.quizzes.find({"category": category}).to_list(length=100)
        logger.info(f"Found {len(quizzes)} quizzes")
        return [QuizResponse(**{**quiz, "id": str(quiz["_id"])}) for quiz in quizzes]
    except Exception as e:
        logger.error(f"Error fetching quizzes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quizzes/", response_model=List[QuizResponse])
async def get_all_quizzes():
    try:
        logger.info("Fetching all quizzes")
        quizzes = await db.quizzes.find().to_list(length=100)
        logger.info(f"Found {len(quizzes)} quizzes")
        return [QuizResponse(**{**quiz, "id": str(quiz["_id"])}) for quiz in quizzes]
    except Exception as e:
        logger.error(f"Error fetching all quizzes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learning-paths/", response_model=LearningPathResponse)
async def create_learning_path(path: LearningPathDB):
    try:
        path_dict = path.model_dump(by_alias=True, exclude={"id"})
        result = await db.learning_paths.insert_one(path_dict)
        created_path = await db.learning_paths.find_one({"_id": result.inserted_id})
        return LearningPathResponse(**{**created_path, "id": str(created_path["_id"])})
    except Exception as e:
        logger.error(f"Error creating learning path: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/learning-paths/{subject}/{level}", response_model=LearningPathResponse)
async def get_learning_path(subject: str, level: str):
    try:
        path = await db.learning_paths.find_one({"subject": subject, "level": level})
        if not path:
            raise HTTPException(status_code=404, detail="Learning path not found")
        return LearningPathResponse(**{**path, "id": str(path["_id"])})
    except Exception as e:
        logger.error(f"Error fetching learning path: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
