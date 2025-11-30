import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MonoFrame — The First AI Film Editor',
  description:
    'AI that edits like a film director. MonoFrame analyzes emotion, pacing, and motion to cut your video into cinematic highlights.',
  openGraph: {
    title: 'MonoFrame — The First AI Film Editor',
    description:
      'AI that edits like a film director. MonoFrame analyzes emotion, pacing, and motion to cut your video into cinematic highlights.',
    url: 'https://monoframe.local',
    siteName: 'MonoFrame',
    images: [
      {
        url: '/og-monoframe.png',
        width: 1200,
        height: 630,
        alt: 'MonoFrame – The First AI Film Editor',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonoFrame — The First AI Film Editor',
    description:
      'AI that edits like a film director. MonoFrame analyzes emotion, pacing, and motion to cut your video into cinematic highlights.',
    images: ['/og-monoframe.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
