import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Timer, Pause, Play, Square, WifiOff, Maximize, Minimize, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCamera } from '../hooks/useCamera';
import CameraView from '../components/CameraView';
import OverallScoreCard from '../components/OverallScoreCard';
import PostureScoreCard from '../components/PostureScoreCard';
import EyeBlinkScoreCard from '../components/EyeBlinkScoreCard';
import DiseaseRiskCard from '../components/DiseaseRiskCard';
import clsx from 'clsx';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function playBeep(freq: number, dur: number) {
  try {
    const vol = useStore.getState().volume;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol * 0.8, ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* ignore */ }
}

let _beepCooldown = false;
function tryBeep(freq: number, dur: number) {
  if (_beepCooldown) return;
  _beepCooldown = true;
  playBeep(freq, dur);
  setTimeout(() => { _beepCooldown = false; }, 2000);
}

function computeDemoPostureScore(neck: number, shoulder: number, spine: number): number {
  const neckScore = Math.max(0, 100 - (neck / 30) * 100);
  const shoulderScore = Math.max(0, 100 - (shoulder / 25) * 100);
  const spineScore = Math.max(0, 100 - (spine / 15) * 100);
  return clampScore(neckScore * 0.4 + shoulderScore * 0.3 + spineScore * 0.3);
}

function computeDemoBlinkScore(blinkRate: number): number {
  if (blinkRate === 0) return 50;
  if (blinkRate >= 15 && blinkRate <= 20) return 100;
  if (blinkRate < 15) return clampScore(100 - ((15 - blinkRate) / 15) * 100);
  return clampScore(100 - ((blinkRate - 20) / 20) * 100);
}

function computeDemoDiseaseRiskScore(risk: number): number {
  return clampScore(100 - risk);
}

function computeDemoGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

function generateDemoResult() {
  const neck = Math.random() * 35;
  const shoulder = Math.random() * 30;
  const spine = Math.random() * 25;
  const blinkRate = 10 + Math.random() * 15;
  const riskScore = Math.random() * 40;

  const postureScore = computeDemoPostureScore(neck, shoulder, spine);
  const blinkScore = computeDemoBlinkScore(blinkRate);
  const riskScoreVal = computeDemoDiseaseRiskScore(riskScore);
  const overallScore = clampScore(postureScore * 0.4 + blinkScore * 0.25 + riskScoreVal * 0.35);

  const recommendations: string[] = [];
  if (postureScore < 70) recommendations.push('Improve your posture: keep your back straight and shoulders level.');
  if (blinkScore < 70) recommendations.push('Your blink rate needs attention. Take conscious breaks to blink.');
  if (riskScoreVal < 70) recommendations.push('Your disease risk scores are elevated. Review recommendations.');
  if (recommendations.length === 0) recommendations.push('Excellent ergonomic health! Keep up your good habits.');

  return {
    type: 'analysis',
    timestamp: Date.now().toString(),
    posture: {
      neck_angle: neck,
      shoulder_angle: shoulder,
      spine_angle: spine,
      is_good_posture: neck < 25 && shoulder < 20 && spine < 18,
      feedback: neck > 25 ? 'Try straightening your neck' : 'Good posture',
    },
    eye_blink: {
      ear_value: 0.25 + Math.random() * 0.1,
      is_blink: Math.random() > 0.8,
      blink_count: Math.floor(Math.random() * 50),
      blink_rate_per_minute: blinkRate,
      total_blinks: Math.floor(Math.random() * 100),
    },
    disease_risk: {
      cervical_spondylosis: Math.random() * 40,
      carpal_tunnel: Math.random() * 30,
      text_neck: Math.random() * 35,
      scoliosis_risk: Math.random() * 20,
      lower_back_pain: Math.random() * 25,
      overall_risk_score: riskScore,
      recommendations: ['Take regular breaks', 'Maintain good posture'],
    },
    scores: {
      overall_score: overallScore,
      posture_score: postureScore,
      eye_blink_score: blinkScore,
      disease_risk_score: riskScoreVal,
      grade: computeDemoGrade(overallScore),
      breakdown: { posture_weight: 0.4, eye_blink_weight: 0.25, disease_risk_weight: 0.35 },
      recommendations,
    },
  };
}

export default function Analysis() {
  const {
    isSessionActive,
    latestPosture,
    latestEyeBlink,
    latestDiseaseRisk,
    latestScores,
    sessionElapsed,
    isFullscreen,
    setSessionActive,
    updateAnalysis,
    addToHistory,
    setSessionElapsed,
    resetSessionData,
    toggleFullscreen,
  } = useStore();

  const { sendFrame, sendStartSession, sendStopSession, lastResult, isConnected } = useWebSocket();
  const {
    videoRef,
    canvasRef,
    isActive: isCameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    stopCapture,
  } = useCamera();

  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const lastScoreUpdateRef = useRef(0);
  const pendingResultRef = useRef<any>(null);

  useEffect(() => {
    if (lastResult && isSessionActive) {
      const now = Date.now();
      if (now - lastScoreUpdateRef.current >= 3000) {
        lastScoreUpdateRef.current = now;
        updateAnalysis(lastResult);
        addToHistory(lastResult);
        const blink = lastResult.eye_blink as any;
        const postureScore = (lastResult.scores as any)?.posture_score ?? (lastResult.scores as any)?.posture ?? 100;
        const blinkRate = blink?.blink_rate_per_minute ?? blink?.blink_rate ?? 15;
        const grade = lastResult.scores?.grade ?? 'N/A';
      } else {
        pendingResultRef.current = lastResult;
      }
    }
  }, [lastResult, isSessionActive, updateAnalysis, addToHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingResultRef.current) {
        const result = pendingResultRef.current;
        pendingResultRef.current = null;
        lastScoreUpdateRef.current = Date.now();
        updateAnalysis(result);
        addToHistory(result);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const beepFrameRef = useRef(0);

  useEffect(() => {
    if (!isSessionActive || !latestScores) return;
    const p = latestScores.posture;
    if (p < 50) tryBeep(330, 0.4);
    else if (p < 70) tryBeep(440, 0.4);
  }, [latestScores, isSessionActive]);

  useEffect(() => {
    if (isSessionActive && !isConnected && !demoIntervalRef.current) {
      toast('Backend offline — showing preview data', { icon: '🔮' });
      demoIntervalRef.current = setInterval(() => {
        if (isPausedRef.current) return;
        const demo = generateDemoResult();
        updateAnalysis(demo);
        addToHistory(demo);
      }, 2500);
    }
    if (isConnected && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    if (!isSessionActive && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, [isSessionActive, isConnected]);

  const startSession = useCallback(async () => {
    setSessionActive(true);
    setIsPaused(false);
    isPausedRef.current = false;
    resetSessionData();

    sendStartSession();

    sessionTimerRef.current = setInterval(() => {
      const start = useStore.getState().sessionStartTime || Date.now();
      useStore.getState().setSessionElapsed(
        Math.floor((Date.now() - start) / 1000)
      );
    }, 1000);

    captureFrame((frame) => {
      if (!isPausedRef.current && isConnected) sendFrame(frame);
    }, 400);

    toast.success('Session started');
  }, [captureFrame, sendFrame, sendStartSession, isConnected]);

  const stopSession = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    sendStopSession();
    stopCapture();
    stopCamera();
    setIsPaused(false);
    setSessionActive(false);
    toast.success('Session ended');
  }, [sendStopSession, stopCapture, stopCamera]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      startCamera().then(() => {
        captureFrame((frame) => {
          if (isConnected) sendFrame(frame);
        }, 400);
      });
      toast('Analysis resumed');
    } else {
      stopCapture();
      stopCamera();
      toast('Analysis paused');
    }
    setIsPaused((p) => !p);
  }, [isPaused, isConnected, startCamera, stopCamera, captureFrame, sendFrame, stopCapture]);

  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      stopCamera();
    };
  }, [stopCamera]);

  const isFullscreenRef = useRef(isFullscreen);
  const isSessionActiveRef = useRef(isSessionActive);
  const isCameraActiveRef = useRef(isCameraActive);

  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);
  useEffect(() => { isSessionActiveRef.current = isSessionActive; }, [isSessionActive]);
  useEffect(() => { isCameraActiveRef.current = isCameraActive; }, [isCameraActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && isFullscreenRef.current) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === ' ' && isSessionActiveRef.current) {
        e.preventDefault();
        togglePause();
      }
      if ((e.key === 'r' || e.key === 'R') && isSessionActiveRef.current) {
        e.preventDefault();
        stopSession();
      }
      if ((e.key === 's' || e.key === 'S') && !isSessionActiveRef.current && isCameraActiveRef.current) {
        e.preventDefault();
        startSession();
      }
      if ((e.key === 'c' || e.key === 'C') && !isCameraActiveRef.current) {
        e.preventDefault();
        startCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, togglePause, stopSession, startSession, startCamera]);

  return (
    <div className={clsx('min-h-full', isFullscreen && 'fixed inset-0 z-50 bg-dark-900 overflow-hidden flex flex-col')}>
      <div className={clsx('flex items-center justify-between', isFullscreen ? 'px-4 py-2' : 'mb-6')}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={clsx('font-bold text-dark-50 flex items-center gap-3', isFullscreen ? 'text-lg' : 'text-2xl')}>
            <Activity className={clsx('text-primary-400', isFullscreen ? 'w-5 h-5' : 'w-6 h-6')} />
            Real-time Analysis
          </h1>
          {!isFullscreen && (
            <p className="text-sm text-dark-400 mt-1">
              Live posture and ergonomic monitoring
            </p>
          )}
        </motion.div>

        <div className="flex items-center gap-3">
          {!isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20">
              <WifiOff className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-xs text-accent-400">Backend offline</span>
            </div>
          )}
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20"
            >
              <Timer className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-mono font-bold text-primary-300">
                {formatTime(sessionElapsed)}
              </span>
            </motion.div>
          )}
          <div className="relative group">
            <button
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 transition-all duration-200"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4 text-dark-300" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 p-3 rounded-xl bg-dark-800 border border-dark-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <p className="text-xs font-semibold text-dark-50 mb-2">Keyboard Shortcuts</p>
              <div className="space-y-1.5 text-xs text-dark-400">
                <div className="flex justify-between"><span>Start Camera</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">C</kbd></div>
                <div className="flex justify-between"><span>Start Session</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">S</kbd></div>
                <div className="flex justify-between"><span>Pause/Resume</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">Space</kbd></div>
                <div className="flex justify-between"><span>Stop Session</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">R</kbd></div>
                <div className="flex justify-between"><span>Fullscreen</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">F</kbd></div>
                <div className="flex justify-between"><span>Exit Fullscreen</span><kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono">Esc</kbd></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 transition-all duration-200"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-dark-300" />
            ) : (
              <Maximize className="w-4 h-4 text-dark-300" />
            )}
          </button>
        </div>
      </div>

      <div className={clsx(
        'grid gap-4 flex-1 min-h-0',
        isFullscreen ? 'grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'
      )}>
        <div className={clsx('space-y-3 overflow-y-auto', !isFullscreen && 'lg:col-span-1')}>
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            isSessionActive={isSessionActive}
            error={cameraError}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onStartSession={startSession}
            onStopSession={stopSession}
          />

          {isSessionActive && (
            <div className="flex gap-2">
              <button
                onClick={togglePause}
                className={clsx(
                  'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2',
                  isPaused
                    ? 'bg-secondary-500 hover:bg-secondary-600 text-white'
                    : 'bg-accent-500 hover:bg-accent-600 text-white'
                )}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopSession}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </div>
          )}
        </div>

        <div className={clsx(
          'space-y-3 overflow-y-auto pr-2',
          !isFullscreen && 'lg:col-span-2 max-h-[calc(100vh-8rem)]'
        )}>
          {isSessionActive || latestScores ? (
            <>
              <OverallScoreCard scores={latestScores} />
              <PostureScoreCard posture={latestPosture} score={latestScores?.posture ?? 0} />
              <EyeBlinkScoreCard blinkData={latestEyeBlink} score={latestScores?.eye_blink ?? 0} />
              <DiseaseRiskCard diseaseRisk={latestDiseaseRisk} score={latestScores?.disease_risk ?? 0} />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center glass-card"
            >
              <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-6">
                <Activity className="w-10 h-10 text-dark-500" />
              </div>
              <h2 className="text-xl font-semibold text-dark-50 mb-2">Ready to analyze</h2>
              <p className="text-sm text-dark-400 mb-6 max-w-md">
                Start your camera and begin a session to see real-time posture analysis, blink rate tracking, and disease risk assessment.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
