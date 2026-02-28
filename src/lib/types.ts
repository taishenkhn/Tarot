// Types for the tarot application
export interface TarotCard {
  id: number;
  name_cn: string;
  name_en: string;
  arcana: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_meaning_short: string;
  reversed_meaning_short: string;
  image: string;
}

export interface CardSlot {
  card: TarotCard | null;
  isReversed: boolean;
  status: 'empty' | 'filled' | 'revealed';
}

export interface ReadingResult {
  summary: string;
  overview: string;
  cards: {
    position: string;
    positionLabel: string;
    cardName: string;
    isReversed: boolean;
    interpretation: string;
  }[];
  suggestions: string[];
  encouragement: string;
}

export type Phase =
  | 'landing'
  | 'question'
  | 'camera'
  | 'ritual'
  | 'draw'
  | 'reveal'
  | 'reading';

export interface GestureEvent {
  type: 'move' | 'pinch_start' | 'pinch_end' | 'palm';
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

export interface CursorState {
  screenX: number;
  screenY: number;
  isHovering: boolean;
  isPinching: boolean;
  hoveredCardIndex: number | null;
  dwellTime: number;
  visible: boolean;
}

export type InputMode = 'gesture' | 'mouse' | 'touch';

export const SLOT_LABELS = [
  { key: 'situation', label: '现状', description: '问题核心' },
  { key: 'challenge', label: '阻碍', description: '潜意识/挑战' },
  { key: 'guidance', label: '建议', description: '可能走向' },
] as const;
