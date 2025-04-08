from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from models import QuizBase, QuizQuestion, UserCreate, UserLogin, UserResponse, QuizDB, QuizResponse
from middleware import create_access_token, get_current_user, require_admin
from datetime import timedelta, datetime
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os

app = FastAPI(title="Educational Quiz Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение к MongoDB
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.LearnApp

# Получение коллекций
users_collection = db.users
quizzes_collection = db.quizzes
learning_paths_collection = db.learning_paths
quiz_attempts_collection = db.quiz_attempts

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.get("/")
async def root():
    return {"message": "Welcome to Educational Quiz Platform API"}

@app.post("/api/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Проверяем, существует ли уже пользователь
    existing_user = await users_collection.find_one({"login": user.login})
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    # Хешируем пароль
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    # Сохраняем пользователя
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    return UserResponse(**created_user)

@app.post("/api/login")
async def login(user: UserLogin):
    # Находим пользователя
    db_user = await users_collection.find_one({"login": user.login})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    # Создаем токен
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(db_user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "login": db_user["login"],
            "is_admin": db_user["is_admin"]
        }
    }

@app.get("/api/quizzes")
async def get_quizzes():
    quizzes = []
    async for quiz in quizzes_collection.find():
        quiz["id"] = str(quiz["_id"])
        quizzes.append(QuizDB(**quiz))
    return quizzes

@app.get("/api/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz = await quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Тест не найден")
    quiz["id"] = str(quiz["_id"])
    return QuizDB(**quiz)

# Защищенные маршруты для администраторов
@app.post("/api/quizzes", dependencies=[Depends(require_admin)])
async def create_quiz(quiz: QuizBase):
    result = await quizzes_collection.insert_one(quiz.dict())
    created_quiz = await quizzes_collection.find_one({"_id": result.inserted_id})
    created_quiz["id"] = str(created_quiz["_id"])
    return QuizDB(**created_quiz)

@app.put("/api/quizzes/{quiz_id}", dependencies=[Depends(require_admin)])
async def update_quiz(quiz_id: str, quiz: QuizBase):
    result = await quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": quiz.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Тест не найден")
    return {"message": "Тест успешно обновлен"}

@app.delete("/api/quizzes/{quiz_id}", dependencies=[Depends(require_admin)])
async def delete_quiz(quiz_id: str):
    result = await quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Тест не найден")
    return {"message": "Тест успешно удален"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 