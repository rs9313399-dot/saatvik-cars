'use client';

import ScrollReveal from './ScrollReveal';
import { Search, ShieldCheck, Handshake, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: <Search className="h-6 w-6" suppressHydrationWarning />,
    title: 'Browse & Discover',
    desc: 'Explore our curated collection of verified premium pre-owned vehicles with detailed specs and real photos.',
  },
  {
    number: '02',
    icon: <ShieldCheck className="h-6 w-6" suppressHydrationWarning />,
    title: 'Verify & Inspect',
    desc: 'Every listing is verified by our team. Get complete transparency with inspection reports and history.',
  },
  {
    number: '03',
    icon: <Handshake className="h-6 w-6" suppressHydrationWarning />,
    title: 'Connect & Negotiate',
    desc: 'Deal directly with owners — no middlemen, no hidden fees. Get the best price every time.',
  },
  {
    number: '04',
    icon: <Car className="h-6 w-6" suppressHydrationWarning />,
    title: 'Drive Home Happy',
    desc: 'Complete the deal with confidence. Free paperwork assistance and easy financing options available.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-black py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="fade" className="mb-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Simple Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">Buying your dream car has never been easier. Follow these simple steps.</p>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} direction="up" delay={i * 0.12}>
              <div className="group relative flex flex-col items-center text-center">
                {/* Connector line (except last) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-white/15 to-white/5 lg:block" />
                )}

                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <span className="text-foreground/70 transition-colors duration-500 group-hover:text-foreground">
                      {step.icon}
                    </span>
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4D00] text-[11px] font-bold text-black shadow-lg shadow-[#FF4D00]/25">
                    {step.number}
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#FF6B2B]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/45">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
