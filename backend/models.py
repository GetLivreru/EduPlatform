from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from bson import ObjectId
from datetime import datetime
from enum import Enum



class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class QuizQuestion(BaseModel):
    text: str
    options: List[str]
    correct_answer: int

    model_config = ConfigDict(
        extra='allow'
    )

class QuizBase(BaseModel):
    title: str
    description: str
    category: str
    questions: List[QuizQuestion]
    difficulty: str
    time_limit: int

    model_config = ConfigDict(
        extra='allow'
    )

class QuizDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: str
    category: str
    questions: List[dict]
    difficulty: str
    time_limit: int
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class QuizResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    questions: List[dict]
    difficulty: str
    time_limit: int

    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    )

class QuizAttempt(BaseModel):
    quiz_id: str
    start_time: datetime
    status: str
    answers: List[Any] = []
    score: Optional[float] = None

    model_config = ConfigDict(
        extra='allow'
    )

class QuizAttemptDB(QuizAttempt):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class Exercise(BaseModel):
    day: int
    topics: List[str]
    exercises: List[str]

    model_config = ConfigDict(
        extra='allow'
    )

class LearningPathBase(BaseModel):
    subject: str
    level: str
    content: List[Exercise]
    duration_days: int

    model_config = ConfigDict(
        extra='allow'
    )

class LearningPathDB(LearningPathBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class LearningPathResponse(LearningPathBase):
    id: str

    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    )

# Новая модель для хранения рекомендаций
class LearningResource(BaseModel):
    title: str
    url: str

    model_config = ConfigDict(
        extra='allow'
    )

class StudyDay(BaseModel):
    day: str
    tasks: List[str]

    model_config = ConfigDict(
        extra='allow'
    )

class LearningRecommendation(BaseModel):
    user_id: str
    quiz_id: str
    subject: str
    level: str
    weak_areas: List[str] = []
    learning_resources: List[LearningResource] = []
    practice_exercises: List[str] = []
    study_schedule: List[StudyDay] = []
    expected_outcomes: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        extra='allow'
    )

class LearningRecommendationDB(LearningRecommendation):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class LearningRecommendationResponse(LearningRecommendation):
    id: str
    
    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    )

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class User(BaseModel):
    name: str
    login: EmailStr
    password: str
    quiz_points: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    role: UserRole = UserRole.student

    model_config = ConfigDict(
        extra='allow'
    )

class UserInDB(User):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    role: UserRole = UserRole.student
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class UserCreate(BaseModel):
    name: str
    login: EmailStr
    password: str
    role: UserRole = UserRole.student

    model_config = ConfigDict(
        extra='allow'
    )
class UserLogin(BaseModel):
    login: EmailStr
    password: str

    model_config = ConfigDict(
        extra='allow'
    )

class UserResponse(BaseModel):
    id: str
    name: str
    login: EmailStr
    quiz_points: int
    created_at: datetime
    role: UserRole

    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    )

# Quiz Results models
class QuizResultBase(BaseModel):
    quiz_id: str
    quiz_title: str
    user_id: str
    score: float
    completed_at: datetime
    
    model_config = ConfigDict(
        extra='allow'
    )

class QuizResultDB(QuizResultBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        extra='allow'
    )

class QuizResultResponse(QuizResultBase):
    id: str
    
    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    ) 
