from pydantic import BaseModel, EmailStr, Field as PydanticField
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from datetime import datetime, date


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password: str
    username: str | None = None
    email: EmailStr = Field(unique=True)
    full_name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    xp: float = Field(default=0.0)
    streak: int = Field(default=0)
    last_checkin_date: date | None = Field(default=None)


class UserIn(BaseModel):
    # full_name: str = PydanticField(
    #     min_length=3, max_length=32, pattern=r"^\w+$")
    password: str = PydanticField(min_length=8, max_length=128)
    email: EmailStr


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str | None = None


class Token(BaseModel):
    access_token: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: str = None  # Username or Id
    exp: int = None  # Expiration


class SystemUser(BaseModel):
    id: int
    username: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Dream(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: str  # Example "tech" / "sport" / and if there not find your, so you can free text make it
    # When you click category, then you can just deep where you focus.
    specific_items: list[str] = Field(default=[], sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Checkin(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    dream_id: int = Field(foreign_key="dream.id")
    hours: float
    note: str | None = None
    created_day: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    xp_earned: float = Field(default=0.0)


class CheckinIn(BaseModel):
    hours: float
    note: str | None = None


class StatsOut(BaseModel):
    streak: int
    level: int
    xp: float = Field(default="0.0")


class Path(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str
    category: str
    price: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    creator_id: int = Field(foreign_key="user.id")
    # Rich roadmap content. Empty for simple paths so the lean card still works.
    # Mentor proof is NOT stored here — it's computed live from the creator's
    # real account (streak + total logged hours) in serialize_paths().
    # Beginner | Intermediate | Advanced
    difficulty: str | None = None
    total_hours: int | None = None                # auto-summed from step hours
    achievements: list[str] = Field(
        default=[], sa_column=Column(JSON))   # green checkmarks
    prerequisites: list[str] = Field(
        default=[], sa_column=Column(JSON))  # yellow section
    # each step: {title, why, instructions, deliverable, hours, tips}
    steps: list[dict] = Field(default=[], sa_column=Column(JSON))


class PathPurchase(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    path_id: int = Field(foreign_key="path.id")
    purchased_at: datetime = Field(default_factory=datetime.utcnow)


class StepIn(BaseModel):
    title: str
    why: str = ""           # why this step matters
    instructions: str = ""  # exactly how to do it
    deliverable: str = ""   # what you'll have when done
    hours: float = 0.0
    tips: str = ""          # pro tips / resources


class PathIn(BaseModel):
    title: str
    description: str
    category: str
    price: float
    difficulty: str | None = None              # Beginner | Intermediate | Advanced
    # "what you'll achieve" checkmarks
    achievements: list[str] = []
    prerequisites: list[str] = []              # expectations before starting
    steps: list[StepIn] = []                   # the roadmap


class PathSteps(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    path_id: int = Field(foreign_key="path.id")
    title: str
    description: str
    estimated_hours: float
