'use client';

import { useExportOverlay } from './ExportOverlayProvider';

export default function ExportOverlay() {
  const { isVisible, message } = useExportOverlay();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]" />

      {/* Modal */}
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-fade-up">
        {/* Radial glow behind spinner */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 bg-mono-white/[0.02] blur-[80px] rounded-full" />
        </div>

        {/* Large MonoFrame-styled spinner */}
        <div className="relative">
          <svg
            className="w-20 h-20 animate-spin"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animationDuration: '2s' }}
          >
            {/* Outer ring */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-mono-white/20"
            />
            {/* Spinning arc */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="175 175"
              strokeDashoffset="44"
              className="text-mono-white"
            />
            {/* MonoFrame grid pattern */}
            <line
              x1="32"
              y1="4"
              x2="32"
              y2="60"
              stroke="currentColor"
              strokeWidth="1"
              className="text-mono-white/10"
            />
            <line
              x1="4"
              y1="32"
              x2="60"
              y2="32"
              stroke="currentColor"
              strokeWidth="1"
              className="text-mono-white/10"
            />
          </svg>
        </div>

        {/* Dynamic message text */}
        <div className="text-center space-y-2 min-w-[300px]">
          <p className="font-montserrat font-light text-xl text-mono-white animate-pulse">
            {message}
          </p>
          <p className="font-inter text-sm text-mono-silver/60">
            Please wait, this may take a moment
          </p>
        </div>
      </div>
    </div>
  );
}
