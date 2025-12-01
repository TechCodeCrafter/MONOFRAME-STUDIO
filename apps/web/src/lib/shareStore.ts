/**
 * shareStore.ts
 * 
 * DEMO SHARE LINK SYSTEM
 * This is ONLY for /demo/ai-editor public share links.
 * DO NOT confuse with projectStore.ts (which is PROTECTED).
 * 
 * We do NOT persist heavy AI analysis data.
 * The share page will recompute fake analytics on load, similar to the demo.
 */

export interface DemoSharePayload {
  id: string;              // shareId (UUID or timestamp-based)
  createdAt: string;       // ISO date
  videoUrl: string;        // object URL from demo editor
  title: string;           // e.g. "MonoFrame AI Edit"
  description?: string;    // short tagline, optional
}

const SHARE_KEY = 'monoframe_demo_shares';

/**
 * Create a new demo share
 * Returns the full payload with generated id and createdAt
 */
export function createDemoShare(
  data: Omit<DemoSharePayload, 'id' | 'createdAt'>
): DemoSharePayload {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create share on server');
  }

  try {
    // Generate unique ID (use crypto.randomUUID if available, else timestamp + random)
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newShare: DemoSharePayload = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    // Read existing shares
    const existing = getAllDemoShares();
    existing.push(newShare);

    // Write back to localStorage
    localStorage.setItem(SHARE_KEY, JSON.stringify(existing));

    return newShare;
  } catch (error) {
    throw new Error('Failed to create share link');
  }
}

/**
 * Get a specific demo share by ID
 * Returns null if not found or on error
 */
export function getDemoShareById(id: string): DemoSharePayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const shares = getAllDemoShares();
    return shares.find((share) => share.id === id) || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get all demo shares from localStorage
 * Returns empty array if none exist or on error
 */
export function getAllDemoShares(): DemoSharePayload[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(SHARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

