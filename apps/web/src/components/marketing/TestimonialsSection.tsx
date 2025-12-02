'use client';

import { Star, Quote } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { useCardSpotlight } from './useCardSpotlight';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
  featured?: boolean;
}

interface TestimonialsSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Testimonials array */
  testimonials?: Testimonial[];
  /** Grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Card style */
  cardStyle?: 'glass' | 'solid' | 'bordered' | 'minimal';
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'transparent';
  /** Show quote icon */
  showQuoteIcon?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
}

export function TestimonialsSection({
  title = 'Loved By Creators',
  description = 'See what our users are saying',
  testimonials = [
    {
      quote: 'MonoFrame cut my editing time by 90%. I can now focus on creating content instead of spending hours in post-production.',
      author: 'Sarah Chen',
      role: 'Content Creator',
      company: 'YouTube',
      avatar: 'SC',
      rating: 5,
    },
    {
      quote: 'The AI is incredibly accurate at finding emotional peaks. It\'s like having a seasoned editor analyzing every frame.',
      author: 'Marcus Rodriguez',
      role: 'Video Producer',
      company: 'Studio X',
      avatar: 'MR',
      rating: 5,
    },
    {
      quote: 'We use MonoFrame for all our client campaigns. The consistency and speed are unmatched. Game changer for agencies.',
      author: 'Emma Thompson',
      role: 'Social Media Manager',
      company: 'Agency Y',
      avatar: 'ET',
      rating: 5,
      featured: true,
    },
  ],
  columns = 3,
  cardStyle = 'glass',
  backgroundVariant = 'dark',
  showQuoteIcon = true,
  enableHover = true,
}: TestimonialsSectionProps) {
  const { handleMouseMove } = useCardSpotlight();
  
  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white',
    light: 'bg-mono-white text-mono-black',
    transparent: 'bg-transparent',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const getCardClasses = (testimonial: Testimonial) => {
    const base = 'p-8 transition-all duration-300 relative overflow-hidden group';

    const styles = {
      glass: `${base} border ${
        testimonial.featured ? 'border-mono-white' : 'border-mono-white/20'
      } bg-mono-white/5 backdrop-blur-lg ${
        enableHover ? 'hover:border-mono-white/40 hover:bg-mono-white/10' : ''
      }`,
      
      solid: `${base} border ${
        testimonial.featured ? 'border-mono-white' : 'border-mono-border'
      } bg-mono-charcoal ${
        enableHover ? 'hover:border-mono-white hover:bg-mono-charcoal/80' : ''
      }`,
      
      bordered: `${base} border ${
        testimonial.featured ? 'border-mono-white' : 'border-mono-border'
      } ${
        enableHover ? 'hover:border-mono-white hover:bg-mono-white/5' : ''
      }`,
      
      minimal: `${base} ${enableHover ? 'hover:bg-mono-white/5' : ''}`,
    };

    return styles[cardStyle];
  };

  return (
    <section className={`py-28 px-4 ${backgroundClasses[backgroundVariant]}`}>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {(title || description) && (
          <RevealOnScroll.FadeUp>
            <div className="text-center mb-20">
              {title && (
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xl text-mono-silver font-inter">
                  {description}
                </p>
              )}
            </div>
          </RevealOnScroll.FadeUp>
        )}

        {/* Testimonials Grid */}
        <div className={`grid ${columnClasses[columns]} gap-8`}>
          {testimonials.map((testimonial, i) => (
            <RevealOnScroll key={i} delay={i * 100}>
              <div 
                className={getCardClasses(testimonial)}
                onMouseMove={handleMouseMove}
              >
                {/* Cursor-follow spotlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.28), transparent 60%)",
                  }}
                />
                
                {/* Glass shine effect */}
                {cardStyle === 'glass' && enableHover && (
                  <div className="absolute inset-0 bg-gradient-to-br from-mono-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {/* Quote Icon Watermark */}
                {showQuoteIcon && (
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-16 h-16" />
                  </div>
                )}

                <div className="relative z-10">
                  {/* Rating */}
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star
                          key={j}
                          className="w-5 h-5 fill-mono-white text-mono-white"
                        />
                      ))}
                      {testimonial.rating && testimonial.rating < 5 &&
                        [...Array(5 - testimonial.rating)].map((_, j) => (
                          <Star
                            key={j + (testimonial.rating || 0)}
                            className="w-5 h-5 text-mono-silver"
                          />
                        ))}
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="text-lg font-inter leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-mono-white/20 to-mono-white/5 border border-mono-white/20 rounded-full flex items-center justify-center font-semibold text-lg backdrop-blur-sm flex-shrink-0">
                      {testimonial.avatar ||
                        testimonial.author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="font-semibold text-lg">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-mono-silver font-inter">
                        {testimonial.role}
                        {testimonial.company && (
                          <span className="text-mono-silver/60">
                            {' • '}
                            {testimonial.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Badge */}
                {testimonial.featured && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-400 text-mono-black text-xs font-bold rounded-full">
                    FEATURED
                  </div>
                )}

                {/* Corner Accent */}
                {testimonial.featured && (
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-mono-white/10" />
                )}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Preset: Glass (default glassmorphism)
 */
TestimonialsSection.Glass = function GlassTestimonials(
  props: Omit<TestimonialsSectionProps, 'cardStyle'>
) {
  return <TestimonialsSection cardStyle="glass" {...props} />;
};

/**
 * Preset: Solid (solid background cards)
 */
TestimonialsSection.Solid = function SolidTestimonials(
  props: Omit<TestimonialsSectionProps, 'cardStyle'>
) {
  return <TestimonialsSection cardStyle="solid" {...props} />;
};

/**
 * Preset: Minimal (clean, minimal cards)
 */
TestimonialsSection.Minimal = function MinimalTestimonials(
  props: Omit<TestimonialsSectionProps, 'cardStyle' | 'showQuoteIcon'>
) {
  return (
    <TestimonialsSection
      cardStyle="minimal"
      showQuoteIcon={false}
      {...props}
    />
  );
};

/**
 * Preset: TwoColumn (2-column layout)
 */
TestimonialsSection.TwoColumn = function TwoColumnTestimonials(
  props: Omit<TestimonialsSectionProps, 'columns'>
) {
  return <TestimonialsSection columns={2} {...props} />;
};

/**
 * Preset: FourColumn (4-column layout)
 */
TestimonialsSection.FourColumn = function FourColumnTestimonials(
  props: Omit<TestimonialsSectionProps, 'columns'>
) {
  return <TestimonialsSection columns={4} {...props} />;
};

/**
 * Preset: Light (light background)
 */
TestimonialsSection.Light = function LightTestimonials(
  props: Omit<TestimonialsSectionProps, 'backgroundVariant'>
) {
  return <TestimonialsSection backgroundVariant="light" {...props} />;
};

