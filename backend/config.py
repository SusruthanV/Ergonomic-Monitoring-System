import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    WEBCAM_ID = 0
    PROCESS_EVERY_N_FRAMES = 2
    BLINK_THRESHOLD = 0.22
    BLINK_CONSEC_FRAMES = 3
    NECK_ANGLE_THRESHOLD = 30
    SHOULDER_ANGLE_THRESHOLD = 25
    SPINE_ANGLE_THRESHOLD = 15
    HISTORY_RETENTION_DAYS = 30
    DATABASE_URL = "sqlite+aiosqlite:///./ergonomics.db"

    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production-12345")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES = 60 * 24

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")

    OTP_EXPIRE_MINUTES = 10


settings = Settings()
