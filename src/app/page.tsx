'use client';

import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-arcana-dark via-arcana-deep to-arcana-dark z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,27,78,0.4)_0%,transparent_70%)] z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Mystic symbol */}
        <div className="text-6xl md:text-8xl text-gold animate-float text-glow">
          ✦
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="font-serif text-4xl md:text-6xl text-gold text-glow tracking-wider">
            ArcanaCam Tarot
          </h1>
          <p className="text-star-white/60 text-lg md:text-xl font-light">
            LEX-赛博塔罗
          </p>
        </div>

        {/* Description */}
        <p className="max-w-md text-star-white/40 text-sm md:text-base leading-relaxed">
          通过手势在神秘氛围中完成洗牌、抽取三张牌、翻牌获得塔罗解读
        </p>

        {/* CTA Button */}
        <button
          className="btn-arcana text-lg mt-4"
          onClick={() => router.push('/question')}
        >
          开始占卜
        </button>

        {/* Subtle hint */}
        <div className="mt-8 flex flex-col items-center gap-2 text-star-white/20 text-xs">
          <span>📷 支持摄像头手势 · 🖱️ 也支持鼠标操作</span>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-gold/20">
        <div className="w-16 h-px bg-gold/20" />
        <span className="text-xs font-serif">✧</span>
        <div className="w-16 h-px bg-gold/20" />
      </div>
    </main>
  );
}
