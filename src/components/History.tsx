import { useTaskContext } from '../context/TaskContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { History as HistoryIcon, Trash2, CheckCircle2, Clock, Calendar as CalendarIcon, Plus } from 'lucide-react';

export function History() {
    const { tasks, clearHistory, reuseTask, setCurrentPhase } = useTaskContext();
    const completedTasks = tasks
        .filter(t => t.completedAt)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    const handleReuse = (task: any) => {
        reuseTask(task);
        // Optional: show a small toast or just switch back to setup
        if (confirm('リストに追加しました。準備画面に戻りますか？')) {
            setCurrentPhase('setup');
        }
    };

    if (completedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[32px] shadow-soft border border-slate-50 animate-fade-in mx-4 sm:mx-0">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <HistoryIcon size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">履歴はまだありません</h3>
                <p className="text-sm">完了したタスクがここに表示されます。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in flex flex-col h-full px-4 sm:px-0 pb-20">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-ikea-blue)]/10 rounded-2xl flex items-center justify-center text-[var(--color-ikea-blue)]">
                        <HistoryIcon size={24} />
                    </div>
                    学習履歴
                </h2>
                <button
                    onClick={() => confirm('全ての履歴を削除しますか？') && clearHistory()}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">履歴をクリア</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {completedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="group bg-white p-5 sm:p-6 rounded-[2.5rem] shadow-soft border border-slate-50 hover:shadow-lg hover:border-[var(--color-ikea-blue)]/20 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                    >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="text-green-500 w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    task.level === 'high' ? 'bg-red-50 text-red-500' :
                                    task.level === 'medium' ? 'bg-orange-50 text-orange-500' :
                                    'bg-blue-50 text-blue-500'
                                }`}>
                                    Level {task.level}
                                </span>
                                <span className="text-slate-300 text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {task.estimatedMinutes} min
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-[var(--color-ikea-blue)] transition-colors">
                                {task.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-400 text-[10px] sm:text-xs font-bold">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <CalendarIcon size={12} />
                                    {format(task.completedAt!, 'yyyy/MM/dd (E)', { locale: ja })}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Clock size={12} />
                                    {format(task.completedAt!, 'HH:mm')} 完了
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <button
                                onClick={() => handleReuse(task)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-ikea-blue)] text-white rounded-2xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-900/10"
                            >
                                <Plus size={18} />
                                <span>再追加</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
