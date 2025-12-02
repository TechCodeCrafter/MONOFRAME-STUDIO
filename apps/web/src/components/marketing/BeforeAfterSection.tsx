'use client';

import { X, CheckCircle2, ArrowRight, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface ComparisonItem {
  text: string;
  highlight?: boolean;
}

interface BeforeAfterSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Before column title */
  beforeTitle?: string;
  /** Before column items */
  beforeItems?: ComparisonItem[];
  /** Before stat value */
  beforeStat?: string;
  /** Before stat label */
  beforeStatLabel?: string;
  /** After column title */
  afterTitle?: string;
  /** After column items */
  afterItems?: ComparisonItem[];
  /** After stat value */
  afterStat?: string;
  /** After stat label */
  afterStatLabel?: string;
  /** Show comparison arrow */
  showArrow?: boolean;
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'gradient';
  /** Icon style */
  iconStyle?: 'default' | 'minimal' | 'bold';
}

export function BeforeAfterSection({
  title = 'Before & After MonoFrame',
  description = 'See the difference AI-powered editing makes',
  beforeTitle = 'Manual Editing',
  beforeItems = [
    { text: 'Hours watching entire footage' },
    { text: 'Manually marking every potential clip' },
    { text: 'Subjective guesswork on best moments' },
    { text: 'Time-consuming trimming and exporting' },
    { text: 'Inconsistent results', highlight: true },
  ],
  beforeStat = '4-8 hours',
  beforeStatLabel = 'Average editing time',
  afterTitle = 'MonoFrame Studio',
  afterItems = [
    { text: 'AI analyzes entire video in minutes' },
    { text: 'Automatic scene detection and marking' },
    { text: 'Data-driven emotional peak identification' },
    { text: 'One-click export of all highlights' },
    { text: 'Consistently professional results', highlight: true },
  ],
  afterStat = '5-10 minutes',
  afterStatLabel = 'Average editing time',
  showArrow = true,
  backgroundVariant = 'dark',
  iconStyle = 'default',
}: BeforeAfterSectionProps) {
  const backgroundClasses = {
    dark: 'bg-mono-charcoal text-mono-white',
    light: 'bg-mono-white text-mono-black',
    gradient: 'bg-gradient-to-b from-mono-black to-mono-charcoal text-mono-white',
  };

  const getIconSize = () => {
    switch (iconStyle) {
      case 'minimal':
        return 'w-4 h-4';
      case 'bold':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
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

        {/* Two-Column Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          {/* Comparison Arrow (Desktop) */}
          {showArrow && (
            <RevealOnScroll delay={300}>
              <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-16 h-16 bg-mono-charcoal border-2 border-mono-white rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* BEFORE Column */}
          <RevealOnScroll delay={100}>
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="text-red-400 font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Before
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold">{beforeTitle}</h3>

              {/* Items */}
              <ul className="space-y-4">
                {beforeItems.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 font-inter transition-colors ${
                      item.highlight
                        ? 'text-red-400 font-semibold'
                        : 'text-mono-silver hover:text-mono-white'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {iconStyle === 'minimal' ? (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      ) : (
                        <X className={`${getIconSize()} text-red-500 flex-shrink-0`} />
                      )}
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* Stat */}
              {beforeStat && (
                <div className="pt-6 border-t border-red-500/20">
                  <div className="flex items-baseline gap-2">
                    <Clock className="w-6 h-6 text-red-400" />
                    <div className="text-4xl font-bold text-red-400">{beforeStat}</div>
                  </div>
                  <div className="text-mono-silver font-inter mt-2">{beforeStatLabel}</div>
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* AFTER Column */}
          <RevealOnScroll delay={200}>
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="text-green-400 font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  After
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold">{afterTitle}</h3>

              {/* Items */}
              <ul className="space-y-4">
                {afterItems.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 font-inter transition-colors ${
                      item.highlight
                        ? 'text-green-400 font-semibold'
                        : 'text-mono-silver hover:text-mono-white'
                    }`}
                  >
                    <CheckCircle2
                      className={`${getIconSize()} text-green-400 flex-shrink-0 mt-0.5`}
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* Stat */}
              {afterStat && (
                <div className="pt-6 border-t border-green-500/20">
                  <div className="flex items-baseline gap-2">
                    <Clock className="w-6 h-6 text-green-400" />
                    <div className="text-4xl font-bold text-green-400">{afterStat}</div>
                  </div>
                  <div className="text-mono-silver font-inter mt-2">{afterStatLabel}</div>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

/**
 * Preset: Minimal (no stats, minimal icons)
 */
BeforeAfterSection.Minimal = function MinimalComparison(
  props: Omit<BeforeAfterSectionProps, 'beforeStat' | 'afterStat' | 'iconStyle'>
) {
  return (
    <BeforeAfterSection
      beforeStat=""
      afterStat=""
      iconStyle="minimal"
      {...props}
    />
  );
};

/**
 * Preset: Bold (bold icons, emphasized)
 */
BeforeAfterSection.Bold = function BoldComparison(
  props: Omit<BeforeAfterSectionProps, 'iconStyle'>
) {
  return (
    <BeforeAfterSection
      iconStyle="bold"
      {...props}
    />
  );
};

/**
 * Preset: Compact (no arrow, shorter content)
 */
BeforeAfterSection.Compact = function CompactComparison(
  props: Omit<BeforeAfterSectionProps, 'showArrow'>
) {
  return (
    <BeforeAfterSection
      showArrow={false}
      {...props}
    />
  );
};

/**
 * Preset: Light (light background)
 */
BeforeAfterSection.Light = function LightComparison(
  props: Omit<BeforeAfterSectionProps, 'backgroundVariant'>
) {
  return (
    <BeforeAfterSection
      backgroundVariant="light"
      {...props}
    />
  );
};

