# RevealOnScroll Component

A professional, performant scroll animation component using the Intersection Observer API.

## Features

- ✅ **Fade-up animation** when elements enter viewport
- ✅ **Intersection Observer API** (no scroll listeners)
- ✅ **Customizable** timing, distance, and threshold
- ✅ **Preset animations** for common use cases
- ✅ **Stagger support** for multiple children
- ✅ **TypeScript** with full type safety
- ✅ **Performance optimized** with `will-change`
- ✅ **SSR safe** (client component)

---

## Basic Usage

```tsx
import { RevealOnScroll } from '@/components/marketing';

export default function Page() {
  return (
    <RevealOnScroll>
      <h1>This will fade up when scrolled into view</h1>
    </RevealOnScroll>
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content to animate |
| `delay` | `number` | `0` | Animation delay in ms |
| `duration` | `number` | `600` | Animation duration in ms |
| `distance` | `number` | `40` | Distance to translate from (px) |
| `threshold` | `number` | `0.1` | Intersection observer threshold (0-1) |
| `once` | `boolean` | `true` | Only animate once (vs. every time entering viewport) |
| `className` | `string` | `''` | Custom CSS classes |

---

## Advanced Examples

### Custom Timing

```tsx
<RevealOnScroll delay={200} duration={800} distance={60}>
  <div>Slower, more dramatic animation</div>
</RevealOnScroll>
```

### Repeat Animation

```tsx
<RevealOnScroll once={false}>
  <div>Animates every time it enters/exits viewport</div>
</RevealOnScroll>
```

### Custom Threshold

```tsx
<RevealOnScroll threshold={0.5}>
  <div>Triggers when 50% of element is visible</div>
</RevealOnScroll>
```

---

## Presets

### FadeUp (Default)

```tsx
<RevealOnScroll.FadeUp>
  <h2>Standard fade-up (40px, 600ms)</h2>
</RevealOnScroll.FadeUp>
```

### FadeUpLarge (Dramatic)

```tsx
<RevealOnScroll.FadeUpLarge>
  <h1>Dramatic fade-up (80px, 800ms)</h1>
</RevealOnScroll.FadeUpLarge>
```

### FadeUpSmall (Subtle)

```tsx
<RevealOnScroll.FadeUpSmall>
  <p>Subtle fade-up (20px, 400ms)</p>
</RevealOnScroll.FadeUpSmall>
```

---

## Stagger Effect

Animate multiple children with automatic delay calculation:

```tsx
<RevealOnScroll.Stagger staggerDelay={100} baseDelay={200}>
  <div>Item 1 (delays: 200ms)</div>
  <div>Item 2 (delays: 300ms)</div>
  <div>Item 3 (delays: 400ms)</div>
</RevealOnScroll.Stagger>
```

---

## Real-World Example: Hero Section

```tsx
export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <RevealOnScroll.FadeUpLarge delay={0}>
          <h1 className="text-6xl font-bold mb-6">
            MonoFrame Studio
          </h1>
        </RevealOnScroll.FadeUpLarge>

        <RevealOnScroll delay={200}>
          <p className="text-xl text-mono-silver mb-8">
            AI-Powered Video Editing
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <button className="px-8 py-4 bg-mono-white text-mono-black">
            Get Started
          </button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

---

## Real-World Example: Feature Grid

```tsx
export default function Features() {
  const features = [
    { title: 'AI Analysis', desc: 'Smart scene detection' },
    { title: 'Auto Cuts', desc: 'Intelligent editing' },
    { title: 'Export', desc: 'Professional output' },
  ];

  return (
    <section className="py-24">
      <RevealOnScroll.FadeUp>
        <h2 className="text-4xl font-bold text-center mb-16">Features</h2>
      </RevealOnScroll.FadeUp>

      <div className="grid grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <RevealOnScroll key={i} delay={i * 100}>
            <div className="p-8 border border-mono-border">
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-mono-silver">{feature.desc}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
```

---

## Performance Tips

1. **Use `once={true}`** (default) for better performance
2. **Adjust `threshold`** based on content height:
   - Large content: `threshold={0.1}` (trigger early)
   - Small content: `threshold={0.5}` (wait for more visibility)
3. **Limit stagger items** to <10 for best results
4. **Use presets** for consistency across your app

---

## Browser Support

- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

Intersection Observer is widely supported. For older browsers, animations will simply appear without transition (graceful degradation).

---

## Implementation Details

**Why Intersection Observer?**
- ❌ **Scroll listeners**: Fire constantly, impact performance
- ✅ **Intersection Observer**: Native browser API, optimized by engine

**Performance Optimizations:**
- Uses `will-change` CSS hint
- Unobserves elements after animation (when `once={true}`)
- Uses `requestAnimationFrame` internally (via browser)
- No forced reflows or layout thrashing

---

## Troubleshooting

### Animation not triggering?
- Check `threshold` prop (try `0.1` for tall content)
- Ensure element has height (can't observe 0-height elements)
- Check if element is inside a `overflow: hidden` container

### Animation too fast/slow?
- Adjust `duration` prop (default: 600ms)
- Adjust `delay` prop for sequence timing

### Multiple animations overlapping?
- Use `delay` to stagger them
- Or use `RevealOnScroll.Stagger` for automatic staggering

---

## Next Steps

- Add more presets (fade-in, slide-in-left/right, scale)
- Add easing function customization
- Add blur effect option
- Add rotation/skew effects

