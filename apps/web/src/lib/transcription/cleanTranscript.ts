/**
 * Transcript cleaning and normalization
 */

import type { WhisperResponse, WordTimestamp, TranscriptSegment } from './runWhisper';

export interface CleanedTranscript {
  text: string;
  segments: TranscriptSegment[];
  words: WordTimestamp[];
  fillerWordsRemoved: number;
  originalText: string;
}

/**
 * Common filler words to remove
 */
const FILLER_WORDS = new Set([
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically',
  'actually', 'literally', 'so', 'well', 'right', 'okay', 'ok',
  'yeah', 'yep', 'nope', 'hm', 'hmm', 'mhm',
]);

/**
 * Clean transcript by removing filler words, repeated words, and normalizing punctuation
 * 
 * @param response - Raw Whisper response
 * @param options - Cleaning options
 * @returns Cleaned transcript
 */
export function cleanTranscript(
  response: WhisperResponse,
  options: {
    removeFillerWords?: boolean;
    removeRepeatedWords?: boolean;
    normalizePunctuation?: boolean;
    joinBrokenSentences?: boolean;
  } = {}
): CleanedTranscript {
  const {
    removeFillerWords = false,
    removeRepeatedWords = true,
    normalizePunctuation = true,
    joinBrokenSentences = true,
  } = options;

  let words: WordTimestamp[] = [];
  let fillerCount = 0;

  // Extract all words
  for (const segment of response.segments) {
    if (segment.words) {
      words.push(...segment.words);
    }
  }

  // Remove filler words if enabled
  if (removeFillerWords) {
    const filtered: WordTimestamp[] = [];
    for (const word of words) {
      const cleanWord = word.word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
      if (!FILLER_WORDS.has(cleanWord)) {
        filtered.push(word);
      } else {
        fillerCount++;
      }
    }
    words = filtered;
  }

  // Remove repeated words if enabled
  if (removeRepeatedWords) {
    const filtered: WordTimestamp[] = [];
    let prevWord = '';
    for (const word of words) {
      const cleanWord = word.word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
      if (cleanWord !== prevWord || cleanWord.length <= 2) {
        filtered.push(word);
        prevWord = cleanWord;
      }
    }
    words = filtered;
  }

  // Normalize punctuation if enabled
  if (normalizePunctuation) {
    words = words.map(w => ({
      ...w,
      word: w.word.replace(/\s+/g, ' ').trim(),
    }));
  }

  // Reconstruct segments from cleaned words
  const cleanedSegments = reconstructSegments(words, response.segments.length);

  // Join broken sentences if enabled
  let text = cleanedSegments.map(s => s.text).join(' ');
  if (joinBrokenSentences) {
    text = joinBrokenSentences_(text);
  }

  return {
    text,
    segments: cleanedSegments,
    words,
    fillerWordsRemoved: fillerCount,
    originalText: response.text,
  };
}

/**
 * Reconstruct segments from word list
 */
function reconstructSegments(
  words: WordTimestamp[],
  targetSegmentCount: number
): TranscriptSegment[] {
  if (words.length === 0) return [];

  const segments: TranscriptSegment[] = [];
  const wordsPerSegment = Math.ceil(words.length / targetSegmentCount);

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const segmentWords = words.slice(i, i + wordsPerSegment);
    if (segmentWords.length === 0) continue;

    segments.push({
      id: segments.length,
      text: segmentWords.map(w => w.word).join(' '),
      start: segmentWords[0].start,
      end: segmentWords[segmentWords.length - 1].end,
      words: segmentWords,
    });
  }

  return segments;
}

/**
 * Join broken sentences
 */
function joinBrokenSentences_(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.!?])\s+([a-z])/g, '$1 $2')
    .trim();
}

/**
 * Check if a word is a filler word
 */
export function isFillerWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  return FILLER_WORDS.has(clean);
}

/**
 * Count filler words in transcript
 */
export function countFillerWords(words: WordTimestamp[]): number {
  return words.filter(w => isFillerWord(w.word)).length;
}

/**
 * Get transcript with filler words highlighted
 */
export function highlightFillerWords(text: string): string {
  const words = text.split(/\s+/);
  return words
    .map(word => {
      const clean = word.toLowerCase().replace(/[.,!?;:]/g, '');
      return FILLER_WORDS.has(clean) ? `**${word}**` : word;
    })
    .join(' ');
}

/**
 * Remove filler words from word list (returns new array)
 */
export function removeFillerWords(words: WordTimestamp[]): WordTimestamp[] {
  return words.filter(w => !isFillerWord(w.word));
}

/**
 * Calculate transcript statistics
 */
export function calculateTranscriptStats(words: WordTimestamp[]) {
  const totalWords = words.length;
  const fillerWords = countFillerWords(words);
  const duration = words.length > 0 ? words[words.length - 1].end - words[0].start : 0;
  const wordsPerMinute = duration > 0 ? (totalWords / duration) * 60 : 0;

  return {
    totalWords,
    fillerWords,
    fillerPercentage: totalWords > 0 ? (fillerWords / totalWords) * 100 : 0,
    duration,
    wordsPerMinute,
  };
}

