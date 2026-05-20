import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxRetries?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketResult {
  data: unknown;
  isConnected: boolean;
  lastError: string | null;
  reconnect: () => void;
  send: (message: string) => void;
}

/**
 * WebSocket hook with auto-reconnect and heartbeat.
 * Used by Dashboard widgets for real-time data push.
 */
export function useWebSocket({
  url,
  reconnectInterval = 3000,
  maxRetries = 5,
  heartbeatInterval = 30000,
}: UseWebSocketOptions): UseWebSocketResult {
  const [data, setData] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (retryCountRef.current >= maxRetries) {
      setLastError('Max retries reached');
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setLastError(null);
        retryCountRef.current = 0;

        // Start heartbeat
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'pong') return; // Ignore heartbeat
        if (msg.type === 'data') {
          setData(msg.payload);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
        // Auto reconnect
        retryCountRef.current += 1;
        setTimeout(connect, reconnectInterval);
      };

      ws.onerror = () => {
        setLastError('WebSocket connection error');
      };
    } catch (err) {
      setLastError((err as Error).message);
      retryCountRef.current += 1;
      setTimeout(connect, reconnectInterval);
    }
  }, [url, reconnectInterval, maxRetries, heartbeatInterval]);

  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  const send = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data, isConnected, lastError, reconnect, send };
}
