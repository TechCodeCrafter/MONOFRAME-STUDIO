/**
 * Detect cuts in video using visual difference analysis
 */

import { dataUrlToImageData, type VideoFrame } from './extractFrames';

export interface DetectedCut {
  time: number;
  confidence: number; // 0-1
  differenceScore: number;
}

/**
 * Calculate pixel difference between two ImageData objects
 * Returns a normalized difference score (0 = identical, 1 = completely different)
 */
function calculatePixelDifference(
  imageData1: ImageData,
  imageData2: ImageData
): number {
  const data1 = imageData1.data;
  const data2 = imageData2.data;
  const pixelCount = imageData1.width * imageData1.height;
  
  let totalDifference = 0;
  
  // Compare RGB values (skip alpha channel)
  for (let i = 0; i < data1.length; i += 4) {
    const rDiff = Math.abs(data1[i] - data2[i]);
    const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
    const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
    
    totalDifference += (rDiff + gDiff + bDiff) / 3; // Average RGB difference
  }
  
  // Normalize to 0-1 range
  const averageDifference = totalDifference / pixelCount;
  return averageDifference / 255; // Normalize by max pixel value
}

/**
 * Calculate histogram-based difference (more robust to lighting changes)
 */
function calculateHistogramDifference(
  imageData1: ImageData,
  imageData2: ImageData
): number {
  const bins = 32; // Number of bins per channel
  const histogram1 = new Array(bins * 3).fill(0);
  const histogram2 = new Array(bins * 3).fill(0);
  
  const data1 = imageData1.data;
  const data2 = imageData2.data;
  const pixelCount = imageData1.width * imageData1.height;
  
  // Build histograms
  for (let i = 0; i < data1.length; i += 4) {
    // Red channel
    const r1Bin = Math.floor((data1[i] / 256) * bins);
    const r2Bin = Math.floor((data2[i] / 256) * bins);
    histogram1[r1Bin]++;
    histogram2[r2Bin]++;
    
    // Green channel
    const g1Bin = Math.floor((data1[i + 1] / 256) * bins) + bins;
    const g2Bin = Math.floor((data2[i + 1] / 256) * bins) + bins;
    histogram1[g1Bin]++;
    histogram2[g2Bin]++;
    
    // Blue channel
    const b1Bin = Math.floor((data1[i + 2] / 256) * bins) + bins * 2;
    const b2Bin = Math.floor((data2[i + 2] / 256) * bins) + bins * 2;
    histogram1[b1Bin]++;
    histogram2[b2Bin]++;
  }
  
  // Normalize histograms
  for (let i = 0; i < histogram1.length; i++) {
    histogram1[i] /= pixelCount;
    histogram2[i] /= pixelCount;
  }
  
  // Calculate chi-squared distance
  let distance = 0;
  for (let i = 0; i < histogram1.length; i++) {
    if (histogram1[i] + histogram2[i] > 0) {
      distance += Math.pow(histogram1[i] - histogram2[i], 2) / (histogram1[i] + histogram2[i]);
    }
  }
  
  // Normalize to 0-1 range (empirically, chi-squared distance is typically < 2)
  return Math.min(distance / 2, 1);
}

/**
 * Detect cuts in video frames
 * @param frames - Array of extracted video frames
 * @param threshold - Difference threshold for cut detection (0-1, default: 0.22)
 * @param useHistogram - Use histogram-based detection (more robust, default: true)
 * @returns Array of detected cuts with timestamps and confidence scores
 */
export async function detectCuts(
  frames: VideoFrame[],
  threshold: number = 0.22,
  useHistogram: boolean = true
): Promise<DetectedCut[]> {
  if (frames.length < 2) {
    return [];
  }

  const cuts: DetectedCut[] = [];
  
  // Convert first frame to ImageData
  let prevImageData = await dataUrlToImageData(
    frames[0].dataUrl,
    frames[0].width,
    frames[0].height
  );

  // Compare consecutive frames
  for (let i = 1; i < frames.length; i++) {
    const currentFrame = frames[i];
    const currentImageData = await dataUrlToImageData(
      currentFrame.dataUrl,
      currentFrame.width,
      currentFrame.height
    );

    // Calculate difference
    const difference = useHistogram
      ? calculateHistogramDifference(prevImageData, currentImageData)
      : calculatePixelDifference(prevImageData, currentImageData);

    // Check if difference exceeds threshold (potential cut)
    if (difference > threshold) {
      cuts.push({
        time: currentFrame.time,
        confidence: Math.min(difference / threshold, 1), // Normalize to 0-1
        differenceScore: difference,
      });
    }

    prevImageData = currentImageData;
  }

  return cuts;
}

/**
 * Filter out false positives by removing cuts that are too close together
 * @param cuts - Array of detected cuts
 * @param minGapSeconds - Minimum time between cuts (default: 1.0s)
 * @returns Filtered array of cuts
 */
export function filterCuts(
  cuts: DetectedCut[],
  minGapSeconds: number = 1.0
): DetectedCut[] {
  if (cuts.length === 0) return [];

  const filtered: DetectedCut[] = [cuts[0]];
  
  for (let i = 1; i < cuts.length; i++) {
    const lastCut = filtered[filtered.length - 1];
    const currentCut = cuts[i];
    
    if (currentCut.time - lastCut.time >= minGapSeconds) {
      filtered.push(currentCut);
    } else if (currentCut.confidence > lastCut.confidence) {
      // Replace with higher confidence cut
      filtered[filtered.length - 1] = currentCut;
    }
  }
  
  return filtered;
}

