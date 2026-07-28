import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session, UserSession, PostureRecord, EyeBlinkRecord, DiseaseRiskRecord, ScoreAggregate

router = APIRouter(prefix="/api/history")


@router.get("/sessions")
async def list_sessions(db: AsyncSession = Depends(get_session)):
    stmt = (
        select(
            UserSession.id,
            UserSession.created_at,
            UserSession.ended_at,
            func.avg(ScoreAggregate.overall_score).label("avg_overall_score"),
            func.avg(ScoreAggregate.posture_score).label("avg_posture_score"),
            func.avg(ScoreAggregate.eye_blink_score).label("avg_eye_blink_score"),
            func.avg(ScoreAggregate.disease_risk_score).label("avg_disease_risk_score"),
            func.sum(ScoreAggregate.session_duration_minutes).label("total_duration"),
        )
        .outerjoin(ScoreAggregate, UserSession.id == ScoreAggregate.session_id)
        .group_by(UserSession.id)
        .order_by(UserSession.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    sessions = []
    for row in rows:
        sessions.append({
            "id": row.id,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "ended_at": row.ended_at.isoformat() if row.ended_at else None,
            "avg_overall_score": round(float(row.avg_overall_score), 2) if row.avg_overall_score else None,
            "avg_posture_score": round(float(row.avg_posture_score), 2) if row.avg_posture_score else None,
            "avg_eye_blink_score": round(float(row.avg_eye_blink_score), 2) if row.avg_eye_blink_score else None,
            "avg_disease_risk_score": round(float(row.avg_disease_risk_score), 2) if row.avg_disease_risk_score else None,
            "total_duration_minutes": round(float(row.total_duration), 2) if row.total_duration else 0,
        })

    return {"sessions": sessions}


@router.get("/sessions/{session_id}")
async def get_session(session_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.get(UserSession, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    score_count = await db.execute(
        select(func.count()).select_from(ScoreAggregate).where(ScoreAggregate.session_id == session_id)
    )
    posture_count = await db.execute(
        select(func.count()).select_from(PostureRecord).where(PostureRecord.session_id == session_id)
    )
    blink_count = await db.execute(
        select(func.count()).select_from(EyeBlinkRecord).where(EyeBlinkRecord.session_id == session_id)
    )
    risk_count = await db.execute(
        select(func.count()).select_from(DiseaseRiskRecord).where(DiseaseRiskRecord.session_id == session_id)
    )

    return {
        "id": result.id,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "ended_at": result.ended_at.isoformat() if result.ended_at else None,
        "record_counts": {
            "posture_records": posture_count.scalar(),
            "blink_records": blink_count.scalar(),
            "risk_records": risk_count.scalar(),
            "score_aggregates": score_count.scalar(),
        },
    }


@router.get("/sessions/{session_id}/posture")
async def get_session_posture(session_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.get(UserSession, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    stmt = (
        select(PostureRecord)
        .where(PostureRecord.session_id == session_id)
        .order_by(PostureRecord.timestamp.asc())
    )
    rows = await db.execute(stmt)
    records = rows.scalars().all()

    return {
        "session_id": session_id,
        "records": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "neck_angle": r.neck_angle,
                "shoulder_angle": r.shoulder_angle,
                "spine_angle": r.spine_angle,
                "overall_posture_score": r.overall_posture_score,
                "is_good_posture": r.is_good_posture,
            }
            for r in records
        ],
    }


@router.get("/sessions/{session_id}/blinks")
async def get_session_blinks(session_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.get(UserSession, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    stmt = (
        select(EyeBlinkRecord)
        .where(EyeBlinkRecord.session_id == session_id)
        .order_by(EyeBlinkRecord.timestamp.asc())
    )
    rows = await db.execute(stmt)
    records = rows.scalars().all()

    return {
        "session_id": session_id,
        "records": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "ear_value": r.ear_value,
                "is_blink": r.is_blink,
                "blink_rate": r.blink_rate,
            }
            for r in records
        ],
    }


@router.get("/sessions/{session_id}/risks")
async def get_session_risks(session_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.get(UserSession, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    stmt = (
        select(DiseaseRiskRecord)
        .where(DiseaseRiskRecord.session_id == session_id)
        .order_by(DiseaseRiskRecord.timestamp.asc())
    )
    rows = await db.execute(stmt)
    records = rows.scalars().all()

    return {
        "session_id": session_id,
        "records": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "risk_scores": json.loads(r.risk_scores),
                "overall_risk_score": r.overall_risk_score,
            }
            for r in records
        ],
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.get(UserSession, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(result)
    await db.commit()
    return {"message": f"Session {session_id} deleted successfully"}
