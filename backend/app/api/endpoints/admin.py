from fastapi import APIRouter, HTTPException, Depends, Body
from bson import ObjectId
from app.core.auth import require_admin
from app.db.mongodb import get_collection
from typing import List, Dict, Optional, Any
from datetime import datetime

router = APIRouter()

# All admin routes automatically require admin authentication through dependencies

@router.get("/users", 
            summary="Получить список пользователей [админ]",
            description="Возвращает список всех пользователей (требуются права администратора)")
async def get_users(_=Depends(require_admin)):
    try:
        users_collection = get_collection("users")
        users = []
        cursor = users_collection.find({}, {"password": 0})  # Exclude passwords
        async for user in cursor:
            user["id"] = str(user["_id"])
            del user["_id"]
            users.append(user)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", 
            summary="Получить статистику системы [админ]",
            description="Возвращает общую статистику по системе (требуются права администратора)")
async def get_stats(_=Depends(require_admin)):
    try:
        users_collection = get_collection("users")
        quizzes_collection = get_collection("quizzes")
        quiz_attempts_collection = get_collection("quiz_attempts")
        
        user_count = await users_collection.count_documents({})
        quiz_count = await quizzes_collection.count_documents({})
        completed_attempts = await quiz_attempts_collection.count_documents({"status": "completed"})
        active_attempts = await quiz_attempts_collection.count_documents({"status": "active"})
        
        # Get count of users registered in the last 30 days
        thirty_days_ago = datetime.utcnow() - datetime.timedelta(days=30)
        new_users = await users_collection.count_documents({"created_at": {"$gte": thirty_days_ago}})
        
        # Calculate quiz completion rate
        if completed_attempts + active_attempts > 0:
            completion_rate = completed_attempts / (completed_attempts + active_attempts) * 100
        else:
            completion_rate = 0
            
        return {
            "total_users": user_count,
            "total_quizzes": quiz_count,
            "completed_quiz_attempts": completed_attempts,
            "active_quiz_attempts": active_attempts,
            "completion_rate": completion_rate,
            "new_users_last_30_days": new_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-user-password/{user_id}", 
             summary="Сбросить пароль пользователя [админ]",
             description="Устанавливает новый пароль для указанного пользователя (требуются права администратора)")
async def reset_user_password(
    user_id: str,
    new_password: str = Body(..., description="Новый пароль"),
    _=Depends(require_admin)
):
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Хешируем новый пароль
        hashed_password = pwd_context.hash(new_password)
        
        users_collection = get_collection("users")
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_password}}
        )
        
        if result.modified_count == 0:
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        return {"message": "Пароль успешно сброшен"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 