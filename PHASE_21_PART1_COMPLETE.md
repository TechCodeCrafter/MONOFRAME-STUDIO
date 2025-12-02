# ✅ PHASE 21 - PART 1: Script Diff Engine Complete

## 🎯 Objective
Create a minimal Descript-style diff engine for transcripts with word-level timestamps.

## 📦 Deliverable
**File Created:** `apps/web/src/lib/scriptReedit/diffTranscript.ts`

## 🔧 Implementation

### Types Defined

#### `TranscriptWord`
```typescript
interface TranscriptWord {
  id: string;          // Stable identifier
  text: string;        // Word text
  start: number;       // Start time (seconds)
  end: number;         // End time (seconds)
  segmentId: string;   // Parent segment ID
}
```

#### `ScriptEditOperation`
Union type supporting 4 operation types:
- **`delete`**: Remove words from `fromWordIndex` to `toWordIndex`
- **`insert`**: Add text at `atWordIndex`
- **`replace`**: Replace words with new text (merged delete + insert)
- **`reorder`**: Move words to a new position

### Public API Functions

#### 1. `normalizeWords(words: TranscriptWord[]): string[]`
- Normalizes transcript words for fuzzy comparison
- Converts to lowercase
- Strips common punctuation (`,`, `.`, `!`, `?`, etc.)
- Returns array of normalized tokens

**Example:**
```typescript
const words = [
  { id: '1', text: 'Hello', start: 0, end: 0.5, segmentId: 's1' },
  { id: '2', text: 'World!', start: 0.5, end: 1.0, segmentId: 's1' }
];
normalizeWords(words); // ['hello', 'world']
```

#### 2. `diffTranscript(originalWords, editedText): ScriptEditOperation[]`
- Main diff function
- Compares original transcript with edited plain text
- Uses LCS (Longest Common Subsequence) algorithm
- Groups contiguous operations
- Merges delete+insert into replace when adjacent

**Example:**
```typescript
const original = [
  { id: '1', text: 'hello', start: 0, end: 0.5, segmentId: 's1' },
  { id: '2', text: 'world', start: 0.5, end: 1.0, segmentId: 's1' }
];
const edited = "hello beautiful world";
const ops = diffTranscript(original, edited);
// Returns: [{ type: 'insert', atWordIndex: 1, text: 'beautiful' }]
```

### Internal Helpers

#### `normalizeToken(text: string): string`
- Lowercase + strip punctuation for single token

#### `tokenize(text: string): string[]`
- Split text on whitespace
- Filter empty strings

#### `arraysEqual<T>(a: T[], b: T[]): boolean`
- Check if two arrays are equal

#### `computeDiff(oldSeq, newSeq): DiffEdit[]`
- LCS-based diff algorithm (Myers' algorithm simplified)
- Builds dynamic programming table
- Backtracks to find edit operations
- Returns raw diff edits (equal, insert, delete)

#### `convertToOperations(diffEdits, editedTokens): ScriptEditOperation[]`
- Converts raw diff to script operations
- Groups contiguous deletions
- Groups contiguous insertions
- Merges adjacent delete+insert into replace
- Skips equal sections

## 🧪 Algorithm Details

### LCS (Longest Common Subsequence)
1. Build 2D DP table: `lcs[i][j]` = length of LCS between `old[0..i]` and `new[0..j]`
2. Fill table using recurrence:
   - If `old[i] == new[j]`: `lcs[i][j] = lcs[i-1][j-1] + 1`
   - Else: `lcs[i][j] = max(lcs[i-1][j], lcs[i][j-1])`
3. Backtrack from `lcs[m][n]` to extract edit operations

### Operation Grouping
- Contiguous deletes → single `delete` operation
- Contiguous inserts → single `insert` operation
- Delete immediately followed by insert → `replace` operation

### Edge Cases Handled
- ✅ Empty original transcript
- ✅ Empty edited text
- ✅ No changes (returns `[]`)
- ✅ Single word changes
- ✅ Multiple consecutive operations

## 📊 Complexity
- **Time:** O(m × n) where m = original length, n = edited length
- **Space:** O(m × n) for LCS table
- **Acceptable** for typical transcript sizes (< 10,000 words)

## ✅ Validation

### TypeScript
```bash
✓ No type errors
✓ All types properly exported
✓ JSDoc comments complete
```

### ESLint
```bash
✓ No warnings
✓ No errors
✓ Clean code style
```

### Code Quality
- ✅ Pure functions (no side effects)
- ✅ Framework-agnostic (no React, DOM, browser APIs)
- ✅ Well-documented with JSDoc
- ✅ Defensive against edge cases
- ✅ Readable implementation

## 🔒 Constraints Met
- ✅ No other files modified
- ✅ No React dependencies
- ✅ No browser APIs
- ✅ Pure TypeScript
- ✅ Returns `[]` for no-change scenarios

## 🚀 Next Steps (PHASE 21 - PART 2)
This diff engine will be used in:
1. **Script Editor UI** - Display inline edits with color coding
2. **Timeline Reconstruction** - Apply operations to video timeline
3. **Undo/Redo** - Track edit history
4. **Real-time Preview** - Show changes before committing

## 📝 Example Usage Scenarios

### Scenario 1: Word Deletion
```typescript
const original = [
  { id: '1', text: 'hello', start: 0, end: 0.5, segmentId: 's1' },
  { id: '2', text: 'beautiful', start: 0.5, end: 1.0, segmentId: 's1' },
  { id: '3', text: 'world', start: 1.0, end: 1.5, segmentId: 's1' }
];
const edited = "hello world";
diffTranscript(original, edited);
// [{ type: 'delete', fromWordIndex: 1, toWordIndex: 1 }]
```

### Scenario 2: Word Insertion
```typescript
const original = [
  { id: '1', text: 'hello', start: 0, end: 0.5, segmentId: 's1' },
  { id: '2', text: 'world', start: 0.5, end: 1.0, segmentId: 's1' }
];
const edited = "hello beautiful amazing world";
diffTranscript(original, edited);
// [{ type: 'insert', atWordIndex: 1, text: 'beautiful amazing' }]
```

### Scenario 3: Word Replacement
```typescript
const original = [
  { id: '1', text: 'hello', start: 0, end: 0.5, segmentId: 's1' },
  { id: '2', text: 'world', start: 0.5, end: 1.0, segmentId: 's1' }
];
const edited = "hello universe";
diffTranscript(original, edited);
// [{ type: 'replace', fromWordIndex: 1, toWordIndex: 1, text: 'universe' }]
```

### Scenario 4: Multiple Operations
```typescript
const original = [
  { id: '1', text: 'the', start: 0, end: 0.2, segmentId: 's1' },
  { id: '2', text: 'quick', start: 0.2, end: 0.5, segmentId: 's1' },
  { id: '3', text: 'brown', start: 0.5, end: 0.8, segmentId: 's1' },
  { id: '4', text: 'fox', start: 0.8, end: 1.0, segmentId: 's1' }
];
const edited = "the fast red fox";
diffTranscript(original, edited);
// [{ type: 'replace', fromWordIndex: 1, toWordIndex: 2, text: 'fast red' }]
```

---

**Status:** ✅ Complete  
**TypeScript:** ✅ No errors  
**ESLint:** ✅ No warnings  
**Ready for:** PHASE 21 - PART 2 (Script Editor UI Integration)

