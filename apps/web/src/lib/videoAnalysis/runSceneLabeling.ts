/**
 * Batch scene labeling for all video segments
 */

import { labelScene, type SceneLabel } from './labelScene';
import type { VideoSegment } from './segmentsFromCuts';

export interface EnrichedSegment extends VideoSegment {
  aiLabel?: SceneLabel;
}

/**
 * Run AI scene labeling for all segments
 * @param videoUrl - URL of the video (blob URL)
 * @param segments - Array of video segments
 * @param onProgress - Progress callback (segmentIndex, totalSegments)
 * @returns Enriched segments with AI labels
 */
export async function runSceneLabeling(
  videoUrl: string,
  segments: VideoSegment[],
  onProgress?: (currentIndex: number, total: number) => void
): Promise<EnrichedSegment[]> {
  const enrichedSegments: EnrichedSegment[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    // Report progress
    onProgress?.(i, segments.length);
    
    try {
      // Label the scene
      const aiLabel = await labelScene(videoUrl, segment.startTime, segment.endTime);
      
      // Add to enriched segments
      enrichedSegments.push({
        ...segment,
        label: aiLabel.title, // Update segment label with AI title
        aiLabel,
      });
    } catch (error) {
      console.error(`Failed to label segment ${i}:`, error);
      
      // Add segment without AI label
      enrichedSegments.push({
        ...segment,
        aiLabel: undefined,
      });
    }
  }
  
  // Final progress
  onProgress?.(segments.length, segments.length);
  
  return enrichedSegments;
}

/**
 * Get labeling progress percentage
 */
export function getLabelingProgress(currentIndex: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((currentIndex / total) * 100);
}

/**
 * Estimate remaining time for labeling
 * @param currentIndex - Current segment index
 * @param total - Total segments
 * @param avgTimePerSegment - Average time per segment in ms (default: 2000ms)
 */
export function estimateRemainingTime(
  currentIndex: number,
  total: number,
  avgTimePerSegment: number = 2000
): number {
  const remaining = total - currentIndex;
  return Math.ceil((remaining * avgTimePerSegment) / 1000); // Return in seconds
}

