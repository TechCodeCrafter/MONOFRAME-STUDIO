# MonoFrame Studio - Setup Guide

## ✅ Completed Setup

All components of EPIC 1 have been successfully set up:

### 1.1 - Monorepo Folder Structure ✓

```
MONOFRAME-STUDIO/
├── apps/
│   ├── web/          # Next.js frontend (Port 3000)
│   └── api/          # FastAPI backend (Port 8000)
├── packages/
│   ├── ai/           # AI processing package
│   ├── ui/           # Shared UI components
│   └── core/         # Core utilities and types
├── infra/            # Infrastructure configs
└── docs/             # Documentation
```

### 1.2 - Next.js App ✓

- **Location**: `apps/web/`
- **Stack**: Next.js 14, TypeScript, Tailwind CSS, React 18
- **Features**:
  - App Router
  - TypeScript configured
  - Tailwind CSS styled landing page
  - Beautiful gradient UI
  - Import alias (@/\*)

**Run locally**:

```bash
cd apps/web
pnpm dev
# Visit http://localhost:3000
```

### 1.3 - FastAPI Backend ✓

- **Location**: `apps/api/`
- **Stack**: FastAPI, Python 3.10+, Uvicorn, Pydantic
- **Endpoints**:
  - `GET /` - Welcome message
  - `GET /health` - Health check (returns `{"status": "ok"}`)
- **Features**:
  - CORS configured for frontend
  - OpenAPI docs at `/docs`
  - Dockerfile included

**Run locally**:

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Visit http://localhost:8000
# API docs: http://localhost:8000/docs
```

### 1.4 - Shared Tooling ✓

- **pnpm**: Monorepo workspace manager
- **ESLint**: Linting configured across all packages
- **Prettier**: Code formatting configured
- **TypeScript**: Shared TypeScript configuration

**Available Commands**:

```bash
# From root directory
pnpm install          # Install all dependencies
pnpm dev              # Run all services
pnpm lint             # Lint all packages
pnpm format           # Format all code
pnpm format:check     # Check formatting
```

## Package Structure

### @monoframe/ai

AI processing and video analysis package.

```typescript
import { detectBestMoments, generateEdit } from '@monoframe/ai';
```

### @monoframe/ui

Shared React UI components.

```typescript
import { Button } from '@monoframe/ui';
```

### @monoframe/core

Core utilities and shared types.

```typescript
import { formatDuration, VideoProject, ExportFormat } from '@monoframe/core';
```

## Verification

All components have been verified:

- ✅ Folder structure created
- ✅ Next.js app configured with TypeScript and Tailwind
- ✅ FastAPI backend with /health route
- ✅ pnpm workspace configured
- ✅ ESLint and Prettier set up
- ✅ All code formatted
- ✅ Python syntax validated

## Next Steps

1. Start both services:
   - Frontend: `cd apps/web && pnpm dev`
   - Backend: `cd apps/api && python main.py`
2. Begin development on AI video processing features
3. Implement user authentication
4. Build out the video upload and processing pipeline
5. Add database integration

## Troubleshooting

### pnpm not found

```bash
npm install -g pnpm
```

### Python packages not installing

Make sure you're using Python 3.10 or higher and have activated the virtual environment.

### Next.js build issues

The Next.js build may require additional permissions on some systems. You can run the dev server without building:

```bash
cd apps/web
pnpm dev
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.
