from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from database import get_session, UserSession, ScoreAggregate, UserAchievement, User
from routes.auth import get_current_user

router = APIRouter(prefix="/api/achievements", tags=["achievements"])

BADGES = [
    {"id": "first_session", "name": "First Step", "description": "Complete your first analysis session", "icon": "Star"},
    {"id": "streak_7", "name": "Week Warrior", "description": "7-day analysis streak", "icon": "Flame"},
    {"id": "streak_30", "name": "Monthly Master", "description": "30-day analysis streak", "icon": "Trophy"},
    {"id": "sessions_100", "name": "Century Club", "description": "Complete 100 sessions", "icon": "Award"},
    {"id": "perfect_posture", "name": "Perfect Posture", "description": "Score 100 on posture", "icon": "CheckCircle"},
    {"id": "early_bird", "name": "Early Bird", "description": "Complete a session before 8 AM", "icon": "Sunrise"},
    {"id": "night_owl", "name": "Night Owl", "description": "Complete a session after 10 PM", "icon": "Moon"},
]


@router.get("")
async def get_achievements(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(UserAchievement).where(UserAchievement.user_id == user.id))
    earned = {a.badge_id: a.earned_at.isoformat() for a in result.scalars().all()}
    
    return {
        "badges": [
            {**badge, "earned": badge["id"] in earned, "earned_at": earned.get(badge["id"])}
            for badge in BADGES
        ]
    }


@router.get("/stats")
async def get_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(UserSession)
        .where(UserSession.ended_at.isnot(None))
        .order_by(UserSession.created_at.desc())
    )
    sessions = result.scalars().all()
    
    if not sessions:
        return {"current_streak": 0, "best_streak": 0, "total_sessions": 0, "total_hours": 0.0}
    
    total_sessions = len(sessions)
    
    total_minutes = 0.0
    for s in sessions:
        agg_result = await db.execute(
            select(ScoreAggregate).where(ScoreAggregate.session_id == s.id)
        )
        agg = agg_result.scalars().first()
        if agg:
            total_minutes += agg.session_duration_minutes
    total_hours = round(total_minutes / 60, 1)
    
    days_with_sessions = set()
    for s in sessions:
        days_with_sessions.add(s.created_at.date())
    
    today = datetime.utcnow().date()
    current_streak = 0
    check_date = today
    while check_date in days_with_sessions:
        current_streak += 1
        check_date -= timedelta(days=1)
    
    best_streak = 0
    streak = 0
    sorted_days = sorted(days_with_sessions)
    for i, day in enumerate(sorted_days):
        if i == 0:
            streak = 1
        elif (day - sorted_days[i-1]).days == 1:
            streak += 1
        else:
            best_streak = max(best_streak, streak)
            streak = 1
    best_streak = max(best_streak, streak)
    
    return {
        "current_streak": current_streak,
        "best_streak": best_streak,
        "total_sessions": total_sessions,
        "total_hours": total_hours,
    }


@router.post("/check")
async def check_and_award_badges(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(UserAchievement).where(UserAchievement.user_id == user.id))
    earned_ids = {a.badge_id for a in result.scalars().all()}
    
    newly_earned = []
    
    sessions_result = await db.execute(
        select(UserSession)
        .where(UserSession.ended_at.isnot(None))
        .order_by(UserSession.created_at.desc())
    )
    sessions = sessions_result.scalars().all()
    
    if sessions and "first_session" not in earned_ids:
        db.add(UserAchievement(user_id=user.id, badge_id="first_session"))
        newly_earned.append("first_session")
    
    if len(sessions) >= 100 and "sessions_100" not in earned_ids:
        db.add(UserAchievement(user_id=user.id, badge_id="sessions_100"))
        newly_earned.append("sessions_100")
    
    for s in sessions:
        if s.created_at.hour < 8 and "early_bird" not in earned_ids:
            db.add(UserAchievement(user_id=user.id, badge_id="early_bird"))
            newly_earned.append("early_bird")
            break
        if s.created_at.hour >= 22 and "night_owl" not in earned_ids:
            db.add(UserAchievement(user_id=user.id, badge_id="night_owl"))
            newly_earned.append("night_owl")
            break
    
    agg_result = await db.execute(select(ScoreAggregate))
    aggs = agg_result.scalars().all()
    if any(a.posture_score >= 100 for a in aggs) and "perfect_posture" not in earned_ids:
        db.add(UserAchievement(user_id=user.id, badge_id="perfect_posture"))
        newly_earned.append("perfect_posture")
    
    days_with_sessions = set()
    for s in sessions:
        days_with_sessions.add(s.created_at.date())
    
    today = datetime.utcnow().date()
    streak = 0
    check_date = today
    while check_date in days_with_sessions:
        streak += 1
        check_date -= timedelta(days=1)
    
    if streak >= 7 and "streak_7" not in earned_ids:
        db.add(UserAchievement(user_id=user.id, badge_id="streak_7"))
        newly_earned.append("streak_7")
    if streak >= 30 and "streak_30" not in earned_ids:
        db.add(UserAchievement(user_id=user.id, badge_id="streak_30"))
        newly_earned.append("streak_30")
    
    await db.commit()
    return {"newly_earned": newly_earned}
