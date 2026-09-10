import os
from dotenv import load_dotenv

load_dotenv(override=False)


class Settings:
    WEBCAM_ID = 0
    PROCESS_EVERY_N_FRAMES = 1
    BLINK_THRESHOLD = 0.18
    BLINK_CONSEC_FRAMES = 1
    NECK_ANGLE_THRESHOLD = 30
    SHOULDER_ANGLE_THRESHOLD = 25
    SPINE_ANGLE_THRESHOLD = 15
    HISTORY_RETENTION_DAYS = 30
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./ergonomics.db"
    )

    JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-change-in-production-12345")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES = 60 * 24

    SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "")

    OTP_EXPIRE_MINUTES = 10


settings = Settings()
