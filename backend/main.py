import sys
import os
import json
from contextlib import asynccontextmanager
from sqlalchemy import select, func, Integer

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_session, UserSession, PostureRecord, EyeBlinkRecord, DiseaseRiskRecord, ScoreAggregate
from routes import analysis_router, history_router, dashboard_router, auth_router, achievements_router, reports_router, exercises_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Ergonomic Monitoring System",
    description="Real-time ergonomic posture and eye blink analysis backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(history_router)
app.include_router(dashboard_router)
app.include_router(achievements_router)
app.include_router(reports_router)
app.include_router(exercises_router)


@app.get("/api/compare")
async def compare_sessions(session_id_1: int, session_id_2: int, db: AsyncSession = Depends(get_session)):
    async def get_stats(sid: int):
        session = await db.get(UserSession, sid)
        if not session:
            return None

        score_stmt = select(
            func.avg(ScoreAggregate.overall_score),
            func.avg(ScoreAggregate.posture_score),
            func.avg(ScoreAggregate.eye_blink_score),
            func.avg(ScoreAggregate.disease_risk_score),
            func.sum(ScoreAggregate.session_duration_minutes),
        ).where(ScoreAggregate.session_id == sid)
        scores = (await db.execute(score_stmt)).one()

        posture_stmt = select(
            func.avg(PostureRecord.neck_angle),
            func.avg(PostureRecord.shoulder_angle),
            func.avg(PostureRecord.spine_angle),
            func.count(PostureRecord.id),
            func.sum(func.cast(PostureRecord.is_good_posture, Integer)),
        ).where(PostureRecord.session_id == sid)
        posture = (await db.execute(posture_stmt)).one()

        risk_row = (await db.execute(
            select(DiseaseRiskRecord.risk_scores, DiseaseRiskRecord.overall_risk_score)
            .where(DiseaseRiskRecord.session_id == sid)
            .order_by(DiseaseRiskRecord.timestamp.desc()).limit(1)
        )).first()

        risk_scores, overall_risk = {}, 0.0
        if risk_row:
            try:
                risk_scores = json.loads(risk_row[0]) if isinstance(risk_row[0], str) else (risk_row[0] or {})
            except Exception:
                risk_scores = {}
            overall_risk = risk_row[1] or 0.0

        blink = (await db.execute(
            select(
                func.avg(EyeBlinkRecord.blink_rate),
                func.count(EyeBlinkRecord.id),
                func.sum(func.cast(EyeBlinkRecord.is_blink, Integer)),
            ).where(EyeBlinkRecord.session_id == sid)
        )).one()

        rc = posture[3] or 0
        gc = posture[4] or 0

        return {
            "session_id": sid,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "ended_at": session.ended_at.isoformat() if session.ended_at else None,
            "duration_minutes": round(float(scores[4] or 0), 2),
            "scores": {
                "overall": round(float(scores[0] or 0), 2),
                "posture": round(float(scores[1] or 0), 2),
                "eye_blink": round(float(scores[2] or 0), 2),
                "disease_risk": round(float(scores[3] or 0), 2),
            },
            "posture": {
                "avg_neck_angle": round(float(posture[0] or 0), 2),
                "avg_shoulder_angle": round(float(posture[1] or 0), 2),
                "avg_spine_angle": round(float(posture[2] or 0), 2),
                "good_posture_percent": round((gc / rc * 100) if rc > 0 else 0, 2),
                "total_records": rc,
            },
            "eye_blink": {
                "avg_blink_rate": round(float(blink[0] or 0), 2),
                "total_blinks": blink[2] or 0,
                "total_frames": blink[1] or 0,
            },
            "disease_risk": {
                "overall_risk": round(overall_risk, 2),
                "risks": risk_scores,
            },
        }

    stats1 = await get_stats(session_id_1)
    stats2 = await get_stats(session_id_2)

    if not stats1:
        raise HTTPException(status_code=404, detail=f"Session {session_id_1} not found")
    if not stats2:
        raise HTTPException(status_code=404, detail=f"Session {session_id_2} not found")

    def delta(v1, v2, higher_better=True):
        d = v2 - v1
        pct = round((d / v1 * 100) if v1 != 0 else 0, 1)
        improved = (d > 0 and higher_better) or (d < 0 and not higher_better)
        return {"before": v1, "after": v2, "change": round(d, 2), "percent_change": pct, "improved": improved}

    comp = {
        "overall_score": delta(stats1["scores"]["overall"], stats2["scores"]["overall"]),
        "posture_score": delta(stats1["scores"]["posture"], stats2["scores"]["posture"]),
        "eye_blink_score": delta(stats1["scores"]["eye_blink"], stats2["scores"]["eye_blink"]),
        "disease_risk_score": delta(stats1["scores"]["disease_risk"], stats2["scores"]["disease_risk"]),
        "neck_angle": delta(stats1["posture"]["avg_neck_angle"], stats2["posture"]["avg_neck_angle"], False),
        "shoulder_angle": delta(stats1["posture"]["avg_shoulder_angle"], stats2["posture"]["avg_shoulder_angle"], False),
        "spine_angle": delta(stats1["posture"]["avg_spine_angle"], stats2["posture"]["avg_spine_angle"], False),
        "blink_rate": delta(stats1["eye_blink"]["avg_blink_rate"], stats2["eye_blink"]["avg_blink_rate"], False),
        "risk_score": delta(stats1["disease_risk"]["overall_risk"], stats2["disease_risk"]["overall_risk"], False),
        "duration": delta(stats1["duration_minutes"], stats2["duration_minutes"], False),
    }

    improved = sum(1 for v in comp.values() if v["improved"])
    declined = sum(1 for v in comp.values() if v["change"] != 0 and not v["improved"])
    unchanged = sum(1 for v in comp.values() if v["change"] == 0)

    return {
        "session_1": stats1,
        "session_2": stats2,
        "comparison": comp,
        "summary": {"improved_count": improved, "declined_count": declined, "unchanged_count": unchanged},
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ergonomic-monitoring-system",
        "version": "1.0.0",
    }


static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
