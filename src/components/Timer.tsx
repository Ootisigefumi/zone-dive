import { useEffect, useRef, useCallback } from 'react';
import { Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useTimer } from '../hooks/useTimer';
import { useSpeech, VOICE_MESSAGES } from '../hooks/useSpeech';
import { formatTime } from '../utils/helpers';

export function Timer() {
    const {
        getCurrentTask,
        nextTask,
        completeCurrentTask,
        currentTaskIndex,
        tasks,
        voiceEnabled,
        setVoiceEnabled,
    } = useTaskContext();

    const { speak } = useSpeech();
    const currentTask = getCurrentTask();
    const isInitialized = useRef(false);
    const alarmRef = useRef<HTMLAudioElement | null>(null);

    // コールバック関数を先に定義
    const handleTenMinutes = useCallback(() => {
        if (voiceEnabled) {
            speak(VOICE_MESSAGES.tenMinutes);
        }
    }, [voiceEnabled, speak]);

    const handleFiveMinutes = useCallback(() => {
        if (voiceEnabled) {
            speak(VOICE_MESSAGES.fiveMinutes);
        }
    }, [voiceEnabled, speak]);

    const handleComplete = useCallback(() => {
        // アラーム音を鳴らす
        if (alarmRef.current) {
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch(() => { });
        }

        completeCurrentTask();

        if (voiceEnabled) {
            if (currentTaskIndex < tasks.length - 1) {
                speak(VOICE_MESSAGES.finished);
            } else {
                speak(VOICE_MESSAGES.allComplete);
            }
        }

        // 自動で次のタスクへ
        setTimeout(() => {
            nextTask();
        }, 1500);
    }, [voiceEnabled, speak, completeCurrentTask, nextTask, currentTaskIndex, tasks.length]);

    const {
        remainingSeconds,
        isRunning,
        progress,
        start,
        pause,
        resume,
    } = useTimer({
        onTenMinutes: handleTenMinutes,
        onFiveMinutes: handleFiveMinutes,
        onComplete: handleComplete,
    });

    // タスク変更時にタイマーを開始
    useEffect(() => {
        if (currentTask && !isInitialized.current) {
            isInitialized.current = true;
            start(currentTask.estimatedMinutes);
            if (voiceEnabled) {
                speak(VOICE_MESSAGES.taskStart(currentTask.title));
            }
        }
    }, [currentTask, start, voiceEnabled, speak]);

    // タスクが変わったら再初期化
    useEffect(() => {
        isInitialized.current = false;
    }, [currentTaskIndex]);

    // 新しいタスクが始まったらタイマーを開始
    useEffect(() => {
        if (currentTask && !isInitialized.current) {
            isInitialized.current = true;
            start(currentTask.estimatedMinutes);
            if (voiceEnabled) {
                speak(VOICE_MESSAGES.taskStart(currentTask.title));
            }
        }
    }, [currentTaskIndex, currentTask, start, voiceEnabled, speak]);

    if (!currentTask) {
        return null;
    }

    // 背景色の決定
    const getBgClass = () => {
        if (progress > 0.5) return 'timer-bg-safe';
        if (progress > 0.2) return 'timer-bg-warning';
        return 'timer-bg-danger';
    };

    // テキスト色
    const getTextColor = () => {
        if (progress > 0.5) return 'text-white';
        if (progress > 0.2) return 'text-gray-900';
        return 'text-white';
    };

    const handleSkip = () => {
        completeCurrentTask();
        nextTask();
    };

    return (
        <div className={`min-h-screen flex flex-col ${getBgClass()} transition-all duration-1000`}>
            {/* アラーム音 */}
            <audio ref={alarmRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2FgoNydWRobXx/g4N2bWJkanV8g4J2bGFlaHZ9goN3bGFlaHZ9goJ3bWJlaHZ9goN2bWJlaHZ9goJ3bGFlaHZ8g4J2bWFlaHZ9goN2bWJlaXd9goJ2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ3bWFlaHZ9g4J2bWJkaHZ9goJ3bWJlaHZ9goJ2bWJlaHZ9goN2bWJlaHd9goJ3bWFlaHZ9g4J2bWJlaHZ9goJ3bWFlaHZ9goN2bWJlaHd9goJ2bWJlaHZ9goN2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ3bWJkaHZ9g4J2bWJlaHZ9goJ3bWFlaHZ9g4J2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ2bWFlaHZ9g4J2bWJkaHZ9goJ3" type="audio/wav" />
            </audio>

            {/* ヘッダー */}
            <div className={`p-6 flex items-center justify-between ${getTextColor()}`}>
                <div>
                    <p className="text-sm opacity-80">
                        タスク {currentTaskIndex + 1} / {tasks.length}
                    </p>
                    <h1 className="text-2xl font-bold truncate max-w-xs">
                        {currentTask.title}
                    </h1>
                </div>
                <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-3 rounded-2xl ${voiceEnabled ? 'bg-white/20' : 'bg-white/10'} transition-all`}
                >
                    {voiceEnabled ? (
                        <Volume2 className="w-6 h-6" />
                    ) : (
                        <VolumeX className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* メインタイマー */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className={`text-[120px] md:text-[180px] font-extrabold tracking-tight ${getTextColor()} ${progress <= 0.2 ? 'animate-countdown-pulse' : ''
                    }`}>
                    {formatTime(remainingSeconds)}
                </div>

                {/* プログレスバー */}
                <div className="w-full max-w-md h-3 bg-white/30 rounded-full overflow-hidden mt-8">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                {/* 残り時間テキスト */}
                <p className={`mt-4 text-lg ${getTextColor()} opacity-80`}>
                    残り {Math.ceil(remainingSeconds / 60)} 分
                </p>
            </div>

            {/* コントロール */}
            <div className="p-8 flex items-center justify-center gap-6">
                <button
                    onClick={isRunning ? pause : resume}
                    className="p-6 bg-white rounded-3xl shadow-xl hover:scale-105 transition-transform"
                >
                    {isRunning ? (
                        <Pause className="w-10 h-10 text-gray-800" />
                    ) : (
                        <Play className="w-10 h-10 text-gray-800" />
                    )}
                </button>
                <button
                    onClick={handleSkip}
                    className="p-4 bg-white/20 rounded-2xl hover:bg-white/30 transition-all"
                >
                    <SkipForward className={`w-8 h-8 ${getTextColor()}`} />
                </button>
            </div>

            {/* タスク詳細 */}
            {currentTask.details && (
                <div className={`px-8 pb-8 ${getTextColor()}`}>
                    <div className="bg-white/10 rounded-2xl p-4">
                        <p className="text-sm opacity-80">{currentTask.details}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
