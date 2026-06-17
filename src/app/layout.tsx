import type { FC, ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const siteName = 'Mini Games Arcade';
const siteDescription =
  'A beautifully crafted arcade of timeless classics — Tetris, 2048, Sudoku, Snake and more. Instant to play, free forever, and built for every device.';

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Little games. Big delight.`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'mini games',
    'browser games',
    'free online games',
    'Tetris',
    '2048',
    'Sudoku',
    'Snake',
    'arcade',
  ],
  authors: [{ name: siteName }],
  openGraph: {
    title: `${siteName} — Little games. Big delight.`,
    description: siteDescription,
    siteName,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Little games. Big delight.`,
    description: siteDescription,
  },
  category: 'games',
};

export const viewport: Viewport = {
  themeColor: '#070a13',
  width: 'device-width',
  initialScale: 1,
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
  <html lang="en" className={inter.variable}>
    <body className="min-h-dvh bg-slate-950 font-sans text-white antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
      >
        Skip to content
      </a>
      {children}
    </body>
  </html>
);

export default RootLayout;
