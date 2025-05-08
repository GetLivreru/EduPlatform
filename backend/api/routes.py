from typing import Dict, List
from fastapi import APIRouter, Request, Form, BackgroundTasks, HTTPException
from ..ai_service import generate_learning_recommendations

router = APIRouter(prefix="/api")

@router.post("/learning-recommendations")
async def get_learning_recommendations(
    request: Request,
    background_tasks: BackgroundTasks,
    subject: str = Form(...),
    level: str = Form(...),
    quiz_results: Dict = Form(...),
    incorrect_questions: List[Dict] = Form(...)
):
    try:
        recommendations = await generate_learning_recommendations(
            subject=subject,
            level=level,
            quiz_results=quiz_results,
            incorrect_questions=incorrect_questions
        )
        
        if not recommendations:
            raise HTTPException(status_code=500, detail="Не удалось сгенерировать рекомендации")
            
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 