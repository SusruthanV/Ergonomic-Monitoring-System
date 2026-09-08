import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight, Zap } from 'lucide-react';
import { Exercise } from '../types';
import clsx from 'clsx';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  neck: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  shoulder: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  wrist: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  back: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  eye: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  posture: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
  general: { bg: 'bg-secondary-500/10', text: 'text-secondary-400', border: 'border-secondary-500/20' },
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  isRecommended?: boolean;
}

export default function ExerciseCard({ exercise, onSelect, isRecommended }: ExerciseCardProps) {
  const colors = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(exercise)}
      className={clsx(
        'glass rounded-xl p-4 cursor-pointer transition-all duration-200 group',
        'hover:border-primary-500/30 hover:bg-dark-800/50',
        isRecommended && 'ring-1 ring-primary-500/20'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-md text-xs font-medium capitalize border',
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            {exercise.category}
          </span>
          {isRecommended && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              For You
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" />
      </div>

      <h3 className="text-sm font-semibold text-dark-50 mb-1.5 group-hover:text-primary-300 transition-colors">
        {exercise.name}
      </h3>
      <p className="text-xs text-dark-400 line-clamp-2 mb-3">{exercise.description}</p>

      <div className="flex items-center gap-3 text-xs text-dark-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{exercise.duration_minutes}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" />
          <span>{exercise.calories_estimate} cal</span>
        </div>
        <span className="text-dark-500">|</span>
        <span>{exercise.step_count} steps</span>
      </div>

      {exercise.benefits.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dark-800/50">
          <div className="flex flex-wrap gap-1.5">
            {exercise.benefits.slice(0, 2).map((benefit, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] text-dark-400 bg-dark-800/50"
              >
                {benefit}
              </span>
            ))}
            {exercise.benefits.length > 2 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] text-dark-500">
                +{exercise.benefits.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
