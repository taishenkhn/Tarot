'use client';

import type { TarotCard } from '@/lib/types';

/**
 * SVG Tarot Card Image Component
 * Renders all 78 cards as inline SVGs with:
 * - Decorative gold borders
 * - Major Arcana: unique symbolic artwork per card
 * - Minor Arcana: suit symbols arranged by number + court card designs
 * - Card name in Chinese & English
 */

interface CardImageProps {
  card: TarotCard;
  width?: number;
  height?: number;
  className?: string;
}

// ============================================================
// Color palette
// ============================================================
const C = {
  bg: '#0d0d2b',
  bgLight: '#1a1040',
  gold: '#c9a84c',
  goldLight: '#e8d48b',
  goldDim: '#8a7432',
  purple: '#2d1b4e',
  purpleLight: '#4a2d6e',
  white: '#e8e0f0',
  red: '#c94c4c',
  blue: '#5b7fc4',
  green: '#4ca87a',
  cyan: '#5bbcc9',
};

// ============================================================
// Suit symbol paths (SVG path data drawn at ~24x24 viewBox)
// ============================================================
const SUIT_PATHS: Record<string, { path: string; color: string }> = {
  wands: {
    path: 'M12 2 L12 22 M9 4 Q12 7 15 4 M9 8 Q12 5 15 8 M8 19 L12 22 L16 19 M10 2 L12 0.5 L14 2',
    color: '#d4a23a',
  },
  cups: {
    path: 'M6 8 Q6 2 12 2 Q18 2 18 8 L16 16 Q16 18 12 18 Q8 18 8 16 Z M8 18 L8 20 L16 20 L16 18 M10 20 L10 22 L14 22 L14 20',
    color: '#5b8fc4',
  },
  swords: {
    path: 'M12 1 L12 20 M9 3 L12 1 L15 3 M8 4 L12 2 L16 4 M10 18 L8 22 M14 18 L16 22 M9 18 L15 18',
    color: '#b8b8c8',
  },
  pentacles: {
    path: 'M12 2 L14.5 8.5 L21.5 9 L16 13.5 L17.5 20.5 L12 17 L6.5 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z',
    color: '#c9a84c',
  },
};

// ============================================================
// Major Arcana artwork data: 22 unique symbolic designs
// Each entry has: symbol lines (SVG elements), accent color
// ============================================================
interface MajorDesign {
  elements: string; // Raw SVG elements string (positioned in a 120x120 viewBox area centered)
  accent: string;
}

function getMajorDesign(id: number): MajorDesign {
  const designs: Record<number, MajorDesign> = {
    0: { // The Fool
      accent: '#e8d48b',
      elements: `
        <circle cx="60" cy="35" r="18" fill="none" stroke="${C.goldLight}" stroke-width="1.5" opacity="0.6"/>
        <path d="M45 70 Q60 50 75 70" fill="none" stroke="${C.gold}" stroke-width="2"/>
        <path d="M75 70 L85 85" fill="none" stroke="${C.goldDim}" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle cx="52" cy="32" r="2" fill="${C.goldLight}"/>
        <circle cx="68" cy="32" r="2" fill="${C.goldLight}"/>
        <path d="M56 40 Q60 44 64 40" fill="none" stroke="${C.goldLight}" stroke-width="1"/>
        <path d="M30 85 L90 85" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.4"/>
        <path d="M85 85 L95 95" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.3"/>
        <circle cx="42" cy="60" r="5" fill="none" stroke="${C.gold}" stroke-width="1" opacity="0.5"/>
        <text x="60" y="105" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">0</text>
      `
    },
    1: { // The Magician
      accent: '#e8d48b',
      elements: `
        <path d="M45 25 Q60 15 75 25 Q85 35 75 45 Q60 55 45 45 Q35 35 45 25Z" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <line x1="60" y1="55" x2="60" y2="95" stroke="${C.gold}" stroke-width="2"/>
        <circle cx="40" cy="80" r="6" fill="none" stroke="${C.blue}" stroke-width="1.2"/>
        <path d="M75 75 L80 85 L70 85Z" fill="none" stroke="${C.red}" stroke-width="1.2"/>
        <line x1="85" y1="78" x2="95" y2="88" stroke="${C.goldLight}" stroke-width="1.2"/>
        <circle cx="30" cy="80" r="0" fill="none"/>
        <path d="M25 85 L28 78 L31 85" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <circle cx="60" cy="40" r="3" fill="${C.gold}"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">I</text>
      `
    },
    2: { // High Priestess
      accent: '#8888cc',
      elements: `
        <rect x="40" y="25" width="5" height="60" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <rect x="75" y="25" width="5" height="60" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <path d="M50 35 Q60 25 70 35 Q80 45 70 45 Q60 35 50 45 Q40 45 50 35Z" fill="none" stroke="#8888cc" stroke-width="1.5"/>
        <circle cx="60" cy="65" r="12" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M55 62 Q60 70 65 62" fill="none" stroke="${C.goldLight}" stroke-width="1"/>
        <path d="M48 50 L72 50" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.5"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">II</text>
      `
    },
    3: { // The Empress
      accent: '#4ca87a',
      elements: `
        <circle cx="60" cy="45" r="20" fill="none" stroke="${C.green}" stroke-width="1.5"/>
        <path d="M60 25 L60 70" stroke="${C.green}" stroke-width="1.5"/>
        <path d="M48 55 L60 70 L72 55" fill="none" stroke="${C.green}" stroke-width="1.5"/>
        <path d="M35 80 Q48 70 60 80 Q72 70 85 80" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.6"/>
        <path d="M30 88 Q48 78 60 88 Q72 78 90 88" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.4"/>
        <circle cx="50" cy="38" r="2" fill="${C.goldLight}" opacity="0.6"/>
        <circle cx="70" cy="38" r="2" fill="${C.goldLight}" opacity="0.6"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">III</text>
      `
    },
    4: { // The Emperor
      accent: '#c94c4c',
      elements: `
        <rect x="42" y="30" width="36" height="45" rx="2" fill="none" stroke="${C.red}" stroke-width="1.5"/>
        <path d="M42 30 L60 18 L78 30" fill="none" stroke="${C.gold}" stroke-width="2"/>
        <circle cx="60" cy="50" r="8" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M56 48 L60 42 L64 48" fill="none" stroke="${C.goldLight}" stroke-width="1.2"/>
        <line x1="48" y1="65" x2="72" y2="65" stroke="${C.goldDim}" stroke-width="1"/>
        <rect x="55" y="68" width="10" height="3" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="0.8"/>
        <circle cx="48" cy="85" r="3" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.5"/>
        <circle cx="72" cy="85" r="3" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.5"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">IV</text>
      `
    },
    5: { // The Hierophant
      accent: '#c9a84c',
      elements: `
        <line x1="60" y1="20" x2="60" y2="85" stroke="${C.gold}" stroke-width="2"/>
        <line x1="48" y1="35" x2="72" y2="35" stroke="${C.gold}" stroke-width="1.5"/>
        <line x1="50" y1="50" x2="70" y2="50" stroke="${C.gold}" stroke-width="1.5"/>
        <line x1="52" y1="65" x2="68" y2="65" stroke="${C.gold}" stroke-width="1"/>
        <circle cx="60" cy="25" r="5" fill="none" stroke="${C.goldLight}" stroke-width="1.5"/>
        <path d="M40 90 L50 80 L60 90 L70 80 L80 90" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.6"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">V</text>
      `
    },
    6: { // The Lovers
      accent: '#c94c7c',
      elements: `
        <path d="M45 45 Q45 30 55 30 Q60 30 60 40 Q60 30 65 30 Q75 30 75 45 Q75 60 60 72 Q45 60 45 45Z" fill="none" stroke="#c94c7c" stroke-width="1.8"/>
        <circle cx="45" cy="80" r="8" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <circle cx="75" cy="80" r="8" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <path d="M53 80 L67 80" fill="none" stroke="${C.gold}" stroke-width="1" stroke-dasharray="2,2"/>
        <path d="M52 22 L60 14 L68 22" fill="none" stroke="${C.goldLight}" stroke-width="1.2"/>
        <circle cx="60" cy="12" r="4" fill="none" stroke="${C.goldLight}" stroke-width="1"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">VI</text>
      `
    },
    7: { // The Chariot
      accent: '#5bbcc9',
      elements: `
        <rect x="38" y="40" width="44" height="30" rx="3" fill="none" stroke="${C.cyan}" stroke-width="1.5"/>
        <path d="M38 55 L30 65 Q28 70 33 70 L38 70" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <path d="M82 55 L90 65 Q92 70 87 70 L82 70" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <circle cx="30" cy="72" r="5" fill="none" stroke="${C.gold}" stroke-width="1.2"/>
        <circle cx="90" cy="72" r="5" fill="none" stroke="${C.gold}" stroke-width="1.2"/>
        <path d="M50 28 L60 18 L70 28" fill="none" stroke="${C.gold}" stroke-width="2"/>
        <circle cx="60" cy="50" r="3" fill="${C.goldLight}"/>
        <line x1="60" y1="30" x2="60" y2="40" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M45 85 L60 80 L75 85" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.5"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">VII</text>
      `
    },
    8: { // Strength
      accent: '#e8d48b',
      elements: `
        <path d="M40 55 Q40 35 55 35 Q65 35 65 45 Q65 55 55 55 Q45 55 45 65 Q45 75 55 75 Q65 75 65 65 Q65 55 80 55" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M35 80 Q45 70 55 80 Q55 90 45 90 Q35 90 35 80Z" fill="none" stroke="${C.goldLight}" stroke-width="1.2"/>
        <circle cx="75" cy="45" r="3" fill="${C.goldLight}" opacity="0.5"/>
        <path d="M62 85 Q70 78 78 85" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">VIII</text>
      `
    },
    9: { // The Hermit
      accent: '#e8d48b',
      elements: `
        <line x1="60" y1="55" x2="60" y2="92" stroke="${C.goldDim}" stroke-width="2"/>
        <path d="M50 55 L60 30 L70 55Z" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <circle cx="60" cy="40" r="5" fill="${C.goldLight}" opacity="0.4"/>
        <circle cx="60" cy="40" r="2" fill="${C.goldLight}" opacity="0.8"/>
        <path d="M40 92 L80 92" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.4"/>
        ${[0,1,2,3,4].map(i => `<circle cx="${40+i*10}" cy="${20}" r="1" fill="${C.goldLight}" opacity="${0.2+i*0.1}"/>`).join('')}
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">IX</text>
      `
    },
    10: { // Wheel of Fortune
      accent: '#c9a84c',
      elements: `
        <circle cx="60" cy="55" r="28" fill="none" stroke="${C.gold}" stroke-width="1.8"/>
        <circle cx="60" cy="55" r="18" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <circle cx="60" cy="55" r="5" fill="${C.goldLight}" opacity="0.4"/>
        ${[0,1,2,3,4,5,6,7].map(i => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = 60 + 18 * Math.cos(angle);
          const y1 = 55 + 18 * Math.sin(angle);
          const x2 = 60 + 28 * Math.cos(angle);
          const y2 = 55 + 28 * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.goldDim}" stroke-width="0.8"/>`;
        }).join('')}
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">X</text>
      `
    },
    11: { // Justice
      accent: '#b8b8c8',
      elements: `
        <line x1="60" y1="25" x2="60" y2="55" stroke="${C.gold}" stroke-width="2"/>
        <line x1="35" y1="40" x2="85" y2="40" stroke="${C.gold}" stroke-width="2"/>
        <path d="M30 40 L30 55 Q30 60 35 60 L40 60 Q45 60 45 55 L45 40" fill="none" stroke="${C.goldLight}" stroke-width="1.2"/>
        <path d="M75 40 L75 50 Q75 55 80 55 L85 55 Q90 55 90 50 L90 40" fill="none" stroke="${C.goldLight}" stroke-width="1.2"/>
        <path d="M55 70 L60 60 L65 70Z" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <line x1="60" y1="70" x2="60" y2="90" stroke="${C.goldDim}" stroke-width="1.5"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XI</text>
      `
    },
    12: { // The Hanged Man
      accent: '#5b8fc4',
      elements: `
        <line x1="40" y1="25" x2="80" y2="25" stroke="${C.goldDim}" stroke-width="2"/>
        <line x1="60" y1="25" x2="60" y2="45" stroke="${C.gold}" stroke-width="1.5"/>
        <circle cx="60" cy="55" r="10" fill="none" stroke="${C.blue}" stroke-width="1.5"/>
        <circle cx="57" cy="53" r="1.5" fill="${C.goldLight}"/>
        <circle cx="63" cy="53" r="1.5" fill="${C.goldLight}"/>
        <path d="M57 58 Q60 61 63 58" fill="none" stroke="${C.goldLight}" stroke-width="0.8"/>
        <path d="M50 65 L55 80 L45 92" fill="none" stroke="${C.gold}" stroke-width="1.2"/>
        <path d="M70 65 L65 80 L75 92" fill="none" stroke="${C.gold}" stroke-width="1.2"/>
        <circle cx="60" cy="55" r="16" fill="none" stroke="${C.goldDim}" stroke-width="0.5" opacity="0.3" stroke-dasharray="3,3"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XII</text>
      `
    },
    13: { // Death
      accent: '#8a8a9e',
      elements: `
        <path d="M45 35 Q50 22 60 22 Q70 22 75 35 Q78 45 70 48 L65 50 L70 55 Q75 65 60 70 Q45 65 50 55 L55 50 L50 48 Q42 45 45 35Z" fill="none" stroke="#8a8a9e" stroke-width="1.5"/>
        <circle cx="53" cy="36" r="3" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <circle cx="67" cy="36" r="3" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <path d="M40 78 Q60 72 80 78" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <path d="M42 82 Q60 76 78 82" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.5"/>
        <path d="M55 80 L60 90 L65 80" fill="none" stroke="${C.gold}" stroke-width="1" opacity="0.6"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XIII</text>
      `
    },
    14: { // Temperance
      accent: '#5bbcc9',
      elements: `
        <path d="M35 40 Q35 30 45 30 L50 30 Q55 30 55 40 L55 55 Q55 60 50 60 L45 60 Q35 60 35 55Z" fill="none" stroke="${C.cyan}" stroke-width="1.2"/>
        <path d="M65 40 Q65 30 75 30 L80 30 Q85 30 85 40 L85 55 Q85 60 80 60 L75 60 Q65 60 65 55Z" fill="none" stroke="${C.cyan}" stroke-width="1.2"/>
        <path d="M55 45 Q60 35 65 45" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M55 50 Q60 60 65 50" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M48 70 L60 65 L72 70" fill="none" stroke="${C.goldDim}" stroke-width="1"/>
        <circle cx="60" cy="80" r="8" fill="none" stroke="${C.gold}" stroke-width="1" opacity="0.5"/>
        <path d="M56 80 L60 76 L64 80 L60 84Z" fill="${C.goldLight}" opacity="0.4"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XIV</text>
      `
    },
    15: { // The Devil
      accent: '#c94c4c',
      elements: `
        <path d="M60 25 L72 55 L90 60 L75 75 L80 95 L60 82 L40 95 L45 75 L30 60 L48 55Z" fill="none" stroke="${C.red}" stroke-width="1.5"/>
        <circle cx="60" cy="62" r="10" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.5"/>
        <path d="M50 30 L55 20" fill="none" stroke="${C.red}" stroke-width="1.2"/>
        <path d="M70 30 L65 20" fill="none" stroke="${C.red}" stroke-width="1.2"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XV</text>
      `
    },
    16: { // The Tower
      accent: '#c94c4c',
      elements: `
        <rect x="47" y="38" width="26" height="55" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="1.5"/>
        <path d="M45 38 L60 22 L75 38" fill="none" stroke="${C.gold}" stroke-width="1.8"/>
        <path d="M35 20 L60 10 L55 25" fill="none" stroke="${C.red}" stroke-width="2"/>
        <rect x="53" y="50" width="6" height="8" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="0.8"/>
        <rect x="61" y="50" width="6" height="8" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="0.8"/>
        <rect x="53" y="65" width="6" height="8" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="0.8"/>
        <rect x="61" y="65" width="6" height="8" rx="1" fill="none" stroke="${C.goldDim}" stroke-width="0.8"/>
        ${[0,1,2,3].map(i => `<circle cx="${35+i*15}" cy="${95-i*5}" r="${1+Math.random()}" fill="${C.red}" opacity="${0.4+i*0.1}"/>`).join('')}
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XVI</text>
      `
    },
    17: { // The Star
      accent: '#e8d48b',
      elements: `
        ${eightPointStar(60, 42, 22, C.goldLight, 1.8)}
        ${[0,1,2,3,4,5,6].map(i => {
          const angle = (i * 51.4 + 20) * Math.PI / 180;
          const r = 35 + (i % 3) * 5;
          const cx = 60 + r * Math.cos(angle);
          const cy = 55 + r * Math.sin(angle);
          return `<circle cx="${cx}" cy="${cy}" r="${1 + (i%2)}" fill="${C.goldLight}" opacity="${0.3 + (i%3)*0.15}"/>`;
        }).join('')}
        <path d="M40 82 Q50 75 60 82 Q70 75 80 82" fill="none" stroke="${C.cyan}" stroke-width="1" opacity="0.5"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XVII</text>
      `
    },
    18: { // The Moon
      accent: '#8888cc',
      elements: `
        <circle cx="60" cy="38" r="18" fill="none" stroke="#8888cc" stroke-width="1.5"/>
        <circle cx="68" cy="32" r="14" fill="${C.bg}"/>
        <path d="M35 75 Q47 60 60 75 Q73 60 85 75" fill="none" stroke="${C.blue}" stroke-width="1" opacity="0.5"/>
        <path d="M30 82 Q47 67 60 82 Q73 67 90 82" fill="none" stroke="${C.blue}" stroke-width="0.8" opacity="0.3"/>
        ${[0,1,2].map(i => `<circle cx="${45+i*15}" cy="${88}" r="${1}" fill="${C.goldLight}" opacity="0.4"/>`).join('')}
        <path d="M42 72 L45 65 L48 72" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.6"/>
        <path d="M72 72 L75 65 L78 72" fill="none" stroke="${C.goldDim}" stroke-width="1" opacity="0.6"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XVIII</text>
      `
    },
    19: { // The Sun
      accent: '#e8d48b',
      elements: `
        <circle cx="60" cy="48" r="16" fill="none" stroke="${C.goldLight}" stroke-width="2"/>
        <circle cx="60" cy="48" r="10" fill="${C.goldLight}" opacity="0.15"/>
        ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const angle = (i * 30) * Math.PI / 180;
          const x1 = 60 + 20 * Math.cos(angle);
          const y1 = 48 + 20 * Math.sin(angle);
          const x2 = 60 + 28 * Math.cos(angle);
          const y2 = 48 + 28 * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.goldLight}" stroke-width="${i%2===0?1.5:0.8}" opacity="${i%2===0?0.8:0.4}"/>`;
        }).join('')}
        <circle cx="56" cy="45" r="2" fill="${C.goldLight}" opacity="0.6"/>
        <circle cx="64" cy="45" r="2" fill="${C.goldLight}" opacity="0.6"/>
        <path d="M55 52 Q60 56 65 52" fill="none" stroke="${C.goldLight}" stroke-width="1"/>
        <path d="M40 85 Q50 78 60 85 Q70 78 80 85" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.4"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XIX</text>
      `
    },
    20: { // Judgement
      accent: '#e8d48b',
      elements: `
        <path d="M55 25 L52 55 L60 50 L68 55 L65 25Z" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
        <path d="M48 55 L60 50 L72 55" fill="none" stroke="${C.goldLight}" stroke-width="1"/>
        <circle cx="60" cy="22" r="5" fill="${C.goldLight}" opacity="0.3"/>
        <path d="M40 70 L45 60 L50 70" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <path d="M55 70 L60 60 L65 70" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <path d="M70 70 L75 60 L80 70" fill="none" stroke="${C.goldDim}" stroke-width="1.2"/>
        <path d="M35 85 Q60 75 85 85" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.4"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XX</text>
      `
    },
    21: { // The World
      accent: '#4ca87a',
      elements: `
        <ellipse cx="60" cy="55" rx="28" ry="32" fill="none" stroke="${C.green}" stroke-width="1.8"/>
        <ellipse cx="60" cy="55" rx="18" ry="22" fill="none" stroke="${C.goldDim}" stroke-width="0.8" opacity="0.4"/>
        <circle cx="60" cy="55" r="6" fill="${C.goldLight}" opacity="0.2"/>
        <circle cx="60" cy="55" r="2" fill="${C.goldLight}" opacity="0.5"/>
        <circle cx="60" cy="23" r="3" fill="none" stroke="${C.gold}" stroke-width="1"/>
        <circle cx="60" cy="87" r="3" fill="none" stroke="${C.gold}" stroke-width="1"/>
        <circle cx="32" cy="55" r="3" fill="none" stroke="${C.gold}" stroke-width="1"/>
        <circle cx="88" cy="55" r="3" fill="none" stroke="${C.gold}" stroke-width="1"/>
        <text x="60" y="108" text-anchor="middle" fill="${C.goldDim}" font-size="8" opacity="0.5">XXI</text>
      `
    },
  };

  return designs[id] || designs[0];
}

function eightPointStar(cx: number, cy: number, r: number, color: string, sw: number): string {
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 - 90) * Math.PI / 180;
    const outerR = i % 2 === 0 ? r : r * 0.45;
    points.push(`${cx + outerR * Math.cos(angle)},${cy + outerR * Math.sin(angle)}`);
  }
  return `<polygon points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
}

// ============================================================
// Minor Arcana suit symbol arrangement patterns
// ============================================================
function getSuitSymbolPositions(count: number): { x: number; y: number }[] {
  // Positions in a 120x120 area (will be translated)
  const layouts: Record<number, { x: number; y: number }[]> = {
    1: [{ x: 60, y: 55 }],
    2: [{ x: 60, y: 35 }, { x: 60, y: 75 }],
    3: [{ x: 60, y: 30 }, { x: 60, y: 55 }, { x: 60, y: 80 }],
    4: [{ x: 42, y: 35 }, { x: 78, y: 35 }, { x: 42, y: 75 }, { x: 78, y: 75 }],
    5: [{ x: 42, y: 35 }, { x: 78, y: 35 }, { x: 60, y: 55 }, { x: 42, y: 75 }, { x: 78, y: 75 }],
    6: [{ x: 42, y: 30 }, { x: 78, y: 30 }, { x: 42, y: 55 }, { x: 78, y: 55 }, { x: 42, y: 80 }, { x: 78, y: 80 }],
    7: [{ x: 42, y: 30 }, { x: 78, y: 30 }, { x: 42, y: 52 }, { x: 78, y: 52 }, { x: 60, y: 41 }, { x: 42, y: 74 }, { x: 78, y: 74 }],
    8: [{ x: 42, y: 28 }, { x: 78, y: 28 }, { x: 42, y: 46 }, { x: 78, y: 46 }, { x: 42, y: 64 }, { x: 78, y: 64 }, { x: 42, y: 82 }, { x: 78, y: 82 }],
    9: [{ x: 42, y: 26 }, { x: 78, y: 26 }, { x: 42, y: 44 }, { x: 78, y: 44 }, { x: 60, y: 55 }, { x: 42, y: 66 }, { x: 78, y: 66 }, { x: 42, y: 84 }, { x: 78, y: 84 }],
    10: [{ x: 42, y: 24 }, { x: 78, y: 24 }, { x: 42, y: 40 }, { x: 78, y: 40 }, { x: 60, y: 32 }, { x: 42, y: 58 }, { x: 78, y: 58 }, { x: 60, y: 72 }, { x: 42, y: 84 }, { x: 78, y: 84 }],
  };
  return layouts[count] || layouts[1];
}

function renderSuitSymbol(suit: string, cx: number, cy: number, size: number = 10): string {
  const info = SUIT_PATHS[suit];
  if (!info) return '';

  // Draw simplified suit symbols at position
  switch (suit) {
    case 'wands':
      return `<g transform="translate(${cx},${cy})">
        <line x1="0" y1="-${size}" x2="0" y2="${size}" stroke="${info.color}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M-3 -${size-2} Q0 -${size+2} 3 -${size-2}" fill="none" stroke="${info.color}" stroke-width="1"/>
        <circle cx="0" cy="-${size}" r="1.5" fill="${info.color}" opacity="0.6"/>
      </g>`;
    case 'cups':
      return `<g transform="translate(${cx},${cy})">
        <path d="M-${size*0.6} -${size*0.3} Q-${size*0.6} -${size} 0 -${size} Q${size*0.6} -${size} ${size*0.6} -${size*0.3} L${size*0.35} ${size*0.4} Q${size*0.3} ${size*0.6} 0 ${size*0.6} Q-${size*0.3} ${size*0.6} -${size*0.35} ${size*0.4}Z" fill="none" stroke="${info.color}" stroke-width="1.3"/>
        <line x1="0" y1="${size*0.6}" x2="0" y2="${size*0.85}" stroke="${info.color}" stroke-width="1.3"/>
        <line x1="-${size*0.3}" y1="${size*0.85}" x2="${size*0.3}" y2="${size*0.85}" stroke="${info.color}" stroke-width="1.3"/>
      </g>`;
    case 'swords':
      return `<g transform="translate(${cx},${cy})">
        <line x1="0" y1="-${size}" x2="0" y2="${size}" stroke="${info.color}" stroke-width="1.5"/>
        <path d="M-${size*0.25} -${size*0.8} L0 -${size} L${size*0.25} -${size*0.8}" fill="none" stroke="${info.color}" stroke-width="1.2"/>
        <line x1="-${size*0.4}" y1="${size*0.3}" x2="${size*0.4}" y2="${size*0.3}" stroke="${info.color}" stroke-width="1.5"/>
      </g>`;
    case 'pentacles':
      return `<g transform="translate(${cx},${cy})">
        <circle cx="0" cy="0" r="${size*0.85}" fill="none" stroke="${info.color}" stroke-width="1.3"/>
        ${fivePointStar(0, 0, size * 0.6, info.color)}
      </g>`;
    default:
      return '';
  }
}

function fivePointStar(cx: number, cy: number, r: number, color: string): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180;
    const rad = i % 2 === 0 ? r : r * 0.4;
    points.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
  }
  return `<polygon points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="0.8"/>`;
}

// ============================================================
// Court card designs (Page, Knight, Queen, King)
// ============================================================
function getCourtDesign(suit: string, number: number): string {
  const info = SUIT_PATHS[suit] || { color: C.gold };
  const roles: Record<number, { symbol: string; title: string }> = {
    11: { symbol: '◇', title: '侍' },
    12: { symbol: '♞', title: '骑' },
    13: { symbol: '♛', title: '后' },
    14: { symbol: '♚', title: '王' },
  };
  const role = roles[number] || roles[11];

  // Crown/helmet size based on role
  const crownSize = number >= 13 ? 12 : 8;

  return `
    <circle cx="60" cy="40" r="14" fill="none" stroke="${info.color}" stroke-width="1.5"/>
    ${number >= 13 ? `
      <path d="M${60-crownSize} 28 L${60-crownSize+4} 18 L60 24 L${60+crownSize-4} 18 L${60+crownSize} 28" fill="none" stroke="${C.goldLight}" stroke-width="1.5"/>
    ` : number === 12 ? `
      <path d="M48 28 L60 18 L72 28" fill="none" stroke="${info.color}" stroke-width="1.5"/>
    ` : `
      <circle cx="60" cy="26" r="4" fill="none" stroke="${info.color}" stroke-width="1"/>
    `}
    <line x1="60" y1="54" x2="60" y2="78" stroke="${info.color}" stroke-width="1.5"/>
    <path d="M48 60 L60 56 L72 60" fill="none" stroke="${info.color}" stroke-width="1"/>
    ${renderSuitSymbol(suit, 60, 88, 7)}
    <text x="60" y="106" text-anchor="middle" fill="${C.goldDim}" font-size="7" font-family="serif" opacity="0.6">${role.title}</text>
  `;
}

// ============================================================
// Main Component
// ============================================================
export default function CardImage({ card, width = 150, height = 225, className = '' }: CardImageProps) {
  const isMajor = card.arcana === 'major';
  const isCourtCard = card.arcana === 'minor' && card.number >= 11;
  const isNumberCard = card.arcana === 'minor' && card.number <= 10;

  // Build artwork SVG elements
  let artwork: string;
  let accentColor: string;

  if (isMajor) {
    const design = getMajorDesign(card.id);
    artwork = design.elements;
    accentColor = design.accent;
  } else if (isCourtCard) {
    artwork = getCourtDesign(card.suit!, card.number);
    accentColor = SUIT_PATHS[card.suit!]?.color || C.gold;
  } else {
    // Number card (1-10)
    const positions = getSuitSymbolPositions(card.number);
    artwork = positions.map(p => renderSuitSymbol(card.suit!, p.x, p.y, card.number <= 3 ? 11 : card.number <= 6 ? 9 : 7)).join('');
    accentColor = SUIT_PATHS[card.suit!]?.color || C.gold;
  }

  const viewBox = "0 0 120 155";

  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bg-${card.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1040" />
          <stop offset="50%" stopColor="#0d0d2b" />
          <stop offset="100%" stopColor="#1a0a3e" />
        </linearGradient>
        <linearGradient id={`border-${card.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.goldDim} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldDim} />
        </linearGradient>
      </defs>

      {/* Card background */}
      <rect x="0" y="0" width="120" height="155" rx="6" fill={`url(#bg-${card.id})`} />

      {/* Outer border */}
      <rect x="1" y="1" width="118" height="153" rx="5.5" fill="none" stroke={`url(#border-${card.id})`} strokeWidth="1.5" />

      {/* Inner decorative border */}
      <rect x="5" y="5" width="110" height="145" rx="4" fill="none" stroke={C.goldDim} strokeWidth="0.5" opacity="0.4" />

      {/* Corner decorations */}
      {[
        { cx: 12, cy: 12 },
        { cx: 108, cy: 12 },
        { cx: 12, cy: 143 },
        { cx: 108, cy: 143 },
      ].map((corner, i) => (
        <circle key={i} cx={corner.cx} cy={corner.cy} r="2" fill="none" stroke={C.goldDim} strokeWidth="0.6" opacity="0.5" />
      ))}

      {/* Card number at top */}
      <text
        x="60"
        y="16"
        textAnchor="middle"
        fill={accentColor}
        fontSize="9"
        fontFamily="serif"
        opacity="0.7"
      >
        {isMajor ? toRoman(card.number) : card.number <= 10 ? card.number : ''}
      </text>

      {/* Artwork area */}
      <g transform="translate(0, 8)">
        <g dangerouslySetInnerHTML={{ __html: artwork }} />
      </g>

      {/* Card name (Chinese) */}
      <text
        x="60"
        y="132"
        textAnchor="middle"
        fill={C.goldLight}
        fontSize="9"
        fontFamily="serif"
      >
        {card.name_cn}
      </text>

      {/* Card name (English) */}
      <text
        x="60"
        y="144"
        textAnchor="middle"
        fill={C.goldDim}
        fontSize="5.5"
        fontFamily="serif"
        opacity="0.6"
      >
        {card.name_en}
      </text>

      {/* Suit indicator for minor arcana */}
      {!isMajor && (
        <text
          x="14"
          y="148"
          textAnchor="middle"
          fill={accentColor}
          fontSize="7"
          opacity="0.4"
        >
          {getSuitSymbolChar(card.suit!)}
        </text>
      )}
    </svg>
  );
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [21, 'XXI'], [20, 'XX'], [19, 'XIX'], [18, 'XVIII'], [17, 'XVII'],
    [16, 'XVI'], [15, 'XV'], [14, 'XIV'], [13, 'XIII'], [12, 'XII'],
    [11, 'XI'], [10, 'X'], [9, 'IX'], [8, 'VIII'], [7, 'VII'],
    [6, 'VI'], [5, 'V'], [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I'], [0, '0'],
  ];
  for (const [val, str] of map) {
    if (num === val) return str;
  }
  return String(num);
}

function getSuitSymbolChar(suit: string): string {
  const map: Record<string, string> = {
    wands: '♣',
    cups: '♥',
    swords: '♠',
    pentacles: '✦',
  };
  return map[suit] || '✦';
}
