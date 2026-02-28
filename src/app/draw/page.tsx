'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTarotStore } from '@/lib/store';
import { cursorEngine, type CardRect } from '@/lib/cursor-engine';
import type { CursorState, InputMode } from '@/lib/types';
import type { GestureState } from '@/lib/gesture-recognizer';
import ParticleBackground from '@/components/ParticleBackground';
import CameraView from '@/components/CameraView';
import GestureCursor from '@/components/GestureCursor';
import CardDeck, { type CardDeckRef } from '@/components/CardDeck';
import CardSlots from '@/components/CardSlots';
import CardReveal from '@/components/CardReveal';
import RitualTransition from '@/components/RitualTransition';

type DrawPhase = 'init' | 'ritual' | 'drawing' | 'revealing' | 'done';

export default function DrawPage() {
  const router = useRouter();
  const question = useTarotStore(s => s.question);
  const slots = useTarotStore(s => s.slots);
  const currentSlotIndex = useTarotStore(s => s.currentSlotIndex);
  const displayCards = useTarotStore(s => s.displayCards);
  const shuffleAndPrepare = useTarotStore(s => s.shuffleAndPrepare);
  const drawCard = useTarotStore(s => s.drawCard);
  const inputMode = useTarotStore(s => s.inputMode);
  const setInputMode = useTarotStore(s => s.setInputMode);

  const [drawPhase, setDrawPhase] = useState<DrawPhase>('init');
  const [cursorState, setCursorState] = useState<CursorState>({
    screenX: 0,
    screenY: 0,
    isHovering: false,
    isPinching: false,
    hoveredCardIndex: null,
    dwellTime: 0,
    visible: false,
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [showModeChoice, setShowModeChoice] = useState(true);

  const cardDeckRef = useRef<CardDeckRef>(null);
  const lastPinchRef = useRef<number>(0);

  // Redirect if no question
  useEffect(() => {
    if (!question) {
      router.replace('/question');
    }
  }, [question, router]);

  // Subscribe to cursor engine updates
  useEffect(() => {
    const unsubscribe = cursorEngine.onUpdate(setCursorState);
    cursorEngine.setViewport(window.innerWidth, window.innerHeight);

    const handleResize = () => {
      cursorEngine.setViewport(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update card rects when display cards change
  useEffect(() => {
    if (drawPhase !== 'drawing') return;

    const updateRects = () => {
      if (!cardDeckRef.current) return;
      const rects = cardDeckRef.current.getCardRects();
      const cardRects: CardRect[] = rects.map((r, i) => ({
        index: i,
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
      }));
      cursorEngine.setCardRects(cardRects);
    };

    updateRects();
    // Recalculate on resize
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, [drawPhase, displayCards]);

  // Detect pinch to draw card
  useEffect(() => {
    if (drawPhase !== 'drawing') return;
    if (currentSlotIndex >= 3) return;

    if (
      cursorState.isPinching &&
      cursorState.hoveredCardIndex !== null &&
      cursorState.isHovering
    ) {
      const now = performance.now();
      if (now - lastPinchRef.current > 500) {
        lastPinchRef.current = now;
        drawCard(cursorState.hoveredCardIndex);
      }
    }
  }, [cursorState, drawPhase, currentSlotIndex, drawCard]);

  // Transition to reveal when all 3 cards drawn
  useEffect(() => {
    if (currentSlotIndex >= 3 && drawPhase === 'drawing') {
      setTimeout(() => setDrawPhase('revealing'), 800);
    }
  }, [currentSlotIndex, drawPhase]);

  // Mouse/touch fallback handler
  useEffect(() => {
    if (inputMode === 'gesture') return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorEngine.processPointer(e.clientX, e.clientY, false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      cursorEngine.processPointer(e.clientX, e.clientY, true);
    };

    const handleMouseUp = () => {
      cursorEngine.releasePinch();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [inputMode]);

  // Gesture mode handler
  const handleGestureUpdate = useCallback(
    (state: GestureState, timestamp: number) => {
      cursorEngine.processGesture(state, timestamp);
    },
    []
  );

  // Mode selection
  const selectMode = useCallback(
    (mode: InputMode) => {
      setInputMode(mode);
      cursorEngine.setMode(mode);
      setShowModeChoice(false);

      if (mode === 'gesture') {
        setCameraActive(true);
      } else {
        // Skip directly to ritual
        shuffleAndPrepare();
        setDrawPhase('ritual');
      }
    },
    [setInputMode, shuffleAndPrepare]
  );

  // Camera ready handler
  const handleCameraReady = useCallback(() => {
    shuffleAndPrepare();
    setDrawPhase('ritual');
  }, [shuffleAndPrepare]);

  // Camera error handler
  const handleCameraError = useCallback(
    (error: string) => {
      console.warn('Camera error, falling back to mouse:', error);
      selectMode('mouse');
    },
    [selectMode]
  );

  // Reveal complete → go to result
  const handleRevealComplete = useCallback(() => {
    setDrawPhase('done');
    router.push('/result');
  }, [router]);

  // Card click handler (for mouse mode)
  const handleCardClick = useCallback(
    (index: number) => {
      if (inputMode === 'gesture') return; // gesture mode uses pinch
      if (currentSlotIndex >= 3) return;
      drawCard(index);
    },
    [inputMode, currentSlotIndex, drawCard]
  );

  if (!question) return null;

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-arcana-dark via-arcana-deep to-arcana-dark z-0" />

      {/* Gesture cursor overlay */}
      {inputMode === 'gesture' && <GestureCursor cursorState={cursorState} />}

      {/* Camera view (hidden visually but active) */}
      {cameraActive && (
        <div className="absolute top-4 left-4 z-30">
          <CameraView
            onGestureUpdate={handleGestureUpdate}
            onReady={handleCameraReady}
            onError={handleCameraError}
            active={cameraActive}
          />
        </div>
      )}

      {/* Mode selection screen */}
      {showModeChoice && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center gap-8 px-6">
          <div className="text-center space-y-3">
            <div className="text-3xl text-gold">✦</div>
            <h2 className="font-serif text-2xl text-gold text-glow">
              选择交互方式
            </h2>
            <p className="text-star-white/40 text-sm">
              你可以通过摄像头手势或鼠标进行抽牌
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="btn-arcana flex flex-col items-center gap-2 px-8 py-5"
              onClick={() => selectMode('gesture')}
            >
              <span className="text-2xl">📷</span>
              <span>摄像头手势</span>
              <span className="text-xs opacity-60">推荐体验</span>
            </button>
            <button
              className="btn-arcana flex flex-col items-center gap-2 px-8 py-5"
              onClick={() => selectMode('mouse')}
            >
              <span className="text-2xl">🖱️</span>
              <span>鼠标点击</span>
              <span className="text-xs opacity-60">经典模式</span>
            </button>
          </div>
        </div>
      )}

      {/* Ritual transition */}
      {drawPhase === 'ritual' && (
        <RitualTransition onComplete={() => setDrawPhase('drawing')} />
      )}

      {/* Drawing phase */}
      {drawPhase === 'drawing' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between py-6 px-4">
          {/* Question reminder */}
          <div className="text-center mb-2">
            <p className="text-star-white/30 text-xs">你的问题</p>
            <p className="text-star-white/60 text-sm max-w-sm mx-auto truncate">
              「{question}」
            </p>
          </div>

          {/* Card slots at top */}
          <div className="relative">
            <CardSlots slots={slots} currentSlotIndex={currentSlotIndex} />
          </div>

          {/* Instruction */}
          <div className="text-center my-4">
            <p className="text-gold/60 text-sm font-serif">
              {currentSlotIndex >= 3
                ? '✨ 三张牌已抽取完毕'
                : inputMode === 'gesture'
                ? '将手指指向你感应到的牌，捏合拇指与食指确认选择'
                : '点击你感应到的牌以抽取'}
            </p>
          </div>

          {/* Card deck */}
          <CardDeck
            ref={cardDeckRef}
            cardCount={displayCards.length}
            hoveredIndex={cursorState.hoveredCardIndex}
            onCardClick={handleCardClick}
            disabled={currentSlotIndex >= 3}
          />

          {/* Input mode indicator */}
          <div className="text-center mt-4">
            <span className="text-star-white/20 text-xs">
              {inputMode === 'gesture' ? '📷 手势模式' : '🖱️ 鼠标模式'}
              {' · '}
              已抽取 {Math.min(currentSlotIndex, 3)}/3
            </span>
          </div>
        </div>
      )}

      {/* Reveal phase */}
      {drawPhase === 'revealing' && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <CardReveal slots={slots} onRevealComplete={handleRevealComplete} />
        </div>
      )}
    </main>
  );
}
