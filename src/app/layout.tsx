import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import BackgroundMusic from '@/components/BackgroundMusic';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArcanaCam Tarot - LEX-赛博塔罗',
  description: '通过手势在神秘氛围中完成洗牌、抽取三张牌、翻牌获得塔罗解读',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LEX-赛博塔罗',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${cinzel.variable} ${inter.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-arcana-dark text-star-white antialiased">
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
