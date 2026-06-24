'use client';

import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'Are all cars on AutoElite verified?',
    a: 'Yes! Every car listed on AutoElite goes through a thorough verification process. We check documents, ownership history, and conduct physical inspections to ensure complete transparency.',
  },
  {
    q: 'Can I negotiate the price directly with the seller?',
    a: 'Absolutely! AutoElite connects you directly with car owners — no middlemen involved. This means you can negotiate the best deal without any hidden charges or dealer markups.',
  },
  {
    q: 'What financing options are available?',
    a: 'We offer easy financing through our banking partners with interest rates starting at 9% p.a. Get instant loan approval with minimal paperwork. EMI options available for up to 60 months.',
  },
  {
    q: 'Do you provide any warranty on pre-owned cars?',
    a: 'Select vehicles come with a comprehensive warranty of up to 12 months. Our warranty covers engine, transmission, and other major components for your peace of mind.',
  },
  {
    q: 'How do I schedule a test drive?',
    a: 'Simply click on the "Call Now" or "WhatsApp" button on any car listing to connect with the owner directly. You can schedule a test drive at a time convenient for both parties.',
  },
  {
    q: 'What if I find an issue after purchase?',
    a: 'AutoElite offers a 7-day return guarantee on all verified listings. If you discover any undisclosed issues within 7 days, we facilitate a full refund process.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <ScrollReveal direction="up" delay={index * 0.06}>
      <div className="border-b border-[rgba(255,77,0,0.1)]">
        <button
          onClick={() => setOpen(!open)}
          suppressHydrationWarning
          className="flex w-full items-center justify-between py-4 text-left transition-colors duration-200 hover:text-[#FF4D00]"
        >
          <span className="pr-4 text-[15px] font-medium text-[#C0C0C0]">{q}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 text-[#FF4D00]/50"
          >
            <ChevronDown className="h-5 w-5" suppressHydrationWarning />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-4 text-sm leading-relaxed text-[#808080]">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
}

export default function FAQSection() {
  return (
    <section className="bg-[#0A0A0A] py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="fade" className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF4D00]/60">Got Questions?</p>
          <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#808080]">Everything you need to know about buying a car on AutoElite.</p>
        </ScrollReveal>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
