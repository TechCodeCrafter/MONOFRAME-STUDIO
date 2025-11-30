'use client';

interface UploadAreaProps {
  onUploadComplete: () => void;
}

/**
 * UploadArea Component
 * Placeholder for video upload interface
 */
export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Upload Card */}
        <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-16 backdrop-blur-xl">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/20 rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/20 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/20 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/20 rounded-br-2xl"></div>
          
          <div className="text-center space-y-8">
            {/* Film Frame Icon */}
            <div className="flex justify-center">
              <svg
                className="w-24 h-24 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M2 7h20M2 11h20" strokeDasharray="2 2" opacity="0.5" />
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Upload your film to begin
              </h1>
              <p className="text-white/60 text-lg">
                Experience AI-powered editing in real-time
              </p>
            </div>

            {/* Upload Button Placeholder */}
            <button
              onClick={onUploadComplete}
              className="
                px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg
                hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]
                transition-all duration-300
                cursor-pointer
              "
            >
              Select Film
            </button>

            {/* Supported Formats */}
            <p className="text-white/40 text-sm">
              Supports MP4, MOV, AVI up to 100MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

