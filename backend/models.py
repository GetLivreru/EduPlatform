from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

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

class Question(BaseModel):
    text: str
    options: List[str]
    correct_answer: int

class QuizBase(BaseModel):
    title: str
    description: str
    category: str
    questions: List[Question]
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