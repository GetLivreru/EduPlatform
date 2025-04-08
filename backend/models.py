from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from bson import ObjectId
from datetime import datetime

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class QuizQuestion(BaseModel):
    text: str
    options: List[str]
    correct_answer: int

class QuizBase(BaseModel):
    title: str
    description: str
    category: str
    questions: List[QuizQuestion]
    difficulty: str
    time_limit: int

class QuizDB(QuizBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class QuizResponse(QuizBase):
    id: str

    model_config = ConfigDict(
        from_attributes=True
    )

class LearningPathBase(BaseModel):
    subject: str
    level: str
    content: List[dict]
    duration_days: int

class LearningPathDB(LearningPathBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class LearningPathResponse(LearningPathBase):
    id: str

    model_config = ConfigDict(
        from_attributes=True
    )

class User(BaseModel):
    name: str
    login: EmailStr
    password: str
    is_admin: bool = False
    created_at: datetime = datetime.now()

class UserInDB(User):
    id: str

class UserCreate(BaseModel):
    name: str
    login: EmailStr
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    login: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    login: EmailStr
    is_admin: bool
    created_at: datetime 