from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime
from src.models.common import PyObjectId

class User(BaseModel):
    name: str
    login: EmailStr
    password: str
    is_admin: bool = False
    quiz_points: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        extra='allow'
    )

class UserInDB(User):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str},
        extra='allow'
    )

class UserCreate(BaseModel):
    name: str
    login: EmailStr
    password: str
    is_admin: bool = False

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
    is_admin: bool
    quiz_points: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        extra='allow'
    ) 