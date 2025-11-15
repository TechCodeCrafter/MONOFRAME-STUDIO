# MonoFrame Studio - Architecture

## Overview

MonoFrame Studio is a monorepo-based application for cinematic AI video editing.

## Monorepo Structure

```
monoframe-studio/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # FastAPI backend service
├── packages/
│   ├── ai/           # AI processing and video analysis
│   ├── ui/           # Shared UI components
│   └── core/         # Core utilities and types
├── infra/            # Infrastructure and deployment configs
└── docs/             # Documentation
```

## Technology Stack

### Frontend (`apps/web`)

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (to be expanded)

### Backend (`apps/api`)

- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Server**: Uvicorn

### Shared Packages

- **@monoframe/ai**: Video analysis and AI processing
- **@monoframe/ui**: Reusable React components
- **@monoframe/core**: Shared types and utilities

## Key Features

1. **AI Moment Detection**: Automatically identifies the best moments in video footage
2. **Smart Editing**: Generates professional edits automatically
3. **Multi-Platform Export**: Optimized exports for YouTube, TikTok, Instagram, etc.

## Development Workflow

1. Use pnpm workspaces for dependency management
2. Shared tooling (ESLint, Prettier) across all packages
3. TypeScript for type safety in JavaScript/TypeScript code
4. Python type hints for backend code
