import { TaskProvider, useTaskContext } from './context/TaskContext';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { Timer } from './components/Timer';
import { CompleteScreen } from './components/CompleteScreen';
import { Header } from './components/Header';
import { Auth } from './components/Auth';
import { Calendar } from './components/Calendar'; // Added Calendar import
import { History } from './components/History';
import './index.css';

import { Zap } from 'lucide-react';

function AppContent() {
  const { currentPhase, user } = useTaskContext();

  if (currentPhase === 'timer') {
    return <Timer />;
  }
  if (currentPhase === 'complete') {
    return <CompleteScreen />;
  }
  if (!user && currentPhase === 'setup') {
    return <Auth />;
  }

  if (currentPhase === 'history') {
    return (
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-160px)] animate-fade-in relative z-10 pb-20">
            <History />
        </div>
    );
  }

  return (
    <>
      {currentPhase === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-160px)] animate-fade-in relative z-10 pb-12">
            <div className="lg:col-span-8 h-full">
                <Calendar />
            </div>
            <div className="lg:col-span-4 h-full">
                <div className="h-full flex flex-col gap-6">
                    <TaskForm />
                    <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-soft p-4 sm:p-6 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-[var(--color-ikea-yellow)] rounded-full"></span>
                                今日のタスク
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <TaskList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-160px)] animate-fade-in relative z-10 pb-12">
            <div className="lg:col-span-8 h-full">
                <div className="bg-white rounded-3xl shadow-soft p-4 sm:p-8 h-full flex flex-col items-center justify-center text-center">
                    <div className="max-w-md space-y-6">
                        <div className="w-20 h-20 bg-[var(--color-ikea-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-10 h-10 text-[var(--color-ikea-blue)]" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                            右のパネルから<br />タスクを追加してください
                        </h2>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            タスクはパーキンソンの法則に基づいて<br />
                            最適な時間が自動設定されます。
                        </p>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-4 h-full">
                <div className="h-full flex flex-col gap-6">
                    <TaskForm />
                    <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-soft p-4 sm:p-6 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-[var(--color-ikea-yellow)] rounded-full"></span>
                                今日のタスク
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <TaskList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-[var(--color-warm-gray)]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 relative">
          <AppContent />
        </main>
      </div>
    </TaskProvider>
  );
}


// Footer is moved inside App or AppContent if needed, but since it's a full-height app,
// we can keep it clean.
