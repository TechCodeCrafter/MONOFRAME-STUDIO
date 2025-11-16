# Export Overlay V2 — Real-Time Export Feedback

**Feature Branch:** `feature/export-overlay-v2`

## Overview

The Export Overlay V2 provides a cinematic, full-screen progress indicator during video export operations. This replaces inline button spinners with a more polished, professional UX that matches MonoFrame's brand aesthetic.

## Architecture

### Component Structure

```
apps/web/src/components/export/
├── ExportOverlay.tsx           # Visual overlay component
├── ExportOverlayProvider.tsx   # Global state provider
└── index.ts                     # Exports for easy importing
```

### Key Design Decisions

1. **Global Context Pattern**: Uses React Context API for app-wide state management
2. **Singleton Integration**: Exporter utility registers overlay functions at mount
3. **Non-blocking**: Overlay sits above everything (z-index: 70) without unmounting FFmpeg
4. **Automatic**: Progress updates handled by `exporter.ts`, pages just show/hide

## Components

### 1. ExportOverlay.tsx

**Purpose**: Renders the full-screen overlay with progress indicator

**Features**:
- Fullscreen semi-transparent black backdrop
- Centered modal with MonoFrame-styled spinner
- Dynamic message text
- Cinematic vignette and radial glow
- Smooth fade-in/out animations

**Key Styles**:
```css
- Background: bg-black/80 with backdrop-blur-sm
- Vignette: radial-gradient from transparent to rgba(0,0,0,0.8)
- Spinner: Thin white ring (1.5px) with slow 2s rotation
- Text: Montserrat font, 18px, white with light fade
- Glow: Subtle white blur behind spinner
```

### 2. ExportOverlayProvider.tsx

**Purpose**: Manages global overlay state and provides context

**API**:
```typescript
interface ExportOverlayContextType {
  isVisible: boolean;
  message: string;
  showExportOverlay: (message: string) => void;
  updateExportOverlay: (message: string) => void;
  hideExportOverlay: () => void;
}
```

**Usage**:
```tsx
import { useExportOverlay } from '@/components/export';

function MyComponent() {
  const { hideExportOverlay } = useExportOverlay();
  
  const handleExport = async () => {
    try {
      // Overlay is shown automatically by exporter.ts
      await exportTrimmedClip(url, start, end);
      hideExportOverlay();
    } catch (error) {
      hideExportOverlay();
    }
  };
}
```

### 3. Integration with exporter.ts

**Global Function Registration**:

The `exporter.ts` utility exposes `setExportOverlayFunctions()` which is called by the provider at mount:

```typescript
// In ExportOverlayProvider
useEffect(() => {
  setExportOverlayFunctions(
    showExportOverlay,
    updateExportOverlay,
    hideExportOverlay
  );
}, [showExportOverlay, updateExportOverlay, hideExportOverlay]);
```

**Progress Updates in exporter.ts**:

```typescript
// Loading FFmpeg
if (globalShowOverlay) {
  globalShowOverlay('Loading FFmpeg...');
}

// Preparing export
if (globalUpdateOverlay) {
  globalUpdateOverlay('Preparing export...');
}

// Processing clip
if (globalUpdateOverlay) {
  globalUpdateOverlay('Processing clip...');
}

// Finalizing
if (globalUpdateOverlay) {
  globalUpdateOverlay('Finalizing export...');
}
```

## Message Flow

### Single Clip Export (`exportTrimmedClip`)

1. `"Loading FFmpeg..."` (if not cached)
2. `"Preparing export..."`
3. `"Processing clip..."`
4. `"Finalizing export..."`
5. Page calls `hideExportOverlay()` on success/error

### Batch Export (`exportClipsAsZip`)

1. `"Loading FFmpeg..."` (if not cached)
2. `"Exporting clip 1/5..."` (for each clip)
3. `"Exporting clip 2/5..."`
4. `"Exporting clip 3/5..."`
5. `"Bundling ZIP..."`
6. Page calls `hideExportOverlay()` on success/error

## Page Integration

### Clip Editor Page

**Before**:
```tsx
const [isExporting, setIsExporting] = useState(false);
const [exportType, setExportType] = useState<'trimmed' | 'original' | null>(null);

// Conditional button rendering with inline spinner
{isExporting && exportType === 'trimmed' ? (
  <svg className="animate-spin">...</svg>
) : (
  <span>Export Trimmed Clip</span>
)}
```

**After**:
```tsx
const { hideExportOverlay } = useExportOverlay();

// Simple button, overlay handles progress
<button onClick={handleExportTrimmed}>
  <span>Export Trimmed Clip</span>
</button>

// Handler
const handleExportTrimmed = async () => {
  try {
    await exportTrimmedClip(url, start, end, filename);
    hideExportOverlay(); // ✅ Hide on success
  } catch (error) {
    hideExportOverlay(); // ✅ Hide on error
  }
};
```

### Project Details Page

**Before**:
```tsx
const [isExportingAll, setIsExportingAll] = useState(false);

// Button with inline state management
<button disabled={isExportingAll}>
  {isExportingAll ? 'Exporting...' : 'Export All Clips'}
</button>
```

**After**:
```tsx
const { hideExportOverlay } = useExportOverlay();

// Simple button
<button onClick={handleExportAll}>
  Export All Clips
</button>

// Handler
const handleExportAll = async () => {
  try {
    await exportClipsAsZip(clipsToExport, zipFilename);
    hideExportOverlay();
  } catch (error) {
    hideExportOverlay();
  }
};
```

## Visual Design

### Cinematic Elements

1. **Backdrop**: 80% black with backdrop blur
2. **Vignette**: Radial gradient from center to edges
3. **Glow**: 64x64px white blur at 2% opacity behind spinner
4. **Spinner**: 
   - 20x20 (80px) SVG
   - 1.5px stroke width
   - 175 dash array with 44 offset
   - 2s rotation duration
   - Grid pattern overlay (10% opacity)
5. **Typography**:
   - Message: Montserrat Light, 18px, white with pulse
   - Subtitle: Inter, 12px, silver at 60% opacity

### Animations

```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade up */
@keyframes fade-up {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Performance Considerations

### 1. **FFmpeg Instance Preservation**

The overlay does NOT unmount the FFmpeg instance. It's purely visual and sits above the page content.

### 2. **No Re-renders During Export**

Pages don't re-render during export since state is managed in the global context. Video playback is unaffected.

### 3. **Highest Z-Index**

```tsx
z-[70] // Above everything else
```

Ensures overlay is always visible during exports, regardless of page structure.

### 4. **Lazy Cleanup**

Message state is cleared 300ms after hiding to allow for fade-out animation:

```tsx
setTimeout(() => setMessage(''), 300);
```

## Testing Checklist

### ✅ Single Clip Export
- [ ] Export trimmed clip from Clip Editor
- [ ] Overlay shows "Loading FFmpeg..." on first export
- [ ] Progress messages update correctly
- [ ] Overlay hides on success
- [ ] Overlay hides on error

### ✅ Batch Export
- [ ] Export all clips from Project Details
- [ ] Shows "Exporting clip X/Y..." for each clip
- [ ] Shows "Bundling ZIP..." at the end
- [ ] Overlay hides on success
- [ ] Overlay hides on error

### ✅ Navigation
- [ ] Overlay persists across page navigation
- [ ] Overlay state resets when switching projects
- [ ] No hydration errors in console

### ✅ Performance
- [ ] FFmpeg instance is NOT recreated during overlay
- [ ] Video playback is NOT interrupted
- [ ] No layout shifts or flickers

### ✅ Visual
- [ ] Vignette renders correctly
- [ ] Spinner rotates smoothly
- [ ] Text pulses subtly
- [ ] Glow effect is visible but not overwhelming
- [ ] Backdrop blur works on supported browsers

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Safari
- ✅ Firefox
- ⚠️ Backdrop blur may not work on older browsers (graceful degradation)

## Deployment Notes

### Files Modified
- `apps/web/src/app/layout.tsx` - Added ExportOverlayProvider
- `apps/web/src/app/dashboard/[projectId]/page.tsx` - Updated Export All Clips
- `apps/web/src/app/dashboard/[projectId]/editor/[clipId]/page.tsx` - Updated export buttons
- `apps/web/src/lib/exporter.ts` - Added overlay progress updates

### Files Added
- `apps/web/src/components/export/ExportOverlay.tsx`
- `apps/web/src/components/export/ExportOverlayProvider.tsx`
- `apps/web/src/components/export/index.ts`

### Breaking Changes
None. This is a pure UI enhancement.

## Future Enhancements

1. **Progress Percentage**: Show numeric progress (0-100%)
2. **Cancel Button**: Allow users to cancel long exports
3. **Export History**: Log completed exports
4. **Multiple Exports**: Queue system for concurrent exports
5. **Notification Integration**: Browser notifications on completion

## Troubleshooting

### Overlay doesn't show
- ✅ Check ExportOverlayProvider is wrapping app in RootLayout
- ✅ Verify exporter.ts is calling `setExportOverlayFunctions`
- ✅ Check browser console for errors

### Overlay doesn't hide
- ✅ Ensure `hideExportOverlay()` is called in success AND error handlers
- ✅ Check for uncaught exceptions in export functions

### Spinner doesn't rotate
- ✅ Verify Tailwind CSS `animate-spin` class is available
- ✅ Check for CSS conflicts or overrides

### Message doesn't update
- ✅ Ensure `globalUpdateOverlay` is not null in exporter.ts
- ✅ Check function is being called at correct times

## Conclusion

The Export Overlay V2 provides a polished, professional export experience that matches MonoFrame's cinematic brand aesthetic. It improves UX by centralizing progress feedback and eliminates inline button state management.

**Key Benefits**:
- ✅ Consistent UX across all export operations
- ✅ Simplified page-level code (no state management)
- ✅ Cinematic, professional appearance
- ✅ Non-blocking, performant implementation
- ✅ Easy to extend and maintain

