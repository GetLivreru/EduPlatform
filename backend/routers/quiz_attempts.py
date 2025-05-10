from fastapi import APIRouter, HTTPException, Body, Path, Depends, Request, Form, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
from pydantic import BaseModel, Field
from middleware import get_current_user
from models import UserInDB
from ai_service import generate_learning_recommendations

load_dotenv()

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.LearnApp

# Вспомогательная функция для сохранения рекомендаций
async def generate_and_save_recommendations(
    quiz_id: str,
    user_id: str,
    subject: str,
    level: str,
    score: float,
    incorrect_questions: List[Dict]
):
    try:
        print(f"Starting background generation of recommendations for user {user_id}, quiz {quiz_id}")
        # Проверяем, есть ли уже рекомендации для этого пользователя и квиза
        existing_recommendation = await db.learning_recommendations.find_one({
            "user_id": user_id,
            "quiz_id": quiz_id
        })
        
        # Если рекомендации уже есть, просто обновляем их
        if existing_recommendation:
            print(f"Found existing recommendations, updating...")
            recommendations = await generate_learning_recommendations(
                subject=subject,
                level=level,
                quiz_results={"score": score},
                incorrect_questions=incorrect_questions
            )
            
            if recommendations:
                # Обновляем существующую запись
                await db.learning_recommendations.update_one(
                    {"_id": existing_recommendation["_id"]},
                    {"$set": {
                        "weak_areas": recommendations.get("weak_areas", []),
                        "learning_resources": recommendations.get("learning_resources", []),
                        "practice_exercises": recommendations.get("practice_exercises", []),
                        "study_schedule": recommendations.get("study_schedule", []),
                        "expected_outcomes": recommendations.get("expected_outcomes", []),
                        "created_at": datetime.utcnow()
                    }}
                )
                print(f"Updated learning recommendations for user {user_id}, quiz {quiz_id}")
            return
        
        # Если рекомендаций еще нет, создаем новые
        recommendations = await generate_learning_recommendations(
            subject=subject,
            level=level,
            quiz_results={"score": score},
            incorrect_questions=incorrect_questions
        )
        
        if recommendations:
            # Готовим документ для сохранения
            recommendation_doc = {
                "user_id": user_id,
                "quiz_id": quiz_id,
                "subject": subject,
                "level": level,
                "weak_areas": recommendations.get("weak_areas", []),
                "learning_resources": recommendations.get("learning_resources", []),
                "practice_exercises": recommendations.get("practice_exercises", []),
                "study_schedule": recommendations.get("study_schedule", []),
                "expected_outcomes": recommendations.get("expected_outcomes", []),
                "created_at": datetime.utcnow()
            }
            
            # Сохраняем в коллекцию
            await db.learning_recommendations.insert_one(recommendation_doc)
            print(f"Saved new learning recommendations for user {user_id}, quiz {quiz_id}")
    except Exception as e:
        print(f"Error generating and saving recommendations: {str(e)}")

class QuizAttemptCreate(BaseModel):
    quiz_id: str = Field(..., description="ID теста для начала попытки")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": "60c72b2f9b1d7c2d1c8b4567"
            }
        }

class AnswerSubmit(BaseModel):
    question_index: int = Field(..., description="Индекс вопроса (начиная с 0)")
    answer: int = Field(..., description="Индекс выбранного варианта ответа (начиная с 0)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "question_index": 0,
                "answer": 2
            }
        }

@router.post("/",
            summary="Создать попытку теста",
            description="Создает новую попытку прохождения теста (требуется аутентификация)",
            response_description="Информация о созданной попытке")
async def create_quiz_attempt(
    attempt_data: QuizAttemptCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        quiz_id = attempt_data.quiz_id
        
        # Проверяем существование теста
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Тест не найден")

        # Создаем новую попытку
        attempt = {
            "quiz_id": ObjectId(quiz_id),
            "user_id": ObjectId(current_user.id),
            "start_time": datetime.utcnow(),
            "status": "in_progress",
            "answers": [],
            "score": None
        }
        
        result = await db.quiz_attempts.insert_one(attempt)
        attempt["_id"] = str(result.inserted_id)
        attempt["quiz_id"] = str(attempt["quiz_id"])
        attempt["user_id"] = str(attempt["user_id"])
        
        return attempt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/answer",
            summary="Отправить ответ на вопрос",
            description="Отправляет ответ на вопрос в рамках текущей попытки (требуется аутентификация)",
            response_description="Статус отправки ответа")
async def submit_answer(
    attempt_id: str = Path(..., description="ID попытки теста"),
    answer: AnswerSubmit = Body(..., description="Данные ответа на вопрос"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Add answer to attempt
        answer_data = answer.dict()
        answer_data["submitted_at"] = datetime.utcnow()
        await db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {"$push": {"answers": answer_data}}
        )

        return {"status": "success", "message": "Answer submitted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{attempt_id}/finish",
            summary="Завершить попытку",
            description="Завершает попытку и рассчитывает итоговый результат (требуется аутентификация)",
            response_description="Результаты теста")
async def finish_quiz(
    attempt_id: str = Path(..., description="ID попытки теста"),
    current_user: UserInDB = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        # Get attempt
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Get quiz
        quiz = await db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Calculate score and collect incorrect answers
        correct_answers = 0
        total_questions = len(quiz["questions"])
        incorrect_questions = []
        
        for answer in attempt["answers"]:
            question_idx = answer.get("question_index")
            if 0 <= question_idx < total_questions:
                question = quiz["questions"][question_idx]
                if answer["answer"] == question["correct_answer"]:
                    correct_answers += 1
                else:
                    incorrect_questions.append({
                        "question_id": str(question["_id"]) if "_id" in question else str(question_idx),
                        "question_text": question["text"],
                        "user_answer": question["options"][answer["answer"]],
                        "correct_answer": question["options"][question["correct_answer"]]
                    })

        score = 0 if total_questions == 0 else (correct_answers / total_questions) * 100
        
        # Points to award
        points_earned = int(score // 10)  # 1 point for each 10% of score
        
        # Update attempt
        completion_time = datetime.utcnow()
        await db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {
                "$set": {
                    "status": "completed",
                    "end_time": completion_time,
                    "score": score,
                    "incorrect_questions": incorrect_questions
                }
            }
        )
        
        # Update user's quiz points
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$inc": {"quiz_points": points_earned}}
        )
        
        # Create quiz result entry
        quiz_result = {
            "quiz_id": str(quiz["_id"]),
            "quiz_title": quiz["title"],
            "user_id": current_user.id,
            "score": score,
            "completed_at": completion_time,
            "incorrect_questions": incorrect_questions
        }
        await db.quiz_results.insert_one(quiz_result)
        
        # Генерируем рекомендации в фоновом режиме
        try:
            background_tasks.add_task(
                generate_and_save_recommendations,
                quiz_id=str(quiz["_id"]),
                user_id=current_user.id,
                subject=quiz.get("category", "General"),
                level=quiz.get("difficulty", "Intermediate"),
                score=score,
                incorrect_questions=incorrect_questions
            )
            print(f"Scheduled background task to generate recommendations for quiz {quiz['_id']}")
        except Exception as rec_err:
            print(f"Error scheduling recommendations generation: {str(rec_err)}")
            # Продолжаем работу даже при ошибке с рекомендациями

        return {
            "status": "completed",
            "score": score,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "points_earned": points_earned,
            "incorrect_questions": incorrect_questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{attempt_id}",
           summary="Получить попытку",
           description="Возвращает информацию о попытке прохождения теста (требуется аутентификация)",
           response_description="Детальная информация о попытке")
async def get_attempt(
    attempt_id: str = Path(..., description="ID попытки теста"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        attempt = await db.quiz_attempts.find_one({"_id": ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
            
        # Проверка, что попытка принадлежит текущему пользователю
        if str(attempt["user_id"]) != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

        # Convert ObjectId to string
        attempt["_id"] = str(attempt["_id"])
        attempt["quiz_id"] = str(attempt["quiz_id"])
        attempt["user_id"] = str(attempt["user_id"])
        
        return attempt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/user",
           summary="Получить результаты квизов пользователя",
           description="Возвращает список результатов квизов для текущего пользователя (требуется аутентификация)",
           response_description="Список результатов квизов")
async def get_user_quiz_results(
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Получаем результаты квизов пользователя, сортируем по дате завершения (сначала новые)
        cursor = db.quiz_results.find({"user_id": current_user.id}).sort("completed_at", -1)
        
        # Преобразуем результаты в список
        results = []
        async for result in cursor:
            result["_id"] = str(result["_id"])
            results.append(result)
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{quiz_id}",
           summary="Получить результат квиза",
           description="Возвращает результаты конкретного квиза для текущего пользователя (требуется аутентификация)",
           response_description="Результат квиза")
async def get_quiz_result(
    quiz_id: str = Path(..., description="ID квиза"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Находим самый последний результат квиза для пользователя
        result = await db.quiz_results.find_one(
            {"quiz_id": quiz_id, "user_id": current_user.id},
            sort=[("completed_at", -1)]
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Результат квиза не найден")
            
        # Преобразуем ObjectId в строку
        result["_id"] = str(result["_id"])
        
        # Добавляем информацию о квизе
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if quiz:
            result["quiz_title"] = quiz["title"]
            result["quiz_description"] = quiz["description"]
            result["quiz_category"] = quiz["category"]
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{quiz_id}",
           summary="Получить сохраненные рекомендации по обучению",
           description="Возвращает сохраненные рекомендации по обучению для конкретного квиза",
           response_description="Рекомендации по обучению")
async def get_saved_recommendations(
    quiz_id: str = Path(..., description="ID квиза"),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Ищем сохраненные рекомендации
        recommendation = await db.learning_recommendations.find_one(
            {"quiz_id": quiz_id, "user_id": current_user.id}
        )
        
        if recommendation:
            # Преобразуем ObjectId в строку
            recommendation["_id"] = str(recommendation["_id"])
            return recommendation
            
        # Если рекомендаций нет, генерируем их на лету
        # Получаем информацию о квизе
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Квиз не найден")
            
        # Получаем последний результат квиза для пользователя
        result = await db.quiz_results.find_one(
            {"quiz_id": quiz_id, "user_id": current_user.id},
            sort=[("completed_at", -1)]
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Результат квиза не найден")
            
        # Генерируем рекомендации
        recommendations = await generate_learning_recommendations(
            subject=quiz.get("category", "General"),
            level=quiz.get("difficulty", "Intermediate"),
            quiz_results={"score": result.get("score", 0)},
            incorrect_questions=result.get("incorrect_questions", [])
        )
        
        if not recommendations:
            raise HTTPException(status_code=500, detail="Не удалось сгенерировать рекомендации")
            
        # Сохраняем сгенерированные рекомендации для будущего использования
        recommendation_doc = {
            "user_id": current_user.id,
            "quiz_id": quiz_id,
            "subject": quiz.get("category", "General"),
            "level": quiz.get("difficulty", "Intermediate"),
            "weak_areas": recommendations.get("weak_areas", []),
            "learning_resources": recommendations.get("learning_resources", []),
            "practice_exercises": recommendations.get("practice_exercises", []),
            "study_schedule": recommendations.get("study_schedule", []),
            "expected_outcomes": recommendations.get("expected_outcomes", []),
            "created_at": datetime.utcnow()
        }
        
        result = await db.learning_recommendations.insert_one(recommendation_doc)
        recommendation_doc["_id"] = str(result.inserted_id)
        
        return recommendation_doc
    except Exception as e:
        print(f"Error fetching recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/learning-recommendations")
async def get_learning_recommendations(
    request: Request,
    background_tasks: BackgroundTasks,
    subject: str = Form(...),
    level: str = Form(...),
    quiz_results: str = Form(...),  # строка, т.к. приходит JSON
    incorrect_questions: str = Form(...)  # строка, т.к. приходит JSON
):
    import json
    print(f"Received learning recommendations request for subject: {subject}, level: {level}")
    try:
        # Проверяем, что строки не пустые
        quiz_results_data = json.loads(quiz_results) if quiz_results.strip() else {}
        incorrect_questions_data = json.loads(incorrect_questions) if incorrect_questions.strip() else []
    
        print(f"Parsed quiz_results: {quiz_results_data}")
        print(f"Parsed incorrect_questions ({len(incorrect_questions_data)} items)")
        
        # Если в запросе указан quiz_id и user_id, пытаемся получить сохраненные рекомендации
        quiz_id = quiz_results_data.get("quiz_id")
        user_id = quiz_results_data.get("user_id")
        
        if quiz_id and user_id:
            recommendation = await db.learning_recommendations.find_one(
                {"quiz_id": quiz_id, "user_id": user_id}
            )
            
            if recommendation:
                # Если есть сохраненные рекомендации, возвращаем их
                recommendation["_id"] = str(recommendation["_id"])
                print(f"Returning saved recommendations for user {user_id}, quiz {quiz_id}")
                return recommendation
        
        # Если данных недостаточно, возвращаем базовые рекомендации
        if not quiz_results_data or not incorrect_questions_data:
            print("Insufficient data, returning default recommendations")
            return {
                "message": "Недостаточно данных для детальных рекомендаций",
                "weak_areas": ["Общие темы"],
                "learning_resources": [
                    {"title": "Базовый материал по предмету", "url": "https://www.coursera.org/"}
                ],
                "practice_exercises": [
                    "Начните с изучения базовых концепций",
                    "Решите простые задачи для закрепления материала"
                ],
                "study_schedule": [
                    {"day": "День 1", "tasks": ["Ознакомление с предметом"]},
                    {"day": "День 2", "tasks": ["Изучение основных понятий"]},
                    {"day": "День 3", "tasks": ["Практика"]}
                ],
                "expected_outcomes": [
                    "Понимание базовых концепций",
                    "Подготовка к более сложным темам"
                ]
            }
        
        # Генерируем рекомендации
        recommendations = await generate_learning_recommendations(
            subject=subject,
            level=level,
            quiz_results=quiz_results_data,
            incorrect_questions=incorrect_questions_data
        )
        
        # Если есть quiz_id и user_id, сохраняем рекомендации в базу данных
        if quiz_id and user_id and recommendations:
            # Сохраняем рекомендации в фоновом режиме
            background_tasks.add_task(
                generate_and_save_recommendations,
                quiz_id=quiz_id,
                user_id=user_id,
                subject=subject,
                level=level,
                score=quiz_results_data.get("score", 0),
                incorrect_questions=incorrect_questions_data
            )
            
        if not recommendations:
            raise HTTPException(status_code=500, detail="Не удалось сгенерировать рекомендации")
            
        return recommendations
    except json.JSONDecodeError:
        # В случае ошибки разбора JSON, возвращаем базовые рекомендации
        print("JSON parsing error, returning default recommendations")
        return {
            "message": "Ошибка при разборе данных",
            "weak_areas": ["Общие темы"],
            "learning_resources": [
                {"title": "Базовый материал по предмету", "url": "https://www.coursera.org/"}
            ],
            "practice_exercises": [
                "Начните с изучения базовых концепций",
                "Решите простые задачи для закрепления материала"
            ],
            "study_schedule": [
                {"day": "День 1", "tasks": ["Ознакомление с предметом"]},
                {"day": "День 2", "tasks": ["Изучение основных понятий"]},
                {"day": "День 3", "tasks": ["Практика"]}
            ],
            "expected_outcomes": [
                "Понимание базовых концепций",
                "Подготовка к более сложным темам"
            ]
        }
    except Exception as e:
        print(f"Error generating learning recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка генерации рекомендаций: {str(e)}")