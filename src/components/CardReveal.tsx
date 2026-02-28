'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import type { CardSlot } from '@/lib/types';
import { SLOT_LABELS } from '@/lib/types';
import CardImage from '@/components/CardImage';
import CardBack from '@/components/CardBack';

interface CardRevealProps {
  slots: [CardSlot, CardSlot, CardSlot];
  onRevealComplete: () => void;
}

export default function CardReveal({ slots, onRevealComplete }: CardRevealProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [autoRevealIndex, setAutoRevealIndex] = useState(0);

  // Auto-reveal cards one by one
  useEffect(() => {
    if (autoRevealIndex >= 3) {
      // All revealed, wait a moment then callback
      const timer = setTimeout(onRevealComplete, 1200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setRevealedIndices(prev => new Set([...prev, autoRevealIndex]));
      setAutoRevealIndex(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [autoRevealIndex, onRevealComplete]);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="font-serif text-2xl text-gold text-glow animate-fade-in">
        命运之牌已揭晓
      </h2>

      <div className="flex justify-center gap-6 md:gap-10">
        {slots.map((slot, i) => {
          const isFlipped = revealedIndices.has(i);
          const card = slot.card;

          return (
            <div
              key={i}
              className={clsx(
                'flex flex-col items-center gap-3',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {/* Position label */}
              <div className="text-gold/70 text-sm font-serif">
                {SLOT_LABELS[i].label}
              </div>

              {/* Card flip container */}
              <div
                className="card-flip-container w-[120px] h-[180px] md:w-[150px] md:h-[225px]"
              >
                <div
                  className={clsx(
                    'card-flip-inner',
                    isFlipped && 'flipped'
                  )}
                >
                  {/* Back (default visible) */}
                  <div className="card-flip-back w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
                    <CardBack className="w-full h-full" />
                  </div>

                  {/* Front (visible after flip) */}
                  <div
                    className={clsx(
                      'card-flip-front w-full h-full',
                      'rounded-lg overflow-hidden',
                      'flex items-center justify-center',
                      slot.isReversed && 'card-reversed'
                    )}
                  >
                    {card && (
                      <CardImage card={card} className="w-full h-full" />
                    )}
                  </div>
                </div>
              </div>

              {/* Position info (shown after flip) */}
              {isFlipped && card && (
                <div className="text-center animate-fade-in">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full',
                    slot.isReversed
                      ? 'bg-mystic-red/20 text-mystic-red'
                      : 'bg-gold/20 text-gold'
                  )}>
                    {slot.isReversed ? '逆位' : '正位'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
