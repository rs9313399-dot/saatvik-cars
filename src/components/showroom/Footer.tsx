'use client';

import { useState, useEffect } from 'react';
import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { useStore, type Route } from '@/lib/store';

const quickLinks: { label: string; route: Route }[] = [
  { label: 'Home', route: { page: 'home' } },
  { label: 'Browse Cars', route: { page: 'cars' } },
  { label: 'Wishlist', route: { page: 'cars' } },
  { label: 'Admin Panel', route: { page: 'admin' } },
];

const services = [
  'Verified Listings',
  'Direct Owner Deals',
  'Best Prices',
  'Easy Financing',
];

/* ── SVG social icons ─────────────────────────────────────────── */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" suppressHydrationWarning>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" suppressHydrationWarning>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" suppressHydrationWarning>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" suppressHydrationWarning>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ── Social link helper ───────────────────────────────────────── */

const socialLinks = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'X (Twitter)', href: '#', Icon: TwitterXIcon },
  { label: 'YouTube', href: '#', Icon: YouTubeIcon },
];

/* ── Column heading ───────────────────────────────────────────── */

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF4D00]">
      {children}
    </h3>
  );
}

/* ── Main Footer ──────────────────────────────────────────────── */

export default function Footer() {
  const { navigate } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [year, setYear] = useState(2025);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dynamic year needed for hydration safety
    setYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-[#0A0A0A]">
      {/* ── Neon orange gradient top border ── */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #FF4D00 20%, #FF6B2B 50%, #FF4D00 80%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        {/* ── 4-column grid ── */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* ────── Brand ────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4D00]">
                <Car className="h-[18px] w-[18px] text-black" suppressHydrationWarning />
              </div>
              <span className="text-xl font-bold uppercase tracking-tight text-white">
                Auto<span className="text-[#FF4D00]">Elite</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#C0C0C0]/70">
              India&apos;s trusted marketplace for premium pre-owned vehicles.
              Verified listings, transparent pricing &amp; hassle-free buying.
            </p>
            {/* Social icons row */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,77,0,0.2)] text-[#808080] transition-all duration-300 hover:border-[#FF4D00] hover:text-[#FF4D00] hover:shadow-[0_0_12px_rgba(255,77,0,0.3)]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ────── Quick Links ────── */}
          <div>
            <ColumnHeading>Quick Links</ColumnHeading>
            <nav className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  suppressHydrationWarning
                  className="text-left text-sm text-[#C0C0C0]/70 transition-colors duration-200 hover:text-[#FF4D00]"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ────── Services ────── */}
          <div>
            <ColumnHeading>Services</ColumnHeading>
            <ul className="flex flex-col gap-2.5">
              {services.map((s) => (
                <li
                  key={s}
                  className="text-sm text-[#C0C0C0]/70 transition-colors duration-200 hover:text-[#FF4D00]"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* ────── Contact ────── */}
          <div>
            <ColumnHeading>Contact</ColumnHeading>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-sm text-[#C0C0C0]/70 transition-colors duration-200 hover:text-[#FF4D00]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#FF4D00]" suppressHydrationWarning />
                +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#C0C0C0]/70 transition-colors duration-200 hover:text-[#FF4D00]"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#FF4D00]" />
                WhatsApp Us
              </a>
              <a
                href="mailto:hello@autoelite.in"
                className="flex items-center gap-2.5 text-sm text-[#C0C0C0]/70 transition-colors duration-200 hover:text-[#FF4D00]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#FF4D00]" suppressHydrationWarning />
                hello@autoelite.in
              </a>
              <span className="flex items-start gap-2.5 text-sm text-[#C0C0C0]/70">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#FF4D00]" suppressHydrationWarning />
                <span>123 Auto Boulevard, Motor City, IN 400001</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <p className="text-sm text-[#C0C0C0]/60">
            Stay updated with new listings &amp; offers
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-sm overflow-hidden rounded-lg border border-[#FF4D00]/40 bg-[#111111]"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              suppressHydrationWarning
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-[#808080] outline-none"
            />
            <button
              type="submit"
              suppressHydrationWarning
              className="shrink-0 bg-[#FF4D00] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:bg-[#FF6B2B] hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]"
            >
              {subscribed ? '✓' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 border-t border-[rgba(255,77,0,0.15)] pt-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-[#808080]">
              © {year} <span className="text-[#FF4D00]">AutoElite</span>. All rights reserved.
            </p>

            <p className="text-xs text-[#808080]">
              Made with{' '}
              <span className="inline-block text-[#FF4D00]">&#9829;</span>{' '}
              for car enthusiasts
            </p>

            {/* Small social icons (bottom bar) */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={`bottom-${label}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#808080] transition-colors duration-200 hover:text-[#FF4D00]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
