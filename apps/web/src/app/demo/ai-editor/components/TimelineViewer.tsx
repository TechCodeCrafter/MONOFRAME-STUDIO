'use client';

import { Clock, Scissors } from 'lucide-react';

interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  label?: string;
}

interface TimelineViewerProps {
  segments: TimelineSegment[];
  duration: number;
  currentTime?: number;
  onSegmentClick?: (segment: TimelineSegment) => void;
  className?: string;
}

/**
 * TimelineViewer Component
 * Displays video segments in a visual timeline
 */
export default function TimelineViewer({
  segments,
  duration,
  currentTime = 0,
  onSegmentClick,
  className = '',
}: TimelineViewerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const getSegmentColor = (index: number) => {
    const colors = [
      'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30',
      'bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30',
      'bg-green-500/20 border-green-500/40 hover:bg-green-500/30',
      'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30',
      'bg-pink-500/20 border-pink-500/40 hover:bg-pink-500/30',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">
            Timeline Segments
          </h3>
        </div>
        <span className="text-xs text-white/40 uppercase tracking-wider">
          {segments.length} {segments.length === 1 ? 'Segment' : 'Segments'}
        </span>
      </div>

      {/* Visual Timeline */}
      <div className="relative h-16 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {/* Segments */}
        {segments.map((segment, i) => {
          const startPercent = (segment.startTime / duration) * 100;
          const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
          
          return (
            <div
              key={segment.id}
              className={`absolute top-0 h-full border transition-all cursor-pointer ${getSegmentColor(i)}`}
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
              }}
              onClick={() => onSegmentClick?.(segment)}
              title={`Segment ${i + 1}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-white/80 font-mono">
                  {i + 1}
                </span>
              </div>
            </div>
          );
        })}

        {/* Current time indicator */}
        {currentTime > 0 && duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-10"
            style={{
              left: `${(currentTime / duration) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Segment List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {segments.map((segment, i) => (
          <div
            key={segment.id}
            className={`bg-white/5 rounded-lg border border-white/10 p-3 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group ${getSegmentColor(i)}`}
            onClick={() => onSegmentClick?.(segment)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <span className="text-xs font-mono text-white/80">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">
                    {segment.label || `Segment ${i + 1}`}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-white/50 mt-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">
                      {formatTime(segment.startTime)} → {formatTime(segment.endTime)}
                    </span>
                    <span className="text-white/30">•</span>
                    <span>
                      {(segment.endTime - segment.startTime).toFixed(1)}s
                    </span>
                  </div>
                </div>
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

      {/* Total Duration */}
      <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/10">
        <span>Total Duration</span>
        <span className="font-mono">
          {formatTime(segments.reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0))}
        </span>
      </div>
    </div>
  );
}

