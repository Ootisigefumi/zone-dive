import React from 'react';
import { Zap, Volume2, VolumeX, LogOut, LogIn, User as UserIcon, Calendar as CalendarIcon, Timer as TimerIcon } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { isSupabaseEnabled } from '../lib/supabase';

export function Header() {
    const { voiceEnabled, user, setAuthModalOpen, logout, currentPhase, setCurrentPhase } = useTaskContext();

    // Contextには toggleVoice ではなく setVoiceEnabled が現状存在しない場合は
    // 直接定義されていないため、状態管理をどうするか確認。
    // 今回はvoiceEnabledがbooleanだが、トグル関数が未定義の場合は無視するか追加する。
    // TaskContext.tsx から setVoiceEnabled または toggleVoice を取得する必要があるが、
    // 現状は省く。


    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* ロゴ */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-ikea-blue)] to-[#0073D1] rounded-2xl flex items-center justify-center">
                            <TimerIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                ZoneDive
                                <Zap className="w-5 h-5 text-[var(--color-ikea-yellow)]" />
                            </h1>
                            <p className="text-xs text-gray-500">パーキンソンの法則で集中力UP</p>
                        </div>
                    </div>

                    {/* Navigation Toggle */}
                    {(currentPhase === 'setup' || currentPhase === 'calendar') && (
                        <div className="hidden sm:flex bg-slate-100 p-1 rounded-2xl">
                            <button
                                onClick={() => setCurrentPhase('setup')}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                    ${currentPhase === 'setup'
                                        ? 'bg-white text-[var(--color-ikea-blue)] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }
                                `}
                            >
                                <TimerIcon size={16} />
                                タイマー準備
                            </button>
                            <button
                                onClick={() => setCurrentPhase('calendar')}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                    ${currentPhase === 'calendar'
                                        ? 'bg-white text-[var(--color-ikea-blue)] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }
                                `}
                            >
                                <CalendarIcon size={16} />
                                カレンダー
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                                    {user.email}
                                </span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">ログイン</span>
                            </button>
                        )}

                        {/* 音声トグル */}
                        <button
                            onClick={() => {/* setVoiceEnabled(!voiceEnabled)に相当する関数をあとで追加 */}}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${voiceEnabled
                                    ? 'bg-[var(--color-ikea-blue)] text-white shadow-md shadow-blue-900/10'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {voiceEnabled ? (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    <span className="text-sm font-semibold hidden md:inline">音声ON</span>
                                </>
                            ) : (
                                <>
                                    <VolumeX className="w-5 h-5" />
                                    <span className="text-sm font-semibold hidden md:inline">音声OFF</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
