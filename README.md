# MonoFrame Studio

Cinematic AI video studio – auto-detects the best moments, generates edits, and exports creator-ready clips for every platform.

## 🎬 Features

- **AI Moment Detection**: Automatically identifies the best moments in your video footage
- **Smart Editing**: Generates professional edits with AI-powered tools
- **Multi-Platform Export**: Optimized for YouTube, TikTok, Instagram, Twitter, and more
- **Modern Tech Stack**: Built with Next.js, FastAPI, and TypeScript

## 🎥 Why MonoFrame?

Creators spend hours editing their videos. MonoFrame uses AI to:

- Detect emotional peaks
- Score excitement
- Auto-cut scenes
- Deliver cinematic edits instantly

Our mission: **Let creators focus on creating — not editing.**

## 📁 Monorepo Structure

```
monoframe-studio/
├── apps/
│   ├── web/          # Next.js frontend (TypeScript + Tailwind)
│   └── api/          # FastAPI backend (Python)
├── packages/
│   ├── ai/           # AI processing and video analysis
│   ├── ui/           # Shared UI components
│   └── core/         # Core utilities and types
├── infra/            # Infrastructure configs
└── docs/             # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+

### Installation

```bash
# Install dependencies for all workspaces
pnpm install

# Install Python dependencies for API
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development

```bash
# Run all services (from root)
pnpm dev

# Or run individually:

# Frontend (Next.js)
cd apps/web
pnpm dev
# Open http://localhost:3000

# Backend (FastAPI)
cd apps/api
python main.py
# Open http://localhost:8000
# API docs: http://localhost:8000/docs
```

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Run formatting
pnpm format
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Web App](./apps/web/README.md)
- [API](./apps/api/README.md)

## 🛠️ Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18

### Backend

- FastAPI
- Python 3.10+
- Uvicorn
- Pydantic

### Tooling

- pnpm workspaces
- ESLint + Prettier
- TypeScript

## 📝 License

Private - All Rights Reserved
