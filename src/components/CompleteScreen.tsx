import { Trophy, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export function CompleteScreen() {
    const { tasks, resetToSetup } = useTaskContext();

    const completedTasks = tasks.filter(t => t.completedAt);
    const totalTime = completedTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex flex-col items-center justify-center p-8">
            <div className="animate-spring-in text-center">
                {/* トロフィー */}
                <div className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-white" />
                </div>

                <h1 className="text-4xl font-extrabold text-white mb-4">
                    お疲れ様でした！
                </h1>
                <p className="text-xl text-white/80 mb-12">
                    すべてのタスクを完了しました
                </p>

                {/* 完了サマリー */}
                <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md mx-auto mb-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">
                                {completedTasks.length}
                            </p>
                            <p className="text-sm text-gray-500">完了タスク</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">
                                {totalTime}分
                            </p>
                            <p className="text-sm text-gray-500">合計時間</p>
                        </div>
                    </div>
                </div>

                {/* 完了タスク一覧 */}
                <div className="bg-white/10 rounded-3xl p-6 max-w-md mx-auto mb-8 text-left">
                    <h3 className="text-white font-semibold mb-4">完了したタスク</h3>
                    <ul className="space-y-2">
                        {completedTasks.map((task) => (
                            <li
                                key={task.id}
                                className="flex items-center gap-3 text-white/90"
                            >
                                <CheckCircle className="w-5 h-5 text-white/70" />
                                <span className="flex-1 truncate">{task.title}</span>
                                <span className="text-sm text-white/60">
                                    {task.estimatedMinutes}分
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 戻るボタン */}
                <button
                    onClick={resetToSetup}
                    className="btn bg-white text-gray-800 hover:bg-gray-100"
                >
                    <RotateCcw className="w-5 h-5" />
                    新しいセッションを始める
                </button>
            </div>
        </div>
    );
}
