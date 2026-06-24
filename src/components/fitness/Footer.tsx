'use client';

import { useState } from 'react';
import {
  Dumbbell,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ── Data ────────────────────────────────────────────────────────────────────

interface QuickLink {
  label: string;
  href: string;
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Programs', href: '#programs' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'BMI Calculator', href: '#bmi' },
];

interface SocialLink {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  href: string;
  label: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Instagram, href: 'https://instagram.com/fitforge', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/fitforge', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com/fitforge', label: 'YouTube' },
  { icon: Facebook, href: 'https://facebook.com/fitforge', label: 'Facebook' },
];

interface ContactItem {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  text: string;
}

const CONTACT_ITEMS: ContactItem[] = [
  { icon: MapPin, text: '123 Fitness Avenue, Bandra West, Mumbai 400050' },
  { icon: Phone, text: '+91 98765 43210' },
  { icon: Mail, text: 'hello@fitforge.gym' },
  { icon: Clock, text: 'Mon-Sat: 5AM-11PM | Sun: 6AM-10PM' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    // Reset success message after 4 seconds
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer
      className="mt-auto w-full"
      style={{
        background: '#030803',
        borderTop: '1px solid rgba(16, 185, 129, 0.08)',
      }}
      suppressHydrationWarning
    >
      {/* ── Main footer content ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* ── Column 1: Brand ────────────────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 group"
              suppressHydrationWarning
            >
              <Dumbbell className="w-7 h-7 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              <span
                className="text-xl font-black tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                suppressHydrationWarning
              >
                FITFORGE
              </span>
            </a>

            {/* Tagline */}
            <p
              className="mt-3 text-sm font-semibold tracking-wide"
              style={{
                background: 'linear-gradient(90deg, #F43F5E, #10B981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              suppressHydrationWarning
            >
              Forge Your Perfect Body
            </p>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
              Mumbai&apos;s premier fitness destination. World-class equipment, expert trainers,
              and a community that pushes you beyond your limits.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="
                    flex items-center justify-center w-9 h-9 rounded-md
                    text-gray-500 hover:text-emerald-400
                    bg-white/[0.03] hover:bg-emerald-400/10
                    border border-white/[0.04] hover:border-emerald-400/20
                    transition-all duration-200
                  "
                  suppressHydrationWarning
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Quick Links ──────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const id = href.replace('#', '');
                        const el = document.getElementById(id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="
                        text-sm text-gray-500 hover:text-emerald-400
                        transition-colors duration-200
                        inline-flex items-center gap-1.5
                      "
                      suppressHydrationWarning
                    >
                      <span
                        className="w-1 h-1 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors"
                      />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 3: Contact ──────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {CONTACT_ITEMS.map(({ icon: Icon, text }, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 mt-0.5 text-emerald-500/70 shrink-0" />
                  <span className="text-sm text-gray-500 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Newsletter ───────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Get the latest on new programs, exclusive offers, and fitness tips
              delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    h-9 flex-1 bg-white/[0.04] border-white/[0.06]
                    text-sm text-gray-300 placeholder:text-gray-600
                    focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20
                  "
                  suppressHydrationWarning
                />
                <Button
                  type="submit"
                  className="
                    bg-emerald-500 hover:bg-emerald-600 text-black font-bold
                    rounded-md px-3 h-9 shrink-0
                    transition-colors duration-200
                  "
                  suppressHydrationWarning
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 font-medium animate-in fade-in">
                You&apos;re in! Welcome to the FitForge community.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div
        className="border-t border-white/[0.04]"
        style={{ borderTopColor: 'rgba(16, 185, 129, 0.06)' }}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              &copy; 2024 FitForge. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#privacy"
                className="text-xs text-gray-600 hover:text-emerald-400 transition-colors duration-200"
                suppressHydrationWarning
              >
                Privacy Policy
              </a>
              <span className="text-gray-700">|</span>
              <a
                href="#terms"
                className="text-xs text-gray-600 hover:text-emerald-400 transition-colors duration-200"
                suppressHydrationWarning
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
