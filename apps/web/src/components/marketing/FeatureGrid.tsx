'use client';

import { LucideIcon } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { useCardSpotlight } from './useCardSpotlight';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

interface FeatureGridProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Array of features to display */
  features: Feature[];
  /** Grid columns (default: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** Enable glassmorphism effect */
  enableGlass?: boolean;
  /** Enable hover animations */
  enableHover?: boolean;
  /** Stagger delay between cards (ms) */
  staggerDelay?: number;
  /** Card variant */
  variant?: 'glass' | 'solid' | 'bordered' | 'minimal';
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'transparent';
}

export function FeatureGrid({
  title = 'Powered By AI, Built For Creators',
  description = 'Every feature designed to save you hours and deliver professional results',
  features,
  columns = 3,
  enableGlass = true,
  enableHover = true,
  staggerDelay = 100,
  variant = 'glass',
  backgroundVariant = 'dark',
}: FeatureGridProps) {
  const { handleMouseMove } = useCardSpotlight();
  
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white',
    light: 'bg-mono-white text-mono-black',
    transparent: 'bg-transparent',
  };

  const getCardClasses = (isHighlight: boolean = false) => {
    const base = 'p-8 transition-all duration-200';
    
    const variants = {
      glass: `${enableGlass ? 'bg-mono-white/5 backdrop-blur-lg' : 'bg-mono-charcoal'} border ${
        isHighlight ? 'border-mono-white' : 'border-mono-white/20'
      } ${enableHover ? 'hover:border-white/20 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:bg-mono-white/10' : ''}`,
      
      solid: `bg-mono-charcoal border ${
        isHighlight ? 'border-mono-white' : 'border-mono-border'
      } ${enableHover ? 'hover:border-white/20 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:bg-mono-charcoal/80' : ''}`,
      
      bordered: `bg-transparent border ${
        isHighlight ? 'border-mono-white' : 'border-mono-border'
      } ${enableHover ? 'hover:border-white/20 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:bg-mono-white/5' : ''}`,
      
      minimal: `bg-transparent ${enableHover ? 'hover:bg-mono-white/5' : ''}`,
    };

    return `${base} ${variants[variant]} ${isHighlight ? 'ring-2 ring-mono-white/20' : ''}`;
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
                <p className="text-xl text-mono-silver font-inter max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          </RevealOnScroll.FadeUp>
        )}

        {/* Feature Grid */}
        <div className={`grid ${columnClasses[columns]} gap-8`}>
          {features.map((feature, i) => (
            <RevealOnScroll key={i} delay={i * staggerDelay}>
              <div 
                className={`${getCardClasses(feature.highlight)} group relative overflow-hidden hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-[0px_0px_40px_rgba(255,255,255,0.07)]`}
                onMouseMove={handleMouseMove}
              >
                {/* Cursor-follow spotlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.25), transparent 55%)",
                  }}
                />
                
                {/* Glass shine effect */}
                {enableGlass && (
                  <div className="absolute inset-0 bg-gradient-to-br from-mono-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {/* Icon glow effect (behind icon) */}
                {enableHover && (
                  <div className="absolute top-8 left-8 w-12 h-12 bg-mono-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <feature.icon 
                    className={`w-12 h-12 mb-6 transition-all duration-300 ${
                      enableHover ? 'group-hover:scale-110 group-hover:rotate-6' : ''
                    } ${feature.highlight ? 'text-mono-white' : 'text-mono-silver group-hover:text-mono-white'}`}
                  />

                  {/* Title */}
                  <h3 className="text-2xl font-semibold mb-4 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-mono-silver font-inter leading-relaxed transition-colors duration-300 group-hover:text-mono-white/90">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent (highlight only) */}
                {feature.highlight && (
                  <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-mono-white/30" />
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
FeatureGrid.Glass = function GlassGrid(props: Omit<FeatureGridProps, 'variant' | 'enableGlass'>) {
  return (
    <FeatureGrid
      variant="glass"
      enableGlass={true}
      {...props}
    />
  );
};

/**
 * Preset: Solid (solid background cards)
 */
FeatureGrid.Solid = function SolidGrid(props: Omit<FeatureGridProps, 'variant' | 'enableGlass'>) {
  return (
    <FeatureGrid
      variant="solid"
      enableGlass={false}
      {...props}
    />
  );
};

/**
 * Preset: Bordered (border-only cards)
 */
FeatureGrid.Bordered = function BorderedGrid(props: Omit<FeatureGridProps, 'variant'>) {
  return (
    <FeatureGrid
      variant="bordered"
      {...props}
    />
  );
};

/**
 * Preset: Minimal (no borders, hover only)
 */
FeatureGrid.Minimal = function MinimalGrid(props: Omit<FeatureGridProps, 'variant' | 'enableGlass'>) {
  return (
    <FeatureGrid
      variant="minimal"
      enableGlass={false}
      {...props}
    />
  );
};

/**
 * Preset: TwoColumn (2-column layout)
 */
FeatureGrid.TwoColumn = function TwoColumnGrid(props: Omit<FeatureGridProps, 'columns'>) {
  return (
    <FeatureGrid
      columns={2}
      {...props}
    />
  );
};

/**
 * Preset: FourColumn (4-column layout)
 */
FeatureGrid.FourColumn = function FourColumnGrid(props: Omit<FeatureGridProps, 'columns'>) {
  return (
    <FeatureGrid
      columns={4}
      {...props}
    />
  );
};

