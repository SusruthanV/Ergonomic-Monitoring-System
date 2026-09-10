import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface ComparisonBarProps {
  label: string;
  before: number;
  after: number;
  change: number;
  percentChange: number;
  improved: boolean;
  higherIsBetter?: boolean;
  unit?: string;
  decimals?: number;
}

export default function ComparisonBar({
  label,
  before,
  after,
  change,
  percentChange,
  improved,
  higherIsBetter = true,
  unit = '',
  decimals = 1,
}: ComparisonBarProps) {
  const maxValue = Math.max(before, after, 1);
  const beforeWidth = (before / maxValue) * 100;
  const afterWidth = (after / maxValue) * 100;
  const isUnchanged = change === 0;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-dark-200">{label}</span>
        <div className="flex items-center gap-1.5">
          {isUnchanged ? (
            <Minus className="w-4 h-4 text-dark-500" />
          ) : improved ? (
            <TrendingUp className="w-4 h-4 text-secondary-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span
            className={clsx(
              'text-xs font-medium',
              isUnchanged
                ? 'text-dark-500'
                : improved
                ? 'text-secondary-400'
                : 'text-red-400'
            )}
          >
            {isUnchanged
              ? 'No change'
              : `${change > 0 ? '+' : ''}${change.toFixed(decimals)}${unit} (${Math.abs(percentChange)}%)`}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-dark-500 uppercase tracking-wider">Before</span>
            <span className="text-xs text-dark-300 font-mono">
              {before.toFixed(decimals)}{unit}
            </span>
          </div>
          <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${beforeWidth}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full bg-gradient-to-r from-dark-600 to-dark-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-dark-500 uppercase tracking-wider">After</span>
            <span className="text-xs text-dark-300 font-mono">
              {after.toFixed(decimals)}{unit}
            </span>
          </div>
          <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${afterWidth}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={clsx(
                'h-full rounded-full',
                improved
                  ? 'bg-gradient-to-r from-secondary-500 to-secondary-400'
                  : isUnchanged
                  ? 'bg-gradient-to-r from-dark-600 to-dark-500'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
