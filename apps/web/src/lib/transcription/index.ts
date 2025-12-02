/**
 * Transcription Module
 * Whisper-based video transcription and script editing
 */

export { extractAudioFromVideo, formatAudioForWhisper, estimateTranscriptionTime } from './extractAudio';

export {
  transcribeWithWhisper,
  extractWordTimestamps,
  getTranscriptForTimeRange,
  type WhisperResponse,
  type WordTimestamp,
  type TranscriptSegment,
} from './runWhisper';

export {
  cleanTranscript,
  isFillerWord,
  countFillerWords,
  highlightFillerWords,
  removeFillerWords,
  calculateTranscriptStats,
  type CleanedTranscript,
} from './cleanTranscript';

export {
  alignTranscriptToSegments,
  buildKeywordIndex,
  type AlignedTranscript,
} from './alignTranscriptToSegments';

export {
  generateSRT,
  generateVTT,
  downloadSubtitle,
} from './subtitleExport';

export {
  searchKeyword,
  searchMultipleKeywords,
  type SearchResult,
} from './keywordSearch';

