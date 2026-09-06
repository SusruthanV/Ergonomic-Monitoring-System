import time
import math
from collections import deque

from config import settings


LEFT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]

RATE_WINDOW_SECONDS = 60


class EyeBlinkDetector:
    def __init__(self):
        self.total_blinks = 0
        self.last_blink_time = None
        self.consecutive_frames_below_threshold = 0
        self.ear_values_history = deque(maxlen=3)
        self._blink_timestamps = deque(maxlen=300)
        self._in_blink = False

    def detect_ear(self, landmarks, frame_width, frame_height) -> tuple:
        if landmarks is None or len(landmarks) == 0:
            return 0.0, 0.0, 0.0

        def get_point(idx):
            if idx < len(landmarks):
                return landmarks[idx]
            return None

        def eye_aspect_ratio(eye_indices):
            points = [get_point(idx) for idx in eye_indices]
            if any(p is None for p in points):
                return 0.0

            p1, p2, p3, p4, p5, p6 = points

            def dist(a, b):
                return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

            vertical1 = dist(p2, p6)
            vertical2 = dist(p3, p5)
            horizontal = dist(p1, p4)

            if horizontal == 0:
                return 0.0

            ear = (vertical1 + vertical2) / (2.0 * horizontal)
            return ear

        left_ear = eye_aspect_ratio(LEFT_EYE_LANDMARKS)
        right_ear = eye_aspect_ratio(RIGHT_EYE_LANDMARKS)
        avg_ear = (left_ear + right_ear) / 2.0

        return left_ear, right_ear, avg_ear

    def _cleanup_old_timestamps(self, current_time: float):
        cutoff = current_time - RATE_WINDOW_SECONDS
        while self._blink_timestamps and self._blink_timestamps[0] < cutoff:
            self._blink_timestamps.popleft()

    def process_frame(self, ear: float, current_time: float) -> dict:
        self.ear_values_history.append(ear)

        smoothed_ear = sum(self.ear_values_history) / len(self.ear_values_history) if self.ear_values_history else ear

        below_threshold = smoothed_ear < settings.BLINK_THRESHOLD

        is_blink = False
        if below_threshold:
            self.consecutive_frames_below_threshold += 1
        else:
            if self.consecutive_frames_below_threshold >= settings.BLINK_CONSEC_FRAMES:
                is_blink = True
                self.total_blinks += 1
                self._blink_timestamps.append(current_time)
                self.last_blink_time = current_time
            self.consecutive_frames_below_threshold = 0

        self._cleanup_old_timestamps(current_time)

        blink_rate_per_minute = 0.0
        if len(self._blink_timestamps) >= 2:
            time_span = self._blink_timestamps[-1] - self._blink_timestamps[0]
            if time_span > 0:
                blink_rate_per_minute = (len(self._blink_timestamps) - 1) / (time_span / 60.0)
        elif len(self._blink_timestamps) == 1:
            elapsed = current_time - self._blink_timestamps[0]
            if elapsed > 0:
                blink_rate_per_minute = 1.0 / (elapsed / 60.0)

        duration_since_last_blink = 0.0
        if self.last_blink_time is not None:
            duration_since_last_blink = current_time - self.last_blink_time

        return {
            "is_blink": is_blink,
            "ear_value": round(smoothed_ear, 4),
            "blink_count": self.total_blinks,
            "blink_rate_per_minute": round(blink_rate_per_minute, 2),
            "total_blinks": self.total_blinks,
            "duration_since_last_blink": round(duration_since_last_blink, 2),
        }

    def get_default_data(self) -> dict:
        return {
            "is_blink": False,
            "ear_value": 0.0,
            "blink_count": self.total_blinks,
            "blink_rate_per_minute": 0.0,
            "total_blinks": self.total_blinks,
            "duration_since_last_blink": 0.0,
        }
