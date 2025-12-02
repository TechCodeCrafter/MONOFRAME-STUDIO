/**
 * Audio Analysis Module
 * Waveform extraction, silence detection, and audio intelligence
 */

export {
  extractWaveform,
  extractSegmentWaveform,
  calculateRMS,
  type WaveformData,
  type SegmentWaveform,
} from './extractWaveform';

export {
  detectSilence,
  getTotalSilenceDuration,
  getSilencePercentage,
  splitSegmentBySilence,
  type SilenceRange,
} from './detectSilence';

export {
  analyzeAudio,
  analyzeSegmentAudio,
  analyzeAllSegments,
  type AudioIntelligence,
  type SegmentAudioIntelligence,
} from './analyzeAudio';

