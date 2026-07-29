import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Timer, Pause, Play, Square, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCamera } from '../hooks/useCamera';
import CameraView from '../components/CameraView';
import OverallScoreCard from '../components/OverallScoreCard';
import PostureScoreCard from '../components/PostureScoreCard';
import EyeBlinkScoreCard from '../components/EyeBlinkScoreCard';
import DiseaseRiskCard from '../components/DiseaseRiskCard';
import PostureVisualizer from '../components/PostureVisualizer';
import clsx from 'clsx';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function generateDemoResult() {
  const neck = Math.random() * 35;
  const shoulder = Math.random() * 30;
  const spine = Math.random() * 25;
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
      blink_rate_per_minute: 12 + Math.random() * 12,
      total_blinks: Math.floor(Math.random() * 100),
    },
    disease_risk: {
      cervical_spondylosis: Math.random() * 40,
      carpal_tunnel: Math.random() * 30,
      text_neck: Math.random() * 35,
      scoliosis_risk: Math.random() * 20,
      lower_back_pain: Math.random() * 25,
      overall_risk_score: Math.random() * 30,
      recommendations: ['Take regular breaks', 'Maintain good posture'],
    },
    scores: {
      overall_score: 60 + Math.random() * 35,
      posture_score: 55 + Math.random() * 40,
      eye_blink_score: 60 + Math.random() * 35,
      disease_risk_score: 70 + Math.random() * 25,
      grade: 'B+',
      breakdown: { posture_weight: 0.4, eye_blink_weight: 0.25, disease_risk_weight: 0.35 },
      recommendations: ['Keep up the good habits'],
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
    postureHistory,
    sessionElapsed,
    setSessionActive,
    updateAnalysis,
    addToHistory,
    setSessionElapsed,
    resetSessionData,
  } = useStore();

  const { sendFrame, lastResult, isConnected } = useWebSocket();
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

  useEffect(() => {
    if (lastResult && isSessionActive) {
      updateAnalysis(lastResult);
      addToHistory(lastResult);
    }
  }, [lastResult]);

  useEffect(() => {
    if (isSessionActive && !isConnected && !demoIntervalRef.current) {
      demoIntervalRef.current = setInterval(() => {
        if (isPaused) return;
        const demo = generateDemoResult();
        updateAnalysis(demo);
        addToHistory(demo);
      }, 2500);
      toast('Backend offline — showing preview data', { icon: '🔮' });
    }
    if (isConnected && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    if (!isSessionActive && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, [isSessionActive, isConnected, isPaused]);

  const startSession = useCallback(async () => {
    setSessionActive(true);
    setIsPaused(false);
    resetSessionData();

    sessionTimerRef.current = setInterval(() => {
      const start = useStore.getState().sessionStartTime || Date.now();
      useStore.getState().setSessionElapsed(
        Math.floor((Date.now() - start) / 1000)
      );
    }, 1000);

    captureFrame((frame) => {
      if (!isPaused && isConnected) sendFrame(frame);
    }, 2000);

    toast.success('Session started');
  }, [captureFrame, sendFrame, isPaused, isConnected]);

  const stopSession = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    stopCapture();
    setIsPaused(false);
    setSessionActive(false);
    toast.success('Session ended');
  }, [stopCapture]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
    toast(isPaused ? 'Analysis resumed' : 'Analysis paused');
  }, [isPaused]);

  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  const avgAngles = postureHistory.length > 0
    ? {
        neck: postureHistory.reduce((s, p) => s + p.neck_angle, 0) / postureHistory.length,
        shoulder: postureHistory.reduce((s, p) => s + p.shoulder_angle, 0) / postureHistory.length,
        spine: postureHistory.reduce((s, p) => s + p.spine_angle, 0) / postureHistory.length,
      }
    : { neck: 0, shoulder: 0, spine: 0 };

  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary-400" />
            Real-time Analysis
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Live posture and ergonomic monitoring
          </p>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            isSessionActive={isSessionActive}
            overlayFrame={lastResult?.overlay_frame}
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
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </div>
          )}

          {latestScores && <PostureVisualizer angles={avgAngles} />}
        </div>

        <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
          {isSessionActive || latestScores ? (
            <>
              <div className="sticky top-0 z-10 pb-2" style={{ background: '#0f172a' }}>
                <OverallScoreCard scores={latestScores} />
              </div>
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
              <h2 className="text-xl font-semibold text-white mb-2">Ready to analyze</h2>
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
