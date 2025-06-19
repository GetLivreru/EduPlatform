from fastapi import APIRouter
from app.api.endpoints import quizzes, quiz_attempts, auth, admin

api_router = APIRouter()

# Include routers
api_router.include_router(quizzes.router, tags=["quizzes"])
api_router.include_router(quiz_attempts.router, prefix="/quiz-attempts", tags=["quiz-attempts"])
api_router.include_router(auth.router, tags=["аутентификация"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"]) 