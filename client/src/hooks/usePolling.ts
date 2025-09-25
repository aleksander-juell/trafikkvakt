import { useEffect, useRef } from 'react';

export function usePolling(
  callback: () => void, 
  interval: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  const intervalRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled]);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}