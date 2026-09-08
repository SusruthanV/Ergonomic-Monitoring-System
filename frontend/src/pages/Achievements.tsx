import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Flame,
  Star,
  Trophy,
  CheckCircle,
  Sunrise,
  Moon,
  Zap,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatISTDateOnly } from '../utils/dates';
import { Achievement, AchievementStats } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Star,
  Flame,
  Trophy,
  Award,
  CheckCircle,
  Sunrise,
  Moon,
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achData, statsData] = await Promise.all([
        api.fetchAchievements(),
        api.fetchAchievementStats(),
      ]);
      setAchievements(achData.badges || []);
      setStats(statsData);
      api.checkBadges().catch(() => {});
    } catch (err) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const earnedCount = achievements.filter((a) => a.earned).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
          <Award className="w-6 h-6 text-primary-400" />
          Achievements
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          Track your streaks and earn badges
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Current Streak', value: `${stats?.current_streak || 0}d`, icon: Flame, color: 'from-orange-500 to-red-500' },
          { label: 'Best Streak', value: `${stats?.best_streak || 0}d`, icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
          { label: 'Total Sessions', value: stats?.total_sessions || 0, icon: Target, color: 'from-cyan-500 to-blue-600' },
          { label: 'Total Hours', value: stats?.total_hours || 0, icon: Clock, color: 'from-green-500 to-emerald-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4"
          >
            <div className={clsx('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', item.color)}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-dark-50">{item.value}</p>
            <p className="text-xs text-dark-400">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-50">Badges</h2>
          <span className="text-sm text-dark-400">
            {earnedCount}/{achievements.length} earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge, i) => {
            const Icon = iconMap[badge.icon] || Award;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={clsx(
                  'glass rounded-2xl p-5 flex items-start gap-4 transition-all duration-300',
                  badge.earned
                    ? 'border-primary-500/30 hover:border-primary-500/50'
                    : 'opacity-50 grayscale hover:opacity-70 hover:grayscale-0'
                )}
              >
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  badge.earned
                    ? 'bg-gradient-to-br from-primary-500 to-violet-600'
                    : 'bg-dark-700'
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-dark-50">{badge.name}</p>
                    {badge.earned && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{badge.description}</p>
                  {badge.earned && badge.earned_at && (
                    <p className="text-xs text-dark-500 mt-2">
                      Earned {formatISTDateOnly(badge.earned_at)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
