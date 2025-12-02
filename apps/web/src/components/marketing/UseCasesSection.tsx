'use client';

import { 
  Users, 
  Lightbulb, 
  Globe, 
  TrendingUp, 
  Shield, 
  MessageSquare,
  Video,
  Briefcase
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { useCardSpotlight } from './useCardSpotlight';

interface UseCase {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: boolean;
}

interface UseCasesSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Use cases array */
  useCases?: UseCase[];
  /** Grid columns */
  columns?: 2 | 3 | 4;
  /** Card style */
  cardStyle?: 'glass' | 'solid' | 'bordered' | 'minimal';
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'transparent';
  /** Enable hover effects */
  enableHover?: boolean;
  /** Stagger delay (ms) */
  staggerDelay?: number;
}

export function UseCasesSection({
  title = 'Perfect For Every Creator',
  description = 'From solo creators to enterprise teams',
  useCases = [
    {
      icon: Users,
      title: 'Content Creators',
      description: 'YouTube, TikTok, Instagram—turn long videos into viral clips',
    },
    {
      icon: Lightbulb,
      title: 'Marketing Agencies',
      description: 'Deliver client campaigns faster with consistent, professional results',
      highlight: true,
    },
    {
      icon: Globe,
      title: 'Event Videographers',
      description: 'Create highlight reels from weddings, conferences, and events',
    },
    {
      icon: TrendingUp,
      title: 'Social Media Managers',
      description: 'Repurpose webinars and podcasts into engaging social content',
    },
    {
      icon: Shield,
      title: 'Corporate Teams',
      description: 'Transform internal videos into training materials and updates',
    },
    {
      icon: MessageSquare,
      title: 'Educators',
      description: 'Extract key moments from lectures and presentations',
    },
  ],
  columns = 3,
  cardStyle = 'glass',
  backgroundVariant = 'dark',
  enableHover = true,
  staggerDelay = 100,
}: UseCasesSectionProps) {
  const { handleMouseMove } = useCardSpotlight();
  
  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white',
    light: 'bg-mono-white text-mono-black',
    transparent: 'bg-transparent',
  };

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const getCardClasses = (useCase: UseCase) => {
    const base = 'p-8 transition-all duration-300 relative overflow-hidden group';

    const styles = {
      glass: `${base} border ${
        useCase.highlight ? 'border-mono-white' : 'border-mono-white/20'
      } bg-mono-white/5 backdrop-blur-lg ${
        enableHover ? 'hover:border-mono-white/40 hover:bg-mono-white/10' : ''
      }`,
      
      solid: `${base} border ${
        useCase.highlight ? 'border-mono-white' : 'border-mono-border'
      } bg-mono-charcoal ${
        enableHover ? 'hover:border-mono-white hover:bg-mono-charcoal/80' : ''
      }`,
      
      bordered: `${base} border ${
        useCase.highlight ? 'border-mono-white' : 'border-mono-border'
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

        {/* Use Cases Grid */}
        <div className={`grid ${columnClasses[columns]} gap-8`}>
          {useCases.map((useCase, i) => (
            <RevealOnScroll key={i} delay={i * staggerDelay}>
              <div 
                className={`${getCardClasses(useCase)} hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-[0px_0px_40px_rgba(255,255,255,0.07)]`}
                onMouseMove={handleMouseMove}
              >
                {/* Cursor-follow spotlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.22), transparent 55%)",
                  }}
                />
                
                {/* Glass shine effect */}
                {cardStyle === 'glass' && enableHover && (
                  <div className="absolute inset-0 bg-gradient-to-br from-mono-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {/* Icon glow effect */}
                {enableHover && (
                  <div className="absolute top-8 left-8 w-12 h-12 bg-mono-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <useCase.icon 
                    className={`w-12 h-12 mb-6 transition-all duration-300 ${
                      enableHover ? 'group-hover:scale-110 group-hover:rotate-6' : ''
                    } ${
                      useCase.highlight 
                        ? 'text-mono-white' 
                        : 'text-mono-silver group-hover:text-mono-white'
                    }`}
                  />

                  {/* Title */}
                  <h3 className="text-2xl font-semibold mb-4 transition-colors duration-300">
                    {useCase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-mono-silver font-inter leading-relaxed transition-colors duration-300 group-hover:text-mono-white/90">
                    {useCase.description}
                  </p>
                </div>

                {/* Highlight Badge */}
                {useCase.highlight && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-400 text-mono-black text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}

                {/* Bottom glow line */}
                {enableHover && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mono-white to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
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
UseCasesSection.Glass = function GlassUseCases(
  props: Omit<UseCasesSectionProps, 'cardStyle'>
) {
  return <UseCasesSection cardStyle="glass" {...props} />;
};

/**
 * Preset: Solid (solid background cards)
 */
UseCasesSection.Solid = function SolidUseCases(
  props: Omit<UseCasesSectionProps, 'cardStyle'>
) {
  return <UseCasesSection cardStyle="solid" {...props} />;
};

/**
 * Preset: Minimal (clean, minimal cards)
 */
UseCasesSection.Minimal = function MinimalUseCases(
  props: Omit<UseCasesSectionProps, 'cardStyle'>
) {
  return <UseCasesSection cardStyle="minimal" {...props} />;
};

/**
 * Preset: TwoColumn (2-column layout)
 */
UseCasesSection.TwoColumn = function TwoColumnUseCases(
  props: Omit<UseCasesSectionProps, 'columns'>
) {
  return <UseCasesSection columns={2} {...props} />;
};

/**
 * Preset: FourColumn (4-column layout)
 */
UseCasesSection.FourColumn = function FourColumnUseCases(
  props: Omit<UseCasesSectionProps, 'columns'>
) {
  return <UseCasesSection columns={4} {...props} />;
};

/**
 * Preset: Light (light background)
 */
UseCasesSection.Light = function LightUseCases(
  props: Omit<UseCasesSectionProps, 'backgroundVariant'>
) {
  return <UseCasesSection backgroundVariant="light" {...props} />;
};

