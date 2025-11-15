import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MonoFrame Studio | Cinematic AI Video Editing',
  description:
    'Revolutionize your content creation with AI-driven cinematic editing. Auto-detect the best moments, generate professional edits, and export for every platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  );
}
