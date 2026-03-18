import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, AppState, CalendarEvent } from '../types';
import { saveTasks, loadTasks, saveVoiceEnabled, loadVoiceEnabled, saveEvents, loadEvents } from '../utils/helpers';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface TaskContextType {
    tasks: Task[];
    events: CalendarEvent[];
    currentPhase: AppState['currentPhase'];
    setCurrentPhase: (phase: AppState['currentPhase']) => void;
    voiceEnabled: boolean;
    currentTaskIndex: number;
    user: User | null;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    logout: () => Promise<void>;
    addTask: (task: Task) => void;
    removeTask: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    reorderTasks: (fromIndex: number, toIndex: number) => void;
    addEvent: (event: CalendarEvent) => void;
    removeEvent: (id: string) => void;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    startTimer: () => void;
    nextTask: () => void;
    resetToSetup: () => void;
    setVoiceEnabled: (enabled: boolean) => void;
    completeCurrentTask: () => void;
    getCurrentTask: () => Task | null;
    insertTask: (task: Task) => void;
    reuseTask: (task: Task) => void;
    clearHistory: () => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentPhase, setCurrentPhase] = useState<AppState['currentPhase']>('setup');
    const [voiceEnabled, setVoiceEnabledState] = useState(true);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    // 初期ロード & 認証監視
    useEffect(() => {
        // 1. ローカル設定とタスクの読み込み
        const savedVoice = loadVoiceEnabled();
        setVoiceEnabledState(savedVoice);

        // Supabaseが無効、または未ログイン時はローカルデータを採用
        if (!isSupabaseEnabled) {
            setTasks(loadTasks());
            setEvents(loadEvents());
            return;
        }

        if (!supabase) return; // TypeScript guard

        // 2. セッション確認
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchTasksFromSupabase(session.user.id);
                fetchEventsFromSupabase(session.user.id);
            } else {
                setTasks(loadTasks());
                setEvents(loadEvents());
            }
        });

        // 3. 認証状態の変更監視
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchTasksFromSupabase(session.user.id);
                fetchEventsFromSupabase(session.user.id);
            } else {
                setTasks(loadTasks());
                setEvents(loadEvents());
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // DBからタスク取得
    const fetchTasksFromSupabase = async (_userId: string) => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            return;
        }

        if (data) {
            // DBのカラム名をフロントエンドに合わせる変換が必要ならここで行う
            // 今回はカラム名と型が一致している前提 (camelCase vs snake_caseに注意)
            // Supabaseは通常 snake_case なのでマッピングする
            const mappedTasks: Task[] = data.map((d: any) => ({
                id: d.id,
                title: d.title,
                level: d.level,
                details: d.details,
                estimatedMinutes: d.estimated_minutes,
                createdAt: new Date(d.created_at).getTime(), // timestamp string -> number
                completedAt: d.completed_at ? new Date(d.completed_at).getTime() : undefined,
            }));
            setTasks(mappedTasks);
        }
    };

    const fetchEventsFromSupabase = async (_userId: string) => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('events')
            .select('*');
        
        if (error) {
            console.error('Error fetching events:', error);
            return;
        }

        if (data) {
            const mappedEvents: CalendarEvent[] = data.map((d: any) => ({
                id: d.id,
                title: d.title,
                start: new Date(d.start_time),
                end: new Date(d.end_time),
                details: d.description,
            }));
            setEvents(mappedEvents);
        }
    };

    // 変更時に保存 (Local)
    useEffect(() => {
        saveTasks(tasks); 
    }, [tasks]);

    useEffect(() => {
        saveEvents(events);
    }, [events]);

    const logout = useCallback(async () => {
        if (supabase) {
            await supabase.auth.signOut();
            setUser(null);
            setTasks(loadTasks()); 
            setEvents(loadEvents());
        }
    }, []);

    // DB操作ヘルパー
    const saveTaskToSupabase = async (task: Task) => {
        if (!user || !supabase) return;
        try {
            await supabase.from('tasks').upsert({
                id: task.id,
                user_id: user.id,
                title: task.title,
                level: task.level,
                details: task.details,
                estimated_minutes: task.estimatedMinutes,
                created_at: new Date(task.createdAt).toISOString(),
                completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
            });
        } catch (e) {
            console.error('DB Save Error:', e);
        }
    };

    const deleteTaskFromSupabase = async (id: string) => {
        if (!user || !supabase) return;
        await supabase.from('tasks').delete().match({ id });
    };

    const saveEventToSupabase = async (event: CalendarEvent) => {
        if (!user || !supabase) return;
        try {
            await supabase.from('events').upsert({
                id: event.id,
                user_id: user.id,
                title: event.title,
                start_time: event.start.toISOString(),
                end_time: event.end.toISOString(),
                description: event.details || null,
            });
        } catch (e) {
            console.error('DB Sync Error:', e);
        }
    };

    const deleteEventFromSupabase = async (id: string) => {
        if (!user || !supabase) return;
        await supabase.from('events').delete().match({ id });
    };

    const addTask = useCallback((task: Task) => {
        setTasks(prev => [...prev, task]);
        saveTaskToSupabase(task);
    }, [user]);

    const removeTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        deleteTaskFromSupabase(id);
    }, [user]);

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        setTasks((prev) => {
            const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            const updatedTask = next.find(t => t.id === id);
            if (updatedTask) {
                saveTaskToSupabase(updatedTask);
            }
            return next;
        });
    }, [user]);

    const addEvent = useCallback((event: CalendarEvent) => {
        setEvents(prev => [...prev, event]);
        saveEventToSupabase(event);
    }, [user]);

    const removeEvent = useCallback((id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        deleteEventFromSupabase(id);
    }, [user]);

    const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
        setEvents(prev => {
           const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
           const updated = next.find(e => e.id === id);
           if (updated) saveEventToSupabase(updated);
           return next;
        });
    }, [user]);

    const reorderTasks = useCallback((fromIndex: number, toIndex: number) => {
        setTasks(prev => {
            const newTasks = [...prev];
            const [removed] = newTasks.splice(fromIndex, 1);
            newTasks.splice(toIndex, 0, removed);
            return newTasks;
        });
    }, []);

    const startTimer = useCallback(() => {
        const activeTasks = tasks.filter(t => !t.completedAt);
        if (activeTasks.length > 0) {
            setCurrentTaskIndex(0);
            setCurrentPhase('timer');
        }
    }, [tasks]);

    const nextTask = useCallback(() => {
        const activeTasks = tasks.filter(t => !t.completedAt);
        const nextIndex = currentTaskIndex + 1;
        if (nextIndex < activeTasks.length) {
            setCurrentTaskIndex(nextIndex);
        } else {
            setCurrentPhase('complete');
        }
    }, [currentTaskIndex, tasks]);

    const completeCurrentTask = useCallback(() => {
        const activeTasks = tasks.filter(t => !t.completedAt);
        const taskToComplete = activeTasks[currentTaskIndex];
        if (taskToComplete) {
            setTasks(prev => {
                const newTasks = prev.map(t =>
                    t.id === taskToComplete.id ? { ...t, completedAt: Date.now() } : t
                );
                const updatedTask = newTasks.find(t => t.id === taskToComplete.id);
                if (updatedTask) {
                    saveTaskToSupabase(updatedTask);
                }
                return newTasks;
            });
        }
    }, [currentTaskIndex, tasks, user]);

    const resetToSetup = useCallback(() => {
        setCurrentPhase('setup');
        setCurrentTaskIndex(0);
        // We keep tasks in state to preserve history. UI will filter them based on completedAt.
    }, []);

    const insertTask = useCallback((task: Task) => {
        const activeTasks = tasks.filter(t => !t.completedAt);
        const currentActiveTask = activeTasks[currentTaskIndex];
        
        setTasks(prev => {
            const next = [...prev];
            // Find the global index of the current active task to insert after it
            const globalIndex = currentActiveTask ? next.findIndex(t => t.id === currentActiveTask.id) : -1;
            
            if (globalIndex !== -1) {
                next.splice(globalIndex + 1, 0, task);
            } else {
                next.push(task);
            }
            return next;
        });
        saveTaskToSupabase(task);
    }, [currentTaskIndex, tasks, user]);

    const reuseTask = useCallback((task: Task) => {
        const newTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            completedAt: undefined, // Clear completion state
        };
        setTasks(prev => [...prev, newTask]);
        saveTaskToSupabase(newTask);
    }, [user]);

    const clearHistory = useCallback(async () => {
        const completedTasks = tasks.filter(t => t.completedAt);
        if (user && supabase) {
            for (const t of completedTasks) {
                await deleteTaskFromSupabase(t.id);
            }
        }
        setTasks(prev => prev.filter(t => !t.completedAt));
    }, [tasks, user]);

    const setVoiceEnabled = useCallback((enabled: boolean) => {
        setVoiceEnabledState(enabled);
        saveVoiceEnabled(enabled);
    }, []);

    const getCurrentTask = useCallback(() => {
        const activeTasks = tasks.filter(t => !t.completedAt);
        return activeTasks[currentTaskIndex] || null;
    }, [tasks, currentTaskIndex]);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                events,
                currentPhase,
                setCurrentPhase,
                voiceEnabled,
                currentTaskIndex,
                user,
                isAuthModalOpen,
                setAuthModalOpen,
                logout,
                addTask,
                removeTask,
                updateTask,
                reorderTasks,
                addEvent,
                removeEvent,
                updateEvent,
                startTimer,
                nextTask,
                resetToSetup,
                setVoiceEnabled,
                completeCurrentTask,
                getCurrentTask,
                insertTask,
                reuseTask,
                clearHistory,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTaskContext() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
}
