'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface DemoResultsProps {
  videoUrl: string;
  onReset: () => void;
}

const ALL_SUGGESTIONS = [
  'Increase pacing by 12% between 00:41–01:10',
  'Add punch-in zoom at Scene 3',
  'Use B-roll during transition at 02:05',
  'Reduce silence gap at 00:13',
  'Improve emotional delivery in final scene',
  'Add slow-motion effect at 01:23',
  'Tighten cut between Scene 4 and 5',
  'Enhance audio mix during dialogue',
  'Add subtle color grade for mood consistency',
];

/**
 * DemoResults Component
 * Real video player with fake AI analysis results
 */
export default function DemoResults({ videoUrl, onReset }: DemoResultsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [isBeforeMode, setIsBeforeMode] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);

  // Generate 12 random scene bars (heights between 40-160px)
  const sceneBars = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      height: Math.floor(Math.random() * 120) + 40,
    }));
  }, []);

  // Select 3 random suggestions
  const selectedSuggestions = useMemo(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            AI Analysis Complete
          </h1>
          <p className="text-white/60">
            Your film has been analyzed and optimized
          </p>
        </div>
        <button
          onClick={onReset}
          className="
            px-6 py-3 border border-white/20 text-white rounded-lg font-medium
            hover:bg-white/5 hover:border-white/30
            transition-all duration-200
          "
        >
          Upload New Film
        </button>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {/* Video Player with Before/After Toggle */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Before/After Preview
            </h2>
            <button
              onClick={() => setIsBeforeMode(!isBeforeMode)}
              className="
                px-4 py-2 border border-white/20 text-white rounded-lg text-sm font-medium
                hover:bg-white/5 hover:border-white/30
                transition-all duration-200
              "
            >
              {isBeforeMode ? 'Show After' : 'Show Before'}
            </button>
          </div>
          
          {/* Video Player */}
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-[0_0_32px_rgba(0,0,0,0.5)]">
            <video
              ref={videoRef}
              src={videoUrl}
              className={`w-full aspect-video bg-black transition-all duration-300 ${
                isBeforeMode ? 'grayscale brightness-90' : 'contrast-105 saturate-110'
              }`}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
              {/* Control Bar */}
              <div className="space-y-3">
                {/* Timeline Scrubber */}
                <div
                  ref={timelineRef}
                  className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
                  onClick={handleTimelineClick}
                  onMouseDown={(e) => {
                    setIsDraggingScrubber(true);
                    const handleMove = (moveEvent: MouseEvent) => {
                      if (!timelineRef.current || !videoRef.current) return;
                      const rect = timelineRef.current.getBoundingClientRect();
                      const x = moveEvent.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, x / rect.width));
                      const newTime = percentage * duration;
                      videoRef.current.currentTime = newTime;
                    };
                    const handleUp = () => {
                      setIsDraggingScrubber(false);
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                    handleTimelineClick(e);
                  }}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  
                  {/* Scrubber handle */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${
                      isDraggingScrubber ? 'scale-125 shadow-[0_0_16px_rgba(255,255,255,0.6)]' : 'group-hover:scale-110'
                    }`}
                    style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }}
                  ></div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="
                        w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg
                        flex items-center justify-center
                        transition-all duration-200
                        hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]
                      "
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>

                    {/* Time Display */}
                    <span className="text-white/80 text-sm font-mono tracking-wider">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Mode Indicator */}
                  <span className="text-white/50 text-xs uppercase tracking-wider">
                    {isBeforeMode ? 'Before (Original)' : 'After (AI Enhanced)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Analysis with Random Scene Bars */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Timeline Analysis
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Scene Breakdown
            </span>
          </div>
          
          <div className="h-64 bg-white/5 rounded-lg border border-white/10 p-6 flex items-end justify-around gap-2">
            {sceneBars.map((bar, i) => (
              <div
                key={i}
                className="flex-1 bg-white/20 rounded-t hover:bg-white/30 transition-all cursor-pointer relative group"
                style={{ height: `${bar.height}px` }}
              >
                {/* Scene number tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/60 whitespace-nowrap">
                    Scene {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions with Randomized Data */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              AI Suggestions
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Optimization Tips
            </span>
          </div>
          
          <div className="space-y-4">
            {selectedSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-lg border border-white/10 flex items-center px-6 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <svg
                      className="w-6 h-6 text-white/60 group-hover:text-white/80 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">
                      {suggestion}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-white/40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
