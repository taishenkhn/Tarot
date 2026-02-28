import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArcanaCam Tarot - 摄像头手势塔罗',
  description: '通过手势在神秘氛围中完成洗牌、抽牌、翻牌，获得温和正向的塔罗解读',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-arcana-dark text-star-white antialiased">
        {children}
      </body>
    </html>
  );
}
