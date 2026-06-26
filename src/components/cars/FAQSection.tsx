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
    q: 'Are all cars at Saatvik Cars inspected?',
    a: 'Yes. Every car undergoes a rigorous 150-point inspection covering engine, transmission, brakes, suspension, electricals, tyres, and body condition. You receive a detailed inspection report before purchase. Cars that don\'t meet our standards are not listed.',
  },
  {
    q: 'What documents do I get with the car?',
    a: 'You receive: original RC (Registration Certificate), insurance papers, service history, PUC certificate, and sale agreement. We also handle the RC transfer to your name — no need to visit the RTO yourself.',
  },
  {
    q: 'How does the 7-day return policy work?',
    a: 'If you\'re not satisfied with the car within 7 days of purchase, you can return it for a full refund. The car must be in the same condition as sold (normal wear and tear excluded). This policy gives you peace of mind that you\'re making the right choice.',
  },
  {
    q: 'Do you offer finance and loan assistance?',
    a: 'Yes! We have tie-ups with leading banks and NBFCs. We help you get the best interest rates on car loans. Both finance (new loans) and refinance options are available on most cars. Contact us with your requirements and we\'ll guide you through the process.',
  },
  {
    q: 'Can I exchange my old car?',
    a: 'Absolutely. We accept exchange of your existing car. Bring your car for a free valuation — our team will inspect it and offer a fair price that can be adjusted against your new purchase. The exchange value depends on the car\'s condition, age, and market demand.',
  },
  {
    q: 'What is RC transfer and how long does it take?',
    a: 'RC (Registration Certificate) transfer is the process of changing the vehicle\'s ownership from the previous owner to you. We handle all the paperwork and RTO procedures. Typically, RC transfer takes 15-30 working days depending on the RTO. You don\'t need to visit the RTO — we do it for you.',
  },
  {
    q: 'Are the prices negotiable?',
    a: 'Our prices are fair and transparent, already reflecting the car\'s condition and market value. However, we\'re open to discussion, especially if you\'re paying upfront or exchanging a car. Visit our showroom or call us to discuss.',
  },
  {
    q: 'Can I take a test drive before buying?',
    a: 'Of course! Test drives are encouraged. Visit our showroom during business hours (Mon-Sat, 9 AM - 8 PM) or book a test drive by calling us. We\'ll arrange the car for you to experience before making any decision.',
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Build FAQPage JSON-LD from the FAQ array. Answers are plain text
  // (no HTML in this dataset), so we strip nothing — but we still guard
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
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]" suppressHydrationWarning>
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
