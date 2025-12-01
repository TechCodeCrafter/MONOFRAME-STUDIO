'use client';

import { useState, useEffect } from 'react';

interface UploadAreaProps {
  onUploadComplete: () => void;
}

/**
 * UploadArea Component
 * Simulates video upload with fake progress
 */
export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = () => {
    // Simulate file selection
    setFileName('my-film.mp4');
    setIsUploading(true);
    setUploadProgress(0);
  };

  useEffect(() => {
    if (!isUploading) return;

    // Simulate upload progress: 0 → 100% over 1.5 seconds
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Auto-trigger completion after reaching 100%
          setTimeout(() => {
            onUploadComplete();
          }, 300);
          return 100;
        }
        return prev + 2; // Increment by 2% every 30ms (1.5s total)
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isUploading, onUploadComplete]);

  if (isUploading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-16 backdrop-blur-xl">
            <div className="text-center space-y-8">
              {/* Film Strip Preview Placeholder */}
              <div className="flex justify-center">
                <div className="relative w-48 h-32 rounded-lg border-2 border-white/20 bg-white/5 overflow-hidden">
                  {/* Film strip perforations */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around py-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white/30 rounded-sm mx-auto"></div>
                    ))}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around py-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white/30 rounded-sm mx-auto"></div>
                    ))}
                  </div>
                  
                  {/* Center film icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white/40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* File Name */}
              <div>
                <p className="text-white/80 text-lg font-medium mb-2">{fileName}</p>
                <p className="text-white/50 text-sm">Uploading...</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  {/* Background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  
                  {/* Progress fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                {/* Progress Percentage */}
                <p className="text-white/60 text-sm font-medium">
                  {uploadProgress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Upload Button */}
            <button
              onClick={handleFileSelect}
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
