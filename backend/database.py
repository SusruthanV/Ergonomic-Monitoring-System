import json
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, Float, String, Boolean, DateTime, Text, JSON, Enum as SAEnum
import enum

from config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    posture_records = relationship("PostureRecord", back_populates="session", cascade="all, delete-orphan")
    blink_records = relationship("EyeBlinkRecord", back_populates="session", cascade="all, delete-orphan")
    risk_records = relationship("DiseaseRiskRecord", back_populates="session", cascade="all, delete-orphan")
    score_aggregates = relationship("ScoreAggregate", back_populates="session", cascade="all, delete-orphan")


class PostureRecord(Base):
    __tablename__ = "posture_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("user_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    neck_angle: Mapped[float] = mapped_column(Float)
    shoulder_angle: Mapped[float] = mapped_column(Float)
    spine_angle: Mapped[float] = mapped_column(Float)
    overall_posture_score: Mapped[float] = mapped_column(Float)
    is_good_posture: Mapped[bool] = mapped_column(Boolean)

    session = relationship("UserSession", back_populates="posture_records")


class EyeBlinkRecord(Base):
    __tablename__ = "eye_blink_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("user_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ear_value: Mapped[float] = mapped_column(Float)
    is_blink: Mapped[bool] = mapped_column(Boolean)
    blink_rate: Mapped[float] = mapped_column(Float)

    session = relationship("UserSession", back_populates="blink_records")


class DiseaseRiskRecord(Base):
    __tablename__ = "disease_risk_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("user_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    risk_scores: Mapped[str] = mapped_column(Text)
    overall_risk_score: Mapped[float] = mapped_column(Float)

    session = relationship("UserSession", back_populates="risk_records")

    def get_risk_scores_dict(self):
        return json.loads(self.risk_scores)

    def set_risk_scores_dict(self, data: dict):
        self.risk_scores = json.dumps(data)


class ScoreAggregate(Base):
    __tablename__ = "score_aggregates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("user_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    overall_score: Mapped[float] = mapped_column(Float)
    posture_score: Mapped[float] = mapped_column(Float)
    eye_blink_score: Mapped[float] = mapped_column(Float)
    disease_risk_score: Mapped[float] = mapped_column(Float)
    session_duration_minutes: Mapped[float] = mapped_column(Float)

    session = relationship("UserSession", back_populates="score_aggregates")


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
