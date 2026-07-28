import { motion } from 'framer-motion';
import { Eye, EyeOff, Activity, AlertTriangle } from 'lucide-react';
import type { EyeBlinkData } from '../types';
import clsx from 'clsx';

interface EyeBlinkScoreCardProps {
  blinkData: EyeBlinkData | null;
  score: number;
}

export default function EyeBlinkScoreCard({ blinkData, score }: EyeBlinkScoreCardProps) {
  if (!blinkData) {
    return (
      <div className="glass-card">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  const idealRateMin = 12;
  const idealRateMax = 20;
  const isLowBlinkRate = blinkData.blink_rate < idealRateMin;
  const isHighBlinkRate = blinkData.blink_rate > idealRateMax;
  const blinkStatus = isLowBlinkRate ? 'Too Low' : isHighBlinkRate ? 'Too High' : 'Ideal';
  const blinkStatusColor = isLowBlinkRate || isHighBlinkRate ? 'text-red-400' : 'text-secondary-400';

  const earPct = (blinkData.ear_value * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Eye Blink</h3>
            <p className="text-xs text-dark-400">Blink rate analysis</p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            {score.toFixed(0)}
          </motion.div>
          <span className="text-xs text-dark-400">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3 h-3 text-primary-400" />
            <span className="text-xs text-dark-400">Blink Rate</span>
          </div>
          <div className="text-lg font-bold text-white">
            {blinkData.blink_rate.toFixed(1)}
            <span className="text-xs text-dark-400 font-normal ml-1">/min</span>
          </div>
          <span className={clsx('text-xs font-medium', blinkStatusColor)}>
            {blinkStatus}
          </span>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <EyeOff className="w-3 h-3 text-primary-400" />
            <span className="text-xs text-dark-400">EAR</span>
          </div>
          <div className="text-lg font-bold text-white">{earPct}%</div>
          <span className="text-xs text-dark-400">
            {blinkData.is_blink ? 'Blinking' : 'Open'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-dark-800/50 mb-3">
        <span className="text-xs text-dark-400">Total Blinks</span>
        <span className="text-sm font-semibold text-white">{blinkData.total_blinks}</span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-dark-400">Blink Rate Zone</span>
          <span className={clsx('text-xs font-medium', blinkStatusColor)}>{blinkStatus}</span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 bg-secondary-500/20 border-x border-secondary-500/40 rounded"
            style={{ left: `${(idealRateMin / 30) * 100}%`, right: `${100 - (idealRateMax / 30) * 100}%` }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(blinkData.blink_rate / 30) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={clsx(
              'h-full rounded-full',
              isLowBlinkRate || isHighBlinkRate
                ? 'bg-gradient-to-r from-red-500 to-red-400'
                : 'bg-gradient-to-r from-secondary-500 to-emerald-400'
            )}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-dark-500">0</span>
          <span className="text-[10px] text-dark-500">30/min</span>
        </div>
      </div>

      {isLowBlinkRate && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-400" />
          <p className="text-xs text-accent-300">
            Low blink rate detected. Extended screen time may cause eye strain. Consider taking breaks and using lubricating eye drops.
          </p>
        </div>
      )}
    </motion.div>
  );
}
