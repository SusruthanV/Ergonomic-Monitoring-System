import base64
import json
import time
import asyncio
import cv2
import numpy as np
import mediapipe as mp
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from models.posture_analyzer import PostureAnalyzer
from models.eye_blink_detector import EyeBlinkDetector
from models.disease_predictor import DiseasePredictor
from models.scorer import ErgonomicScorer
from database import async_session, UserSession, PostureRecord, EyeBlinkRecord, DiseaseRiskRecord, ScoreAggregate
from config import settings

router = APIRouter()

mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh

pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


class SessionState:
    def __init__(self):
        self.posture_analyzer = PostureAnalyzer()
        self.eye_blink_detector = EyeBlinkDetector()
        self.disease_predictor = DiseasePredictor()
        self.scorer = ErgonomicScorer()
        self.frame_count = 0
        self.db_session_id = None
        self.posture_history = []
        self.start_time = time.time()
        self.last_db_store_time = time.time()


active_sessions: dict[str, SessionState] = {}


def decode_frame(message_data: str) -> np.ndarray | None:
    try:
        if "," in message_data:
            message_data = message_data.split(",")[1]
        img_bytes = base64.b64decode(message_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception:
        return None


def encode_frame(frame: np.ndarray) -> str:
    _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return base64.b64encode(buffer).decode("utf-8")


async def store_records(session_id: int, state: SessionState, blink_info: dict | None, risk_info: tuple | None, scores: dict | None, posture_data: dict | None = None):
    async with async_session() as db_session:
        try:
            if posture_data:
                record = PostureRecord(
                    session_id=session_id,
                    neck_angle=posture_data.get("neck_angle", 0),
                    shoulder_angle=posture_data.get("shoulder_angle", 0),
                    spine_angle=posture_data.get("spine_angle", 0),
                    overall_posture_score=posture_data.get("overall_posture_score", 0),
                    is_good_posture=posture_data.get("is_good_posture", False),
                )
                db_session.add(record)

            if blink_info:
                record = EyeBlinkRecord(
                    session_id=session_id,
                    ear_value=blink_info.get("ear_value", 0),
                    is_blink=blink_info.get("is_blink", False),
                    blink_rate=blink_info.get("blink_rate_per_minute", 0),
                )
                db_session.add(record)

            if risk_info:
                risk_scores, overall_risk = risk_info
                record = DiseaseRiskRecord(
                    session_id=session_id,
                    risk_scores=json.dumps(risk_scores),
                    overall_risk_score=overall_risk,
                )
                db_session.add(record)

            if scores:
                duration = (time.time() - state.start_time) / 60.0
                record = ScoreAggregate(
                    session_id=session_id,
                    overall_score=scores.get("overall_score", 0),
                    posture_score=scores.get("posture_score", 0),
                    eye_blink_score=scores.get("eye_blink_score", 0),
                    disease_risk_score=scores.get("disease_risk_score", 0),
                    session_duration_minutes=round(duration, 2),
                )
                db_session.add(record)

            await db_session.commit()
        except Exception:
            await db_session.rollback()


@router.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    state = SessionState()
    session_key = f"session_{id(state)}"
    active_sessions[session_key] = state

    try:
        async with async_session() as db_session:
            user_session = UserSession()
            db_session.add(user_session)
            await db_session.commit()
            await db_session.refresh(user_session)
            state.db_session_id = user_session.id

        while True:
            raw_data = await asyncio.wait_for(websocket.receive_text(), timeout=120.0)
            message = json.loads(raw_data)

            if message.get("type") != "frame":
                continue

            frame_data = message.get("data", "")
            frame = decode_frame(frame_data)
            if frame is None:
                continue

            state.frame_count += 1
            process_this = (state.frame_count % settings.PROCESS_EVERY_N_FRAMES == 0)

            if not process_this:
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pose_results = pose.process(rgb_frame)
            face_results = face_mesh.process(rgb_frame)

            response = {
                "type": "analysis",
                "timestamp": time.time(),
                "posture": None,
                "eye_blink": None,
                "disease_risk": None,
                "scores": None,
            }

            posture_data = None
            blink_data = None
            if pose_results and pose_results.pose_landmarks:
                landmarks = pose_results.pose_landmarks.landmark
                posture_data = state.posture_analyzer.analyze_landmarks(landmarks)
                posture_data["overall_posture_score"] = state.scorer.score_posture(posture_data)
                response["posture"] = posture_data

                state.posture_history.append(posture_data)

            ear = None
            if face_results and face_results.multi_face_landmarks and len(face_results.multi_face_landmarks) > 0:
                face_landmarks = face_results.multi_face_landmarks[0].landmark
                h, w = frame.shape[:2]
                _, _, avg_ear = state.eye_blink_detector.detect_ear(face_landmarks, w, h)
                ear = avg_ear

            if ear is not None:
                current_time = time.time()
                blink_data = state.eye_blink_detector.process_frame(ear, current_time)
                response["eye_blink"] = blink_data
            elif ear is None and posture_data is not None:
                current_time = time.time()
                blink_data = state.eye_blink_detector.process_frame(0.3, current_time)
                response["eye_blink"] = blink_data

            if state.posture_history:
                risk_scores, overall_risk = state.disease_predictor.predict_risk(state.posture_history[-30:])
                risk_scores_dict = risk_scores if isinstance(risk_scores, dict) else {}
                response["disease_risk"] = {
                    **risk_scores_dict,
                    "overall_risk_score": overall_risk,
                    "recommendations": state.disease_predictor.get_recommendations(risk_scores_dict),
                }

            posture_score_val = posture_data.get("overall_posture_score", 0) if posture_data else 0
            eye_blink_score_val = state.scorer.score_eye_blink(blink_data) if blink_data else 50.0
            disease_risk_val = response["disease_risk"]["overall_risk_score"] if response.get("disease_risk") else 0
            disease_risk_score_val = state.scorer.score_disease_risk(disease_risk_val)

            scores = state.scorer.compute_overall(posture_score_val, eye_blink_score_val, disease_risk_score_val)
            response["scores"] = scores

            send_overlay = (state.frame_count % (settings.PROCESS_EVERY_N_FRAMES * 20) == 0)
            if send_overlay and pose_results and pose_results.pose_landmarks and posture_data:
                overlay_frame = frame.copy()
                overlay_frame = state.posture_analyzer.draw_pose_landmarks(
                    overlay_frame, pose_results.pose_landmarks.landmark, posture_data
                )
                overlay_base64 = encode_frame(overlay_frame)
                response["overlay_frame"] = f"data:image/jpeg;base64,{overlay_base64}"

            try:
                await websocket.send_json(response)
            except Exception:
                break

            current_time = time.time()
            if current_time - state.last_db_store_time >= 30.0:
                await store_records(
                    state.db_session_id, state, blink_data,
                    (risk_scores, overall_risk) if response.get("disease_risk") else None,
                    scores,
                    posture_data,
                )
                state.last_db_store_time = current_time

    except (asyncio.TimeoutError, WebSocketDisconnect, Exception):
        pass
    finally:
        if state.db_session_id is not None:
            try:
                current_time = time.time()
                blink_info = {
                    "ear_value": 0,
                    "is_blink": False,
                    "blink_rate_per_minute": state.eye_blink_detector.total_blinks / max((current_time - state.start_time) / 60.0, 0.1),
                }

                risk_scores_dict, overall_risk = state.disease_predictor.predict_risk(state.posture_history[-30:])
                risk_info = (risk_scores_dict, overall_risk) if risk_scores_dict else None

                posture_score_val = 0
                if state.posture_history:
                    posture_score_val = state.scorer.score_posture(state.posture_history[-1])
                eye_blink_score_val = state.scorer.score_eye_blink(blink_info)
                disease_risk_score_val = state.scorer.score_disease_risk(overall_risk)
                scores = state.scorer.compute_overall(posture_score_val, eye_blink_score_val, disease_risk_score_val)

                await store_records(
                    state.db_session_id, state, blink_info, risk_info, scores
                )

                async with async_session() as db_session:
                    result = await db_session.get(UserSession, state.db_session_id)
                    if result:
                        result.ended_at = time.time()
                        await db_session.commit()
            except Exception:
                pass

        active_sessions.pop(session_key, None)
