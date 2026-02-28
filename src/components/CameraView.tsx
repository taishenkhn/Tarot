'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { HandTracker } from '@/lib/hand-tracker';
import { GestureRecognizer } from '@/lib/gesture-recognizer';
import type { GestureState } from '@/lib/gesture-recognizer';

interface CameraViewProps {
  onGestureUpdate: (state: GestureState, timestamp: number) => void;
  onReady: () => void;
  onError: (error: string) => void;
  active: boolean;
}

export default function CameraView({ onGestureUpdate, onReady, onError, active }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const recognizerRef = useRef(new GestureRecognizer());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('正在初始化摄像头...');

  const initCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setStatus('loading');
      setStatusMessage('正在请求摄像头权限...');

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NO_CAMERA_API');
      }

      const tracker = new HandTracker();
      trackerRef.current = tracker;

      setStatusMessage('正在加载手势识别模型...');

      await tracker.init(videoRef.current);

      tracker.onUpdate((landmarks, timestamp) => {
        const state = recognizerRef.current.recognize(landmarks, timestamp);
        onGestureUpdate(state, timestamp);
      });

      setStatusMessage('正在启动摄像头...');
      await tracker.start();

      setStatus('ready');
      setStatusMessage('手势识别已就绪');
      onReady();
    } catch (err: any) {
      console.error('Camera init error:', err);
      let msg = '摄像头初始化失败';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问';
      } else if (err.name === 'NotFoundError' || err.message === 'NO_CAMERA_API') {
        msg = '未检测到摄像头设备';
      } else if (err.name === 'NotReadableError') {
        msg = '摄像头被其他应用占用';
      }

      setStatus('error');
      setStatusMessage(msg);
      onError(msg);
    }
  }, [onGestureUpdate, onReady, onError]);

  useEffect(() => {
    if (active) {
      initCamera();
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
    };
  }, [active, initCamera]);

  return (
    <div className="relative">
      {/* Hidden video element for MediaPipe */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        style={{ width: 1, height: 1 }}
        playsInline
        muted
      />

      {/* Status indicator */}
      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-star-white/60">
          <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="text-sm text-mystic-red">
          {statusMessage}
        </div>
      )}

      {status === 'ready' && (
        <div className="flex items-center gap-2 text-sm text-gold/60">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
