'use client';

import { useState, useMemo } from 'react';

interface DemoResultsProps {
  onReset: () => void;
}

const ALL_SUGGESTIONS = [
  'Increase pacing by 12% between 00:41–01:10',
  'Add punch-in zoom at Scene 3',
  'Use B-roll during transition at 02:05',
  'Reduce silence gap at 00:13',
  'Improve emotional delivery in final scene',
  'Add slow-motion effect at 01:23',
  'Tighten cut between Scene 4 and 5',
  'Enhance audio mix during dialogue',
  'Add subtle color grade for mood consistency',
];

/**
 * DemoResults Component
 * Displays fake AI analysis results with interactive elements
 */
export default function DemoResults({ onReset }: DemoResultsProps) {
  const [comparisonPosition, setComparisonPosition] = useState(50);

  // Generate 12 random scene bars (heights between 40-160px)
  const sceneBars = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      height: Math.floor(Math.random() * 120) + 40, // 40-160px
    }));
  }, []);

  // Select 3 random suggestions
  const selectedSuggestions = useMemo(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            AI Analysis Complete
          </h1>
          <p className="text-white/60">
            Your film has been analyzed and optimized
          </p>
        </div>
        <button
          onClick={onReset}
          className="
            px-6 py-3 border border-white/20 text-white rounded-lg font-medium
            hover:bg-white/5 hover:border-white/30
            transition-all duration-200
          "
        >
          Upload New Film
        </button>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {/* Before/After Preview with Sliding Comparison */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Before/After Preview
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Comparison
            </span>
          </div>
          
          <div className="aspect-video bg-white/5 rounded-lg border border-white/10 relative overflow-hidden group">
            {/* Before (left side) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">BEFORE</p>
                  <svg
                    className="w-16 h-16 text-white/20 mx-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* After (right side) - clipped by comparison position */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10"
              style={{ clipPath: `inset(0 0 0 ${comparisonPosition}%)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-2 font-semibold">AFTER</p>
                  <svg
                    className="w-16 h-16 text-white/40 mx-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 10l4 4 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Draggable comparison slider */}
            <div
              className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-10 group-hover:w-1.5 transition-all"
              style={{ left: `${comparisonPosition}%` }}
              onMouseDown={(e) => {
                const container = e.currentTarget.parentElement!;
                const handleMove = (moveEvent: MouseEvent) => {
                  const rect = container.getBoundingClientRect();
                  const x = moveEvent.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                  setComparisonPosition(percentage);
                };
                const handleUp = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleUp);
                };
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);
              }}
            >
              {/* Slider handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Analysis with Random Scene Bars */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Timeline Analysis
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Scene Breakdown
            </span>
          </div>
          
          <div className="h-64 bg-white/5 rounded-lg border border-white/10 p-6 flex items-end justify-around gap-2">
            {sceneBars.map((bar, i) => (
              <div
                key={i}
                className="flex-1 bg-white/20 rounded-t hover:bg-white/30 transition-all cursor-pointer relative group"
                style={{ height: `${bar.height}px` }}
              >
                {/* Scene number tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/60 whitespace-nowrap">
                    Scene {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions with Randomized Data */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              AI Suggestions
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Optimization Tips
            </span>
          </div>
          
          <div className="space-y-4">
            {selectedSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-lg border border-white/10 flex items-center px-6 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <svg
                      className="w-6 h-6 text-white/60 group-hover:text-white/80 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">
                      {suggestion}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-white/40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
