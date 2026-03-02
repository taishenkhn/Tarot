/**
 * Fallback reading generator
 * Used when LLM API fails or is unavailable
 * Generates structured reading from card keywords and templates
 */
import type { TarotCard, ReadingResult } from './types';
import { SLOT_LABELS } from './types';

interface CardInput {
  card: TarotCard;
  isReversed: boolean;
  position: string;
  positionLabel: string;
}

export function generateFallbackReading(
  question: string,
  cards: CardInput[]
): ReadingResult {
  const card1 = cards[0];
  const card2 = cards[1];
  const card3 = cards[2];

  const getKeywords = (c: CardInput) =>
    c.isReversed ? c.card.reversed_keywords : c.card.upright_keywords;
  const getMeaning = (c: CardInput) =>
    c.isReversed ? c.card.reversed_meaning_short : c.card.upright_meaning_short;
  const getPosition = (c: CardInput) =>
    c.isReversed ? '逆位' : '正位';

  // 1. Summary
  const summary = `关于你的问题，${card1.card.name_cn}、${card2.card.name_cn}与${card3.card.name_cn}为你指引方向。前路虽有挑战，但一切皆有转机与可能。`;

  // 2. Overview (general context)
  const overview = `你的提问涉及"${question.slice(0, 20)}${question.length > 20 ? '...' : ''}"。` +
    `从牌面来看，你现在正处于${getMeaning(card1)}的阶段，这是一个值得深入审视的时刻。` +
    `${card2.card.name_cn}（${getPosition(card2)}）提示你需要关注${getKeywords(card2).slice(0, 2).join('与')}方面的挑战，这或许与你内心的某种纠结或外部环境的变化有关。` +
    `而${card3.card.name_cn}为你指出了${getKeywords(card3).slice(0, 2).join('与')}的可能方向，暗示着在迷雾之中，你有能力找到属于自己的那束光。`;

  // 3. Card interpretations (expanded to 150+ chars each)
  const cardInterpretations = cards.map(c => ({
    position: c.position,
    positionLabel: c.positionLabel,
    cardName: `${c.card.name_cn}（${getPosition(c)}）`,
    isReversed: c.isReversed,
    interpretation: buildInterpretation(c),
  }));

  // 4. Suggestions
  const suggestions = [
    `在${getKeywords(card1)[0]}方面，不妨像整理一间房间那样重新审视你当前的处境。当生活出现新的信号时，及时调整方向远比固守旧有路径更为重要。给自己设定一个小目标，迈出重新评估的第一步。`,
    `面对${getKeywords(card2).slice(0, 2).join('与')}带来的挑战，试着寻找一个可以平衡当前压力的支点。你可以尝试与信任的朋友或前辈沟通，获取不同视角的反馈，也许会有意想不到的收获。`,
    `${card3.card.name_cn}建议你关注${getKeywords(card3)[0]}带来的可能性。在这个方向上迈出试探性的一步，哪怕只是一次小的尝试，也可能为你打开新的局面。`,
  ];

  // 5. Encouragement
  const encouragement = `生活的本质就是在不确定性中寻找属于自己的答案。你已经迈出了面对问题的第一步，这本身就展现了非凡的勇气与智慧。相信自己的直觉与判断力，前方的路会因为你的每一步思考而更加清晰。`;

  return {
    summary,
    overview,
    cards: cardInterpretations,
    suggestions,
    encouragement,
  };
}

function buildInterpretation(c: CardInput): string {
  const pos = c.isReversed ? '逆位' : '正位';
  const keywords = c.isReversed ? c.card.reversed_keywords : c.card.upright_keywords;
  const meaning = c.isReversed ? c.card.reversed_meaning_short : c.card.upright_meaning_short;

  const contexts: Record<string, string> = {
    'situation': `在你当前的人生旅程中，这张牌揭示了你所处的核心状态。${meaning}——这不仅体现在你外在的处境层面，也反映在你内心深处对方向与可能性的感知中。关键词"${keywords.slice(0, 2).join('"和"')}"正在深刻影响你的选择与判断。此刻你需要的是保持冷静的观察力，从纷繁的思绪中提炼出真正重要的信号，为下一步行动做好充分准备。`,
    'challenge': `这张牌以${pos}出现在阻碍位置，揭示了你前进道路上需要正视的挑战。${meaning}——这种阻力可能来自外部环境的不确定性、人际关系中的微妙张力，或者是内心深处某种未被察觉的纠结与犹豫。关键词"${keywords.slice(0, 2).join('"与"')}"提醒你，真正的阻碍有时并非外在的困难，而是内心对未知的过度担忧或对变化的抵触。承认困境的存在，本身就是化解它的第一步。`,
    'guidance': `${c.card.name_cn}以${pos}降临在建议位置，为你的前行之路点亮了一盏明灯。${meaning}——这是一个富有启发的暗示。关键词"${keywords.slice(0, 2).join('"和"')}"指向了一条值得探索的方向。正如一棵树需要向不同方向伸展枝叶才能茁壮成长，你也可以在人生的多个维度寻找新的可能性。记住，选择权始终在你手中，你的直觉与智慧是最宝贵的资产。`,
  };

  return contexts[c.position] || 
    `${c.card.name_cn}以${pos}出现在${c.positionLabel}位置。${meaning}。关键词"${keywords.join('、')}"构成了一幅值得深思的画面。这提示你在当前阶段需要特别关注${keywords[0]}带来的深层启示，将其与你的内心诉求和现实处境相结合。无论前方的道路如何曲折，你的人生积累和洞察力都将成为最有力的支撑，帮助你在迷雾中找到属于自己的方向。`;
}
