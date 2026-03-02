'use client';

import { useState, useEffect, useCallback } from 'react';
import { audioManager } from '@/lib/audio';
import { useTarotStore } from '@/lib/store';

/**
 * BackgroundMusic - Global background music controller
 * Placed in root layout so it persists across page navigations.
 * Starts playing on first user interaction (click/touch) to comply with browser autoplay policies.
 */
export default function BackgroundMusic() {
  const audioEnabled = useTarotStore(s => s.audioEnabled);
  const toggleAudio = useTarotStore(s => s.toggleAudio);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize audio and start playing on first user interaction
  const startMusic = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);

    if (!audioManager.isInitialized()) {
      audioManager.init();
    }

    if (audioEnabled) {
      audioManager.play('ambient');
      setIsPlaying(true);
    }
  }, [hasInteracted, audioEnabled]);

  // Listen for first user interaction globally
  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      startMusic();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted, startMusic]);

  // Sync with audioEnabled store state
  useEffect(() => {
    if (!hasInteracted) return;

    if (audioEnabled) {
      audioManager.setEnabled(true);
      audioManager.resumeAmbient();
      setIsPlaying(true);
    } else {
      audioManager.setEnabled(false);
      setIsPlaying(false);
    }
  }, [audioEnabled, hasInteracted]);

  const handleToggle = useCallback(() => {
    if (!hasInteracted) {
      startMusic();
      return;
    }
    toggleAudio();
  }, [hasInteracted, startMusic, toggleAudio]);

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-arcana-deep/80 border border-gold/30 hover:border-gold/60 hover:bg-arcana-deep transition-all backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={isPlaying ? '关闭背景音乐' : '开启背景音乐'}
      title={isPlaying ? '关闭背景音乐' : '开启背景音乐'}
    >
      <span className="text-lg" role="img" aria-hidden>
        {isPlaying ? '🔊' : '🔇'}
      </span>
      {/* Pulsing ring when playing */}
      {isPlaying && (
        <span className="absolute inset-0 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '2s' }} />
      )}
    </button>
  );
}
