import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MonoFrame AI Edit — Shared Cut',
  description: 'Cinematic edit generated with MonoFrame AI.',
  openGraph: {
    title: 'MonoFrame AI Edit — Shared Cut',
    description: 'Cinematic edit generated with MonoFrame AI.',
    images: ['/og-monoframe.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonoFrame AI Edit — Shared Cut',
    description: 'Cinematic edit generated with MonoFrame AI.',
    images: ['/og-monoframe.png'],
  },
};

export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


