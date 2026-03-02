/**
 * Gesture Recognizer
 * Converts hand landmarks to gesture events:
 * - Pointer (index finger tip position)
 * - Pinch (thumb + index finger close together)
 * - Palm (all fingers spread open)
 */
import type { HandLandmarks } from './hand-tracker';
import type { GestureEvent } from './types';

// Landmark indices
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const WRIST = 0;
const INDEX_MCP = 5; // base of index finger

// Thresholds
const PINCH_ON_THRESHOLD = 0.08; // normalized distance to trigger pinch
const PINCH_OFF_THRESHOLD = 0.10; // normalized distance to release pinch (hysteresis)
const PINCH_HOLD_MS = 50; // must hold pinch for this long
const PALM_SPREAD_THRESHOLD = 0.15; // min avg distance from palm center to fingertips

export interface GestureState {
  // Pointer
  pointerX: number; // 0-1 normalized (mirrored)
  pointerY: number; // 0-1 normalized
  hasHand: boolean;

  // Pinch
  isPinching: boolean;
  pinchDistance: number;

  // Palm
  isPalm: boolean;

  // Raw confidence
  confidence: number;
}

export class GestureRecognizer {
  private pinching: boolean = false;
  private pinchStartTime: number = 0;
  private pinchConfirmed: boolean = false;
  private lastPinchEndTime: number = 0;
  private pinchCooldownMs: number = 200;

  recognize(
    landmarks: HandLandmarks | null,
    timestamp: number
  ): GestureState {
    if (!landmarks || landmarks.length < 21) {
      return {
        pointerX: 0,
        pointerY: 0,
        hasHand: false,
        isPinching: false,
        pinchDistance: 1,
        isPalm: false,
        confidence: 0,
      };
    }

    // === Pointer: index finger tip ===
    // Mirror X axis (camera is mirrored)
    const pointerX = 1 - landmarks[INDEX_TIP].x;
    const pointerY = landmarks[INDEX_TIP].y;

    // === Pinch: thumb tip + index tip distance ===
    const pinchDist = this.distance2D(
      landmarks[THUMB_TIP],
      landmarks[INDEX_TIP]
    );

    // Hysteresis-based pinch detection
    const inCooldown = timestamp - this.lastPinchEndTime < this.pinchCooldownMs;

    if (!this.pinching && !inCooldown) {
      if (pinchDist < PINCH_ON_THRESHOLD) {
        if (this.pinchStartTime === 0) {
          this.pinchStartTime = timestamp;
        }
        if (timestamp - this.pinchStartTime >= PINCH_HOLD_MS) {
          this.pinching = true;
          this.pinchConfirmed = true;
        }
      } else {
        this.pinchStartTime = 0;
      }
    } else if (this.pinching) {
      if (pinchDist > PINCH_OFF_THRESHOLD) {
        this.pinching = false;
        this.pinchStartTime = 0;
        this.lastPinchEndTime = timestamp;
      }
    }

    // === Palm: all fingers spread ===
    const palmCenter = {
      x: (landmarks[WRIST].x + landmarks[INDEX_MCP].x) / 2,
      y: (landmarks[WRIST].y + landmarks[INDEX_MCP].y) / 2,
    };
    const fingerTips = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
    const avgSpread =
      fingerTips.reduce(
        (sum, idx) =>
          sum +
          this.distance2D(landmarks[idx], {
            x: palmCenter.x,
            y: palmCenter.y,
          }),
        0
      ) / fingerTips.length;

    const isPalm = avgSpread > PALM_SPREAD_THRESHOLD;

    return {
      pointerX,
      pointerY,
      hasHand: true,
      isPinching: this.pinchConfirmed && this.pinching,
      pinchDistance: pinchDist,
      isPalm,
      confidence: 1,
    };
  }

  /**
   * Convert gesture state to stream of events
   */
  toEvents(state: GestureState, prevState: GestureState | null, timestamp: number): GestureEvent[] {
    const events: GestureEvent[] = [];

    if (state.hasHand) {
      // Always emit move
      events.push({
        type: 'move',
        x: state.pointerX,
        y: state.pointerY,
        confidence: state.confidence,
        timestamp,
      });

      // Pinch transitions
      if (state.isPinching && (!prevState || !prevState.isPinching)) {
        events.push({
          type: 'pinch_start',
          x: state.pointerX,
          y: state.pointerY,
          confidence: state.confidence,
          timestamp,
        });
        // Reset confirmed so we only emit once per pinch
        this.pinchConfirmed = false;
      } else if (!state.isPinching && prevState?.isPinching) {
        events.push({
          type: 'pinch_end',
          x: state.pointerX,
          y: state.pointerY,
          confidence: state.confidence,
          timestamp,
        });
      }

      // Palm
      if (state.isPalm && (!prevState || !prevState.isPalm)) {
        events.push({
          type: 'palm',
          x: state.pointerX,
          y: state.pointerY,
          confidence: state.confidence,
          timestamp,
        });
      }
    }

    return events;
  }

  reset(): void {
    this.pinching = false;
    this.pinchStartTime = 0;
    this.pinchConfirmed = false;
    this.lastPinchEndTime = 0;
  }

  private distance2D(
    a: { x: number; y: number },
    b: { x: number; y: number }
  ): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
}
