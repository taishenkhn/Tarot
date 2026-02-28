/**
 * Cursor Engine
 * Integrates hand tracking + gesture recognition + One Euro Filter
 * Provides unified cursor state for both gesture and mouse/touch modes
 */
import { OneEuroFilter2D } from './one-euro-filter';
import { GestureRecognizer, type GestureState } from './gesture-recognizer';
import type { CursorState, InputMode } from './types';

// Dwell time: hover must stay in a card region for >= 120ms
const DWELL_THRESHOLD_MS = 120;

export type CardRect = {
  index: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type CursorUpdateCallback = (state: CursorState) => void;

export class CursorEngine {
  private filter: OneEuroFilter2D;
  private recognizer: GestureRecognizer;
  private mode: InputMode = 'mouse';
  private callbacks: CursorUpdateCallback[] = [];

  // Current state
  private screenX: number = 0;
  private screenY: number = 0;
  private visible: boolean = false;

  // Card hit-testing
  private cardRects: CardRect[] = [];
  private hoveredCardIndex: number | null = null;
  private hoverEnterTime: number = 0;
  private dwellTime: number = 0;

  // Pinch state
  private isPinching: boolean = false;

  // Viewport
  private viewportWidth: number = 1920;
  private viewportHeight: number = 1080;

  constructor() {
    this.filter = new OneEuroFilter2D(1.0, 0.007, 1.0);
    this.recognizer = new GestureRecognizer();
  }

  setMode(mode: InputMode): void {
    this.mode = mode;
    if (mode !== 'gesture') {
      this.recognizer.reset();
      this.filter.reset();
    }
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setCardRects(rects: CardRect[]): void {
    this.cardRects = rects;
  }

  onUpdate(callback: CursorUpdateCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Process gesture landmarks (called from hand-tracker onResults)
   */
  processGesture(
    gestureState: GestureState,
    timestamp: number
  ): void {
    if (this.mode !== 'gesture') return;

    if (!gestureState.hasHand) {
      this.visible = false;
      this.hoveredCardIndex = null;
      this.dwellTime = 0;
      this.emitState();
      return;
    }

    // Filter raw coordinates
    const t = timestamp / 1000; // One Euro expects seconds
    const rawX = gestureState.pointerX * this.viewportWidth;
    const rawY = gestureState.pointerY * this.viewportHeight;
    const filtered = this.filter.filter(rawX, rawY, t);

    this.screenX = filtered.x;
    this.screenY = filtered.y;
    this.visible = true;
    this.isPinching = gestureState.isPinching;

    this.updateHover(timestamp);
    this.emitState();
  }

  /**
   * Process mouse/touch input (fallback mode)
   */
  processPointer(clientX: number, clientY: number, isClick: boolean): void {
    if (this.mode === 'gesture') return;

    this.screenX = clientX;
    this.screenY = clientY;
    this.visible = true;
    this.isPinching = isClick;

    this.updateHover(performance.now());
    this.emitState();
  }

  /**
   * Release pinch (for mouse up)
   */
  releasePinch(): void {
    this.isPinching = false;
    this.emitState();
  }

  private updateHover(timestamp: number): void {
    const hitIndex = this.hitTest(this.screenX, this.screenY);

    if (hitIndex !== this.hoveredCardIndex) {
      this.hoveredCardIndex = hitIndex;
      this.hoverEnterTime = hitIndex !== null ? timestamp : 0;
      this.dwellTime = 0;
    } else if (hitIndex !== null) {
      this.dwellTime = timestamp - this.hoverEnterTime;
    }
  }

  private hitTest(x: number, y: number): number | null {
    for (const rect of this.cardRects) {
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return rect.index;
      }
    }
    return null;
  }

  private emitState(): void {
    const state: CursorState = {
      screenX: this.screenX,
      screenY: this.screenY,
      isHovering: this.hoveredCardIndex !== null && this.dwellTime >= DWELL_THRESHOLD_MS,
      isPinching: this.isPinching,
      hoveredCardIndex: this.dwellTime >= DWELL_THRESHOLD_MS ? this.hoveredCardIndex : null,
      dwellTime: this.dwellTime,
      visible: this.visible,
    };
    this.callbacks.forEach(cb => cb(state));
  }

  getState(): CursorState {
    return {
      screenX: this.screenX,
      screenY: this.screenY,
      isHovering: this.hoveredCardIndex !== null && this.dwellTime >= DWELL_THRESHOLD_MS,
      isPinching: this.isPinching,
      hoveredCardIndex: this.dwellTime >= DWELL_THRESHOLD_MS ? this.hoveredCardIndex : null,
      dwellTime: this.dwellTime,
      visible: this.visible,
    };
  }

  reset(): void {
    this.filter.reset();
    this.recognizer.reset();
    this.screenX = 0;
    this.screenY = 0;
    this.visible = false;
    this.hoveredCardIndex = null;
    this.dwellTime = 0;
    this.isPinching = false;
  }

  updateFilterParams(minCutoff?: number, beta?: number): void {
    this.filter.updateParams(minCutoff, beta);
  }
}

// Singleton for the app
export const cursorEngine = new CursorEngine();
