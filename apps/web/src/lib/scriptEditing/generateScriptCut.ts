/**
 * Script Cut Engine
 * Generate timeline from text-based editing
 */

import type { WordTimestamp } from '@/lib/transcription';
import type { EnrichedSegment } from '@/lib/videoAnalysis';

export interface TextSelection {
  startWordIndex: number;
  endWordIndex: number;
  startTime: number;
  endTime: number;
}

export interface ScriptCutSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  wordCount: number;
  originalSegmentId?: string;
}

/**
 * Generate timeline segments from text selections
 * 
 * @param words - All transcript words with timestamps
 * @param selections - Text ranges to KEEP (not remove)
 * @param originalSegments - Original video segments for metadata
 * @returns New timeline segments based on text selections
 */
export function generateScriptCutFromSelections(
  words: WordTimestamp[],
  selections: TextSelection[],
  originalSegments: EnrichedSegment[]
): ScriptCutSegment[] {
  if (selections.length === 0) {
    return [];
  }

  // Sort selections by time
  const sortedSelections = [...selections].sort((a, b) => a.startTime - b.startTime);

  const segments: ScriptCutSegment[] = [];

  for (const selection of sortedSelections) {
    const selectionWords = words.slice(selection.startWordIndex, selection.endWordIndex + 1);
    
    if (selectionWords.length === 0) continue;

    const startTime = selectionWords[0].start;
    const endTime = selectionWords[selectionWords.length - 1].end;
    const duration = endTime - startTime;

    // Skip segments that are too short
    if (duration < 0.5) continue;

    // Find original segment this belongs to
    const originalSegment = originalSegments.find(
      seg => startTime >= seg.startTime && endTime <= seg.endTime
    );

    segments.push({
      id: `script-cut-${segments.length}`,
      startTime,
      endTime,
      duration,
      text: selectionWords.map(w => w.word).join(' '),
      wordCount: selectionWords.length,
      originalSegmentId: originalSegment?.id,
    });
  }

  // Merge segments with small gaps (< 300ms)
  return mergeCloseSegments(segments, 0.3);
}

/**
 * Generate Script Cut from inverse selection (remove selected text)
 * 
 * @param words - All transcript words
 * @param removedRanges - Text ranges to REMOVE
 * @param originalSegments - Original segments
 * @returns Timeline with removed text excluded
 */
export function generateScriptCutByRemoval(
  words: WordTimestamp[],
  removedRanges: TextSelection[],
  originalSegments: EnrichedSegment[]
): ScriptCutSegment[] {
  if (words.length === 0) return [];

  // Create keep ranges (inverse of removed ranges)
  const keepRanges: TextSelection[] = [];
  let currentStart = 0;

  // Sort removed ranges by start
  const sortedRemoved = [...removedRanges].sort((a, b) => a.startWordIndex - b.startWordIndex);

  for (const removed of sortedRemoved) {
    if (currentStart < removed.startWordIndex) {
      // Keep range before this removal
      keepRanges.push({
        startWordIndex: currentStart,
        endWordIndex: removed.startWordIndex - 1,
        startTime: words[currentStart].start,
        endTime: words[removed.startWordIndex - 1].end,
      });
    }
    currentStart = removed.endWordIndex + 1;
  }

  // Keep remaining words after last removal
  if (currentStart < words.length) {
    keepRanges.push({
      startWordIndex: currentStart,
      endWordIndex: words.length - 1,
      startTime: words[currentStart].start,
      endTime: words[words.length - 1].end,
    });
  }

  return generateScriptCutFromSelections(words, keepRanges, originalSegments);
}

/**
 * Merge segments that are very close together
 */
function mergeCloseSegments(
  segments: ScriptCutSegment[],
  maxGapSeconds: number
): ScriptCutSegment[] {
  if (segments.length <= 1) return segments;

  const merged: ScriptCutSegment[] = [];
  let current = segments[0];

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i];
    const gap = next.startTime - current.endTime;

    if (gap <= maxGapSeconds) {
      // Merge with current
      current = {
        ...current,
        endTime: next.endTime,
        duration: next.endTime - current.startTime,
        text: `${current.text} ${next.text}`,
        wordCount: current.wordCount + next.wordCount,
      };
    } else {
      // Save current and move to next
      merged.push(current);
      current = next;
    }
  }

  // Add last segment
  merged.push(current);

  return merged;
}

/**
 * Calculate stats for Script Cut
 */
export function calculateScriptCutStats(segments: ScriptCutSegment[]) {
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  const totalWords = segments.reduce((sum, s) => sum + s.wordCount, 0);
  const avgWordsPerMinute = totalDuration > 0 ? (totalWords / totalDuration) * 60 : 0;

  return {
    segmentCount: segments.length,
    totalDuration,
    totalWords,
    avgWordsPerMinute,
    avgSegmentDuration: totalDuration / segments.length,
  };
}

