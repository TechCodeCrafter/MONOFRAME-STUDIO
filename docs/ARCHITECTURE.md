# MonoFrame Studio — Architecture & System Design

This document defines **how MonoFrame works TODAY** and **how it is intended to evolve**.  
It is the **source of truth** for all engineers and AI assistants working on this codebase.

---

# 1. Product Overview

MonoFrame Studio is a **browser-only cinematic AI video editor**.

- ⚡ Fully client-side  
- 🤖 Uses mock AI (not real inference yet)  
- 💾 Stores projects in localStorage  
- 🎬 Premium cinematic UI  
- 🛠️ Zero backend dependencies  

MonoFrame is currently in **Phase 1 — Frontend-Only Demo**.

---

# 2. Application Flow (Protected)

Landing (/)
↓
Upload (/upload)
↓ validate → base64 → create project
↓
simulateProcessing (3s mock AI)
↓
Dashboard (/dashboard)
↓
Project Details (/dashboard/[projectId])
↓
Clip Editor (/dashboard/[projectId]/editor/[clipId])


This spine is **protected** and must never be changed without explicit approval.

---

# 3. Technology Stack

- **Next.js App Router (14+)**
- **TypeScript Strict**
- **React Hooks**
- **Tailwind CSS**
- **localStorage (as DB)**
- **Mock AI engine (fake data generator)**  
- **pnpm** as package manager

No backend, no cloud, no auth in this phase.

---

# 4. Module Breakdown

## `/`
**Landing Page**  
- Hero section  
- CTA buttons  
- Link to Live Demo  
- SSR-safe rendering  

## `/upload`
Handles:
- 5MB max file validation  
- Convert video → base64  
- Create new Project object  
- Save to localStorage  
- Trigger `simulateProcessing`  
- Redirect to Dashboard  

## `/dashboard`
- Grid of projects  
- Stats row  
- Skeleton loader  
- Hydration-safe (`isMounted`)  

## `/dashboard/[projectId]`
- Full video player  
- Timeline (with waveform background)  
- Playhead tracking  
- Clip cards with highlight logic  

## `/dashboard/[projectId]/editor/[clipId]`
Premium editor with:
- Video playback  
- Aspect ratio switching (16:9 → 9:16 → 1:1 → 4:5)  
- Trim controls  
- AI Insights panel  
- AI B-Roll Suggestions panel  
- Modal previews  
- Fullscreen-safe  

## `/demo`
- Standalone fake editor  
- For sharing / marketing  
- Lightweight & safe  

---

# 5. Data Models

```ts
interface ClipAnalysis {
  emotionalScore: number
  audioEnergy: number
  sceneTension: number
  motionScore: number
  cinematicRhythm?: number
}

interface Clip {
  id: string
  title: string
  startTime: number
  endTime: number
  duration: number
  score: number
  tags: string[]
  analysis: ClipAnalysis
}

interface Project {
  id: string
  name: string
  videoUrl: string     // base64
  status: 'processing' | 'processed' | 'error'
  createdAt: string
  clips: Clip[]
  summary?: {
    totalClips: number
    avgScore: number
    totalDuration: number
  }
}
6. Storage Layer (PROTECTED)

File: apps/web/src/lib/projectStore.ts

Responsible for:

Reading/writing localStorage

Creating projects

Updating projects

Deleting projects

Running mock AI (simulateProcessing)

Storage Rules

Always wrap everything in try/catch

Always check typeof window !== 'undefined'

Never rename localStorage keys

Never break backwards compatibility

Never change project shape without approval

This file is protected.
Modification requires:

APPROVED: modify projectStore.ts for <reason>

7. Mock AI Engine (PROTECTED BEHAVIOUR)

simulateProcessing(projectId) must always:

⏱️ Wait exactly 3 seconds

🎞️ Generate 5–8 clips

🚫 No overlapping timestamps

📈 Scores between 72–95

😊 Rotate emotion profiles

🧠 Compute summary:

totalClips

avgScore

totalDuration

This behaviour is locked until backend phase.

8. UI Architecture
8.1 Dashboard

Project grid

Hover glows

slideUp animation

Persistent localStorage state

8.2 Project Details

Full video player

Custom controls

Timeline with waveform

Playhead → clip highlight

Scroll-to-active behaviour

8.3 Clip Editor

Aspect ratio switcher

Visual cropping via CSS

Trim UI

AI Insights

AI B-Roll Suggestions

Modal preview system

Fullscreen-safe behaviour

UI is cinematic, dark, premium.

9. Styling System
Colors
#0a0a0a      (base)
#111111      (surface)
#1a1a1a      (surface elevated)
white/5      (subtle border)
white/10     (default border)
white/20     (strong border)
white/80     (primary text)

Typography

Page titles: text-2xl font-semibold

Section titles: text-lg font-medium text-white/70

Body: text-sm text-white/80

Labels: text-xs text-white/60

Motion (from globals.css — PROTECTED)

animate-fadeIn

animate-slideUp

animate-scaleIn

animate-gentlePulse

Only animations in globals.css may be used unless approved.

10. SEO & Metadata

Global (layout.tsx):

OG image → /og-monoframe.png

Demo (demo/layout.tsx):

OG image → /og-monoframe-demo.png

Both must exist in /public.

11. Performance Rules

❌ No heavy WASM

❌ No ffmpeg.wasm

❌ No GPU code

❌ No real AI inference

❌ No backend calls

❌ No unnecessary dependencies

⚡ Must be hydration-safe

⚡ Must avoid large rerenders

MonoFrame must feel fast.

12. Evolution Plan
Phase 1 — Current (Frontend Only)

Mock AI

localStorage

No backend

Demo-ready

Phase 2 — Cloud-Enabled

Backend

Cloud storage (S3/GCS)

Authentication

Real database

Team accounts

Phase 3 — Real AI (GPU)

Real scene detection

Real cut analysis

Real export pipeline

ffmpeg backend or worker

13. PROTECTED FILES

The following files cannot be modified without explicit written approval:

apps/web/src/lib/projectStore.ts
apps/web/src/app/globals.css
apps/web/next.config.js
dev.sh
docs/architecture.md
cursorRules.md


Modify only with:

APPROVED: modify <file> for <reason>

14. Development Checklist

Before merging or accepting changes:

No hydration errors

No console warnings

Upload works

simulateProcessing works

Dashboard loads

Project Details loads

Clip Editor loads

Demo loads

No design regressions

No protected file was changed accidentally
