'use client';

import { useEffect } from 'react';

interface ProcessingStateProps {
  onProcessingComplete: () => void;
}

/**
 * ProcessingState Component
 * Placeholder for AI processing animation (3-second fake delay)
 */
export default function ProcessingState({ onProcessingComplete }: ProcessingStateProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onProcessingComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onProcessingComplete]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-20 backdrop-blur-xl">
          <div className="text-center space-y-8">
            {/* Animated Loader */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                
                {/* Inner pulsing circle */}
                <div className="absolute inset-4 rounded-full bg-white/5 animate-pulse"></div>
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Processing Text */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Analyzing your film...
              </h1>
              <p className="text-white/60 text-lg">
                AI is detecting scenes, emotions, and pacing
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span>Scene detection</span>
              </div>
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse delay-100"></div>
                <span>Emotion analysis</span>
              </div>
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse delay-200"></div>
                <span>Pacing optimization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

