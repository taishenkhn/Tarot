/**
 * Client-side reading generator: calls DeepSeek API directly from the browser.
 * Used when the app is deployed as a static export (no server-side API routes).
 * Falls back to template-based reading when API key is unavailable or CORS blocks.
 */

import { SLOT_LABELS } from '@/lib/types';
import { generateFallbackReading } from '@/lib/fallback-reading';
import { checkContentSafety } from '@/lib/content-safety';
import type { ReadingResult } from '@/lib/types';

export interface CardPayload {
  id: number;
  name_cn: string;
  name_en: string;
  isReversed: boolean;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_meaning_short: string;
  reversed_meaning_short: string;
}

const SYSTEM_PROMPT = `你是一位温和、理性的塔罗解读者，面向所有对生活、情感、事业、人际关系等方面有困惑的人。你的目标是帮助用户梳理情绪与行动选择，但绝不做出宿命论式的判断。

核心原则：
1. 永远避免"你一定会/必然/注定"这样的宿命论表述
2. 不制造焦虑，不渲染灾难性后果
3. 承接用户的情绪，给出选择空间和小步行动建议
4. 必须引用用户问题中的核心实体或关系（如具体的人、事、选择）
5. 语气：神秘但克制，温暖但有边界
6. 善于运用富有诗意的比喻和意象来辅助解读，让用户更容易理解牌面的深意

安全规则（强制）：
- 医疗/法律/投资问题：仅给一般性建议，并提示咨询专业人士
- 不提供确定性操作指令

输出格式（严格遵循）：
你必须返回一个合法的 JSON 对象，格式如下，不要包含任何 markdown 代码块标记：
{
  "summary": "一句话总结（20-40字，带安抚）",
  "overview": "总体解读（围绕用户问题语境，120-180字，深度分析牌面与用户处境的关联）",
  "cards": [
    {
      "position": "situation",
      "positionLabel": "现状",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（150-200字，深入分析用户当前处境，给出有洞察力的解读）"
    },
    {
      "position": "challenge",
      "positionLabel": "阻碍",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（150-200字，非指责语气，温和地指出隐性障碍与需要关注的方面）"
    },
    {
      "position": "guidance",
      "positionLabel": "建议",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（150-200字，强调选择权在用户，给出策略性启示和可落地的思考方向）"
    }
  ],
  "suggestions": [
    "具体可执行的建议1",
    "具体可执行的建议2",
    "具体可执行的建议3"
  ],
  "encouragement": "一句鼓励收尾（不鸡汤、不过度承诺）"
}

总字数控制在 800-1200 字之间。每张牌的解读不少于150字。语言：中文。`;

function buildUserPrompt(question: string, cards: CardPayload[]): string {
  const cardDescriptions = cards.map((card, i) => {
    const position = card.isReversed ? '逆位' : '正位';
    const keywords = card.isReversed
      ? card.reversed_keywords.join('、')
      : card.upright_keywords.join('、');
    const meaning = card.isReversed
      ? card.reversed_meaning_short
      : card.upright_meaning_short;
    return `Slot${i + 1}(${SLOT_LABELS[i].label}/${SLOT_LABELS[i].description}) ${card.name_cn}（${position}），关键词：${keywords}，含义：${meaning}`;
  });

  return `用户问题：${question}\n\n三张牌：\n${cardDescriptions.join('\n')}\n\n请严格按照系统提示中的 JSON 格式输出解读结果。`;
}

function parseReadingResponse(raw: string): ReadingResult {
  let jsonStr = raw.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];

  const parsed = JSON.parse(jsonStr);

  if (
    !parsed.summary ||
    !parsed.overview ||
    !Array.isArray(parsed.cards) ||
    parsed.cards.length !== 3 ||
    !Array.isArray(parsed.suggestions) ||
    !parsed.encouragement
  ) {
    throw new Error('Invalid reading structure');
  }
  return parsed as ReadingResult;
}

export async function generateReading(
  question: string,
  cards: CardPayload[]
): Promise<{ reading: ReadingResult; source: 'llm' | 'fallback' }> {
  const safetyResult = checkContentSafety(question);

  // Try LLM if API key available
  const apiKey =
    process.env.NEXT_PUBLIC_GLM_API_KEY ||
    (typeof window !== 'undefined'
      ? (window as any).__GLM_API_KEY
      : undefined);

  const baseUrl =
    process.env.NEXT_PUBLIC_GLM_BASE_URL ||
    'https://open.bigmodel.cn/api/paas/v4';

  if (apiKey) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(question, cards) },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || '';
        const reading = parseReadingResponse(raw);

        if (safetyResult.disclaimers.length > 0) {
          reading.encouragement += '\n\n' + safetyResult.disclaimers.join('\n\n');
        }
        return { reading, source: 'llm' };
      }
    } catch (err) {
      console.warn('DeepSeek API call failed, using fallback:', err);
    }
  }

  // Fallback to template-based reading
  const fallbackCards = cards.map((card, i) => ({
    card: card as any,
    isReversed: card.isReversed,
    position: SLOT_LABELS[i].key,
    positionLabel: SLOT_LABELS[i].label,
  }));
  const reading = generateFallbackReading(question, fallbackCards);

  if (safetyResult.disclaimers.length > 0) {
    reading.encouragement += '\n\n' + safetyResult.disclaimers.join('\n\n');
  }
  return { reading, source: 'fallback' };
}
