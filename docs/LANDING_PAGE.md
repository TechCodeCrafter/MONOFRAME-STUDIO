# MonoFrame Studio - Landing Page Documentation

## Overview

The MonoFrame Studio landing page embodies the **Enterprise Brand Bible** principles: Cinematic, Minimal, Global, Timeless. Every element is designed to communicate precision, excellence, and cinematic artistry.

## Brand Adherence

### Color System

All colors strictly follow the brand bible:

- **Black (`#000000`)** - Primary background
- **White (`#FFFFFF`)** - Primary text and accents
- **Slate Gray (`#1A1A1A`)** - Section backgrounds
- **Soft Silver (`#D9D9D9`)** - Secondary text
- **Deep Shadow (`#0D0D0D`)** - Overlays
- **Film Fog (`#F2F2F2`)** - Subtle highlights

### Typography

- **Headlines**: Montserrat Bold (700)
- **Subheads**: Montserrat SemiBold (600)
- **Body Text**: Inter Regular (400)

### Design Principles

- **8-point grid system** for consistent spacing
- **High-contrast grayscale** imagery
- **Slow, elegant animations** with fade-based transitions
- **Thin-line monochrome icons** with geometric balance
- **Clean, unaltered logo** with proper spacing

## Page Sections

### 1. Hero Section (2.1)

**Purpose**: Immediate impact with cinematic presence

**Elements**:

- Large MONOFRAME wordmark in Montserrat Bold
- Cinematic tagline highlighting precision and excellence
- Dual CTA buttons (Primary: "Start Creating", Secondary: "Watch Demo")
- Trust badge for social proof
- Animated scroll indicator

**Animations**:

- Fade-up entrance for all content
- Smooth gradient overlay
- Bounce animation on scroll indicator

### 2. Product Showcase (2.2)

**Purpose**: Demonstrate the upload→analyze→export workflow

**Elements**:

- Three-step visual process flow
- Mock interface boxes with geometric shapes
- Real-time stats (95% time saved, <5min processing, 10K+ videos, 4.9★ rating)
- Staggered animation delays for visual hierarchy

**Design Notes**:

- Each step uses square aspect-ratio containers
- Minimal geometric shapes represent UI states
- Border-only boxes maintain brand minimalism
- Pulsing animation on "Analyzing" state

### 3. Features Section (2.3)

**Purpose**: Showcase 6 core capabilities with precision

**Features**:

1. **AI Scene Detection** - Frame-level emotional peak identification
2. **Smart Scoring** - Advanced engagement metrics analysis
3. **Auto-Cut Editing** - Multiple edit variations generation
4. **Multi-Platform Export** - One-click optimized exports
5. **Audio Analysis** - Music sync and sound design integration
6. **Batch Processing** - Simultaneous video processing

**Interactions**:

- Hover effect: icon fills with white background
- Staggered entrance animations
- Clean grid layout (2 columns on tablet, 3 on desktop)

### 4. Email Capture (2.4)

**Purpose**: Collect waitlist signups with backend integration

**Elements**:

- Headline: "Join the Waitlist"
- Value proposition copy
- Email input field with border-only styling
- Primary CTA button
- Privacy assurance text
- Success state with confirmation message

**Backend Integration**:

- **Endpoint**: `POST /api/waitlist`
- **Validation**: Email format validation via Pydantic
- **Duplicate Prevention**: Checks for existing emails
- **Response**: Success message and confirmation
- **Storage**: In-memory array (production: database)

**API Schema**:

```json
{
  "email": "user@example.com",
  "source": "landing_page"
}
```

### 5. Footer (2.5)

**Purpose**: Navigation, legal compliance, and brand reinforcement

**Structure**:

- **Brand Column**: Logo, company name, mission statement
- **Product Column**: Features, Pricing, Enterprise, API
- **Company Column**: About, Blog, Careers, Contact
- **Legal Column**: Privacy Policy, Terms, Cookie Policy, Brand Guidelines

**Bottom Bar**:

- Copyright notice with dynamic year
- Social media links (Twitter, LinkedIn, GitHub, YouTube)

## Technical Implementation

### Frontend Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom brand config
- **Fonts**: Google Fonts (Montserrat, Inter)
- **State Management**: React hooks
- **API Client**: Native Fetch API

### Backend Stack

- **Framework**: FastAPI
- **Validation**: Pydantic with EmailStr
- **CORS**: Configured for localhost:3000
- **Storage**: In-memory (prototype), database-ready

### Custom Tailwind Configuration

```typescript
// Brand colors
colors: {
  'mono-black': '#000000',
  'mono-white': '#FFFFFF',
  'mono-slate': '#1A1A1A',
  'mono-silver': '#D9D9D9',
  'mono-shadow': '#0D0D0D',
  'mono-fog': '#F2F2F2',
}

// Custom animations
animation: {
  'fade-in': 'fadeIn 1s ease-in',
  'fade-up': 'fadeUp 1s ease-out',
  'slide-in': 'slideIn 0.8s ease-out',
}
```

### Component Classes

```css
.btn-primary {
  /* White background, black text, sharp corners */
  @apply bg-mono-white text-mono-black font-montserrat font-semibold px-8 py-4 rounded-none;
}

.btn-secondary {
  /* White border, transparent fill, hover state */
  @apply border-2 border-mono-white text-mono-white hover:bg-mono-white hover:text-mono-black;
}
```

## API Endpoints

### POST /api/waitlist

Join the early access waitlist.

**Request Body**:

```json
{
  "email": "user@example.com",
  "source": "landing_page"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "email": "user@example.com"
}
```

**Error (400 Bad Request)**:

```json
{
  "detail": "Email already registered"
}
```

### GET /api/waitlist/count

Get total waitlist signups count.

**Response**:

```json
{
  "count": 142,
  "status": "ok"
}
```

## Running the Landing Page

### Development Mode

```bash
# Terminal 1: Start Next.js frontend
cd apps/web
pnpm dev
# Visit http://localhost:3000

# Terminal 2: Start FastAPI backend
cd apps/api
source venv/bin/activate
python main.py
# API at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Production Considerations

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Email Service**: Integrate SendGrid/Mailchimp for confirmation emails
3. **Analytics**: Add Google Analytics or Plausible
4. **Rate Limiting**: Prevent spam signups
5. **Environment Variables**: Configure API URLs via `.env`
6. **CDN**: Serve static assets via CDN
7. **SEO**: Add meta tags, Open Graph, Twitter Cards
8. **Performance**: Optimize images, lazy loading, code splitting

## Brand Compliance Checklist

- ✅ Black and white color palette exclusively
- ✅ Montserrat for all headlines
- ✅ Inter for all body text
- ✅ Sharp corners (no border radius except rounded-none)
- ✅ Slow, elegant animations
- ✅ High-contrast design
- ✅ Geometric icon shapes
- ✅ 8-point grid spacing
- ✅ Confident, minimal voice
- ✅ Logo appears clean and unaltered

## Accessibility

- Semantic HTML structure
- Sufficient color contrast (black/white ensures WCAG AAA compliance)
- Keyboard navigation support
- Focus states on interactive elements
- Screen reader friendly labels

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## Future Enhancements

1. Add video demo in hero section
2. Implement actual video upload preview
3. Add pricing section
4. Create comparison table
5. Add customer testimonials
6. Implement dark mode toggle (while maintaining monochrome aesthetic)
7. Add loading skeleton states
8. Implement A/B testing framework

---

**MonoFrame Identity**: Cinematic. Elite. Timeless.
