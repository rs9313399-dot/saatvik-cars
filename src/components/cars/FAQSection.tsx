'use client';

import { useId, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  {
    q: 'How can I confirm a car is available?',
    a: 'Contact Saatvik Cars using the phone number or email on this page before travelling. Availability can change as listings are updated.',
  },
  {
    q: 'Where can I view a car?',
    a: 'Contact Saatvik Cars to arrange a showroom visit in Bilaspur and confirm the car is available to see.',
  },
  {
    q: 'Can I ask about a test drive?',
    a: 'Contact Saatvik Cars about the listing you are interested in to discuss a visit or test drive.',
  },
  {
    q: 'How do I ask about a listing?',
    a: 'Use the phone or email details on this page and mention the car you are interested in. The listing shows its currently entered price and vehicle details.',
  },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  const buttonId = useId();
  const panelId = `${buttonId}-panel`;
  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-[#111827]/50 overflow-hidden transition-all duration-300 hover:border-white/[0.12]"
      suppressHydrationWarning
    >
      <button
        type="button"
        onClick={onToggle}
        id={buttonId}
        suppressHydrationWarning
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-sm font-medium text-white" suppressHydrationWarning>{faq.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#D7B56D] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="px-5 pb-4 text-[13px] leading-relaxed text-slate-400"
              suppressHydrationWarning
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Build FAQPage JSON-LD from the FAQ array. Answers are plain text
  // (no HTML in this dataset), so we strip nothing - but we still guard
  // against accidental HTML in case the data evolves.
  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a.replace(/<[^>]*>/g, ''),
        },
      })),
    }),
    [],
  );

  return (
    <section id="faq" className="py-12 bg-[#0A0A0A]" suppressHydrationWarning>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
          suppressHydrationWarning
        >
          <span className="inline-flex items-center gap-2 rounded-md border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]" suppressHydrationWarning>
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white" suppressHydrationWarning>
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base" suppressHydrationWarning>
            Everything you need to know before buying
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
      {/* FAQPage structured data for SEO (Google rich results) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
