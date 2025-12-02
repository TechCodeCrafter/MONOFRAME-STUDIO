/**
 * Editor Session Store
 * Local storage management for saved AI edits
 */

import type { TimelineSegment } from '@/app/demo/ai-editor/components/TimelineEditor';

export type EditMode = 'full' | 'smart-cut' | 'directors-cut';

export interface MonoFrameEditSession {
  id: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  label: string; // User-facing name
  sourceFileName?: string;
  sourceDuration?: number; // seconds
  mode: EditMode;
  targetDurationSeconds?: number;
  
  // Timeline data
  timelineSegments: TimelineSegment[];
  
  // Analysis results (stored for reference)
  analysis?: {
    cuts?: unknown;
    scenes?: unknown;
    audio?: unknown;
  };
  
  // Mode-specific metadata
  meta?: {
    smartCutStats?: {
      segmentCount: number;
      totalDuration: number;
      avgScore: number;
      highScoreSegments: number;
    };
    directorsCutStats?: {
      segmentCount: number;
      totalDuration: number;
      avgConfidence: number;
      hookPresent: boolean;
      climaxPresent: boolean;
      outroPresent: boolean;
    };
    directorsCutStoryFlow?: string;
  };
  
  // Phase 20: AI Voiceover (optional, added non-breakingly)
  voiceover?: {
    mode: 'original' | 'voiceover' | 'mixed';
    voiceProfileId: string;
    speed: number;
    generatedAt?: string;
    segmentCount?: number;
  };
}

const STORAGE_KEY = 'monoframe_edit_sessions';

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all saved sessions
 */
export function getAllSessions(): MonoFrameEditSession[] {
  if (!isStorageAvailable()) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const sessions = JSON.parse(data) as MonoFrameEditSession[];
    // Sort by updatedAt descending (most recent first)
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return [];
  }
}

/**
 * Get session by ID
 */
export function getSessionById(id: string): MonoFrameEditSession | null {
  if (!isStorageAvailable()) return null;
  
  try {
    const sessions = getAllSessions();
    return sessions.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Failed to get session by ID:', error);
    return null;
  }
}

/**
 * Save or update a session
 */
export function saveSession(session: MonoFrameEditSession): void {
  if (!isStorageAvailable()) {
    console.warn('localStorage not available');
    return;
  }
  
  try {
    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    // Update timestamp
    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      // Update existing
      sessions[existingIndex] = updatedSession;
    } else {
      // Add new
      sessions.push(updatedSession);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save session:', error);
    throw error;
  }
}

/**
 * Delete a session by ID
 */
export function deleteSession(id: string): void {
  if (!isStorageAvailable()) return;
  
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear sessions:', error);
  }
}

/**
 * Get session count
 */
export function getSessionCount(): number {
  return getAllSessions().length;
}

/**
 * Generate a unique ID for a session
 */
export function generateSessionId(): string {
  // Try crypto.randomUUID first (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback to timestamp + random
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format relative time (e.g., "5 min ago")
 */
export function formatRelativeTime(isoTimestamp: string): string {
  try {
    const now = new Date().getTime();
    const then = new Date(isoTimestamp).getTime();
    const diffMs = now - then;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    // Fallback to date
    return new Date(isoTimestamp).toLocaleDateString();
  } catch {
    return 'unknown';
  }
}

/**
 * Get mode display name
 */
export function getModeDisplayName(mode: EditMode): string {
  const names: Record<EditMode, string> = {
    'full': 'Full Timeline',
    'smart-cut': 'Smart Cut',
    'directors-cut': "Director's Cut",
  };
  return names[mode];
}

/**
 * Estimate storage usage (rough approximation)
 */
export function estimateStorageUsage(): { sessionCount: number; estimatedKb: number } {
  if (!isStorageAvailable()) return { sessionCount: 0, estimatedKb: 0 };
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sessionCount = getAllSessions().length;
    const estimatedKb = data ? Math.round(data.length / 1024) : 0;
    
    return { sessionCount, estimatedKb };
  } catch {
    return { sessionCount: 0, estimatedKb: 0 };
  }
}

