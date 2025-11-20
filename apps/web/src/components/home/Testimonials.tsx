'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "MonoFrame cut my editing time from 3 hours to 5 minutes. I can't believe this is real.",
    author: 'Alex Chen',
    role: 'Content Creator',
    avatar: 'AC',
  },
  {
    quote:
      "The emotion curve analysis is scary accurate. It finds moments I didn't even know existed.",
    author: 'Sarah Martinez',
    role: 'Wedding Videographer',
    avatar: 'SM',
  },
  {
    quote:
      'This is what editing will look like in 2030. MonoFrame is 5 years ahead of everyone else.',
    author: 'David Kim',
    role: 'Film Director',
    avatar: 'DK',
  },
];

/**
 * Testimonials - User testimonials section
 */
export default function Testimonials() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Curve */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 300 Q 300 100, 600 300 T 1200 300"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="font-montserrat text-sm text-mono-silver/60 tracking-widest uppercase mb-4">
            Trusted by Creators
          </p>
          <h2 className="font-montserrat font-bold text-5xl md:text-6xl mb-6">
            What People Are Saying
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative h-full bg-mono-slate/30 border border-mono-silver/15 rounded-lg p-8 hover:border-mono-white/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                {/* Quote Mark */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-mono-white rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-mono-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                </div>

                {/* Quote Text */}
                <blockquote className="font-inter text-lg text-mono-white leading-relaxed mb-8 mt-4">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-4 pt-6 border-t border-mono-silver/10">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-mono-white/10 border border-mono-silver/30 flex items-center justify-center font-montserrat font-bold text-mono-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-montserrat font-semibold text-mono-white">
                      {testimonial.author}
                    </p>
                    <p className="font-inter text-sm text-mono-silver">{testimonial.role}</p>
                  </div>
                </div>

                {/* Subtle Glow on Hover */}
                <div className="absolute inset-0 rounded-lg bg-mono-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="font-inter text-mono-silver/80">
            Join <span className="text-mono-white font-semibold">2,000+</span> creators using
            MonoFrame
          </p>
        </motion.div>
      </div>
    </section>
  );
}
