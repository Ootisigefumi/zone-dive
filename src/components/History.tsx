import { useTaskContext } from '../context/TaskContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { History as HistoryIcon, Trash2, CheckCircle2, Clock, Calendar as CalendarIcon } from 'lucide-react';

export function History() {
    const { tasks, clearHistory } = useTaskContext();
    const completedTasks = tasks
        .filter(t => t.completedAt)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    if (completedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl shadow-soft border border-slate-50 animate-fade-in">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <HistoryIcon size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">履歴はまだありません</h3>
                <p className="text-sm">完了したタスクがここに表示されます。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-ikea-blue)]/10 rounded-2xl flex items-center justify-center text-[var(--color-ikea-blue)]">
                        <HistoryIcon size={24} />
                    </div>
                    学習履歴
                </h2>
                <button
                    onClick={() => confirm('全ての履歴を削除しますか？') && clearHistory()}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                >
                    <Trash2 size={18} />
                    履歴をクリア
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-12">
                {completedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="group bg-white p-6 rounded-[2.5rem] shadow-soft border border-slate-50 hover:shadow-lg hover:border-[var(--color-ikea-blue)]/20 transition-all flex items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="text-green-500 w-8 h-8" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
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
                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs font-bold">
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

                        {task.details && (
                            <div className="hidden lg:block max-w-[200px] text-xs text-slate-400 italic line-clamp-2 px-4 border-l border-slate-100">
                                {task.details}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
