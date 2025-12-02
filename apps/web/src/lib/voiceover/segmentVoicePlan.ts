/**
 * Segment Voice Planning for AI Voiceover
 * Phase 20: AI Voiceover Engine
 * 
 * Maps transcript text to video segments for TTS generation
 */

import type { EnrichedSegment } from "../videoAnalysis";
import type { AlignedTranscript, WordTimestamp } from "../transcription";

export type SegmentVoicePlan = {
  segmentId: string;
  startTime: number;
  endTime: number;
  text: string;
  wordCount: number;
};

/**
 * Build voiceover plan for each segment
 * 
 * For each segment, extracts words from the aligned transcript
 * that fall within the segment's time range
 */
export function buildSegmentVoicePlan(args: {
  segments: EnrichedSegment[];
  transcript: AlignedTranscript[];
}): SegmentVoicePlan[] {
  const { segments, transcript } = args;
  const plans: SegmentVoicePlan[] = [];

  for (const segment of segments) {
    const segmentWords = extractSegmentWords(
      segment.startTime,
      segment.endTime,
      transcript
    );

    const text = segmentWords.map((w) => w.word).join(" ");

    plans.push({
      segmentId: segment.id,
      startTime: segment.startTime,
      endTime: segment.endTime,
      text,
      wordCount: segmentWords.length,
    });
  }

  return plans;
}

/**
 * Extract words from transcript that fall within a time range
 */
function extractSegmentWords(
  startTime: number,
  endTime: number,
  transcript: AlignedTranscript[]
): WordTimestamp[] {
  const words: WordTimestamp[] = [];

  // Search through all segments in aligned transcript
  for (const segmentBlock of transcript) {
    for (const word of segmentBlock.words) {
      // Check if word falls within time range
      // Word is included if its start time is within the segment
      if (word.start >= startTime && word.start < endTime) {
        words.push(word);
      }
      // Also include if word starts before but ends after segment start
      else if (word.start < startTime && word.end > startTime) {
        words.push(word);
      }
    }
  }

  return words;
}

/**
 * Get total word count across all plans
 */
export function getTotalWordCount(plans: SegmentVoicePlan[]): number {
  return plans.reduce((sum, plan) => sum + plan.wordCount, 0);
}

/**
 * Get total duration across all plans
 */
export function getTotalDuration(plans: SegmentVoicePlan[]): number {
  return plans.reduce((sum, plan) => sum + (plan.endTime - plan.startTime), 0);
}

/**
 * Filter out empty or very short segments
 */
export function filterValidPlans(plans: SegmentVoicePlan[]): SegmentVoicePlan[] {
  return plans.filter((plan) => {
    // Must have text
    if (!plan.text || plan.text.trim().length === 0) {
      return false;
    }

    // Must have at least 2 words
    if (plan.wordCount < 2) {
      return false;
    }

    // Must be at least 0.5 seconds
    if (plan.endTime - plan.startTime < 0.5) {
      return false;
    }

    return true;
  });
}

