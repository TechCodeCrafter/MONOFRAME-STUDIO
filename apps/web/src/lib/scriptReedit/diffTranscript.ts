/**
 * Script Diff Engine
 * Descript-style word-level diff for transcript re-editing
 * 
 * This module provides word-level diffing between an original transcript
 * (with timestamps) and an edited plain-text version, producing a minimal
 * set of edit operations (delete, insert, replace).
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Individual word in a transcript with timing information
 */
export interface TranscriptWord {
  /** Stable identifier for this word */
  id: string;
  /** Word text (lowercased for comparison) */
  text: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** ID of the video segment this word belongs to */
  segmentId: string;
}

/**
 * Diff operation representing a script edit
 * 
 * Operations are produced by comparing original transcript words
 * with edited text, and can be applied to reconstruct the timeline.
 */
export type ScriptEditOperation =
  | {
      type: "delete";
      /** Index into originalWords array (inclusive start) */
      fromWordIndex: number;
      /** Index into originalWords array (inclusive end) */
      toWordIndex: number;
    }
  | {
      type: "insert";
      /** Index into originalWords where insertion happens (before this index) */
      atWordIndex: number;
      /** Inserted text */
      text: string;
    }
  | {
      type: "replace";
      /** Index into originalWords array (inclusive start) */
      fromWordIndex: number;
      /** Index into originalWords array (inclusive end) */
      toWordIndex: number;
      /** Replacement text */
      text: string;
    }
  | {
      type: "reorder";
      /** Index into originalWords array (inclusive start) */
      fromWordIndex: number;
      /** Index into originalWords array (inclusive end) */
      toWordIndex: number;
      /** New position in the sequence */
      targetIndex: number;
    };

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface DiffEdit {
  type: 'delete' | 'insert' | 'equal';
  oldIndex: number;
  newIndex: number;
  count: number;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Normalize transcript words for comparison
 * 
 * Converts words to lowercase and strips common punctuation to enable
 * fuzzy matching during diff computation.
 * 
 * @param words - Array of transcript words with timestamps
 * @returns Array of normalized word strings for diffing
 * 
 * @example
 * ```ts
 * const words = [
 *   { id: '1', text: 'Hello', start: 0, end: 0.5, segmentId: 's1' },
 *   { id: '2', text: 'World!', start: 0.5, end: 1.0, segmentId: 's1' }
 * ];
 * const normalized = normalizeWords(words);
 * // Returns: ['hello', 'world']
 * ```
 */
export function normalizeWords(words: TranscriptWord[]): string[] {
  return words.map(word => normalizeToken(word.text));
}

/**
 * Compute word-level diff between original transcript and edited text
 * 
 * Uses a longest common subsequence (LCS) algorithm to find the minimal
 * set of edit operations needed to transform the original transcript
 * into the edited version.
 * 
 * @param originalWords - Canonical transcript with word-level timestamps
 * @param editedText - Edited transcript as plain text from script editor
 * @returns Minimal list of edit operations (delete, insert, replace)
 * 
 * @example
 * ```ts
 * const original = [
 *   { id: '1', text: 'hello', start: 0, end: 0.5, segmentId: 's1' },
 *   { id: '2', text: 'world', start: 0.5, end: 1.0, segmentId: 's1' }
 * ];
 * const edited = "hello beautiful world";
 * const ops = diffTranscript(original, edited);
 * // Returns: [{ type: 'insert', atWordIndex: 1, text: 'beautiful' }]
 * ```
 */
export function diffTranscript(
  originalWords: TranscriptWord[],
  editedText: string
): ScriptEditOperation[] {
  // Handle edge cases
  if (originalWords.length === 0 && !editedText.trim()) {
    return [];
  }
  
  if (originalWords.length === 0) {
    // Everything is an insert
    return [{ type: 'insert', atWordIndex: 0, text: editedText.trim() }];
  }
  
  if (!editedText.trim()) {
    // Everything is a delete
    return [{ type: 'delete', fromWordIndex: 0, toWordIndex: originalWords.length - 1 }];
  }
  
  // Split edited text into tokens
  const editedTokens = tokenize(editedText);
  
  // Normalize both for comparison
  const normalizedOriginal = normalizeWords(originalWords);
  const normalizedEdited = editedTokens.map(normalizeToken);
  
  // Check if no real changes
  if (arraysEqual(normalizedOriginal, normalizedEdited)) {
    return [];
  }
  
  // Compute LCS-based diff
  const diffEdits = computeDiff(normalizedOriginal, normalizedEdited);
  
  // Convert to script operations
  const operations = convertToOperations(diffEdits, editedTokens);
  
  return operations;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Normalize a single token for comparison
 * Lowercase and strip common punctuation
 */
function normalizeToken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"""''()[\]{}<>]/g, '')
    .trim();
}

/**
 * Tokenize text into words
 * Simple whitespace + punctuation-aware splitting
 */
function tokenize(text: string): string[] {
  // Split on whitespace and filter empty strings
  return text
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * Check if two arrays are equal
 */
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Compute diff using Myers' algorithm (simplified LCS approach)
 * 
 * This is a basic implementation of the longest common subsequence
 * algorithm to find edit operations between two sequences.
 */
function computeDiff(oldSeq: string[], newSeq: string[]): DiffEdit[] {
  const oldLen = oldSeq.length;
  const newLen = newSeq.length;
  
  // Build LCS table
  const lcs: number[][] = Array(oldLen + 1)
    .fill(0)
    .map(() => Array(newLen + 1).fill(0));
  
  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldSeq[i - 1] === newSeq[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find edits
  const edits: DiffEdit[] = [];
  let i = oldLen;
  let j = newLen;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldSeq[i - 1] === newSeq[j - 1]) {
      // Equal
      edits.unshift({
        type: 'equal',
        oldIndex: i - 1,
        newIndex: j - 1,
        count: 1,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      // Insert
      edits.unshift({
        type: 'insert',
        oldIndex: i,
        newIndex: j - 1,
        count: 1,
      });
      j--;
    } else if (i > 0) {
      // Delete
      edits.unshift({
        type: 'delete',
        oldIndex: i - 1,
        newIndex: j,
        count: 1,
      });
      i--;
    }
  }
  
  return edits;
}

/**
 * Convert diff edits to script operations
 * Groups contiguous operations and merges delete+insert into replace
 */
function convertToOperations(
  diffEdits: DiffEdit[],
  editedTokens: string[]
): ScriptEditOperation[] {
  const operations: ScriptEditOperation[] = [];
  let i = 0;
  
  while (i < diffEdits.length) {
    const edit = diffEdits[i];
    
    if (edit.type === 'equal') {
      // Skip equal sections
      i++;
      continue;
    }
    
    if (edit.type === 'delete') {
      // Collect contiguous deletions
      const deleteStart = edit.oldIndex;
      let deleteEnd = edit.oldIndex;
      let j = i;
      
      while (j < diffEdits.length && diffEdits[j].type === 'delete') {
        deleteEnd = diffEdits[j].oldIndex;
        j++;
      }
      
      // Check if immediately followed by insert (potential replace)
      if (j < diffEdits.length && diffEdits[j].type === 'insert') {
        // Collect contiguous inserts
        const insertStart = diffEdits[j].newIndex;
        let insertEnd = diffEdits[j].newIndex;
        let k = j;
        
        while (k < diffEdits.length && diffEdits[k].type === 'insert') {
          insertEnd = diffEdits[k].newIndex;
          k++;
        }
        
        // Merge into replace
        const insertedText = editedTokens.slice(insertStart, insertEnd + 1).join(' ');
        operations.push({
          type: 'replace',
          fromWordIndex: deleteStart,
          toWordIndex: deleteEnd,
          text: insertedText,
        });
        
        i = k;
      } else {
        // Pure delete
        operations.push({
          type: 'delete',
          fromWordIndex: deleteStart,
          toWordIndex: deleteEnd,
        });
        
        i = j;
      }
    } else if (edit.type === 'insert') {
      // Collect contiguous inserts
      const insertStart = edit.newIndex;
      let insertEnd = edit.newIndex;
      let j = i;
      
      while (j < diffEdits.length && diffEdits[j].type === 'insert') {
        insertEnd = diffEdits[j].newIndex;
        j++;
      }
      
      const insertedText = editedTokens.slice(insertStart, insertEnd + 1).join(' ');
      const atIndex = edit.oldIndex;
      
      operations.push({
        type: 'insert',
        atWordIndex: atIndex,
        text: insertedText,
      });
      
      i = j;
    } else {
      i++;
    }
  }
  
  return operations;
}

