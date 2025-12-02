/**
 * Extract waveform data from video audio using Web Audio API
 */

export interface WaveformData {
  peaks: number[]; // Normalized amplitude values (0-1)
  sampleRate: number;
  duration: number;
  channels: number;
}

export interface SegmentWaveform {
  segmentId: string;
  startTime: number;
  endTime: number;
  peaks: number[];
}

/**
 * Extract waveform from video/audio blob
 * @param blob - Video or audio blob
 * @param binsPerSegment - Number of waveform bins to generate (default: 512)
 * @returns Waveform data with normalized peaks
 */
export async function extractWaveform(
  blob: Blob,
  binsPerSegment: number = 512
): Promise<WaveformData> {
  const arrayBuffer = await blob.arrayBuffer();
  
  // Create audio context
  const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('AudioContext not supported');
  }
  const audioContext = new AudioContextClass();
  
  try {
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get raw audio data from first channel
    const rawData = audioBuffer.getChannelData(0);
    const samples = rawData.length;
    const duration = audioBuffer.duration;
    
    // Calculate samples per bin
    const samplesPerBin = Math.floor(samples / binsPerSegment);
    const peaks: number[] = [];
    
    // Extract peak amplitude for each bin
    for (let i = 0; i < binsPerSegment; i++) {
      const start = i * samplesPerBin;
      const end = Math.min(start + samplesPerBin, samples);
      
      let max = 0;
      for (let j = start; j < end; j++) {
        const amplitude = Math.abs(rawData[j]);
        if (amplitude > max) {
          max = amplitude;
        }
      }
      
      peaks.push(max);
    }
    
    // Normalize peaks to 0-1 range
    const maxPeak = Math.max(...peaks);
    const normalizedPeaks = maxPeak > 0 ? peaks.map(p => p / maxPeak) : peaks;
    
    await audioContext.close();
    
    return {
      peaks: normalizedPeaks,
      sampleRate: audioBuffer.sampleRate,
      duration,
      channels: audioBuffer.numberOfChannels,
    };
  } catch (error) {
    await audioContext.close();
    throw error;
  }
}

/**
 * Extract waveform for specific segment
 * @param blob - Video or audio blob
 * @param startTime - Segment start time in seconds
 * @param endTime - Segment end time in seconds
 * @param bins - Number of bins for this segment (default: 256)
 * @returns Segment-specific waveform
 */
export async function extractSegmentWaveform(
  blob: Blob,
  startTime: number,
  endTime: number,
  segmentId: string,
  bins: number = 256
): Promise<SegmentWaveform> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('AudioContext not supported');
  }
  const audioContext = new AudioContextClass();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Calculate sample range for this segment
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const segmentSamples = endSample - startSample;
    
    const samplesPerBin = Math.floor(segmentSamples / bins);
    const peaks: number[] = [];
    
    // Extract peaks for segment
    for (let i = 0; i < bins; i++) {
      const binStart = startSample + (i * samplesPerBin);
      const binEnd = Math.min(binStart + samplesPerBin, endSample);
      
      let max = 0;
      for (let j = binStart; j < binEnd; j++) {
        const amplitude = Math.abs(rawData[j]);
        if (amplitude > max) {
          max = amplitude;
        }
      }
      
      peaks.push(max);
    }
    
    // Normalize
    const maxPeak = Math.max(...peaks);
    const normalizedPeaks = maxPeak > 0 ? peaks.map(p => p / maxPeak) : peaks;
    
    await audioContext.close();
    
    return {
      segmentId,
      startTime,
      endTime,
      peaks: normalizedPeaks,
    };
  } catch (error) {
    await audioContext.close();
    throw error;
  }
}

/**
 * Calculate RMS (Root Mean Square) from audio samples
 * Used for loudness calculation
 */
export function calculateRMS(samples: number[]): number {
  if (samples.length === 0) return 0;
  
  const sumSquares = samples.reduce((sum, sample) => sum + (sample * sample), 0);
  return Math.sqrt(sumSquares / samples.length);
}

