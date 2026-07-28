import { motion } from 'framer-motion';
import { Award, TrendingUp, Lightbulb } from 'lucide-react';
import type { ScoreData } from '../types';
import clsx from 'clsx';

interface OverallScoreCardProps {
  scores: ScoreData | null;
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A+': 'from-emerald-400 to-emerald-500',
    'A': 'from-secondary-400 to-secondary-500',
    'B+': 'from-teal-400 to-teal-500',
    'B': 'from-primary-400 to-primary-500',
    'C+': 'from-accent-400 to-yellow-500',
    'C': 'from-orange-400 to-orange-500',
    'D': 'from-red-400 to-red-500',
    'F': 'from-rose-400 to-rose-500',
  };
  return colors[grade] || 'from-dark-400 to-dark-500';
}

function getGradeGlow(grade: string): string {
  const glows: Record<string, string> = {
    'A+': 'shadow-emerald-500/30',
    'A': 'shadow-secondary-500/30',
    'B+': 'shadow-teal-500/30',
    'B': 'shadow-primary-500/30',
    'C+': 'shadow-accent-500/30',
    'C': 'shadow-orange-500/30',
    'D': 'shadow-red-500/30',
    'F': 'shadow-rose-500/30',
  };
  return glows[grade] || 'shadow-dark-500/30';
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-secondary-400';
  if (score >= 70) return 'text-teal-400';
  if (score >= 60) return 'text-primary-400';
  if (score >= 50) return 'text-accent-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

const circumference = 2 * Math.PI * 70;

export default function OverallScoreCard({ scores }: OverallScoreCardProps) {
  if (!scores) {
    return (
      <div className="glass-card p-8">
        <div className="skeleton h-48 w-48 rounded-full mx-auto mb-4" />
        <div className="skeleton h-6 w-32 mx-auto" />
      </div>
    );
  }

  const grade = scores.grade || 'N/A';
  const score = Math.round(scores.overall);
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const subScores = [
    { label: 'Posture', value: scores.posture, key: 'posture', color: 'stroke-primary-400' },
    { label: 'Eye Blink', value: scores.eye_blink, key: 'eye_blink', color: 'stroke-secondary-400' },
    { label: 'Disease Risk', value: scores.disease_risk, key: 'disease_risk', color: 'stroke-accent-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx('glass-card p-8 text-center', `glow-${getGradeGlow(grade)}`)}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Award className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-white">Overall Score</h2>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={clsx('text-5xl font-bold', getScoreColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-xs text-dark-400">out of 100</span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={clsx(
              'mt-2 px-4 py-1 rounded-full bg-gradient-to-r text-white text-sm font-bold shadow-lg',
              getGradeColor(grade)
            )}
          >
            {grade}
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {subScores.map((sub) => (
          <div key={sub.key} className="glass rounded-xl p-3">
            <div className="text-xs text-dark-400 mb-1">{sub.label}</div>
            <motion.div
              key={sub.value}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-white"
            >
              {sub.value.toFixed(0)}
            </motion.div>
            <div className="mt-2 h-1 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sub.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={clsx('h-full rounded-full', sub.color.replace('stroke', 'bg'))}
              />
            </div>
          </div>
        ))}
      </div>

      {scores.recommendations.length > 0 && (
        <div className="glass rounded-xl p-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-accent-300">Recommendations</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {scores.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                <TrendingUp className="w-3 h-3 mt-0.5 text-primary-400 flex-shrink-0" />
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
