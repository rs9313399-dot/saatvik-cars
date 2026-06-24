'use client';

import { motion } from 'framer-motion';
import { Shield, Star, Clock, BadgeCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BUSINESS } from '@/lib/business';

interface StatItem {
  icon: LucideIcon;
  stat: string;
  label: string;
}

const items: StatItem[] = [
  {
    icon: Shield,
    stat: '150-pt',
    label: 'Inspection on every car',
  },
  {
    icon: BadgeCheck,
    stat: '100%',
    label: 'Verified papers & RC',
  },
  {
    icon: Star,
    stat: '7 Days',
    label: 'Return policy',
  },
  {
    icon: Clock,
    stat: 'GST',
    label: `Registered dealer (${BUSINESS.gstin})`,
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="py-12 bg-[#0A0A0A]" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
          suppressHydrationWarning
        >
          <h2
            className="text-2xl sm:text-3xl font-bold text-white"
            suppressHydrationWarning
          >
            Why Choose Saatvik Cars
          </h2>
          <p
            className="mt-2 text-slate-500 text-sm sm:text-base"
            suppressHydrationWarning
          >
            A GST-registered dealer you can rely on
          </p>
        </motion.div>

        {/* Stat cards grid — single cyan accent for visual consistency */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          suppressHydrationWarning
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass-card group relative rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-[#00D4FF]/20"
                suppressHydrationWarning
              >
                {/* Subtle gradient border on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, transparent 50%, rgba(0,212,255,0.03) 100%)',
                  }}
                  suppressHydrationWarning
                />

                {/* Icon circle at top-right — unified cyan */}
                <div
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#00D4FF]/10"
                  suppressHydrationWarning
                >
                  <Icon className="h-4 w-4 text-[#00D4FF]" suppressHydrationWarning />
                </div>

                {/* Stat number — unified cyan */}
                <p
                  className="font-bold text-[#00D4FF] mb-1 text-3xl"
                  suppressHydrationWarning
                >
                  {item.stat}
                </p>

                {/* Label */}
                <p
                  className="text-slate-400 text-sm"
                  suppressHydrationWarning
                >
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="section-separator" />
    </section>
  );
}
