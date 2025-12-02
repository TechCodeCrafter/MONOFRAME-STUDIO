/**
 * Comprehensive audio analysis combining waveform and silence detection
 */

import { extractWaveform, extractSegmentWaveform, type WaveformData, type SegmentWaveform } from './extractWaveform';
import { detectSilence, getSilencePercentage, type SilenceRange } from './detectSilence';

export interface AudioIntelligence {
  waveform: WaveformData;
  silences: SilenceRange[];
  speechProbability: number; // 0-1
  energyLevel: number; // 0-1 (average RMS)
  peakiness: number; // 0-1 (how spiky the waveform is)
  silencePercentage: number; // % of audio that is silent
  noisiness: number; // 0-1 (estimate of background noise)
}

export interface SegmentAudioIntelligence {
  segmentId: string;
  waveform: SegmentWaveform;
  silences: SilenceRange[];
  speechProbability: number;
  energyLevel: number;
  peakiness: number;
}

/**
 * Calculate speech probability from waveform characteristics
 * Speech tends to have:
 * - Moderate energy (not too quiet, not constant loud)
 * - Rhythmic patterns (peaks and valleys)
 * - Low silence percentage
 */
function calculateSpeechProbability(
  peaks: number[],
  silencePercentage: number,
  peakiness: number
): number {
  // Low silence suggests speech (people rarely have long pauses)
  const silenceScore = Math.max(0, 1 - (silencePercentage / 50));
  
  // Moderate peakiness suggests speech (music is either smooth or very peaky)
  const peakinessScore = peakiness > 0.3 && peakiness < 0.7 ? 1 : 0.5;
  
  // Count peaks in moderate range (speech is typically 0.1-0.6)
  const moderatePeaks = peaks.filter(p => p > 0.1 && p < 0.6).length;
  const moderateScore = moderatePeaks / peaks.length;
  
  return (silenceScore * 0.4) + (peakinessScore * 0.3) + (moderateScore * 0.3);
}

/**
 * Calculate energy level (average RMS)
 */
function calculateEnergyLevel(peaks: number[]): number {
  if (peaks.length === 0) return 0;
  const sum = peaks.reduce((acc, p) => acc + p, 0);
  return sum / peaks.length;
}

/**
 * Calculate peakiness (variance in amplitude)
 * High peakiness = lots of dynamic range (e.g., action scenes, music with bass)
 * Low peakiness = consistent volume (e.g., narration, ambient)
 */
function calculatePeakiness(peaks: number[]): number {
  if (peaks.length === 0) return 0;
  
  const mean = peaks.reduce((acc, p) => acc + p, 0) / peaks.length;
  const variance = peaks.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / peaks.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize standard deviation to 0-1 range (empirically, stdDev is typically < 0.3)
  return Math.min(stdDev / 0.3, 1);
}

/**
 * Estimate noisiness from low-amplitude peaks
 * Noise typically shows as consistent low-level signal
 */
function calculateNoisiness(peaks: number[]): number {
  if (peaks.length === 0) return 0;
  
  // Count peaks in noise range (0.01-0.05)
  const noisePeaks = peaks.filter(p => p > 0.01 && p < 0.05).length;
  return Math.min((noisePeaks / peaks.length) * 2, 1);
}

/**
 * Analyze audio comprehensively
 * @param blob - Video or audio blob
 * @returns Audio intelligence object
 */
export async function analyzeAudio(blob: Blob): Promise<AudioIntelligence> {
  // Extract waveform
  const waveform = await extractWaveform(blob, 512);
  
  // Detect silence
  const silences = detectSilence(waveform.peaks, waveform.duration, 0.02, 200);
  const silencePercentage = getSilencePercentage(silences, waveform.duration);
  
  // Calculate metrics
  const energyLevel = calculateEnergyLevel(waveform.peaks);
  const peakiness = calculatePeakiness(waveform.peaks);
  const speechProbability = calculateSpeechProbability(
    waveform.peaks,
    silencePercentage,
    peakiness
  );
  const noisiness = calculateNoisiness(waveform.peaks);
  
  return {
    waveform,
    silences,
    speechProbability,
    energyLevel,
    peakiness,
    silencePercentage,
    noisiness,
  };
}

/**
 * Analyze audio for specific segment
 */
export async function analyzeSegmentAudio(
  blob: Blob,
  segmentId: string,
  startTime: number,
  endTime: number
): Promise<SegmentAudioIntelligence> {
  // Extract segment waveform
  const waveform = await extractSegmentWaveform(blob, startTime, endTime, segmentId, 256);
  
  // Detect silence in segment
  const silences = detectSilence(
    waveform.peaks,
    endTime - startTime,
    0.02,
    200
  ).map(s => ({
    ...s,
    startTime: s.startTime + startTime, // Adjust to absolute time
    endTime: s.endTime + startTime,
  }));
  
  const segmentDuration = endTime - startTime;
  const silencePercentage = getSilencePercentage(silences, segmentDuration);
  
  // Calculate metrics
  const energyLevel = calculateEnergyLevel(waveform.peaks);
  const peakiness = calculatePeakiness(waveform.peaks);
  const speechProbability = calculateSpeechProbability(
    waveform.peaks,
    silencePercentage,
    peakiness
  );
  
  return {
    segmentId,
    waveform,
    silences,
    speechProbability,
    energyLevel,
    peakiness,
  };
}

/**
 * Batch analyze all segments
 */
export async function analyzeAllSegments(
  blob: Blob,
  segments: Array<{ id: string; startTime: number; endTime: number }>,
  onProgress?: (current: number, total: number) => void
): Promise<SegmentAudioIntelligence[]> {
  const results: SegmentAudioIntelligence[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    onProgress?.(i, segments.length);
    
    const analysis = await analyzeSegmentAudio(
      blob,
      segments[i].id,
      segments[i].startTime,
      segments[i].endTime
    );
    
    results.push(analysis);
  }
  
  onProgress?.(segments.length, segments.length);
  return results;
}

