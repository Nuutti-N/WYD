from pydantic import BaseModel, EmailStr
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password: str
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True)
    full_name: str | None = None


class Dream(BaseModel):
    Category: str
    Items_In_Category: str
