import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  RefreshCw,
  Sparkles,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Exercise } from '../types';
import { api } from '../services/api';
import ExerciseCard from '../components/ExerciseCard';
import ExercisePlayer from '../components/ExercisePlayer';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<string, string> = {
  neck: 'Neck',
  shoulder: 'Shoulders',
  wrist: 'Wrists & Hands',
  back: 'Back',
  eye: 'Eyes',
  posture: 'Posture',
  general: 'General',
};

export default function Exercises() {
  const [recommendations, setRecommendations] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recData, allData] = await Promise.all([
        api.fetchExerciseRecommendations(),
        api.fetchAllExercises(),
      ]);
      setRecommendations(recData?.exercises || []);
      setAllExercises(allData?.exercises || []);
      setCategories(allData?.categories || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExercises = selectedCategory
    ? allExercises.filter((ex) => ex.category === selectedCategory)
    : allExercises;

  const displayExercises = activeTab === 'recommended' ? recommendations : filteredExercises;

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      </div>
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
          <Dumbbell className="w-6 h-6 text-primary-400" />
          Exercise Recommendations
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          Personalized exercises based on your ergonomic analysis
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('recommended')}
          className={clsx(
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
            activeTab === 'recommended'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10'
              : 'glass text-dark-400 hover:text-dark-200'
          )}
        >
          <Sparkles className="w-4 h-4" />
          For You ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={clsx(
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
            activeTab === 'all'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10'
              : 'glass text-dark-400 hover:text-dark-200'
          )}
        >
          <Filter className="w-4 h-4" />
          All Exercises ({allExercises.length})
        </button>
      </div>

      {/* Category filter (only in "All" tab) */}
      {activeTab === 'all' && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
              !selectedCategory
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'glass text-dark-400 hover:text-dark-200'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize',
                selectedCategory === cat
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'glass text-dark-400 hover:text-dark-200'
              )}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Recommendations info */}
      {activeTab === 'recommended' && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 mb-6 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-dark-200 font-medium">
              Personalized for your needs
            </p>
            <p className="text-xs text-dark-400 mt-0.5">
              These exercises are tailored based on your recent posture analysis and risk scores.
              Click any exercise to start a guided session.
            </p>
          </div>
        </motion.div>
      )}

      {/* No data state */}
      {activeTab === 'recommended' && recommendations.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-lg font-semibold text-dark-50 mb-2">No data yet</h3>
          <p className="text-sm text-dark-400 max-w-md mx-auto">
            Complete an analysis session first. Your exercise recommendations will be
            personalized based on your posture and health data.
          </p>
        </motion.div>
      )}

      {/* Exercise Grid */}
      {displayExercises.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayExercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={setSelectedExercise}
              isRecommended={activeTab === 'recommended'}
            />
          ))}
        </div>
      )}

      {/* Exercise Player */}
      <AnimatePresence>
        {selectedExercise && (
          <ExercisePlayer
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
