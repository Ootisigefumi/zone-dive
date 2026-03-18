import { Trash2, Clock, GripVertical, Play } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { LEVEL_INFO } from '../types';

export function TaskList() {
    const { tasks, removeTask, startTimer } = useTaskContext();

    if (tasks.length === 0) {
        return (
            <div className="card p-8 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    タスクがありません
                </h3>
                <p className="text-gray-500">
                    上のフォームからタスクを追加してください
                </p>
            </div>
        );
    }

    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold">
                    タスクリスト
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({tasks.length}件)
                    </span>
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                        合計: {hours > 0 ? `${hours}時間` : ''}{mins}分
                    </span>
                </div>
            </div>

            {/* タスク一覧 */}
            <div className="space-y-3">
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className="card p-4 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            {/* 順番表示 */}
                            <div className="flex flex-col items-center gap-1 pt-1">
                                <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                                <span className="text-xs font-bold text-gray-400">
                                    {index + 1}
                                </span>
                            </div>

                            {/* コンテンツ */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${LEVEL_INFO[task.level].className}`}>
                                        {LEVEL_INFO[task.level].label}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        {task.estimatedMinutes}分
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-800 truncate">
                                    {task.title}
                                </h3>
                                {task.details && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {task.details}
                                    </p>
                                )}
                            </div>

                            {/* 削除ボタン */}
                            <button
                                onClick={() => removeTask(task.id)}
                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* スタートボタン */}
            <button
                onClick={startTimer}
                className="btn btn-primary w-full py-5 text-lg animate-pulse-gentle"
            >
                <Play className="w-6 h-6" />
                タイマースタート
            </button>
        </div>
    );
}
