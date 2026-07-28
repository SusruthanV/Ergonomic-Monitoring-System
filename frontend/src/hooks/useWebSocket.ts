import { useRef, useEffect, useState, useCallback } from 'react';
import type { AnalysisResult, ConnectionStats } from '../types';

const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${WS_PROTOCOL}//${window.location.host}/ws/analyze`;
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const frameQueueRef = useRef<string[]>([]);
  const sendingRef = useRef(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    connected: false,
    reconnectAttempts: 0,
    lastConnected: null,
  });

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setConnectionStats({
          connected: true,
          reconnectAttempts: 0,
          lastConnected: new Date(),
        });
        while (frameQueueRef.current.length > 0) {
          const frame = frameQueueRef.current.shift();
          if (frame) ws.send(frame);
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const result: AnalysisResult = JSON.parse(event.data);
          setLastResult(result);
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        setConnectionStats((prev) => ({
          ...prev,
          connected: false,
          reconnectAttempts: reconnectAttemptsRef.current,
        }));
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      scheduleReconnect();
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
      MAX_RECONNECT_DELAY
    );
    reconnectAttemptsRef.current += 1;
    reconnectTimerRef.current = setTimeout(connect, delay);
  }, [connect]);

  const sendFrame = useCallback((frameData: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(frameData);
    } else {
      frameQueueRef.current.push(frameData);
      if (wsRef.current?.readyState !== WebSocket.CONNECTING) {
        connect();
      }
    }
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { sendFrame, lastResult, isConnected, connectionStats };
}
