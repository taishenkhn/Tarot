/**
 * Audio manager for tarot app sound effects
 * Manages: shuffle, select, flip sounds + global toggle
 */

type SoundName = 'shuffle' | 'select' | 'flip' | 'ambient';

class AudioManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    const soundFiles: Record<SoundName, string> = {
      shuffle: '/sounds/shuffle.mp3',
      select: '/sounds/select.mp3',
      flip: '/sounds/flip.mp3',
      ambient: '/sounds/ambient.mp3',
    };

    for (const [name, src] of Object.entries(soundFiles)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      if (name === 'ambient') {
        audio.loop = true;
        audio.volume = 0.15;
      } else {
        audio.volume = 0.5;
      }
      this.sounds.set(name as SoundName, audio);
    }

    this.initialized = true;
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const sound = this.sounds.get(name);
    if (!sound) return;

    if (name !== 'ambient') {
      // Reset to beginning for one-shot sounds
      sound.currentTime = 0;
    }
    sound.play().catch(() => {
      // Silently fail - browser may block autoplay
    });
  }

  stop(name: SoundName): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      // Stop all sounds
      this.sounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const audioManager = new AudioManager();
