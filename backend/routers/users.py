from fastapi import Depends, HTTPException, APIRouter, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import ValidationError
from datetime import datetime, timezone
from jose import jwt, JWTError
from backend.database import get_session
from backend.rate_limiter import limiter
from backend.models import (
    LoginRequest,
    UserOut,
    UserIn,
    User,
    Token,
    TokenPayload,
    SystemUser,
    RefreshRequest
)
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    jwt_key,
    algorithm,
    jwt_refresh_key
)


router = APIRouter()
FAKE_HASH = hash_password("dummy_password_for_timing")


@router.post("/register", response_model=UserOut, tags=["sign up"])
@limiter.limit("3/minute")
async def register(request: Request, data: UserIn, session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == data.email)
        existing_email = session.exec(statement).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email is enabled")
        hashed_pass = hash_password(data.password)
        new_user = User(email=data.email, password=hashed_pass)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,  detail="Internal server error")


@router.post("/login", response_model=Token, tags=["login"])
@limiter.limit("3/minute")
async def login(request: Request, data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == data.username)
    existing_user = session.exec(statement).first()
    if existing_user is None:
        verify_password(data.password, FAKE_HASH)
        raise HTTPException(
            status_code=401, detail="Incorrect email or password")
    if not verify_password(data.password, existing_user.password):
        raise HTTPException(
            status_code=401, detail="Incorrect email or password")
    return {
        "access_token": create_access_token(existing_user.id),
        "refresh_token": create_refresh_token(existing_user.id)
    }
reusable_oauth = OAuth2PasswordBearer(
    tokenUrl="/login",
    scheme_name="JWT"
)


async def get_current_user(token: str = Depends(reusable_oauth), session: Session = Depends(get_session)) -> SystemUser:
    try:
        payload = jwt.decode(
            token, jwt_key, algorithms=[algorithm]
        )
        token_data = TokenPayload(**payload)
        if datetime.fromtimestamp(token_data.exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Token expired", headers={
                "WWW-Authenticate": "Bearer"
            })
    except HTTPException:
        raise
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=403, detail="Could not validate credentials", headers={
            "WWW-Authenticate": "Bearer"
        })

    statement = select(User).where(User.id == int(token_data.sub))
    new_user = session.exec(statement).first()
    if new_user is None:
        raise HTTPException(status_code=400, detail="Could not find user")
    return new_user


@router.get("/me", summary="Get details of currently logged in user", response_model=UserOut, tags=["Login information"])
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/refresh", response_model=Token, tags=["requests"])
async def refresh(data: RefreshRequest, session: Session = Depends(get_session)):
    try:
        payload = jwt.decode(data.refresh_token,
                             jwt_refresh_key, algorithms=[algorithm])
        token_data = TokenPayload(**payload)
        if datetime.fromtimestamp(token_data.exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Token expired", headers={
                "WWW-Authenticate": "Bearer"
            })
    except HTTPException:
        raise
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=403, detail="Could not validate credentials")
    statement = select(User).where(User.id == int(token_data.sub))
    new_user = session.exec(statement).first()
    if new_user is None:
        raise HTTPException(status_code=400, detail="Could not find user")
    return {
        "access_token": create_access_token(new_user.id),
        "refresh_token": create_refresh_token(new_user.id)
    }
