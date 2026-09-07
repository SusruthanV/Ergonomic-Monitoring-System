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
  FileText,
  Save,
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
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);

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
        s.overall_score.toString().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
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
    setSessionNotes(session.notes || '');
    try {
      const detail = await api.fetchSessionDetail(session.id);
      setSessionDetail(detail);
      if (detail.notes) setSessionNotes(detail.notes);
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

  const handleSaveNotes = async () => {
    if (!selectedSession) return;
    setSavingNotes(true);
    try {
      await api.updateSessionNotes(selectedSession.id, sessionNotes || null);
      setSessions(sessions.map((s) =>
        s.id === selectedSession.id ? { ...s, notes: sessionNotes || null } : s
      ));
      toast.success('Notes saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
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
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
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
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-800/40 border border-dark-800 text-sm text-dark-50 placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:bg-dark-800/60 transition-all duration-300 ease-out"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-50 transition-colors duration-300 ease-out"
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
                    className="p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ease-out"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-dark-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ease-out"
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
                <h3 className="text-sm font-semibold text-dark-50">
                  Session #{selectedSession.id}
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-dark-400 hover:text-dark-50 transition-colors duration-300 ease-out"
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
                      <div className="text-2xl font-bold text-dark-50">
                        {sessionDetail.overall_score?.toFixed(0) || selectedSession.overall_score.toFixed(0)}
                      </div>
                      <div className="text-xs text-dark-400">Overall Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <div className="text-xs text-dark-400">Duration</div>
                      <div className="text-sm font-semibold text-dark-50">
                        {selectedSession.duration_minutes.toFixed(1)} min
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <div className="text-xs text-dark-400">Date</div>
                      <div className="text-sm font-semibold text-dark-50">
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

                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-dark-400" />
                        <span className="text-xs text-dark-400">Session Notes</span>
                      </div>
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className={clsx(
                          'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                          savingNotes
                            ? 'text-dark-500 cursor-not-allowed'
                            : 'text-primary-400 hover:bg-primary-500/10'
                        )}
                      >
                        <Save className="w-3 h-3" />
                        {savingNotes ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Add notes about this session..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-dark-900/50 border border-dark-700 text-sm text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 resize-none transition-all duration-200"
                    />
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
                <h3 className="text-lg font-semibold text-dark-50">Delete Session?</h3>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out"
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
