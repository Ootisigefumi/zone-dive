// Task types and interfaces for ZoneDive

export type UnderstandingLevel = 'new' | 'review' | 'perfect';

export interface Task {
    id: string;
    title: string;
    level: UnderstandingLevel;
    details: string;
    estimatedMinutes: number;
    createdAt: number;
    completedAt?: number;
}

export interface TimerState {
    isRunning: boolean;
    currentTaskIndex: number;
    remainingSeconds: number;
    totalSeconds: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  details?: string;
  taskId?: string; // タスクから予定を作った際の紐付け用
}

export interface AppState {
    tasks: Task[];
    events: CalendarEvent[];
    timerState: TimerState;
    voiceEnabled: boolean;
    currentPhase: 'setup' | 'timer' | 'complete' | 'calendar';
}

// Understanding level display info
export const LEVEL_INFO: Record<UnderstandingLevel, { label: string; multiplier: number; className: string }> = {
    new: { label: '初見', multiplier: 1.5, className: 'level-new' },
    review: { label: '復習', multiplier: 1.0, className: 'level-review' },
    perfect: { label: '完璧', multiplier: 0.6, className: 'level-perfect' },
};
