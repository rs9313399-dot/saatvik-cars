'use client'

import { useRef } from 'react'
import { motion, useInView, type Variants } from "framer-motion";
import { Check, X, Crown, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ──────────────────────────── types ───────────────────────────────────────── */

interface PricingFeature {
  label: string
  included: boolean
}

interface PricingTier {
  id: string
  name: string
  price: number
  period: string
  icon: React.ElementType
  features: PricingFeature[]
  popular: boolean
  accentColor: string
  borderColor: string
  glowClass: string
  buttonStyle: React.CSSProperties
  buttonClassName: string
}

/* ──────────────────────────── data ────────────────────────────────────────── */

const tiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 999,
    period: '/month',
    icon: Zap,
    popular: false,
    accentColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.15)',
    glowClass: '',
    buttonStyle: { backgroundColor: '#10B981' },
    buttonClassName:
      'w-full h-12 rounded-full text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105',
    features: [
      { label: 'Gym Access (6AM–10PM)', included: true },
      { label: 'Locker Room', included: true },
      { label: 'Basic Equipment', included: true },
      { label: '2 Group Classes / week', included: true },
      { label: 'Personal Training', included: false },
      { label: 'Diet Plan', included: false },
      { label: 'Spa Access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 2499,
    period: '/month',
    icon: Star,
    popular: true,
    accentColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.50)',
    glowClass: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    buttonStyle: { backgroundColor: '#10B981' },
    buttonClassName:
      'w-full h-12 rounded-full text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105',
    features: [
      { label: '24/7 Gym Access', included: true },
      { label: 'All Equipment', included: true },
      { label: 'Unlimited Group Classes', included: true },
      { label: '4 Personal Training / month', included: true },
      { label: 'Diet Plan', included: true },
      { label: 'Spa Access', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 4999,
    period: '/month',
    icon: Crown,
    popular: false,
    accentColor: '#F43F5E',
    borderColor: 'rgba(244,63,94,0.35)',
    glowClass: '',
    buttonStyle: { backgroundColor: '#F43F5E' },
    buttonClassName:
      'w-full h-12 rounded-full text-base font-semibold text-white shadow-lg shadow-rose-500/20 transition-transform hover:scale-105',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Unlimited Personal Training', included: true },
      { label: 'Custom Diet Plan', included: true },
      { label: 'Spa & Recovery', included: true },
      { label: 'Priority Booking', included: true },
      { label: 'Guest Passes (2/month)', included: true },
    ],
  },
]

/* ──────────────────────────── animation helpers ──────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", },
  },
}

/* ──────────────────────────── component ───────────────────────────────────── */

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="pricing"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#050a05]"
      suppressHydrationWarning
    >
      {/* ── background glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-10 blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, #10B981 0%, #F43F5E 50%, transparent 70%)',
          }}
        />
      </div>

      {/* ── content ── */}
      <div className="relative z-10 mx-auto max-w-7xl" ref={ref}>
        {/* ── section header ── */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            suppressHydrationWarning
          >
            <Badge
              variant="outline"
              className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-widest uppercase px-4 py-1"
            >
              Pricing Plans
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            suppressHydrationWarning
          >
            Choose Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Plan
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto"
            suppressHydrationWarning
          >
            Flexible memberships designed for every fitness level. No hidden
            fees, no contracts — just results.
          </motion.p>
        </div>

        {/* ── pricing cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
          suppressHydrationWarning
        >
          {tiers.map((tier) => {
            const Icon = tier.icon

            return (
              <motion.div
                key={tier.id}
                variants={cardVariants}
                className={`
                  glass-card-fit
                  relative
                  rounded-2xl
                  backdrop-blur-md
                  transition-all duration-300
                  hover:scale-[1.02]
                  ${tier.popular ? 'md:scale-105 z-10' : ''}
                  ${tier.glowClass}
                `}
                style={{
                  background: 'rgba(10,15,10,0.6)',
                  border: `1px solid ${tier.borderColor}`,
                }}
                suppressHydrationWarning
              >
                {/* ── popular badge ── */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                      }}
                    >
                      <Zap size={12} className="fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* ── card inner ── */}
                <div className="p-8 flex flex-col">
                  {/* ── icon + tier name ── */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{
                        backgroundColor: `${tier.accentColor}15`,
                        border: `1px solid ${tier.accentColor}30`,
                      }}
                    >
                      <Icon size={20} style={{ color: tier.accentColor }} />
                    </div>
                    <span
                      className="text-sm font-bold uppercase tracking-widest"
                      style={{ color: tier.accentColor }}
                    >
                      {tier.name}
                    </span>
                  </div>

                  {/* ── price ── */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-zinc-500 text-xl font-medium">₹</span>
                      <span className="text-5xl font-extrabold text-white tracking-tight">
                        {tier.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-zinc-500 text-base font-medium">
                        {tier.period}
                      </span>
                    </div>
                  </div>

                  {/* ── divider ── */}
                  <div
                    className="h-px w-full mb-6"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tier.accentColor}40, transparent)`,
                    }}
                  />

                  {/* ── features list ── */}
                  <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-3">
                        {feature.included ? (
                          <div
                            className="flex items-center justify-center w-5 h-5 rounded-full mt-0.5 flex-shrink-0"
                            style={{
                              backgroundColor: `${tier.accentColor}15`,
                              border: `1px solid ${tier.accentColor}30`,
                            }}
                          >
                            <Check
                              size={12}
                              className="flex-shrink-0"
                              style={{ color: tier.accentColor }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full mt-0.5 flex-shrink-0 bg-zinc-800/60 border border-zinc-700/40">
                            <X
                              size={12}
                              className="flex-shrink-0 text-zinc-600"
                            />
                          </div>
                        )}
                        <span
                          className={`text-sm leading-snug ${
                            feature.included
                              ? 'text-zinc-200'
                              : 'text-zinc-600 line-through'
                          }`}
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* ── CTA button ── */}
                  <Button
                    className={tier.buttonClassName}
                    style={tier.buttonStyle}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
