import { NextRequest, NextResponse } from 'next/server';
import { SLOT_LABELS } from '@/lib/types';
import { generateFallbackReading } from '@/lib/fallback-reading';
import { checkContentSafety } from '@/lib/content-safety';
import type { ReadingResult } from '@/lib/types';

interface CardPayload {
  id: number;
  name_cn: string;
  name_en: string;
  isReversed: boolean;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_meaning_short: string;
  reversed_meaning_short: string;
}

interface ReadingRequest {
  question: string;
  cards: CardPayload[];
}

const SYSTEM_PROMPT = `你是一位温和、理性的塔罗解读者。你的目标是帮助用户梳理情绪与行动选择，但绝不做出宿命论式的判断。

核心原则：
1. 永远避免"你一定会/必然/注定"这样的宿命论表述
2. 不制造焦虑，不渲染灾难性后果
3. 承接用户的情绪，给出选择空间和小步行动建议
4. 必须引用用户问题中的核心实体或关系（如具体的人、事、选择）
5. 语气：神秘但克制，温暖但有边界

安全规则（强制）：
- 医疗/法律/投资问题：仅给一般性建议，并提示咨询专业人士
- 不提供确定性操作指令
- 不要求用户提供敏感个人信息

输出格式（严格遵循）：
你必须返回一个合法的 JSON 对象，格式如下，不要包含任何 markdown 代码块标记：
{
  "summary": "一句话总结（20-40字，带安抚）",
  "overview": "总体解读（围绕用户问题语境，80-120字）",
  "cards": [
    {
      "position": "situation",
      "positionLabel": "现状",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（60-100字）"
    },
    {
      "position": "challenge",
      "positionLabel": "阻碍",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（60-100字，非指责语气）"
    },
    {
      "position": "guidance",
      "positionLabel": "建议",
      "cardName": "牌名（正位/逆位）",
      "isReversed": false,
      "interpretation": "该牌位解读（60-100字，强调选择权在用户）"
    }
  ],
  "suggestions": [
    "具体可执行的建议1",
    "具体可执行的建议2",
    "具体可执行的建议3"
  ],
  "encouragement": "一句鼓励收尾（不鸡汤、不过度承诺）"
}

总字数控制在 350-700 字之间。语言：中文。`;

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

  return `用户问题：${question}

三张牌：
${cardDescriptions.join('\n')}

请严格按照系统提示中的 JSON 格式输出解读结果。`;
}

async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseReadingResponse(raw: string): ReadingResult {
  // Try to extract JSON from the response
  let jsonStr = raw.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr);

  // Validate structure
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

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json();
    const { question, cards } = body;

    // Validate input
    if (!question || question.length < 5 || question.length > 120) {
      return NextResponse.json(
        { error: '问题长度应在5-120字之间' },
        { status: 400 }
      );
    }

    if (!cards || cards.length !== 3) {
      return NextResponse.json(
        { error: '需要恰好3张牌' },
        { status: 400 }
      );
    }

    // Content safety check
    const safetyResult = checkContentSafety(question);

    // Try LLM generation
    try {
      const userPrompt = buildUserPrompt(question, cards);
      const rawResponse = await callDeepSeek(SYSTEM_PROMPT, userPrompt);
      let reading = parseReadingResponse(rawResponse);

      // Append safety disclaimers if needed
      if (safetyResult.disclaimers.length > 0) {
        reading.encouragement +=
          '\n\n' + safetyResult.disclaimers.join('\n\n');
      }

      return NextResponse.json({ reading, source: 'llm' });
    } catch (llmError) {
      console.error('LLM generation failed, using fallback:', llmError);

      // Fallback to template-based reading
      const fallbackCards = cards.map((card, i) => ({
        card: card as any,
        isReversed: card.isReversed,
        position: SLOT_LABELS[i].key,
        positionLabel: SLOT_LABELS[i].label,
      }));

      const reading = generateFallbackReading(question, fallbackCards);

      // Append safety disclaimers
      if (safetyResult.disclaimers.length > 0) {
        reading.encouragement +=
          '\n\n' + safetyResult.disclaimers.join('\n\n');
      }

      return NextResponse.json({ reading, source: 'fallback' });
    }
  } catch (error: any) {
    console.error('Reading API error:', error);
    return NextResponse.json(
      { error: '解读生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
