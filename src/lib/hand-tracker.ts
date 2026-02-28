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
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
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
          await this.hands.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
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
