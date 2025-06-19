from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from src.models.common import PyObjectId
from bson import ObjectId

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

class QuizAttemptResponse(BaseModel):
    id: str
    quiz_id: str
    start_time: datetime
    status: str
    answers: List[Any] = []
    score: Optional[float] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    ) 