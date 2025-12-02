/**
 * Storyline Builder
 * Constructs narrative arcs from classified segments
 */

import type { ClassifiedSegment, StoryArchetype } from './storyArchetypeClassifier';

export interface StoryStructure {
  hook?: ClassifiedSegment;
  intro?: ClassifiedSegment;
  risingAction: ClassifiedSegment[];
  mainMoment?: ClassifiedSegment;
  reaction?: ClassifiedSegment;
  outro?: ClassifiedSegment;
}

export interface StorylineResult {
  segments: ClassifiedSegment[];
  structure: StoryStructure;
  totalDuration: number;
  archetypeFlow: string[];
  stats: {
    hookPresent: boolean;
    introPresent: boolean;
    climaxPresent: boolean;
    outroPresent: boolean;
    risingActionCount: number;
    avgConfidence: number;
    avgStoryScore: number;
  };
}

/**
 * Find best segment for a specific archetype
 */
function findBestSegment(
  segments: ClassifiedSegment[],
  archetype: StoryArchetype,
  excludeIds: Set<string>
): ClassifiedSegment | undefined {
  const candidates = segments
    .filter(s => s.archetype === archetype && !excludeIds.has(s.id))
    .sort((a, b) => {
      // Sort by confidence first, then story score
      if (Math.abs(a.archetypeConfidence - b.archetypeConfidence) > 0.1) {
        return b.archetypeConfidence - a.archetypeConfidence;
      }
      return b.storyScore - a.storyScore;
    });

  return candidates[0];
}

/**
 * Find best segments for rising action (tension/setup/action)
 */
function findRisingActionSegments(
  segments: ClassifiedSegment[],
  excludeIds: Set<string>,
  maxCount: number = 2,
  remainingDuration: number
): ClassifiedSegment[] {
  const risingActionTypes: StoryArchetype[] = ['tension', 'setup', 'action'];
  const candidates = segments
    .filter(s => risingActionTypes.includes(s.archetype) && !excludeIds.has(s.id))
    .sort((a, b) => b.storyScore - a.storyScore);

  const selected: ClassifiedSegment[] = [];
  let duration = 0;

  for (const segment of candidates) {
    if (selected.length >= maxCount) break;
    
    const segmentDuration = segment.endTime - segment.startTime;
    if (duration + segmentDuration > remainingDuration) continue;
    
    selected.push(segment);
    duration += segmentDuration;
    excludeIds.add(segment.id);
  }

  return selected;
}

/**
 * Build a storyline from classified segments
 * 
 * @param segments - Classified segments
 * @param targetDuration - Target duration in seconds (default: 60)
 * @param options - Additional options
 * @returns Storyline with narrative structure
 */
export function buildStoryline(
  segments: ClassifiedSegment[],
  targetDuration: number = 60,
  options: {
    minDuration?: number;
    maxDuration?: number;
    requireHook?: boolean;
    requireOutro?: boolean;
    allowFlexibleStructure?: boolean;
  } = {}
): StorylineResult {
  const {
    minDuration = 45,
    maxDuration = 120,
    requireHook = false,
    requireOutro = false,
    allowFlexibleStructure = true,
  } = options;

  const selected: ClassifiedSegment[] = [];
  const excludeIds = new Set<string>();
  const structure: StoryStructure = {
    risingAction: [],
  };

  let totalDuration = 0;

  // 1. Find Hook (if available or required)
  const hook = findBestSegment(segments, 'hook', excludeIds);
  if (hook) {
    structure.hook = hook;
    selected.push(hook);
    excludeIds.add(hook.id);
    totalDuration += hook.endTime - hook.startTime;
  } else if (requireHook) {
    // If hook required but not found, use intro as hook
    const intro = findBestSegment(segments, 'intro', excludeIds);
    if (intro) {
      structure.hook = intro;
      selected.push(intro);
      excludeIds.add(intro.id);
      totalDuration += intro.endTime - intro.startTime;
    }
  }

  // 2. Find Introduction (if not used as hook)
  if (!structure.hook || structure.hook.archetype !== 'intro') {
    const intro = findBestSegment(segments, 'intro', excludeIds);
    if (intro) {
      structure.intro = intro;
      selected.push(intro);
      excludeIds.add(intro.id);
      totalDuration += intro.endTime - intro.startTime;
    }
  }

  // 3. Reserve space for main moment and outro
  const mainMomentCandidate = findBestSegment(segments, 'action', excludeIds);
  const outroCandidate = findBestSegment(segments, 'outro', excludeIds);
  
  let reservedDuration = 0;
  if (mainMomentCandidate) {
    reservedDuration += mainMomentCandidate.endTime - mainMomentCandidate.startTime;
  }
  if (outroCandidate && (requireOutro || totalDuration + reservedDuration < targetDuration * 0.7)) {
    reservedDuration += outroCandidate.endTime - outroCandidate.startTime;
  }

  // 4. Add Rising Action segments
  const remainingForRising = Math.max(
    targetDuration - totalDuration - reservedDuration,
    minDuration * 0.3
  );
  
  const risingCount = totalDuration < targetDuration * 0.3 ? 2 : 1;
  const risingSegments = findRisingActionSegments(
    segments,
    excludeIds,
    risingCount,
    remainingForRising
  );
  
  structure.risingAction = risingSegments;
  for (const segment of risingSegments) {
    selected.push(segment);
    totalDuration += segment.endTime - segment.startTime;
  }

  // 5. Add Main Moment (climax)
  if (mainMomentCandidate && totalDuration < maxDuration) {
    structure.mainMoment = mainMomentCandidate;
    selected.push(mainMomentCandidate);
    excludeIds.add(mainMomentCandidate.id);
    totalDuration += mainMomentCandidate.endTime - mainMomentCandidate.startTime;
  }

  // 6. Add Reaction (if we have room and it exists)
  if (totalDuration < targetDuration * 0.85) {
    const reaction = findBestSegment(segments, 'reaction', excludeIds);
    if (reaction) {
      const reactionDuration = reaction.endTime - reaction.startTime;
      if (totalDuration + reactionDuration <= maxDuration) {
        structure.reaction = reaction;
        selected.push(reaction);
        excludeIds.add(reaction.id);
        totalDuration += reactionDuration;
      }
    }
  }

  // 7. Add Resolution if close to target but no outro yet
  if (!structure.outro && totalDuration >= minDuration && totalDuration < targetDuration) {
    const resolution = findBestSegment(segments, 'resolution', excludeIds);
    if (resolution) {
      const resolutionDuration = resolution.endTime - resolution.startTime;
      if (totalDuration + resolutionDuration <= maxDuration) {
        selected.push(resolution);
        excludeIds.add(resolution.id);
        totalDuration += resolutionDuration;
      }
    }
  }

  // 8. Add Outro (if available and we're within range)
  if (outroCandidate && (requireOutro || totalDuration >= minDuration)) {
    const outroDuration = outroCandidate.endTime - outroCandidate.startTime;
    if (totalDuration + outroDuration <= maxDuration) {
      structure.outro = outroCandidate;
      selected.push(outroCandidate);
      totalDuration += outroDuration;
    }
  }

  // 9. If we're under min duration and flexible structure allowed, add more segments
  if (allowFlexibleStructure && totalDuration < minDuration) {
    const remaining = segments
      .filter(s => !excludeIds.has(s.id))
      .sort((a, b) => b.storyScore - a.storyScore);

    for (const segment of remaining) {
      if (totalDuration >= minDuration) break;
      
      const segmentDuration = segment.endTime - segment.startTime;
      if (totalDuration + segmentDuration <= maxDuration) {
        selected.push(segment);
        totalDuration += segmentDuration;
      }
    }
  }

  // Sort selected segments by original timeline order
  const sortedSegments = selected.sort((a, b) => a.startTime - b.startTime);

  // Calculate stats
  const avgConfidence = sortedSegments.reduce((sum, s) => sum + s.archetypeConfidence, 0) / sortedSegments.length;
  const avgStoryScore = sortedSegments.reduce((sum, s) => sum + s.storyScore, 0) / sortedSegments.length;
  
  const archetypeFlow = sortedSegments.map(s => s.archetype);

  return {
    segments: sortedSegments,
    structure,
    totalDuration,
    archetypeFlow,
    stats: {
      hookPresent: !!structure.hook,
      introPresent: !!structure.intro,
      climaxPresent: !!structure.mainMoment,
      outroPresent: !!structure.outro,
      risingActionCount: structure.risingAction.length,
      avgConfidence,
      avgStoryScore,
    },
  };
}

/**
 * Generate a story flow description
 */
export function generateStoryFlowDescription(result: StorylineResult): string {
  const parts: string[] = [];

  if (result.structure.hook) parts.push('Hook');
  if (result.structure.intro) parts.push('Intro');
  if (result.structure.risingAction.length > 0) {
    parts.push(result.structure.risingAction.length === 1 ? 'Rising Action' : 'Rising Action (×2)');
  }
  if (result.structure.mainMoment) parts.push('Main Moment');
  if (result.structure.reaction) parts.push('Reaction');
  if (result.structure.outro) parts.push('Outro');

  return parts.join(' → ');
}

/**
 * Validate storyline quality
 */
export function validateStoryline(result: StorylineResult): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check duration
  if (result.totalDuration < 45) {
    issues.push('Storyline too short (< 45s)');
    suggestions.push('Try increasing target duration or use Smart Cut instead');
  }

  // Check structure completeness
  if (!result.stats.hookPresent && !result.stats.introPresent) {
    issues.push('No hook or intro found');
    suggestions.push('Video may lack a strong opening');
  }

  if (!result.stats.climaxPresent) {
    issues.push('No main moment/climax found');
    suggestions.push('Video may lack a central event');
  }

  if (!result.stats.outroPresent) {
    suggestions.push('Consider adding a closing segment manually');
  }

  // Check confidence
  if (result.stats.avgConfidence < 0.4) {
    suggestions.push('Low classification confidence - manual review recommended');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

