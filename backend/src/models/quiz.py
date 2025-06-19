from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from src.models.common import PyObjectId
from bson import ObjectId

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