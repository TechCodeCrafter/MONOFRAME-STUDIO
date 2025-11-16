# MonoFrame Clip Editor

## Overview
The Clip Editor is a professional, cinematic video editing workspace for trimming and refining AI-generated video clips. It combines the cinematic atmosphere of DaVinci Resolve with the minimal modern UI of Figma and Linear.

---

## Route
```
/dashboard/[projectId]/editor/[clipId]
```

---

## Design Philosophy: Hybrid Aesthetic

### 1. **Cinematic Black Editing Atmosphere**
- Primary background: `#000000`
- Secondary panels: `#0D0D0D`
- Subtle vignette overlays in main workspace
- Soft shadows and bloom effects for depth

### 2. **Minimal Modern Tool Chrome**
- Ultra-thin borders (1px, rgba white 10–20%)
- Clean Figma/Linear-style spacing
- Clear hierarchy with Montserrat + Inter fonts
- Minimal geometric icons (MonoFrame style)

### 3. **Cinematic Contrast**
- White text on black backgrounds
- Silver metadata labels (`#A3A3A3`)
- Subtle glowing accents (no neon)

### 4. **Behavioral Interactions**
- Hover-reveal toolbars
- Smooth 200–300ms transitions
- Timeline scrubbing with easing
- Buttery, magnetic interactions

### 5. **Design Inspiration**
- DaVinci Resolve (cinematic workspace)
- Apple Final Cut (minimal top bar)
- Linear & Figma (modern UI compression)

---

## Layout Structure

### **4-Panel Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV: Back | Clip Selector | Save Status | Shortcuts (?)     │
├──────────────────────────────────────┬──────────────────────────┤
│                                      │ RIGHT SIDEBAR (350px)    │
│                                      │                          │
│   LEFT: CINEMATIC VIDEO PLAYER      │ • Clip Info              │
│                                      │ • Trim Controls          │
│   • Hover controls                   │ • Waveform (static)      │
│   • Scrubber overlay                 │ • AI Insights            │
│   • Fullscreen support               │ • Action Buttons         │
│                                      │                          │
│                                      │                          │
├──────────────────────────────────────┴──────────────────────────┤
│ BOTTOM: TIMELINE EDITOR (132px)                                 │
│ • Scrubber • Trim handles • Clip boundaries • Time markers      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### **1. Top Navigation Bar**
- **Back Button**: Returns to project details
- **Clip Selector**: Dropdown to switch between clips
- **Save Indicator**: "Saving..." / "All changes saved" with pulse animation
- **Keyboard Shortcuts Button**: Opens help modal with `?` key

### **2. Video Player (Left Panel)**
- **Cinematic Display**: Full-screen responsive video with vignette overlay
- **Hover Controls**:
  - Timeline scrubber with progress indicator
  - Play/Pause button
  - Time display (current / end)
  - Fullscreen toggle
- **Play Overlay**: Large circular play button when paused
- **Video Looping**: Automatically loops within trim bounds

### **3. Editor Sidebar (Right Panel, 350px)**

#### **Clip Info**
- Title (read-only)
- Duration (live-updated based on trim)
- AI Score (with pulse animation)

#### **Trim Controls**
- Start Time slider with live timestamp
- End Time slider with live timestamp
- Range constraints (start < end)
- Visual handle indicators

#### **Audio Waveform**
- Static visualization (50 bars)
- Random heights for demo
- Monochrome silver bars

#### **AI Insights Grid**
- Emotional Score, Scene Tension, Audio Energy, Motion Score
- Pacing, Lighting, Color Grade metadata
- Minimalist card layout

#### **Action Buttons**
- **Save Clip**: Primary white button
- **Regenerate Clip**: Secondary border button
- **Delete Clip**: Danger red button

### **4. Timeline Editor (Bottom Panel, 132px)**
- **Timeline Track**: Visual representation of clip duration
- **Clip Boundaries**: Highlighted region showing trim area
- **Current Time Indicator**: White line with glow effect
- **Time Markers**: 5 markers (0%, 25%, 50%, 75%, 100%)

### **5. Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `← →` | Seek -5s / +5s |
| `?` | Toggle Shortcuts Modal |
| `Esc` | Close Modal |
| `F` | Fullscreen (in player focus) |

### **6. Auto-Save System**
- **Debounce Delay**: 400ms
- **Triggers**: Any change to `trimStart` or `trimEnd`
- **Storage**: Updates `localStorage` via `projectStore`
- **Visual Feedback**: "Saving..." indicator with pulse animation
- **Persistence**: Changes immediately reflected across the app

---

## Technical Implementation

### **State Management**
- **React State**: Video playback, trim values, UI state
- **localStorage**: Persistent clip edits
- **Debounced Auto-Save**: 400ms delay to batch rapid changes

### **Video Player**
- **HTML5 Video API**: Native video element
- **Ref Management**: `videoRef` for direct DOM access
- **Event Handlers**: `onTimeUpdate`, `onLoadedMetadata`, `onEnded`
- **Trim Boundaries**: Enforced via `currentTime` checks

### **Keyboard Navigation**
- **Global Event Listener**: Attached to `window`
- **useEffect Cleanup**: Removes listeners on unmount
- **useCallback Optimization**: Prevents unnecessary re-renders

### **Type Safety**
- **TypeScript**: Full type coverage
- **Interface Imports**: `Clip`, `Project` from `projectStore`
- **URL Params**: Type-cast and parsed correctly

### **Performance**
- **Debounced Saves**: Reduces localStorage writes
- **useCallback**: Optimizes function references
- **Conditional Rendering**: Only renders when needed

---

## File Structure

```
apps/web/src/app/dashboard/[projectId]/
├── page.tsx                              # Project details (with "Edit Clip" button)
└── editor/
    └── [clipId]/
        └── page.tsx                      # Clip Editor (654 lines)
```

---

## Integration Points

### **1. Entry Point**
Users access the editor via the **"Edit Clip"** button in the project details page:

```typescript
// apps/web/src/app/dashboard/[projectId]/page.tsx
<button
  onClick={() => router.push(`/dashboard/${projectId}/editor/${clip.id}`)}
  className="w-full bg-mono-white text-mono-black..."
>
  <svg>...</svg>
  <span>Edit Clip</span>
</button>
```

### **2. Data Flow**
```
localStorage (projectStore)
  ↓
getProjectById(projectId)
  ↓
Find clip by clipId
  ↓
Load into editor state
  ↓
User edits trim values
  ↓
Debounced auto-save (400ms)
  ↓
updateProject() → localStorage
  ↓
Changes persist across app
```

### **3. Navigation Flow**
```
Dashboard → Project Details → [Edit Clip] → Editor
                ↑                                ↓
                └────────── [Back Button] ───────┘
```

---

## Styling Details

### **Colors**
- **Backgrounds**: `#000` (primary), `#0D0D0D` (panels), `#1A1A1A` (slate)
- **Borders**: `rgba(255,255,255, 0.1-0.2)` (ultra-thin)
- **Text**: `#FFFFFF` (primary), `#D9D9D9` (silver), `#A3A3A3` (muted)
- **Accents**: White glow effects (no neon colors)

### **Typography**
- **Headings**: Montserrat (400, 600, 700)
- **Body**: Inter (400, 600)
- **Uppercase Labels**: Tracking-wider, 60% opacity

### **Spacing**
- **Panels**: 1.5rem (6 units) padding
- **Sections**: 1.5rem vertical spacing
- **Cards**: 0.75rem (3 units) gap

### **Animations**
- **Transitions**: 200-300ms ease-in-out
- **Hover States**: Subtle scale (1.01-1.02)
- **Pulse**: Slow 3s infinite for save indicator
- **Fade Effects**: Opacity 0 → 1 on hover

---

## Known Limitations (MVP)

1. **No Real Video Trimming**: 
   - Edits only update `startTime`/`endTime` values
   - Actual video file is unchanged
   - Future: Integrate ffmpeg WASM or backend processing

2. **Static Waveform**: 
   - Random bars for demo purposes
   - Future: Generate real audio waveform from video

3. **No Undo/Redo**: 
   - Changes are auto-saved immediately
   - Future: Implement history stack

4. **Single User**: 
   - No collaboration or conflict resolution
   - Future: Add multi-user support

5. **No Export from Editor**: 
   - Export handled from project details page
   - Future: Add direct export from editor

---

## Testing Checklist

✅ **Navigation**
- Back button returns to project details
- Clip selector switches between clips
- URL updates when switching clips

✅ **Video Player**
- Video loads and plays correctly
- Play/Pause button works
- Timeline scrubber seeks accurately
- Fullscreen toggle works
- Video loops within trim bounds

✅ **Trim Controls**
- Start slider updates trim start
- End slider updates trim end
- Constraints enforced (start < end)
- Duration updates live

✅ **Auto-Save**
- Changes debounce correctly (400ms)
- localStorage updated on save
- Save indicator shows status
- No performance issues with rapid changes

✅ **Keyboard Shortcuts**
- Space plays/pauses
- Arrow keys seek ±5s
- ? opens shortcuts modal
- Esc closes modal

✅ **Responsive Design**
- Layout adapts to screen size
- Sidebar remains readable
- Video maintains aspect ratio
- Timeline remains functional

✅ **Type Safety**
- No TypeScript errors
- All types properly defined
- URL params parsed correctly

✅ **Styling**
- Matches MonoFrame brand
- Hybrid design system applied
- Hover states work smoothly
- Animations are buttery

---

## Future Enhancements

### **Phase 2: Real Trimming**
- Integrate ffmpeg WASM for client-side trimming
- Or implement backend video processing API
- Generate trimmed video files for export

### **Phase 3: Advanced Editing**
- Add more editing controls (brightness, contrast, saturation)
- Implement audio controls (volume, fade in/out)
- Add text overlays and captions

### **Phase 4: Collaboration**
- Real-time multi-user editing
- Comments and annotations
- Version history

### **Phase 5: AI Enhancements**
- AI-powered automatic trimming suggestions
- Smart scene detection
- Auto-apply color grading

---

## Code Quality

✅ **Linting**: All ESLint rules pass  
✅ **Formatting**: Prettier applied  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Performance**: Optimized with useCallback and useMemo  
✅ **Accessibility**: Keyboard navigation supported  
✅ **Maintainability**: Clean, well-organized code  

---

## Branch
```
feature/clip-editor-v1
```

---

## Summary

The MonoFrame Clip Editor is a production-ready, cinematic editing workspace that combines:
- **Professional UX**: Inspired by industry-leading tools (DaVinci, Final Cut, Figma)
- **Modern Tech Stack**: React, Next.js, TypeScript, Tailwind CSS
- **Hybrid Design**: Cinematic black atmosphere + minimal modern chrome
- **Auto-Save**: Seamless persistence with 400ms debounce
- **Keyboard Shortcuts**: Power-user friendly
- **Type-Safe**: Full TypeScript coverage
- **Performant**: Optimized React hooks and minimal re-renders

Ready for user testing and feedback! 🎬✨

