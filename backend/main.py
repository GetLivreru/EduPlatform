from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Educational Quiz Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int

class Quiz(BaseModel):
    id: int
    title: str
    subject: str
    difficulty: str
    questions: List[QuizQuestion]

# Mock data
mock_quizzes = [
    {
        "id": 1,
        "title": "Basic Math Quiz",
        "subject": "Mathematics",
        "difficulty": "Beginner",
        "questions": [
            {
                "id": 1,
                "question": "What is 2 + 2?",
                "options": ["3", "4", "5", "6"],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": "What is 5 * 5?",
                "options": ["20", "25", "30", "35"],
                "correct_answer": 1
            }
        ]
    },
    {
        "id": 2,
        "title": "Advanced Math Quiz",
        "subject": "Mathematics",
        "difficulty": "Advanced",
        "questions": [
            {
                "id": 1,
                "question": "What is the derivative of x^2?",
                "options": ["x", "2x", "x^3", "2x^2"],
                "correct_answer": 1
            }
        ]
    }
]

@app.get("/")
async def root():
    return {"message": "Welcome to Educational Quiz Platform API"}

@app.get("/api/test")
async def test_endpoint():
    return {"status": "success", "message": "Backend is working!"}

@app.get("/api/quizzes", response_model=List[Quiz])
async def get_quizzes():
    return mock_quizzes

@app.get("/api/quizzes/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: int):
    quiz = next((q for q in mock_quizzes if q["id"] == quiz_id), None)
    if quiz is None:
        return {"error": "Quiz not found"}
    return quiz

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 