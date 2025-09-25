import { useEffect, useState } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// Enhanced polling that respects page visibility
export function useSmartPolling(
  callback: () => void, 
  activeInterval: number = 15000,   // Poll every 15s when page is active
  backgroundInterval: number = 60000, // Poll every 60s when page is hidden
  enabled: boolean = true
) {
  const isVisible = usePageVisibility();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const interval = isVisible ? activeInterval : backgroundInterval;
    
    const intervalId = setInterval(() => {
      callback();
      setLastUpdate(Date.now());
    }, interval);

    // If page becomes visible and hasn't been updated recently, update immediately
    if (isVisible && Date.now() - lastUpdate > activeInterval) {
      callback();
      setLastUpdate(Date.now());
    }

    return () => clearInterval(intervalId);
  }, [callback, activeInterval, backgroundInterval, enabled, isVisible, lastUpdate]);
}