import { Trash2, Clock, GripVertical, Play } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { LEVEL_INFO } from '../types';

export function TaskList() {
    const { tasks, removeTask, startTimer } = useTaskContext();
    const activeTasks = tasks.filter(t => !t.completedAt);

    if (activeTasks.length === 0) {
        return (
            <div className="card p-8 text-center animate-fade-in shadow-soft border border-slate-50">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">
                    タスクがありません
                </h3>
                <p className="text-slate-400 text-sm">
                    右のフォームからタスクを追加するか、<br/>履歴から再追加してください。
                </p>
            </div>
        );
    }

    const totalMinutes = activeTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-800">
                    タスクリスト
                    <span className="ml-2 text-sm font-bold text-slate-400">
                        ({activeTasks.length}件)
                    </span>
                </h2>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>
                        合計: {hours > 0 ? `${hours}h ` : ''}{mins}m
                    </span>
                </div>
            </div>

            {/* タスク一覧 */}
            <div className="space-y-3">
                {activeTasks.map((task, index) => (
                    <div
                        key={task.id}
                        className="card p-4 animate-slide-up bg-white border border-slate-50 hover:border-[var(--color-ikea-blue)]/20 shadow-soft"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            {/* 順番表示 */}
                            <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                                <GripVertical className="w-5 h-5 text-slate-200 cursor-grab" />
                                <span className="text-xs font-black text-slate-300">
                                    {index + 1}
                                </span>
                            </div>

                            {/* コンテンツ */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${LEVEL_INFO[task.level].className}`}>
                                        {LEVEL_INFO[task.level].label}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {task.estimatedMinutes}分
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 truncate">
                                    {task.title}
                                </h3>
                                {task.details && (
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                        {task.details}
                                    </p>
                                )}
                            </div>

                            {/* 実行 & 削除ボタン */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => startTimer(task.id)}
                                    className="p-3 bg-[var(--color-ikea-blue)] text-white rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-900/10"
                                    title="タイマーを開始"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                </button>
                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                                    title="削除"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
