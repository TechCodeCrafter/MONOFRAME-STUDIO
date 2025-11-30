# MonoFrame Studio — Cursor Rules (Ultra-Strict Mode)

> **You are working on a LIFE APPLICATION.**  
> Stability > cleverness.  
> Consistency > rewrites.

These rules are **binding** for any AI assistant (including Cursor) working in this repo.

---

## 0. Core Identity

- **Name:** MonoFrame Studio  
- **Tagline:** *The First AI Film Editor*  
- **Vision:** A premium, cinematic, browser-based video editor.  
  Think: **DaVinci Resolve × Cursor AI**  
- **Current Phase:** Frontend-only, demo-ready product with **mock AI** and **localStorage** persistence.

MonoFrame must always feel:

- **Cinematic** – dark, minimal, film-grade UI  
- **Instant** – fast mock AI, no heavy browser processing  
- **Predictable** – no surprise refactors or UX disruptions  

---

## 1. Operating Mode (ULTRA-STRICT)

### 1.1 What You MUST Do

- ✅ Follow **all rules** in this file and `/docs/architecture.md`
- ✅ Prefer **small, additive changes** over refactors
- ✅ Preserve existing UX flows
- ✅ Maintain **mock AI** (3s delay + fake clips)
- ✅ Keep the project **frontend-only** until backend phase is explicitly started

### 1.2 What You MUST NOT Do (Without Approval)

You MAY NOT:

- ❌ Refactor core flows  
  `Upload → Mock AI → Dashboard → Project → Clip Editor`
- ❌ Modify or restructure:
  - `apps/web/src/lib/projectStore.ts`
  - `apps/web/src/app/globals.css`
  - `apps/web/next.config.js`
  - `dev.sh`
- ❌ Add WASM, ffmpeg, GPU tools
- ❌ Add backend, auth, DB
- ❌ Change the design system
- ❌ Change AI logic or clip generation logic

**Protected Files:**

apps/web/src/lib/projectStore.ts
apps/web/src/app/globals.css
apps/web/next.config.js
dev.sh
docs/architecture.md


To modify a protected file, user must type:



APPROVED: modify <file> for <reason>


---

## 2. High-Level Architecture (Cursor View)



Landing (/)
↓
Upload (/upload)
↓ (3s MOCK AI)
Dashboard (/dashboard)
↓
Project Details (/dashboard/[projectId])
↓
Clip Editor (/dashboard/[projectId]/editor/[clipId])


---

## 3. Design System

### Colors

```txt
#0a0a0a   – base black
white/80  – primary text
white/5   – subtle borders
white/10  – default borders
white/20  – strong borders

Typography
text-2xl font-semibold              – page titles
text-lg font-medium text-white/70   – section titles
text-sm text-white/80               – body text
text-xs text-white/60               – labels

Spacing

Use Tailwind scale: 2, 4, 6, 8, 12, 16, 24, 32

Never use arbitrary values like mt-[37px]

Animations

Only use animations defined in globals.css:

animate-fadeIn
animate-slideUp
animate-scaleIn
animate-gentlePulse

4. Mock AI Rules

simulateProcessing() (in projectStore.ts):

⏱ Always 3 seconds

🎬 Always produce 5–8 clips

📈 Scores: 72–95

😄 Emotions rotate

🎞 Sequential, non-overlapping clips

❗ DO NOT CHANGE this behaviour without approval

5. Storage & Data Rules
LocalStorage Key
monoframe_projects

Project Object Contains

id

name

videoUrl (base64)

clips[]

summary

status

Rules

Always guard:

if (typeof window !== 'undefined')


Wrap all access in try/catch

Never break existing stored data

6. React / Next.js Rules
Hydration-Safe Pattern

Required for all pages touching browser APIs:

'use client';

const [isMounted, setIsMounted] = useState(false);

useEffect(() => setIsMounted(true), []);

if (!isMounted) return <Skeleton />;


Never read localStorage outside this guard.

7. File Structure
app/
  page.tsx
  upload/page.tsx
  dashboard/page.tsx
  dashboard/[projectId]/page.tsx
  dashboard/[projectId]/editor/[clipId]/page.tsx
  demo/page.tsx

components/
lib/
docs/

8. Protected UX Flows (DO NOT BREAK)

Landing → Upload

Upload → New Project

simulateProcessing

Dashboard loads projects

Project page shows:

Video player

Timeline

Clip list

Clip editor shows:

Aspect-ratio switching

Trim

AI insights

B-Roll suggestions

All new features must extend this spine.

9. Adding New Features

Create NEW components instead of modifying core ones

MUST follow design system

MUST test:

/

/upload

/dashboard

/dashboard/[projectId]

/dashboard/[projectId]/editor/[clipId]

/demo

10. Permission System

Must ask before changing:

projectStore

route structure

globals.css

upload flow

clip generation logic

next.config.js

dev.sh

timeline system

Format:

APPROVED: modify <file> for <reason>

11. Final Rule

MonoFrame Studio is a long-term flagship product.
Every change must be predictable, reversible, premium.
When in doubt — ASK.


---

# ✅ **FINAL FILE 2 — `/docs/architecture.md` (PERFECT MD FORMAT)**

```md
# MonoFrame Studio — Architecture & System Design

This document defines how MonoFrame works TODAY and how it will evolve.  
It is the architecture **source of truth**.

---

# 1. Product Overview

MonoFrame Studio is a **browser-only cinematic AI video editor**.

- Fully client-side  
- Mock AI  
- localStorage database  
- Premium cinematic UI  
- No backend dependencies  

---

# 2. Application Flow



Landing
↓
Upload (validate → base64 → create project)
↓
simulateProcessing (3s mock AI)
↓
Dashboard (project list)
↓
Project Details (timeline + clips + video)
↓
Clip Editor (aspect ratios, AI insights, B-roll)


This flow is **protected**.

---

# 3. Technology

- Next.js App Router  
- TypeScript strict  
- Tailwind CSS  
- React Hooks  
- localStorage  
- pnpm  
- Mock AI only  

---

# 4. Modules & Routes

## `/`
Landing page  
- Hero section  
- CTA  
- Link to demo  

## `/upload`
- 5MB validation  
- Convert to base64  
- Create project  
- Trigger `simulateProcessing`  

## `/dashboard`
- List of all projects  
- Hydration-safe  

## `/dashboard/[projectId]`
- Full video  
- Timeline  
- Playhead tracking  
- Clip list  

## `/dashboard/[projectId]/editor/[clipId]`
- Premium editor  
- Aspect-ratio switcher  
- Trim  
- AI insights  
- B-roll suggestions  
- Modal system  

## `/demo`
- Fake editor demo (non-functional)  

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
  videoUrl: string
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

Creating/updating/removing projects

simulateProcessing

Rules:

Wrap in try/catch

Never break older stored projects

Never rename keys

Never restructure without approval

7. Mock AI Behaviour (PROTECTED)

simulateProcessing(projectId)

Always 3 seconds

Generates 5–8 clips

Non-overlapping timestamps

Scores: 72–95

Emotions rotate

Computes summary

NEVER change behaviour without approval.

8. UI Architecture
Dashboard

Grid of project cards

Stats row

Skeleton loader

slideUp animation

Project Details

Video player

Timeline with waveform

Playhead sync

Clip highlighting

Clip Editor

Aspect ratio switch

Trim

AI Insights

B-Roll Suggestions

Modal previews

Premium cinematic UI

9. Styling System
Colors
#0a0a0a (base)
#111111
#1a1a1a
white/5
white/10
white/20
white/80

Typography

text-2xl font-semibold

text-lg font-medium text-white/70

text-sm text-white/80

text-xs text-white/60

Motion (protected)

fadeIn

slideUp

scaleIn

gentlePulse

10. SEO & Metadata

Global (layout.tsx):

OG: /og-monoframe.png

Demo (demo/layout.tsx):

OG: /og-monoframe-demo.png

Both must exist under /public.

11. Performance Rules

No WASM

No real AI

No unnecessary dependencies

No hydration errors

12. Evolution Plan
Phase 1 — Current

Frontend-only

Mock AI

Phase 2 — Cloud

Backend

Accounts

Cloud storage

Phase 3 — Real AI

GPU scene detection

Real export pipeline

13. Protected Files

projectStore.ts

globals.css

next.config.js

dev.sh

cursorRules.md

This architecture doc

Any change requires:

APPROVED: modify <file> for <reason>

14. Development Checklist

Before merging changes:

No hydration errors

No console errors

Upload works

simulateProcessing works

Dashboard loads

Project Details loads

Editor loads

Demo loads

No design regressions

No protected-file modifications