import type { Task, UnderstandingLevel } from '../types';

/**
 * AI分析モック機能
 * タスクの内容と理解度に基づいて、ギリギリ終わりそうな時間（分）を推定する
 */
export function analyzeTask(title: string, level: UnderstandingLevel, details: string): number {
    // 基本時間（分）
    let baseMinutes = 5;

    // タイトルの文字数に基づく時間追加
    const titleLength = title.length;
    if (titleLength > 20) {
        baseMinutes += 3;
    } else if (titleLength > 10) {
        baseMinutes += 1;
    }

    // 詳細の文字数に基づく時間追加
    const detailsLength = details.length;
    if (detailsLength > 200) {
        baseMinutes += 10;
    } else if (detailsLength > 100) {
        baseMinutes += 6;
    } else if (detailsLength > 50) {
        baseMinutes += 3;
    } else if (detailsLength > 0) {
        baseMinutes += 1;
    }

    // キーワードによる時間調整
    const complexKeywords = ['計算', '暗記', '理解', '分析', '応用', '問題', '練習', '確認'];
    const simpleKeywords = ['読む', '見る', '確認', 'チェック'];

    const fullText = `${title} ${details}`.toLowerCase();

    complexKeywords.forEach(keyword => {
        if (fullText.includes(keyword)) {
            baseMinutes += 2;
        }
    });

    simpleKeywords.forEach(keyword => {
        if (fullText.includes(keyword)) {
            baseMinutes -= 1;
        }
    });

    // 理解度による乗数適用
    const levelMultipliers: Record<UnderstandingLevel, number> = {
        new: 1.5,      // 初見: 1.5倍
        review: 1.0,   // 復習: そのまま
        perfect: 0.6,  // 完璧: 0.6倍
    };

    const adjustedMinutes = Math.round(baseMinutes * levelMultipliers[level]);

    // 最小1分、最大60分に制限
    return Math.max(1, Math.min(60, adjustedMinutes));
}

/**
 * タスクIDを生成
 */
export function generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 秒を MM:SS 形式に変換
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * タスクをLocalStorageに保存
 */
export function saveTasks(tasks: Task[]): void {
    localStorage.setItem('zonedive-tasks', JSON.stringify(tasks));
}

/**
 * LocalStorageからタスクを読み込み
 */
export function loadTasks(): Task[] {
    const stored = localStorage.getItem('zonedive-tasks');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * カレンダーイベントをLocalStorageに保存
 */
export function saveEvents(events: any[]): void {
  localStorage.setItem('zonedive-events', JSON.stringify(events));
}

/**
 * LocalStorageからカレンダーイベントを読み込み
 */
export function loadEvents(): any[] {
  const stored = localStorage.getItem('zonedive-events');
  if (stored) {
    try {
      // 日付文字列をDateオブジェクトに戻す
      const parsed = JSON.parse(stored);
      return parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
      }));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * 音声を有効化設定を保存
 */
export function saveVoiceEnabled(enabled: boolean): void {
    localStorage.setItem('zonedive-voice', JSON.stringify(enabled));
}

/**
 * 音声有効化設定を読み込み
 */
export function loadVoiceEnabled(): boolean {
    const stored = localStorage.getItem('zonedive-voice');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return true;
        }
    }
    return true;
}
