import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MonoFrame Live Editor Demo',
  description:
    'Play with the MonoFrame live editor demo — a browser-based AI film editor with emotion curves, timelines, and AI insights.',
  openGraph: {
    title: 'MonoFrame Live Editor Demo',
    description:
      'See how MonoFrame cuts, scores, and analyzes your footage like a film director.',
    url: 'https://monoframe.local/demo',
    siteName: 'MonoFrame',
    images: [
      {
        url: '/og-monoframe-demo.png', // TODO: Add this image to /public/og-monoframe-demo.png
        width: 1200,
        height: 630,
        alt: 'MonoFrame Live Editor Demo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonoFrame Live Editor Demo',
    description:
      'A Cursor-for-video style AI editor — right in your browser.',
    images: ['/og-monoframe-demo.png'], // TODO: Add this image to /public/og-monoframe-demo.png
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


