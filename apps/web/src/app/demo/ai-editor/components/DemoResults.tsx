'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Pause, Scissors, Target, Download, FileVideo, Link } from 'lucide-react';
import ExportModal from './ExportModal';
import ExportProgress from './ExportProgress';
import { createDemoShare } from '@/lib/shareStore';

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

const CUT_LABELS = [
  'Punch-in',
  'Wide shot',
  'Reaction',
  'Beat change',
  'Dialogue start',
  'Action peak',
  'Transition',
  'Establishing',
  'Close-up',
  'Pan',
  'Zoom',
  'Match cut',
];

const SEGMENT_LABELS = [
  'Opening Establishing Shot',
  'Character Introduction',
  'Dialogue Scene',
  'Action Sequence',
  'Emotional Beat',
  'Climactic Moment',
  'Resolution',
  'Closing Shot',
];

/**
 * DemoResults Component
 * Real video player with fake AI analysis results + cut detection + motion tracking
 */
export default function DemoResults({ videoUrl, onReset }: DemoResultsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBeforeMode, setIsBeforeMode] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [activeCutId, setActiveCutId] = useState<string | null>(null);
  
  // Export system state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [exportedFiles, setExportedFiles] = useState<Array<{
    id: string;
    name: string;
    format: string;
    resolution: string;
    filesize: string;
    url: string;
    timestamp: Date;
  }>>([]);
  
  // Share system state
  const [lastShareId, setLastShareId] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);

  // Generate fake cut markers (8-14 cuts)
  const cutMarkers = useMemo(() => {
    const numCuts = Math.floor(Math.random() * 7) + 8; // 8-14 cuts
    return Array.from({ length: numCuts }, (_, i) => ({
      id: `cut-${i}`,
      time: (i + 1) * (100 / (numCuts + 1)), // Distribute evenly
      intensity: Math.random() * 0.6 + 0.4, // 0.4-1.0
      label: CUT_LABELS[Math.floor(Math.random() * CUT_LABELS.length)],
    }));
  }, []);

  // Generate fake tracked objects (3-5 objects)
  const trackedObjects = useMemo(() => {
    const numObjects = Math.floor(Math.random() * 3) + 3; // 3-5 objects
    return Array.from({ length: numObjects }, (_, i) => ({
      id: `track-${i}`,
      basePosition: {
        x: 10 + Math.random() * 70, // 10-80%
        y: 20 + Math.random() * 50, // 20-70%
      },
      size: {
        w: 10 + Math.random() * 15, // 10-25%
        h: 10 + Math.random() * 15, // 10-25%
      },
      amplitude: Math.random() * 5 + 2, // Movement amplitude
      frequency: Math.random() * 2 + 1, // Movement speed
      label: ['SUBJECT', 'FOREGROUND', 'ACTION', 'FOCUS'][Math.floor(Math.random() * 4)] + ` ${i + 1}`,
    }));
  }, []);

  // Generate attention heatmap segments (3-5 segments)
  const attentionSegments = useMemo(() => {
    const numSegments = Math.floor(Math.random() * 3) + 3; // 3-5 segments
    return Array.from({ length: numSegments }, (_, i) => {
      const startPercent = i * (100 / numSegments);
      const endPercent = (i + 1) * (100 / numSegments);
      return {
        id: `attention-${i}`,
        startPercent,
        endPercent,
        intensity: Math.random() * 0.5 + 0.5, // 0.5-1.0
        label: ['High Emotion', 'Fast Action', 'Dialogue Focus', 'Visual Interest', 'Key Moment'][
          Math.floor(Math.random() * 5)
        ],
      };
    });
  }, []);

  // Generate segment list (4-6 segments)
  const segmentList = useMemo(() => {
    const numSegments = Math.floor(Math.random() * 3) + 4; // 4-6 segments
    return Array.from({ length: numSegments }, (_, i) => {
      const startTime = i * (100 / numSegments);
      const endTime = (i + 1) * (100 / numSegments);
      return {
        id: `segment-${i}`,
        label: SEGMENT_LABELS[i % SEGMENT_LABELS.length],
        startPercent: startTime,
        endPercent: endTime,
        suggestion: ALL_SUGGESTIONS[Math.floor(Math.random() * ALL_SUGGESTIONS.length)],
      };
    });
  }, []);

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

  const seekToPercent = (percent: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = (percent / 100) * duration;
    }
  };

  const seekAndHighlightCut = (cutId: string, percent: number) => {
    seekToPercent(percent);
    setActiveCutId(cutId);
    setTimeout(() => setActiveCutId(null), 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromPercent = (percent: number) => {
    return formatTime((percent / 100) * duration);
  };

  // Calculate motion overlay positions based on currentTime
  const getTrackedObjectPosition = (obj: typeof trackedObjects[0]) => {
    if (!duration) return { x: obj.basePosition.x, y: obj.basePosition.y };
    
    const progress = currentTime / duration; // 0-1
    const offsetX = Math.sin(progress * Math.PI * 2 * obj.frequency) * obj.amplitude;
    const offsetY = Math.cos(progress * Math.PI * 2 * obj.frequency * 1.3) * obj.amplitude * 0.6;
    
    return {
      x: obj.basePosition.x + offsetX,
      y: obj.basePosition.y + offsetY,
    };
  };

  // Export handlers
  const handleStartExport = (preset: string) => {
    setShowExportModal(false);
    setShowExportProgress(true);
  };

  const handleExportComplete = () => {
    setShowExportProgress(false);
    
    // Generate fake video file
    const fakeVideoData = new Array(1024 * 1024).fill('X').join(''); // ~1MB of fake data
    const blob = new Blob([fakeVideoData], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    // Random filesize between 15-35 MB
    const filesizeMB = Math.floor(Math.random() * 20) + 15;
    
    // Add to export history
    const newExport = {
      id: `export-${Date.now()}`,
      name: `MonoFrame_AI_Edit_${new Date().toISOString().split('T')[0]}.mp4`,
      format: 'MP4',
      resolution: '1920×1080',
      filesize: `${filesizeMB}MB`,
      url,
      timestamp: new Date(),
    };
    
    setExportedFiles((prev) => [newExport, ...prev]);
  };

  const handleDownload = (exportFile: typeof exportedFiles[0]) => {
    const a = document.createElement('a');
    a.href = exportFile.url;
    a.download = exportFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share handler
  const handleShareEdit = () => {
    if (!videoUrl) return;
    
    setIsCreatingShare(true);
    
    try {
      const share = createDemoShare({
        videoUrl,
        title: 'MonoFrame AI Edit',
        description: 'Cinematic edit generated with MonoFrame AI',
      });
      
      setLastShareId(share.id);
      
      // Open share page in new tab
      window.open(`/share/${share.id}`, '_blank');
    } catch (error) {
      // Fail gracefully
    } finally {
      setIsCreatingShare(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              AI Analysis Complete
            </h1>
            <p className="text-white/60">
              Your film has been analyzed with cut detection and motion tracking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShareEdit}
              disabled={!videoUrl || isCreatingShare}
              className="
                px-3 py-2 border border-white/20 text-white rounded-lg font-medium text-sm
                hover:bg-white/10 hover:border-white/30
                transition-all duration-200
                flex items-center space-x-2
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <Link className="w-4 h-4" />
              <span>{isCreatingShare ? 'Creating...' : 'Share Edit'}</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="
                px-6 py-3 bg-white text-black rounded-lg font-semibold
                hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]
                transition-all duration-200
                flex items-center space-x-2
              "
            >
              <Download className="w-4 h-4" />
              <span>Export AI Edit</span>
            </button>
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
        </div>
        
        {/* Last shared link hint */}
        {lastShareId && (
          <p className="text-xs text-white/40 mt-1">
            Last share: /share/{lastShareId}
          </p>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {/* Video Player with Motion Tracking Overlays */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              AI Video Preview
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
          
          {/* Video Player Container */}
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-[0_0_32px_rgba(0,0,0,0.5)]">
            {/* Video Element */}
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className={`w-full aspect-video bg-black transition-all duration-300 ${
                  isBeforeMode ? 'grayscale brightness-90' : 'contrast-105 saturate-110'
                }`}
              />
              
              {/* Motion Tracking Overlays (only in AFTER mode) */}
              {!isBeforeMode && duration > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {trackedObjects.map((obj) => {
                    const pos = getTrackedObjectPosition(obj);
                    return (
                      <div
                        key={obj.id}
                        className="absolute border border-white/70 bg-black/25 rounded transition-all duration-150"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          width: `${obj.size.w}%`,
                          height: `${obj.size.h}%`,
                        }}
                      >
                        <span className="absolute top-1 left-1 text-[10px] text-white/90 font-mono tracking-wide">
                          {obj.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attention Heatmap Ribbon */}
            <div className="relative h-2 bg-gradient-to-r from-white/10 via-white/30 to-white/10">
              {attentionSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="absolute top-0 h-full bg-white/40 hover:bg-white/60 cursor-pointer transition-all group"
                  style={{
                    left: `${segment.startPercent}%`,
                    width: `${segment.endPercent - segment.startPercent}%`,
                    opacity: segment.intensity,
                  }}
                  onClick={() => seekToPercent(segment.startPercent)}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[10px] text-white/80 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                      {segment.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
              {/* Control Bar */}
              <div className="space-y-3">
                {/* Timeline Scrubber with Cut Markers */}
                <div className="relative">
                  {/* Cut markers */}
                  <div className="absolute -top-4 left-0 right-0 h-4 flex items-end">
                    {cutMarkers.map((cut) => (
                      <div
                        key={cut.id}
                        className="absolute bottom-0 group cursor-pointer"
                        style={{ left: `${cut.time}%` }}
                        onClick={() => seekAndHighlightCut(cut.id, cut.time)}
                      >
                        <div
                          className={`w-0.5 bg-white/60 transition-all ${
                            activeCutId === cut.id ? 'bg-white h-6 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'h-4'
                          }`}
                          style={{ height: `${12 + cut.intensity * 12}px` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[10px] text-white/80 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                            {cut.label} • {formatTimeFromPercent(cut.time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline bar */}
                  <div
                    ref={timelineRef}
                    className="relative h-2 bg-white/20 rounded-full cursor-pointer group mt-4"
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

        {/* Two-Column Layout: Timeline Analysis + AI Cut Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* AI Cut Sheet (Segment List) */}
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Scissors className="w-5 h-5 text-white/60" />
                <h2 className="text-xl font-semibold text-white">
                  AI Cut Sheet
                </h2>
              </div>
              <span className="text-xs text-white/40 uppercase tracking-wider">
                {segmentList.length} Segments
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {segmentList.map((segment) => (
                <div
                  key={segment.id}
                  className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                  onClick={() => seekAndHighlightCut(segment.id, segment.startPercent)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                      {segment.label}
                    </h3>
                    <span className="text-xs text-white/50 font-mono">
                      {formatTimeFromPercent(segment.startPercent)} – {formatTimeFromPercent(segment.endPercent)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {segment.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Suggestions with Randomized Data */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-white/60" />
              <h2 className="text-xl font-semibold text-white">
                AI Optimization Tips
              </h2>
            </div>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Priority Actions
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

        {/* Previous Exports */}
        {exportedFiles.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <FileVideo className="w-5 h-5 text-white/60" />
                <h2 className="text-xl font-semibold text-white">
                  Previous Exports
                </h2>
              </div>
              <span className="text-xs text-white/40 uppercase tracking-wider">
                {exportedFiles.length} {exportedFiles.length === 1 ? 'File' : 'Files'}
              </span>
            </div>
            
            <div className="space-y-3">
              {exportedFiles.map((exportFile) => (
                <div
                  key={exportFile.id}
                  className="bg-white/5 rounded-lg border border-white/10 p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white/90 mb-2">
                        {exportFile.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <span className="flex items-center space-x-1">
                          <FileVideo className="w-3 h-3" />
                          <span>{exportFile.format}</span>
                        </span>
                        <span>•</span>
                        <span>{exportFile.resolution}</span>
                        <span>•</span>
                        <span>{exportFile.filesize}</span>
                        <span>•</span>
                        <span>{exportFile.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(exportFile)}
                      className="
                        px-5 py-2.5 bg-white text-black rounded-lg font-semibold text-sm
                        hover:shadow-[0_0_16px_rgba(255,255,255,0.3)]
                        transition-all duration-200
                        flex items-center space-x-2
                      "
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onStartExport={handleStartExport}
      />

      {/* Export Progress */}
      {showExportProgress && (
        <ExportProgress onComplete={handleExportComplete} />
      )}
    </div>
  );
}
