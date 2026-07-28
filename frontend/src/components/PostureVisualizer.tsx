import { motion } from 'framer-motion';
import clsx from 'clsx';

interface PostureVisualizerProps {
  angles: { neck: number; shoulder: number; spine: number };
}

function angleColor(value: number): string {
  if (value < 15) return 'stroke-secondary-400';
  if (value < 30) return 'stroke-accent-400';
  return 'stroke-red-400';
}

function angleGlow(value: number): string {
  if (value < 15) return 'drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]';
  if (value < 30) return 'drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]';
  return 'drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]';
}

export default function PostureVisualizer({ angles }: PostureVisualizerProps) {
  const neckRad = (angles.neck * Math.PI) / 180;
  const shoulderRad = (angles.shoulder * Math.PI) / 180;
  const spineRad = (angles.spine * Math.PI) / 180;

  const headX = 150;
  const headY = 40;
  const neckX = 150 + Math.sin(neckRad) * 30;
  const neckY = 80 + Math.cos(neckRad) * 10;
  const shoulderLX = 100 - Math.cos(shoulderRad) * 20;
  const shoulderRX = 200 + Math.cos(shoulderRad) * 20;
  const shoulderY = 120;
  const spineX = 150 + Math.sin(spineRad) * 15;
  const spineY = 180;
  const hipX = 150;
  const hipY = 220;

  return (
    <div className="glass-card flex flex-col items-center">
      <h3 className="text-sm font-semibold text-white mb-4">Posture Visualization</h3>
      <svg viewBox="0 0 300 260" className="w-full max-w-[200px] h-auto">
        <g className={clsx(angleGlow(angles.spine))}>
          <motion.line
            x1={150}
            y1={80}
            x2={spineX}
            y2={spineY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <motion.line
            x1={spineX}
            y1={spineY}
            x2={hipX}
            y2={hipY}
            initial={{ x2: 150, y2: 220 }}
            animate={{ x2: spineX, y2: spineY }}
            className={clsx('stroke-[3]', angleColor(angles.spine))}
            strokeLinecap="round"
          />
        </g>

        <g className={clsx(angleGlow(angles.shoulder))}>
          <motion.line
            x1={shoulderLX}
            y1={shoulderY}
            x2={shoulderRX}
            y2={shoulderY}
            initial={{ x1: 100, x2: 200 }}
            animate={{ x1: shoulderLX, x2: shoulderRX }}
            className={clsx('stroke-[3]', angleColor(angles.shoulder))}
            strokeLinecap="round"
          />
        </g>

        <g className={clsx(angleGlow(angles.neck))}>
          <motion.line
            x1={neckX}
            y1={neckY}
            x2={150}
            y2={80}
            initial={{ x1: 150, y1: 80 }}
            animate={{ x1: neckX, y1: neckY }}
            className={clsx('stroke-[3]', angleColor(angles.neck))}
            strokeLinecap="round"
          />
        </g>

        <motion.circle
          cx={150}
          cy={40}
          r="18"
          className="fill-dark-800 stroke-white/20"
          strokeWidth="2"
        />
        <motion.circle
          cx={150}
          cy={40}
          r="8"
          className="fill-primary-400/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.circle cx={shoulderLX} cy={shoulderY} r="5" className="fill-dark-700 stroke-white/10" strokeWidth="1" />
        <motion.circle cx={shoulderRX} cy={shoulderY} r="5" className="fill-dark-700 stroke-white/10" strokeWidth="1" />
        <motion.circle cx={hipX} cy={hipY} r="5" className="fill-dark-700 stroke-white/10" strokeWidth="1" />

        {angles.neck > 5 && (
          <motion.text
            x={180}
            y={70}
            className={clsx('text-[8px] font-medium', angleColor(angles.neck).replace('stroke', 'fill'))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {angles.neck.toFixed(1)}°
          </motion.text>
        )}
        {angles.shoulder > 5 && (
          <motion.text
            x={210}
            y={125}
            className={clsx('text-[8px] font-medium', angleColor(angles.shoulder).replace('stroke', 'fill'))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {angles.shoulder.toFixed(1)}°
          </motion.text>
        )}
        {angles.spine > 5 && (
          <motion.text
            x={165}
            y={195}
            className={clsx('text-[8px] font-medium', angleColor(angles.spine).replace('stroke', 'fill'))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {angles.spine.toFixed(1)}°
          </motion.text>
        )}
      </svg>

      <div className="flex gap-4 mt-3 text-[10px] text-dark-400">
        {[
          { label: 'Neck', value: angles.neck },
          { label: 'Shoulder', value: angles.shoulder },
          { label: 'Spine', value: angles.spine },
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-1">
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                a.value < 15 ? 'bg-secondary-500' : a.value < 30 ? 'bg-accent-500' : 'bg-red-500'
              )}
            />
            <span>{a.label}: {a.value.toFixed(1)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
