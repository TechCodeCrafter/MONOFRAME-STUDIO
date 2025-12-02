# ✅ PHASE 21 - PART 2: Apply Script Edits to Timeline Complete

## 🎯 Objective
Take diff operations from `diffTranscript()` and apply them to video timeline segments.

## 📦 Deliverable
**File Created:** `apps/web/src/lib/scriptReedit/applyScriptEdits.ts`

## 🔧 Implementation

### Types Defined

#### `TimelineSegment` (Exported)
```typescript
export interface TimelineSegment {
  id: string;
  startTime: number;      // seconds
  endTime: number;        // seconds
  label?: string;
  clipId?: string;
  aiLabel?: {
    title: string;
    description: string;
    emotion: string;
    subject: string;
  };
  audioOnly?: boolean;    // For AI narration segments
  aiScore?: number;       // From Smart Cut
  storyRole?: string;     // From Director's Cut
}
```

#### `ApplyScriptEditsOptions`
```typescript
export type ApplyScriptEditsOptions = {
  enableInsertAudioSegments?: boolean;  // default: true
  minGapSeconds?: number;               // default: 0.3
};
```

#### `ScriptReeditResult`
```typescript
export interface ScriptReeditResult {
  timeline: TimelineSegment[];                    // Updated timeline
  operationsApplied: ScriptEditOperation[];       // Successfully applied ops
  removedRanges: { start: number; end: number }[]; // Deleted time ranges
  insertedRanges: { at: number; duration: number }[]; // Inserted audio segments
  replacedRanges: { start: number; end: number }[]; // Replaced time ranges
}
```

### Public API

#### `applyScriptEditsToTimeline()`
```typescript
export function applyScriptEditsToTimeline(
  originalTimeline: TimelineSegment[],
  words: TranscriptWord[],
  edits: ScriptEditOperation[],
  options?: ApplyScriptEditsOptions
): ScriptReeditResult;
```

Main function that applies script edit operations to timeline segments.

## 📋 Operation Handling

### 1. **DELETE Operation**
- Computes time range from word indices
- Removes or trims segments in that range
- **Segment trimming logic:**
  - Segment before range → keep as-is
  - Segment after range → keep as-is
  - Segment completely within range → remove
  - Segment partially overlaps → trim or split
- Tracks `removedRanges`

**Example:**
```typescript
// Delete words 5-7 (time: 2.5s - 3.8s)
// Segment [2.0s - 4.0s] gets split into:
// → [2.0s - 2.5s] (before)
// → [3.8s - 4.0s] (after)
```

### 2. **INSERT Operation**
- Determines insertion time from `atWordIndex`
- Creates audio-only segment placeholder
- Estimates duration: `wordCount × 0.35s + 10% padding`
- Marks segment with `audioOnly: true`
- Tracks `insertedRanges`

**Example:**
```typescript
// Insert "beautiful amazing" at word 3
// → Creates segment [1.5s - 2.3s] with audioOnly: true
```

### 3. **REPLACE Operation**
- Combines DELETE + INSERT
- Deletes original word span from timeline
- Creates audio-only segment for new narration
- Duration estimated same as insert
- Tracks both `removedRanges` and `insertedRanges`
- Also tracks `replacedRanges` (original span)

**Example:**
```typescript
// Replace words 5-7 ("quick brown fox") with "fast red wolf"
// → Remove [2.5s - 3.8s]
// → Insert audio-only segment [2.5s - 3.5s] (estimated duration)
```

### 4. **REORDER Operation**
- Finds segments in the source range
- Removes them from original position
- Calculates time shift
- Moves segments to target position
- Maintains chronological order

**Example:**
```typescript
// Move words 10-15 to position 5
// → Shifts affected segments by calculated offset
// → Timeline is re-sorted after operation
```

## 🔧 Internal Helpers

### `getWordTimeRange(words, fromIndex, toIndex)`
- Returns `{ start, end }` time range for word span
- Handles invalid indices gracefully

### `removeTimeRangeFromSegments(segments, start, end)`
- Core deletion logic
- Handles 5 cases:
  1. Segment before range → keep
  2. Segment after range → keep
  3. Segment fully within range → remove
  4. Segment partially at start → trim end
  5. Segment partially at end → trim start
  6. Segment spans range → split into two

### `createAudioSegment(start, end, text, id)`
- Creates audio-only timeline segment
- Sets `audioOnly: true`
- Adds AI label metadata
- Truncates description to 100 chars

### `estimateDuration(text)`
- Speech rate: ~170 words/minute
- Formula: `wordCount × 0.35s × 1.1` (10% padding)
- Minimum duration: 0.5 seconds

### `sortAndNormalizeTimeline(segments)`
- Sorts by start time
- Fixes overlaps by trimming
- Removes invalid segments (end ≤ start)
- Ensures timeline integrity

## 🎯 Key Features

### ✅ **Segment Splitting**
When deletion cuts through middle of segment:
```
Original: [0s ========== 10s]
Delete:       [3s --- 7s]
Result:   [0s === 3s] [7s == 10s]
```

### ✅ **Audio-Only Segments**
For insertions/replacements:
```typescript
{
  id: "script-insert-12345",
  startTime: 2.5,
  endTime: 3.2,
  audioOnly: true,
  label: "AI Re-narration",
  aiLabel: {
    title: "AI Narration",
    description: "beautiful amazing world",
    emotion: "neutral",
    subject: "voiceover"
  }
}
```

### ✅ **Timeline Integrity**
- Segments sorted by start time
- Overlaps automatically resolved
- Invalid segments filtered out
- Chronological consistency maintained

### ✅ **Error Handling**
- Validates inputs (empty timeline, no edits)
- Try-catch around each operation
- Failed operations logged but don't stop others
- Graceful degradation

## 📊 Complexity
- **Time:** O(n × m) where n = timeline length, m = edit count
- **Space:** O(n) for new timeline
- **Acceptable** for typical video edits (< 100 segments, < 50 operations)

## ✅ Validation

### TypeScript
```bash
✓ No type errors
✓ All types properly exported
✓ TimelineSegment interface defined
```

### ESLint
```bash
✓ No warnings
✓ No errors
✓ Clean code style
```

### Code Quality
- ✅ Pure functions (no side effects)
- ✅ Framework-agnostic (no React/DOM)
- ✅ Well-documented with JSDoc
- ✅ Defensive error handling
- ✅ Type-safe throughout

## 🔒 Constraints Met
- ✅ No FFmpeg logic (timeline data only)
- ✅ No other files modified
- ✅ Reuses TimelineSegment type
- ✅ Pure TypeScript
- ✅ Small gaps preserved (not auto-merged)

## 🚀 Usage Example

```typescript
import { applyScriptEditsToTimeline } from './applyScriptEdits';
import { diffTranscript } from './diffTranscript';

// 1. Get transcript and timeline
const words = [...]; // TranscriptWord[]
const timeline = [...]; // TimelineSegment[]

// 2. User edits script
const editedText = "hello beautiful world"; // User's edited text

// 3. Compute diff
const edits = diffTranscript(words, editedText);
// → [{ type: 'insert', atWordIndex: 1, text: 'beautiful' }]

// 4. Apply to timeline
const result = applyScriptEditsToTimeline(timeline, words, edits, {
  enableInsertAudioSegments: true,
  minGapSeconds: 0.3
});

// 5. Result
console.log(result.timeline);        // Updated timeline
console.log(result.insertedRanges);  // [{ at: 0.5, duration: 0.385 }]
console.log(result.removedRanges);   // []
```

## 🎬 Next Steps (PHASE 21 - PART 3)

This timeline modification engine will be integrated with:
1. **Script Editor UI** - Apply edits in real-time
2. **FFmpeg Export** - Handle audio-only segments (TTS or silence)
3. **Preview System** - Show modified timeline before export
4. **Undo/Redo** - Reverse operations
5. **Validation** - Check for timeline conflicts

## 📝 Limitations & Assumptions

### Current Limitations
- No automatic gap merging (keeps small gaps)
- Audio segments are placeholders (actual TTS handled elsewhere)
- Reorder operation is basic (no complex timeline reconstruction)
- No validation for maximum timeline length
- Overlap resolution is simple trimming (not intelligent merging)

### Assumptions
- Words have accurate timestamps from Whisper
- Each word belongs to exactly one segment (via `segmentId`)
- Timeline segments are non-overlapping initially
- Start times ≤ End times
- Speech rate is ~170 WPM (English)

### Future Enhancements
- Smarter gap handling (auto-merge if < threshold)
- Better reorder algorithm (preserve relative timing)
- Timeline validation (detect conflicts)
- Support for multi-track audio
- Batch operation optimization

---

**Status:** ✅ Complete  
**TypeScript:** ✅ No errors  
**ESLint:** ✅ No warnings  
**Ready for:** PHASE 21 - PART 3 (UI Integration)

