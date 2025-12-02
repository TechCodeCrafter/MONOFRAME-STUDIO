'use client';

import { useState } from 'react';
import { Sparkles, Zap, Film, Target, Clock, Download } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Scene Detection',
    description: 'Automatically identifies and segments scenes using advanced machine learning to find natural break points.',
  },
  {
    icon: Zap,
    title: 'Emotion Analysis',
    description: 'Detects emotional peaks—joy, surprise, excitement—to identify the most engaging moments in your footage.',
  },
  {
    icon: Film,
    title: 'Smart Highlights',
    description: 'Generates cinematic highlight reels based on engagement scoring and narrative flow analysis.',
  },
  {
    icon: Target,
    title: 'Motion Tracking',
    description: 'Tracks subjects and objects across frames to maintain perfect framing and composition.',
  },
  {
    icon: Clock,
    title: '10x Faster',
    description: 'What takes hours manually takes minutes with MonoFrame. Focus on creativity, not tedious editing.',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Export individual clips or complete projects in multiple formats with a single click.',
  },
];

export function DemoFeatureHighlights() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Powered by AI, Built for Creators</h2>
        <p className="text-xl text-white/70 font-inter max-w-2xl mx-auto">
          Every feature designed to save you hours and deliver professional results
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="group relative p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-[0px_0px_40px_rgba(255,255,255,0.07)] overflow-hidden cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onMouseMove={(e) => handleMouseMove(e, i)}
          >
            {/* Cursor-follow spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.25), transparent 55%)',
              }}
            />

            {/* Icon glow effect */}
            <div className="absolute top-8 left-8 w-12 h-12 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <feature.icon className="w-12 h-12 mb-6 text-white/70 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

              {/* Description */}
              <p className="text-white/60 font-inter leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                {feature.description}
              </p>
            </div>

            {/* Bottom glow line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            10x
          </div>
          <div className="text-sm text-white/60 font-inter">Faster Editing</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            95%
          </div>
          <div className="text-sm text-white/60 font-inter">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            100%
          </div>
          <div className="text-sm text-white/60 font-inter">Browser-Based</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            0
          </div>
          <div className="text-sm text-white/60 font-inter">Installation</div>
        </div>
      </div>
    </div>
  );
}

