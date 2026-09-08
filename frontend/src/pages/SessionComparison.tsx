import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompareArrows,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { formatISTShort } from '../utils/dates';
import ComparisonBar from '../components/ComparisonBar';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface SessionOption {
  id: number;
  created_at: string;
  duration_minutes: number;
  avg_overall_score: number | null;
}

export default function SessionComparison() {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [session1Id, setSession1Id] = useState<number | null>(null);
  const [session2Id, setSession2Id] = useState<number | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.fetchSessions();
      const allSessions = data?.sessions || [];
      const validSessions = allSessions.filter(
        (s: SessionOption) => s.avg_overall_score !== null
      );
      setSessions(validSessions);
      if (validSessions.length >= 2) {
        setSession1Id(validSessions[0].id);
        setSession2Id(validSessions[1].id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCompare = async () => {
    if (!session1Id || !session2Id) {
      toast.error('Please select two sessions to compare');
      return;
    }
    if (session1Id === session2Id) {
      toast.error('Please select two different sessions');
      return;
    }

    setComparing(true);
    setComparison(null);
    try {
      const data = await api.compareSessions(session1Id, session2Id);
      setComparison(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to compare sessions');
    } finally {
      setComparing(false);
    }
  };

  const getSessionLabel = (session: SessionOption) => {
    const date = formatISTShort(session.created_at);
    const score = session.avg_overall_score?.toFixed(1) || 'N/A';
    return `${date} (Score: ${score})`;
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (sessions.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-6">
          <GitCompareArrows className="w-10 h-10 text-dark-500" />
        </div>
        <h2 className="text-xl font-semibold text-dark-50 mb-2">Not enough sessions</h2>
        <p className="text-sm text-dark-400 max-w-md">
          You need at least 2 analysis sessions to compare. Complete more sessions to see your improvement over time.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
          <GitCompareArrows className="w-6 h-6 text-primary-400" />
          Session Comparison
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          Compare two sessions to see your improvement
        </p>
      </motion.div>

      {/* Session Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <label className="text-xs text-dark-400 uppercase tracking-wider mb-2 block">
            Session 1 (Before)
          </label>
          <select
            value={session1Id || ''}
            onChange={(e) => setSession1Id(Number(e.target.value))}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500 transition-colors"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === session2Id}>
                {getSessionLabel(s)}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4"
        >
          <label className="text-xs text-dark-400 uppercase tracking-wider mb-2 block">
            Session 2 (After)
          </label>
          <select
            value={session2Id || ''}
            onChange={(e) => setSession2Id(Number(e.target.value))}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500 transition-colors"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === session1Id}>
                {getSessionLabel(s)}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Compare Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <button
          onClick={handleCompare}
          disabled={comparing || !session1Id || !session2Id || session1Id === session2Id}
          className={clsx(
            'px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200',
            comparing
              ? 'bg-primary-500/50 text-white cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
          )}
        >
          {comparing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompareArrows className="w-4 h-4" />
              Compare Sessions
            </>
          )}
        </button>
      </motion.div>

      {/* Results */}
      {comparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-secondary-400" />
              </div>
              <div className="text-2xl font-bold text-secondary-400">
                {comparison.summary.improved_count}
              </div>
              <div className="text-xs text-dark-400">Improved</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-dark-400" />
              </div>
              <div className="text-2xl font-bold text-dark-400">
                {comparison.summary.unchanged_count}
              </div>
              <div className="text-xs text-dark-400">Unchanged</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {comparison.summary.declined_count}
              </div>
              <div className="text-xs text-dark-400">Declined</div>
            </motion.div>
          </div>

          {/* Session Info Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-dark-400" />
                </div>
                <span className="text-sm font-medium text-dark-200">Session 1</span>
              </div>
              <p className="text-xs text-dark-400 mb-2">{formatISTShort(comparison.session_1.created_at)}</p>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{comparison.session_1.duration_minutes} minutes</span>
              </div>
              <div className="mt-3 pt-3 border-t border-dark-800">
                <div className="text-2xl font-bold text-dark-50">
                  {comparison.session_1.scores.overall.toFixed(1)}
                </div>
                <div className="text-xs text-dark-400">Overall Score</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-sm font-medium text-dark-200">Session 2</span>
              </div>
              <p className="text-xs text-dark-400 mb-2">{formatISTShort(comparison.session_2.created_at)}</p>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{comparison.session_2.duration_minutes} minutes</span>
              </div>
              <div className="mt-3 pt-3 border-t border-dark-800">
                <div className="text-2xl font-bold text-dark-50">
                  {comparison.session_2.scores.overall.toFixed(1)}
                </div>
                <div className="text-xs text-dark-400">Overall Score</div>
              </div>
            </motion.div>
          </div>

          {/* Comparison Bars */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Detailed Comparison
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ComparisonBar
                label="Overall Score"
                before={comparison.comparison.overall_score.before}
                after={comparison.comparison.overall_score.after}
                change={comparison.comparison.overall_score.change}
                percentChange={comparison.comparison.overall_score.percent_change}
                improved={comparison.comparison.overall_score.improved}
                higherIsBetter={true}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <ComparisonBar
                label="Posture Score"
                before={comparison.comparison.posture_score.before}
                after={comparison.comparison.posture_score.after}
                change={comparison.comparison.posture_score.change}
                percentChange={comparison.comparison.posture_score.percent_change}
                improved={comparison.comparison.posture_score.improved}
                higherIsBetter={true}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ComparisonBar
                label="Eye Blink Score"
                before={comparison.comparison.eye_blink_score.before}
                after={comparison.comparison.eye_blink_score.after}
                change={comparison.comparison.eye_blink_score.change}
                percentChange={comparison.comparison.eye_blink_score.percent_change}
                improved={comparison.comparison.eye_blink_score.improved}
                higherIsBetter={true}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <ComparisonBar
                label="Disease Risk Score"
                before={comparison.comparison.disease_risk_score.before}
                after={comparison.comparison.disease_risk_score.after}
                change={comparison.comparison.disease_risk_score.change}
                percentChange={comparison.comparison.disease_risk_score.percent_change}
                improved={comparison.comparison.disease_risk_score.improved}
                higherIsBetter={true}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ComparisonBar
                label="Neck Angle"
                before={comparison.comparison.neck_angle.before}
                after={comparison.comparison.neck_angle.after}
                change={comparison.comparison.neck_angle.change}
                percentChange={comparison.comparison.neck_angle.percent_change}
                improved={comparison.comparison.neck_angle.improved}
                higherIsBetter={false}
                unit="°"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <ComparisonBar
                label="Shoulder Angle"
                before={comparison.comparison.shoulder_angle.before}
                after={comparison.comparison.shoulder_angle.after}
                change={comparison.comparison.shoulder_angle.change}
                percentChange={comparison.comparison.shoulder_angle.percent_change}
                improved={comparison.comparison.shoulder_angle.improved}
                higherIsBetter={false}
                unit="°"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ComparisonBar
                label="Spine Angle"
                before={comparison.comparison.spine_angle.before}
                after={comparison.comparison.spine_angle.after}
                change={comparison.comparison.spine_angle.change}
                percentChange={comparison.comparison.spine_angle.percent_change}
                improved={comparison.comparison.spine_angle.improved}
                higherIsBetter={false}
                unit="°"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <ComparisonBar
                label="Blink Rate"
                before={comparison.comparison.blink_rate.before}
                after={comparison.comparison.blink_rate.after}
                change={comparison.comparison.blink_rate.change}
                percentChange={comparison.comparison.blink_rate.percent_change}
                improved={comparison.comparison.blink_rate.improved}
                higherIsBetter={false}
                unit="/min"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <ComparisonBar
                label="Overall Risk Score"
                before={comparison.comparison.risk_score.before}
                after={comparison.comparison.risk_score.after}
                change={comparison.comparison.risk_score.change}
                percentChange={comparison.comparison.risk_score.percent_change}
                improved={comparison.comparison.risk_score.improved}
                higherIsBetter={false}
                unit="%"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
