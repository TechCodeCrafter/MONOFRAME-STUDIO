'use client';

import Link from 'next/link';
import { CheckCircle2, Zap, Crown, Building2 } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface PricingTier {
  name: string;
  tagline?: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  highlighted?: boolean;
}

interface PricingTableProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Pricing tiers */
  tiers?: PricingTier[];
  /** Enable annual/monthly toggle */
  enableBillingToggle?: boolean;
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'transparent';
  /** Card style */
  cardStyle?: 'glass' | 'solid' | 'bordered';
}

export function PricingTable({
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that fits your creative workflow',
  tiers = [
    {
      name: 'STARTER',
      tagline: 'For individuals',
      price: 'Free',
      description: 'Perfect for trying out MonoFrame',
      features: [
        '3 videos per month',
        'Up to 10 minutes each',
        'AI analysis & detection',
        'Basic export options',
        'Community support',
      ],
      cta: {
        text: 'Try Free Demo',
        href: '/demo/ai-editor',
        variant: 'secondary',
      },
      icon: Zap,
    },
    {
      name: 'PRO',
      tagline: 'For professionals',
      price: 29,
      period: '/mo',
      description: 'For serious creators and agencies',
      features: [
        'Unlimited videos',
        'Up to 60 minutes each',
        'Advanced AI features',
        'Priority processing',
        'All export formats',
        'Priority support',
        'Custom branding',
      ],
      cta: {
        text: 'Start Free Trial',
        href: '/signup',
        variant: 'primary',
      },
      badge: 'MOST POPULAR',
      icon: Crown,
      highlighted: true,
    },
    {
      name: 'ENTERPRISE',
      tagline: 'For teams',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Unlimited video length',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
      cta: {
        text: 'Contact Sales',
        href: '/contact',
        variant: 'secondary',
      },
      icon: Building2,
    },
  ],
  enableBillingToggle = false,
  backgroundVariant = 'dark',
  cardStyle = 'bordered',
}: PricingTableProps) {
  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white',
    light: 'bg-mono-white text-mono-black',
    transparent: 'bg-transparent',
  };

  const getCardClasses = (tier: PricingTier) => {
    const base = 'p-8 transition-all duration-300 relative';
    
    if (tier.highlighted) {
      return `${base} border-2 border-white/30 shadow-[0_0_18px_rgba(255,255,255,0.25)] scale-105 ${
        cardStyle === 'glass'
          ? 'bg-mono-white/10 backdrop-blur-lg'
          : cardStyle === 'solid'
          ? 'bg-mono-charcoal'
          : 'bg-mono-black'
      }`;
    }

    const styles = {
      glass: `${base} border border-mono-white/20 bg-mono-white/5 backdrop-blur-lg hover:border-mono-white/40 hover:bg-mono-white/10`,
      solid: `${base} border border-mono-border bg-mono-charcoal hover:border-mono-white`,
      bordered: `${base} border border-mono-border hover:border-mono-white`,
    };

    return styles[cardStyle];
  };

  const getCtaClasses = (variant?: 'primary' | 'secondary', isHighlighted?: boolean) => {
    const base = 'block w-full py-3 text-center font-semibold transition-all';
    
    if (variant === 'primary' || isHighlighted) {
      return `${base} bg-mono-white text-mono-black hover:bg-mono-silver`;
    }
    
    return `${base} border border-mono-border hover:border-mono-white hover:bg-mono-white/5`;
  };

  return (
    <section id="pricing" className={`py-28 px-4 ${backgroundClasses[backgroundVariant]}`}>
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

        {/* Billing Toggle (if enabled) */}
        {enableBillingToggle && (
          <RevealOnScroll delay={100}>
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center gap-4 p-1 border border-mono-border rounded-full">
                <button className="px-6 py-2 rounded-full bg-mono-white text-mono-black font-semibold">
                  Monthly
                </button>
                <button className="px-6 py-2 rounded-full text-mono-silver hover:text-mono-white transition-colors">
                  Annual
                  <span className="ml-2 text-xs text-green-400">Save 20%</span>
                </button>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <RevealOnScroll key={i} delay={i * 100}>
              <div className={getCardClasses(tier)}>
                {/* Badge (Most Popular, etc.) */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs uppercase tracking-wide px-3 py-1 rounded-full">
                    {tier.badge}
                  </div>
                )}

                {/* Icon */}
                {tier.icon && (
                  <tier.icon className="w-10 h-10 mb-4 text-mono-silver" />
                )}

                {/* Tier Name */}
                <div className="text-sm font-semibold text-mono-silver mb-2">
                  {tier.name}
                </div>

                {/* Tagline */}
                {tier.tagline && (
                  <div className="text-xs text-mono-silver/60 mb-4">
                    {tier.tagline}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  {typeof tier.price === 'number' ? (
                    <div className="text-5xl font-bold">
                      ${tier.price}
                      {tier.period && (
                        <span className="text-xl font-normal text-mono-silver">
                          {tier.period}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-5xl font-bold">{tier.price}</div>
                  )}
                </div>

                {/* Description */}
                <p className="text-mono-silver font-inter mb-8">
                  {tier.description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-inter">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-mono-white" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={tier.cta.href}
                  className={getCtaClasses(tier.cta.variant, tier.highlighted)}
                >
                  {tier.cta.text}
                </Link>

                {/* Highlight glow effect */}
                {tier.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-mono-white/5 to-transparent pointer-events-none" />
                )}
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Footer Note */}
        <RevealOnScroll delay={400}>
          <p className="text-center text-sm text-mono-silver font-inter mt-12">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/**
 * Preset: Glass (glassmorphism cards)
 */
PricingTable.Glass = function GlassPricing(
  props: Omit<PricingTableProps, 'cardStyle'>
) {
  return <PricingTable cardStyle="glass" {...props} />;
};

/**
 * Preset: Solid (solid background cards)
 */
PricingTable.Solid = function SolidPricing(
  props: Omit<PricingTableProps, 'cardStyle'>
) {
  return <PricingTable cardStyle="solid" {...props} />;
};

/**
 * Preset: Light (light background)
 */
PricingTable.Light = function LightPricing(
  props: Omit<PricingTableProps, 'backgroundVariant'>
) {
  return <PricingTable backgroundVariant="light" {...props} />;
};

/**
 * Preset: WithToggle (includes billing toggle)
 */
PricingTable.WithToggle = function TogglePricing(
  props: Omit<PricingTableProps, 'enableBillingToggle'>
) {
  return <PricingTable enableBillingToggle={true} {...props} />;
};

