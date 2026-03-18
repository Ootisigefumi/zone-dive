import { useCallback, useRef } from 'react';

interface SpeechOptions {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

/**
 * Web Speech API を使用した音声合成フック
 */
export function useSpeech() {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = useCallback((text: string, options: SpeechOptions = {}) => {
        // 前の発話をキャンセル
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'ja-JP';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // 日本語の音声を探す
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
        if (japaneseVoice) {
            utterance.voice = japaneseVoice;
        }

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    return { speak, stop };
}

// 音声コーチングメッセージ
export const VOICE_MESSAGES = {
    tenMinutes: '残り10分。ペースを上げてください。',
    fiveMinutes: '残り5分。ラストスパートです。',
    finished: '終了。次のタスクへ移行します。',
    allComplete: '全てのタスクが完了しました。お疲れ様でした。',
    taskStart: (taskName: string) => `${taskName}を開始します。`,
};
