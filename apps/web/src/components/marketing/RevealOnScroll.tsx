'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  /** Animation delay in milliseconds (default: 0) */
  delay?: number;
  /** Animation duration in milliseconds (default: 600) */
  duration?: number;
  /** Distance to translate from (default: 40px) */
  distance?: number;
  /** Intersection observer threshold (default: 0.1) */
  threshold?: number;
  /** Only animate once (default: true) */
  once?: boolean;
  /** Custom className to add to wrapper */
  className?: string;
}

/**
 * RevealOnScroll Component
 * 
 * A reusable component that reveals its children with a smooth fade-up animation
 * when they enter the viewport using the Intersection Observer API.
 * 
 * @example
 * ```tsx
 * <RevealOnScroll delay={100} duration={800}>
 *   <h2>This will fade up when scrolled into view</h2>
 * </RevealOnScroll>
 * ```
 */
export function RevealOnScroll({
  children,
  delay = 0,
  duration: _duration = 600,
  distance: _distance = 40,
  threshold = 0.1,
  once = true,
  className = '',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const element = ref.current;
    if (!element) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // Unobserve after first trigger if 'once' is true
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // Allow re-triggering if 'once' is false
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, once, isMounted]);

  return (
    <div
      ref={ref}
      data-visible={isVisible}
      className={`${
        isMounted
          ? 'transition-all duration-[900ms] ease-out translate-y-6 opacity-0 scale-[0.98] data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 data-[visible=true]:scale-100'
          : ''
      } ${className}`}
      style={
        isMounted
          ? {
              transitionDelay: `${delay}ms`,
              willChange: 'opacity, transform',
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/**
 * Stagger multiple reveals with automatic delay calculation
 * 
 * @example
 * ```tsx
 * <RevealOnScroll.Stagger staggerDelay={100}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </RevealOnScroll.Stagger>
 * ```
 */
RevealOnScroll.Stagger = function RevealStagger({
  children,
  staggerDelay = 100,
  baseDelay = 0,
  ...props
}: RevealOnScrollProps & { staggerDelay?: number; baseDelay?: number }) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childrenArray.map((child, index) => (
        <RevealOnScroll
          key={index}
          delay={baseDelay + index * staggerDelay}
          {...props}
        >
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
};

/**
 * Preset: Fade Up (default)
 */
RevealOnScroll.FadeUp = function FadeUp(props: Omit<RevealOnScrollProps, 'distance'>) {
  return <RevealOnScroll distance={40} {...props} />;
};

/**
 * Preset: Fade Up Large (more dramatic)
 */
RevealOnScroll.FadeUpLarge = function FadeUpLarge(props: Omit<RevealOnScrollProps, 'distance' | 'duration'>) {
  return <RevealOnScroll distance={80} duration={800} {...props} />;
};

/**
 * Preset: Fade Up Small (subtle)
 */
RevealOnScroll.FadeUpSmall = function FadeUpSmall(props: Omit<RevealOnScrollProps, 'distance' | 'duration'>) {
  return <RevealOnScroll distance={20} duration={400} {...props} />;
};

