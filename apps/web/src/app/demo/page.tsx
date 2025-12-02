import { Metadata } from 'next';
import { 
  HeroDemo, 
  DemoReplayPlayer, 
  DemoAnalysisSections, 
  DemoFeatureHighlights, 
  DemoFinalCTA 
} from '@/components/demo-public';

export const metadata: Metadata = {
  title: 'Demo - MonoFrame Studio',
  description: 'Experience MonoFrame\'s AI video editing in action. Watch a real AI-generated highlight reel.',
};

export default function DemoPage() {
  return (
    <main className="bg-[#0a0a0a] text-white relative min-h-screen">
      {/* Starfield Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 animate-pulse opacity-[0.03] bg-[url('/stars.png')] bg-repeat"></div>
      </div>

      {/* Glass Gradient Overlay */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-white/[0.02]"></div>

        {/* 1. Hero Section */}
        <HeroDemo />

        {/* 2. Video Player */}
        <DemoReplayPlayer />

        {/* 3. Analysis Sections */}
        <DemoAnalysisSections />

        {/* 4. Feature Highlights */}
        <DemoFeatureHighlights />

        {/* 5. Final CTA */}
        <DemoFinalCTA />
      </div>
    </main>
  );
}
