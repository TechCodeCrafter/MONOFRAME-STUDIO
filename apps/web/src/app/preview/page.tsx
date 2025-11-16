'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PreviewPage() {
  const [selectedClip, setSelectedClip] = useState(0);

  // Mock generated clips
  const clips = [
    {
      id: 1,
      title: 'Emotional Peak #1',
      timestamp: '00:34 - 00:52',
      score: 94,
      description: 'High-energy moment with strong emotional resonance',
    },
    {
      id: 2,
      title: 'Highlight Moment #2',
      timestamp: '01:12 - 01:28',
      score: 89,
      description: 'Dramatic pacing with cinematic timing',
    },
    {
      id: 3,
      title: 'Peak Scene #3',
      timestamp: '02:45 - 03:03',
      score: 91,
      description: 'Engaging narrative arc with visual impact',
    },
  ];

  return (
    <main className="min-h-screen bg-mono-black text-mono-white flex flex-col animate-fade-in">
      {/* Cinematic Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)]" />

      {/* Header */}
      <header className="border-b border-mono-silver/20 py-8 px-8 relative z-10">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <svg
              className="w-10 h-10"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="8" y="8" width="48" height="48" />
              <line x1="32" y1="8" x2="32" y2="56" />
              <line x1="8" y1="32" x2="56" y2="32" />
            </svg>
            <span className="font-montserrat font-bold text-2xl">MONOFRAME</span>
          </Link>
          <p className="font-montserrat text-sm text-mono-silver/60 tracking-widest uppercase">
            Step 3 of 3 — Preview & Export
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-12 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Title Section */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-montserrat font-bold text-5xl md:text-7xl mb-6">
              Your Cinematic Edits
            </h1>
            <p className="font-inter text-xl md:text-2xl text-mono-silver/80">
              AI detected {clips.length} high-impact moments
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
            {/* Clips List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-montserrat font-semibold text-xl mb-6 tracking-wide">
                GENERATED CLIPS
              </h2>
              {clips.map((clip, index) => (
                <div key={clip.id}>
                  <button
                    onClick={() => setSelectedClip(index)}
                    className={`
                      w-full text-left p-6 border rounded-lg transition-all duration-300
                      ${
                        selectedClip === index
                          ? 'border-mono-white bg-mono-white/5 scale-[1.02]'
                          : 'border-mono-silver/30 hover:border-mono-white hover:bg-mono-white/5'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-montserrat font-semibold text-lg">
                        {clip.title}
                      </h3>
                      <div className="flex items-center space-x-2 relative">
                        {/* Subtle heartbeat behind score */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-mono-white/5 rounded-full animate-pulse-slow" />
                        </div>
                        <div className="w-2 h-2 bg-mono-white rounded-full relative z-10" />
                        <span className="font-inter text-sm text-mono-silver relative z-10">
                          {clip.score}
                        </span>
                      </div>
                    </div>
                    <p className="font-inter text-sm text-mono-silver mb-2">
                      {clip.timestamp}
                    </p>
                    <p className="font-inter text-xs text-mono-silver/70">
                      {clip.description}
                    </p>
                  </button>
                  {/* Subtle separator */}
                  {index < clips.length - 1 && (
                    <div className="h-px bg-mono-silver/10 my-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="aspect-video bg-mono-slate border border-mono-silver/30 rounded-lg flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_60px_rgba(255,255,255,0.03)] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
                  {/* Placeholder for video player */}
                  <div className="text-center space-y-6">
                    <svg
                      className="w-24 h-24 mx-auto stroke-mono-silver/50"
                      viewBox="0 0 64 64"
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <rect x="8" y="16" width="48" height="32" />
                      <polygon
                        points="28,28 28,36 38,32"
                        fill="currentColor"
                        stroke="none"
                        className="fill-mono-silver/50"
                      />
                    </svg>
                    <div>
                      <p className="font-montserrat text-xl text-mono-silver/70 mb-2">
                        {clips[selectedClip].title}
                      </p>
                      <p className="font-inter text-sm text-mono-silver/50 mb-1">
                        {clips[selectedClip].timestamp} · 18s
                      </p>
                      <p className="font-inter text-sm text-mono-silver/50">
                        Video preview coming soon
                      </p>
                    </div>
                  </div>

                  {/* Playback Controls Placeholder */}
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-mono-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-mono-silver">
                        {clips[selectedClip].timestamp}
                      </span>
                      <div className="flex items-center space-x-4">
                        <button className="w-10 h-10 rounded-full border border-mono-silver/30 flex items-center justify-center hover:bg-mono-white/10 transition-colors">
                          <svg
                            className="w-4 h-4 stroke-mono-silver"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                          >
                            <polygon points="5,3 19,12 5,21" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                      <span className="font-inter text-sm text-mono-silver">
                        {clips[selectedClip].score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clip Details */}
                <div className="border border-mono-silver/30 rounded-lg p-6 bg-mono-slate/30">
                  <h3 className="font-montserrat font-semibold text-lg mb-4">
                    AI Analysis
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="font-inter text-sm text-mono-silver/70 mb-2">
                        Emotional Score
                      </p>
                      <p className="font-montserrat text-2xl">{clips[selectedClip].score}</p>
                    </div>
                    <div>
                      <p className="font-inter text-sm text-mono-silver/70 mb-2">
                        Duration
                      </p>
                      <p className="font-montserrat text-2xl">18s</p>
                    </div>
                    <div>
                      <p className="font-inter text-sm text-mono-silver/70 mb-2">
                        Pacing
                      </p>
                      <p className="font-montserrat text-2xl">Dynamic</p>
                    </div>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-mono-white text-mono-black font-montserrat font-semibold px-8 py-4 rounded hover:bg-mono-silver transition-all duration-300">
                    Export All Clips
                  </button>
                  <button className="flex-1 border-2 border-mono-white text-mono-white font-montserrat font-semibold px-8 py-4 rounded hover:bg-mono-white hover:text-mono-black transition-all duration-300">
                    Export This Clip
                  </button>
                </div>

                {/* Additional Options */}
                <div className="text-center pt-12">
                  <Link
                    href="/upload"
                    className="font-inter text-sm text-mono-silver hover:text-mono-white transition-colors underline"
                  >
                    Upload another video
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

