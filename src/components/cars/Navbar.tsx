'use client';

import { useState, useEffect, useCallback } from 'react';
import { Car, Menu, Phone, Mail, Clock, Instagram, Twitter, Youtube, Shield, LogOut, LayoutDashboard, ChevronDown, Heart, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { logoutAdmin } from '@/lib/api';
import { toast } from 'sonner';
import { BUSINESS } from '@/lib/business';

const NAV_LINKS = [
  { label: 'Used Cars', href: '#cars' },
  { label: 'Finance', href: '#finance' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
] as const;

type NavLink = (typeof NAV_LINKS)[number];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace('#', ''));

/* ─── Desktop Nav Links ─── */
function DesktopNavLinks({
  activeSection,
  onLinkClick,
}: {
  activeSection: string;
  onLinkClick: (link: NavLink) => void;
}) {
  return (
    <nav className="hidden items-center gap-0.5 lg:flex" role="navigation" aria-label="Main navigation">
      {NAV_LINKS.map((link) => {
        const sectionId = link.href.replace('#', '');
        const isActive = activeSection === sectionId;

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              onLinkClick(link);
            }}
            suppressHydrationWarning
            className={`relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
              isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {link.label}
            {isActive && (
              <motion.span
                layoutId="nav-active-indicator"
                className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-[#D7B56D]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </a>
        );
      })}
    </nav>
  );
}

/* ─── Main Navbar Component ─── */
export default function Navbar() {
  const {
    activeSection, setActiveSection, mobileMenuOpen, setMobileMenuOpen,
    setSellModalOpen, setSellValuationOpen, setLoginModalOpen, setAdminPanelOpen,
    isAdmin, setIsAdmin, setAuthToken,
    wishlistIds, setWishlistOpen, compareList,
  } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!adminDropdownOpen) return;
    const handleClick = () => setAdminDropdownOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [adminDropdownOpen]);

  /* IntersectionObserver for active section */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0.25] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [setActiveSection]);

  const handleLinkClick = useCallback(
    (link: NavLink) => {
      const el = document.getElementById(link.href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(link.href.replace('#', ''));
      setMobileMenuOpen(false);
    },
    [setActiveSection, setMobileMenuOpen]
  );

  const handleSellCar = useCallback(() => {
    setMobileMenuOpen(false);
    if (isAdmin) {
      // Admin → List Your Car (create car listing)
      setSellModalOpen(true);
    } else {
      // Customer → Sell/Trade valuation flow
      setSellValuationOpen(true);
    }
  }, [isAdmin, setMobileMenuOpen, setSellModalOpen, setSellValuationOpen]);

  const handleLogout = useCallback(async () => {
    await logoutAdmin();
    setIsAdmin(false);
    setAuthToken(null);
    setAdminDropdownOpen(false);
    toast.success('Logged out successfully');
  }, [setIsAdmin, setAuthToken]);

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
    },
    [setActiveSection]
  );

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full overflow-x-clip"
      role="banner"
    >
      {/* ─── Top Utility Bar ─── */}
      <div
        className={`hidden md:block border-b border-white/[0.04] transition-all duration-300 ${
          scrolled ? 'bg-[#060a12]/90 backdrop-blur-sm' : 'bg-[#060a12]'
        }`}
      >
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          {/* Left: GSTIN badge + email + hours */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#00D4FF]/15 bg-[#00D4FF]/[0.04] px-2 py-0.5 text-[#00D4FF]" suppressHydrationWarning>
              <Shield className="h-2.5 w-2.5" />
              GSTIN: {BUSINESS.gstin}
            </span>
            <a
              href={`mailto:${BUSINESS.email}`}
              suppressHydrationWarning
              className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-300"
            >
              <Mail className="h-3 w-3 text-[#00D4FF]" />
              <span className="hidden xl:inline">{BUSINESS.email}</span>
              <span className="xl:hidden">Email us</span>
            </a>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3 w-3 text-[#00D4FF]" />
              <span>{BUSINESS.hours}</span>
            </span>
          </div>

          {/* Right: phones + socials */}
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-4">
              {BUSINESS.phones.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  suppressHydrationWarning
                  className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-300"
                >
                  <Phone className="h-3 w-3 text-[#00D4FF]" />
                  <span>{phone.display}</span>
                </a>
              ))}
            </div>

            {/* Divider */}
            <span className="h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-[#E1306C]" aria-label="Instagram">
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a href={BUSINESS.social.twitter} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-slate-300" aria-label="Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href={BUSINESS.social.youtube} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-red-500" aria-label="YouTube">
                <Youtube className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Navbar ─── */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-[#0A0A0A]'
        }`}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a
            href="#hero"
            onClick={handleLogoClick}
            suppressHydrationWarning
            className="group flex min-w-0 items-center gap-2.5"
            aria-label="Saatvik Cars Home"
          >
            <img
              src="/logo.svg"
              alt="Saatvik Cars logo"
              className="h-9 w-9 rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
              suppressHydrationWarning
            />
            <span className="flex flex-col leading-none">
              <span className="text-[17px] font-extrabold text-white">
                Saatvik<span className="text-[#D7B56D]">Cars</span>
              </span>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.24em] text-[#D7B56D]/70 sm:block">
                Premium Pre-Owned
              </span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <DesktopNavLinks activeSection={activeSection} onLinkClick={handleLinkClick} />

          {/* Right side CTAs */}
          <div className="flex shrink-0 items-center gap-2.5">
            {/* Wishlist button — visible on md+ */}
            <button
              onClick={() => setWishlistOpen(true)}
              suppressHydrationWarning
              className="relative hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"
              aria-label={`Open wishlist (${wishlistIds.length} saved)`}
            >
              <Heart className={`h-4 w-4 ${wishlistIds.length > 0 ? 'fill-red-400 text-red-400' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white" suppressHydrationWarning>
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Compare button — visible on md+ */}
            <button
              onClick={() => {
                const carsSection = document.getElementById('cars');
                if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
                if (compareList.length === 0) {
                  toast.info('Compare Cars', { description: 'Add cars using the Compare button on any car card (up to 3).', duration: 4000 });
                }
              }}
              suppressHydrationWarning
              className="relative hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-[#00D4FF]/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5"
              aria-label={`Compare cars (${compareList.length} selected)`}
            >
              <Scale className="h-4 w-4" />
              {compareList.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00D4FF] px-1 text-[9px] font-bold text-[#0A0A0A]" suppressHydrationWarning>
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Phone icon button — visible on md+ */}
            <a
              href={`tel:${BUSINESS.primaryPhone}`}
              suppressHydrationWarning
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-[#00D4FF]/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5"
              aria-label="Call us"
            >
              <Phone className="h-4 w-4" />
            </a>

            {isAdmin ? (
              /* ── Admin is logged in ── */
              <div className="hidden sm:flex items-center gap-1.5">
                <Button
                  suppressHydrationWarning
                  className="h-8 rounded-lg bg-[#00D4FF] px-3.5 text-xs font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-200 hover:bg-[#00B8E6] hover:shadow-[0_0_24px_rgba(0,212,255,0.25)]"
                  onClick={handleSellCar}
                >
                  <Car className="mr-1.5 h-3.5 w-3.5" />
                  Sell Car
                </Button>

                {/* Admin dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setAdminDropdownOpen(!adminDropdownOpen); }}
                    suppressHydrationWarning
                    aria-label="Admin menu"
                    aria-expanded={adminDropdownOpen}
                    className="flex items-center gap-1.5 h-8 rounded-lg border border-[#00D4FF]/20 bg-[#00D4FF]/5 px-2.5 text-xs font-semibold text-[#00D4FF] transition-all duration-200 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/30"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                    <ChevronDown className={`h-3 w-3 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {adminDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-white/[0.08] bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl py-1.5 z-50"
                      >
                        <button
                          onClick={() => { setAdminPanelOpen(true); setAdminDropdownOpen(false); }}
                          suppressHydrationWarning
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-[#00D4FF]" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => { setSellModalOpen(true); setAdminDropdownOpen(false); }}
                          suppressHydrationWarning
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <Car className="h-4 w-4 text-emerald-400" />
                          Add New Car
                        </button>
                        <div className="my-1.5 h-px bg-white/[0.06]" />
                        <button
                          onClick={handleLogout}
                          suppressHydrationWarning
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* ── Not logged in ── */
              <Button
                suppressHydrationWarning
                className="hidden sm:inline-flex h-8 rounded-lg border border-[#00D4FF]/20 bg-[#00D4FF]/5 px-3.5 text-xs font-semibold text-[#00D4FF] transition-all duration-200 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/30"
                onClick={() => setLoginModalOpen(true)}
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Admin Login
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <div className="flex items-center">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  position: 'fixed',
                  left: 'calc(100vw - 3rem)',
                  top: '0.75rem',
                  zIndex: 9999,
                  display: 'flex',
                  width: '2rem',
                  height: '2rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(215,181,109,0.4)',
                  background: '#D7B56D',
                  color: '#0A0A0A',
                }}
                className="mobile-menu-trigger transition-colors hover:bg-[#E7C77B]"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent
                  side="right"
                  className="w-[280px] border-0 bg-[#060a12] p-0 gap-0 [&>button]:text-slate-500 [&>button]:hover:text-white"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  {/* Drawer header */}
                  <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-4">
                    <img
                      src="/logo.svg"
                      alt="Saatvik Cars logo"
                      className="h-8 w-8 rounded-lg object-contain"
                      suppressHydrationWarning
                    />
                    <span className="flex flex-col leading-none">
                      <span className="text-base font-extrabold text-white">
                        Saatvik<span className="text-[#D7B56D]">Cars</span>
                      </span>
                      <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#D7B56D]/70">
                        Premium Pre-Owned
                      </span>
                    </span>
                    {isAdmin && (
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-2 py-0.5 text-[10px] font-semibold text-[#00D4FF]">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Drawer nav links */}
                  <nav className="flex flex-col px-3 pt-3 pb-4" role="navigation" aria-label="Mobile navigation">
                    {NAV_LINKS.map((link) => {
                      const sectionId = link.href.replace('#', '');
                      const isActive = activeSection === sectionId;

                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(link);
                          }}
                          suppressHydrationWarning
                          className={`flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                            isActive
                              ? 'bg-[#00D4FF]/[0.08] text-white'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {link.label}
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
                          )}
                        </a>
                      );
                    })}

                    {/* Admin actions in drawer */}
                    {isAdmin ? (
                      <>
                        <div className="my-2 h-px bg-white/[0.06]" />
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setSellModalOpen(true); }}
                          suppressHydrationWarning
                          className="flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors"
                        >
                          <Car className="mr-2.5 h-4 w-4" />
                          Sell / Add Car
                        </a>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setAdminPanelOpen(true); }}
                          suppressHydrationWarning
                          className="flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors"
                        >
                          <LayoutDashboard className="mr-2.5 h-4 w-4" />
                          Admin Dashboard
                        </a>
                        <button
                          suppressHydrationWarning
                          className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10"
                          onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setSellValuationOpen(true); }}
                          suppressHydrationWarning
                          className="flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors"
                        >
                          <Car className="mr-2.5 h-4 w-4" />
                          Sell / Trade Your Car
                        </a>
                        <button
                          suppressHydrationWarning
                          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[#00D4FF]/5 border border-[#00D4FF]/20 text-sm font-semibold text-[#00D4FF] transition-all duration-200 hover:bg-[#00D4FF]/10"
                          onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Login
                        </button>
                      </>
                    )}
                  </nav>

                  {/* Drawer footer — contact info */}
                  <div className="mt-auto border-t border-white/[0.06] px-5 py-4">
                    <div className="flex flex-col gap-2.5 text-[11px] text-slate-500">
                      {BUSINESS.phones.map((phone) => (
                        <a key={phone.tel} href={`tel:${phone.tel}`} suppressHydrationWarning className="flex items-center gap-2 transition-colors hover:text-slate-300">
                          <Phone className="h-3 w-3 text-[#00D4FF]" />
                          {phone.display}
                        </a>
                      ))}
                      <a href={`mailto:${BUSINESS.email}`} suppressHydrationWarning className="flex items-center gap-2 transition-colors hover:text-slate-300">
                        <Mail className="h-3 w-3 text-[#00D4FF]" />
                        {BUSINESS.email}
                      </a>
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-[#00D4FF]" />
                        {BUSINESS.hours}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-[#E1306C]" aria-label="Instagram">
                        <Instagram className="h-4 w-4" />
                      </a>
                      <a href={BUSINESS.social.twitter} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-slate-300" aria-label="Twitter">
                        <Twitter className="h-4 w-4" />
                      </a>
                      <a href={BUSINESS.social.youtube} target="_blank" rel="noopener noreferrer" suppressHydrationWarning className="text-slate-400 transition-colors hover:text-red-500" aria-label="YouTube">
                        <Youtube className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Animated Gradient Line ─── */}
      <div className="nav-gradient-line-animated" />
    </header>
  );
}
