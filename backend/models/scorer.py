from config import settings


class ErgonomicScorer:
    def score_posture(self, posture_data: dict) -> float:
        neck_angle = posture_data.get("neck_angle", 0)
        shoulder_angle = posture_data.get("shoulder_angle", 0)
        spine_angle = posture_data.get("spine_angle", 0)

        neck_score = max(0, 100 - (neck_angle / settings.NECK_ANGLE_THRESHOLD) * 100)
        shoulder_score = max(0, 100 - (shoulder_angle / settings.SHOULDER_ANGLE_THRESHOLD) * 100)
        spine_score = max(0, 100 - (spine_angle / settings.SPINE_ANGLE_THRESHOLD) * 100)

        neck_score = min(100, neck_score)
        shoulder_score = min(100, shoulder_score)
        spine_score = min(100, spine_score)

        overall = neck_score * 0.40 + shoulder_score * 0.30 + spine_score * 0.30
        return round(overall, 2)

    def score_eye_blink(self, blink_data: dict) -> float:
        blink_rate = blink_data.get("blink_rate_per_minute", 0)

        if blink_rate == 0:
            return 50.0

        ideal_min = 15
        ideal_max = 20

        if ideal_min <= blink_rate <= ideal_max:
            return 100.0

        if blink_rate < ideal_min:
            deficit = ideal_min - blink_rate
            score = max(0, 100 - (deficit / ideal_min) * 100)
        else:
            excess = blink_rate - ideal_max
            score = max(0, 100 - (excess / 20) * 100)

        return round(score, 2)

    def score_disease_risk(self, risk_data: dict) -> float:
        if isinstance(risk_data, dict) and "overall_risk_score" in risk_data:
            overall_risk = risk_data["overall_risk_score"]
        elif isinstance(risk_data, (int, float)):
            overall_risk = risk_data
        else:
            return 100.0

        score = max(0, 100 - overall_risk)
        return round(score, 2)

    def compute_overall(self, posture_score: float, eye_blink_score: float, disease_risk_score: float) -> dict:
        overall_score = (
            posture_score * 0.40
            + eye_blink_score * 0.25
            + disease_risk_score * 0.35
        )
        overall_score = round(overall_score, 2)

        grade = self.get_grade(overall_score)

        recommendations = []
        if posture_score < 70:
            recommendations.append("Improve your posture: keep your back straight and shoulders level.")
        if eye_blink_score < 70:
            rate_issue = "too low" if eye_blink_score < 50 else "slightly off"
            recommendations.append(f"Your blink rate is {rate_issue}. Take conscious breaks to blink and rest your eyes.")
        if disease_risk_score < 70:
            recommendations.append("Your disease risk scores are elevated. Review the recommendations for each risk area.")

        if not recommendations:
            recommendations.append("Excellent ergonomic health! Keep up your good habits.")

        return {
            "overall_score": overall_score,
            "posture_score": posture_score,
            "eye_blink_score": eye_blink_score,
            "disease_risk_score": disease_risk_score,
            "grade": grade,
            "recommendations": recommendations,
            "breakdown": {
                "posture_weight": 0.40,
                "eye_blink_weight": 0.25,
                "disease_risk_weight": 0.35,
                "weighted_posture": round(posture_score * 0.40, 2),
                "weighted_eye_blink": round(eye_blink_score * 0.25, 2),
                "weighted_disease_risk": round(disease_risk_score * 0.35, 2),
            },
        }

    def get_grade(self, score: float) -> str:
        if score >= 97:
            return "A+"
        elif score >= 93:
            return "A"
        elif score >= 90:
            return "A-"
        elif score >= 87:
            return "B+"
        elif score >= 83:
            return "B"
        elif score >= 80:
            return "B-"
        elif score >= 77:
            return "C+"
        elif score >= 73:
            return "C"
        elif score >= 70:
            return "C-"
        elif score >= 60:
            return "D"
        else:
            return "F"
