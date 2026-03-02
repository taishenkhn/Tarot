import { create } from 'zustand';
import type { TarotCard, CardSlot, ReadingResult, Phase, InputMode } from './types';
import { shuffleDeck } from './deck-utils';
import tarotDeckData from '@/data/tarot-deck.json';

interface TarotStore {
  // Phase
  phase: Phase;
  setPhase: (phase: Phase) => void;

  // Question
  question: string;
  setQuestion: (q: string) => void;

  // Deck
  deck: TarotCard[];
  displayCards: TarotCard[]; // visible cards for user to pick from
  shuffleAndPrepare: () => void;

  // Slots
  slots: [CardSlot, CardSlot, CardSlot];
  currentSlotIndex: number;
  drawCard: (cardIndex: number) => void;
  revealCard: (slotIndex: number) => void;
  revealAll: () => void;

  // Reading
  reading: ReadingResult | null;
  readingLoading: boolean;
  readingError: string | null;
  setReading: (r: ReadingResult) => void;
  setReadingLoading: (v: boolean) => void;
  setReadingError: (e: string | null) => void;

  // Input mode
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;

  // Audio
  audioEnabled: boolean;
  toggleAudio: () => void;

  // Reset
  reset: () => void;
}

const emptySlots: [CardSlot, CardSlot, CardSlot] = [
  { card: null, isReversed: false, status: 'empty' },
  { card: null, isReversed: false, status: 'empty' },
  { card: null, isReversed: false, status: 'empty' },
];

const allCards = tarotDeckData as TarotCard[];

export const useTarotStore = create<TarotStore>((set, get) => ({
  phase: 'landing',
  setPhase: (phase) => set({ phase }),

  question: '',
  setQuestion: (question) => set({ question }),

  deck: [],
  displayCards: [],
  shuffleAndPrepare: () => {
    // Filter to major arcana only (22 cards), then shuffle
    const majorCards = allCards.filter(c => c.arcana === 'major');
    const shuffled = shuffleDeck([...majorCards]);
    // show all 22 major arcana cards face-down for user to pick from
    set({
      deck: shuffleDeck([...allCards]),
      displayCards: shuffled,
      slots: [
        { card: null, isReversed: false, status: 'empty' },
        { card: null, isReversed: false, status: 'empty' },
        { card: null, isReversed: false, status: 'empty' },
      ],
      currentSlotIndex: 0,
    });
  },

  slots: [...emptySlots] as [CardSlot, CardSlot, CardSlot],
  currentSlotIndex: 0,

  drawCard: (cardIndex: number) => {
    const state = get();
    const slotIdx = state.currentSlotIndex;
    if (slotIdx >= 3) return; // all slots filled

    const card = state.displayCards[cardIndex];
    if (!card) return;

    const isReversed = Math.random() < 0.5;
    const newSlots = [...state.slots] as [CardSlot, CardSlot, CardSlot];
    newSlots[slotIdx] = { card, isReversed, status: 'filled' };

    // Remove picked card and replace with next from deck
    const newDisplay = [...state.displayCards];
    const usedIds = new Set(newSlots.filter(s => s.card).map(s => s.card!.id));
    usedIds.add(card.id);

    // find a replacement card from deck not already in display or slots
    const currentDisplayIds = new Set(newDisplay.map(c => c.id));
    const replacement = state.deck.find(
      c => !currentDisplayIds.has(c.id) && !usedIds.has(c.id)
    );
    if (replacement) {
      newDisplay[cardIndex] = replacement;
    } else {
      newDisplay.splice(cardIndex, 1);
    }

    set({
      slots: newSlots,
      currentSlotIndex: slotIdx + 1,
      displayCards: newDisplay,
    });
  },

  revealCard: (slotIndex: number) => {
    const newSlots = [...get().slots] as [CardSlot, CardSlot, CardSlot];
    if (newSlots[slotIndex].status === 'filled') {
      newSlots[slotIndex] = { ...newSlots[slotIndex], status: 'revealed' };
      set({ slots: newSlots });
    }
  },

  revealAll: () => {
    const newSlots = get().slots.map(s =>
      s.status === 'filled' ? { ...s, status: 'revealed' as const } : s
    ) as [CardSlot, CardSlot, CardSlot];
    set({ slots: newSlots });
  },

  reading: null,
  readingLoading: false,
  readingError: null,
  setReading: (reading) => set({ reading, readingLoading: false, readingError: null }),
  setReadingLoading: (readingLoading) => set({ readingLoading }),
  setReadingError: (readingError) => set({ readingError, readingLoading: false }),

  inputMode: 'mouse',
  setInputMode: (inputMode) => set({ inputMode }),

  audioEnabled: true,
  toggleAudio: () => set(s => ({ audioEnabled: !s.audioEnabled })),

  reset: () =>
    set({
      phase: 'landing',
      question: '',
      deck: [],
      displayCards: [],
      slots: [
        { card: null, isReversed: false, status: 'empty' },
        { card: null, isReversed: false, status: 'empty' },
        { card: null, isReversed: false, status: 'empty' },
      ],
      currentSlotIndex: 0,
      reading: null,
      readingLoading: false,
      readingError: null,
    }),
}));
