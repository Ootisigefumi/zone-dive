import { useEffect, useRef, useCallback, useState } from 'react';
import { Pause, Play, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Square, Plus, X } from 'lucide-react';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { useTimer } from '../hooks/useTimer';
import { useSpeech, VOICE_MESSAGES } from '../hooks/useSpeech';
import { formatTime } from '../utils/helpers';

export function Timer() {
    const {
        getCurrentTask,
        nextTask,
        completeCurrentTask,
        activeTaskId,
        voiceEnabled,
        setVoiceEnabled,
        insertTask,
        resetToSetup,
    } = useTaskContext();

    const { speak } = useSpeech();
    const currentTask = getCurrentTask();
    const isInitialized = useRef(false);
    const alarmRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isInterruptOpen, setIsInterruptOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleTenMinutes = useCallback(() => {
        if (voiceEnabled) speak(VOICE_MESSAGES.tenMinutes);
    }, [voiceEnabled, speak]);

    const handleFiveMinutes = useCallback(() => {
        if (voiceEnabled) speak(VOICE_MESSAGES.fiveMinutes);
    }, [voiceEnabled, speak]);

    const handleComplete = useCallback(() => {
        if (alarmRef.current) {
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch(() => { });
        }
        completeCurrentTask();
        if (voiceEnabled) {
            speak(VOICE_MESSAGES.allComplete);
        }
        setTimeout(() => {
            nextTask();
        }, 1500);
    }, [voiceEnabled, speak, completeCurrentTask, nextTask]);

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

    useEffect(() => {
        if (currentTask && !isInitialized.current) {
            isInitialized.current = true;
            start(currentTask.estimatedMinutes);
            if (voiceEnabled) speak(VOICE_MESSAGES.taskStart(currentTask.title));
        }
    }, [currentTask, start, voiceEnabled, speak]);

    useEffect(() => {
        isInitialized.current = false;
    }, [activeTaskId]);

    if (!currentTask) return null;

    const getBgClass = () => {
        if (progress > 0.5) return 'bg-[#003366]'; // Deep IKEA Blue
        if (progress > 0.2) return 'bg-[#FFCC00]'; // IKEA Yellow
        return 'bg-[#CC0000]'; // Warning Red
    };

    const getTextColor = () => {
        if (progress > 0.5) return 'text-white';
        if (progress > 0.2) return 'text-gray-900';
        return 'text-white';
    };

    const handleSkip = () => {
        completeCurrentTask();
        nextTask();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleInterruptAdd = () => {
        if (!newTaskTitle.trim()) return;
        const task: Task = {
            id: crypto.randomUUID(),
            title: newTaskTitle,
            level: 'medium',
            details: '',
            estimatedMinutes: 25,
            createdAt: Date.now(),
        };
        insertTask(task);
        setNewTaskTitle('');
        setIsInterruptOpen(false);
        if (voiceEnabled) speak(`割り込みタスク「${task.title}」を追加しました。`);
    };

    const handleStop = () => {
        if (confirm('タイマーを停止して準備画面に戻りますか？')) {
            resetToSetup();
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`min-h-screen flex flex-col ${getBgClass()} transition-all duration-1000 overflow-hidden relative`}
        >
            {/* Background Grain/Texture for Premium Feel */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <audio ref={alarmRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2FgoNydWRobXx/g4N2bWJkanV8g4J2bGFlaHZ9goN3bGFlaHZ9goJ3bWJlaHZ9goN2bWJlaHZ9goJ3bGFlaHZ8g4J2bWFlaHZ9goN2bWJlaXd9goJ2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ3bWFlaHZ9g4J2bWJkaHZ9goJ3bWJlaHZ9goJ2bWJlaHZ9goN2bWJlaHd9goJ3bWFlaHZ9g4J2bWJlaHZ9goJ3bWFlaHZ9goN2bWJlaHd9goJ2bWJlaHZ9goN2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ3bWJkaHZ9g4J2bWJlaHZ9goJ3bWFlaHZ9g4J2bWJlaHZ9goJ3bWJlaHZ9goN2bWJlaHd9goJ2bWFlaHZ9g4J2bWJkaHZ9goJ3" type="audio/wav" />
            </audio>

            {/* Header */}
            <div className={`p-8 flex items-center justify-between ${getTextColor()} z-20 relative`}>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 opacity-70 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold uppercase tracking-wider">
                            Focusing on Task
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">
                        {currentTask.title}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-4 rounded-3xl ${voiceEnabled ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/30 active:scale-90 transition-all backdrop-blur-md`}
                    >
                        {voiceEnabled ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-4 rounded-3xl bg-white/10 hover:bg-white/30 active:scale-90 transition-all backdrop-blur-md"
                    >
                        {isFullscreen ? <Minimize2 className="w-7 h-7" /> : <Maximize2 className="w-7 h-7" />}
                    </button>
                    <button
                        onClick={handleStop}
                        className="p-4 rounded-3xl bg-red-500/30 hover:bg-red-500/50 text-red-100 active:scale-90 transition-all backdrop-blur-md"
                    >
                        <Square className="w-7 h-7 fill-current" />
                    </button>
                </div>
            </div>

            {/* Main Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className={`text-[15vw] md:text-[12vw] font-[900] leading-none tracking-tighter tabular-nums ${getTextColor()} drop-shadow-2xl ${
                    progress <= 0.2 ? 'animate-pulse' : ''
                }`}>
                    {formatTime(remainingSeconds)}
                </div>

                {/* Progressive Ring could be added here, but for now stick to bar */}
                <div className="w-full max-w-2xl h-4 bg-white/10 rounded-full mt-12 p-1 backdrop-blur-sm border border-white/5">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                <div className={`mt-8 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-xl font-medium ${getTextColor()} border border-white/5`}>
                    あと <span className="font-bold underline decoration-2">{Math.ceil(remainingSeconds / 60)}</span> 分
                </div>
            </div>

            {/* Controls */}
            <div className="p-12 flex items-center justify-center gap-10 z-20 relative">
                <button
                    onClick={() => setIsInterruptOpen(true)}
                    className="group flex flex-col items-center gap-2"
                >
                    <div className="p-5 bg-white/10 rounded-[2rem] hover:bg-white/20 transition-all text-white backdrop-blur-md active:scale-90">
                        <Plus className="w-8 h-8" />
                    </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${getTextColor()} opacity-60 group-hover:opacity-100 transition-opacity`}>Interrupt</span>
                </button>

                <button
                    onClick={isRunning ? pause : resume}
                    className="p-10 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all group"
                >
                    {isRunning ? (
                        <Pause className="w-16 h-16 text-gray-900 fill-current" />
                    ) : (
                        <Play className="w-16 h-16 text-gray-900 fill-current ml-2" />
                    )}
                </button>

                <button
                    onClick={handleSkip}
                    className="group flex flex-col items-center gap-2"
                >
                    <div className="p-5 bg-white/10 rounded-[2rem] hover:bg-white/20 transition-all text-white backdrop-blur-md active:scale-90">
                        <SkipForward className="w-8 h-8" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${getTextColor()} opacity-60 group-hover:opacity-100 transition-opacity`}>Skip</span>
                </button>
            </div>

            {/* Sub-details (Glassmorphism card) */}
            {currentTask.details && (
                <div className={`mx-auto mb-12 max-w-2xl w-full px-8 z-20 transition-opacity duration-500 ${isRunning ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl">
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${getTextColor()} opacity-50`}>Notes</h3>
                        <p className={`text-lg leading-relaxed ${getTextColor()}`}>{currentTask.details}</p>
                    </div>
                </div>
            )}

            {/* Interrupt Modal */}
            {isInterruptOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">割り込み追加</h2>
                            <button onClick={() => setIsInterruptOpen(false)} className="p-4 hover:bg-gray-100 rounded-3xl transition-all active:scale-90">
                                <X className="w-8 h-8 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                            最優先事項が発生しましたか？<br/>
                            現在のタスクの直後にスロットを確保します。
                        </p>
                        <div className="relative mb-12">
                            <input
                                autoFocus
                                type="text"
                                placeholder="何をしますか？"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInterruptAdd()}
                                className="w-full px-10 py-8 bg-gray-50 border-4 border-transparent focus:border-[var(--color-ikea-blue)] rounded-[2.5rem] text-2xl font-bold outline-none transition-all pr-24 shadow-inner"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                <Plus className="w-10 h-10 text-gray-300" />
                            </div>
                        </div>
                        <button
                            onClick={handleInterruptAdd}
                            className="w-full py-8 bg-[var(--color-ikea-blue)] text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <Plus className="w-8 h-8" />
                            割り込ませる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
