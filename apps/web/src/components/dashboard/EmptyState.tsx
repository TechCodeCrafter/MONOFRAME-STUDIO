'use client';

import Link from 'next/link';

interface EmptyStateProps {
  onUpload?: () => void;
}

export default function EmptyState({ onUpload: _onUpload }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px] animate-fade-up">
      <div className="text-center max-w-lg px-6">
        {/* Cinematic Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-mono-white/5 blur-[60px] rounded-full" />
            </div>

            {/* Icon */}
            <svg
              className="w-24 h-24 stroke-mono-silver/50 relative animate-breathe"
              viewBox="0 0 64 64"
              fill="none"
              strokeWidth="1.5"
            >
              <rect x="8" y="12" width="48" height="40" rx="2" />
              <path d="M26 28 L38 34 L26 40 Z" fill="currentColor" stroke="none" />
              <line x1="8" y1="20" x2="56" y2="20" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="font-montserrat font-bold text-3xl text-mono-white mb-4">No Projects Yet</h2>
        <p className="font-inter text-lg text-mono-silver/80 mb-8 leading-relaxed">
          Upload a video to get started with AI editing
        </p>

        {/* CTA Button */}
        <Link
          href="/upload"
          className="inline-block bg-mono-white text-mono-black font-montserrat font-semibold 
            px-8 py-4 rounded hover:bg-mono-silver hover:shadow-lg hover:-translate-y-1 
            transition-all duration-300"
        >
          Upload Your First Video
        </Link>
      </div>
    </div>
  );
}
