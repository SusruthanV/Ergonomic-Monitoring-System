import json
from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session, ScoreAggregate, DiseaseRiskRecord, PostureRecord, EyeBlinkRecord
from models.exercise_recommender import ExerciseRecommender

router = APIRouter(prefix="/api/exercises")
recommender = ExerciseRecommender()


@router.get("/recommendations")
async def get_recommendations(db: AsyncSession = Depends(get_session)):
    latest_score = await db.execute(
        select(ScoreAggregate)
        .order_by(ScoreAggregate.timestamp.desc())
        .limit(1)
    )
    latest_score = latest_score.scalar_one_or_none()

    latest_risk = await db.execute(
        select(DiseaseRiskRecord)
        .order_by(DiseaseRiskRecord.timestamp.desc())
        .limit(1)
    )
    latest_risk = latest_risk.scalar_one_or_none()

    latest_posture = await db.execute(
        select(PostureRecord)
        .order_by(PostureRecord.timestamp.desc())
        .limit(1)
    )
    latest_posture = latest_posture.scalar_one_or_none()

    latest_blink = await db.execute(
        select(EyeBlinkRecord)
        .order_by(EyeBlinkRecord.timestamp.desc())
        .limit(1)
    )
    latest_blink = latest_blink.scalar_one_or_none()

    risk_scores = {}
    if latest_risk and latest_risk.risk_scores:
        try:
            risk_scores = json.loads(latest_risk.risk_scores) if isinstance(latest_risk.risk_scores, str) else latest_risk.risk_scores
        except (json.JSONDecodeError, TypeError):
            risk_scores = {}
    else:
        risk_scores = {
            "cervical_spondylosis": 0,
            "carpal_tunnel_syndrome": 0,
            "text_neck": 0,
            "scoliosis_risk": 0,
            "lower_back_pain": 0,
        }

    posture_score = latest_score.posture_score if latest_score else 100
    blink_rate = latest_blink.blink_rate if latest_blink else 17.0

    exercises = recommender.get_recommendations(
        risk_scores=risk_scores,
        posture_score=posture_score,
        blink_rate=blink_rate,
    )

    return {
        "exercises": exercises,
        "based_on": {
            "risk_scores": risk_scores,
            "posture_score": posture_score,
            "blink_rate": blink_rate,
        },
        "total_count": len(exercises),
    }


@router.get("/all")
async def get_all_exercises(
    category: str | None = Query(None, description="Filter by category")
):
    if category:
        exercises = recommender.get_exercises_by_category(category)
    else:
        exercises = recommender.get_all_exercises()

    return {
        "exercises": exercises,
        "categories": recommender.get_categories(),
        "total_count": len(exercises),
    }


@router.get("/{exercise_id}")
async def get_exercise(exercise_id: str):
    exercise = recommender.get_exercise_by_id(exercise_id)
    if not exercise:
        return {"error": "Exercise not found"}, 404
    return {"exercise": exercise}
