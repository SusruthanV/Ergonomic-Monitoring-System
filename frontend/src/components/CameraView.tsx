import { motion } from 'framer-motion';
import { Camera, CameraOff, Play, Square, Activity } from 'lucide-react';
import clsx from 'clsx';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraActive: boolean;
  isSessionActive: boolean;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartSession: () => void;
  onStopSession: () => void;
}

export default function CameraView({
  videoRef,
  canvasRef,
  isCameraActive,
  isSessionActive,
  error,
  onStartCamera,
  onStopCamera,
  onStartSession,
  onStopSession,
}: CameraViewProps) {

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'glass rounded-2xl overflow-hidden transition-all duration-500',
        isSessionActive && 'glow-primary'
      )}
    >
      <div className="p-4 border-b border-dark-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Camera className="w-4.5 h-4.5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-dark-50">Camera Feed</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="relative">
                  <div
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      isCameraActive ? 'bg-secondary-500' : 'bg-dark-500'
                    )}
                  />
                  {isCameraActive && <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-secondary-500 animate-ping-slow opacity-75" />}
                </div>
                <span className="text-xs text-dark-400">
                  {isCameraActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSessionActive && (
              <span className="px-2.5 py-1 rounded-lg bg-primary-500/[0.08] text-primary-400 text-xs font-semibold flex items-center gap-1 border border-primary-500/20">
                <Activity className="w-3 h-3 animate-pulse-soft" />
                Analyzing
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-dark-950 aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={clsx(
            'w-full h-full object-cover',
            !isCameraActive && 'hidden'
          )}
          style={{ transform: 'scaleX(-1)' }}
        />
        {!isCameraActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dark-500 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <CameraOff className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">Camera not active</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dark-500 gap-3 p-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-red-400/60" />
            </div>
            <span className="text-sm text-red-400/70 text-center">{error}</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {isSessionActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping-slow opacity-75" />
            </div>
            <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
              REC
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              onClick={onStartCamera}
              className="btn-primary flex-1 py-2.5"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          ) : (
            <>
              {!isSessionActive ? (
                <button
                  onClick={onStartSession}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary-500 to-emerald-600 hover:from-secondary-600 hover:to-emerald-700 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-secondary-500/25"
                >
                  <Play className="w-4 h-4" />
                  Start Analysis
                </button>
              ) : (
                <button
                  onClick={onStopSession}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <Square className="w-4 h-4" />
                  Stop Analysis
                </button>
              )}
              <button
                onClick={onStopCamera}
                className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-dark-300 text-sm font-medium transition-all border border-white/[0.06]"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
