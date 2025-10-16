import { useRef, useCallback, useEffect } from 'react';

/**
 * A custom hook to throttle a function call.
 * This ensures that the function is called at most once within a specified time period.
 *
 * @param callback The function to be throttled.
 * @param delay The throttle delay in milliseconds.
 * @returns A throttled version of the callback function.
 */
export const useRateLimiter = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const canRun = useRef(true);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup the timer when the component unmounts
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (canRun.current) {
        canRun.current = false;
        callback(...args);
        timer.current = setTimeout(() => {
          canRun.current = true;
        }, delay);
      }
    },
    [callback, delay]
  );

  return throttledCallback;
};
