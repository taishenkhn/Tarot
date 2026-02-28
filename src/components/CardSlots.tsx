'use client';

import clsx from 'clsx';
import type { CardSlot } from '@/lib/types';
import { SLOT_LABELS } from '@/lib/types';
import CardBack from '@/components/CardBack';
import CardImage from '@/components/CardImage';

interface CardSlotsProps {
  slots: [CardSlot, CardSlot, CardSlot];
  currentSlotIndex: number;
}

export default function CardSlots({ slots, currentSlotIndex }: CardSlotsProps) {
  return (
    <div className="flex justify-center gap-4 md:gap-8 mb-6">
      {slots.map((slot, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {/* Slot label */}
          <div className="text-center">
            <div className="text-gold font-serif text-sm md:text-base">
              {SLOT_LABELS[i].label}
            </div>
            <div className="text-star-white/40 text-xs">
              {SLOT_LABELS[i].description}
            </div>
          </div>

          {/* Slot card area */}
          <div
            className={clsx(
              'w-[80px] h-[120px] md:w-[100px] md:h-[150px]',
              'flex items-center justify-center',
              'transition-all duration-500',
              slot.status === 'empty' && 'slot-empty',
              slot.status === 'filled' && 'slot-filled',
              slot.status === 'revealed' && 'slot-filled',
              i === currentSlotIndex && slot.status === 'empty' && 'animate-pulse-glow'
            )}
          >
            {slot.status === 'empty' && (
              <span className="text-gold/30 text-2xl">
                {i === currentSlotIndex ? '?' : '·'}
              </span>
            )}
            {slot.status === 'filled' && (
              <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                <CardBack className="w-full h-full" />
              </div>
            )}
            {slot.status === 'revealed' && slot.card && (
              <div className="w-full h-full rounded-lg overflow-hidden">
                <CardImage card={slot.card} className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Progress indicator */}
      <div className="absolute top-2 right-4 text-gold/50 text-sm font-serif">
        已抽取 {slots.filter(s => s.status !== 'empty').length}/3
      </div>
    </div>
  );
}
