'use client';

import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

interface ExportProgressProps {
  onComplete: () => void;
}

const RENDERING_MESSAGES = [
  'Compiling timeline…',
  'Rendering color grades…',
  'Applying motion tracking…',
  'Generating final cut…',
  'Finalizing export…',
];

/**
 * ExportProgress Component
 * Fake GPU rendering simulation with progress bar and rotating messages
 */
export default function ExportProgress({ onComplete }: ExportProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Progress animation: 0 → 100 over 4 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 80); // 80 intervals * 50ms = 4000ms
      });
    }, 50);

    // Message rotation: every 900ms
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % RENDERING_MESSAGES.length);
    }, 900);

    // Complete after 4 seconds
    const completionTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 500); // Small delay before callback
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(completionTimeout);
    };
  }, [onComplete]);

  // Generate fake GPU bars
  const gpuBars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    height: Math.max(20, Math.min(100, 40 + Math.sin((progress / 100) * Math.PI * 2 + i) * 30)),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

      {/* Progress Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_64px_rgba(0,0,0,0.9)] p-12">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Cpu className="w-10 h-10 text-white/80 animate-pulse" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-white/50 animate-spin" />
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="text-center mb-6">
          <div className="text-7xl font-bold text-white mb-2 font-mono tracking-tighter">
            {Math.round(progress)}%
          </div>
          <p className="text-lg text-white/60 animate-pulse">
            {RENDERING_MESSAGES[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-8">
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* GPU Activity Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">
              GPU Activity
            </span>
            <span className="text-xs text-white/60 font-mono">
              {Math.round(progress)}% utilized
            </span>
          </div>
          
          <div className="flex items-end justify-between h-24 gap-2">
            {gpuBars.map((bar) => (
              <div
                key={bar.id}
                className="flex-1 bg-white/20 rounded-t transition-all duration-300"
                style={{ height: `${bar.height}%` }}
              >
                <div
                  className="w-full bg-white/40 rounded-t transition-all duration-300"
                  style={{ height: `${Math.min(100, progress)}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Processing Steps */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/40">
            {RENDERING_MESSAGES.slice(0, 4).map((message, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 transition-all duration-300 ${
                  progress > index * 25 ? 'text-white/80' : 'text-white/30'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    progress > index * 25 ? 'bg-white' : 'bg-white/20'
                  }`}
                />
                <span className="hidden sm:inline">{message.split('…')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


