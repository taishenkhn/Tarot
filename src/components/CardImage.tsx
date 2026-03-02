'use client';

import { useState } from 'react';
import type { TarotCard } from '@/lib/types';

/**
 * Tarot Card Image Component
 * Uses authentic Rider-Waite (1910) card images (public domain).
 * Source: Wikimedia Commons
 */

interface CardImageProps {
  card: TarotCard;
  className?: string;
}

function imgSrc(filename: string): string {
  return `/cards/${filename.replace(/\.png$/i, '.jpg')}`;
}

export default function CardImage({ card, className = '' }: CardImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ boxShadow: 'inset 0 0 0 1.5px #8a7432' }}
    >
      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d2b]">
          <div className="w-5 h-5 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc(card.image)}
        alt={`${card.name_cn} ${card.name_en}`}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-400 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
