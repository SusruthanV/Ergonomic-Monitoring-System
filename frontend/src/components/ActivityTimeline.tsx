import { motion } from 'framer-motion';
import { Clock, Award, ArrowRight, Trash2 } from 'lucide-react';
import type { SessionSummary } from '../types';
import clsx from 'clsx';

interface ActivityTimelineProps {
  sessions: SessionSummary[];
  onSessionClick?: (session: SessionSummary) => void;
  onDeleteSession?: (id: number) => void;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function scoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 80) return 'bg-secondary-500';
  if (score >= 70) return 'bg-teal-500';
  if (score >= 60) return 'bg-primary-500';
  if (score >= 50) return 'bg-accent-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function scoreBorderColor(score: number): string {
  if (score >= 90) return 'border-emerald-500/30';
  if (score >= 80) return 'border-secondary-500/30';
  if (score >= 70) return 'border-teal-500/30';
  if (score >= 60) return 'border-primary-500/30';
  if (score >= 50) return 'border-accent-500/30';
  if (score >= 40) return 'border-orange-500/30';
  return 'border-red-500/30';
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function ActivityTimeline({ sessions, onSessionClick, onDeleteSession }: ActivityTimelineProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="glass-card text-center py-8">
        <Clock className="w-12 h-12 text-dark-500 mx-auto mb-3" />
        <p className="text-sm text-dark-400">No sessions recorded yet</p>
        <p className="text-xs text-dark-500 mt-1">Start an analysis to see your history here</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2 max-h-[500px] overflow-y-auto pr-2"
    >
      {sessions.map((session) => (
        <motion.div
          key={session.id}
          variants={item}
          whileHover={{ scale: 1.01, x: 2 }}
          className={clsx(
            'glass rounded-xl p-4 cursor-pointer group transition-all duration-200 border',
            scoreBorderColor(session.overall_score)
          )}
          onClick={() => onSessionClick?.(session)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', scoreColor(session.overall_score))}>
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {formatDate(session.created_at)}
                  </span>
                  <span className="text-[10px] text-dark-500">
                    {formatTime(session.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-dark-400" />
                    <span className="text-xs text-dark-400">
                      {session.duration_minutes.toFixed(1)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={clsx('w-1.5 h-1.5 rounded-full', scoreColor(session.overall_score))} />
                    <span className="text-xs font-medium text-white">
                      Score: {session.overall_score.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDeleteSession && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-all duration-200" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
