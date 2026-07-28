import math
from config import settings


class DiseasePredictor:
    def __init__(self):
        self.disease_names = [
            "cervical_spondylosis",
            "carpal_tunnel_syndrome",
            "text_neck",
            "scoliosis_risk",
            "lower_back_pain",
        ]

    def predict_risk(self, posture_history: list[dict]) -> dict:
        if not posture_history:
            empty = {d: 0.0 for d in self.disease_names}
            return empty, 0.0

        total_records = len(posture_history)
        bad_neck_count = sum(1 for p in posture_history if not p.get("is_neck_ok", True))
        bad_shoulder_count = sum(1 for p in posture_history if not p.get("is_shoulder_ok", True))
        bad_spine_count = sum(1 for p in posture_history if not p.get("is_spine_ok", True))

        avg_neck = sum(p.get("neck_angle", 0) for p in posture_history) / total_records
        avg_shoulder = sum(p.get("shoulder_angle", 0) for p in posture_history) / total_records
        avg_spine = sum(p.get("spine_angle", 0) for p in posture_history) / total_records

        max_neck = max(p.get("neck_angle", 0) for p in posture_history)
        max_shoulder = max(p.get("shoulder_angle", 0) for p in posture_history)
        max_spine = max(p.get("spine_angle", 0) for p in posture_history)

        neck_freq_ratio = bad_neck_count / total_records
        shoulder_freq_ratio = bad_shoulder_count / total_records
        spine_freq_ratio = bad_spine_count / total_records

        cervical_spondylosis = self._compute_cervical_spondylosis(avg_neck, max_neck, neck_freq_ratio)
        carpal_tunnel = self._compute_carpal_tunnel(avg_shoulder, max_shoulder, shoulder_freq_ratio)
        text_neck = self._compute_text_neck(avg_neck, max_neck, neck_freq_ratio)
        scoliosis = self._compute_scoliosis(avg_shoulder, avg_spine, max_shoulder, max_spine, shoulder_freq_ratio, spine_freq_ratio)
        lower_back = self._compute_lower_back_pain(avg_spine, max_spine, spine_freq_ratio)

        risk_scores = {
            "cervical_spondylosis": round(cervical_spondylosis, 2),
            "carpal_tunnel_syndrome": round(carpal_tunnel, 2),
            "text_neck": round(text_neck, 2),
            "scoliosis_risk": round(scoliosis, 2),
            "lower_back_pain": round(lower_back, 2),
        }

        overall_risk_score = round(
            cervical_spondylosis * 0.25
            + carpal_tunnel * 0.15
            + text_neck * 0.25
            + scoliosis * 0.15
            + lower_back * 0.20,
            2,
        )

        return risk_scores, overall_risk_score

    def _compute_cervical_spondylosis(self, avg_neck, max_neck, freq_ratio):
        angle_risk = min(100, (avg_neck / settings.NECK_ANGLE_THRESHOLD) * 50)
        max_risk = min(30, (max_neck / settings.NECK_ANGLE_THRESHOLD) * 15)
        freq_risk = freq_ratio * 20
        return min(100, angle_risk + max_risk + freq_risk)

    def _compute_carpal_tunnel(self, avg_shoulder, max_shoulder, freq_ratio):
        shoulder_risk = min(60, (avg_shoulder / settings.SHOULDER_ANGLE_THRESHOLD) * 30)
        max_shoulder_risk = min(20, (max_shoulder / settings.SHOULDER_ANGLE_THRESHOLD) * 10)
        freq_risk = freq_ratio * 20
        return min(100, shoulder_risk + max_shoulder_risk + freq_risk)

    def _compute_text_neck(self, avg_neck, max_neck, freq_ratio):
        forward_risk = min(70, (avg_neck / settings.NECK_ANGLE_THRESHOLD) * 50)
        max_risk = min(15, (max_neck / settings.NECK_ANGLE_THRESHOLD) * 10)
        freq_risk = freq_ratio * 15
        return min(100, forward_risk + max_risk + freq_risk)

    def _compute_scoliosis(self, avg_shoulder, avg_spine, max_shoulder, max_spine, shoulder_freq, spine_freq):
        shoulder_asym = min(40, (avg_shoulder / settings.SHOULDER_ANGLE_THRESHOLD) * 20)
        spine_asym = min(40, (avg_spine / settings.SPINE_ANGLE_THRESHOLD) * 20)
        freq_risk = (shoulder_freq + spine_freq) / 2 * 20
        return min(100, shoulder_asym + spine_asym + freq_risk)

    def _compute_lower_back_pain(self, avg_spine, max_spine, freq_ratio):
        spine_risk = min(60, (avg_spine / settings.SPINE_ANGLE_THRESHOLD) * 40)
        max_risk = min(20, (max_spine / settings.SPINE_ANGLE_THRESHOLD) * 10)
        freq_risk = freq_ratio * 20
        return min(100, spine_risk + max_risk + freq_risk)

    def get_recommendations(self, risk_scores: dict) -> list[str]:
        recommendations = []

        if risk_scores.get("cervical_spondylosis", 0) > 30:
            recommendations.append(
                "Cervical Spondylosis Risk: Take frequent breaks to stretch your neck. "
                "Adjust your monitor height so the top of the screen is at eye level."
            )
        if risk_scores.get("carpal_tunnel_syndrome", 0) > 30:
            recommendations.append(
                "Carpal Tunnel Risk: Ensure your wrists are straight while typing. "
                "Consider an ergonomic keyboard and take hand stretches every 30 minutes."
            )
        if risk_scores.get("text_neck", 0) > 30:
            recommendations.append(
                "Text Neck Risk: Keep your phone at eye level when using it. "
                "Avoid looking down for extended periods."
            )
        if risk_scores.get("scoliosis_risk", 0) > 30:
            recommendations.append(
                "Scoliosis Risk: Practice symmetric sitting posture. "
                "Consider core strengthening exercises to support your spine."
            )
        if risk_scores.get("lower_back_pain", 0) > 30:
            recommendations.append(
                "Lower Back Pain Risk: Use lumbar support while sitting. "
                "Stand up and walk for 5 minutes every hour."
            )

        if not recommendations:
            recommendations.append("Your posture looks good! Continue maintaining healthy ergonomic habits.")

        return recommendations
