'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ──────────────────────────── component ──────────────────────────── */

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-24 bg-[#050a05] overflow-hidden">
      {/* ── subtle grid pattern ── */}
      <div
        className="cta-grid-fit pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* ── large emerald glow behind content ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.12] blur-[140px]"
        style={{ backgroundColor: '#10B981' }}
        aria-hidden="true"
      />

      {/* ── decorative glow circles ── */}
      <motion.div
        className="pointer-events-none absolute left-[10%] top-[20%] h-64 w-64 rounded-full opacity-[0.06] blur-[80px]"
        style={{ backgroundColor: '#10B981' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
        suppressHydrationWarning
      />
      <motion.div
        className="pointer-events-none absolute right-[10%] bottom-[15%] h-48 w-48 rounded-full opacity-[0.05] blur-[60px]"
        style={{ backgroundColor: '#F43F5E' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        aria-hidden="true"
        suppressHydrationWarning
      />
      <motion.div
        className="pointer-events-none absolute right-[30%] top-[10%] h-32 w-32 rounded-full opacity-[0.04] blur-[50px]"
        style={{ backgroundColor: '#10B981' }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        aria-hidden="true"
        suppressHydrationWarning
      />

      {/* ── content ── */}
      <div ref={ref} className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* heading line 1 */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
          suppressHydrationWarning
        >
          READY TO
        </motion.h2>

        {/* heading line 2 – emerald gradient */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          suppressHydrationWarning
        >
          TRANSFORM?
        </motion.h2>

        {/* subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
          suppressHydrationWarning
        >
          Join FitForge today and get your first week FREE. No commitment, no
          excuses.
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10"
          suppressHydrationWarning
        >
          <Button
            size="lg"
            className="h-14 rounded-full px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/35"
            style={{ backgroundColor: '#10B981' }}
          >
            Claim Free Week
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </motion.div>

        {/* small text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4 text-xs text-zinc-600"
          suppressHydrationWarning
        >
          No credit card required. Cancel anytime.
        </motion.p>
      </div>

      {/* ── scoped styles for grid overlay ── */}
      <style jsx>{`
        .cta-grid-fit {
          background-image:
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>
    </section>
  );
}
