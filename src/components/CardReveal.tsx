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

function imgSrc(filename: string): string {
  return `/cards/${filename.replace(/\.png$/i, '.jpg')}`;
}

export default function CardReveal({ slots, onRevealComplete }: CardRevealProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [autoRevealIndex, setAutoRevealIndex] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);

  // Preload all card images before starting the reveal sequence
  useEffect(() => {
    const urls = slots
      .map(s => s.card?.image)
      .filter(Boolean)
      .map(f => imgSrc(f!));

    if (urls.length === 0) {
      setImagesReady(true);
      return;
    }

    let settled = 0;
    const timeout = setTimeout(() => setImagesReady(true), 4000);

    const onSettled = () => {
      settled += 1;
      if (settled >= urls.length) {
        clearTimeout(timeout);
        setImagesReady(true);
      }
    };

    urls.forEach(url => {
      const img = new window.Image();
      img.onload = onSettled;
      img.onerror = onSettled;
      img.src = url;
    });

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-reveal cards one by one — only after images are ready
  useEffect(() => {
    if (!imagesReady) return;

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
  }, [autoRevealIndex, onRevealComplete, imagesReady]);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="font-serif text-2xl text-gold text-glow animate-fade-in">
        命运之牌已揭晓
      </h2>

      {/* Preload indicator */}
      {!imagesReady && (
        <div className="flex items-center gap-3 text-gold/60 text-sm animate-fade-in">
          <div className="w-4 h-4 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
          <span>正在准备牌面…</span>
        </div>
      )}

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

              {/* Card flip container - matches slot sizes */}
              <div
                className="card-flip-container w-[100px] h-[167px] md:w-[120px] md:h-[200px]"
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
                      'flex items-center justify-center'
                    )}
                  >
                    {card && (
                      <div className={clsx(slot.isReversed && 'rotate-180', 'w-full h-full')}>
                        <CardImage card={card} className="w-full h-full" />
                      </div>
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
