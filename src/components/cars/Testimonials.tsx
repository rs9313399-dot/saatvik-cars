'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, RefreshCw, Handshake, Wrench, BadgeIndianRupee, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Promise {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
}

const promises: Promise[] = [
  {
    icon: ShieldCheck,
    title: '150-Point Inspection',
    desc: 'Every car undergoes a rigorous 150-point check by certified mechanics — engine, transmission, brakes, electricals, and more. You get a full health report before you buy.',
  },
  {
    icon: FileCheck,
    title: 'Verified Papers & RC Transfer',
    desc: 'We verify RC, insurance, service history, and loan clearance. Our team handles the entire RC transfer process — zero paperwork worries for you.',
  },
  {
    icon: RefreshCw,
    title: '7-Day Return Policy',
    desc: 'Not satisfied with your purchase? Return it within 7 days for a full refund. We stand behind every car we sell.',
  },
  {
    icon: Handshake,
    title: 'Transparent Pricing',
    desc: 'No hidden charges, no last-minute surprises. The price you see is the price you pay. We believe in honest, upfront deals.',
  },
  {
    icon: Wrench,
    title: 'Service & Support',
    desc: 'Free first service on select cars. Our relationship doesn\'t end at the sale — we\'re here for maintenance, repairs, and advice.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Finance & Refinance Assistance',
    desc: 'We help you get the best loan rates from our partner banks. Finance and refinance options available on most cars.',
  },
];

export default function Testimonials() {
  return (
    <section id="promise" className="py-12 bg-[#0A0A0A]" suppressHydrationWarning>
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
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]" suppressHydrationWarning>
            <Star className="h-3.5 w-3.5" />
            Our Promise
          </span>
          <h2
            className="mt-4 text-2xl sm:text-3xl font-bold text-white"
            suppressHydrationWarning
          >
            Why Customers Choose Saatvik Cars
          </h2>
          <p
            className="mt-2 text-slate-500 text-sm sm:text-base"
            suppressHydrationWarning
          >
            Real guarantees, not just promises — backed by Tarang Marketing
          </p>
        </motion.div>

        {/* Promises grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          suppressHydrationWarning
        >
          {promises.map((promise, i) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5 transition-all duration-300 hover:border-[#D7B56D]/20 hover:bg-[#D7B56D]/[0.02] overflow-hidden"
                suppressHydrationWarning
              >
                {/* Icon */}
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/10 transition-transform duration-300 group-hover:scale-110"
                  suppressHydrationWarning
                >
                  <Icon className="h-5 w-5 text-[#D7B56D]" strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3
                  className="text-base font-semibold text-white mb-2"
                  suppressHydrationWarning
                >
                  {promise.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] text-slate-400 leading-relaxed"
                  suppressHydrationWarning
                >
                  {promise.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Review CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#D7B56D]/[0.04] to-transparent p-6 text-center"
          suppressHydrationWarning
        >
          <p
            className="text-sm text-slate-400 mb-4"
            suppressHydrationWarning
          >
            Have you bought a car from us? We&apos;d love to hear your story!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              suppressHydrationWarning
              className="h-10 rounded-xl bg-[#D7B56D] px-5 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] transition-all"
              onClick={() => {
                const el = document.getElementById('customer-reviews');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              Read Customer Reviews
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              suppressHydrationWarning
              className="h-10 rounded-xl border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Share Your Feedback
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
