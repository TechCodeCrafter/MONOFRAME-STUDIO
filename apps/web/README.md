# MonoFrame Studio - Web App

Next.js web application for MonoFrame Studio with a cinematic landing page following the Enterprise Brand Bible.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
pnpm build
pnpm start
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom brand config
- **React 18** - Latest React features
- **Google Fonts** - Montserrat & Inter

## Project Structure

```
apps/web/
├── src/
│   └── app/
│       ├── layout.tsx       # Root layout with fonts
│       ├── page.tsx         # Landing page
│       └── globals.css      # Global styles & brand utilities
├── tailwind.config.ts       # Tailwind + brand colors
├── next.config.js           # Next.js config + API proxy
└── tsconfig.json            # TypeScript config
```

## Brand System

### Colors

All colors follow the MonoFrame Enterprise Brand Bible:

```typescript
'mono-black': '#000000',    // Primary background
'mono-white': '#FFFFFF',    // Primary text
'mono-slate': '#1A1A1A',    // Section backgrounds
'mono-silver': '#D9D9D9',   // Secondary text
'mono-shadow': '#0D0D0D',   // Overlays
'mono-fog': '#F2F2F2',      // Highlights
```

### Typography

- **Headlines**: Montserrat Bold (700)
- **Subheads**: Montserrat SemiBold (600)
- **Body**: Inter Regular (400)

### Custom Components

```tsx
// Primary button (white bg, black text)
<button className="btn-primary">Start Creating</button>

// Secondary button (white border, transparent)
<button className="btn-secondary">Watch Demo</button>
```

## Landing Page Sections

1. **Hero** - Cinematic introduction with dual CTAs
2. **Product Showcase** - Upload → AI → Export workflow
3. **Features** - 6 core capabilities with icons
4. **Email Capture** - Waitlist signup with backend integration
5. **Footer** - Navigation, legal, brand links

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`.

### Waitlist Endpoint

```typescript
POST / api / waitlist;
{
  email: 'user@example.com';
  source: 'landing_page';
}
```

### Next.js API Proxy

The `next.config.js` includes a rewrite rule to proxy `/api/*` requests to the FastAPI backend.

## Development Guidelines

### Adding New Sections

1. Follow the 8-point grid system (multiples of 8px)
2. Use brand colors exclusively
3. Implement fade-based animations
4. Maintain high contrast (black/white)
5. Use Montserrat for headings, Inter for body

### Animation Classes

```tsx
className = 'animate-fade-in'; // Fade in effect
className = 'animate-fade-up'; // Fade up from below
className = 'animate-slide-in'; // Slide in from left

// Stagger animations
className = 'animate-fade-up animation-delay-200';
className = 'animate-fade-up animation-delay-400';
```

### Responsive Design

```tsx
// Mobile-first approach
className = 'text-4xl md:text-6xl lg:text-8xl';
className = 'grid md:grid-cols-2 lg:grid-cols-3';
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Linting & Formatting

```bash
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm format:check  # Check formatting
```

## Performance Optimization

- **Font Optimization**: Google Fonts with `next/font`
- **Image Optimization**: Use `next/image` for images
- **Code Splitting**: Automatic with App Router
- **CSS Optimization**: Tailwind purges unused styles

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t monoframe-web .
docker run -p 3000:3000 monoframe-web
```

## Testing

```bash
# Run tests (to be implemented)
pnpm test

# Run E2E tests (to be implemented)
pnpm test:e2e
```

## Accessibility

- Semantic HTML structure
- WCAG AAA color contrast (black/white)
- Keyboard navigation
- Focus states on all interactive elements
- Screen reader friendly

## Brand Compliance

✅ Cinematic aesthetic  
✅ Minimal design  
✅ Black & white palette  
✅ Montserrat headlines  
✅ Inter body text  
✅ Sharp corners (no border radius)  
✅ Slow, elegant animations  
✅ High contrast

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MonoFrame Brand Bible](../../docs/LANDING_PAGE.md)

---

**Mission**: Let creators focus on creating — not editing.
