'use client';

import { useEffect, useState } from 'react';

interface RitualTransitionProps {
  onComplete: () => void;
}

export default function RitualTransition({ onComplete }: RitualTransitionProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),    // Fade in text
      setTimeout(() => setStep(2), 1500),   // Show secondary text
      setTimeout(() => setStep(3), 3000),   // Start fade out
      setTimeout(() => onComplete(), 3800), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-arcana-dark/90">
      {/* Central ritual text */}
      <div className="text-center space-y-6">
        {/* Mystery symbol */}
        <div
          className="text-5xl md:text-7xl transition-all duration-1000"
          style={{
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? 'scale(1)' : 'scale(0.5)',
            color: 'var(--color-gold)',
            textShadow: '0 0 30px rgba(201, 168, 76, 0.5)',
          }}
        >
          ✦
        </div>

        {/* Main text */}
        <div
          className="font-serif text-xl md:text-2xl text-gold transition-all duration-800"
          style={{
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          请默念你的问题
        </div>

        {/* Secondary text */}
        <div
          className="font-serif text-base text-star-white/50 transition-all duration-800"
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          准备抽取三张牌
        </div>

        {/* Dots animation */}
        {step >= 2 && (
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gold/40"
                style={{
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fade out overlay */}
      <div
        className="absolute inset-0 bg-arcana-dark transition-opacity duration-800 pointer-events-none"
        style={{ opacity: step >= 3 ? 1 : 0 }}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
