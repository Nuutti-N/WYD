from pydantic import BaseModel, EmailStr
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from datetime import datetime


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password: str
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True)
    full_name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Dream(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: str  # Example "tech" / "sport" / and if there not find your, so you can free text make it
    # When you click category, then you can just deep where you focus.
    specific_items: list[str] = Field(default=[], sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
