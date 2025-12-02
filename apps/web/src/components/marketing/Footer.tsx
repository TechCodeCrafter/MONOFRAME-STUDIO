'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Twitter, Linkedin, Youtube, Github, CheckCircle2 } from 'lucide-react';
import { WaitlistSignup } from './WaitlistSignup';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

interface FooterProps {
  /** Company name */
  companyName?: string;
  /** Footer columns */
  columns?: FooterColumn[];
  /** Social links */
  socialLinks?: SocialLink[];
  /** Show newsletter signup */
  showNewsletter?: boolean;
  /** Copyright text */
  copyrightText?: string;
  /** Background variant */
  backgroundVariant?: 'dark' | 'light';
}

export function Footer({
  companyName = 'MonoFrame Studio',
  columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Demo', href: '/demo/ai-editor' },
        { label: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Tutorials', href: '#' },
        { label: 'Community', href: '#' },
        { label: 'Support', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Cookie Policy', href: '#' },
      ],
    },
  ],
  socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
  ],
  showNewsletter = false,
  copyrightText,
  backgroundVariant = 'dark',
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      // Handle newsletter submission
    }
  };

  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white border-t border-mono-border',
    light: 'bg-mono-white text-mono-black border-t border-gray-200',
  };

  const currentYear = new Date().getFullYear();
  const copyright = copyrightText || `© ${currentYear} ${companyName}. All rights reserved.`;

  return (
    <footer className={`py-16 px-4 ${backgroundClasses[backgroundVariant]}`}>
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-8 h-8 stroke-current"
                viewBox="0 0 32 32"
                fill="none"
                strokeWidth="1.5"
              >
                <rect x="4" y="4" width="24" height="24" />
                <line x1="16" y1="4" x2="16" y2="28" />
                <line x1="4" y1="16" x2="28" y2="16" />
              </svg>
              <span className="text-xl font-bold">{companyName}</span>
            </div>

            {/* Tagline */}
            <p className="text-mono-silver font-inter text-sm mb-6 max-w-sm">
              AI-powered video editing for the modern creator. Transform raw footage into cinematic stories.
            </p>

            {/* Waitlist Signup */}
            {showNewsletter && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Join the waitlist
                </label>
                <WaitlistSignup 
                  compact={true}
                  inlineSuccess={true}
                  placeholder="Your email"
                  buttonText="Join"
                />
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mono-silver hover:text-mono-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {columns.map((column, i) => (
            <div key={i} className="lg:col-span-1">
              <h4 className="font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-sm text-mono-silver hover:text-mono-white transition-colors font-inter"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-mono-border flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-mono-silver font-inter">
            {copyright}
          </p>

          {/* Additional Links (optional) */}
          <div className="flex gap-6 text-sm text-mono-silver font-inter">
            <Link href="#" className="hover:text-mono-white transition-colors">
              Status
            </Link>
            <Link href="#" className="hover:text-mono-white transition-colors">
              Changelog
            </Link>
            <Link href="#" className="hover:text-mono-white transition-colors">
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Preset: WithNewsletter (includes newsletter signup)
 */
Footer.WithNewsletter = function FooterWithNewsletter(
  props: Omit<FooterProps, 'showNewsletter'>
) {
  return <Footer showNewsletter={true} {...props} />;
};

/**
 * Preset: Light (light background)
 */
Footer.Light = function LightFooter(
  props: Omit<FooterProps, 'backgroundVariant'>
) {
  return <Footer backgroundVariant="light" {...props} />;
};

/**
 * Preset: Minimal (minimal columns, no newsletter)
 */
Footer.Minimal = function MinimalFooter(
  props: Omit<FooterProps, 'columns' | 'showNewsletter'>
) {
  const minimalColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  ];

  return (
    <Footer
      columns={minimalColumns}
      showNewsletter={false}
      {...props}
    />
  );
};

