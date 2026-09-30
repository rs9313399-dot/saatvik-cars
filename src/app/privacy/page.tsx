import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { BUSINESS } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy | Saatvik Cars - Certified Pre-Owned Cars',
  description: `Privacy policy for Saatvik Cars (A unit of Tarang Marketing), Bilaspur, Chhattisgarh. Clear information on data protection, document security, and customer privacy. GSTIN: ${BUSINESS.gstin}.`,
  alternates: {
    canonical: 'https://saatvikcars.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 2026';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/[0.06] bg-[#0d1117] sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#D7B56D]" />
            Back to Home
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Saatvik Cars logo" className="h-8 w-8 rounded-md object-contain" />
            <span className="text-base font-bold text-white">
              Saatvik<span className="text-[#D7B56D]">Cars</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-2xl border border-white/[0.08] bg-[#111622] p-6 sm:p-10 shadow-2xl">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#D7B56D]/30 bg-[#D7B56D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D7B56D]">
            <Shield className="h-3.5 w-3.5" />
            Legal & Customer Trust
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Privacy Policy
          </h1>

          <p className="text-xs text-slate-400 mb-8">
            Last Updated: {lastUpdated} | {BUSINESS.legalName} (GSTIN: {BUSINESS.gstin})
          </p>

          <div className="prose prose-invert max-w-none text-slate-300 space-y-8 text-sm sm:text-base leading-relaxed">
            <section className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-[#D7B56D]" />
                Commitment to Transparent, Honest Car Buying
              </h2>
              <p>
                At Saatvik Cars (A unit of Tarang Marketing), your privacy and document security are our highest priorities.
                We do not sell, rent, or trade customer contact information or vehicle documentation to third-party telemarketers or advertisers.
                This Privacy Policy explains what details we collect when you browse our website, book a test drive, request a car valuation,
                or complete a vehicle purchase.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
              <p>
                We collect only the information necessary to facilitate vehicle inquiries, inspections, valuations, and ownership transfers:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">Contact Information:</strong> Your name, phone number, email address, and city when you submit a test drive request, value your car, or contact our sales team.
                </li>
                <li>
                  <strong className="text-white">Vehicle Valuation Details:</strong> Make, model, year, fuel type, transmission, kilometres driven, and ownership history when you use our Sell/Trade valuation tool.
                </li>
                <li>
                  <strong className="text-white">Transaction & Verification Documents:</strong> When buying or selling a car, copies of government identification (such as Aadhaar or PAN card), Registration Certificate (RC), insurance documents, and RTO forms (Forms 28, 29, and 30) required by Indian transport authorities.
                </li>
                <li>
                  <strong className="text-white">Local Browsing Preferences:</strong> Cars saved to your Wishlist, cars added to comparison tables, and filter preferences stored locally on your device.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
              <p>
                All personal and vehicle data provided to us is used strictly for legitimate dealership operations:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>Scheduling and confirming showroom visits or test drives at our Bilaspur location.</li>
                <li>Providing accurate valuation estimates and coordinating vehicle inspections.</li>
                <li>Facilitating RTO paperwork, RC transfer, and hypothecation clearances.</li>
                <li>Sending price drop alerts or new inventory arrivals only if you explicitly subscribed to updates.</li>
                <li>Responding to inquiries via WhatsApp, phone, or email as requested by you.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. Document Security & RC Paperwork Protection</h2>
              <p>
                Vehicle transfers in India involve sensitive identification and registration records. Saatvik Cars adheres to strict standards:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>All identification and RC documents collected for transfer are handled solely by our authorized paperwork desk.</li>
                <li>Physical forms and digital copies are used exclusively for verification with the Regional Transport Office (RTO) and insurance providers.</li>
                <li>We never share your documentation with unauthorized third parties or unrelated financing entities without your written or explicit consent.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Cookies and Local Storage</h2>
              <p>
                Our website utilizes local storage to remember your shortlisted cars, compare selections, and search filters so your preferences are saved across sessions.
                We do not deploy intrusive third-party cross-site trackers or sell tracking profiles to ad brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Your Rights and Data Corrections</h2>
              <p>
                You have the right to request access to the personal data we hold about you, request corrections to any inaccuracies, or request that your contact details be removed from our marketing records.
                To submit a request, contact our team using the details below.
              </p>
            </section>

            <section className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#D7B56D]" />
                6. Contact & Grievance Information
              </h2>
              <p className="text-sm text-slate-300">
                If you have questions regarding this Privacy Policy or how your information is handled, please contact our dealership office:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#D7B56D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{BUSINESS.legalName}</strong>
                    <br />
                    Plot 14, Industrial Area, Bilaspur, Chhattisgarh 495001, India
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#D7B56D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Telephone:</strong>
                    <br />
                    {BUSINESS.phones.map((p) => (
                      <span key={p.tel} className="block">
                        <a href={`tel:${p.tel}`} className="text-slate-300 hover:text-white transition-colors">{p.display}</a>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-[#D7B56D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Email:</strong>
                    <br />
                    <a href={`mailto:${BUSINESS.email}`} className="text-[#D7B56D] hover:underline">{BUSINESS.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D7B56D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">GSTIN:</strong>
                    <br />
                    {BUSINESS.gstin} (Govt. of India Tax Registered)
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-10 border-t border-white/[0.08] pt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#D7B56D] px-6 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E7C77B] transition-colors"
            >
              Back to Browse Cars
            </Link>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {BUSINESS.dealerName}. All rights reserved.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
