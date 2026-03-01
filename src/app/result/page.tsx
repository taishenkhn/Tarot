'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTarotStore } from '@/lib/store';
import { SLOT_LABELS } from '@/lib/types';
import type { ReadingResult } from '@/lib/types';
import ParticleBackground from '@/components/ParticleBackground';
import CardImage from '@/components/CardImage';
import { generateReading } from '@/lib/reading-client';
import clsx from 'clsx';

export default function ResultPage() {
  const router = useRouter();
  const question = useTarotStore(s => s.question);
  const slots = useTarotStore(s => s.slots);
  const reading = useTarotStore(s => s.reading);
  const readingLoading = useTarotStore(s => s.readingLoading);
  const readingError = useTarotStore(s => s.readingError);
  const setReading = useTarotStore(s => s.setReading);
  const setReadingLoading = useTarotStore(s => s.setReadingLoading);
  const setReadingError = useTarotStore(s => s.setReadingError);
  const reset = useTarotStore(s => s.reset);

  const [copied, setCopied] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  // Redirect if no cards
  useEffect(() => {
    const allFilled = slots.every(s => s.card !== null);
    if (!allFilled || !question) {
      router.replace('/question');
    }
  }, [slots, question, router]);

  // Fetch reading
  useEffect(() => {
    const allFilled = slots.every(s => s.card !== null);
    if (!allFilled || !question || reading) return;

    const fetchReading = async () => {
      setReadingLoading(true);

      try {
        const cards = slots.map(slot => ({
          id: slot.card!.id,
          name_cn: slot.card!.name_cn,
          name_en: slot.card!.name_en,
          isReversed: slot.isReversed,
          upright_keywords: slot.card!.upright_keywords,
          reversed_keywords: slot.card!.reversed_keywords,
          upright_meaning_short: slot.card!.upright_meaning_short,
          reversed_meaning_short: slot.card!.reversed_meaning_short,
        }));

        const { reading } = await generateReading(question, cards);
        setReading(reading);
      } catch (err: any) {
        console.error('Failed to fetch reading:', err);
        setReadingError('解读生成失败，请重试');
      }
    };

    fetchReading();
  }, [question, slots, reading, setReading, setReadingLoading, setReadingError]);

  // Animate sections appearing
  useEffect(() => {
    if (!reading) return;

    const totalSections = 5; // summary, overview, cards, suggestions, encouragement
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setVisibleSections(current);
      if (current >= totalSections) {
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [reading]);

  // Copy result to clipboard
  const handleCopy = useCallback(async () => {
    if (!reading) return;

    const text = formatReadingAsText(reading, question, slots);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [reading, question, slots]);

  // Restart
  const handleRestart = useCallback(() => {
    reset();
    router.push('/question');
  }, [reset, router]);

  if (!question || slots.some(s => !s.card)) return null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-arcana-dark via-arcana-deep to-arcana-dark z-0" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl text-gold mb-2">✦</div>
          <h1 className="font-serif text-xl md:text-2xl text-gold text-glow">
            塔罗解读
          </h1>
          <p className="text-star-white/30 text-xs mt-2">
            「{question}」
          </p>
        </div>

        {/* Three cards display */}
        <div className="flex justify-center gap-4 md:gap-6 mb-8">
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-gold/50 text-xs font-serif">
                {SLOT_LABELS[i].label}
              </span>
              <div
                className={clsx(
                  'w-[80px] h-[120px] md:w-[100px] md:h-[150px] rounded-lg',
                  'overflow-hidden',
                  'transition-all duration-500'
                )}
              >
                {slot.card && (
                  <div className={clsx(slot.isReversed && 'rotate-180')}>
                    <CardImage card={slot.card} className="w-full h-full" />
                  </div>
                )}
              </div>
              <span
                className={clsx(
                  'text-[10px] px-2 py-0.5 rounded-full',
                  slot.isReversed
                    ? 'bg-mystic-red/20 text-mystic-red'
                    : 'bg-gold/20 text-gold'
                )}
              >
                {slot.isReversed ? '逆位' : '正位'}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-20 h-px bg-gold/20" />
          <span className="text-gold/30 text-xs font-serif">✧</span>
          <div className="w-20 h-px bg-gold/20" />
        </div>

        {/* Loading state */}
        {readingLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gold/50 font-serif">牌阵正在解读中…</p>
            <p className="text-star-white/20 text-xs mt-2">
              正在结合你的问题与牌面进行分析
            </p>
          </div>
        )}

        {/* Error state */}
        {readingError && (
          <div className="text-center py-12">
            <p className="text-mystic-red mb-4">{readingError}</p>
            <button className="btn-arcana text-sm" onClick={handleRestart}>
              重新开始
            </button>
          </div>
        )}

        {/* Reading content */}
        {reading && (
          <div className="space-y-6">
            {/* 1. Summary */}
            {visibleSections >= 1 && (
              <div className="animate-fade-in text-center">
                <p className="text-gold font-serif text-lg md:text-xl leading-relaxed text-glow">
                  {reading.summary}
                </p>
              </div>
            )}

            {/* 2. Overview */}
            {visibleSections >= 2 && (
              <div className="animate-fade-in">
                <h3 className="text-gold/70 font-serif text-sm mb-2">✦ 总体解读</h3>
                <p className="text-star-white/70 text-sm leading-relaxed pl-4 border-l-2 border-gold/20">
                  {reading.overview}
                </p>
              </div>
            )}

            {/* 3. Card interpretations */}
            {visibleSections >= 3 && (
              <div className="animate-fade-in space-y-4">
                {reading.cards.map((card, i) => (
                  <div key={i} className="bg-arcana-deep/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gold/50 text-xs font-serif">
                        {card.positionLabel}
                      </span>
                      <span className="text-gold font-serif text-sm">
                        {card.cardName}
                      </span>
                    </div>
                    <p className="text-star-white/60 text-sm leading-relaxed">
                      {card.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Suggestions */}
            {visibleSections >= 4 && (
              <div className="animate-fade-in">
                <h3 className="text-gold/70 font-serif text-sm mb-3">✦ 温和建议</h3>
                <ul className="space-y-2">
                  {reading.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-star-white/60 text-sm"
                    >
                      <span className="text-gold/40 mt-0.5">•</span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Encouragement */}
            {visibleSections >= 5 && (
              <div className="animate-fade-in text-center pt-4">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <div className="w-12 h-px bg-gold/20" />
                  <span className="text-gold/30 text-xs">✧</span>
                  <div className="w-12 h-px bg-gold/20" />
                </div>
                <p className="text-gold/60 font-serif text-sm italic whitespace-pre-line">
                  {reading.encouragement}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {reading && visibleSections >= 5 && (
          <div className="flex justify-center gap-4 mt-10 pb-8 animate-fade-in">
            <button
              className="btn-arcana text-sm"
              onClick={handleCopy}
            >
              {copied ? '已复制 ✓' : '复制结果'}
            </button>
            <button
              className="px-6 py-3 rounded-lg border border-gold/30 text-gold/70 
                         hover:border-gold/50 hover:text-gold transition-all text-sm font-serif"
              onClick={handleRestart}
            >
              重新占卜
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Format reading as copyable text
 */
function formatReadingAsText(
  reading: ReadingResult,
  question: string,
  slots: { card: any; isReversed: boolean }[]
): string {
  const lines = [
    '✦ ArcanaCam Tarot 塔罗解读 ✦',
    '',
    `问题：${question}`,
    '',
    `牌面：${slots
      .map(
        (s, i) =>
          `${SLOT_LABELS[i].label} - ${s.card.name_cn}（${s.isReversed ? '逆位' : '正位'}）`
      )
      .join(' | ')}`,
    '',
    '─────────────────',
    '',
    `💫 ${reading.summary}`,
    '',
    `📖 总体解读：`,
    reading.overview,
    '',
  ];

  reading.cards.forEach(card => {
    lines.push(`🃏 ${card.positionLabel} - ${card.cardName}`);
    lines.push(card.interpretation);
    lines.push('');
  });

  lines.push('💡 建议：');
  reading.suggestions.forEach((s, i) => {
    lines.push(`${i + 1}. ${s}`);
  });
  lines.push('');
  lines.push(`✨ ${reading.encouragement}`);

  return lines.join('\n');
}
