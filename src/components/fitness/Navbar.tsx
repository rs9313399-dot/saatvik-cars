'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Dumbbell, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

interface NavLink {
  label: string;
  href: string;
  section: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Programs', href: '#programs', section: 'programs' },
  { label: 'Trainers', href: '#trainers', section: 'trainers' },
  { label: 'Pricing', href: '#pricing', section: 'pricing' },
  { label: 'Schedule', href: '#schedule', section: 'schedule' },
  { label: 'BMI Calculator', href: '#bmi', section: 'bmi' },
];

// ── NavLinks component defined outside render ──────────────────────────
function NavLinks({
  mobile = false,
  activeSection,
  scrollToSection,
}: {
  mobile?: boolean;
  activeSection: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <nav
      className={`flex ${mobile ? 'flex-col gap-1' : 'items-center gap-1'}`}
      role="navigation"
      aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}
    >
      {NAV_LINKS.map((link) => {
        const isActive = activeSection === link.section;
        return (
          <a
            key={link.section}
            href={link.href}
            onClick={(e) => scrollToSection(e, link.href)}
            className={`
              relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'}
              ${mobile ? 'text-base px-4 py-3' : ''}
            `}
            suppressHydrationWarning
          >
            {isActive && (
              <motion.span
                layoutId={mobile ? undefined : 'nav-active-indicator'}
                className="absolute inset-0 rounded-md bg-emerald-400/10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const { activeSection, setActiveSection, mobileMenuOpen, setMobileMenuOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Scroll shadow ──────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── IntersectionObserver for active section ────────────────────────
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.section)
    ).filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const mostVisible = visible.sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          )[0];
          setActiveSection(mostVisible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observerRef.current!.observe(section));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [setActiveSection]);

  // ── Smooth scroll handler ──────────────────────────────────────────
  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileMenuOpen(false);
    },
    [setMobileMenuOpen]
  );

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : ''}
      `}
      style={{
        background: 'rgba(5, 10, 5, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.08)',
      }}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group"
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks activeSection={activeSection} scrollToSection={scrollToSection} />
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-md px-5"
              size="sm"
              asChild
            >
              <a href="#pricing" onClick={(e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, '#pricing')}>
                Join Now
              </a>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-emerald-400"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile sheet menu ──────────────────────────────────────── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[280px] border-l-emerald-900/30"
          style={{
            background: 'rgba(5, 10, 5, 0.95)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <SheetHeader>
            <SheetTitle
              className="flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              suppressHydrationWarning
            >
              <Dumbbell className="w-5 h-5 text-emerald-400" style={{ WebkitTextFillColor: 'unset' }} />
              FITFORGE
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-xs">
              Navigate to a section
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 px-2 mt-2">
            <NavLinks mobile activeSection={activeSection} scrollToSection={scrollToSection} />

            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-md mt-4 w-full"
              size="lg"
              asChild
            >
              <a
                href="#pricing"
                onClick={(e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, '#pricing')}
              >
                Join Now
              </a>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
