import math
import numpy as np
import cv2
from config import settings


class PostureAnalyzer:
    def __init__(self):
        self._landmark_indices = {
            "nose": 0,
            "left_eye": 5,
            "right_eye": 6,
            "left_ear": 7,
            "right_ear": 8,
            "left_shoulder": 11,
            "right_shoulder": 12,
            "left_hip": 23,
            "right_hip": 24,
        }

    def _get_landmark(self, landmarks, idx):
        if idx < len(landmarks):
            return landmarks[idx]
        return None

    def _calculate_angle(self, p1, p2, p3):
        a = np.array([p1.x, p1.y])
        b = np.array([p2.x, p2.y])
        c = np.array([p3.x, p3.y])
        ba = a - b
        bc = c - b
        dot = np.dot(ba, bc)
        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)
        if norm_ba == 0 or norm_bc == 0:
            return 0.0
        cos_angle = dot / (norm_ba * norm_bc)
        cos_angle = max(-1.0, min(1.0, cos_angle))
        angle = math.degrees(math.acos(cos_angle))
        return angle

    def _calculate_neck_angle(self, landmarks):
        left_ear = self._get_landmark(landmarks, self._landmark_indices["left_ear"])
        right_ear = self._get_landmark(landmarks, self._landmark_indices["right_ear"])
        left_shoulder = self._get_landmark(landmarks, self._landmark_indices["left_shoulder"])
        right_shoulder = self._get_landmark(landmarks, self._landmark_indices["right_shoulder"])
        nose = self._get_landmark(landmarks, self._landmark_indices["nose"])

        if not all([left_ear, right_ear, left_shoulder, right_shoulder, nose]):
            return 0.0, 0.0

        ear_mid_x = (left_ear.x + right_ear.x) / 2
        ear_mid_y = (left_ear.y + right_ear.y) / 2
        shoulder_mid_x = (left_shoulder.x + right_shoulder.x) / 2
        shoulder_mid_y = (left_shoulder.y + right_shoulder.y) / 2

        ear_shoulder_angle = math.degrees(
            math.atan2(abs(ear_mid_x - shoulder_mid_x), abs(ear_mid_y - shoulder_mid_y))
        )

        nose_ear_angle = math.degrees(
            math.atan2(abs(nose.x - ear_mid_x), abs(nose.y - ear_mid_y))
        )

        return ear_shoulder_angle, nose_ear_angle

    def _calculate_shoulder_angle(self, landmarks):
        left_shoulder = self._get_landmark(landmarks, self._landmark_indices["left_shoulder"])
        right_shoulder = self._get_landmark(landmarks, self._landmark_indices["right_shoulder"])

        if not all([left_shoulder, right_shoulder]):
            return 0.0

        dx = abs(left_shoulder.y - right_shoulder.y)
        dy = abs(left_shoulder.x - right_shoulder.x)
        angle = math.degrees(math.atan2(dx, dy))
        return angle

    def _calculate_spine_angle(self, landmarks):
        left_shoulder = self._get_landmark(landmarks, self._landmark_indices["left_shoulder"])
        right_shoulder = self._get_landmark(landmarks, self._landmark_indices["right_shoulder"])
        left_hip = self._get_landmark(landmarks, self._landmark_indices["left_hip"])
        right_hip = self._get_landmark(landmarks, self._landmark_indices["right_hip"])

        if not all([left_shoulder, right_shoulder, left_hip, right_hip]):
            return 0.0

        shoulder_mid_x = (left_shoulder.x + right_shoulder.x) / 2
        shoulder_mid_y = (left_shoulder.y + right_shoulder.y) / 2
        hip_mid_x = (left_hip.x + right_hip.x) / 2
        hip_mid_y = (left_hip.y + right_hip.y) / 2

        dx = abs(shoulder_mid_x - hip_mid_x)
        dy = abs(shoulder_mid_y - hip_mid_y)
        angle = math.degrees(math.atan2(dx, dy))
        return angle

    def analyze_landmarks(self, landmarks) -> dict:
        neck_angle, _ = self._calculate_neck_angle(landmarks)
        shoulder_angle = self._calculate_shoulder_angle(landmarks)
        spine_angle = self._calculate_spine_angle(landmarks)

        is_neck_ok = neck_angle <= settings.NECK_ANGLE_THRESHOLD
        is_shoulder_ok = shoulder_angle <= settings.SHOULDER_ANGLE_THRESHOLD
        is_spine_ok = spine_angle <= settings.SPINE_ANGLE_THRESHOLD

        is_good_posture = is_neck_ok and is_shoulder_ok and is_spine_ok

        neck_score = max(0, 100 - (neck_angle / settings.NECK_ANGLE_THRESHOLD) * 100) if neck_angle > 0 else 100
        shoulder_score = max(0, 100 - (shoulder_angle / settings.SHOULDER_ANGLE_THRESHOLD) * 100) if shoulder_angle > 0 else 100
        spine_score = max(0, 100 - (spine_angle / settings.SPINE_ANGLE_THRESHOLD) * 100) if spine_angle > 0 else 100

        feedback = self.get_posture_feedback({
            "neck_angle": neck_angle,
            "shoulder_angle": shoulder_angle,
            "spine_angle": spine_angle,
            "is_neck_ok": is_neck_ok,
            "is_shoulder_ok": is_shoulder_ok,
            "is_spine_ok": is_spine_ok,
        })

        return {
            "neck_angle": round(neck_angle, 2),
            "shoulder_angle": round(shoulder_angle, 2),
            "spine_angle": round(spine_angle, 2),
            "neck_score": round(neck_score, 2),
            "shoulder_score": round(shoulder_score, 2),
            "spine_score": round(spine_score, 2),
            "is_good_posture": is_good_posture,
            "is_neck_ok": is_neck_ok,
            "is_shoulder_ok": is_shoulder_ok,
            "is_spine_ok": is_spine_ok,
            "feedback": feedback,
        }

    def draw_pose_landmarks(self, frame, landmarks, posture_data) -> np.ndarray:
        if landmarks is None:
            return frame

        is_good = posture_data.get("is_good_posture", False)
        is_neck_ok = posture_data.get("is_neck_ok", True)
        is_shoulder_ok = posture_data.get("is_shoulder_ok", True)
        is_spine_ok = posture_data.get("is_spine_ok", True)

        def get_color(ok):
            return (0, 255, 0) if ok else (0, 0, 255)

        def get_warning_color(ok):
            if ok:
                return (0, 255, 0)
            return (0, 255, 255)

        h, w = frame.shape[:2]

        def lm_point(idx):
            if idx < len(landmarks):
                return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))
            return None

        nose = lm_point(self._landmark_indices["nose"])
        left_ear = lm_point(self._landmark_indices["left_ear"])
        right_ear = lm_point(self._landmark_indices["right_ear"])
        left_shoulder = lm_point(self._landmark_indices["left_shoulder"])
        right_shoulder = lm_point(self._landmark_indices["right_shoulder"])
        left_hip = lm_point(self._landmark_indices["left_hip"])
        right_hip = lm_point(self._landmark_indices["right_hip"])

        connections = [
            (left_ear, left_shoulder),
            (right_ear, right_shoulder),
            (left_shoulder, right_shoulder),
            (left_shoulder, left_hip),
            (right_shoulder, right_hip),
            (left_hip, right_hip),
            (nose, left_ear),
            (nose, right_ear),
        ]

        for i, (p1, p2) in enumerate(connections):
            if p1 and p2:
                if i == 0 or i == 1:
                    color = get_warning_color(is_neck_ok)
                elif i >= 3 and i <= 4:
                    color = get_warning_color(is_spine_ok)
                elif i == 2:
                    color = get_warning_color(is_shoulder_ok)
                else:
                    color = get_color(is_good)
                cv2.line(frame, p1, p2, color, 2)
                cv2.circle(frame, p1, 4, color, -1)
                cv2.circle(frame, p2, 4, color, -1)

        if left_shoulder and right_shoulder:
            mid_s = ((left_shoulder[0] + right_shoulder[0]) // 2, (left_shoulder[1] + right_shoulder[1]) // 2)
            if left_hip and right_hip:
                mid_h = ((left_hip[0] + right_hip[0]) // 2, (left_hip[1] + right_hip[1]) // 2)
                cv2.line(frame, mid_s, mid_h, get_warning_color(is_spine_ok), 2)

        if left_ear and right_ear and left_shoulder and right_shoulder:
            mid_ear = ((left_ear[0] + right_ear[0]) // 2, (left_ear[1] + right_ear[1]) // 2)
            mid_shoulder = ((left_shoulder[0] + right_shoulder[0]) // 2, (left_shoulder[1] + right_shoulder[1]) // 2)
            cv2.line(frame, mid_ear, mid_shoulder, get_warning_color(is_neck_ok), 2)

        angle_texts = [
            (f"Neck: {posture_data.get('neck_angle', 0):.1f}deg", (10, 30), get_warning_color(is_neck_ok)),
            (f"Shoulder: {posture_data.get('shoulder_angle', 0):.1f}deg", (10, 55), get_warning_color(is_shoulder_ok)),
            (f"Spine: {posture_data.get('spine_angle', 0):.1f}deg", (10, 80), get_warning_color(is_spine_ok)),
        ]
        for text, pos, color in angle_texts:
            cv2.putText(frame, text, pos, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        status_text = "GOOD POSTURE" if is_good else "POOR POSTURE"
        status_color = (0, 255, 0) if is_good else (0, 0, 255)
        cv2.putText(frame, status_text, (w - 200, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)

        feedback = posture_data.get("feedback", "")
        if feedback:
            lines = self._wrap_text(feedback, 50)
            y_offset = h - 60
            for line in lines:
                cv2.putText(frame, line, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
                y_offset += 20

        return frame

    def _wrap_text(self, text, max_chars):
        words = text.split()
        lines = []
        current_line = ""
        for word in words:
            if len(current_line) + len(word) + 1 <= max_chars:
                current_line = current_line + " " + word if current_line else word
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
        return lines

    def get_posture_feedback(self, posture_data: dict) -> str:
        feedback_parts = []

        if posture_data["is_neck_ok"] and posture_data["is_shoulder_ok"] and posture_data["is_spine_ok"]:
            return "Good posture! Keep it up."

        if not posture_data["is_neck_ok"]:
            neck_angle = posture_data["neck_angle"]
            if neck_angle > 40:
                feedback_parts.append("Your neck is tilted too far forward. Try to align your ears with your shoulders.")
            else:
                feedback_parts.append("Tilt your head slightly back to align with your spine.")

        if not posture_data["is_shoulder_ok"]:
            shoulder_angle = posture_data["shoulder_angle"]
            if shoulder_angle > 35:
                feedback_parts.append("Your shoulders are very uneven. Relax and level them.")
            else:
                feedback_parts.append("Level your shoulders by relaxing the raised side.")

        if not posture_data["is_spine_ok"]:
            spine_angle = posture_data["spine_angle"]
            if spine_angle > 25:
                feedback_parts.append("Your spine is significantly curved. Sit up straight.")
            else:
                feedback_parts.append("Straighten your back and engage your core.")

        return " ".join(feedback_parts)
