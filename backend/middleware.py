from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from datetime import datetime, timedelta
from models import UserInDB

SECRET_KEY = "your-secret-key-here"  # В реальном приложении используйте безопасный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

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
    credentials: HTTPAuthorizationCredentials = await security(request)
    if not credentials:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")
    
    # Здесь должна быть проверка пользователя в базе данных
    # Для примера используем заглушку
    user = UserInDB(
        id=user_id,
        name="Admin",
        login="admin@example.com",
        password="hashed_password",
        is_admin=True,
        created_at=datetime.now()
    )
    return user

async def require_admin(request: Request):
    user = await get_current_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора")
    return user 