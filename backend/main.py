from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from motor.motor_asyncio import AsyncIOMotorClient
from .models import QuizBase, QuizQuestion, UserCreate, UserLogin, UserResponse, QuizDB, QuizResponse, UserInDB, QuizAttempt, UserRole
from .middleware import create_access_token, get_current_user, require_admin, require_teacher_or_admin
from .redis_cache import cache
from datetime import datetime, timedelta
from passlib.context import CryptContext
from bson import ObjectId
from typing import List
from .routers import quiz_attempts, quizzes, admin, teachers
import os

app = FastAPI(
    title="Educational Quiz Platform",
    description="REST API для платформы образовательных тестов и квизов",
    version="1.0.0",
    docs_url=None,  # Отключаем стандартный /docs endpoint
    redoc_url=None  # Отключаем стандартный /redoc endpoint
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
cors_origins = [origin.strip() for origin in cors_origins]

# Добавляем Vercel домен если он не указан
if "https://edu-platform-five.vercel.app" not in cors_origins:
    cors_origins.append("https://edu-platform-five.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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

# === СОБЫТИЯ ЖИЗНЕННОГО ЦИКЛА ===

@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске приложения"""
    # Проверяем подключение к MongoDB
    try:
        await client.admin.command('ping')
        print("✅ MongoDB подключена успешно")
        print(f"🔗 MongoDB URL: {MONGODB_URL[:50]}...")
    except Exception as e:
        print(f"❌ Ошибка подключения к MongoDB: {e}")
    
    # Подключаем Redis
    await cache.connect()
    print("🚀 Приложение запущено")

@app.on_event("shutdown")
async def shutdown_event():
    """Очистка при остановке приложения"""
    # Отключаем Redis
    await cache.disconnect()
    print("🛑 Приложение остановлено")

# Include routers
app.include_router(quiz_attempts.router, prefix="/api/quiz-attempts", tags=["quiz-attempts"])
app.include_router(quizzes.router, tags=["quizzes"])
app.include_router(admin.router, prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])
app.include_router(teachers.router, prefix="/teachers", tags=["teachers"])

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

@app.get("/api/health",
        summary="Проверка состояния сервисов",
        description="Возвращает статус подключения к базе данных и другим сервисам",
        tags=["статус"])
async def health_check():
    status = {
        "api": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "mongodb": "unknown",
            "redis": "unknown"
        }
    }
    
    # Проверяем MongoDB
    try:
        await client.admin.command('ping')
        status["services"]["mongodb"] = "healthy"
        
        # Проверяем количество пользователей и квизов
        users_count = await db.users.count_documents({})
        quizzes_count = await db.quizzes.count_documents({})
        status["data"] = {
            "users_count": users_count,
            "quizzes_count": quizzes_count
        }
    except Exception as e:
        status["services"]["mongodb"] = f"error: {str(e)}"
    
    # Проверяем Redis
    try:
        if cache.redis_client:
            await cache.redis_client.ping()
            status["services"]["redis"] = "healthy"
        else:
            status["services"]["redis"] = "not_configured"
    except Exception as e:
        status["services"]["redis"] = f"error: {str(e)}"
    
    return status

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
    user_dict["quiz_points"] = 0
    # Сохраняем роль как строку
    user_dict["role"] = user.role.value
    
    # Сохраняем пользователя
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Преобразуем _id в строку для правильной сериализации
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    del created_user["password"]  # Не возвращаем пароль
    
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
    
    # Получаем роль пользователя (для обратной совместимости проверяем старое поле is_admin)
    user_role = db_user.get("role", "student")
    if "is_admin" in db_user and db_user["is_admin"]:
        user_role = "admin"
    
    # Сохраняем сессию в Redis
    user_id = str(db_user["_id"])
    session_data = {
        "id": user_id,
        "name": db_user["name"],
        "login": db_user["login"],
        "role": user_role,
        "quiz_points": db_user.get("quiz_points", 0),
        "last_activity": datetime.now().isoformat()
    }
    await cache.save_session(user_id, session_data)
    
    # Кэшируем профиль пользователя
    await cache.cache_user_profile(user_id, session_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": db_user["name"],
            "login": db_user["login"],
            "role": user_role,
            "is_admin": user_role == "admin"  # Для обратной совместимости
        }
    }

@app.get("/api/check-admin",
        summary="Проверка прав администратора",
        description="Проверяет, имеет ли текущий пользователь права администратора",
        tags=["аутентификация"])
async def check_admin(current_user: UserInDB = Depends(get_current_user)):
    # Проверяем роль пользователя
    user_role = getattr(current_user, 'role', 'student')
    is_admin = user_role == UserRole.admin.value or getattr(current_user, 'is_admin', False)
    
    return {
        "is_admin": is_admin,
        "role": user_role
    }

@app.get("/api/profile",
        summary="Профиль пользователя",
        description="Возвращает информацию о текущем пользователе",
        tags=["аутентификация"])
async def get_profile(current_user: UserInDB = Depends(get_current_user)):
    """
    Возвращает профиль текущего авторизованного пользователя
    """
    user_id = str(current_user.id) if hasattr(current_user, 'id') else str(current_user._id)
    
    # Сначала пробуем получить из кэша
    cached_profile = await cache.get_user_profile(user_id)
    if cached_profile:
        print(f"📦 Профиль пользователя {user_id} получен из кэша")
        return cached_profile
    
    # Если нет в кэше, получаем из БД
    user_role = getattr(current_user, 'role', 'student')
    profile_data = {
        "id": user_id,
        "name": current_user.name,
        "login": current_user.login,
        "role": user_role,
        "quiz_points": getattr(current_user, 'quiz_points', 0),
        "created_at": getattr(current_user, 'created_at', None)
    }
    
    # Кэшируем профиль
    await cache.cache_user_profile(user_id, profile_data)
    print(f"💾 Профиль пользователя {user_id} сохранен в кэш")
    
    return profile_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 