import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie, Database, Mail, MapPin, Phone } from 'lucide-react';
import { BUSINESS } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy | Saatvik Cars',
  description: 'How Saatvik Cars handles information submitted through this website.',
  alternates: {
    canonical: 'https://saatvikcars.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0d1117]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-[#D7B56D]" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-8 w-8 rounded-md object-contain" />
            <span className="text-base font-bold text-white">
              Saatvik<span className="text-[#D7B56D]">Cars</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-2xl border border-white/[0.08] bg-[#111622] p-6 shadow-2xl sm:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#D7B56D]/30 bg-[#D7B56D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D7B56D]">
            <Cookie className="h-3.5 w-3.5" aria-hidden="true" />
            Website information
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mb-8 text-xs text-slate-400">
            Last updated: September 2026
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-slate-300 sm:text-base">
            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Information you submit</h2>
              <p>
                When you use an inquiry, sell or trade, test-drive, chat, newsletter,
                or review form, the information you enter is sent to Saatvik Cars and
                may be stored so the team can handle the request. Review submissions
                are not shown publicly unless they are approved for publication.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Website storage</h2>
              <p>
                Wishlist and comparison choices, filter preferences, and chat session
                details may be saved in your browser&apos;s local storage. The website
                also records car and article view counts in its database. Administration
                features use an authentication cookie.
              </p>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                <Database className="h-4 w-4 text-[#D7B56D]" aria-hidden="true" />
                Hosting and external services
              </h2>
              <p>
                The site runs on Vercel and uses Neon to store application data and
                uploaded car photos.
                The About section embeds a Google Maps map. Phone, email, social media,
                and WhatsApp links open those services when you choose to use them.
                Those providers handle information under their own privacy terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Requests about your data</h2>
              <p>
                For questions or to request access, correction, or deletion of
                information you submitted through this site, contact Saatvik Cars
                using the email below. Requests may need enough detail to identify the
                relevant submission.
              </p>
            </section>

            <section className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Contact</h2>
              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" aria-hidden="true" />
                  <div>
                    <strong className="text-white">{BUSINESS.legalName}</strong>
                    <br />
                    Plot 14, Industrial Area, Bilaspur, Chhattisgarh 495001, India
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" aria-hidden="true" />
                  <div>
                    <strong className="text-white">Telephone</strong>
                    {BUSINESS.phones.map((phone) => (
                      <a
                        key={phone.tel}
                        href={`tel:${phone.tel}`}
                        className="block text-slate-300 transition-colors hover:text-white"
                      >
                        {phone.display}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" aria-hidden="true" />
                  <div>
                    <strong className="text-white">Email</strong>
                    <br />
                    <a
                      href={`mailto:${BUSINESS.email}`}
                      className="text-[#D7B56D] hover:underline"
                    >
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#D7B56D] px-6 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E7C77B]"
            >
              Back to listings
            </Link>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {BUSINESS.dealerName}
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
