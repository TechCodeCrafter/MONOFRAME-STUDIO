'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Clock, Scissors, Trash2, Merge, GripVertical, RotateCcw, Sparkles } from 'lucide-react';
import type { SceneLabel } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';

export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  label?: string;
  clipId?: string;
  aiLabel?: SceneLabel;
}

interface TimelineEditorProps {
  segments: TimelineSegment[];
  duration: number;
  currentTime?: number;
  videoElement?: HTMLVideoElement | null;
  audioAnalysis?: SegmentAudioIntelligence[];
  onReorder: (newSegments: TimelineSegment[]) => void;
  onDelete: (segmentId: string) => void;
  onMerge: (segmentId1: string, segmentId2: string) => void;
  onTrim: (segmentId: string, newStart: number, newEnd: number) => void;
  onReset: () => void;
  onSegmentClick?: (segment: TimelineSegment) => void;
  className?: string;
}

/**
 * TimelineEditor Component
 * Interactive timeline with drag-drop reordering, delete, and merge
 */
export default function TimelineEditor({
  segments,
  duration,
  currentTime = 0,
  videoElement,
  audioAnalysis = [],
  onReorder,
  onDelete,
  onMerge,
  onTrim,
  onReset,
  onSegmentClick,
  className = '',
}: TimelineEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [trimHandle, setTrimHandle] = useState<{ segmentId: string; side: 'left' | 'right' } | null>(null);
  const [previewData, setPreviewData] = useState<{ segmentId: string; thumbnail: string; time: number } | null>(null);
  const dragStartY = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);
  const trimStartValue = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Initialize canvas for thumbnail extraction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      canvasRef.current = canvas;
    }
  }, []);

  // Extract thumbnail from video at specific time
  const extractThumbnail = useCallback(
    async (time: number): Promise<string | null> => {
      if (!videoElement || !canvasRef.current) return null;

      try {
        // Seek to time
        videoElement.currentTime = time;
        
        // Wait for seek to complete
        await new Promise((resolve) => {
          const handleSeeked = () => {
            videoElement.removeEventListener('seeked', handleSeeked);
            resolve(null);
          };
          videoElement.addEventListener('seeked', handleSeeked);
        });

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(videoElement, 0, 0, 160, 90);
        return canvasRef.current.toDataURL('image/jpeg', 0.7);
      } catch (error) {
        console.error('Failed to extract thumbnail:', error);
        return null;
      }
    },
    [videoElement]
  );

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    setDraggedIndex(index);
    dragStartY.current = e.clientY;
    dragCurrentY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggedIndex === null) return;
      
      dragCurrentY.current = e.clientY;
      const deltaY = dragCurrentY.current - dragStartY.current;
      
      // Determine drop target based on vertical movement
      const itemHeight = 80; // Approximate height of each segment
      const indexOffset = Math.round(deltaY / itemHeight);
      const newIndex = Math.max(0, Math.min(segments.length - 1, draggedIndex + indexOffset));
      
      if (newIndex !== dragOverIndex) {
        setDragOverIndex(newIndex);
      }
    },
    [draggedIndex, segments.length, dragOverIndex]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (draggedIndex === null) return;

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      if (dragOverIndex !== null && dragOverIndex !== draggedIndex) {
        // Reorder segments
        const newSegments = [...segments];
        const [movedSegment] = newSegments.splice(draggedIndex, 1);
        newSegments.splice(dragOverIndex, 0, movedSegment);
        onReorder(newSegments);
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
      dragStartY.current = 0;
      dragCurrentY.current = 0;
    },
    [draggedIndex, dragOverIndex, segments, onReorder]
  );

  // Selection handlers
  const handleSegmentSelect = (segmentId: string, isCtrlClick: boolean) => {
    if (isCtrlClick) {
      const newSelection = new Set(selectedSegments);
      if (newSelection.has(segmentId)) {
        newSelection.delete(segmentId);
      } else {
        newSelection.add(segmentId);
      }
      setSelectedSegments(newSelection);
    } else {
      setSelectedSegments(new Set([segmentId]));
    }
  };

  // Delete handler
  const handleDelete = (segmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(segmentId);
    const newSelection = new Set(selectedSegments);
    newSelection.delete(segmentId);
    setSelectedSegments(newSelection);
  };

  // Merge handler
  const handleMerge = () => {
    if (selectedSegments.size !== 2) return;
    
    const [id1, id2] = Array.from(selectedSegments);
    onMerge(id1, id2);
    setSelectedSegments(new Set());
  };

  // Trim handle handlers
  const handleTrimStart = useCallback(
    (e: React.PointerEvent, segmentId: string, side: 'left' | 'right', currentValue: number) => {
      e.stopPropagation();
      setTrimHandle({ segmentId, side });
      trimStartValue.current = currentValue;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handleTrimMove = useCallback(
    (e: React.PointerEvent, segment: TimelineSegment) => {
      if (!trimHandle || trimHandle.segmentId !== segment.id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const time = percent * duration;

      if (trimHandle.side === 'left') {
        // Adjust start time (minimum 0.5s segment)
        const newStart = Math.max(0, Math.min(time, segment.endTime - 0.5));
        onTrim(segment.id, newStart, segment.endTime);
      } else {
        // Adjust end time (minimum 0.5s segment)
        const newEnd = Math.max(segment.startTime + 0.5, Math.min(time, duration));
        onTrim(segment.id, segment.startTime, newEnd);
      }
    },
    [trimHandle, duration, onTrim]
  );

  const handleTrimEnd = useCallback((e: React.PointerEvent) => {
    if (trimHandle) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setTrimHandle(null);
    }
  }, [trimHandle]);

  // Hover preview handler
  const handleSegmentHover = useCallback(
    async (e: React.MouseEvent, segment: TimelineSegment) => {
      if (!videoElement) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const time = segment.startTime + (segment.endTime - segment.startTime) * percent;

      const thumbnail = await extractThumbnail(time);
      if (thumbnail) {
        setPreviewData({ segmentId: segment.id, thumbnail, time });
      }
    },
    [videoElement, extractThumbnail]
  );

  const handleSegmentLeave = useCallback(() => {
    setPreviewData(null);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">
            Interactive Timeline
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          {selectedSegments.size === 2 && (
            <button
              onClick={handleMerge}
              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-md text-xs font-semibold hover:bg-blue-500/30 transition-all flex items-center space-x-1"
            >
              <Merge className="w-3 h-3" />
              <span>Merge Selected</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 rounded-md text-xs font-semibold hover:bg-white/20 transition-all flex items-center space-x-1"
            title="Reset all segments to original AI-detected cuts"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Cuts</span>
          </button>
          <span className="text-xs text-white/40 uppercase tracking-wider">
            {segments.length} {segments.length === 1 ? 'Segment' : 'Segments'}
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="relative h-16 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {/* Segments */}
        {segments.map((segment, i) => {
          const startPercent = (segment.startTime / duration) * 100;
          const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
          const isSelected = selectedSegments.has(segment.id);
          
          return (
            <div
              key={segment.id}
              className={`absolute top-0 h-full border transition-all cursor-pointer ${getSegmentColor(i)} ${
                isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black z-10' : ''
              }`}
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
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-20"
            style={{
              left: `${(currentTime / duration) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Draggable Segment List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {segments.map((segment, i) => {
          const isSelected = selectedSegments.has(segment.id);
          const isDragging = draggedIndex === i;
          const isDropTarget = dragOverIndex === i;
          
          return (
            <div key={segment.id} className="relative">
              {/* Drop indicator */}
              {isDropTarget && draggedIndex !== null && draggedIndex !== i && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20" />
              )}
              
              <div
                className={`relative bg-white/5 rounded-lg border border-white/10 p-3 transition-all cursor-move group ${getSegmentColor(i)} ${
                  isSelected ? 'ring-2 ring-white/60' : ''
                } ${
                  isDragging ? 'opacity-50 scale-95' : 'hover:bg-white/[0.07] hover:border-white/20'
                } ${
                  hoveredSegment === segment.id ? 'shadow-lg' : ''
                }`}
                onClick={(e) => handleSegmentSelect(segment.id, e.ctrlKey || e.metaKey)}
                onPointerDown={(e) => handlePointerDown(e, i)}
                onPointerMove={(e) => {
                  handlePointerMove(e);
                  handleTrimMove(e, segment);
                }}
                onPointerUp={(e) => {
                  handlePointerUp(e);
                  handleTrimEnd(e);
                }}
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  handleSegmentLeave();
                }}
                onMouseMove={(e) => handleSegmentHover(e, segment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Drag Handle */}
                    <div className="text-white/40 group-hover:text-white/60 transition-colors cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    {/* Segment Number */}
                    <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all flex-shrink-0">
                      <span className="text-xs font-mono text-white/80">
                        {i + 1}
                      </span>
                    </div>
                    
                    {/* Segment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {segment.aiLabel && (
                          <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-white/90 truncate">
                          {segment.aiLabel?.title || segment.label || `Segment ${i + 1}`}
                        </p>
                        {segment.aiLabel?.emotion && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded flex-shrink-0">
                            {segment.aiLabel.emotion}
                          </span>
                        )}
                      </div>
                      {segment.aiLabel?.description && (
                        <p className="text-xs text-white/60 mb-1 line-clamp-1">
                          {segment.aiLabel.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-white/50">
                        <Clock className="w-3 h-3 flex-shrink-0" />
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
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(segment.id, e)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Delete segment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Waveform Visualization */}
                {audioAnalysis && audioAnalysis.length > 0 && (() => {
                  const audio = audioAnalysis.find(a => a.segmentId === segment.id);
                  if (!audio || !audio.waveform.peaks || audio.waveform.peaks.length === 0) return null;
                  
                  return (
                    <div className="mt-2 mb-1 px-11">
                      <div className="relative h-10 bg-black/40 rounded overflow-hidden border border-white/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {audio.waveform.peaks.map((peak, idx) => {
                            const height = Math.max(peak * 100, 2);
                            const x = (idx / audio.waveform.peaks.length) * 100;
                            
                            // Check if this bin is in a silence zone
                            const binTime = segment.startTime + ((idx / audio.waveform.peaks.length) * (segment.endTime - segment.startTime));
                            const isSilent = audio.silences.some(
                              s => binTime >= s.startTime && binTime <= s.endTime
                            );
                            
                            return (
                              <div
                                key={idx}
                                className={`absolute bottom-1/2 translate-y-1/2 ${
                                  isSilent ? 'bg-white/20' : 'bg-blue-400/60'
                                }`}
                                style={{
                                  left: `${x}%`,
                                  width: '2px',
                                  height: `${height}%`,
                                }}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Silence indicator overlay */}
                        {audio.silences.length > 0 && (
                          <div className="absolute top-1 left-1 text-[9px] text-white/40 uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded">
                            {audio.silences.length} silent
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Left Trim Handle */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2 bg-white/0 hover:bg-white/40 border-l-2 border-white/60 cursor-ew-resize z-10 transition-all group-hover:opacity-100 opacity-0"
                  onPointerDown={(e) => handleTrimStart(e, segment.id, 'left', segment.startTime)}
                  onClick={(e) => e.stopPropagation()}
                  title="Drag to adjust start time"
                />

                {/* Right Trim Handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 bg-white/0 hover:bg-white/40 border-r-2 border-white/60 cursor-ew-resize z-10 transition-all group-hover:opacity-100 opacity-0"
                  onPointerDown={(e) => handleTrimStart(e, segment.id, 'right', segment.endTime)}
                  onClick={(e) => e.stopPropagation()}
                  title="Drag to adjust end time"
                />

                {/* Thumbnail Preview */}
                {previewData && previewData.segmentId === segment.id && (
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-2 pointer-events-none z-40 shadow-[0_0_24px_rgba(0,0,0,0.5)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewData.thumbnail}
                      alt="Preview"
                      className="w-40 h-[90px] rounded object-cover mb-2"
                    />
                    <p className="text-white text-xs text-center font-mono">
                      {formatTime(previewData.time)}
                    </p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-white/20 rotate-45" />
                  </div>
                )}

                {/* Hover Tooltip (Duration) */}
                {hoveredSegment === segment.id && !previewData && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap pointer-events-none z-30 border border-white/20">
                    Duration: {(segment.endTime - segment.startTime).toFixed(1)}s
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <span>💡 Drag to reorder</span>
          <span>•</span>
          <span>Trim handles to adjust</span>
          <span>•</span>
          <span>Hover for preview</span>
          <span>•</span>
          <span>Ctrl+Click to select</span>
        </div>
        <span className="font-mono">
          Total: {formatTime(segments.reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0))}
        </span>
      </div>
    </div>
  );
}

