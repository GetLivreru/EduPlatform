from typing import List
from pydantic import BaseModel, Field, ConfigDict
from app.models.common import PyObjectId
from bson import ObjectId

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