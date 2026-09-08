import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle,
  X,
  Clock,
  Flame,
  Lightbulb,
  ExternalLink,
  Video,
} from 'lucide-react';
import { Exercise } from '../types';
import clsx from 'clsx';

interface ExercisePlayerProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExercisePlayer({ exercise, onClose }: ExercisePlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.steps[0]?.duration_seconds || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const totalSteps = exercise.steps.length;
  const step = exercise.steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setTimeLeft(exercise.steps[currentStep + 1].duration_seconds);
    } else {
      setCompleted(true);
      setIsPlaying(false);
    }
  }, [currentStep, totalSteps, exercise.steps]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setTimeLeft(exercise.steps[currentStep - 1].duration_seconds);
    }
  }, [currentStep, exercise.steps]);

  useEffect(() => {
    if (!isPlaying || completed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          goToNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, completed, goToNextStep]);

  const handleRestart = () => {
    setCurrentStep(0);
    setTimeLeft(exercise.steps[0].duration_seconds);
    setIsPlaying(false);
    setCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalTimeLeft = exercise.steps
    .slice(currentStep)
    .reduce((sum, s) => sum + s.duration_seconds, 0) - (step.duration_seconds - timeLeft);

  const hasVideo = exercise.video_url && exercise.video_url.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-900/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800 sticky top-0 bg-dark-900/95 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-lg font-bold text-dark-50">{exercise.name}</h2>
            <p className="text-xs text-dark-400">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-dark-700 transition-colors"
          >
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-3">
          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-dark-500">
            <span>{formatTime(totalTimeLeft)} remaining</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Video Section */}
        {hasVideo && (
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <Video className="w-4 h-4 text-primary-400" />
                <span>{exercise.video_title || 'Watch the demonstration'}</span>
              </div>
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                {showVideo ? 'Hide' : 'Show'} Video
              </button>
            </div>
            <AnimatePresence>
              {showVideo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-xl"
                >
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={exercise.video_url}
                      title={exercise.video_title || exercise.name}
                      className="absolute inset-0 w-full h-full rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-secondary-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-secondary-400" />
                </div>
                <h3 className="text-xl font-bold text-dark-50 mb-2">Exercise Complete!</h3>
                <p className="text-sm text-dark-400 mb-1">
                  You finished all {totalSteps} steps
                </p>
                <p className="text-xs text-dark-500 mb-6">
                  Estimated {exercise.calories_estimate} calories burned
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-xl glass glass-hover text-sm text-dark-300 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Do Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium flex items-center gap-2"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Timer */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-dark-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-dark-50 font-mono">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <svg className="absolute inset-0 w-24 h-24 -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-primary-500/30"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - timeLeft / step.duration_seconds)}`}
                        className="text-primary-400 transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Instruction */}
                <div className="text-center mb-4">
                  <p className="text-base text-dark-100 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>

                {/* Tip */}
                {step.tip && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-500/5 border border-accent-500/10 mb-4">
                    <Lightbulb className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-dark-300">{step.tip}</p>
                  </div>
                )}

                {/* Step indicators */}
                <div className="flex justify-center gap-1.5">
                  {exercise.steps.map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        i < currentStep
                          ? 'bg-secondary-400'
                          : i === currentStep
                          ? 'bg-primary-400 w-4'
                          : 'bg-dark-700'
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        {!completed && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-dark-800">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center disabled:opacity-30 hover:bg-dark-700 transition-colors"
            >
              <SkipBack className="w-4 h-4 text-dark-300" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={goToNextStep}
              disabled={currentStep === totalSteps - 1}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center disabled:opacity-30 hover:bg-dark-700 transition-colors"
            >
              <SkipForward className="w-4 h-4 text-dark-300" />
            </button>
          </div>
        )}

        {/* Exercise info */}
        <div className="px-4 pb-4 flex justify-center gap-4 text-xs text-dark-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{exercise.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>{exercise.calories_estimate} cal</span>
          </div>
          {hasVideo && (
            <a
              href={exercise.video_url.replace('/embed/', '/watch?v=')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch on YouTube</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
