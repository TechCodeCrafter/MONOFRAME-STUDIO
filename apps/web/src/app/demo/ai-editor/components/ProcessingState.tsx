'use client';

import { useEffect, useState } from 'react';

interface ProcessingStateProps {
  onProcessingComplete: () => void;
}

const AI_TASKS = [
  'Detecting scenes...',
  'Analyzing emotions...',
  'Measuring pacing...',
  'Identifying rhythm patterns...',
  'Building rough cut...',
];

/**
 * ProcessingState Component
 * Simulates AI processing with progress bar and rotating messages
 */
export default function ProcessingState({ onProcessingComplete }: ProcessingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Rotate AI task messages every 0.8 seconds
  useEffect(() => {
    const taskInterval = setInterval(() => {
      setCurrentTaskIndex((prev) => (prev + 1) % AI_TASKS.length);
    }, 800);

    return () => clearInterval(taskInterval);
  }, []);

  // Progress bar: 0 → 100% over 3 seconds
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Trigger completion when reaching 100%
          setTimeout(() => {
            onProcessingComplete();
          }, 300);
          return 100;
        }
        return prev + 100 / 60; // 60 steps over 3 seconds (50ms interval)
      });
    }, 50);

    return () => clearInterval(progressInterval);
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
                
                {/* Center progress percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Processing Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Analyzing your film...
              </h1>
              <p className="text-white/60 text-lg h-7">
                {AI_TASKS[currentTaskIndex]}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Waveform animation underneath */}
                <div className="absolute inset-0 flex items-center justify-around opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-white/50 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Progress fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Progress Steps (visual indicators) */}
            <div className="space-y-3 max-w-md mx-auto">
              {AI_TASKS.slice(0, 3).map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 text-sm transition-all duration-300 ${
                    currentTaskIndex >= i ? 'text-white/70' : 'text-white/30'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTaskIndex >= i ? 'bg-white animate-pulse' : 'bg-white/30'
                    }`}
                  ></div>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
