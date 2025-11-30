# 🎬 MonoFrame Studio  
### **The First AI Film Editor — Built for the Browser**

MonoFrame Studio is a **cinematic, AI-assisted video editor** that runs entirely in the browser.  
Think **DaVinci Resolve × Cursor AI** — a premium editing environment with instant AI insights.

This is the **official repository**, containing the frontend-only MVP of MonoFrame Studio.

---

## 🚀 Features (MVP)

### **⚡ Instant Upload + AI Processing**
- Upload a video (max 5MB)
- Mock AI generates 5–8 cinematic clips
- 3-second processing → instant feedback

### **🎥 Project Dashboard**
- All projects stored in browser localStorage
- Premium project cards
- Thumbnails, scores, durations, and timestamps

### **📊 Project Details**
- Full video preview
- Interactive timeline with audio waveform
- Auto-playhead tracking (clip highlights)
- Cinematic UI with glow & motion

### **✂️ Clip Editor**
- Aspect ratio switching (16:9, 9:16, 1:1, 4:5)
- Trim UI (coming soon)
- AI Insights panel
- AI B-Roll suggestions (mocked)
- Smooth fullscreen with crop-accurate container
- Beautiful animations throughout

### **🧪 Live Demo**
A standalone showcase page available at:

/demo


---

## 🏗️ Architecture at a Glance

MonoFrame Studio is currently:

- **Frontend-only (Next.js 14)**
- **Mock AI only (no real processing yet)**
- **Data stored in localStorage**
- **Base64 encoded videos (<= 5MB)**
- **Cinematic UI with Tailwind CSS**
- **Strict SSR hydration rules followed**

For full system design, see:


---

## 🗂 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS, custom animations
- **State & Storage:** React Hooks + localStorage
- **Media Handling:** Base64 video URLs
- **Animations:** Custom CSS + minimal framer-motion
- **Tooling:** pnpm, Cursor AI, Vercel-ready structure

---

## 📦 Getting Started

### **1. Install dependencies**
```bash
pnpm install

## 2. Fix macOS file descriptor limit
./dev.sh

## 3. Start dev server
pnpm dev

Your app will be live at:
http://localhost:3000


# 🔒 Project Stability Rules
## MonoFrame follows Ultra-Strict Cursor Rules:
These are documented in:
/cursorRules.md

Protected files include:

apps/web/src/lib/projectStore.ts

apps/web/src/app/globals.css

apps/web/next.config.js

dev.sh

Do NOT modify these unless explicitly approved via:
APPROVED: modify <file> for <reason>

## 📄 License
MIT (will be upgraded to commercial license when launching SaaS)


Without this exact string, no change is allowed.

---

# 🔐 2. Protected Behaviors (DO NOT BREAK)

The following behaviours are **untouchable**:

### Upload → Mock AI (3 seconds) → Dashboard → Project Details → Clip Editor

### Mock AI rules:
- always 3-second delay
- always generate 5–8 clips
- scores between 72–95
- emotions rotate
- sequential, non-overlapping clips

### UI flows:
- aspect ratio switcher
- timeline with playhead tracking
- B-roll suggestions panel
- premium cinematic dark UI
- demo page

---

# 📐 3. Coding Standards

### TypeScript
- Strict mode
- No `any`
- Interfaces for all shapes
- Return types required

### React
- App Router only
- Hooks only, no class components
- `isMounted` hydration pattern required for:
  - dashboard
  - upload
  - project details
  - editor

### Styling
- Tailwind-only (no inline CSS)
- Use spacing scale: `2, 4, 6, 8, 12, 16, 24, 32`
- No random spacing like `mt-[37px]`

### Animations
Only use animations defined in:


---

# 🔄 5. Adding New Features (Allowed)

You may add:

- new UI components  
- new editor panels  
- new sidebar sections  
- new animations  
- new modals  
- new actions  

As long as they do NOT:

- break the protected flow  
- touch protected files  
- change existing core logic  

---

# ❗ 6. Changes Requiring Owner Approval

Request approval BEFORE doing:

- backend / real AI
- ffmpeg.wasm
- clip generation changes
- timeline logic changes
- project storage changes
- route restructuring
- modifying design system
- modifying global animations

---

# ✔ 7. Merge Checklist

Before merging:

- [ ] No hydration warnings
- [ ] No console errors  
- [ ] Upload works  
- [ ] simulateProcessing works  
- [ ] Dashboard loads  
- [ ] Project details loads  
- [ ] Clip editor loads  
- [ ] Demo page loads  
- [ ] No design regressions  
- [ ] No protected files touched without permission  

---

# 🎬 Final Note

MonoFrame Studio is a **life application**.
Consistency > cleverness.  
Stability > improvisation.  
Always follow the architecture and rules.

Happy contributing.
