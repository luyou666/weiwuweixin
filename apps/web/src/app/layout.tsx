import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '围物为心 — 以心度物，以物观心',
  description: '保护你的主观性。围物为心是一个水墨风格的榜单与评测工具，让评分不再是冷冰冰的数字。',
  keywords: ['榜单', '评测', '评分', '置信度', '水墨风格'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7F0' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A24' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}