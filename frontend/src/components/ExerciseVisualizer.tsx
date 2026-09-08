import { motion } from 'framer-motion';

interface ExerciseVisualizerProps {
  exerciseId: string;
  currentStep: number;
  isPlaying: boolean;
}

function StickFigure({ className = '' }: { className?: string }) {
  return (
    <g className={className}>
      <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="28" x2="50" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

// === NECK EXERCISES ===
function NeckTilts({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  const angles = [0, 15, 0, -15, 0, 20, 0];
  const angle = angles[step % angles.length];

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <motion.g
        style={{ transformOrigin: '50px 28px' }}
        animate={isPlaying ? { rotate: [0, angle, 0] } : { rotate: angle }}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
      >
        <line x1="50" y1="28" x2="50" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChinTucks({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <motion.g
        style={{ transformOrigin: '50px 28px' }}
        animate={isPlaying ? { x: [0, -3, 0, 3, 0] } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      >
        <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="48" cy="18" r="1" fill="currentColor" />
        <circle cx="52" cy="18" r="1" fill="currentColor" />
      </motion.g>
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// === SHOULDER EXERCISES ===
function ShoulderRolls({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <motion.circle
        cx="35"
        cy="38"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={isPlaying ? { cy: [38, 32, 38, 44, 38] } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      />
      <motion.circle
        cx="65"
        cy="38"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={isPlaying ? { cy: [38, 32, 38, 44, 38] } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: 0.1 }}
      />
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="41" x2="35" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="41" x2="65" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChestOpener({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <motion.g
        animate={isPlaying ? { rotate: [0, -10, 0] } : {}}
        style={{ transformOrigin: '50px 35px' }}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="50" y1="35" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="38" x2="20" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="35" x2="70" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="38" x2="80" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// === WRIST EXERCISES ===
function WristStretches({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.g
        animate={isPlaying ? { rotate: [0, 20, 0, -20, 0] } : { rotate: step % 2 === 0 ? 20 : -20 }}
        style={{ transformOrigin: '20px 45px' }}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="35" y1="42" x2="20" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </motion.g>
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FingerExtensions({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  const fingerSpread = step % 2 === 0 ? 4 : 8;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.g
        animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
        style={{ transformOrigin: '50px 60px' }}
        transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <g>
        {[-6, -3, 0, 3, 6].map((offset, i) => (
          <motion.line
            key={i}
            x1={25 + offset}
            y1={42}
            x2={25 + offset * 1.5}
            y2={35}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={isPlaying ? { y2: [35, 30, 35] } : {}}
            transition={{ duration: 1, repeat: isPlaying ? Infinity : 0, delay: i * 0.1 }}
          />
        ))}
      </g>
    </svg>
  );
}

// === BACK EXERCISES ===
function CatCow({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="20" cy="25" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.path
        d="M26,31 Q35,25 42,28 Q50,32 58,28 Q65,25 70,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isPlaying ? {
          d: ["M26,31 Q35,25 42,28 Q50,32 58,28 Q65,25 70,30",
              "M26,31 Q35,38 42,35 Q50,30 58,35 Q65,38 70,30",
              "M26,31 Q35,25 42,28 Q50,32 58,28 Q65,25 70,30"]
        } : {}}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
      />
      <line x1="20" y1="35" x2="20" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="35" x2="70" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="55" x2="20" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="55" x2="70" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpinalTwist({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.g
        style={{ transformOrigin: '50px 35px' }}
        animate={isPlaying ? { rotate: [0, 15, 0, -15, 0] } : {}}
        transition={{ duration: 4, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="50" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="35" x2="35" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="42" x2="30" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="35" x2="65" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="42" x2="68" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <rect x="35" y="50" width="30" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="58" x2="38" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="58" x2="62" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ForwardFold({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="35" cy="55" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.path
        d="M41,55 Q50,35 55,45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isPlaying ? {
          d: ["M41,55 Q50,35 55,45", "M41,55 Q50,30 55,40", "M41,55 Q50,35 55,45"]
        } : {}}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
      />
      <line x1="55" y1="45" x2="35" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <motion.g
        animate={isPlaying ? { rotate: [0, 30, 0] } : {}}
        style={{ transformOrigin: '55px 45px' }}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="55" y1="45" x2="65" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="55" x2="55" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="45" x2="45" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="55" x2="55" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// === EYE EXERCISES ===
function EyeRelaxation({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <StickFigure />
      <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.g
        animate={isPlaying ? { rotate: [0, 360] } : {}}
        style={{ transformOrigin: '50px 20px' }}
        transition={{ duration: 4, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
      >
        <circle cx="47" cy="19" r="2.5" fill="currentColor" />
        <circle cx="53" cy="19" r="2.5" fill="currentColor" />
      </motion.g>
      <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.g
        animate={isPlaying ? { y: [0, -2, 0, 2, 0] } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="42" y1="15" x2="35" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="58" y1="15" x2="65" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </motion.g>
    </svg>
  );
}

// === POSTURE EXERCISES ===
function PostureCorrection({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="15" y="10" width="3" height="80" rx="1" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.line
        x1="50" y1="25" x2="50" y2="52"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isPlaying ? { x1: [50, 50] } : {}}
      />
      <motion.g
        animate={isPlaying ? { x: [50, 18, 18] } : {}}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="50" y1="32" x2="35" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="32" x2="65" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <line x1="50" y1="52" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="52" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// === GENERAL EXERCISES ===
function DeskStretch({ step, isPlaying }: { step: number; isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.g
        style={{ transformOrigin: '50px 35px' }}
        animate={isPlaying ? { rotate: [0, -15, 0, 15, 0] } : {}}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
      >
        <line x1="50" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.g
          animate={isPlaying ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
        >
          <line x1="50" y1="32" x2="30" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="32" x2="70" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </motion.g>
      <rect x="30" y="52" width="40" height="6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="35" y1="58" x2="35" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="58" x2="65" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// === EXERCISE MAP ===
const EXERCISE_VISUALS: Record<string, React.FC<{ step: number; isPlaying: boolean }>> = {
  neck_stretches: NeckTilts,
  chin_tucks: ChinTucks,
  shoulder_rolls: ShoulderRolls,
  chest_opener: ChestOpener,
  wrist_stretches: WristStretches,
  finger_extensions: FingerExtensions,
  cat_cow: CatCow,
  seated_spinal_twist: SpinalTwist,
  standing_forward_fold: ForwardFold,
  eye_relaxation: EyeRelaxation,
  posture_correction: PostureCorrection,
  desk_stretch_routine: DeskStretch,
};

export default function ExerciseVisualizer({ exerciseId, currentStep, isPlaying }: ExerciseVisualizerProps) {
  const VisualComponent = EXERCISE_VISUALS[exerciseId];

  if (!VisualComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full text-dark-500">
          <StickFigure />
          <line x1="35" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="65" y1="42" x2="50" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="55" x2="38" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="55" x2="62" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-primary-400">
      <VisualComponent step={currentStep} isPlaying={isPlaying} />
    </div>
  );
}
