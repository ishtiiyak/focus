import { useEffect, useRef } from 'react';

export const useAccurateTimer = (callback, targetTime, running) => {
  const savedCallback = useRef(callback);
  const intervalId = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (running && targetTime) {
      const tick = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000));
        
        savedCallback.current(remaining);

        if (remaining > 0) {
          // Use requestAnimationFrame for better accuracy
          intervalId.current = requestAnimationFrame(tick);
        }
      };

      intervalId.current = requestAnimationFrame(tick);

      return () => {
        if (intervalId.current) {
          cancelAnimationFrame(intervalId.current);
        }
      };
    }
  }, [running, targetTime]);
}; 