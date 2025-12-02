/**
 * Video Analysis Module
 * Real AI-powered cut detection and segmentation
 */

export { extractFrames, dataUrlToImageData, type VideoFrame } from './extractFrames';
export { detectCuts, filterCuts, type DetectedCut } from './detectCuts';
export {
  segmentsFromCuts,
  mergeShortSegments,
  getSegmentStats,
  type VideoSegment,
} from './segmentsFromCuts';
export { labelScene, type SceneLabel } from './labelScene';
export { runSceneLabeling, getLabelingProgress, estimateRemainingTime, type EnrichedSegment } from './runSceneLabeling';

/**
 * Complete analysis pipeline
 * Extracts frames, detects cuts, and generates segments
 */
export async function analyzeVideo(
  videoElement: HTMLVideoElement,
  onProgress?: (stage: string, progress: number) => void
): Promise<{
  segments: import('./segmentsFromCuts').VideoSegment[];
  cuts: import('./detectCuts').DetectedCut[];
  stats: ReturnType<typeof import('./segmentsFromCuts').getSegmentStats>;
}> {
  const { extractFrames } = await import('./extractFrames');
  const { detectCuts, filterCuts } = await import('./detectCuts');
  const { segmentsFromCuts, mergeShortSegments, getSegmentStats } = await import('./segmentsFromCuts');

  // Step 1: Extract frames
  onProgress?.('Extracting frames', 0.1);
  const frames = await extractFrames(videoElement, 300);
  
  // Step 2: Detect cuts
  onProgress?.('Detecting cuts', 0.4);
  const rawCuts = await detectCuts(frames, 0.22, true);
  const cuts = filterCuts(rawCuts, 1.0);
  
  // Step 3: Generate segments
  onProgress?.('Generating segments', 0.7);
  const rawSegments = segmentsFromCuts(cuts, videoElement.duration, 2.0);
  const segments = mergeShortSegments(rawSegments, 2.0);
  
  // Step 4: Calculate stats
  onProgress?.('Finalizing', 0.9);
  const stats = getSegmentStats(segments);
  
  onProgress?.('Complete', 1.0);

  return { segments, cuts, stats };
}

