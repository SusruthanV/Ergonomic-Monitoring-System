import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Play, Square, Activity } from 'lucide-react';
import clsx from 'clsx';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraActive: boolean;
  isSessionActive: boolean;
  overlayFrame?: string;
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
  overlayFrame,
  error,
  onStartCamera,
  onStopCamera,
  onStartSession,
  onStopSession,
}: CameraViewProps) {
  const overlayImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (overlayFrame && overlayImgRef.current) {
      overlayImgRef.current.src = overlayFrame;
    }
  }, [overlayFrame]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'glass rounded-2xl overflow-hidden transition-all duration-500',
        isSessionActive && 'glow-primary'
      )}
    >
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Camera Feed</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    isCameraActive ? 'bg-secondary-500 animate-pulse-soft' : 'bg-dark-500'
                  )}
                />
                <span className="text-xs text-dark-400">
                  {isCameraActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSessionActive && (
              <span className="px-2 py-1 rounded-md bg-primary-500/10 text-primary-400 text-xs font-medium flex items-center gap-1">
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
            <CameraOff className="w-12 h-12" />
            <span className="text-sm">Camera not active</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dark-500 gap-3 p-4">
            <CameraOff className="w-12 h-12 text-red-400/50" />
            <span className="text-sm text-red-400/70 text-center">{error}</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {overlayFrame && (
          <img
            ref={overlayImgRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
            alt="Pose overlay"
          />
        )}
        {isSessionActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft shadow-lg shadow-red-500/50" />
            <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          ) : (
            <>
              {!isSessionActive ? (
                <button
                  onClick={onStartSession}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary-500 to-emerald-600 hover:from-secondary-600 hover:to-emerald-700 text-white text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-lg shadow-secondary-500/25"
                >
                  <Play className="w-4 h-4" />
                  Start Analysis
                </button>
              ) : (
                <button
                  onClick={onStopSession}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Analysis
                </button>
              )}
              <button
                onClick={onStopCamera}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-dark-300 text-sm font-medium transition-all duration-300 ease-out border border-white/[0.06]"
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
