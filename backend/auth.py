from backend.config import settings
from jose import JWTError, jwt
from typing import Union, Any
from datetime import datetime, timedelta, timezone
from passlib import CryptContext


access_token_expire = 30
refresh_token_expire = 60 * 24 * 7
algorithm = settings.algorithm
jwt_key = settings.jwt_key
jwt_refresh_key = settings.jwt_refresh_key


context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:  # When user registers
    return context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:  # When user logs in
    return context.verify(plain_password, hashed_password)


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None):
    if expires_delta is not None:
        expires_delta = datetime.now(timezone.utc) + expires_delta
    else:
        expires_delta = datetime.now(
            timezone.utc) + timedelta(minutes=access_token_expire)
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, jwt_key, algorithm)
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None):
    if expires_delta is not None:
        expires_delta = datetime.now(timezone.utc) + expires_delta
    else:
        expires_delta = datetime.now(
            timezone.utc) + timedelta(minutes=refresh_token_expire)
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    return jwt.encode(to_encode, jwt_refresh_key, algorithm)
