'use client';

import { forwardRef, useCallback, useRef, useImperativeHandle } from 'react';
import clsx from 'clsx';
import CardBack from '@/components/CardBack';

interface CardDeckProps {
  cardCount: number;
  hoveredIndex: number | null;
  onCardClick?: (index: number) => void;
  disabled?: boolean;
}

export interface CardDeckRef {
  getCardRects: () => DOMRect[];
}

const CardDeck = forwardRef<CardDeckRef, CardDeckProps>(
  ({ cardCount, hoveredIndex, onCardClick, disabled }, ref) => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      getCardRects: () => {
        return cardRefs.current
          .filter((el): el is HTMLDivElement => el !== null)
          .map(el => el.getBoundingClientRect());
      },
    }));

    const setCardRef = useCallback(
      (index: number) => (el: HTMLDivElement | null) => {
        cardRefs.current[index] = el;
      },
      []
    );

    return (
      <div className="flex justify-center items-end gap-3 md:gap-4 py-8">
        {Array.from({ length: cardCount }).map((_, i) => {
          const isHovered = hoveredIndex === i;
          // Fan layout: slight rotation
          const totalSpread = Math.min(cardCount * 4, 24);
          const rotation = -totalSpread / 2 + (i / (cardCount - 1 || 1)) * totalSpread;

          return (
            <div
              key={i}
              ref={setCardRef(i)}
              className={clsx(
                'relative cursor-pointer select-none',
                'w-[100px] h-[150px] md:w-[120px] md:h-[180px]',
                'transition-all duration-300 ease-out rounded-lg overflow-hidden',
                isHovered && !disabled && 'card-hover-glow',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                transform: `rotate(${rotation}deg) ${isHovered && !disabled ? 'translateY(-12px) scale(1.05)' : ''}`,
                transformOrigin: 'bottom center',
              }}
              onClick={() => !disabled && onCardClick?.(i)}
              role="button"
              aria-label={`选择第 ${i + 1} 张牌`}
            >
              <CardBack className="w-full h-full" />
              {/* Shimmer effect on hover */}
              {isHovered && !disabled && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background:
                        'linear-gradient(45deg, transparent 30%, rgba(201, 168, 76, 0.4) 50%, transparent 70%)',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }
);

CardDeck.displayName = 'CardDeck';
export default CardDeck;
