import random
from datetime import datetime, timedelta

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from jose import jwt, JWTError

from config import settings
from database import async_session, User
from utils.email import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.JWT_ACCESS_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


async def get_current_user(authorization: str = Header(...)) -> User:
    scheme = "Bearer "
    if not authorization.startswith(scheme):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[len(scheme):]

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = int(user_id)

    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    async with async_session() as session:
        user = await session.get(User, user_id)

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: str | None = None


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    is_verified: bool
    created_at: datetime


@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    async with async_session() as session:
        existing = await session.execute(select(User).where(User.email == data.email))
        user = existing.scalar_one_or_none()

        hashed = hash_password(data.password)
        otp = f"{random.randint(100000, 999999)}"
        otp_expires = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        if user:
            if user.is_verified:
                raise HTTPException(status_code=409, detail="Email already registered")
            user.name = data.name
            user.hashed_password = hashed
            user.phone = data.phone or None
            user.otp_code = otp
            user.otp_expires_at = otp_expires
        else:
            user = User(
                email=data.email,
                name=data.name,
                phone=data.phone or None,
                hashed_password=hashed,
                otp_code=otp,
                otp_expires_at=otp_expires,
            )
            session.add(user)

        await session.commit()
        await session.refresh(user)

    send_otp_email(data.email, otp, user.name)
    return {"message": "Registration successful. Verify your email with the OTP sent.", "email": data.email}


@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        if user.otp_code != data.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP expired")

        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        await session.commit()

    return {"message": "Email verified successfully"}


@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")

        otp = f"{random.randint(100000, 999999)}"
        otp_expires = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        user.otp_code = otp
        user.otp_expires_at = otp_expires
        await session.commit()

    send_otp_email(data.email, otp, user.name)
    return {"message": "New OTP sent to your email"}


@router.post("/login")
async def login(data: LoginRequest):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.is_verified:
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "Email not verified. Please verify your email first.",
                    "email": data.email,
                },
            )

        token = create_access_token({"sub": str(user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "is_verified": user.is_verified,
            },
        }


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        phone=user.phone,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


@router.put("/profile")
async def update_profile(data: UpdateProfileRequest, user: User = Depends(get_current_user)):
    async with async_session() as session:
        db_user = await session.get(User, user.id)
        if data.name is not None:
            db_user.name = data.name
        if data.phone is not None:
            db_user.phone = data.phone or None
        await session.commit()
        return {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "phone": db_user.phone,
            "is_verified": db_user.is_verified,
        }
