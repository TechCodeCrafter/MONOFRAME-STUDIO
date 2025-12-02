/**
 * Align transcript to video segments
 */

import type { EnrichedSegment } from '@/lib/videoAnalysis';
import type { WordTimestamp } from './runWhisper';

export interface AlignedTranscript {
  segmentId: string;
  startTime: number;
  endTime: number;
  text: string;
  words: WordTimestamp[];
  wordCount: number;
}

/**
 * Align transcript words to video segments
 */
export function alignTranscriptToSegments(
  words: WordTimestamp[],
  segments: EnrichedSegment[]
): AlignedTranscript[] {
  const aligned: AlignedTranscript[] = [];

  for (const segment of segments) {
    // Find all words that fall within this segment's time range
    const segmentWords = words.filter(
      w => w.start >= segment.startTime && w.end <= segment.endTime
    );

    if (segmentWords.length > 0) {
      aligned.push({
        segmentId: segment.id,
        startTime: segment.startTime,
        endTime: segment.endTime,
        text: segmentWords.map(w => w.word).join(' '),
        words: segmentWords,
        wordCount: segmentWords.length,
      });
    }
  }

  return aligned;
}

/**
 * Build keyword index for fast searching
 */
export function buildKeywordIndex(words: WordTimestamp[]): Map<string, number[]> {
  const index = new Map<string, number[]>();

  words.forEach((word, idx) => {
    const clean = word.word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length < 2) return;

    if (!index.has(clean)) {
      index.set(clean, []);
    }
    index.get(clean)!.push(idx);
  });

  return index;
}

