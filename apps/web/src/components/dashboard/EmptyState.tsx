'use client';

import Link from 'next/link';

interface EmptyStateProps {
  onUpload?: () => void;
}

export default function EmptyState({ onUpload: _onUpload }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px] animate-fade-up relative">
      {/* Massive Radial Glow Behind Everything */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[800px] h-[600px] bg-mono-white/[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="text-center max-w-lg px-6 relative z-10">
        {/* Cinematic Icon */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            {/* Stronger Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-mono-white/[0.08] blur-[80px] rounded-full" />
            </div>

            {/* Icon - Increased to 96px */}
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

        {/* Subtitle Tag */}
        <p className="font-inter text-sm text-mono-silver/60 uppercase tracking-wider mb-3">
          Your AI-edited video projects
        </p>

        {/* Text */}
        <h2 className="font-montserrat font-bold text-4xl text-mono-white mb-4">No Projects Yet</h2>
        <p className="font-inter text-lg text-mono-silver/80 mb-10 leading-relaxed">
          Upload a video to get started with AI editing
        </p>

        {/* CTA Button - Enhanced */}
        <Link
          href="/upload"
          className="inline-block bg-mono-white text-mono-black font-montserrat font-semibold 
            px-10 py-5 rounded hover:bg-mono-silver 
            shadow-[0_4px_20px_rgba(255,255,255,0.1)]
            hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]
            hover:scale-[1.02]
            hover:-translate-y-1 
            transition-all duration-300"
        >
          Upload Your First Video
        </Link>

        {/* Secondary Action Link */}
        <div className="mt-6">
          <Link
            href="/dashboard/new"
            className="font-inter text-[13px] text-mono-silver/70 hover:text-mono-white 
              underline transition-colors duration-200"
          >
            Or create a new empty workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
