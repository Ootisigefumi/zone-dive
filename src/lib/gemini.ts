import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AiAnalysisResult {
    minutes: number;
    reasoning: string;
}

export async function analyzeTaskWithGemini(
    title: string,
    level: string,
    details: string
): Promise<AiAnalysisResult | null> {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
あなたは学習スケジュールの専門家です。以下の学習タスクを実行するために必要な、現実的かつ「集中すればギリギリ終わる」時間を分単位で推定してください。パーキンソンの法則に基づき、少し厳しめの時間を設定するのが目標です。

タスク名: ${title}
現在の理解度: ${level === 'new' ? '初見（初めて学ぶ）' : level === 'review' ? '復習（以前やったことがある）' : '完璧（仕上げ）'}
詳細: ${details || 'なし'}

出力は以下のJSON形式のみで返してください。余計な文字列は含めないでください。
{
  "minutes": (数値),
  "reasoning": (なぜその時間にしたかの短い理由、50文字以内)
}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSONの抽出（Markdown記法が含まれる場合などの対策）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            minutes: Number(parsed.minutes) || 10,
            reasoning: parsed.reasoning || 'AI推定'
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}
