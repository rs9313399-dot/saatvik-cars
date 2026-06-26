'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Play, Flame, Dumbbell, Clock, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ──────────────────────────── animation helpers ──────────────────────────── */

const fadeSlideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" as const, },
})

const fadeSlideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" as const, },
})

/* ──────────────────────────── stat-card data ──────────────────────────────── */

const statCards = [
  { icon: Flame, label: '2,450 Cal Burned', emoji: '🔥', delay: 0.3, y: [0, -12, 0] },
  { icon: Dumbbell, label: '150+ Workouts', emoji: '💪', delay: 0.5, y: [0, -16, 0] },
  { icon: Clock, label: '45 Min Session', emoji: '⏱', delay: 0.7, y: [0, -10, 0] },
]

/* ──────────────────────────── component ───────────────────────────────────── */

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#050a05' }}
    >
      {/* ── grid pattern overlay ── */}
      <div
        className="hero-grid-fit pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* ── center depth glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, #10B981 0%, #F43F5E 40%, transparent 70%)',
          }}
        />
      </div>

      {/* ── content ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* ──── LEFT: text ──── */}
          <div className="flex-1 text-center lg:text-left">
            {/* badge */}
            <motion.div {...fadeSlideLeft(0)} suppressHydrationWarning>
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  borderColor: '#10B981',
                  color: '#10B981',
                  backgroundColor: 'rgba(16,185,129,0.08)',
                }}
              >
                🔥 INDIA&apos;S #1 PREMIUM GYM
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              {...fadeSlideLeft(0.15)}
              className="mt-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
              suppressHydrationWarning
            >
              <span className="block text-white">FORGE YOUR</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
                }}
              >
                PERFECT BODY
              </span>
            </motion.h1>

            {/* subtitle */}
            <motion.p
              {...fadeSlideLeft(0.3)}
              className="mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              suppressHydrationWarning
            >
              World-class equipment. Expert trainers. Results that speak for
              themselves.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...fadeSlideLeft(0.45)}
              className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start"
              suppressHydrationWarning
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105"
                style={{ backgroundColor: '#10B981' }}
              >
                Start Your Journey
                <ArrowRight className="ml-2 size-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-8 text-base font-semibold border-white/20 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-transform hover:scale-105"
              >
                <Play className="mr-2 size-4 fill-current" />
                Watch Tour
              </Button>
            </motion.div>

            {/* stats row */}
            <motion.div
              {...fadeSlideLeft(0.6)}
              className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
              suppressHydrationWarning
            >
              {[
                ['500+', 'Members'],
                ['50+', 'Classes'],
                ['15+', 'Trainers'],
              ].map(([num, label], i) => (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <span
                      className="mr-6 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                  )}
                  <div>
                    <span
                      className="text-xl font-bold"
                      style={{ color: '#10B981' }}
                    >
                      {num}
                    </span>{' '}
                    <span
                      className="text-sm"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ──── RIGHT: dynamic visual ──── */}
          <div className="relative flex flex-1 items-center justify-center min-h-[420px]">
            {/* emerald glow circle */}
            <div
              className="pointer-events-none absolute h-[400px] w-[400px] rounded-full opacity-25 blur-[80px]"
              style={{ backgroundColor: '#10B981' }}
              aria-hidden="true"
            />

            {/* floating stat cards */}
            {statCards.map((card, idx) => {
              const positions = [
                'top-4 right-4 sm:top-8 sm:right-8',
                'bottom-16 right-2 sm:bottom-20 sm:right-4',
                'top-1/2 left-0 -translate-y-1/2 sm:left-2',
              ]
              return (
                <motion.div
                  key={card.label}
                  {...fadeSlideRight(card.delay)}
                  suppressHydrationWarning
                  className={`absolute z-20 ${positions[idx]}`}
                >
                  <motion.div
                    animate={{ y: card.y }}
                    transition={{
                      duration: 3 + idx * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 shadow-xl backdrop-blur-md"
                    suppressHydrationWarning
                  >
                    <span className="text-2xl">{card.emoji}</span>
                    <span
                      className="whitespace-nowrap text-sm font-semibold text-white"
                    >
                      {card.label}
                    </span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        suppressHydrationWarning
      >
        <ChevronDown className="size-6 text-white/40" />
      </motion.div>

      {/* ── scoped styles for grid overlay ── */}
      <style jsx>{`
        .hero-grid-fit {
          background-image:
            linear-gradient(rgba(16, 185, 129, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>
    </section>
  )
}
