from fastapi import APIRouter, HTTPException, Depends
from datetime import timedelta
from passlib.context import CryptContext
from app.core.config import settings
from app.models.user import UserCreate, UserLogin, UserResponse, UserInDB, UserRole
from app.core.auth import create_access_token, get_current_user
from app.db.mongodb import get_collection
from datetime import datetime

router = APIRouter()

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", 
         response_model=UserResponse,
         summary="Регистрация пользователя",
         description="Регистрирует нового пользователя в системе")
async def register(user: UserCreate):
    # Проверяем, существует ли уже пользователь
    users_collection = get_collection("users")
    existing_user = await users_collection.find_one({"login": user.login})
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    # Хешируем пароль
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.now()
    user_dict["role"] = UserRole.student
    
        # Сохраняем пользователя
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Преобразуем _id в строку для правильной сериализации
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    
    return UserResponse(**created_user)

@router.post("/login",
         summary="Вход в систему",
         description="Авторизует пользователя и возвращает токен доступа")
async def login(user: UserLogin):
    # Находим пользователя
    users_collection = get_collection("users")
    db_user = await users_collection.find_one({"login": user.login})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    # Создаем токен
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user["_id"]),"role":db_user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "login": db_user["login"],
            "role":db_user["role"]
        }
    }

@router.get("/check-admin")
async def check_admin(current_user: UserInDB = Depends(get_current_user)):
    return {
        "role":current_user.role
    } 
@router.get("/register-teacher",response_model=UserResponse)
async def register_teacher(
    user:UserCreate,
    current_user:UserInDB = Depends(get_current_user)
    ):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="У вас нет прав для регистрации преподавателей")
    
    users_collection = get_collection("users")
    existing_user = await users_collection.find_one({"login": user.login})
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.now()
    user_dict["role"] = UserRole.teacher
    
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})

    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    
    return UserResponse(**created_user)
    
