'use client';

import { motion, type Variants } from "framer-motion";
import { Search, Wrench, FileCheck, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    icon: Search,
    label: 'Search',
    title: 'Browse & Discover',
    desc: 'Filter through our verified inventory by brand, budget, fuel type, and location. Find exactly what you need.',
  },
  {
    icon: Wrench,
    label: 'Inspect',
    title: '150-Point Check',
    desc: 'Every car undergoes a rigorous 150-point inspection by certified mechanics. Full health report included.',
  },
  {
    icon: FileCheck,
    label: 'Verify',
    title: 'Document Verification',
    desc: 'We verify RC transfer, insurance status, service history, and loan clearance. Zero paperwork worries.',
  },
  {
    icon: KeyRound,
    label: 'Drive',
    title: 'Drive Home Happy',
    desc: 'Complete the purchase with transparent pricing. No hidden charges. 7-day return if you\u2019re not satisfied.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#0A0A0A] py-12 lg:py-14"
      suppressHydrationWarning
    >
      {/* Subtle radial glow behind the section */}
      <div
        className="pointer-events-none absolute inset-0"
        suppressHydrationWarning
      >
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#D7B56D]/[0.03] blur-[120px]"
          suppressHydrationWarning
        />
      </div>

      <div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        suppressHydrationWarning
      >
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center lg:mb-16"
          suppressHydrationWarning
        >
          <h2
            className="text-2xl font-bold text-white sm:text-3xl"
            suppressHydrationWarning
          >
            How Saatvik Cars Works
          </h2>
          <p
            className="mt-3 text-base text-slate-500 sm:text-lg"
            suppressHydrationWarning
          >
            From search to drive — in 4 simple steps
          </p>
        </motion.div>

        {/* ── Desktop Timeline (lg+) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="hidden lg:flex lg:items-start lg:justify-between lg:gap-0"
          suppressHydrationWarning
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;

            return (
              <motion.div
                key={step.label}
                variants={stepVariants}
                className="relative flex flex-1 flex-col items-center text-center"
                suppressHydrationWarning
              >
                {/* Gradient connector line (rendered on every step except last) */}
                {!isLast && (
                  <div
                    className="absolute left-[calc(50%+28px)] top-[19px] z-0 h-[2px] w-[calc(100%-56px)] bg-gradient-to-r from-slate-700 via-[#D7B56D] to-slate-700"
                    suppressHydrationWarning
                  />
                )}

                {/* Step number circle */}
                <div
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#D7B56D] font-bold text-[#0A0A0A] text-sm shadow-[0_0_12px_rgba(215,181,109,0.4)]"
                  suppressHydrationWarning
                >
                  {i + 1}
                </div>

                {/* Icon container */}
                <div
                  className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111827]"
                  suppressHydrationWarning
                >
                  <Icon
                    className="h-5 w-5 text-[#D7B56D]"
                    strokeWidth={1.8}
                    suppressHydrationWarning
                  />
                </div>

                {/* Step label (Search / Inspect / Verify / Drive) */}
                <span
                  className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-[#D7B56D]/60"
                  suppressHydrationWarning
                >
                  {step.label}
                </span>

                {/* Title */}
                <h3
                  className="mt-1.5 text-base font-semibold text-white"
                  suppressHydrationWarning
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="mt-2 max-w-[220px] text-sm leading-relaxed text-slate-400"
                  suppressHydrationWarning
                >
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Mobile / Tablet Timeline ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col gap-0 lg:hidden"
          suppressHydrationWarning
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;

            return (
              <motion.div
                key={step.label}
                variants={stepVariants}
                className="relative flex gap-5"
                suppressHydrationWarning
              >
                {/* Left column: number + vertical gradient line */}
                <div
                  className="relative flex flex-col items-center"
                  suppressHydrationWarning
                >
                  {/* Number circle */}
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D7B56D] font-bold text-[#0A0A0A] text-sm shadow-[0_0_12px_rgba(215,181,109,0.4)]"
                    suppressHydrationWarning
                  >
                    {i + 1}
                  </div>

                  {/* Vertical gradient connector */}
                  {!isLast && (
                    <div
                      className="my-1 h-full w-[2px] bg-gradient-to-b from-slate-700 via-[#D7B56D] to-slate-700"
                      suppressHydrationWarning
                    />
                  )}
                </div>

                {/* Right column: content */}
                <div
                  className={`${isLast ? 'pb-0' : 'pb-8'} pt-1`}
                  suppressHydrationWarning
                >
                  {/* Icon + label row */}
                  <div
                    className="flex items-center gap-2"
                    suppressHydrationWarning
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111827]"
                      suppressHydrationWarning
                    >
                      <Icon
                        className="h-3.5 w-3.5 text-[#D7B56D]"
                        strokeWidth={1.8}
                        suppressHydrationWarning
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest text-[#D7B56D]/60"
                      suppressHydrationWarning
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="mt-2 text-base font-semibold text-white"
                    suppressHydrationWarning
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400"
                    suppressHydrationWarning
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="section-separator" />
    </section>
  );
}
