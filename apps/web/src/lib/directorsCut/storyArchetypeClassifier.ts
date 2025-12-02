/**
 * Story Archetype Classifier
 * Classifies video segments into narrative archetypes for Director's Cut
 */

import type { EnrichedSegment } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';

export type StoryArchetype = 
  | 'hook'        // Opening moment that grabs attention
  | 'intro'       // Introduction/setup of characters/context
  | 'setup'       // Establishing the situation
  | 'tension'     // Building conflict or anticipation
  | 'action'      // Main action/event
  | 'reaction'    // Response to main event
  | 'resolution'  // Conclusion/outcome
  | 'outro';      // Closing/final message

export interface ClassifiedSegment extends EnrichedSegment {
  archetype: StoryArchetype;
  archetypeConfidence: number; // 0-1
  storyScore: number; // Combined story + quality score
}

/**
 * Keywords associated with each archetype
 */
const ARCHETYPE_KEYWORDS = {
  hook: [
    'surprise', 'shocking', 'unexpected', 'wow', 'attention', 'striking',
    'dramatic', 'opening', 'first', 'begin', 'start', 'explosive'
  ],
  intro: [
    'introduction', 'meet', 'hello', 'welcome', 'greeting', 'name',
    'character', 'person', 'who', 'introducing', 'present'
  ],
  setup: [
    'setup', 'context', 'background', 'explain', 'setting', 'establish',
    'situation', 'scenario', 'environment', 'where', 'when', 'preparing'
  ],
  tension: [
    'tension', 'conflict', 'problem', 'challenge', 'difficult', 'struggle',
    'suspense', 'anticipation', 'building', 'rising', 'worried', 'uncertain'
  ],
  action: [
    'action', 'doing', 'perform', 'execute', 'happen', 'event', 'moment',
    'peak', 'climax', 'intense', 'fast', 'moving', 'dynamic', 'active'
  ],
  reaction: [
    'reaction', 'response', 'feel', 'emotion', 'surprise', 'shock',
    'realization', 'discover', 'understand', 'gasp', 'face', 'expression'
  ],
  resolution: [
    'resolution', 'solve', 'conclude', 'result', 'outcome', 'answer',
    'finish', 'complete', 'success', 'achievement', 'end', 'final'
  ],
  outro: [
    'outro', 'goodbye', 'farewell', 'thank', 'closing', 'end', 'final',
    'conclusion', 'summary', 'recap', 'takeaway', 'remember', 'call to action'
  ],
};

/**
 * Emotion patterns for each archetype
 */
const ARCHETYPE_EMOTIONS = {
  hook: ['excited', 'shocked', 'surprised', 'dramatic', 'intense'],
  intro: ['calm', 'happy', 'friendly', 'welcoming', 'pleasant'],
  setup: ['calm', 'neutral', 'contemplative', 'focused', 'serious'],
  tension: ['tense', 'anxious', 'worried', 'uncertain', 'suspenseful'],
  action: ['excited', 'energetic', 'intense', 'dramatic', 'dynamic'],
  reaction: ['surprised', 'shocked', 'emotional', 'relieved', 'amazed'],
  resolution: ['happy', 'satisfied', 'relieved', 'accomplished', 'peaceful'],
  outro: ['calm', 'satisfied', 'grateful', 'reflective', 'conclusive'],
};

/**
 * Calculate keyword match score for text
 */
function calculateKeywordScore(text: string, keywords: string[]): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  let matches = 0;
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      matches++;
    }
  }
  
  return Math.min(matches / keywords.length, 1);
}

/**
 * Calculate emotion match score
 */
function calculateEmotionScore(emotion: string | undefined, targetEmotions: string[]): number {
  if (!emotion) return 0;
  
  const lowerEmotion = emotion.toLowerCase();
  for (const targetEmotion of targetEmotions) {
    if (lowerEmotion.includes(targetEmotion)) {
      return 1;
    }
  }
  
  return 0;
}

/**
 * Classify segment into story archetype using heuristics
 * This is the fallback when GPT is not available
 */
function classifyWithHeuristics(
  segment: EnrichedSegment,
  audioAnalysis?: SegmentAudioIntelligence,
  segmentIndex?: number,
  totalSegments?: number
): { archetype: StoryArchetype; confidence: number } {
  const scores: Record<StoryArchetype, number> = {
    hook: 0,
    intro: 0,
    setup: 0,
    tension: 0,
    action: 0,
    reaction: 0,
    resolution: 0,
    outro: 0,
  };

  const title = segment.aiLabel?.title || '';
  const description = segment.aiLabel?.description || '';
  const emotion = segment.aiLabel?.emotion;
  const subject = segment.aiLabel?.subject;
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Keyword matching (40% weight)
  for (const [archetype, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    const keywordScore = calculateKeywordScore(combinedText, keywords);
    scores[archetype as StoryArchetype] += keywordScore * 0.4;
  }

  // 2. Emotion matching (20% weight)
  if (emotion) {
    for (const [archetype, emotions] of Object.entries(ARCHETYPE_EMOTIONS)) {
      const emotionScore = calculateEmotionScore(emotion, emotions);
      scores[archetype as StoryArchetype] += emotionScore * 0.2;
    }
  }

  // 3. Audio characteristics (20% weight)
  if (audioAnalysis) {
    // Hook: high energy + high peakiness
    scores.hook += (audioAnalysis.energyLevel * 0.5 + audioAnalysis.peakiness * 0.5) * 0.2;
    
    // Intro: high speech + moderate energy
    scores.intro += (audioAnalysis.speechProbability * 0.7 + audioAnalysis.energyLevel * 0.3) * 0.2;
    
    // Action: high energy + high peakiness
    scores.action += (audioAnalysis.energyLevel * 0.6 + audioAnalysis.peakiness * 0.4) * 0.2;
    
    // Tension: moderate all
    const tensionScore = (audioAnalysis.energyLevel * 0.5 + audioAnalysis.peakiness * 0.5);
    scores.tension += tensionScore * 0.2;
    
    // Reaction: high speech
    scores.reaction += audioAnalysis.speechProbability * 0.2;
    
    // Outro: high speech + lower energy
    scores.outro += (audioAnalysis.speechProbability * 0.6 + (1 - audioAnalysis.energyLevel) * 0.4) * 0.2;
  }

  // 4. Position in timeline (20% weight)
  if (segmentIndex !== undefined && totalSegments !== undefined) {
    const position = segmentIndex / Math.max(totalSegments - 1, 1);
    
    // First 20% → hook or intro
    if (position < 0.2) {
      scores.hook += 0.15;
      scores.intro += 0.15;
    }
    // 20-40% → setup or tension
    else if (position < 0.4) {
      scores.setup += 0.15;
      scores.tension += 0.1;
    }
    // 40-60% → action or tension
    else if (position < 0.6) {
      scores.action += 0.15;
      scores.tension += 0.1;
    }
    // 60-80% → reaction or resolution
    else if (position < 0.8) {
      scores.reaction += 0.1;
      scores.resolution += 0.15;
    }
    // Last 20% → resolution or outro
    else {
      scores.resolution += 0.1;
      scores.outro += 0.15;
    }
  }

  // 5. Subject type bonus (10% weight)
  if (subject) {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('person') || subjectLower.includes('people')) {
      scores.intro += 0.05;
      scores.reaction += 0.05;
    }
  }

  // Find best archetype
  let bestArchetype: StoryArchetype = 'setup';
  let bestScore = 0;

  for (const [archetype, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = archetype as StoryArchetype;
    }
  }

  return {
    archetype: bestArchetype,
    confidence: Math.min(bestScore, 1),
  };
}

/**
 * Classify a segment into a story archetype
 * 
 * @param segment - Enriched segment with AI labels
 * @param audioAnalysis - Audio intelligence
 * @param segmentIndex - Position in full timeline
 * @param totalSegments - Total segments in full timeline
 * @returns Classified segment with archetype
 */
export function classifyScene(
  segment: EnrichedSegment,
  audioAnalysis?: SegmentAudioIntelligence,
  segmentIndex?: number,
  totalSegments?: number
): ClassifiedSegment {
  // Use heuristic classification (GPT integration can be added later)
  const { archetype, confidence } = classifyWithHeuristics(
    segment,
    audioAnalysis,
    segmentIndex,
    totalSegments
  );

  // Calculate story score (combines classification confidence with segment quality)
  const baseQuality = audioAnalysis 
    ? (audioAnalysis.speechProbability * 0.4 + audioAnalysis.energyLevel * 0.3 + audioAnalysis.peakiness * 0.3)
    : 0.5;

  const storyScore = (confidence * 0.6) + (baseQuality * 0.4);

  return {
    ...segment,
    archetype,
    archetypeConfidence: confidence,
    storyScore,
  };
}

/**
 * Classify all segments in a timeline
 */
export function classifyAllScenes(
  segments: EnrichedSegment[],
  audioAnalysisList: SegmentAudioIntelligence[]
): ClassifiedSegment[] {
  return segments.map((segment, index) => {
    const audioAnalysis = audioAnalysisList.find(a => a.segmentId === segment.id);
    return classifyScene(segment, audioAnalysis, index, segments.length);
  });
}

/**
 * Get archetype display name
 */
export function getArchetypeName(archetype: StoryArchetype): string {
  const names: Record<StoryArchetype, string> = {
    hook: 'Hook',
    intro: 'Introduction',
    setup: 'Setup',
    tension: 'Rising Tension',
    action: 'Main Action',
    reaction: 'Reaction',
    resolution: 'Resolution',
    outro: 'Outro',
  };
  return names[archetype];
}

/**
 * Get archetype emoji
 */
export function getArchetypeEmoji(archetype: StoryArchetype): string {
  const emojis: Record<StoryArchetype, string> = {
    hook: '🪝',
    intro: '👋',
    setup: '🎬',
    tension: '⚡',
    action: '🎭',
    reaction: '😮',
    resolution: '✅',
    outro: '🎬',
  };
  return emojis[archetype];
}

