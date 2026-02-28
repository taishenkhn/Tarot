import type { TarotCard } from './types';

/**
 * Fisher-Yates shuffle
 */
export function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 50% probability reversed
 */
export function isReversed(): boolean {
  return Math.random() < 0.5;
}

/**
 * Draw n cards from a deck, return drawn cards and remaining deck
 */
export function drawRandomCards(
  deck: TarotCard[],
  n: number
): { drawn: TarotCard[]; remaining: TarotCard[] } {
  const shuffled = shuffleDeck(deck);
  return {
    drawn: shuffled.slice(0, n),
    remaining: shuffled.slice(n),
  };
}

/**
 * Get card image path
 */
export function getCardImagePath(card: TarotCard): string {
  return `/cards/${card.image}`;
}

/**
 * Get card display name with position
 */
export function getCardDisplayName(card: TarotCard, reversed: boolean): string {
  const pos = reversed ? '逆位' : '正位';
  return `${card.name_cn}（${pos}）`;
}
