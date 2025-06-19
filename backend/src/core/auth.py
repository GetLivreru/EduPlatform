from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from app.models.user import UserInDB
from app.db.mongodb import get_collection
from bson import ObjectId

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request) -> UserInDB:
    """Validate and return the current authenticated user."""
    try:
        credentials: HTTPAuthorizationCredentials = await security(request)
        if not credentials:
            raise HTTPException(status_code=401, detail="Не авторизован")
        
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except Exception:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    # Получаем пользователя из базы данных
    users_collection = get_collection("users")
    user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    
    # Создаем объект UserInDB из документа
    user_doc["id"] = str(user_doc["_id"])
    
    return UserInDB(**user_doc)

async def require_admin(request: Request):
    """Verify that the current user has admin privileges."""
    user = await get_current_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора")
    return user

async def optional_auth(request: Request):
    """
    Try to authenticate the user, but don't require it.
    Returns the user if authentication is successful, otherwise None.
    """
    try:
        # Проверка наличия заголовка Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.replace("Bearer ", "")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        # Получаем пользователя из базы данных
        users_collection = get_collection("users")
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            return None
        
        # Создаем объект UserInDB из документа
        user_doc["id"] = str(user_doc["_id"])
        return UserInDB(**user_doc)
    except Exception:
        return None 