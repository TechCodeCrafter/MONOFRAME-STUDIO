import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { CommandPaletteProvider } from '@/components/command-palette/CommandPaletteProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MonoFrame Studio | The First AI Film Editor',
  description:
    'The first AI film editor that edits your videos with taste, emotion, and cinematic timing. Transform raw footage into professional edits instantly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter">
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </body>
    </html>
  );
}
