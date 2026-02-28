'use client';

import { useEffect, useRef, useState } from 'react';
import type { CursorState } from '@/lib/types';

interface GestureCursorProps {
  cursorState: CursorState;
}

interface Trail {
  x: number;
  y: number;
  id: number;
}

export default function GestureCursor({ cursorState }: GestureCursorProps) {
  const [trails, setTrails] = useState<Trail[]>([]);
  const trailIdRef = useRef(0);
  const lastTrailPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!cursorState.visible) return;

    const dx = cursorState.screenX - lastTrailPos.current.x;
    const dy = cursorState.screenY - lastTrailPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 8) {
      lastTrailPos.current = { x: cursorState.screenX, y: cursorState.screenY };
      const id = trailIdRef.current++;
      setTrails(prev => [...prev.slice(-8), { x: cursorState.screenX, y: cursorState.screenY, id }]);
    }
  }, [cursorState.screenX, cursorState.screenY, cursorState.visible]);

  // Clean up old trails
  useEffect(() => {
    if (trails.length === 0) return;
    const timer = setTimeout(() => {
      setTrails(prev => prev.slice(1));
    }, 500);
    return () => clearTimeout(timer);
  }, [trails]);

  if (!cursorState.visible) return null;

  return (
    <>
      {/* Trail particles */}
      {trails.map(trail => (
        <div
          key={trail.id}
          className="cursor-trail"
          style={{
            left: trail.x,
            top: trail.y,
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        className={`gesture-cursor ${cursorState.isPinching ? 'pinching' : ''}`}
        style={{
          left: cursorState.screenX,
          top: cursorState.screenY,
          opacity: cursorState.visible ? 1 : 0,
        }}
      />
    </>
  );
}
