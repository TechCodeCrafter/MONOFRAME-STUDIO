/**
 * Detect silence in audio using RMS analysis
 */

import { calculateRMS } from './extractWaveform';

export interface SilenceRange {
  startTime: number;
  endTime: number;
  duration: number;
  rmsLevel: number;
}

/**
 * Detect silence in waveform data
 * @param peaks - Normalized waveform peaks (0-1)
 * @param duration - Total audio duration in seconds
 * @param threshold - RMS threshold for silence (default: 0.02)
 * @param minSilenceMs - Minimum silence duration in ms (default: 200ms)
 * @returns Array of silence ranges
 */
export function detectSilence(
  peaks: number[],
  duration: number,
  threshold: number = 0.02,
  minSilenceMs: number = 200
): SilenceRange[] {
  if (peaks.length === 0) return [];
  
  const silenceRanges: SilenceRange[] = [];
  const timePerBin = duration / peaks.length;
  const minSilenceBins = Math.ceil((minSilenceMs / 1000) / timePerBin);
  
  let silenceStart: number | null = null;
  let silencePeaks: number[] = [];
  
  for (let i = 0; i < peaks.length; i++) {
    const isSilent = peaks[i] < threshold;
    
    if (isSilent) {
      // Start or continue silence
      if (silenceStart === null) {
        silenceStart = i * timePerBin;
      }
      silencePeaks.push(peaks[i]);
    } else {
      // End silence
      if (silenceStart !== null && silencePeaks.length >= minSilenceBins) {
        const endTime = i * timePerBin;
        silenceRanges.push({
          startTime: silenceStart,
          endTime,
          duration: endTime - silenceStart,
          rmsLevel: calculateRMS(silencePeaks),
        });
      }
      silenceStart = null;
      silencePeaks = [];
    }
  }
  
  // Handle silence extending to end
  if (silenceStart !== null && silencePeaks.length >= minSilenceBins) {
    silenceRanges.push({
      startTime: silenceStart,
      endTime: duration,
      duration: duration - silenceStart,
      rmsLevel: calculateRMS(silencePeaks),
    });
  }
  
  return silenceRanges;
}

/**
 * Calculate total silence duration
 */
export function getTotalSilenceDuration(silences: SilenceRange[]): number {
  return silences.reduce((total, s) => total + s.duration, 0);
}

/**
 * Calculate silence percentage of total duration
 */
export function getSilencePercentage(silences: SilenceRange[], totalDuration: number): number {
  if (totalDuration === 0) return 0;
  const totalSilence = getTotalSilenceDuration(silences);
  return (totalSilence / totalDuration) * 100;
}

/**
 * Split segment by removing silence
 * Returns array of non-silent subsegments
 */
export function splitSegmentBySilence(
  startTime: number,
  endTime: number,
  silences: SilenceRange[],
  minSubsegmentDuration: number = 0.5
): Array<{ start: number; end: number }> {
  // Find silences within this segment
  const segmentSilences = silences.filter(
    s => s.startTime >= startTime && s.endTime <= endTime
  );
  
  if (segmentSilences.length === 0) {
    return [{ start: startTime, end: endTime }];
  }
  
  const subsegments: Array<{ start: number; end: number }> = [];
  let currentStart = startTime;
  
  for (const silence of segmentSilences) {
    // Add non-silent portion before this silence
    if (silence.startTime > currentStart) {
      const duration = silence.startTime - currentStart;
      if (duration >= minSubsegmentDuration) {
        subsegments.push({
          start: currentStart,
          end: silence.startTime,
        });
      }
    }
    currentStart = silence.endTime;
  }
  
  // Add final non-silent portion
  if (currentStart < endTime) {
    const duration = endTime - currentStart;
    if (duration >= minSubsegmentDuration) {
      subsegments.push({
        start: currentStart,
        end: endTime,
      });
    }
  }
  
  return subsegments.length > 0 ? subsegments : [{ start: startTime, end: endTime }];
}

