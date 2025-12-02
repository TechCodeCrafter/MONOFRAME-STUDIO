/**
 * Line Voiceover Generator
 * Phase 21 - Part 6: Generate voiceover for short script snippets
 * 
 * Used for script re-edit insertions and replacements
 */

import { synthesizeVoice, type SynthesisInput } from './synthesizeVoice';

export interface LineVoiceoverResult {
  audioBlob: Blob;
  duration: number;       // seconds
  waveform?: number[];    // optional lightweight waveform (128 bins)
}

/**
 * Generate voiceover for a single line of text
 * 
 * @param text - The text to synthesize
 * @param options - Voice style and speed options
 * @returns Promise<LineVoiceoverResult> with audio blob, duration, and optional waveform
 * 
 * @example
 * const result = await generateLineVoiceover(
 *   "This is a new line inserted by the user.",
 *   { voiceStyle: "alloy", speed: 1.0 }
 * );
 * console.log(`Generated ${result.duration}s of audio`);
 */
export async function generateLineVoiceover(
  text: string,
  options?: { voiceStyle?: string; speed?: number }
): Promise<LineVoiceoverResult> {
  // SSR guard
  if (typeof window === 'undefined') {
    throw new Error('generateLineVoiceover can only be called client-side');
  }

  const { voiceStyle = 'alloy', speed = 1.0 } = options || {};

  // Validation
  if (!text || text.trim().length === 0) {
    return createEmptyLineResult();
  }

  try {
    // 1. Call TTS synthesis (reuse existing Phase 20 logic)
    const synthesisInput: SynthesisInput = {
      text: text.trim(),
      voiceId: voiceStyle,
      speed,
    };

    const result = await synthesizeVoice(synthesisInput);

    // 2. Convert ArrayBuffer to Blob
    const audioBlob = new Blob([result.audioBuffer], { type: 'audio/mpeg' });

    // 3. Optionally generate waveform
    let waveform: number[] | undefined;
    try {
      waveform = await generateWaveform(result.audioBuffer);
    } catch (error) {
      console.warn('[LineVoiceover] Waveform generation failed:', error);
      // Continue without waveform
    }

    return {
      audioBlob,
      duration: result.durationSeconds,
      waveform,
    };
  } catch (error) {
    console.error('[LineVoiceover] Failed to generate voiceover:', error);
    throw error;
  }
}

/**
 * Generate a lightweight waveform from audio buffer
 * Uses Web Audio API to decode and downsample to 128 bins
 * 
 * @param audioBuffer - The audio data (MP3/AAC/etc)
 * @returns Array of 128 normalized amplitude values (0-1)
 */
async function generateWaveform(audioBuffer: ArrayBuffer): Promise<number[]> {
  // SSR guard
  if (typeof window === 'undefined' || !window.AudioContext) {
    return [];
  }

  try {
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return [];
    }
    const audioContext = new AudioContextClass();

    // Decode audio data
    const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));

    // Get channel data (use first channel if stereo)
    const channelData = decodedBuffer.getChannelData(0);

    // Downsample to 128 bins
    const binCount = 128;
    const samplesPerBin = Math.floor(channelData.length / binCount);
    const waveform: number[] = [];

    for (let i = 0; i < binCount; i++) {
      const start = i * samplesPerBin;
      const end = Math.min(start + samplesPerBin, channelData.length);

      // Calculate RMS amplitude for this bin
      let sum = 0;
      let count = 0;
      for (let j = start; j < end; j++) {
        sum += channelData[j] * channelData[j];
        count++;
      }

      const rms = Math.sqrt(sum / count);
      waveform.push(rms);
    }

    // Normalize to 0-1 range
    const maxAmplitude = Math.max(...waveform);
    if (maxAmplitude > 0) {
      for (let i = 0; i < waveform.length; i++) {
        waveform[i] = waveform[i] / maxAmplitude;
      }
    }

    // Clean up
    await audioContext.close();

    return waveform;
  } catch (error) {
    console.error('[LineVoiceover] Waveform generation error:', error);
    return [];
  }
}

/**
 * Create an empty line result (for empty text)
 */
function createEmptyLineResult(): LineVoiceoverResult {
  // Create a minimal silent audio blob
  const silentMp3 = new Uint8Array([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  return {
    audioBlob: new Blob([silentMp3], { type: 'audio/mpeg' }),
    duration: 0.1,
    waveform: new Array(128).fill(0),
  };
}

/**
 * Batch generate voiceover for multiple lines
 * Useful for processing multiple script insertions at once
 * 
 * @param lines - Array of text lines to synthesize
 * @param options - Voice style and speed options
 * @param onProgress - Optional progress callback (current, total)
 * @returns Promise<LineVoiceoverResult[]> in same order as input
 */
export async function generateLineVoiceoverBatch(
  lines: string[],
  options?: { voiceStyle?: string; speed?: number },
  onProgress?: (current: number, total: number) => void
): Promise<LineVoiceoverResult[]> {
  const results: LineVoiceoverResult[] = [];

  for (let i = 0; i < lines.length; i++) {
    const result = await generateLineVoiceover(lines[i], options);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, lines.length);
    }

    // Small delay to avoid rate limiting
    if (i < lines.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  return results;
}

/**
 * Estimate voiceover duration without actually generating it
 * Useful for UI previews and planning
 * 
 * @param text - The text to estimate
 * @param speed - Speech speed (0.5-2.0)
 * @returns Estimated duration in seconds
 */
export function estimateVoiceoverDuration(text: string, speed: number = 1.0): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Estimate: ~150 words per minute at 1.0 speed
  const wordCount = text.trim().split(/\s+/).length;
  const durationSeconds = (wordCount / 150) * 60 / speed;

  return Math.max(0.5, durationSeconds); // Minimum 0.5s
}

