import type { FC, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mini Games Arcade',
  description: 'A curated collection of classic browser games built with Next.js and TypeScript.',
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
  <html lang="en">
    <body className={`${inter.className} bg-gray-900 text-white`}>{children}</body>
  </html>
);

export default RootLayout;
