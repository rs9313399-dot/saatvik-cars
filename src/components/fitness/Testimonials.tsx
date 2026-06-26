'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ──────────────────────────── data ──────────────────────────── */

interface Testimonial {
  id: number;
  name: string;
  title: string;
  review: string;
  stars: number;
  membership: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Rahul Verma',
    title: 'Lost 15kg in 6 months!',
    review:
      "The trainers at FitForge are incredible. They created a personalized plan that actually worked. Best investment I've made.",
    stars: 5,
    membership: 'Pro Member',
    initials: 'RV',
  },
  {
    id: 2,
    name: 'Sneha Reddy',
    title: 'Best yoga experience ever',
    review:
      "The yoga classes here are transformative. Priya ma'am is an amazing instructor. I feel so much more flexible and calm.",
    stars: 5,
    membership: 'Starter Member',
    initials: 'SR',
  },
  {
    id: 3,
    name: 'Amit Joshi',
    title: 'From beginner to marathon runner',
    review:
      'Started with zero fitness. The structured training and diet plan got me running marathons within a year. Life changing!',
    stars: 4,
    membership: 'Elite Member',
    initials: 'AJ',
  },
];

/* ──────────────────────────── animation variants ──────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ──────────────────────────── component ──────────────────────────── */

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" className="relative py-20 bg-[#050a05]">
      {/* ── decorative glow ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06] blur-[120px]"
        style={{ backgroundColor: '#10B981' }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
          suppressHydrationWarning
        >
          <Badge
            variant="outline"
            className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-widest uppercase px-4 py-1"
          >
            Testimonials
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Real Results,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Real People
            </span>
          </h2>
        </motion.div>

        {/* ── testimonial cards grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          suppressHydrationWarning
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              className="
                group
                relative
                rounded-2xl
                border border-[rgba(16,185,129,0.08)]
                bg-[rgba(10,15,10,0.6)]
                backdrop-blur-md
                p-8
                transition-all duration-300
                hover:border-emerald-500/40
                hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]
              "
              suppressHydrationWarning
            >
              {/* quote icon */}
              <Quote
                size={32}
                className="mb-4 text-emerald-500/20 transition-colors duration-300 group-hover:text-emerald-500/40"
              />

              {/* star rating */}
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < testimonial.stars
                        ? 'fill-emerald-400 text-emerald-400'
                        : 'fill-zinc-700 text-zinc-700'
                    }
                  />
                ))}
              </div>

              {/* review title */}
              <h3 className="mb-2 text-lg font-semibold text-white">
                &ldquo;{testimonial.title}&rdquo;
              </h3>

              {/* review text */}
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                {testimonial.review}
              </p>

              {/* customer info */}
              <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
                {/* avatar initials */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-emerald-400">{testimonial.membership}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
