'use client';

import Link from 'next/link';
import {
  Car,
  ArrowRight,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { BUSINESS, FOOTER_BRANDS } from '@/lib/business';

const quickLinks = [
  { label: 'Browse Cars', href: '#cars' },
  { label: 'Sell Your Car', href: '#sell', action: 'sell' as const },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Customer Reviews', href: '#customer-reviews' },
  { label: 'Car Categories', href: '#categories' },
  { label: 'Loan Payment Estimate', href: '#finance' },
  { label: 'Compare Cars', href: '#cars', action: 'compare' as const },
];

const carBrands = FOOTER_BRANDS;

const socialLinks = [
  { icon: Instagram, href: BUSINESS.social.instagram, label: 'Instagram' },
  { icon: Twitter, href: BUSINESS.social.twitter, label: 'Twitter' },
  { icon: Youtube, href: BUSINESS.social.youtube, label: 'Youtube' },
  { icon: Facebook, href: BUSINESS.social.facebook, label: 'Facebook' },
  { icon: Linkedin, href: BUSINESS.social.linkedin, label: 'LinkedIn' },
];

export default function Footer() {
  const {
    setSellModalOpen,
    setLoginModalOpen,
    setAdminPanelOpen,
    isAdmin,
    setActiveFilters,
    activeFilters,
  } = useStore();

  const handleQuickLink = (href: string, label: string, action?: string) => {
    if (action === 'sell') {
      if (isAdmin) {
        setSellModalOpen(true);
      } else {
        setLoginModalOpen(true);
      }
      return;
    }
    if (action === 'compare') {
      const carsSection = document.getElementById('cars');
      if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
      toast.info('Compare Cars', { description: 'Use the Compare button on any car card to add cars to compare (up to 3).', duration: 4000 });
      return;
    }
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.info(label, {
        description: `${label} section coming soon!`,
        duration: 3000,
      });
    }
  };

  const handleBrandClick = (brand: string) => {
    setActiveFilters({ ...activeFilters, brand });
    const carsSection = document.getElementById('cars');
    if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
    toast.success(`Showing ${brand} cars`, { duration: 2500 });
  };

  return (
    <footer className="mt-auto w-full border-t border-white/[0.04] bg-[#0A0A0A]">
      {/* ───── Main 5-column grid ───── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Column 1 - Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="Saatvik Cars logo"
                className="h-9 w-9 rounded-lg object-contain"
                loading="lazy"
                suppressHydrationWarning
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Saatvik<span className="text-[#D7B56D]">Cars</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-sm leading-relaxed text-slate-500">
              A unit of <span className="text-slate-400">Tarang Marketing</span>.
              Used car listings in Bilaspur. Contact us to confirm availability.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  suppressHydrationWarning
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-slate-500 transition-all duration-200 hover:border-[#D7B56D]/30 hover:text-[#D7B56D] hover:bg-[#D7B56D]/5 hover:shadow-[0_0_12px_rgba(215,181,109,0.1)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href, action }) => (
                <li key={label}>
                  <button
                    onClick={() => handleQuickLink(href, label, action)}
                    suppressHydrationWarning
                    className="group flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Car Brands */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Car Brands
            </h3>
            <ul className="space-y-2.5">
              {carBrands.map((brand) => (
                <li key={brand}>
                  <button
                    onClick={() => handleBrandClick(brand)}
                    suppressHydrationWarning
                    className="group flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {brand}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Us */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Us
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="text-sm leading-relaxed text-slate-500">
                  {BUSINESS.legalName}<br />
                  {BUSINESS.address} · GSTIN: {BUSINESS.gstin}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="flex flex-col text-sm text-slate-500">
                  {BUSINESS.phones.map((phone) => (
                    <a key={phone.tel} href={`tel:${phone.tel}`} className="transition-colors hover:text-white">{phone.display}</a>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-sm text-slate-500 transition-colors hover:text-white"
                >
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {BUSINESS.hours}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="text-sm text-slate-500">
                  GSTIN: {BUSINESS.gstin}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5 - Visit information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Before You Visit
            </h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Contact Saatvik Cars to confirm a car is still available and arrange a showroom visit.
            </p>
          </div>
        </div>
      </div>

      {/* ───── Bottom Bar ───── */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} {BUSINESS.dealerName} (A unit of {BUSINESS.parentCompany}). All rights reserved. GSTIN: {BUSINESS.gstin}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              href="/privacy-policy"
              suppressHydrationWarning
              className="text-[11px] text-slate-400 transition-colors hover:text-slate-300"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setAdminPanelOpen(true);
                } else {
                  setLoginModalOpen(true);
                }
              }}
              className="inline-flex min-h-10 items-center gap-2 border border-[#D7B56D]/50 bg-[#D7B56D] px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#e2c17d]"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              {isAdmin ? 'Admin Panel' : 'Admin Login'}
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
}
