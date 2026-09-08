import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func, Integer
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session, UserSession, PostureRecord, EyeBlinkRecord, DiseaseRiskRecord, ScoreAggregate

router = APIRouter(prefix="/api/compare")


async def _get_session_stats(session_id: int, db: AsyncSession) -> dict:
    session = await db.get(UserSession, session_id)
    if not session:
        return None

    score_stmt = (
        select(
            func.avg(ScoreAggregate.overall_score).label("avg_overall"),
            func.avg(ScoreAggregate.posture_score).label("avg_posture"),
            func.avg(ScoreAggregate.eye_blink_score).label("avg_eye_blink"),
            func.avg(ScoreAggregate.disease_risk_score).label("avg_disease_risk"),
            func.sum(ScoreAggregate.session_duration_minutes).label("total_duration"),
        )
        .where(ScoreAggregate.session_id == session_id)
    )
    score_result = await db.execute(score_stmt)
    scores = score_result.one()

    posture_stmt = (
        select(
            func.avg(PostureRecord.neck_angle).label("avg_neck"),
            func.avg(PostureRecord.shoulder_angle).label("avg_shoulder"),
            func.avg(PostureRecord.spine_angle).label("avg_spine"),
            func.count(PostureRecord.id).label("record_count"),
            func.sum(func.cast(PostureRecord.is_good_posture, Integer)).label("good_count"),
        )
        .where(PostureRecord.session_id == session_id)
    )
    posture_result = await db.execute(posture_stmt)
    posture = posture_result.one()

    risk_stmt = (
        select(DiseaseRiskRecord.risk_scores, DiseaseRiskRecord.overall_risk_score)
        .where(DiseaseRiskRecord.session_id == session_id)
        .order_by(DiseaseRiskRecord.timestamp.desc())
        .limit(1)
    )
    risk_result = await db.execute(risk_stmt)
    risk = risk_result.first()

    risk_scores = {}
    overall_risk = 0.0
    if risk:
        try:
            risk_scores = json.loads(risk[0]) if isinstance(risk[0], str) else (risk[0] or {})
        except (json.JSONDecodeError, TypeError):
            risk_scores = {}
        overall_risk = risk[1] or 0.0

    blink_stmt = (
        select(
            func.avg(EyeBlinkRecord.blink_rate).label("avg_blink_rate"),
            func.count(EyeBlinkRecord.id).label("total_frames"),
            func.sum(func.cast(EyeBlinkRecord.is_blink, Integer)).label("blink_count"),
        )
        .where(EyeBlinkRecord.session_id == session_id)
    )
    blink_result = await db.execute(blink_stmt)
    blink = blink_result.one()

    record_count = posture.record_count or 0
    good_count = posture.good_count or 0
    posture_quality = round((good_count / record_count * 100) if record_count > 0 else 0, 2)

    return {
        "session_id": session_id,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "ended_at": session.ended_at.isoformat() if session.ended_at else None,
        "duration_minutes": round(float(scores.total_duration or 0), 2),
        "scores": {
            "overall": round(float(scores.avg_overall or 0), 2),
            "posture": round(float(scores.avg_posture or 0), 2),
            "eye_blink": round(float(scores.avg_eye_blink or 0), 2),
            "disease_risk": round(float(scores.avg_disease_risk or 0), 2),
        },
        "posture": {
            "avg_neck_angle": round(float(posture.avg_neck or 0), 2),
            "avg_shoulder_angle": round(float(posture.avg_shoulder or 0), 2),
            "avg_spine_angle": round(float(posture.avg_spine or 0), 2),
            "good_posture_percent": posture_quality,
            "total_records": record_count,
        },
        "eye_blink": {
            "avg_blink_rate": round(float(blink.avg_blink_rate or 0), 2),
            "total_blinks": blink.blink_count or 0,
            "total_frames": blink.total_frames or 0,
        },
        "disease_risk": {
            "overall_risk": round(overall_risk, 2),
            "risks": risk_scores,
        },
    }


@router.get("")
async def compare_sessions(session_id_1: int, session_id_2: int, db: AsyncSession = Depends(get_session)):
    stats1 = await _get_session_stats(session_id_1, db)
    stats2 = await _get_session_stats(session_id_2, db)

    if not stats1:
        raise HTTPException(status_code=404, detail=f"Session {session_id_1} not found")
    if not stats2:
        raise HTTPException(status_code=404, detail=f"Session {session_id_2} not found")

    def calc_change(val1: float, val2: float, higher_is_better: bool = True) -> dict:
        diff = val2 - val1
        percent = round((diff / val1 * 100) if val1 != 0 else 0, 1)
        improved = (diff > 0 and higher_is_better) or (diff < 0 and not higher_is_better)
        return {
            "before": val1,
            "after": val2,
            "change": round(diff, 2),
            "percent_change": percent,
            "improved": improved,
        }

    comparison = {
        "session_1": stats1,
        "session_2": stats2,
        "comparison": {
            "overall_score": calc_change(
                stats1["scores"]["overall"], stats2["scores"]["overall"], higher_is_better=True
            ),
            "posture_score": calc_change(
                stats1["scores"]["posture"], stats2["scores"]["posture"], higher_is_better=True
            ),
            "eye_blink_score": calc_change(
                stats1["scores"]["eye_blink"], stats2["scores"]["eye_blink"], higher_is_better=True
            ),
            "disease_risk_score": calc_change(
                stats1["scores"]["disease_risk"], stats2["scores"]["disease_risk"], higher_is_better=True
            ),
            "neck_angle": calc_change(
                stats1["posture"]["avg_neck_angle"], stats2["posture"]["avg_neck_angle"], higher_is_better=False
            ),
            "shoulder_angle": calc_change(
                stats1["posture"]["avg_shoulder_angle"], stats2["posture"]["avg_shoulder_angle"], higher_is_better=False
            ),
            "spine_angle": calc_change(
                stats1["posture"]["avg_spine_angle"], stats2["posture"]["avg_spine_angle"], higher_is_better=False
            ),
            "blink_rate": calc_change(
                stats1["eye_blink"]["avg_blink_rate"], stats2["eye_blink"]["avg_blink_rate"], higher_is_better=False
            ),
            "risk_score": calc_change(
                stats1["disease_risk"]["overall_risk"], stats2["disease_risk"]["overall_risk"], higher_is_better=False
            ),
            "duration": calc_change(
                stats1["duration_minutes"], stats2["duration_minutes"], higher_is_better=False
            ),
        },
        "summary": {
            "improved_count": 0,
            "declined_count": 0,
            "unchanged_count": 0,
        },
    }

    for key, data in comparison["comparison"].items():
        if data["improved"]:
            comparison["summary"]["improved_count"] += 1
        elif data["change"] == 0:
            comparison["summary"]["unchanged_count"] += 1
        else:
            comparison["summary"]["declined_count"] += 1

    return comparison
