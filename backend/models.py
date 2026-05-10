from pydantic import BaseModel, EmailStr, Field as PydanticField
from sqlmodel import SQLModel, Field
from datetime import datetime


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password: str
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True)
    full_name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserIn(BaseModel):
    username: str = PydanticField(
        min_length=3, max_length=32, pattern=r"^\w+$")
    password: str = PydanticField(min_length=8, max_length=128)
    email: EmailStr


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str


class Token(BaseModel):
    access_token: str
    refresh_token: str


class Dream(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: str  # Example "tech" / "sport" / and if there not find your, so you can free text make it
    # When you click category, then you can just deep where you focus.
    specific_items: list[str]
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
