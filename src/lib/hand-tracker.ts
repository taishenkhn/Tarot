/**
 * MediaPipe Hands wrapper
 * Manages camera + hand landmark detection
 */
import type { GestureEvent } from './types';

// MediaPipe Hands types (simplified for our needs)
export interface HandLandmark {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  z: number;
}

export type HandLandmarks = HandLandmark[];

type OnHandUpdateCallback = (landmarks: HandLandmarks | null, timestamp: number) => void;

export class HandTracker {
  private video: HTMLVideoElement | null = null;
  private hands: any = null; // MediaPipe Hands instance
  private camera: any = null; // MediaPipe Camera instance
  private callbacks: OnHandUpdateCallback[] = [];
  private running: boolean = false;
  private frameCount: number = 0;

  async init(videoElement: HTMLVideoElement): Promise<void> {
    this.video = videoElement;

    // Dynamically import MediaPipe
    const { Hands } = await import('@mediapipe/hands');
    const { Camera } = await import('@mediapipe/camera_utils');

    this.hands = new Hands({
      locateFile: (file: string) => {
        return `/mediapipe/hands/${file}`;
      },
    });

    // Detect iOS for lighter model settings
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: isIOS ? 0 : 1,
      minDetectionConfidence: isIOS ? 0.5 : 0.65,
      minTrackingConfidence: isIOS ? 0.4 : 0.55,
    });

    this.hands.onResults((results: any) => {
      const timestamp = performance.now();
      this.frameCount++;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0] as HandLandmarks;
        this.callbacks.forEach(cb => cb(landmarks, timestamp));
      } else {
        this.callbacks.forEach(cb => cb(null, timestamp));
      }
    });

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.running) {
          try {
            await this.hands.send({ image: videoElement });
          } catch (e) {
            // MediaPipe frame errors should not kill the loop
            console.warn('MediaPipe frame error:', e);
          }
        }
      },
      width: isIOS ? 320 : 640,
      height: isIOS ? 240 : 480,
    });
  }

  async start(): Promise<void> {
    if (!this.camera) throw new Error('HandTracker not initialized. Call init() first.');
    this.running = true;
    await this.camera.start();
  }

  stop(): void {
    this.running = false;
    if (this.camera) {
      this.camera.stop();
    }
  }

  onUpdate(callback: OnHandUpdateCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  getFrameCount(): number {
    return this.frameCount;
  }

  isRunning(): boolean {
    return this.running;
  }
}
