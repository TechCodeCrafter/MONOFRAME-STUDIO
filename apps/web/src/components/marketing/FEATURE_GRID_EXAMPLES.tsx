/**
 * FeatureGrid Component - Usage Examples
 * 
 * This file contains real-world examples of how to use the FeatureGrid component
 * with various configurations and use cases.
 */

import { 
  Sparkles, 
  Heart, 
  Zap, 
  Film, 
  Target, 
  Award,
  Shield,
  Clock,
  Globe,
  TrendingUp,
  Users,
  Code,
  Palette,
  Rocket,
  Lock,
  Smartphone,
  BarChart,
  MessageSquare
} from 'lucide-react';
import { FeatureGrid } from './FeatureGrid';

// ============================================================================
// EXAMPLE 1: MonoFrame AI Video Editor Features (Default)
// ============================================================================

export function MonoFrameFeatures() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Scene Detection',
      description: 'Automatically identifies and segments scenes using machine learning algorithms',
    },
    {
      icon: Heart,
      title: 'Emotion Analysis',
      description: 'Detects emotional peaks—joy, surprise, excitement—to find the best moments',
    },
    {
      icon: Zap,
      title: 'Smart Highlights',
      description: 'Generates cinematic highlight reels based on engagement and emotional scoring',
    },
    {
      icon: Film,
      title: 'Timeline Editor',
      description: 'Visual timeline with AI-suggested cuts, trim points, and scene markers',
    },
    {
      icon: Target,
      title: 'Motion Tracking',
      description: 'Track subjects and objects across frames for dynamic compositions',
    },
    {
      icon: Award,
      title: 'One-Click Export',
      description: 'Export individual clips or complete projects in multiple formats instantly',
    },
  ];

  return (
    <FeatureGrid
      title="Powered By AI, Built For Creators"
      description="Every feature designed to save you hours and deliver professional results"
      features={features}
    />
  );
}

// ============================================================================
// EXAMPLE 2: SaaS Platform Features (Glassmorphism)
// ============================================================================

export function SaaSPlatformFeatures() {
  const features = [
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together in real-time with your team, no matter where they are',
      highlight: true, // Featured
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified with bank-level encryption and compliance',
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Lightning-fast delivery with 99.9% uptime across 150+ edge locations',
    },
    {
      icon: BarChart,
      title: 'Advanced Analytics',
      description: 'Deep insights into user behavior, performance metrics, and trends',
    },
    {
      icon: Code,
      title: 'Developer API',
      description: 'Robust REST & GraphQL APIs with comprehensive documentation',
    },
    {
      icon: Rocket,
      title: 'Instant Deploy',
      description: 'Push to production in seconds with automated CI/CD pipelines',
    },
  ];

  return (
    <FeatureGrid.Glass
      title="Everything You Need To Scale"
      description="Built for teams that move fast and demand reliability"
      features={features}
    />
  );
}

// ============================================================================
// EXAMPLE 3: E-commerce Features (Solid Cards)
// ============================================================================

export function EcommerceFeatures() {
  const features = [
    {
      icon: Lock,
      title: 'Secure Checkout',
      description: 'PCI-DSS compliant payment processing with fraud detection',
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Beautiful shopping experience on any device, any screen size',
    },
    {
      icon: TrendingUp,
      title: 'Sales Analytics',
      description: 'Track revenue, conversion rates, and customer behavior in real-time',
    },
    {
      icon: MessageSquare,
      title: '24/7 Support',
      description: 'Live chat support available around the clock for your customers',
    },
  ];

  return (
    <FeatureGrid.Solid
      title="Built For Commerce"
      description="Everything you need to run a successful online store"
      features={features}
      columns={2}
      backgroundVariant="light"
    />
  );
}

// ============================================================================
// EXAMPLE 4: Design Tool Features (Bordered)
// ============================================================================

export function DesignToolFeatures() {
  const features = [
    {
      icon: Palette,
      title: 'Infinite Canvas',
      description: 'Create without constraints on an unlimited, zoomable workspace',
    },
    {
      icon: Sparkles,
      title: 'AI Design Assistant',
      description: 'Get smart suggestions for layouts, colors, and typography',
    },
    {
      icon: Users,
      title: 'Real-Time Collab',
      description: 'Design together with your team, see changes as they happen',
    },
    {
      icon: Code,
      title: 'Developer Handoff',
      description: 'Export production-ready code in React, Vue, or HTML/CSS',
    },
    {
      icon: Globe,
      title: 'Asset Library',
      description: 'Access millions of stock photos, icons, and illustrations',
    },
    {
      icon: Clock,
      title: 'Version History',
      description: 'Never lose work with automatic saves and unlimited undo',
    },
  ];

  return (
    <FeatureGrid.Bordered
      title="Design Like Never Before"
      description="Professional tools that feel like magic"
      features={features}
      backgroundVariant="transparent"
    />
  );
}

// ============================================================================
// EXAMPLE 5: Minimal Features (4-column)
// ============================================================================

export function MinimalFeatures() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Enterprise-grade security',
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Built for teams',
    },
    {
      icon: Globe,
      title: 'Global',
      description: 'Worldwide coverage',
    },
  ];

  return (
    <FeatureGrid.Minimal
      features={features}
      columns={4}
      backgroundVariant="transparent"
    />
  );
}

// ============================================================================
// EXAMPLE 6: Highlighting Specific Features
// ============================================================================

export function HighlightedFeatures() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Machine learning that gets smarter with every use',
      highlight: true, // This feature will be visually emphasized
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Automate repetitive tasks and focus on what matters',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized by industry leaders for innovation',
      highlight: true, // This feature will also be emphasized
    },
    {
      icon: Lock,
      title: 'Secure',
      description: 'Your data is encrypted and protected at all times',
    },
    {
      icon: TrendingUp,
      title: 'Scalable',
      description: 'Grows with your business, from startup to enterprise',
    },
    {
      icon: MessageSquare,
      title: 'Support',
      description: 'Expert help whenever you need it, day or night',
    },
  ];

  return (
    <FeatureGrid
      title="Why Choose Us"
      description="The features that set us apart from the competition"
      features={features}
    />
  );
}

// ============================================================================
// EXAMPLE 7: Custom Styling with No Hover Effects
// ============================================================================

export function StaticFeatures() {
  const features = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Built with security at every layer',
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Serve users anywhere in the world',
    },
    {
      icon: Users,
      title: 'Team Ready',
      description: 'Collaboration tools built-in',
    },
  ];

  return (
    <FeatureGrid
      features={features}
      enableHover={false}
      enableGlass={false}
      variant="bordered"
    />
  );
}

// ============================================================================
// EXAMPLE 8: Fast Stagger Animation
// ============================================================================

export function FastStaggerFeatures() {
  const features = [
    { icon: Zap, title: 'Fast', description: 'Blazing fast performance' },
    { icon: Shield, title: 'Secure', description: 'Enterprise security' },
    { icon: Users, title: 'Collaborative', description: 'Team features' },
    { icon: Globe, title: 'Global', description: 'Worldwide reach' },
    { icon: Clock, title: 'Reliable', description: '99.9% uptime' },
    { icon: Award, title: 'Quality', description: 'Best in class' },
  ];

  return (
    <FeatureGrid
      title="Built Different"
      features={features}
      staggerDelay={50} // Faster animation stagger
    />
  );
}

// ============================================================================
// USAGE IN PAGES
// ============================================================================

/*
// In your page component:

import { MonoFrameFeatures, SaaSPlatformFeatures } from '@/components/marketing/FEATURE_GRID_EXAMPLES';

export default function HomePage() {
  return (
    <div>
      <MonoFrameFeatures />
      <SaaSPlatformFeatures />
    </div>
  );
}
*/

/*
// Or import FeatureGrid directly:

import { FeatureGrid } from '@/components/marketing';
import { Sparkles, Heart, Zap } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    { icon: Sparkles, title: 'Feature 1', description: 'Description 1' },
    { icon: Heart, title: 'Feature 2', description: 'Description 2' },
    { icon: Zap, title: 'Feature 3', description: 'Description 3' },
  ];

  return <FeatureGrid features={features} />;
}
*/

