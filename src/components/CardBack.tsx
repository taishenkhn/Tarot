'use client';

/**
 * SVG Tarot Card Back Design
 * Ornate mystical pattern with gold/purple theme
 */

interface CardBackProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function CardBack({ width = 150, height = 225, className = '' }: CardBackProps) {
  return (
    <svg
      viewBox="0 0 120 155"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cardback-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a3e" />
          <stop offset="50%" stopColor="#0d0d2b" />
          <stop offset="100%" stopColor="#1a0a3e" />
        </linearGradient>
        <linearGradient id="cardback-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a7432" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#8a7432" />
        </linearGradient>
        <pattern id="cardback-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.5" fill="#c9a84c" opacity="0.15" />
        </pattern>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="120" height="155" rx="6" fill="url(#cardback-bg)" />

      {/* Dot pattern */}
      <rect x="10" y="10" width="100" height="135" rx="3" fill="url(#cardback-dots)" />

      {/* Outer border */}
      <rect x="1" y="1" width="118" height="153" rx="5.5" fill="none" stroke="url(#cardback-gold)" strokeWidth="1.5" />

      {/* Inner border */}
      <rect x="6" y="6" width="108" height="143" rx="4" fill="none" stroke="#8a7432" strokeWidth="0.8" opacity="0.6" />

      {/* Second inner border */}
      <rect x="10" y="10" width="100" height="135" rx="3" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3" />

      {/* Center diamond pattern */}
      <g transform="translate(60, 77.5)">
        {/* Outer diamond */}
        <path d="M0 -45 L35 0 L0 45 L-35 0Z" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.4" />
        {/* Middle diamond */}
        <path d="M0 -32 L25 0 L0 32 L-25 0Z" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.3" />
        {/* Inner diamond */}
        <path d="M0 -18 L14 0 L0 18 L-14 0Z" fill="none" stroke="#e8d48b" strokeWidth="0.8" opacity="0.5" />

        {/* Center star */}
        <circle cx="0" cy="0" r="8" fill="none" stroke="#c9a84c" strokeWidth="1" />
        <circle cx="0" cy="0" r="4" fill="#c9a84c" opacity="0.15" />
        {/* 8-pointed inner star */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 8 * Math.cos(rad);
          const y2 = 8 * Math.sin(rad);
          return <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke="#c9a84c" strokeWidth="0.6" opacity="0.4" />;
        })}

        {/* Compass points */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 25 * Math.cos(rad);
          const cy = 25 * Math.sin(rad);
          return <circle key={`cp-${i}`} cx={cx} cy={cy} r="2" fill="none" stroke="#c9a84c" strokeWidth="0.6" opacity="0.4" />;
        })}

        {/* Diagonal ornaments */}
        {[45, 135, 225, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 20 * Math.cos(rad);
          const cy = 20 * Math.sin(rad);
          return <circle key={`diag-${i}`} cx={cx} cy={cy} r="1.5" fill="#c9a84c" opacity="0.2" />;
        })}
      </g>

      {/* Corner ornaments */}
      {[
        { x: 15, y: 15, r: 0 },
        { x: 105, y: 15, r: 90 },
        { x: 105, y: 140, r: 180 },
        { x: 15, y: 140, r: 270 },
      ].map((corner, i) => (
        <g key={i} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.r})`}>
          <path d="M0 0 L8 0 Q5 3 5 8" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5" />
          <circle cx="0" cy="0" r="1.5" fill="#c9a84c" opacity="0.3" />
        </g>
      ))}

      {/* Title text */}
      <text x="60" y="78" textAnchor="middle" fill="#c9a84c" fontSize="6" fontFamily="serif" opacity="0.25" letterSpacing="2">
        ARCANA
      </text>
    </svg>
  );
}
