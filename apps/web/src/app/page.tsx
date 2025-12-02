'use client';

import {
  HeroSection,
  DemoVideoSection,
  SocialProofSection,
  FeatureGrid,
  BeforeAfterSection,
  ProcessFlowSection,
  UseCasesSection,
  PricingTable,
  ComparisonTable,
  TestimonialsSection,
  FounderStorySection,
  FinalCtaSection,
  Footer,
} from '@/components/marketing';
import { 
  Sparkles, 
  Heart, 
  Zap, 
  Film, 
  Target, 
  Award 
} from 'lucide-react';

export default function Home() {
  // Feature data
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
    <main className="bg-[#0a0a0a] text-white relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 animate-pulse opacity-[0.03] bg-[url('/stars.png')] bg-repeat"></div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-white/[0.02]"></div>
        {/* 1. Hero Section - First Impression */}
        <HeroSection
          headline="Turn Raw Footage"
          headlineHighlight="Cinematic Stories"
          subheadline="MonoFrame Studio analyzes emotions, finds the best moments, and crafts highlight reels automatically. Like having a professional editor in your browser."
          badge="✨ AI-Powered Video Editing"
          primaryCtaText="Try Live Demo"
          primaryCtaHref="/demo/ai-editor"
          secondaryCtaText="View Pricing"
          secondaryCtaHref="#pricing"
          trustBadges={[
            'No credit card required',
            '100% browser-based',
            'Export in seconds'
          ]}
          enableParallax={true}
          enableGrid={true}
          enableFloatingElements={true}
        />

        {/* 2. Demo Video Section - Product Showcase */}
        <DemoVideoSection
          title="See It In Action"
          description="Watch how MonoFrame transforms a raw video into a cinematic highlight reel"
          ctaText="Try it yourself with your own video"
          ctaHref="/demo/ai-editor"
          showStats={true}
          stats={[
            { value: '3 min', label: 'Original length' },
            { value: '45 sec', label: 'Highlight reel' },
            { value: '8 clips', label: 'Best moments' },
          ]}
          enableWaveform={true}
          backgroundVariant="gradient"
        />

        {/* 3. Social Proof Section - Build Trust */}
        <SocialProofSection
          title="Trusted by creators worldwide"
          stats={[
            { value: '10K+', label: 'Videos Edited', icon: Zap },
            { value: '5K+', label: 'Active Creators', icon: Heart },
            { value: '98%', label: 'Satisfaction Rate', icon: Award },
          ]}
          testimonial={{
            quote: 'MonoFrame cut my editing time by 90%. I can now focus on creating content instead of spending hours in post-production.',
            author: 'Sarah Chen',
            role: 'Content Creator',
            company: 'YouTube',
            avatar: 'SC',
            rating: 5,
          }}
          companies={['Creator Co', 'MediaLab', 'Studio X', 'Agency Y']}
          backgroundVariant="dark"
        />

        {/* 4. Feature Grid - Show Capabilities */}
        <FeatureGrid
          title="Powered By AI, Built For Creators"
          description="Every feature designed to save you hours and deliver professional results"
          features={features}
          columns={3}
          enableGlass={true}
          enableHover={true}
          backgroundVariant="dark"
        />

        {/* 5. Before/After Section - Demonstrate Value */}
        <BeforeAfterSection
          title="Before & After MonoFrame"
          description="See the difference AI-powered editing makes"
          beforeTitle="Manual Editing"
          beforeItems={[
            { text: 'Hours watching entire footage' },
            { text: 'Manually marking every potential clip' },
            { text: 'Subjective guesswork on best moments' },
            { text: 'Time-consuming trimming and exporting' },
            { text: 'Inconsistent results', highlight: true },
          ]}
          beforeStat="4-8 hours"
          beforeStatLabel="Average editing time"
          afterTitle="MonoFrame Studio"
          afterItems={[
            { text: 'AI analyzes entire video in minutes' },
            { text: 'Automatic scene detection and marking' },
            { text: 'Data-driven emotional peak identification' },
            { text: 'One-click export of all highlights' },
            { text: 'Consistently professional results', highlight: true },
          ]}
          afterStat="5-10 minutes"
          afterStatLabel="Average editing time"
          showArrow={true}
          backgroundVariant="dark"
        />

        {/* 6. Process Flow Section - Show Workflow */}
        <ProcessFlowSection
          title="How It Works"
          description="From upload to export in 3 simple steps"
          showConnectors={true}
          connectorStyle="arrow"
          layout="horizontal"
          backgroundVariant="gradient"
        />

        {/* 7. Use Cases Section - Show Versatility */}
        <UseCasesSection
          title="Perfect For Every Creator"
          description="From solo creators to enterprise teams"
          columns={3}
          cardStyle="glass"
          enableHover={true}
          backgroundVariant="dark"
        />

        {/* 8. Pricing Table - Show Options */}
        <PricingTable
          title="Simple, Transparent Pricing"
          description="Choose the plan that fits your creative workflow"
          cardStyle="bordered"
          backgroundVariant="dark"
        />

        {/* 9. Comparison Table - Show Advantage */}
        <ComparisonTable
          title="How We Compare"
          description="MonoFrame Studio vs Traditional Video Editors"
          tableStyle="bordered"
          backgroundVariant="dark"
        />

        {/* 10. Testimonials Section - Show Results */}
        <TestimonialsSection
          title="Loved By Creators"
          description="See what our users are saying"
          columns={3}
          cardStyle="glass"
          showQuoteIcon={true}
          enableHover={true}
          backgroundVariant="dark"
        />

        {/* 11. Founder Story Section - Build Connection */}
        <FounderStorySection
          title="Why We Built MonoFrame"
          founderName="Praj Vaggu"
          founderTitle="Founder & CEO, MonoFrame Studio"
          founderAvatar="PV"
          layout="image-left"
          showQuote={true}
          backgroundVariant="gradient"
        />

        {/* 12. Final CTA Section - Drive Conversion */}
        <FinalCtaSection
          headline="Ready To Transform Your Videos?"
          subheadline="Join thousands of creators who've already discovered the future of video editing"
          primaryCtaText="Get Started"
          primaryCtaHref="/demo/ai-editor"
          secondaryCtaText="View Pricing"
          secondaryCtaHref="#pricing"
          showEmailCapture={false}
          trustBadges={[
            'No credit card required',
            'Cancel anytime',
            '14-day free trial',
          ]}
          showDecorations={true}
          backgroundVariant="dark"
        />

        {/* Footer - Site Map & Links */}
        <Footer
          companyName="MonoFrame Studio"
          showNewsletter={false}
          backgroundVariant="dark"
        />
      </div>
    </main>
  );
}
