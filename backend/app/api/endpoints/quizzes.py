from fastapi import APIRouter, HTTPException, Depends, Body, Path
from bson import ObjectId
from datetime import datetime
from typing import List, Dict, Optional
from app.models.quiz import QuizBase, QuizResponse
from app.core.auth import require_admin
from app.db.mongodb import get_collection

router = APIRouter()

@router.get("/quizzes", 
           response_model=List[QuizResponse],
           summary="Получить список тестов",
           description="Возвращает список всех доступных тестов")
async def get_quizzes():
    try:
        quizzes_collection = get_collection("quizzes")
        quizzes = []
        cursor = quizzes_collection.find()
        async for quiz_doc in cursor:
            # Преобразуем _id в строку для правильной сериализации
            quiz_doc["id"] = str(quiz_doc["_id"])
            del quiz_doc["_id"]
            quizzes.append(quiz_doc)
        return quizzes
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quizzes: {str(e)}"
        )

@router.get("/quizzes/{quiz_id}", 
           response_model=QuizResponse,
           summary="Получить тест по ID",
           description="Возвращает подробную информацию о тесте по его ID")
async def get_quiz(quiz_id: str = Path(..., description="ID теста для получения")):
    try:
        quizzes_collection = get_collection("quizzes")
        quiz = await quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Тест не найден")
        
        # Преобразуем _id в строку для правильной сериализации
        quiz["id"] = str(quiz["_id"])
        del quiz["_id"]
        return quiz
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz: {str(e)}"
        )

# Защищенные маршруты для администраторов
@router.post("/quizzes", 
            dependencies=[Depends(require_admin)],
            summary="Создать новый тест [админ]",
            description="Создает новый тест (требуются права администратора)")
async def create_quiz(
    title: str = Body(..., description="Название теста"),
    description: str = Body(..., description="Описание теста"),
    category: str = Body(..., description="Категория теста"),
    difficulty: str = Body(..., description="Сложность теста (Easy, Medium, Hard)"),
    time_limit: int = Body(..., description="Ограничение времени в минутах"),
    questions: List[Dict] = Body(..., description="Список вопросов и вариантов ответов")
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
        
        quizzes_collection = get_collection("quizzes")
        result = await quizzes_collection.insert_one(quiz)
        quiz["id"] = str(result.inserted_id)
        
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/quizzes/{quiz_id}", 
           dependencies=[Depends(require_admin)],
           summary="Обновить тест [админ]",
           description="Обновляет существующий тест (требуются права администратора)")
async def update_quiz(
    quiz_id: str = Path(..., description="ID теста для обновления"),
    title: Optional[str] = Body(None, description="Новое название теста"),
    description: Optional[str] = Body(None, description="Новое описание теста"),
    category: Optional[str] = Body(None, description="Новая категория теста"),
    difficulty: Optional[str] = Body(None, description="Новая сложность теста"),
    time_limit: Optional[int] = Body(None, description="Новое ограничение времени"),
    questions: Optional[List[Dict]] = Body(None, description="Новый список вопросов")
):
    try:
        # Создаем словарь для обновления, включая только переданные поля
        update_data = {}
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
        
        update_data["updated_at"] = datetime.utcnow()
        
        quizzes_collection = get_collection("quizzes")
        result = await quizzes_collection.update_one(
            {"_id": ObjectId(quiz_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            quiz = await quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
            if not quiz:
                raise HTTPException(status_code=404, detail="Тест не найден")
            
        return {"message": "Тест успешно обновлен"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/quizzes/{quiz_id}", 
              dependencies=[Depends(require_admin)],
              summary="Удалить тест [админ]",
              description="Удаляет тест по ID (требуются права администратора)")
async def delete_quiz(quiz_id: str = Path(..., description="ID теста для удаления")):
    try:
        quizzes_collection = get_collection("quizzes")
        result = await quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Тест не найден")
        return {"message": "Тест успешно удален"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 