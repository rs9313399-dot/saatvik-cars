'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS } from '@/lib/business';

/* ─────────────── Types ─────────────── */
export type PolicyType = 'privacy' | 'terms' | 'refund';

interface PolicyModalProps {
  type: PolicyType | null; // null = closed
  onClose: () => void;
}

/* ─────────────── Policy metadata ─────────────── */
const POLICY_TITLES: Record<PolicyType, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  refund: 'Refund & Return Policy',
};

/** Shared reusable section wrapper for consistent h2 + body styling */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 mt-5 text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

/** Shared contact block shown at the bottom of every policy */
function ContactBlock() {
  return (
    <Section title="Contact">
      <p className="mb-3 text-sm leading-relaxed text-slate-400">
        <strong className="text-slate-300">{BUSINESS.legalName}</strong>
        <br />
        Plot 14, Industrial Area, Bilaspur, Chhattisgarh 495001
        <br />
        Email:{' '}
        <a
          href={`mailto:${BUSINESS.email}`}
          className="text-[#00D4FF] underline-offset-2 hover:underline"
        >
          {BUSINESS.email}
        </a>
        <br />
        GSTIN: {BUSINESS.gstin}
        <br />
        Hours: {BUSINESS.hours}
      </p>
    </Section>
  );
}

/* ─────────────── Privacy Policy content ─────────────── */
function PrivacyContent() {
  return (
    <>
      <Section title="1. Information We Collect">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          We collect only the information necessary to respond to your inquiries and
          provide our services:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            <strong className="text-slate-300">Personal details:</strong> name, phone
            number, and email address — collected only when you submit a lead or inquiry.
          </li>
          <li>
            <strong className="text-slate-300">Browsing data:</strong> pages viewed, cars
            shortlisted, and search filters used (stored locally in your browser, not on
            our servers).
          </li>
          <li>
            <strong className="text-slate-300">Inquiry details:</strong> the car you asked
            about, your message text, and your preferred contact time.
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          We use the information you provide to:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>Respond to your inquiries about specific cars listed on our site.</li>
          <li>Process and schedule test drive bookings at our Bilaspur dealership.</li>
          <li>
            Send price-drop alerts and new-arrival notifications — only if you
            subscribe to our newsletter.
          </li>
          <li>Improve our listings, website performance, and customer service.</li>
        </ul>
      </Section>

      <Section title="3. Information Sharing">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          <strong className="text-slate-300">
            We do NOT sell, rent, or trade your personal data
          </strong>{' '}
          with any third party for marketing purposes. Limited sharing may occur only in
          these cases:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            With our partner banks or NBFCs — but only if you explicitly opt for vehicle
            finance arranged through us.
          </li>
          <li>
            When legally required by Indian courts, law-enforcement agencies, or tax
            authorities. We are a GSTIN-registered business and comply with applicable
            law.
          </li>
        </ul>
      </Section>

      <Section title="4. Data Security">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            All form submissions are encrypted in transit using SSL (HTTPS) encryption.
          </li>
          <li>
            Internal access to inquiry data is restricted to authorised Saatvik Cars
            staff.
          </li>
          <li>
            We operate as a GSTIN-registered business ({BUSINESS.gstin}) under{' '}
            {BUSINESS.parentCompany}, with documented accountability for any data we hold.
          </li>
        </ul>
      </Section>

      <Section title="5. Cookies & Local Storage">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            <strong className="text-slate-300">
              We do NOT use tracking or advertising cookies.
            </strong>
          </li>
          <li>
            We use browser <code className="text-slate-300">localStorage</code> only to
            remember your wishlist and compare list across sessions — this data never
            leaves your device.
          </li>
          <li>
            You can clear this data anytime from your browser settings without affecting
            your ability to browse the site.
          </li>
        </ul>
      </Section>

      <Section title="6. Your Rights">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          You have the right to request access to, correction of, or deletion of your
          personal data at any time.
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            To delete your data, email{' '}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-[#00D4FF] underline-offset-2 hover:underline"
            >
              {BUSINESS.email}
            </a>{' '}
            with the subject &quot;Data Deletion Request&quot;.
          </li>
          <li>
            Newsletter subscribers can unsubscribe at any time using the unsubscribe link
            in every email.
          </li>
        </ul>
      </Section>

      <ContactBlock />
    </>
  );
}

/* ─────────────── Terms of Service content ─────────────── */
function TermsContent() {
  return (
    <>
      <Section title="1. Acceptance">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          By accessing or using saatvikcars.in, you agree to be bound by these Terms of
          Service. If you do not agree with any part of these terms, please discontinue
          use of the website.
        </p>
      </Section>

      <Section title="2. Service Description">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          {BUSINESS.legalName} operates an online platform where users can browse and
          inquire about pre-owned cars available for sale at our Bilaspur dealership. The
          website is a listing and inquiry channel — not an e-commerce checkout — and all
          sales are completed offline at our registered address.
        </p>
      </Section>

      <Section title="3. Car Listings">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>All vehicles listed on the site are pre-owned / second-hand vehicles.</li>
          <li>
            Vehicle condition, mileage, and specifications are described in good faith
            based on our 150-point inspection.
          </li>
          <li>
            Actual condition may vary. We strongly recommend a personal inspection and
            test drive before purchase.
          </li>
        </ul>
      </Section>

      <Section title="4. Pricing & Availability">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            Prices listed on the website are indicative and subject to change without
            prior notice.
          </li>
          <li>
            A car is considered &quot;booked&quot; only after a booking amount is received
            and acknowledged by our team.
          </li>
          <li>Availability is not guaranteed until the booking is confirmed in writing.</li>
        </ul>
      </Section>

      <Section title="5. Purchases">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            RC (Registration Certificate) transfer is handled by our team at no extra
            cost to the buyer.
          </li>
          <li>
            Valid government-issued photo ID and address proof are required for RC
            transfer.
          </li>
          <li>
            Full payment (or sanctioned finance disbursement) must be cleared before
            vehicle delivery.
          </li>
        </ul>
      </Section>

      <Section title="6. 7-Day Return Policy">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          If you are not satisfied with your purchase, you may return the car within{' '}
          <strong className="text-slate-300">7 days of delivery</strong> for a full
          refund. The car must be returned in the same condition as sold (normal wear and
          tear excluded). Please see our Refund &amp; Return Policy for full details.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          All website content — including car listings, photographs, descriptions, logos,
          and design — is owned by {BUSINESS.parentCompany}. You may not reproduce,
          distribute, or republish any content from this site without prior written
          consent.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            Our maximum aggregate liability for any claim arising from a vehicle purchase
            shall be limited to the purchase price of the car in question.
          </li>
          <li>
            We shall not be liable for any indirect, incidental, special, or
            consequential damages.
          </li>
        </ul>
      </Section>

      <Section title="9. Governing Law">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          These Terms are governed by and construed in accordance with the laws of India.
          Any disputes arising out of or in connection with these Terms shall be subject
          to the exclusive jurisdiction of the courts in Bilaspur, Chhattisgarh.
        </p>
      </Section>

      <ContactBlock />
    </>
  );
}

/* ─────────────── Refund & Return Policy content ─────────────── */
function RefundContent() {
  return (
    <>
      <Section title="1. 7-Day Return Window">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          You may return any purchased car within{' '}
          <strong className="text-slate-300">7 days of delivery</strong> for a full
          refund, provided the car is returned in the same condition as it was sold.
          Normal wear and tear (such as minor kilometre usage during the return period)
          is excluded from this assessment.
        </p>
      </Section>

      <Section title="2. Refund Process">
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            To initiate a return, email{' '}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-[#00D4FF] underline-offset-2 hover:underline"
            >
              {BUSINESS.email}
            </a>{' '}
            or call us with your invoice number.
          </li>
          <li>
            Our team will inspect the car at our Bilaspur dealership to confirm it
            meets the return conditions.
          </li>
          <li>
            Once the return is approved, the refund is processed within{' '}
            <strong className="text-slate-300">7 business days</strong> to the original
            payment method.
          </li>
        </ul>
      </Section>

      <Section title="3. Booking Amount">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          If you paid a booking amount and choose to cancel before delivery, you are
          entitled to a <strong className="text-slate-300">full refund</strong>. Booking
          amount refunds are processed within{' '}
          <strong className="text-slate-300">3 business days</strong> of cancellation.
        </p>
      </Section>

      <Section title="4. Non-Refundable Cases">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          Returns and refunds will not be accepted in the following cases:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>
            Damages beyond normal wear and tear — dents, scratches, torn upholstery, or
            broken parts.
          </li>
          <li>
            Vehicles modified after delivery — aftermarket accessories, altered
            odometer, ECU remaps, or structural changes.
          </li>
          <li>
            Missing accessories, spare keys, owner&apos;s manual, service book, or
            original papers.
          </li>
          <li>
            Mileage exceeded beyond what is reasonable during the 7-day return period.
          </li>
        </ul>
      </Section>

      <Section title="5. Test Drives">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          Test drives before purchase are completely{' '}
          <strong className="text-slate-300">free of charge</strong>. No payment is
          required to schedule or take a test drive at our Bilaspur dealership.
        </p>
      </Section>

      <ContactBlock />
    </>
  );
}

/* ─────────────── Main modal component ─────────────── */
export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  // ESC key to close + lock body scroll while open
  useEffect(() => {
    if (!type) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [type, onClose]);

  return (
    <AnimatePresence>
      {type && (
        <>
          {/* Backdrop — click outside closes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            suppressHydrationWarning
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
          />

          {/* Centered card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
            suppressHydrationWarning
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="policy-modal-title"
              suppressHydrationWarning
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl"
            >
              {/* Sticky header */}
              <div
                suppressHydrationWarning
                className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111827] px-6 py-4"
              >
                <h2
                  id="policy-modal-title"
                  className="text-lg font-bold text-white"
                >
                  {POLICY_TITLES[type]}
                </h2>
                <Button
                  onClick={onClose}
                  size="icon"
                  variant="ghost"
                  aria-label="Close"
                  suppressHydrationWarning
                  className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Body */}
              <div suppressHydrationWarning className="px-6 py-5">
                <p className="mb-2 text-xs text-slate-500">Last updated: June 2025</p>
                {type === 'privacy' && <PrivacyContent />}
                {type === 'terms' && <TermsContent />}
                {type === 'refund' && <RefundContent />}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────── Helper export ─────────────── */
export const POLICY_LINKS = [
  { type: 'privacy' as const, label: 'Privacy Policy' },
  { type: 'terms' as const, label: 'Terms of Service' },
  { type: 'refund' as const, label: 'Refund Policy' },
];
