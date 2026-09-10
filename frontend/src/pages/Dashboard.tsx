import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Clock, Activity, TrendingUp, Award, Calendar, Play, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import OverallScoreCard from '../components/OverallScoreCard';
import PostureScoreCard from '../components/PostureScoreCard';
import EyeBlinkScoreCard from '../components/EyeBlinkScoreCard';
import DiseaseRiskCard from '../components/DiseaseRiskCard';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityTimeline from '../components/ActivityTimeline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    trends,
    sessions,
    dashboardSummary,
    latestScores,
    latestPosture,
    latestEyeBlink,
    latestDiseaseRisk,
    setTrends,
    setSessions,
    setDashboardSummary,
  } = useStore();

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summary, trendData, sessionData] = await Promise.all([
        api.fetchDashboardSummary(),
        api.fetchTrends(7),
        api.fetchSessions(),
      ]);
      setDashboardSummary(summary);
      setTrends(trendData?.trends || trendData || []);
      setSessions(sessionData?.sessions || sessionData || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="skeleton h-8 w-64" />
            <div className="skeleton h-4 w-44" />
          </div>
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="skeleton h-[26rem] rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>

        <div className="skeleton h-6 w-48 mb-4" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (!dashboardSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-violet-500/10 flex items-center justify-center mb-6 border border-primary-500/10">
          <Activity className="w-10 h-10 text-primary-400/60" />
        </div>
        <h2 className="text-xl font-semibold text-dark-50 mb-2">No data yet</h2>
        <p className="text-sm text-dark-400 mb-6 max-w-md">
          Start an analysis session to see your ergonomic health dashboard with scores, trends, and activity history.
        </p>
        <button
          onClick={() => navigate('/analysis')}
          className="btn-primary"
        >
          <Play className="w-4 h-4" />
          Start Analysis
        </button>
      </motion.div>
    );
  }

  const statsCards = [
    {
      label: 'Total Sessions',
      value: dashboardSummary?.total_sessions ?? 0,
      icon: Activity,
      gradient: 'from-primary-500 to-violet-600',
      glow: 'shadow-primary-500/20',
    },
    {
      label: 'Total Time',
      value: dashboardSummary?.total_hours
        ? `${dashboardSummary.total_hours.toFixed(1)}h`
        : '0h',
      icon: Clock,
      gradient: 'from-secondary-500 to-teal-600',
      glow: 'shadow-secondary-500/20',
    },
    {
      label: 'Average Score',
      value: dashboardSummary?.avg_score
        ? dashboardSummary.avg_score.toFixed(1)
        : 'N/A',
      icon: TrendingUp,
      gradient: 'from-accent-500 to-orange-600',
      glow: 'shadow-accent-500/20',
    },
    {
      label: 'Best Score',
      value: dashboardSummary?.best_score
        ? dashboardSummary.best_score.toFixed(1)
        : 'N/A',
      icon: Award,
      gradient: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-dark-50">
            {getGreeting()}, User
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Here's your ergonomic health overview
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={fetchData}
          className="btn-secondary text-sm px-4 py-2"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-dark-400 font-medium">{stat.label}</span>
              <div className={clsx(
                'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300',
                stat.gradient,
                stat.glow
              )}>
                <stat.icon className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-dark-50">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {latestScores ? (
          <OverallScoreCard scores={latestScores} />
        ) : (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-dark-500 mb-3" />
            <p className="text-sm text-dark-400">No recent session data</p>
            <p className="text-xs text-dark-500 mt-1">Start an analysis to see your scores here</p>
          </div>
        )}
        {latestScores ? (
          <div className="space-y-4">
            <PostureScoreCard
              posture={latestPosture}
              score={latestScores?.posture ?? 0}
            />
            <EyeBlinkScoreCard
              blinkData={latestEyeBlink}
              score={latestScores?.eye_blink ?? 0}
            />
            <DiseaseRiskCard
              diseaseRisk={latestDiseaseRisk}
              score={latestScores?.disease_risk ?? 0}
            />
          </div>
        ) : (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-dark-500 mb-3" />
            <p className="text-sm text-dark-400">No recent session data</p>
            <p className="text-xs text-dark-500 mt-1">Complete an analysis session to populate these cards</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AnalyticsChart
          data={trends}
          dataKey="avg_posture_score"
          color="#818cf8"
          title="Posture Score Trends"
        />
        <AnalyticsChart
          data={trends}
          dataKey="avg_eye_blink_score"
          color="#34d399"
          title="Blink Rate Trends"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-400" />
          Recent Activity
        </h2>
        <ActivityTimeline sessions={sessions} />
      </div>
    </motion.div>
  );
}
