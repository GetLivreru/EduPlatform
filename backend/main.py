from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from models import QuizBase, QuizQuestion, UserCreate, UserLogin, UserResponse, QuizDB, QuizResponse, UserInDB, QuizAttempt
from middleware import create_access_token, get_current_user, require_admin
from datetime import datetime, timedelta
from passlib.context import CryptContext
from bson import ObjectId
from typing import List
from routers import quiz_attempts

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

# Include quiz attempts router
app.include_router(quiz_attempts.router, prefix="/api/quiz-attempts", tags=["quiz-attempts"])

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
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.now()
    
    # Сохраняем пользователя
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Преобразуем _id в строку для правильной сериализации
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    
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

@app.get("/api/quizzes", response_model=List[QuizResponse])
async def get_quizzes():
    try:
        print("Starting to fetch quizzes...")
        quizzes = []
        cursor = quizzes_collection.find()
        async for quiz_doc in cursor:
            try:
                print(f"Processing quiz: {quiz_doc}")
                # Преобразуем _id в строку для правильной сериализации
                quiz_doc["id"] = str(quiz_doc["_id"])
                del quiz_doc["_id"]  # Удаляем _id, так как он уже преобразован в id
                quiz = QuizResponse(**quiz_doc)
                quizzes.append(quiz)
                print(f"Successfully processed quiz: {quiz.title}")
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

@app.get("/api/quizzes/{quiz_id}", response_model=QuizResponse)
async def get_quiz(quiz_id: str):
    try:
        print(f"Attempting to fetch quiz with ID: {quiz_id}")
        quiz = await quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            print(f"Quiz not found with ID: {quiz_id}")
            raise HTTPException(status_code=404, detail="Тест не найден")
        print(f"Found quiz: {quiz}")
        # Преобразуем _id в строку для правильной сериализации
        quiz["id"] = str(quiz["_id"])
        del quiz["_id"]  # Удаляем _id, так как он уже преобразован в id
        return QuizResponse(**quiz)
    except Exception as e:
        print(f"Error fetching quiz {quiz_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz: {str(e)}"
        )

# Защищенные маршруты для администраторов
@app.post("/api/quizzes", response_model=QuizResponse, dependencies=[Depends(require_admin)])
async def create_quiz(quiz: QuizBase):
    result = await quizzes_collection.insert_one(quiz.dict())
    created_quiz = await quizzes_collection.find_one({"_id": result.inserted_id})
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