import { useState } from 'react';
import { Sparkles, Plus, Clock } from 'lucide-react';
import { type UnderstandingLevel, LEVEL_INFO } from '../types';
import { analyzeTask, generateTaskId } from '../utils/helpers';
import { analyzeTaskWithGemini } from '../lib/gemini';
import { useTaskContext } from '../context/TaskContext';

export function TaskForm() {
    const { addTask } = useTaskContext();
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState<UnderstandingLevel>('review');
    const [details, setDetails] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState<number>(10);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!title.trim()) return;

        setIsAnalyzing(true);

        // Gemini APIで分析を試みる
        const geminiResult = await analyzeTaskWithGemini(title, level, details);

        if (geminiResult) {
            setEstimatedMinutes(geminiResult.minutes);
            // ここで理由（reasoning）を表示するUIがあると良いが、今回は時間は反映のみ
        } else {
            // 失敗またはキーがない場合は既存のロジックを使用
            setTimeout(() => {
                const suggested = analyzeTask(title, level, details);
                setEstimatedMinutes(suggested);
            }, 500);
        }

        setIsAnalyzing(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            id: generateTaskId(),
            title: title.trim(),
            level,
            details: details.trim(),
            estimatedMinutes,
            createdAt: Date.now(),
        });

        // フォームリセット
        setTitle('');
        setLevel('review');
        setDetails('');
        setEstimatedMinutes(10);
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 animate-spring-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-[var(--color-ikea-blue)]" />
                新しいタスク
            </h2>

            <div className="space-y-5">
                {/* タイトル */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                        タスク名
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例: 英単語50個を暗記する"
                        className="input-field"
                        required
                    />
                </div>

                {/* 理解度 */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                        理解度
                    </label>
                    <div className="flex gap-3">
                        {(Object.keys(LEVEL_INFO) as UnderstandingLevel[]).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setLevel(key)}
                                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${level === key
                                    ? LEVEL_INFO[key].className
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {LEVEL_INFO[key].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 詳細 */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                        詳細（オプション）
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="タスクの詳細やメモを入力..."
                        className="input-field min-h-[100px] resize-none"
                        rows={3}
                    />
                </div>

                {/* AI分析 & 時間設定 */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            推定時間（分）
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={estimatedMinutes}
                                onChange={(e) => setEstimatedMinutes(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={120}
                                className="input-field w-24 text-center text-lg font-bold"
                            />
                            <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={!title.trim() || isAnalyzing}
                        className={`btn btn-accent ${isAnalyzing ? 'opacity-70' : ''}`}
                    >
                        <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? '分析中...' : 'AI分析'}
                    </button>
                </div>

                {/* 追加ボタン */}
                <button
                    type="submit"
                    disabled={!title.trim()}
                    className="btn btn-primary w-full mt-4"
                >
                    <Plus className="w-5 h-5" />
                    タスクを追加
                </button>
            </div>
        </form>
    );
}
