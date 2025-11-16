'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProcessingPage() {
  const router = useRouter();
  const messages = [
    'Analyzing emotional peaks…',
    'Detecting pacing & rhythm…',
    'Identifying highlight moments…',
  ];

  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  // Cycle text every 2 seconds with fade effect
  useEffect(() => {
    const textInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
      setFadeKey((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(textInterval);
  }, [messages.length]);

  // Simulated AI timeline (8 seconds)
  useEffect(() => {
    const timeline = [
      () => setStage(0), // Upload Complete
      () => setStage(1), // Processing...
      () => setStage(2), // Generating Clips...
      () => router.push('/preview'),
    ];

    const stepTimes = [0, 2000, 6000, 8000];

    const timeouts = stepTimes.map((time, i) =>
      setTimeout(() => {
        timeline[i]();
      }, time)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [router]);

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
            Step 2 of 3 — Processing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="text-center space-y-12 animate-fade-up">
          {/* Pulsing MonoFrame Logo */}
          <div className="flex justify-center">
            <svg
              className="w-24 h-24 stroke-mono-white animate-pulse-slow"
              viewBox="0 0 64 64"
              fill="none"
              strokeWidth="1.5"
            >
              <rect x="8" y="8" width="48" height="48" />
              <line x1="32" y1="8" x2="32" y2="56" />
              <line x1="8" y1="32" x2="56" y2="32" />
            </svg>
          </div>

          {/* Cycling Text with Fade */}
          <div className="h-20 flex items-center justify-center">
            <p
              key={fadeKey}
              className="font-montserrat text-2xl md:text-3xl text-mono-silver animate-[fadeIn_0.5s_ease-in-out]"
            >
              {messages[index]}
            </p>
          </div>

          {/* Status Indicators */}
          <div className="space-y-6 font-inter text-lg pt-8">
            <div
              className={`flex items-center justify-center space-x-3 transition-all duration-500 ${
                stage >= 0 ? 'text-mono-white opacity-100' : 'text-mono-silver/40 opacity-50'
              }`}
            >
              <svg
                className="w-5 h-5 stroke-mono-white"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="8,12 11,15 16,10" />
              </svg>
              <span>Upload Complete</span>
            </div>

            <div
              className={`flex items-center justify-center space-x-3 transition-all duration-500 ${
                stage === 1
                  ? 'text-mono-white opacity-100 scale-110'
                  : stage > 1
                  ? 'text-mono-white opacity-100'
                  : 'text-mono-silver/40 opacity-50'
              }`}
            >
              {stage === 1 ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-mono-white rounded-full animate-pulse" />
                </div>
              ) : stage > 1 ? (
                <svg
                  className="w-5 h-5 stroke-mono-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="8,12 11,15 16,10" />
                </svg>
              ) : (
                <div className="w-5 h-5 border border-mono-silver/40 rounded-full" />
              )}
              <span>{stage === 1 ? 'Processing…' : 'AI Analysis'}</span>
            </div>

            <div
              className={`flex items-center justify-center space-x-3 transition-all duration-500 ${
                stage === 2
                  ? 'text-mono-white opacity-100 scale-110'
                  : 'text-mono-silver/40 opacity-50'
              }`}
            >
              {stage === 2 ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-mono-white rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="w-5 h-5 border border-mono-silver/40 rounded-full" />
              )}
              <span>Generating Clips…</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto pt-8">
            <div className="h-[1px] bg-mono-silver/20 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-mono-white transition-all duration-1000 ease-linear"
                style={{
                  width:
                    stage === 0
                      ? '25%'
                      : stage === 1
                      ? '50%'
                      : stage === 2
                      ? '90%'
                      : '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

