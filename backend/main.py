from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from motor.motor_asyncio import AsyncIOMotorClient
from models import QuizBase, QuizQuestion, UserCreate, UserLogin, UserResponse, QuizDB, QuizResponse, UserInDB, QuizAttempt
from middleware import create_access_token, get_current_user, require_admin
from datetime import datetime, timedelta
from passlib.context import CryptContext
from bson import ObjectId
from typing import List
from routers import quiz_attempts, quizzes, admin
import os

app = FastAPI(
    title="Educational Quiz Platform",
    description="REST API для платформы образовательных тестов и квизов",
    version="1.0.0",
    docs_url=None,  # Отключаем стандартный /docs endpoint
    redoc_url=None  # Отключаем стандартный /redoc endpoint
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

# Collections
quizzes_collection = db.quizzes
users_collection = db.users
learning_paths_collection = db.learning_paths
quiz_attempts_collection = db.quiz_attempts

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Include routers
app.include_router(quiz_attempts.router, prefix="/api/quiz-attempts", tags=["quiz-attempts"])
app.include_router(quizzes.router, tags=["quizzes"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Кастомные эндпоинты для документации
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Quiz Platform API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_favicon_url="/favicon.ico"
    )

@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="Quiz Platform API Documentation - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"
    )

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    openapi_schema = get_openapi(
        title="Educational Quiz Platform API",
        version="1.0.0",
        description="REST API для платформы образовательных тестов и квизов.",
        routes=app.routes,
    )
    return openapi_schema

@app.get("/",
        summary="Проверка работоспособности API",
        description="Возвращает приветственное сообщение для проверки доступности API",
        tags=["статус"])
async def root():
    return {"message": "Welcome to Educational Quiz Platform API"}

@app.post("/api/register", 
         response_model=UserResponse,
         summary="Регистрация пользователя",
         description="Регистрирует нового пользователя в системе",
         tags=["аутентификация"])
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

@app.post("/api/login",
         summary="Вход в систему",
         description="Авторизует пользователя и возвращает токен доступа",
         tags=["аутентификация"])
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 