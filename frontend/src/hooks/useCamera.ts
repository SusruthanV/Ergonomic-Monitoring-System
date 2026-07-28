import { useRef, useState, useCallback } from 'react';

const FRAME_WIDTH = 640;
const FRAME_HEIGHT = 480;
const JPEG_QUALITY = 0.7;

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: FRAME_WIDTH },
          height: { ideal: FRAME_HEIGHT },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err: any) {
      const message = err?.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : `Camera error: ${err?.message || 'Unknown error'}`;
      setError(message);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureFrame = useCallback(
    (onFrame: (base64: string) => void, intervalMs: number = 2000) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = FRAME_WIDTH;
        canvas.height = FRAME_HEIGHT;
        ctx.drawImage(video, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        const message = JSON.stringify({ type: 'frame', data: base64 });
        onFrame(message);
      }, intervalMs);
    },
    []
  );

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    stream: streamRef.current,
    isActive,
    startCamera,
    stopCamera,
    captureFrame,
    stopCapture,
    error,
  };
}
