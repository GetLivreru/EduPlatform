from fastapi import APIRouter, HTTPException, Body, Query, Path, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
from passlib.context import CryptContext
from ..models import UserCreate, UserResponse, User, UserRole

# Load .env from parent directory with encoding fallback
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
try:
    load_dotenv(env_path, encoding='utf-8')
except UnicodeDecodeError:
    try:
        load_dotenv(env_path, encoding='utf-16')
    except Exception:
        # If all encoding attempts fail, continue without .env
        pass
except FileNotFoundError:
    # .env file doesn't exist - continue with defaults
    pass

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

# User management endpoints
@router.get("/users", 
            summary="Получить список пользователей [админ]",
            description="Возвращает список всех пользователей (требуются права администратора)")
async def get_users():
    try:
        print(f"🔍 Admin endpoint: Attempting to fetch users from MongoDB")
        print(f"🔗 MongoDB URL: {MONGODB_URL[:50]}...")  # Log partial URL for debugging
        
        users = []
        cursor = db.users.find({}, {"password": 0})  # Exclude passwords
        async for user in cursor:
            user["id"] = str(user["_id"])
            del user["_id"]
            users.append(user)
        
        print(f"✅ Successfully fetched {len(users)} users")
        return users
    except Exception as e:
        print(f"❌ Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/users",
            response_model=UserResponse,
            summary="Создать нового пользователя [админ]",
            description="Создает нового пользователя с указанными данными (требуются права администратора)")
async def create_user(user: UserCreate):
    try:
        # Проверяем, существует ли пользователь с таким email
        existing_user = await db.users.find_one({"login": user.login})
        if existing_user:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
        
        # Хешируем пароль
        user_dict = user.model_dump()
        user_dict["password"] = pwd_context.hash(user_dict["password"])
        user_dict["created_at"] = datetime.now()
        user_dict["quiz_points"] = 0
        # Убеждаемся, что роль корректно сохраняется как строка
        user_dict["role"] = user.role.value
        
        # Сохраняем пользователя
        result = await db.users.insert_one(user_dict)
        created_user = await db.users.find_one({"_id": result.inserted_id})
        
        # Преобразуем _id в строку для ответа
        created_user["id"] = str(created_user["_id"])
        del created_user["_id"]
        del created_user["password"]
        
        return UserResponse(**created_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}",
           response_model=UserResponse,
           summary="Обновить данные пользователя [админ]",
           description="Обновляет данные существующего пользователя (требуются права администратора)")
async def update_user(
    user_id: str,
    user_update: dict = Body(...)
):
    try:
        # Проверяем существование пользователя
        existing_user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Если обновляется email, проверяем его уникальность
        if "login" in user_update and user_update["login"] != existing_user["login"]:
            email_exists = await db.users.find_one({
                "login": user_update["login"],
                "_id": {"$ne": ObjectId(user_id)}
            })
            if email_exists:
                raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
        
        # Если обновляется пароль, хешируем его
        if "password" in user_update:
            user_update["password"] = pwd_context.hash(user_update["password"])
        
        # Проверяем и валидируем роль, если она обновляется
        if "role" in user_update:
            try:
                # Проверяем, что роль валидна
                UserRole(user_update["role"])
            except ValueError:
                raise HTTPException(status_code=400, detail="Недопустимая роль пользователя")
        
        # Сохраняем существующие поля, которые не должны быть изменены
        if "quiz_points" not in user_update:
            user_update["quiz_points"] = existing_user.get("quiz_points", 0)
        if "created_at" not in user_update:
            user_update["created_at"] = existing_user.get("created_at", datetime.now())
        if "role" not in user_update:
            user_update["role"] = existing_user.get("role", "student")
        
        # Обновляем пользователя
        update_result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user_update}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Получаем обновленного пользователя
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        updated_user["id"] = str(updated_user["_id"])
        del updated_user["_id"]
        del updated_user["password"]
        
        return UserResponse(**updated_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}",
              summary="Удалить пользователя [админ]",
              description="Удаляет пользователя из системы (требуются права администратора)")
async def delete_user(user_id: str):
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        return {"message": "Пользователь успешно удален"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Quiz management endpoints
@router.post("/quizzes", 
            summary="Создать новый тест",
            description="Создает новый тест с указанными параметрами",
            response_description="Созданный тест с ID")
async def create_quiz(
    title: str = Body(..., description="Название теста"),
    description: str = Body(..., description="Описание теста"),
    category: str = Body(..., description="Категория теста (например, 'Математика', 'Программирование')"),
    difficulty: str = Body(..., description="Сложность теста ('Easy', 'Medium', 'Hard')"),
    time_limit: int = Body(..., description="Ограничение времени на тест в минутах"),
    questions: List[dict] = Body(..., description="Список вопросов с вариантами ответов")
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

@router.put("/quizzes/{quiz_id}",
           summary="Обновить тест",
           description="Обновляет существующий тест по ID",
           response_description="Обновленный тест")
async def update_quiz(
    quiz_id: str = Path(..., description="ID теста для обновления"),
    title: Optional[str] = Body(None, description="Новое название теста"),
    description: Optional[str] = Body(None, description="Новое описание теста"),
    category: Optional[str] = Body(None, description="Новая категория теста"),
    difficulty: Optional[str] = Body(None, description="Новая сложность теста"),
    time_limit: Optional[int] = Body(None, description="Новое ограничение времени в минутах"),
    questions: Optional[List[dict]] = Body(None, description="Новый список вопросов")
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

@router.delete("/quizzes/{quiz_id}",
              summary="Удалить тест",
              description="Удаляет тест по ID",
              response_description="Статус операции")
async def delete_quiz(quiz_id: str = Path(..., description="ID теста для удаления")):
    try:
        result = await db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Quiz not found")
            
        return {"status": "success", "message": "Quiz deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quizzes/stats",
           summary="Статистика тестов",
           description="Возвращает общую статистику по тестам",
           response_description="Статистика по категориям и сложности")
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

@router.get("/quizzes",
           summary="Список тестов",
           description="Возвращает список всех тестов",
           response_description="Массив тестов")
async def get_quizzes():
    try:
        print(f"🔍 Admin endpoint: Attempting to fetch quizzes from MongoDB")
        quizzes = await db.quizzes.find().to_list(None)
        # Convert ObjectId to string for JSON serialization 
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        
        print(f"✅ Successfully fetched {len(quizzes)} quizzes")
        return quizzes
    except Exception as e:
        print(f"❌ Error fetching quizzes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/quizzes/{quiz_id}",
           summary="Получить тест",
           description="Возвращает тест по ID",
           response_description="Детальная информация о тесте")
async def get_quiz(quiz_id: str = Path(..., description="ID теста для получения")):
    try:
        print(f"Admin endpoint: Attempting to fetch quiz with ID: {quiz_id}")
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
            
        # Convert ObjectId to string for JSON serialization
        quiz["_id"] = str(quiz["_id"])
        
        return quiz
    except Exception as e:
        print(f"Error fetching quiz {quiz_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roles",
           summary="Получить список доступных ролей",
           description="Возвращает список всех доступных ролей пользователей",
           response_description="Список ролей с их описаниями")
async def get_available_roles():
    """
    Возвращает список всех доступных ролей пользователей
    """
    try:
        roles = [
            {
                "value": UserRole.student.value,
                "label": "Студент",
                "description": "Обычный пользователь, может проходить тесты и просматривать материалы"
            },
            {
                "value": UserRole.teacher.value,
                "label": "Преподаватель", 
                "description": "Может создавать и редактировать тесты, просматривать результаты студентов"
            },
            {
                "value": UserRole.admin.value,
                "label": "Администратор",
                "description": "Полные права доступа: управление пользователями, тестами и системой"
            }
        ]
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/by-role/{role}",
           summary="Получить пользователей по роли",
           description="Возвращает список пользователей с определенной ролью",
           response_description="Список пользователей указанной роли")
async def get_users_by_role(role: str = Path(..., description="Роль пользователей для поиска")):
    """
    Возвращает список пользователей с указанной ролью
    """
    try:
        # Проверяем, что роль валидна
        try:
            UserRole(role)
        except ValueError:
            raise HTTPException(status_code=400, detail="Недопустимая роль пользователя")
        
        users = []
        cursor = db.users.find({"role": role}, {"password": 0})  # Exclude passwords
        async for user in cursor:
            user["id"] = str(user["_id"])
            del user["_id"]
            users.append(user)
        
        return {
            "role": role,
            "count": len(users),
            "users": users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 