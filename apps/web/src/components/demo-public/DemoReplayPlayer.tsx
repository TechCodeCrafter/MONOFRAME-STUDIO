'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function DemoReplayPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const editedVideoRef = useRef<HTMLVideoElement>(null);

  // Sync videos
  const syncVideos = (action: 'play' | 'pause' | 'seek', seekTime?: number) => {
    if (action === 'play') {
      originalVideoRef.current?.play();
      editedVideoRef.current?.play();
      setIsPlaying(true);
    } else if (action === 'pause') {
      originalVideoRef.current?.pause();
      editedVideoRef.current?.pause();
      setIsPlaying(false);
    } else if (action === 'seek' && seekTime !== undefined) {
      if (originalVideoRef.current) originalVideoRef.current.currentTime = seekTime;
      if (editedVideoRef.current) editedVideoRef.current.currentTime = seekTime;
    }
  };

  // Update progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (originalVideoRef.current && isPlaying) {
        const duration = originalVideoRef.current.duration || 1;
        const current = originalVideoRef.current.currentTime || 0;
        setProgress((current / duration) * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const duration = originalVideoRef.current?.duration || 0;
    syncVideos('seek', duration * percent);
    setProgress(percent * 100);
  };

  const handleReset = () => {
    syncVideos('seek', 0);
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Side-by-Side Comparison</h2>
        <p className="text-xl text-white/70 font-inter">
          Watch how MonoFrame transforms raw footage into a highlight reel
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original Video */}
        <div className="relative">
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-white/20">
            <span className="text-sm font-semibold text-white">Original</span>
          </div>
          <div className="relative aspect-video bg-black/50 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden">
            <video
              ref={originalVideoRef}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
              poster="/placeholder-video.jpg"
            >
              <source src="/demo-original.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            {/* Placeholder overlay if no video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 pointer-events-none">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white/50" />
                </div>
                <p className="text-white/50 text-sm">Original Footage</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Edited Video */}
        <div className="relative">
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
            <span className="text-sm font-semibold text-green-400">✨ AI Edited</span>
          </div>
          <div className="relative aspect-video bg-black/50 backdrop-blur-lg border border-green-400/20 rounded-lg overflow-hidden ring-2 ring-green-400/20">
            <video
              ref={editedVideoRef}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
              poster="/placeholder-video.jpg"
            >
              <source src="/demo-edit.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            {/* Placeholder overlay if no video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/5 to-green-500/10 pointer-events-none">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Play className="w-10 h-10 text-green-400/50" />
                </div>
                <p className="text-green-400/50 text-sm">Cinematic Highlights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        {/* Progress Bar */}
        <div 
          className="h-2 bg-white/10 rounded-full mb-6 cursor-pointer relative overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/80 to-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => syncVideos(isPlaying ? 'pause' : 'play')}
            className="px-8 py-3 rounded-lg bg-white text-black font-semibold hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all duration-200 flex items-center gap-3"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Play Both
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-white/50 mt-4 font-inter">
          Both videos play in sync • Original: 3 min • AI Edit: 45 sec
        </p>
      </div>
    </div>
  );
}

