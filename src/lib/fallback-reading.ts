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
  const summary = `关于你的问题，${card1.card.name_cn}、${card2.card.name_cn}与${card3.card.name_cn}为你指引方向。请放心，一切都有转机。`;

  // 2. Overview
  const overview = `你的提问涉及"${question.slice(0, 20)}${question.length > 20 ? '...' : ''}"。` +
    `从牌面来看，你现在正处于${getMeaning(card1)}的阶段。` +
    `${card2.card.name_cn}（${getPosition(card2)}）提示你需要关注${getKeywords(card2).slice(0, 2).join('与')}方面的挑战。` +
    `而${card3.card.name_cn}为你指出了${getKeywords(card3).slice(0, 2).join('与')}的可能方向。`;

  // 3. Card interpretations
  const cardInterpretations = cards.map(c => ({
    position: c.position,
    positionLabel: c.positionLabel,
    cardName: `${c.card.name_cn}（${getPosition(c)}）`,
    isReversed: c.isReversed,
    interpretation: `${c.card.name_cn}以${getPosition(c)}出现在${c.positionLabel}位置。` +
      `${getMeaning(c)}。` +
      `关键词：${getKeywords(c).join('、')}。` +
      `这提示你在这个方面可以关注${getKeywords(c)[0]}带来的启示。`,
  }));

  // 4. Suggestions
  const suggestions = [
    `尝试从${getKeywords(card1)[0]}的角度重新审视当前处境，你可能会发现新的切入点。`,
    `面对${getKeywords(card2).slice(0, 2).join('与')}的挑战，不妨给自己一些时间和空间来思考。`,
    `${card3.card.name_cn}建议你在${getKeywords(card3)[0]}方面迈出一小步，哪怕是很小的行动也会带来变化。`,
  ];

  // 5. Encouragement
  const encouragement = `无论前方如何，你已经迈出了面对问题的第一步。相信自己有做出选择的智慧和勇气。`;

  return {
    summary,
    overview,
    cards: cardInterpretations,
    suggestions,
    encouragement,
  };
}
