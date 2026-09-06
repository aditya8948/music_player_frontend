import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'MuseKit',
  description: 'A modern music library'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='bg-layer' />
        <div className='ambient-glow-1' />
        <div className='ambient-glow-2' />
        <div className='ambient-glow-3' />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
