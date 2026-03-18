import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
    onTick?: (remaining: number) => void;
    onComplete?: () => void;
    onTenMinutes?: () => void;
    onFiveMinutes?: () => void;
}

/**
 * タイマーロジックフック
 */
export function useTimer(options: UseTimerOptions = {}) {
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const tenMinutesCalled = useRef(false);
    const fiveMinutesCalled = useRef(false);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback((minutes: number) => {
        clearTimer();
        const seconds = minutes * 60;
        setTotalSeconds(seconds);
        setRemainingSeconds(seconds);
        setIsRunning(true);
        tenMinutesCalled.current = false;
        fiveMinutesCalled.current = false;
    }, [clearTimer]);

    const pause = useCallback(() => {
        clearTimer();
        setIsRunning(false);
    }, [clearTimer]);

    const resume = useCallback(() => {
        setIsRunning(true);
    }, []);

    const reset = useCallback(() => {
        clearTimer();
        setRemainingSeconds(0);
        setTotalSeconds(0);
        setIsRunning(false);
    }, [clearTimer]);

    useEffect(() => {
        if (!isRunning) {
            clearTimer();
            return;
        }

        intervalRef.current = window.setInterval(() => {
            setRemainingSeconds(prev => {
                const newValue = prev - 1;

                // コールバック呼び出し
                options.onTick?.(newValue);

                // 残り10分チェック
                if (newValue === 600 && !tenMinutesCalled.current) {
                    tenMinutesCalled.current = true;
                    options.onTenMinutes?.();
                }

                // 残り5分チェック
                if (newValue === 300 && !fiveMinutesCalled.current) {
                    fiveMinutesCalled.current = true;
                    options.onFiveMinutes?.();
                }

                // タイマー終了
                if (newValue <= 0) {
                    clearTimer();
                    setIsRunning(false);
                    options.onComplete?.();
                    return 0;
                }

                return newValue;
            });
        }, 1000);

        return () => clearTimer();
    }, [isRunning, options, clearTimer]);

    // 進捗率（0-1）
    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

    return {
        remainingSeconds,
        totalSeconds,
        isRunning,
        progress,
        start,
        pause,
        resume,
        reset,
    };
}
