import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Search,
  X,
  Award,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import ActivityTimeline from '../components/ActivityTimeline';
import type { SessionSummary } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ITEMS_PER_PAGE = 10;

export default function History() {
  const { sessions, setSessions } = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.fetchSessions();
      setSessions(data?.sessions || data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    try {
      const date = new Date(s.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return (
        date.toLowerCase().includes(q) ||
        s.id.toString().includes(q) ||
        s.overall_score.toString().includes(q)
      );
    } catch {
      return false;
    }
  });

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSessionClick = async (session: SessionSummary) => {
    setSelectedSession(session);
    setLoadingDetail(true);
    setSessionDetail(null);
    try {
      const detail = await api.fetchSessionDetail(session.id);
      setSessionDetail(detail);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load session details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success('Session deleted');
      if (selectedSession?.id === id) {
        setSelectedSession(null);
        setSessionDetail(null);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete session');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ergoguard-sessions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary-400" />
            Session History
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            View and manage your analysis sessions
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleExport}
          className="px-4 py-2 rounded-xl glass glass-hover text-sm text-dark-300 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </motion.button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search sessions by date, ID, or score..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <ActivityTimeline
                sessions={paginatedSessions}
                onSessionClick={handleSessionClick}
                onDeleteSession={(id) => setConfirmDelete(id)}
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-dark-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedSession ? (
            <motion.div
              key={selectedSession.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Session #{selectedSession.id}
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-dark-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="space-y-3">
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                </div>
              ) : sessionDetail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                    <Award className="w-8 h-8 text-primary-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {sessionDetail.overall_score?.toFixed(0) || selectedSession.overall_score.toFixed(0)}
                      </div>
                      <div className="text-xs text-dark-400">Overall Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <div className="text-xs text-dark-400">Duration</div>
                      <div className="text-sm font-semibold text-white">
                        {selectedSession.duration_minutes.toFixed(1)} min
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <div className="text-xs text-dark-400">Date</div>
                      <div className="text-sm font-semibold text-white">
                        {new Date(selectedSession.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="glass rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-dark-400">Posture</div>
                      <div className="text-sm font-bold text-primary-400">
                        {sessionDetail.posture_score?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-dark-400">Eye Blink</div>
                      <div className="text-sm font-bold text-secondary-400">
                        {sessionDetail.eye_blink_score?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-dark-400">Risk</div>
                      <div className="text-sm font-bold text-accent-400">
                        {sessionDetail.disease_risk_score?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-dark-400 text-center py-8">No detail data available</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card flex flex-col items-center justify-center py-16"
            >
              <Clock className="w-16 h-16 text-dark-500 mb-4" />
              <p className="text-sm text-dark-400">Select a session to view details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-sm mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Delete Session?</h3>
              </div>
              <p className="text-sm text-dark-300 mb-6">
                This action cannot be undone. All analysis data for this session will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass glass-hover text-sm font-medium text-dark-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
