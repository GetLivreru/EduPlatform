from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from datetime import datetime, timedelta
from models import UserInDB
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = "your-secret-key-here"  # В реальном приложении используйте безопасный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

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
        if not credentials:
            raise HTTPException(status_code=401, detail="Не авторизован")
        
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except Exception:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    # Получаем пользователя из базы данных
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    
    # Создаем объект UserInDB из документа
    user_doc["id"] = str(user_doc["_id"])
    
    return UserInDB(**user_doc)

async def require_admin(request: Request):
    user = await get_current_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора")
    return user

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
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            return None
        
        # Создаем объект UserInDB из документа
        user_doc["id"] = str(user_doc["_id"])
        return UserInDB(**user_doc)
    except Exception:
        return None 