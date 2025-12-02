/**
 * Script Re-Edit Module
 * Descript-style transcript editing with timeline synchronization
 * 
 * This module provides word-level diffing and timeline modification
 * for script-based video editing. Users can edit the transcript as
 * plain text and have changes automatically applied to the video timeline.
 * 
 * @module scriptReedit
 */

// Re-export types and functions from diffTranscript
export type { TranscriptWord, ScriptEditOperation } from './diffTranscript';
export { normalizeWords, diffTranscript } from './diffTranscript';

// Re-export types and functions from applyScriptEdits
export type {
  TimelineSegment,
  ApplyScriptEditsOptions,
  ScriptReeditResult,
} from './applyScriptEdits';
export { applyScriptEditsToTimeline } from './applyScriptEdits';

