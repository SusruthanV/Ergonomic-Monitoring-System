import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, Target } from 'lucide-react';
import type { PostureData } from '../types';
import clsx from 'clsx';

interface PostureScoreCardProps {
  posture: PostureData | null;
  score: number;
}

function angleColor(value: number, good: boolean): string {
  if (good) return 'bg-gradient-to-r from-secondary-500 to-emerald-400';
  if (value > 30) return 'bg-gradient-to-r from-red-500 to-red-400';
  return 'bg-gradient-to-r from-accent-500 to-orange-400';
}

function angleLabel(value: number, good: boolean): string {
  if (good) return 'Good';
  if (value > 30) return 'Poor';
  return 'Warning';
}

function angleTextColor(value: number, good: boolean): string {
  if (good) return 'text-secondary-400';
  if (value > 30) return 'text-red-400';
  return 'text-accent-400';
}

export default function PostureScoreCard({ posture, score }: PostureScoreCardProps) {
  if (!posture) {
    return (
      <div className="glass-card">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  const StatusIcon = posture.is_good_posture
    ? CheckCircle
    : posture.neck_angle > 30 || posture.shoulder_angle > 30 || posture.spine_angle > 30
    ? AlertCircle
    : AlertTriangle;

  const statusColor = posture.is_good_posture
    ? 'text-secondary-400'
    : 'text-accent-400';

  const angles = [
    { label: 'Neck Angle', value: posture.neck_angle, key: 'neck' },
    { label: 'Shoulder Angle', value: posture.shoulder_angle, key: 'shoulder' },
    { label: 'Spine Angle', value: posture.spine_angle, key: 'spine' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Posture Score</h3>
            <p className="text-xs text-dark-400">Real-time posture analysis</p>
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

      <div className="space-y-3 mb-4">
        {angles.map((angle) => {
          const isGood = posture.is_good_posture;
          const pct = Math.min(angle.value / 45, 1) * 100;
          return (
            <div key={angle.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-dark-400">{angle.label}</span>
                <span className={clsx('text-xs font-medium', angleTextColor(angle.value, isGood))}>
                  {angle.value.toFixed(1)}° - {angleLabel(angle.value, isGood)}
                </span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={clsx('h-full rounded-full', angleColor(angle.value, isGood))}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-dark-800/50">
        <StatusIcon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', statusColor)} />
        <p className="text-xs text-dark-300">{posture.feedback}</p>
      </div>
    </motion.div>
  );
}
