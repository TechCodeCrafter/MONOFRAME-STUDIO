/**
 * Auto-scoring for "Smart Cut" feature
 * Scores segments based on audio + scene intelligence
 */

import type { EnrichedSegment } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';

export interface ScoredSegment extends EnrichedSegment {
  autoScore: number;
  scoreBreakdown?: {
    speech: number;
    energy: number;
    peakiness: number;
    subject: number;
    emotion: number;
    silence: number;
    duration: number;
    total: number;
  };
}

/**
 * Emotions that indicate high-interest content
 */
const HIGH_INTEREST_EMOTIONS = ['excited', 'tense', 'happy', 'energetic', 'dramatic'];

/**
 * Ideal duration range for short-form content (seconds)
 */
const IDEAL_MIN_DURATION = 4;
const IDEAL_MAX_DURATION = 18;

/**
 * Score a single segment based on AI analysis
 * Returns a normalized score between 0 and 1
 * 
 * @param segment - Enriched segment with AI labels
 * @param audioAnalysis - Audio intelligence for the segment
 * @returns Scored segment with autoScore property
 */
export function scoreSegment(
  segment: EnrichedSegment,
  audioAnalysis?: SegmentAudioIntelligence
): ScoredSegment {
  let score = 0;
  const breakdown = {
    speech: 0,
    energy: 0,
    peakiness: 0,
    subject: 0,
    emotion: 0,
    silence: 0,
    duration: 0,
    total: 0,
  };

  const duration = segment.endTime - segment.startTime;

  // 1. Speech Probability (40% weight)
  if (audioAnalysis) {
    const speechScore = audioAnalysis.speechProbability * 0.4;
    score += speechScore;
    breakdown.speech = speechScore;
  }

  // 2. Energy Level (20% weight)
  if (audioAnalysis) {
    const energyScore = audioAnalysis.energyLevel * 0.2;
    score += energyScore;
    breakdown.energy = energyScore;
  }

  // 3. Peakiness (10% weight)
  if (audioAnalysis) {
    const peakinessScore = audioAnalysis.peakiness * 0.1;
    score += peakinessScore;
    breakdown.peakiness = peakinessScore;
  }

  // 4. Subject Type (10% bonus if person)
  if (segment.aiLabel?.subject) {
    const subjectLower = segment.aiLabel.subject.toLowerCase();
    if (subjectLower.includes('person') || subjectLower.includes('people') || subjectLower.includes('human')) {
      score += 0.1;
      breakdown.subject = 0.1;
    }
  }

  // 5. Emotion (10% bonus for high-interest emotions)
  if (segment.aiLabel?.emotion) {
    const emotionLower = segment.aiLabel.emotion.toLowerCase();
    const isHighInterest = HIGH_INTEREST_EMOTIONS.some(e => emotionLower.includes(e));
    if (isHighInterest) {
      score += 0.1;
      breakdown.emotion = 0.1;
    }
  }

  // 6. Silence Penalty (-10% based on silence ratio)
  if (audioAnalysis && audioAnalysis.silences.length > 0) {
    const totalSilence = audioAnalysis.silences.reduce((sum, s) => sum + s.duration, 0);
    const silenceRatio = totalSilence / duration;
    const silencePenalty = -0.1 * silenceRatio;
    score += silencePenalty;
    breakdown.silence = silencePenalty;
  }

  // 7. Duration Bonus (10% if in ideal range)
  if (duration >= IDEAL_MIN_DURATION && duration <= IDEAL_MAX_DURATION) {
    score += 0.1;
    breakdown.duration = 0.1;
  } else if (duration < IDEAL_MIN_DURATION) {
    // Penalty for too short
    const shortPenalty = -0.05 * (1 - duration / IDEAL_MIN_DURATION);
    score += shortPenalty;
    breakdown.duration = shortPenalty;
  } else if (duration > IDEAL_MAX_DURATION) {
    // Penalty for too long
    const longPenalty = -0.05 * Math.min((duration - IDEAL_MAX_DURATION) / IDEAL_MAX_DURATION, 1);
    score += longPenalty;
    breakdown.duration = longPenalty;
  }

  // Clamp score between 0 and 1
  score = Math.max(0, Math.min(1, score));
  breakdown.total = score;

  return {
    ...segment,
    autoScore: score,
    scoreBreakdown: breakdown,
  };
}

/**
 * Score all segments in a list
 * 
 * @param segments - List of enriched segments
 * @param audioAnalysisList - List of audio intelligence data
 * @returns List of scored segments
 */
export function scoreAllSegments(
  segments: EnrichedSegment[],
  audioAnalysisList: SegmentAudioIntelligence[]
): ScoredSegment[] {
  return segments.map(segment => {
    const audioAnalysis = audioAnalysisList.find(a => a.segmentId === segment.id);
    return scoreSegment(segment, audioAnalysis);
  });
}

/**
 * Generate a "Smart Edit" by selecting top-scoring segments
 * 
 * @param segments - List of enriched segments
 * @param audioAnalysisList - List of audio intelligence data
 * @param targetDuration - Target duration in seconds (default: 60)
 * @param options - Additional options
 * @returns Selected segments sorted by timeline order
 */
export function generateSmartEdit(
  segments: EnrichedSegment[],
  audioAnalysisList: SegmentAudioIntelligence[],
  targetDuration: number = 60,
  options: {
    minSegments?: number; // Minimum segments to include
    maxSegments?: number; // Maximum segments to include
    allowPartial?: boolean; // Allow going over target by one segment
  } = {}
): ScoredSegment[] {
  const { minSegments = 3, maxSegments = 15, allowPartial = true } = options;

  // Score all segments
  const scoredSegments = scoreAllSegments(segments, audioAnalysisList);

  // Sort by score (descending)
  const sortedByScore = [...scoredSegments].sort((a, b) => b.autoScore - a.autoScore);

  // Select segments until we hit target duration
  const selected: ScoredSegment[] = [];
  let totalDuration = 0;

  for (const segment of sortedByScore) {
    const segmentDuration = segment.endTime - segment.startTime;
    
    // Check if we've hit max segments
    if (selected.length >= maxSegments) {
      break;
    }

    // Check if adding this segment would exceed target
    if (totalDuration + segmentDuration > targetDuration && selected.length >= minSegments) {
      // If allowPartial is true and we're within 20% of target, add it anyway
      if (allowPartial && totalDuration + segmentDuration <= targetDuration * 1.2) {
        selected.push(segment);
        totalDuration += segmentDuration;
      }
      break;
    }

    selected.push(segment);
    totalDuration += segmentDuration;

    // If we've reached target and minimum, we can stop
    if (totalDuration >= targetDuration && selected.length >= minSegments) {
      break;
    }
  }

  // Ensure minimum segments
  if (selected.length < minSegments) {
    for (let i = selected.length; i < minSegments && i < sortedByScore.length; i++) {
      const segment = sortedByScore[i];
      if (!selected.includes(segment)) {
        selected.push(segment);
      }
    }
  }

  // Sort by timeline order (start time)
  return selected.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Calculate statistics for a Smart Edit
 */
export function calculateSmartEditStats(segments: ScoredSegment[]) {
  const totalDuration = segments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const avgScore = segments.reduce((sum, s) => sum + s.autoScore, 0) / segments.length;
  const highScoreSegments = segments.filter(s => s.autoScore >= 0.7).length;

  return {
    segmentCount: segments.length,
    totalDuration,
    avgScore,
    highScoreSegments,
    avgDuration: totalDuration / segments.length,
  };
}

