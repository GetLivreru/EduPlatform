from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from datetime import datetime, timedelta
from models import UserInDB, UserRole
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load .env from the same directory as this file with encoding fallback
env_path = os.path.join(os.path.dirname(__file__), '.env')
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

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # Берем из переменной окружения
ALGORITHM = "HS256" 
ACCESS_TOKEN_EXPIRE_MINUTES = 30

print(f"🔑 SECRET_KEY loaded: {'***' + SECRET_KEY[-4:] if len(SECRET_KEY) > 4 else 'NOT_SET'}")

security = HTTPBearer()

# MongoDB connection - используем централизованное подключение
from database import get_database

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request) -> UserInDB:
    try:
        credentials: HTTPAuthorizationCredentials = await security(request)
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Неверный токен")
    except Exception:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    # Получаем пользователя из базы данных
    db = await get_database()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    
    # Создаем объект UserInDB из документа
    user_doc["id"] = str(user_doc["_id"])
    
    # Обеспечиваем обратную совместимость для is_admin
    user_role = user_doc.get("role", "student")
    if "is_admin" in user_doc and user_doc["is_admin"]:
        user_role = "admin"
        user_doc["role"] = "admin"
    
    user_doc["is_admin"] = user_role == "admin"
    
    return UserInDB(**user_doc)

async def require_admin(request: Request):
    user = await get_current_user(request)
    user_role = getattr(user, 'role', 'student')
    is_admin = user_role == UserRole.admin.value or getattr(user, 'is_admin', False)
    
    if not is_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора")
    return user

async def require_teacher_or_admin(request: Request):
    """
    Требует роль преподавателя или администратора
    """
    user = await get_current_user(request)
    user_role = getattr(user, 'role', 'student')
    
    if user_role not in [UserRole.teacher.value, UserRole.admin.value]:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права преподавателя или администратора")
    return user

async def require_role(required_role: UserRole):
    """
    Создает функцию зависимости для проверки конкретной роли
    """
    async def role_checker(request: Request):
        user = await get_current_user(request)
        user_role = getattr(user, 'role', 'student')
        
        if user_role != required_role.value:
            raise HTTPException(
                status_code=403, 
                detail=f"Доступ запрещен. Требуется роль: {required_role.value}"
            )
        return user
    return role_checker

async def optional_auth(request: Request):
    """
    Попытка аутентификации, но не требует её.
    Возвращает пользователя, если аутентификация успешна, иначе None.
    """
    try:
        # Проверка наличия заголовка Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        # Получаем пользователя из базы данных
        db = await get_database()
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            return None
        
        # Создаем объект UserInDB из документа
        user_doc["id"] = str(user_doc["_id"])
        
        # Обеспечиваем обратную совместимость для is_admin
        user_role = user_doc.get("role", "student")
        if "is_admin" in user_doc and user_doc["is_admin"]:
            user_role = "admin"
            user_doc["role"] = "admin"
        
        user_doc["is_admin"] = user_role == "admin"
        
        return UserInDB(**user_doc)
    except Exception:
        return None 