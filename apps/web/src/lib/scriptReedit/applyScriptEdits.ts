/**
 * Apply Script Edits to Timeline
 * Converts text-based script edits into timeline segment modifications
 * 
 * This module takes diff operations from the script editor and applies them
 * to the video timeline, handling deletions, insertions, replacements, and
 * reordering while maintaining timeline integrity.
 */

import type { ScriptEditOperation, TranscriptWord } from './diffTranscript';

/**
 * Timeline segment type (reusing from TimelineEditor)
 * Contains all metadata from previous phases
 */
export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  label?: string;
  clipId?: string;
  aiLabel?: {
    title: string;
    description: string;
    emotion: string;
    subject: string;
  };
  audioOnly?: boolean;
  aiScore?: number;
  storyRole?: string;
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for applying script edits
 */
export type ApplyScriptEditsOptions = {
  /** Whether to create audio-only segments for insertions/replacements (default: true) */
  enableInsertAudioSegments?: boolean;
  /** Minimum gap in seconds for merging adjacent segments (default: 0.3) */
  minGapSeconds?: number;
};

/**
 * Result of applying script edits to timeline
 */
export interface ScriptReeditResult {
  /** Updated timeline segments after applying edits */
  timeline: TimelineSegment[];
  /** Operations that were successfully applied */
  operationsApplied: ScriptEditOperation[];
  /** Time ranges that were removed from the timeline */
  removedRanges: { start: number; end: number }[];
  /** Audio segments that were inserted */
  insertedRanges: { at: number; duration: number }[];
  /** Time ranges that were replaced */
  replacedRanges: { start: number; end: number }[];
}


// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Apply script edit operations to timeline segments
 * 
 * Takes diff operations from script editing and modifies the video timeline
 * accordingly. Handles deletions (removing time ranges), insertions (adding
 * audio-only segments), replacements (delete + insert), and reordering.
 * 
 * @param originalTimeline - Current timeline segments
 * @param words - Transcript words with timestamps (must match timeline)
 * @param edits - Edit operations from diffTranscript()
 * @param options - Configuration options
 * @returns Result object with updated timeline and metadata
 * 
 * @example
 * ```ts
 * const result = applyScriptEditsToTimeline(
 *   currentTimeline,
 *   transcriptWords,
 *   [{ type: 'delete', fromWordIndex: 5, toWordIndex: 7 }],
 *   { enableInsertAudioSegments: true }
 * );
 * // result.timeline contains updated segments
 * // result.removedRanges shows what was deleted
 * ```
 * 
 * @remarks
 * - Deletions: Removes or trims segments in the specified word range
 * - Insertions: Creates audio-only placeholder segments (for AI narration)
 * - Replacements: Combines deletion + insertion
 * - Reordering: Moves segments to maintain chronological order
 * - Audio duration is estimated at ~0.35 seconds per word
 * - Small gaps between segments are preserved (not automatically merged)
 */
export function applyScriptEditsToTimeline(
  originalTimeline: TimelineSegment[],
  words: TranscriptWord[],
  edits: ScriptEditOperation[],
  options?: ApplyScriptEditsOptions
): ScriptReeditResult {
  // Validate inputs
  if (!originalTimeline || originalTimeline.length === 0) {
    return {
      timeline: [],
      operationsApplied: [],
      removedRanges: [],
      insertedRanges: [],
      replacedRanges: [],
    };
  }
  
  if (!edits || edits.length === 0) {
    return {
      timeline: [...originalTimeline],
      operationsApplied: [],
      removedRanges: [],
      insertedRanges: [],
      replacedRanges: [],
    };
  }
  
  // Set defaults
  const opts: Required<ApplyScriptEditsOptions> = {
    enableInsertAudioSegments: options?.enableInsertAudioSegments ?? true,
    minGapSeconds: options?.minGapSeconds ?? 0.3,
  };
  
  // Track changes
  let currentTimeline = [...originalTimeline];
  const operationsApplied: ScriptEditOperation[] = [];
  const removedRanges: { start: number; end: number }[] = [];
  const insertedRanges: { at: number; duration: number }[] = [];
  const replacedRanges: { start: number; end: number }[] = [];
  
  // Apply each edit operation sequentially
  for (const edit of edits) {
    try {
      switch (edit.type) {
        case 'delete': {
          const result = applyDelete(currentTimeline, words, edit);
          currentTimeline = result.timeline;
          removedRanges.push(...result.removedRanges);
          operationsApplied.push(edit);
          break;
        }
        
        case 'insert': {
          if (opts.enableInsertAudioSegments) {
            const result = applyInsert(currentTimeline, words, edit);
            currentTimeline = result.timeline;
            insertedRanges.push(...result.insertedRanges);
            operationsApplied.push(edit);
          }
          break;
        }
        
        case 'replace': {
          const result = applyReplace(currentTimeline, words, edit, opts);
          currentTimeline = result.timeline;
          removedRanges.push(...result.removedRanges);
          if (opts.enableInsertAudioSegments) {
            insertedRanges.push(...result.insertedRanges);
          }
          replacedRanges.push(...result.replacedRanges);
          operationsApplied.push(edit);
          break;
        }
        
        case 'reorder': {
          const result = applyReorder(currentTimeline, words, edit);
          currentTimeline = result.timeline;
          operationsApplied.push(edit);
          break;
        }
        
        default:
          console.warn('Unknown edit operation type:', edit);
      }
    } catch (error) {
      console.error('Failed to apply edit operation:', edit, error);
      // Continue with remaining operations
    }
  }
  
  // Sort timeline by start time and ensure no overlaps
  currentTimeline = sortAndNormalizeTimeline(currentTimeline);
  
  return {
    timeline: currentTimeline,
    operationsApplied,
    removedRanges,
    insertedRanges,
    replacedRanges,
  };
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Apply a delete operation
 * Removes the time range covered by specified words
 */
function applyDelete(
  timeline: TimelineSegment[],
  words: TranscriptWord[],
  edit: Extract<ScriptEditOperation, { type: 'delete' }>
): {
  timeline: TimelineSegment[];
  removedRanges: { start: number; end: number }[];
} {
  const { fromWordIndex, toWordIndex } = edit;
  
  // Get time range from words
  const timeRange = getWordTimeRange(words, fromWordIndex, toWordIndex);
  if (!timeRange) {
    return { timeline, removedRanges: [] };
  }
  
  const { start, end } = timeRange;
  
  // Remove this time range from all segments
  const newTimeline = removeTimeRangeFromSegments(timeline, start, end);
  
  return {
    timeline: newTimeline,
    removedRanges: [{ start, end }],
  };
}

/**
 * Apply an insert operation
 * Creates an audio-only segment at the insertion point
 */
function applyInsert(
  timeline: TimelineSegment[],
  words: TranscriptWord[],
  edit: Extract<ScriptEditOperation, { type: 'insert' }>
): {
  timeline: TimelineSegment[];
  insertedRanges: { at: number; duration: number }[];
} {
  const { atWordIndex, text } = edit;
  
  // Determine insertion time
  let insertTime: number;
  if (atWordIndex >= words.length) {
    // Insert at end
    const lastWord = words[words.length - 1];
    insertTime = lastWord ? lastWord.end : 0;
  } else if (atWordIndex === 0) {
    // Insert at beginning
    insertTime = 0;
  } else {
    // Insert between words
    const prevWord = words[atWordIndex - 1];
    insertTime = prevWord ? prevWord.end : 0;
  }
  
  // Estimate duration
  const duration = estimateDuration(text);
  
  // Create audio-only segment
  const audioSegment = createAudioSegment(
    insertTime,
    insertTime + duration,
    text,
    `script-insert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  
  // Insert into timeline
  const newTimeline = [...timeline, audioSegment];
  
  return {
    timeline: newTimeline,
    insertedRanges: [{ at: insertTime, duration }],
  };
}

/**
 * Apply a replace operation
 * Deletes original words and inserts new audio segment
 */
function applyReplace(
  timeline: TimelineSegment[],
  words: TranscriptWord[],
  edit: Extract<ScriptEditOperation, { type: 'replace' }>,
  options: Required<ApplyScriptEditsOptions>
): {
  timeline: TimelineSegment[];
  removedRanges: { start: number; end: number }[];
  insertedRanges: { at: number; duration: number }[];
  replacedRanges: { start: number; end: number }[];
} {
  const { fromWordIndex, toWordIndex, text } = edit;
  
  // Get time range to replace
  const timeRange = getWordTimeRange(words, fromWordIndex, toWordIndex);
  if (!timeRange) {
    return {
      timeline,
      removedRanges: [],
      insertedRanges: [],
      replacedRanges: [],
    };
  }
  
  const { start, end } = timeRange;
  
  // Remove original range
  let newTimeline = removeTimeRangeFromSegments(timeline, start, end);
  
  // Create replacement audio segment
  const insertedRanges: { at: number; duration: number }[] = [];
  if (options.enableInsertAudioSegments) {
    const duration = estimateDuration(text);
    const audioSegment = createAudioSegment(
      start,
      start + duration,
      text,
      `script-replace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
    newTimeline = [...newTimeline, audioSegment];
    insertedRanges.push({ at: start, duration });
  }
  
  return {
    timeline: newTimeline,
    removedRanges: [{ start, end }],
    insertedRanges,
    replacedRanges: [{ start, end }],
  };
}

/**
 * Apply a reorder operation
 * Moves segments to a new position in the timeline
 */
function applyReorder(
  timeline: TimelineSegment[],
  words: TranscriptWord[],
  edit: Extract<ScriptEditOperation, { type: 'reorder' }>
): {
  timeline: TimelineSegment[];
} {
  const { fromWordIndex, toWordIndex, targetIndex } = edit;
  
  // Get time range to move
  const moveRange = getWordTimeRange(words, fromWordIndex, toWordIndex);
  const targetRange = getWordTimeRange(words, targetIndex, targetIndex);
  
  if (!moveRange || !targetRange) {
    return { timeline };
  }
  
  // Find segments in the move range
  const segmentsToMove = timeline.filter(
    seg => seg.startTime >= moveRange.start && seg.endTime <= moveRange.end
  );
  
  // Remove them from original position
  let newTimeline = timeline.filter(
    seg => seg.startTime < moveRange.start || seg.endTime > moveRange.end
  );
  
  // Calculate time shift
  const timeShift = targetRange.start - moveRange.start;
  
  // Shift moved segments
  const shiftedSegments = segmentsToMove.map(seg => ({
    ...seg,
    startTime: seg.startTime + timeShift,
    endTime: seg.endTime + timeShift,
  }));
  
  // Add back to timeline
  newTimeline = [...newTimeline, ...shiftedSegments];
  
  return { timeline: newTimeline };
}

/**
 * Get time range covered by a span of words
 */
function getWordTimeRange(
  words: TranscriptWord[],
  fromIndex: number,
  toIndex: number
): { start: number; end: number } | null {
  if (fromIndex < 0 || toIndex >= words.length || fromIndex > toIndex) {
    return null;
  }
  
  const firstWord = words[fromIndex];
  const lastWord = words[toIndex];
  
  if (!firstWord || !lastWord) {
    return null;
  }
  
  return {
    start: firstWord.start,
    end: lastWord.end,
  };
}

/**
 * Remove a time range from timeline segments
 * Handles trimming and splitting segments as needed
 */
function removeTimeRangeFromSegments(
  segments: TimelineSegment[],
  removeStart: number,
  removeEnd: number
): TimelineSegment[] {
  const result: TimelineSegment[] = [];
  
  for (const segment of segments) {
    const segStart = segment.startTime;
    const segEnd = segment.endTime;
    
    // Segment is completely before removal range - keep as is
    if (segEnd <= removeStart) {
      result.push(segment);
      continue;
    }
    
    // Segment is completely after removal range - keep as is
    if (segStart >= removeEnd) {
      result.push(segment);
      continue;
    }
    
    // Segment is completely within removal range - remove it
    if (segStart >= removeStart && segEnd <= removeEnd) {
      continue; // Skip this segment
    }
    
    // Segment partially overlaps - split/trim
    
    // Case 1: Removal range is in the middle - split into two
    if (segStart < removeStart && segEnd > removeEnd) {
      // Before part
      result.push({
        ...segment,
        id: `${segment.id}-before`,
        endTime: removeStart,
      });
      
      // After part
      result.push({
        ...segment,
        id: `${segment.id}-after`,
        startTime: removeEnd,
      });
    }
    // Case 2: Removal cuts off the end
    else if (segStart < removeStart && segEnd > removeStart) {
      result.push({
        ...segment,
        endTime: removeStart,
      });
    }
    // Case 3: Removal cuts off the beginning
    else if (segStart < removeEnd && segEnd > removeEnd) {
      result.push({
        ...segment,
        startTime: removeEnd,
      });
    }
  }
  
  return result;
}

/**
 * Create an audio-only segment for AI narration
 */
function createAudioSegment(
  start: number,
  end: number,
  text: string,
  id: string
): TimelineSegment {
  return {
    id,
    startTime: start,
    endTime: end,
    label: 'AI Re-narration',
    aiLabel: {
      title: 'AI Narration',
      description: text.slice(0, 100), // First 100 chars
      emotion: 'neutral',
      subject: 'voiceover',
    },
  };
}

/**
 * Estimate speech duration in seconds
 * Assumes ~170 words per minute (0.35 seconds per word)
 * Adds small padding for natural pauses
 */
function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount === 0) return 0.5; // Minimum duration
  
  // Average speaking rate: ~170 words per minute = 0.35 seconds per word
  const baseDuration = wordCount * 0.35;
  
  // Add small padding for natural pauses (10%)
  const paddedDuration = baseDuration * 1.1;
  
  return Math.max(0.5, paddedDuration);
}

/**
 * Sort timeline by start time and fix any overlaps
 */
function sortAndNormalizeTimeline(
  segments: TimelineSegment[]
): TimelineSegment[] {
  // Sort by start time
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  
  // Fix overlaps by trimming
  const normalized: TimelineSegment[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    
    // If current segment overlaps with next, trim current
    if (next && current.endTime > next.startTime) {
      normalized.push({
        ...current,
        endTime: next.startTime,
      });
    } else {
      normalized.push(current);
    }
  }
  
  // Filter out invalid segments (end <= start)
  return normalized.filter(seg => seg.endTime > seg.startTime);
}

