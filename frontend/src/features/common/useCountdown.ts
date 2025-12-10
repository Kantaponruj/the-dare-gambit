import { useEffect, useState, useRef } from "react";

export function useCountdown(
  seconds: number,
  running: boolean,
  onFinish?: () => void
) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((current) => {
          if (current <= 1) {
            onFinish?.();
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running, onFinish]);

  const pct = seconds === 0 ? 0 : Math.max(0, (remaining / seconds) * 100);
  return { remaining, pct };
}
