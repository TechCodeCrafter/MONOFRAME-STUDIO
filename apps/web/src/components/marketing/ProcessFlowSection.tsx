'use client';

import { Film, Sparkles, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

interface ProcessFlowSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Process steps */
  steps?: ProcessStep[];
  /** Show connecting lines */
  showConnectors?: boolean;
  /** Connector style */
  connectorStyle?: 'line' | 'arrow' | 'dotted';
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'gradient';
  /** Step style */
  stepStyle?: 'card' | 'minimal' | 'numbered';
}

export function ProcessFlowSection({
  title = 'How It Works',
  description = 'From upload to export in 3 simple steps',
  steps = [
    {
      number: '01',
      title: 'Upload Video',
      description: 'Drag and drop your raw footage directly in the browser',
      icon: Film,
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI analyzes scenes, emotions, and identifies best moments',
      icon: Sparkles,
      highlight: true,
    },
    {
      number: '03',
      title: 'Export',
      description: 'Download individual clips or complete highlight reel',
      icon: Zap,
    },
  ],
  showConnectors = true,
  connectorStyle = 'arrow',
  layout = 'horizontal',
  backgroundVariant = 'dark',
  stepStyle = 'card',
}: ProcessFlowSectionProps) {
  const backgroundClasses = {
    dark: 'bg-mono-charcoal text-mono-white',
    light: 'bg-mono-white text-mono-black',
    gradient: 'bg-gradient-to-b from-mono-black to-mono-charcoal text-mono-white',
  };

  const getStepClasses = (step: ProcessStep) => {
    const base = 'relative transition-all duration-300';

    if (stepStyle === 'card') {
      return `${base} p-8 border ${
        step.highlight
          ? 'border-mono-white bg-mono-white/5'
          : 'border-mono-border hover:border-mono-white hover:bg-mono-white/5'
      }`;
    }

    if (stepStyle === 'numbered') {
      return `${base} text-center`;
    }

    return `${base}`;
  };

  const renderConnector = (index: number, isLast: boolean) => {
    if (!showConnectors || isLast) return null;

    const connectorClasses = {
      line: 'h-0.5 bg-mono-border',
      arrow: 'flex items-center justify-center',
      dotted: 'h-0.5 bg-mono-border border-dashed',
    };

    if (layout === 'horizontal') {
      return (
        <div
          className={`${
            connectorStyle === 'arrow' ? '' : 'flex-1'
          } hidden md:block`}
        >
          {connectorStyle === 'arrow' ? (
            <div className="flex items-center justify-center mx-4">
              <ArrowRight className="w-8 h-8 text-mono-border" />
            </div>
          ) : (
            <div className={`w-full ${connectorClasses[connectorStyle]} my-8`} />
          )}
        </div>
      );
    }

    // Vertical layout
    return (
      <div className="flex justify-center my-6">
        {connectorStyle === 'arrow' ? (
          <ArrowRight className="w-8 h-8 text-mono-border rotate-90" />
        ) : (
          <div className={`h-12 w-0.5 ${connectorClasses[connectorStyle]}`} />
        )}
      </div>
    );
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

        {/* Process Flow */}
        <div
          className={`${
            layout === 'horizontal'
              ? 'flex flex-col md:flex-row items-center'
              : 'flex flex-col items-center max-w-2xl mx-auto'
          }`}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className={`${
                layout === 'horizontal' ? 'flex-1 w-full md:w-auto' : 'w-full'
              } flex ${layout === 'horizontal' ? 'flex-row' : 'flex-col'} items-center`}
            >
              {/* Step Card */}
              <RevealOnScroll delay={i * 100} className="w-full">
                <div className={getStepClasses(step)}>
                  {/* Card Style */}
                  {stepStyle === 'card' && (
                    <>
                      {/* Step Number */}
                      <div className="text-6xl font-bold text-mono-border mb-6">
                        {step.number}
                      </div>

                      {/* Icon */}
                      <step.icon className="w-12 h-12 mb-6" />

                      {/* Content */}
                      <h3 className="text-2xl font-semibold mb-4">
                        {step.title}
                      </h3>
                      <p className="text-mono-silver font-inter leading-relaxed">
                        {step.description}
                      </p>

                      {/* Highlight Badge */}
                      {step.highlight && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-green-400 text-mono-black text-xs font-bold rounded-full">
                          AI POWERED
                        </div>
                      )}
                    </>
                  )}

                  {/* Numbered Style */}
                  {stepStyle === 'numbered' && (
                    <div className="text-center">
                      {/* Circle with Number */}
                      <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-mono-white rounded-full mb-6 mx-auto">
                        <span className="text-3xl font-bold">{step.number}</span>
                      </div>

                      {/* Icon */}
                      <step.icon className="w-12 h-12 mb-6 mx-auto" />

                      {/* Content */}
                      <h3 className="text-2xl font-semibold mb-4">
                        {step.title}
                      </h3>
                      <p className="text-mono-silver font-inter leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  )}

                  {/* Minimal Style */}
                  {stepStyle === 'minimal' && (
                    <div className="flex flex-col items-center text-center">
                      {/* Icon in Circle */}
                      <div className="w-20 h-20 bg-mono-white/10 border border-mono-white/20 rounded-full flex items-center justify-center mb-6">
                        <step.icon className="w-10 h-10" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-mono-silver font-inter">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              </RevealOnScroll>

              {/* Connector */}
              {renderConnector(i, i === steps.length - 1)}
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        <RevealOnScroll delay={400}>
          <div className="text-center mt-16">
            <p className="text-mono-silver font-inter mb-6">
              Ready to transform your videos?
            </p>
            <button className="px-8 py-4 bg-mono-white text-mono-black hover:bg-mono-silver transition-all font-semibold inline-flex items-center gap-2">
              Get Started
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/**
 * Preset: Card (default card style)
 */
ProcessFlowSection.Card = function CardProcess(
  props: Omit<ProcessFlowSectionProps, 'stepStyle'>
) {
  return <ProcessFlowSection stepStyle="card" {...props} />;
};

/**
 * Preset: Numbered (numbered circles)
 */
ProcessFlowSection.Numbered = function NumberedProcess(
  props: Omit<ProcessFlowSectionProps, 'stepStyle'>
) {
  return <ProcessFlowSection stepStyle="numbered" {...props} />;
};

/**
 * Preset: Minimal (minimal style)
 */
ProcessFlowSection.Minimal = function MinimalProcess(
  props: Omit<ProcessFlowSectionProps, 'stepStyle'>
) {
  return <ProcessFlowSection stepStyle="minimal" {...props} />;
};

/**
 * Preset: Vertical (vertical layout)
 */
ProcessFlowSection.Vertical = function VerticalProcess(
  props: Omit<ProcessFlowSectionProps, 'layout'>
) {
  return <ProcessFlowSection layout="vertical" {...props} />;
};

/**
 * Preset: NoConnectors (no connecting lines)
 */
ProcessFlowSection.NoConnectors = function NoConnectorsProcess(
  props: Omit<ProcessFlowSectionProps, 'showConnectors'>
) {
  return <ProcessFlowSection showConnectors={false} {...props} />;
};

/**
 * Preset: Light (light background)
 */
ProcessFlowSection.Light = function LightProcess(
  props: Omit<ProcessFlowSectionProps, 'backgroundVariant'>
) {
  return <ProcessFlowSection backgroundVariant="light" {...props} />;
};

