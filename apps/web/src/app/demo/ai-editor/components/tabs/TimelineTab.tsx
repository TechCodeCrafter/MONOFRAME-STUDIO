"use client";

/**
 * Timeline Tab Content
 * Displays TimelineEditor for segment management
 */

import TimelineEditor, { type TimelineSegment } from '../TimelineEditor';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';

interface TimelineTabProps {
  segments: TimelineSegment[];
  duration: number;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioAnalysis: SegmentAudioIntelligence[];
  onReorder: (segments: TimelineSegment[]) => void;
  onDelete: (segmentId: string) => void;
  onMerge: (segmentId1: string, segmentId2: string) => void;
  onTrim: (segmentId: string, newStart: number, newEnd: number) => void;
  onReset: () => void;
  onSegmentClick: (segment: TimelineSegment) => void;
}

export function TimelineTab({
  segments,
  duration,
  currentTime,
  videoRef,
  audioAnalysis,
  onReorder,
  onDelete,
  onMerge,
  onTrim,
  onReset,
  onSegmentClick,
}: TimelineTabProps) {
  if (segments.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        <p>No timeline segments available.</p>
      </div>
    );
  }

  return (
    <div>
      <TimelineEditor
        segments={segments}
        duration={duration}
        currentTime={currentTime}
        videoElement={videoRef.current}
        audioAnalysis={audioAnalysis}
        onReorder={onReorder}
        onDelete={onDelete}
        onMerge={onMerge}
        onTrim={onTrim}
        onReset={onReset}
        onSegmentClick={onSegmentClick}
      />
    </div>
  );
}

