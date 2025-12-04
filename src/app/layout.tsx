import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TAMARINI - Tutor in Your Pocket',
  description: 'Learn math step by step with your AI tutor',
  icons: {
    icon: '/favicon.svg',
    // Or if using .ico: icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-tutor-bg text-tutor-text min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
