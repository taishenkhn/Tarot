'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTarotStore } from '@/lib/store';
import ParticleBackground from '@/components/ParticleBackground';

export default function QuestionPage() {
  const router = useRouter();
  const setQuestion = useTarotStore(s => s.setQuestion);
  const setPhase = useTarotStore(s => s.setPhase);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const charCount = input.length;
  const isValid = charCount >= 5 && charCount <= 120;

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed.length < 5) {
      setError('请至少输入5个字来描述你的问题');
      return;
    }
    if (trimmed.length > 120) {
      setError('问题长度不能超过120字');
      return;
    }
    setError('');
    setQuestion(trimmed);
    setPhase('draw');
    router.push('/draw');
  }, [input, setQuestion, setPhase, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-arcana-dark via-arcana-deep to-arcana-dark z-0" />

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center gap-8">
        {/* Back to landing */}
        <button
          className="absolute top-8 left-6 text-star-white/30 hover:text-star-white/60 transition-colors text-sm"
          onClick={() => router.push('/')}
        >
          ← 返回
        </button>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-3xl text-gold">✦</div>
          <h1 className="font-serif text-2xl md:text-3xl text-gold text-glow">
            你想问什么？
          </h1>
          <p className="text-star-white/40 text-sm">
            在心中默想你的问题，然后写下来
          </p>
        </div>

        {/* Question input */}
        <div className="w-full space-y-3">
          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="例如：我和他的关系会怎样发展？我该不该转岗？最近的焦虑要如何面对？"
            className="w-full h-32 p-4 rounded-lg bg-arcana-dark/80 border border-gold/20 
                       text-star-white placeholder-star-white/20
                       focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30
                       resize-none transition-all duration-300
                       font-sans text-base leading-relaxed"
            maxLength={120}
            autoFocus
          />

          {/* Character count & error */}
          <div className="flex justify-between items-center px-1">
            <div className="text-xs">
              {error ? (
                <span className="text-mystic-red">{error}</span>
              ) : (
                <span className="text-star-white/30">
                  输入你想问塔罗的问题
                </span>
              )}
            </div>
            <span
              className={`text-xs ${
                charCount > 120
                  ? 'text-mystic-red'
                  : charCount >= 5
                  ? 'text-gold/50'
                  : 'text-star-white/20'
              }`}
            >
              {charCount}/120
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          className={`btn-arcana text-base w-full max-w-xs ${
            !isValid ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit}
          disabled={!isValid}
        >
          抽取塔罗牌
        </button>

        {/* Hint */}
        <div className="text-star-white/20 text-xs text-center leading-relaxed mt-4">
          <p>接下来将通过摄像头手势进行抽牌</p>
          <p>没有摄像头也可以用鼠标完成✨</p>
        </div>
      </div>
    </main>
  );
}
