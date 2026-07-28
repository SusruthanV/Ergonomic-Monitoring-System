from datetime import datetime, timedelta
from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session, UserSession, PostureRecord, EyeBlinkRecord, DiseaseRiskRecord, ScoreAggregate
from routes.analysis import active_sessions

router = APIRouter(prefix="/api/dashboard")


@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_session)):
    total_sessions = await db.execute(select(func.count()).select_from(UserSession))
    total_sessions = total_sessions.scalar()

    total_time = await db.execute(
        select(func.sum(ScoreAggregate.session_duration_minutes))
    )
    total_time = total_time.scalar() or 0.0

    avg_scores = await db.execute(
        select(
            func.avg(ScoreAggregate.overall_score),
            func.avg(ScoreAggregate.posture_score),
            func.avg(ScoreAggregate.eye_blink_score),
            func.avg(ScoreAggregate.disease_risk_score),
        )
    )
    avg_row = avg_scores.one()

    active_count = len(active_sessions)

    latest_scores = await db.execute(
        select(ScoreAggregate)
        .order_by(ScoreAggregate.timestamp.desc())
        .limit(10)
    )
    latest = latest_scores.scalars().all()

    return {
        "total_sessions": total_sessions,
        "total_duration_minutes": round(total_time, 2),
        "active_sessions": active_count,
        "average_scores": {
            "overall": round(float(avg_row[0]), 2) if avg_row[0] else 0,
            "posture": round(float(avg_row[1]), 2) if avg_row[1] else 0,
            "eye_blink": round(float(avg_row[2]), 2) if avg_row[2] else 0,
            "disease_risk": round(float(avg_row[3]), 2) if avg_row[3] else 0,
        },
        "latest_scores": [
            {
                "id": s.id,
                "session_id": s.session_id,
                "timestamp": s.timestamp.isoformat() if s.timestamp else None,
                "overall_score": s.overall_score,
                "posture_score": s.posture_score,
                "eye_blink_score": s.eye_blink_score,
                "disease_risk_score": s.disease_risk_score,
                "session_duration_minutes": s.session_duration_minutes,
            }
            for s in latest
        ],
    }


@router.get("/trends")
async def get_trends(days: int = Query(7, ge=1, le=90), db: AsyncSession = Depends(get_session)):
    since = datetime.utcnow() - timedelta(days=days)

    stmt = (
        select(
            func.date(ScoreAggregate.timestamp).label("date"),
            func.avg(ScoreAggregate.overall_score).label("avg_overall"),
            func.avg(ScoreAggregate.posture_score).label("avg_posture"),
            func.avg(ScoreAggregate.eye_blink_score).label("avg_eye_blink"),
            func.avg(ScoreAggregate.disease_risk_score).label("avg_disease_risk"),
            func.count(ScoreAggregate.id).label("record_count"),
        )
        .where(ScoreAggregate.timestamp >= since)
        .group_by(func.date(ScoreAggregate.timestamp))
        .order_by(func.date(ScoreAggregate.timestamp).asc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    trends = []
    for row in rows:
        trends.append({
            "date": row.date,
            "avg_overall_score": round(float(row.avg_overall), 2) if row.avg_overall else 0,
            "avg_posture_score": round(float(row.avg_posture), 2) if row.avg_posture else 0,
            "avg_eye_blink_score": round(float(row.avg_eye_blink), 2) if row.avg_eye_blink else 0,
            "avg_disease_risk_score": round(float(row.avg_disease_risk), 2) if row.avg_disease_risk else 0,
            "record_count": row.record_count,
        })

    return {
        "days": days,
        "since": since.isoformat(),
        "trends": trends,
    }


@router.get("/realtime/{session_id}")
async def get_realtime(session_id: int, db: AsyncSession = Depends(get_session)):
    session_result = await db.get(UserSession, session_id)
    if not session_result:
        return {"error": "Session not found", "active": False}

    is_active = False
    for key, state in active_sessions.items():
        if state.db_session_id == session_id:
            is_active = True

            if state.posture_history:
                latest_posture = state.posture_history[-1]
            else:
                latest_posture = None

            blink_info = {
                "total_blinks": state.eye_blink_detector.total_blinks,
                "last_blink_time": state.eye_blink_detector.last_blink_time,
                "consecutive_frames_below_threshold": state.eye_blink_detector.consecutive_frames_below_threshold,
            }

            duration = (datetime.utcnow().timestamp() - state.start_time) / 60.0

            return {
                "session_id": session_id,
                "active": True,
                "duration_minutes": round(duration, 2),
                "latest_posture": latest_posture,
                "blink_status": blink_info,
                "frame_count": state.frame_count,
            }

    latest_score = await db.execute(
        select(ScoreAggregate)
        .where(ScoreAggregate.session_id == session_id)
        .order_by(ScoreAggregate.timestamp.desc())
        .limit(1)
    )
    latest_score = latest_score.scalar_one_or_none()

    return {
        "session_id": session_id,
        "active": False,
        "ended": session_result.ended_at.isoformat() if session_result.ended_at else None,
        "latest_score": {
            "overall_score": latest_score.overall_score,
            "posture_score": latest_score.posture_score,
            "eye_blink_score": latest_score.eye_blink_score,
            "disease_risk_score": latest_score.disease_risk_score,
        } if latest_score else None,
    }
