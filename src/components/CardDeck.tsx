'use client';

import { forwardRef, useCallback, useRef, useImperativeHandle, useState, useEffect } from 'react';
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
  scrollByGesture: (direction: 'left' | 'right') => void;
}

const CardDeck = forwardRef<CardDeckRef, CardDeckProps>(
  ({ cardCount, hoveredIndex, onCardClick, disabled }, ref) => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useImperativeHandle(ref, () => ({
      getCardRects: () => {
        return cardRefs.current
          .filter((el): el is HTMLDivElement => el !== null)
          .map(el => el.getBoundingClientRect());
      },
      scrollByGesture: (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const amount = direction === 'left' ? -200 : 200;
        container.scrollBy({ left: amount, behavior: 'smooth' });
      },
    }));

    const setCardRef = useCallback(
      (index: number) => (el: HTMLDivElement | null) => {
        cardRefs.current[index] = el;
      },
      []
    );

    const updateScrollButtons = useCallback(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }, []);

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }, [updateScrollButtons, cardCount]);

    const scroll = useCallback((direction: 'left' | 'right') => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const scrollAmount = direction === 'left' ? -240 : 240;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }, []);

    return (
      <div className="relative w-full py-4">
        {/* Left scroll arrow */}
        {canScrollLeft && (
          <button
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-arcana-dark/80 border border-gold/30 rounded-full text-gold/70 hover:text-gold hover:border-gold/60 transition-all backdrop-blur-sm"
            onClick={() => scroll('left')}
            aria-label="向左滑动"
          >
            ‹
          </button>
        )}
        {/* Right scroll arrow */}
        {canScrollRight && (
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-arcana-dark/80 border border-gold/30 rounded-full text-gold/70 hover:text-gold hover:border-gold/60 transition-all backdrop-blur-sm"
            onClick={() => scroll('right')}
            aria-label="向右滑动"
          >
            ›
          </button>
        )}

        {/* Horizontal scrollable card container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 md:gap-4 px-12 overflow-x-auto card-scroll-container"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {Array.from({ length: cardCount }).map((_, i) => {
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={i}
                ref={setCardRef(i)}
                className={clsx(
                  'relative cursor-pointer select-none flex-shrink-0',
                  'w-[80px] h-[133px] md:w-[100px] md:h-[167px]',
                  'transition-all duration-300 ease-out rounded-lg overflow-hidden',
                  isHovered && !disabled && 'card-hover-glow',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  scrollSnapAlign: 'center',
                  transform: isHovered && !disabled ? 'translateY(-10px) scale(1.1)' : 'translateY(0) scale(1)',
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
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          'linear-gradient(45deg, transparent 30%, rgba(201, 168, 76, 0.5) 50%, transparent 70%)',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                )}
                {/* Card number badge */}
                <div className="absolute bottom-1 right-1 text-[9px] text-[#c9a84c]/40 font-serif select-none">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll hint text */}
        <div className="text-center mt-2">
          <span className="text-star-white/20 text-xs">← 左右滑动浏览 22 张大阿卡纳 →</span>
        </div>

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

