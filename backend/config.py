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


settings = Settings()
