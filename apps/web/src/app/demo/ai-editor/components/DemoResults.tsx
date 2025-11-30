'use client';

interface DemoResultsProps {
  onReset: () => void;
}

/**
 * DemoResults Component
 * Placeholder for AI editing results visualization
 */
export default function DemoResults({ onReset }: DemoResultsProps) {
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
        {/* Before/After Preview */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Before/After Preview
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Comparison
            </span>
          </div>
          
          <div className="aspect-video bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-white/20 mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p className="text-white/40 text-sm">Video comparison placeholder</p>
            </div>
          </div>
        </div>

        {/* Timeline Analysis */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Timeline Analysis
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Scene Breakdown
            </span>
          </div>
          
          <div className="h-64 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-white/20 mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
                <circle cx="6" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="18" cy="12" r="2" fill="currentColor" />
              </svg>
              <p className="text-white/40 text-sm">Timeline visualization placeholder</p>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-lg border border-white/10 flex items-center px-6"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white/40"
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
                    <p className="text-white/40 text-sm">
                      AI suggestion placeholder {i}
                    </p>
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

