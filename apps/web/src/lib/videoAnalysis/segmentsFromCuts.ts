/**
 * Convert detected cuts to timeline segments
 */

import type { DetectedCut } from './detectCuts';

export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
  confidence?: number;
}

/**
 * Generate segment labels based on position and characteristics
 */
function generateSegmentLabel(index: number, totalSegments: number): string {
  const labels = [
    'Opening Shot',
    'Establishing Scene',
    'Character Introduction',
    'Dialogue Sequence',
    'Action Moment',
    'Transition',
    'Key Scene',
    'Emotional Beat',
    'Climactic Moment',
    'Resolution',
    'Closing Shot',
  ];

  // Use position-based logic
  if (index === 0) return 'Opening Shot';
  if (index === totalSegments - 1) return 'Closing Shot';
  
  // Mid-section labels
  const midIndex = Math.floor((index / totalSegments) * (labels.length - 2)) + 1;
  return labels[Math.min(midIndex, labels.length - 1)];
}

/**
 * Convert detected cuts to video segments
 * @param cuts - Array of detected cuts
 * @param videoDuration - Total video duration in seconds
 * @param minSegmentDuration - Minimum segment duration (default: 2.0s)
 * @returns Array of video segments
 */
export function segmentsFromCuts(
  cuts: DetectedCut[],
  videoDuration: number,
  minSegmentDuration: number = 2.0
): VideoSegment[] {
  const segments: VideoSegment[] = [];
  
  // If no cuts detected, return single segment
  if (cuts.length === 0) {
    return [
      {
        id: 'segment-0',
        startTime: 0,
        endTime: videoDuration,
        label: 'Full Video',
        confidence: 1.0,
      },
    ];
  }

  // Create segments from cuts
  const cutTimes = [0, ...cuts.map((c) => c.time), videoDuration];
  
  for (let i = 0; i < cutTimes.length - 1; i++) {
    const startTime = cutTimes[i];
    const endTime = cutTimes[i + 1];
    const duration = endTime - startTime;
    
    // Skip segments that are too short
    if (duration < minSegmentDuration) {
      continue;
    }

    // Get confidence from cut (if available)
    const confidence = i < cuts.length ? cuts[i].confidence : 1.0;

    segments.push({
      id: `segment-${i}`,
      startTime,
      endTime,
      label: generateSegmentLabel(i, cutTimes.length - 1),
      confidence,
    });
  }

  // If all segments were filtered out (too short), create a single segment
  if (segments.length === 0) {
    return [
      {
        id: 'segment-0',
        startTime: 0,
        endTime: videoDuration,
        label: 'Full Video',
        confidence: 1.0,
      },
    ];
  }

  return segments;
}

/**
 * Merge segments that are too short with adjacent segments
 * @param segments - Array of segments
 * @param minDuration - Minimum duration threshold
 * @returns Merged segments
 */
export function mergeShortSegments(
  segments: VideoSegment[],
  minDuration: number = 2.0
): VideoSegment[] {
  if (segments.length <= 1) return segments;

  const merged: VideoSegment[] = [];
  let currentSegment = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const nextSegment = segments[i];
    const currentDuration = currentSegment.endTime - currentSegment.startTime;

    if (currentDuration < minDuration) {
      // Merge with next segment
      currentSegment.endTime = nextSegment.endTime;
      currentSegment.label = `${currentSegment.label} + ${nextSegment.label}`;
      currentSegment.confidence = Math.min(
        currentSegment.confidence || 1,
        nextSegment.confidence || 1
      );
    } else {
      // Current segment is long enough, add to result
      merged.push(currentSegment);
      currentSegment = { ...nextSegment };
    }
  }

  // Add the last segment
  merged.push(currentSegment);

  return merged;
}

/**
 * Calculate statistics for detected segments
 */
export function getSegmentStats(segments: VideoSegment[]) {
  if (segments.length === 0) {
    return {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      shortestDuration: 0,
      longestDuration: 0,
      averageConfidence: 0,
    };
  }

  const durations = segments.map((s) => s.endTime - s.startTime);
  const confidences = segments.map((s) => s.confidence || 1.0);

  return {
    count: segments.length,
    totalDuration: durations.reduce((a, b) => a + b, 0),
    averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    shortestDuration: Math.min(...durations),
    longestDuration: Math.max(...durations),
    averageConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
  };
}

