from dataclasses import dataclass, field


@dataclass
class ExerciseStep:
    instruction: str
    duration_seconds: int
    tip: str = ""


@dataclass
class Exercise:
    id: str
    name: str
    category: str
    difficulty: str
    duration_seconds: int
    description: str
    benefits: list[str]
    steps: list[ExerciseStep]
    target_conditions: list[str]
    muscle_groups: list[str]
    video_url: str = ""
    video_title: str = ""
    equipment_needed: str = "None"
    calories_estimate: float = 0.0


EXERCISE_DATABASE: list[Exercise] = [
    # === NECK EXERCISES ===
    Exercise(
        id="neck_stretches",
        name="Neck Tilts & Stretches",
        category="neck",
        difficulty="easy",
        duration_seconds=180,
        description="Gentle neck stretches to relieve tension and improve cervical mobility.",
        benefits=[
            "Reduces neck stiffness",
            "Improves cervical range of motion",
            "Relieves tension headaches",
            "Prevents text neck",
        ],
        steps=[
            ExerciseStep("Slowly tilt your head to the right, bringing your ear toward your shoulder. Hold for 15 seconds.", 15, "Keep shoulders relaxed and down."),
            ExerciseStep("Return to center, then tilt to the left side. Hold for 15 seconds.", 15, "Breathe deeply and evenly."),
            ExerciseStep("Gently turn your head to the right, looking over your shoulder. Hold for 15 seconds.", 15, "Keep your chin parallel to the floor."),
            ExerciseStep("Turn your head to the left and hold for 15 seconds.", 15, "Avoid rolling your neck in circles."),
            ExerciseStep("Tuck your chin toward your chest and hold for 15 seconds.", 15, "Feel the stretch along the back of your neck."),
            ExerciseStep("Gently tilt your head backward, looking up at the ceiling. Hold for 15 seconds.", 15, "Don't overextend - keep it comfortable."),
            ExerciseStep("Repeat the full cycle one more time.", 30, "Move slowly and deliberately."),
        ],
        target_conditions=["cervical_spondylosis", "text_neck"],
        muscle_groups=["neck", "upper_trapezius"],
        video_url="https://www.youtube.com/embed/PIanpQx2_RA",
        video_title="5 Minute Neck Stretches for Desk Workers",
        calories_estimate=5.0,
    ),
    Exercise(
        id="chin_tucks",
        name="Chin Tucks",
        category="neck",
        difficulty="easy",
        duration_seconds=120,
        description="Strengthen deep neck flexors and correct forward head posture.",
        benefits=[
            "Corrects forward head posture",
            "Strengthens deep neck flexor muscles",
            "Reduces neck pain",
            "Improves head-on-neck alignment",
        ],
        steps=[
            ExerciseStep("Sit upright with shoulders back. Look straight ahead.", 10, "Keep your spine neutral."),
            ExerciseStep("Without tilting your head, gently draw your chin straight back as if making a double chin. Hold for 5 seconds.", 5, "Imagine a string pulling the crown of your head upward."),
            ExerciseStep("Release and return to starting position.", 5, "Don't jut your chin forward when releasing."),
            ExerciseStep("Repeat 10 times at a slow, controlled pace.", 50, "Focus on the movement coming from the base of your skull."),
            ExerciseStep("Rest for 10 seconds, then do one more set of 10.", 40, "You should feel the muscles at the front of your neck working."),
        ],
        target_conditions=["text_neck", "cervical_spondylosis"],
        muscle_groups=["deep_neck_flexors"],
        video_url="https://www.youtube.com/embed/VBMmpgD2tGw",
        video_title="How to do Chin Tucks Correctly",
        calories_estimate=4.0,
    ),
    Exercise(
        id="shoulder_rolls",
        name="Shoulder Rolls",
        category="shoulder",
        difficulty="easy",
        duration_seconds=120,
        description="Release shoulder tension and improve shoulder girdle mobility.",
        benefits=[
            "Relieves shoulder tension",
            "Improves shoulder mobility",
            "Reduces upper back tightness",
            "Promotes better posture",
        ],
        steps=[
            ExerciseStep("Stand or sit tall. Relax your arms at your sides.", 5, "Keep your spine elongated."),
            ExerciseStep("Roll your shoulders forward in circular motion for 30 seconds.", 30, "Make the circles as large as comfortable."),
            ExerciseStep("Roll your shoulders backward for 30 seconds.", 30, "Focus on squeezing your shoulder blades together."),
            ExerciseStep("Shrug your shoulders up toward your ears, hold 3 seconds, then release. Repeat 10 times.", 30, "Exhale as you shrug, inhale as you release."),
            ExerciseStep("Relax and shake out your arms gently.", 15, "Let any remaining tension melt away."),
        ],
        target_conditions=["carpal_tunnel_syndrome", "scoliosis_risk"],
        muscle_groups=["shoulders", "upper_back"],
        video_url="https://www.youtube.com/embed/IKJZL4hvppw",
        video_title="Shoulder Rolls Exercise",
        calories_estimate=4.0,
    ),
    Exercise(
        id="chest_opener",
        name="Chest Opener Stretch",
        category="shoulder",
        difficulty="easy",
        duration_seconds=150,
        description="Open up the chest and counteract rounded shoulder posture from desk work.",
        benefits=[
            "Stretches pectoral muscles",
            "Counteracts rounded shoulders",
            "Improves breathing capacity",
            "Relieves upper back strain",
        ],
        steps=[
            ExerciseStep("Clasp your hands behind your back with arms straight.", 5, "If you can't clasp hands, hold a towel between them."),
            ExerciseStep("Straighten your arms and lift them slightly while opening your chest. Hold for 20 seconds.", 20, "Squeeze your shoulder blades together."),
            ExerciseStep("Release and roll your shoulders forward. Hold 10 seconds.", 10, "Let your arms hang naturally."),
            ExerciseStep("Place your forearms on a doorframe with elbows at shoulder height. Lean forward gently. Hold 20 seconds.", 20, "You should feel a stretch across your chest."),
            ExerciseStep("Repeat the doorframe stretch on each side once more.", 30, "Don't bounce - hold the stretch steady."),
            ExerciseStep("Finish with hands clasped behind back, holding for 20 seconds.", 20, "Breathe deeply into the stretch."),
            ExerciseStep("Relax and shake out your arms.", 15, "Roll shoulders a few times."),
        ],
        target_conditions=["carpal_tunnel_syndrome", "scoliosis_risk"],
        muscle_groups=["chest", "shoulders", "upper_back"],
        video_url="https://www.youtube.com/embed/h4M4XmCBFd8",
        video_title="Doorway Chest Stretch",
        equipment_needed="Doorframe",
        calories_estimate=5.0,
    ),
    Exercise(
        id="wrist_stretches",
        name="Wrist Flexor & Extensor Stretches",
        category="wrist",
        difficulty="easy",
        duration_seconds=180,
        description="Essential stretches to prevent carpal tunnel syndrome and relieve typing strain.",
        benefits=[
            "Prevents carpal tunnel syndrome",
            "Relieves wrist pain from typing",
            "Improves wrist flexibility",
            "Reduces forearm tension",
        ],
        steps=[
            ExerciseStep("Extend your right arm forward, palm facing up. With your left hand, gently pull fingers back toward you. Hold 15 seconds.", 15, "Keep your arm straight but don't lock the elbow."),
            ExerciseStep("Flip your right hand palm down and gently press fingers downward. Hold 15 seconds.", 15, "Feel the stretch on top of your forearm."),
            ExerciseStep("Switch to left arm. Extend forward, palm up, pull fingers back. Hold 15 seconds.", 15, "Keep your shoulder relaxed."),
            ExerciseStep("Left hand palm down, press fingers down. Hold 15 seconds.", 15, "Breathe evenly throughout."),
            ExerciseStep("Make a fist with your right hand, then open fingers wide. Repeat 10 times.", 20, "Spread your fingers as wide as possible."),
            ExerciseStep("Make a fist with your left hand, then open fingers wide. Repeat 10 times.", 20, "This helps with grip strength."),
            ExerciseStep("Shake both hands loosely for 15 seconds.", 15, "Let your wrists go completely limp."),
        ],
        target_conditions=["carpal_tunnel_syndrome"],
        muscle_groups=["wrists", "forearms"],
        video_url="https://www.youtube.com/embed/Q5G916yCyF0",
        video_title="5 Best Carpal Tunnel Stretches & Exercises",
        calories_estimate=4.0,
    ),
    Exercise(
        id="finger_extensions",
        name="Finger Tendon Glides",
        category="wrist",
        difficulty="easy",
        duration_seconds=120,
        description="Improve finger mobility and reduce strain from prolonged keyboard use.",
        benefits=[
            "Improves finger dexterity",
            "Reduces finger stiffness",
            "Prevents repetitive strain injuries",
            "Enhances blood flow to hands",
        ],
        steps=[
            ExerciseStep("Start with fingers straight and together. Hold 3 seconds.", 3, "Keep your hand relaxed."),
            ExerciseStep("Bend only your fingertips to form a hook fist. Hold 3 seconds.", 3, "Don't curl your thumb."),
            ExerciseStep("Make a full fist, wrapping your thumb over your fingers. Hold 3 seconds.", 3, "Don't squeeze too hard."),
            ExerciseStep("Straighten all fingers again. Repeat the full cycle 10 times.", 60, "Move smoothly between positions."),
            ExerciseStep("Spread all fingers wide apart and hold for 5 seconds. Repeat 5 times.", 25, "Stretch each finger as far as it comfortably goes."),
            ExerciseStep("Shake your hands loosely for 15 seconds.", 15, "Release any tension."),
            ExerciseStep("Gently massage your palm with the opposite thumb for 15 seconds.", 15, "Apply moderate pressure in circular motions."),
        ],
        target_conditions=["carpal_tunnel_syndrome"],
        muscle_groups=["fingers", "hands"],
        video_url="https://www.youtube.com/embed/htimWVinrk8",
        video_title="Tendon Gliding Exercises for Finger Motion",
        calories_estimate=3.0,
    ),
    Exercise(
        id="cat_cow",
        name="Cat-Cow Stretch",
        category="back",
        difficulty="easy",
        duration_seconds=180,
        description="Dynamic spinal mobility exercise to relieve back tension and improve posture.",
        benefits=[
            "Relieves lower back pain",
            "Improves spinal flexibility",
            "Strengthens core muscles",
            "Reduces scoliosis risk",
        ],
        steps=[
            ExerciseStep("Start on hands and knees. wrists under shoulders, knees under hips. Neutral spine.", 10, "Spread your fingers wide for a stable base."),
            ExerciseStep("Inhale: Drop your belly, lift your chest and tailbone (Cow pose). Hold 5 seconds.", 5, "Look slightly upward, don't crane your neck."),
            ExerciseStep("Exhale: Round your spine toward the ceiling, tuck your chin and tailbone (Cat pose). Hold 5 seconds.", 5, "Push the floor away with your hands."),
            ExerciseStep("Continue flowing between Cat and Cow for 2 minutes at your own pace.", 100, "Match your breath to the movement."),
            ExerciseStep("Return to neutral spine and sit back on your heels. Rest for 15 seconds.", 15, "Take a few deep breaths."),
            ExerciseStep("Repeat one more cycle of 8 Cat-Cow flows.", 30, "Focus on the articulation of each vertebra."),
        ],
        target_conditions=["lower_back_pain", "scoliosis_risk"],
        muscle_groups=["spine", "core", "lower_back"],
        video_url="https://www.youtube.com/embed/rbuptYr2CGM",
        video_title="Cat Cow Stretch Tutorial",
        calories_estimate=8.0,
    ),
    Exercise(
        id="seated_spinal_twist",
        name="Seated Spinal Twist",
        category="back",
        difficulty="easy",
        duration_seconds=150,
        description="Gentle twist to release lower back tension and improve spinal rotation.",
        benefits=[
            "Relieves lower back stiffness",
            "Improves spinal rotation",
            "Massages internal organs",
            "Reduces muscle imbalances",
        ],
        steps=[
            ExerciseStep("Sit on the edge of your chair with feet flat on the floor, spine tall.", 5, "Engage your core slightly."),
            ExerciseStep("Twist your torso to the right, placing your left hand on your right knee and right hand behind you on the chair. Hold 20 seconds.", 20, "Lengthen your spine on each inhale, deepen the twist on each exhale."),
            ExerciseStep("Return to center. Take 2 deep breaths.", 10, "Reset your posture."),
            ExerciseStep("Twist to the left, right hand on left knee, left hand behind. Hold 20 seconds.", 20, "Keep both sit bones grounded on the chair."),
            ExerciseStep("Return to center and repeat twist to the right for 15 seconds.", 15, "Go a little deeper this time if comfortable."),
            ExerciseStep("Repeat twist to the left for 15 seconds.", 15, "Never force the twist."),
            ExerciseStep("Return to center, rest and breathe normally.", 15, "Notice how your spine feels."),
            ExerciseStep("One final gentle twist to each side, holding 10 seconds each.", 20, "Finish feeling refreshed."),
        ],
        target_conditions=["lower_back_pain", "scoliosis_risk"],
        muscle_groups=["lower_back", "obliques", "spine"],
        video_url="https://www.youtube.com/embed/4faLXO2bLFU",
        video_title="Seated Spinal Twist Exercise",
        calories_estimate=5.0,
    ),
    Exercise(
        id="standing_forward_fold",
        name="Standing Forward Fold",
        category="back",
        difficulty="easy",
        duration_seconds=120,
        description="Decompress the spine and stretch the hamstrings to relieve lower back tension.",
        benefits=[
            "Decompresses spinal discs",
            "Stretches hamstrings",
            "Relieves lower back pain",
            "Calms the nervous system",
        ],
        steps=[
            ExerciseStep("Stand with feet hip-width apart, slight bend in knees.", 5, "Place feet parallel to each other."),
            ExerciseStep("Hinge at your hips and fold forward, letting your head and arms hang heavy. Hold 20 seconds.", 20, "Bend your knees as much as needed to protect your lower back."),
            ExerciseStep("Gently sway side to side for 15 seconds.", 15, "Let gravity do the work."),
            ExerciseStep("Grab opposite elbows and hang for 20 seconds.", 20, "Shake your head yes and no to release neck tension."),
            ExerciseStep("Release your arms and slowly roll up one vertebra at a time. Take 10 seconds.", 10, "Stack each vertebra carefully."),
            ExerciseStep("Stand tall, roll shoulders back. Hold for 10 seconds.", 10, "Feel the space in your spine."),
            ExerciseStep("Fold forward once more, holding for 15 seconds.", 15, "Notice if you can fold a bit deeper."),
            ExerciseStep("Roll up slowly and finish standing tall.", 15, "Take a deep breath."),
        ],
        target_conditions=["lower_back_pain"],
        muscle_groups=["lower_back", "hamstrings", "spine"],
        video_url="https://www.youtube.com/embed/g7Uhp5tphAs",
        video_title="Forward Fold Yoga Pose",
        calories_estimate=6.0,
    ),
    Exercise(
        id="eye_relaxation",
        name="20-20-20 Eye Relaxation",
        category="eye",
        difficulty="easy",
        duration_seconds=120,
        description="Reduce eye strain and fatigue from prolonged screen time.",
        benefits=[
            "Reduces eye strain",
            "Prevents digital eye fatigue",
            "Relieves dry eyes",
            "Improves focus and concentration",
        ],
        steps=[
            ExerciseStep("Close your eyes and place your palms gently over your eyes. Rest for 20 seconds.", 20, "Don't press on your eyeballs - let your palms be warm cups."),
            ExerciseStep("Open your eyes and look at something 20 feet away for 20 seconds.", 20, "Blink normally while focusing on the distant object."),
            ExerciseStep("Look up toward the ceiling for 10 seconds, then down toward the floor for 10 seconds.", 20, "Move your eyes slowly, not your head."),
            ExerciseStep("Look far left for 10 seconds, then far right for 10 seconds.", 20, "Stretch your eye muscles gently."),
            ExerciseStep("Make slow circles with your eyes: clockwise 5 times, then counterclockwise 5 times.", 20, "Keep your head still."),
            ExerciseStep("Blink rapidly for 10 seconds to moisten your eyes.", 10, "This helps spread your tear film."),
            ExerciseStep("Close your eyes, take 3 deep breaths, and relax for 10 seconds.", 10, "Notice how your eyes feel more refreshed."),
        ],
        target_conditions=["eye_strain"],
        muscle_groups=["eye_muscles"],
        video_url="https://www.youtube.com/embed/e14zWCE2qkk",
        video_title="How to Exercise Your Eyes to Prevent Digital Eye Strain",
        calories_estimate=2.0,
    ),
    Exercise(
        id="posture_correction",
        name="Wall Posture Reset",
        category="posture",
        difficulty="easy",
        duration_seconds=120,
        description="Reset your posture alignment using a wall as a reference point.",
        benefits=[
            "Restores proper spinal alignment",
            "Strengthens postural muscles",
            "Improves body awareness",
            "Provides instant posture feedback",
        ],
        steps=[
            ExerciseStep("Stand with your back against a wall. Heels 6 inches from the wall.", 5, "Remove shoes for best results."),
            ExerciseStep("Press the back of your head, shoulders, and buttocks against the wall. Hold 20 seconds.", 20, "Try to flatten your lower back - there should be a small gap."),
            ExerciseStep("Raise your arms to form a 'W' shape against the wall. Hold 15 seconds.", 15, "Keep your elbows and wrists touching the wall."),
            ExerciseStep("Slowly raise your arms overhead into a 'Y' shape. Hold 15 seconds.", 15, "Don't let your ribs flare out."),
            ExerciseStep("Lower arms back to 'W', then to starting position. Repeat 5 times.", 30, "Move slowly and with control."),
            ExerciseStep("Step away from the wall and try to maintain the same posture. Hold 20 seconds.", 20, "Feel the improved alignment in space."),
            ExerciseStep("Walk in place for 10 seconds, maintaining your posture.", 10, "Keep your head balanced over your spine."),
            ExerciseStep("Stand still and take 3 deep breaths in your corrected posture.", 10, "Internalize the feeling."),
        ],
        target_conditions=["scoliosis_risk", "text_neck", "lower_back_pain"],
        muscle_groups=["full_body", "postural_muscles"],
        video_url="https://www.youtube.com/embed/y2ZUHmx-IFY",
        video_title="Wall Angel Exercise for Posture",
        calories_estimate=5.0,
    ),
    Exercise(
        id="desk_stretch_routine",
        name="Quick Desk Stretch Routine",
        category="general",
        difficulty="easy",
        duration_seconds=180,
        description="A quick all-in-one routine you can do at your desk without leaving your chair.",
        benefits=[
            "Full body relief in 3 minutes",
            "No equipment needed",
            "Can be done in office",
            "Instant energy boost",
        ],
        steps=[
            ExerciseStep("Clasp hands and stretch arms overhead, palms facing up. Hold 10 seconds.", 10, "Lengthen your spine toward the ceiling."),
            ExerciseStep("Side bend to the right, reaching right arm down toward the floor. Hold 10 seconds.", 10, "Keep both sit bones on the chair."),
            ExerciseStep("Side bend to the left, reaching left arm down. Hold 10 seconds.", 10, "Breathe into the stretch."),
            ExerciseStep("Twist to the right, hands on chair armrests. Hold 10 seconds.", 10, "Lengthen on inhale, twist on exhale."),
            ExerciseStep("Twist to the left, hold 10 seconds.", 10, "Keep your spine tall."),
            ExerciseStep("Interlace fingers behind your back and open your chest. Hold 15 seconds.", 15, "Squeeze shoulder blades together."),
            ExerciseStep("Roll your neck slowly: 5 times clockwise, 5 times counterclockwise.", 20, "Move gently - never force it."),
            ExerciseStep("Shake out your hands and arms for 10 seconds.", 10, "Release all tension."),
            ExerciseStep("Take 3 deep breaths and notice how you feel.", 15, "You should feel more alert and relaxed."),
        ],
        target_conditions=["text_neck", "carpal_tunnel_syndrome", "lower_back_pain"],
        muscle_groups=["full_body"],
        video_url="https://www.youtube.com/embed/2GTO3sKOV7s",
        video_title="4 Easy Stretches You Can Do At Your Desk",
        calories_estimate=8.0,
    ),
]

CONDITION_TO_EXERCISE_MAP = {
    "cervical_spondylosis": ["neck_stretches", "chin_tucks", "posture_correction"],
    "carpal_tunnel_syndrome": ["wrist_stretches", "finger_extensions", "chest_opener", "shoulder_rolls"],
    "text_neck": ["neck_stretches", "chin_tucks", "posture_correction", "desk_stretch_routine"],
    "scoliosis_risk": ["cat_cow", "seated_spinal_twist", "chest_opener", "posture_correction"],
    "lower_back_pain": ["cat_cow", "seated_spinal_twist", "standing_forward_fold", "posture_correction"],
    "eye_strain": ["eye_relaxation"],
}


class ExerciseRecommender:
    def __init__(self):
        self.exercises = {ex.id: ex for ex in EXERCISE_DATABASE}

    def get_recommendations(
        self,
        risk_scores: dict,
        posture_score: float = 100,
        blink_rate: float = 17.0,
    ) -> list[dict]:
        recommended_ids = set()

        for condition, risk in risk_scores.items():
            if risk > 25:
                exercise_ids = CONDITION_TO_EXERCISE_MAP.get(condition, [])
                recommended_ids.update(exercise_ids)

        if posture_score < 60:
            recommended_ids.add("posture_correction")
            recommended_ids.add("desk_stretch_routine")

        if blink_rate < 12 or blink_rate > 25:
            recommended_ids.add("eye_relaxation")

        if not recommended_ids:
            recommended_ids = {"desk_stretch_routine", "eye_relaxation", "shoulder_rolls"}

        exercises = []
        for ex_id in recommended_ids:
            if ex_id in self.exercises:
                exercises.append(self._exercise_to_dict(self.exercises[ex_id]))

        exercises.sort(key=lambda e: self._priority_score(e, risk_scores), reverse=True)

        return exercises

    def get_all_exercises(self) -> list[dict]:
        return [self._exercise_to_dict(ex) for ex in EXERCISE_DATABASE]

    def get_exercise_by_id(self, exercise_id: str) -> dict | None:
        exercise = self.exercises.get(exercise_id)
        return self._exercise_to_dict(exercise) if exercise else None

    def get_exercises_by_category(self, category: str) -> list[dict]:
        return [
            self._exercise_to_dict(ex)
            for ex in EXERCISE_DATABASE
            if ex.category == category
        ]

    def get_categories(self) -> list[str]:
        return list({ex.category for ex in EXERCISE_DATABASE})

    def _exercise_to_dict(self, exercise: Exercise) -> dict:
        return {
            "id": exercise.id,
            "name": exercise.name,
            "category": exercise.category,
            "difficulty": exercise.difficulty,
            "duration_seconds": exercise.duration_seconds,
            "duration_minutes": round(exercise.duration_seconds / 60, 1),
            "description": exercise.description,
            "benefits": exercise.benefits,
            "steps": [
                {
                    "instruction": step.instruction,
                    "duration_seconds": step.duration_seconds,
                    "tip": step.tip,
                }
                for step in exercise.steps
            ],
            "step_count": len(exercise.steps),
            "target_conditions": exercise.target_conditions,
            "muscle_groups": exercise.muscle_groups,
            "video_url": exercise.video_url,
            "video_title": exercise.video_title,
            "equipment_needed": exercise.equipment_needed,
            "calories_estimate": exercise.calories_estimate,
        }

    def _priority_score(self, exercise: dict, risk_scores: dict) -> int:
        score = 0
        for condition, risk in risk_scores.items():
            if risk > 50 and condition in exercise.get("target_conditions", []):
                score += int(risk)
            elif risk > 25 and condition in exercise.get("target_conditions", []):
                score += int(risk / 2)
        return score
