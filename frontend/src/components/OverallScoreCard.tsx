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
      className={clsx('glass-card p-4', `glow-${getGradeGlow(grade)}`)}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgb(var(--dark-500) / 0.15)"
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
              className={clsx('text-2xl font-bold', getScoreColor(score))}
            >
              {score}
            </motion.span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className={clsx(
                'mt-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r text-white text-[10px] font-bold shadow-lg',
                getGradeColor(grade)
              )}
            >
              {grade}
            </motion.div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-dark-50">Overall Score</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {subScores.map((sub) => (
              <div key={sub.key} className="glass rounded-lg p-2">
                <div className="text-[10px] text-dark-400 mb-0.5">{sub.label}</div>
                <div className="text-sm font-bold text-dark-50">{sub.value.toFixed(0)}</div>
                <div className="mt-1 h-1 bg-dark-800 rounded-full overflow-hidden">
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
        </div>
      </div>

      {scores.recommendations.length > 0 && (
        <div className="mt-3 glass rounded-lg p-3 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-xs font-medium text-accent-300">Recommendations</span>
          </div>
          <div className="space-y-1 max-h-16 overflow-y-auto">
            {scores.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-dark-300">
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
