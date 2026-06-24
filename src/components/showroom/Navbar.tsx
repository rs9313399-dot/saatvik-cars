'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore, type Route } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sun, Moon, Menu, Heart, Car, Home, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────── Neon Orange Color Constants ─────────────── */
const NEON = '#FF4D00';
const NEON_LIGHT = '#FF6B2B';
const NEON_DARK = '#CC3D00';

export default function Navbar() {
  const { navigate, darkMode, toggleDarkMode, mobileMenuOpen, setMobileMenuOpen, hydrated, route, wishlist } = useStore();

  // 1. Scroll-based navbar state
  const [scrolled, setScrolled] = useState(false);

  // 6. Hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 5. Dark mode toggle animation key
  const [toggleKey, setToggleKey] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // 1. Track scrolled state for bg opacity / shadow
      setScrolled(currentY > 50);

      // 6. Track scroll direction
      const delta = currentY - lastScrollY;
      if (delta > 5 && currentY > 80) {
        setHidden(true);
      } else if (delta < -5) {
        setHidden(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems: { label: string; route: Route; icon: React.ReactNode; matchPage: string }[] = [
    { label: 'HOME', route: { page: 'home' }, icon: <Home className="h-3.5 w-3.5" suppressHydrationWarning />, matchPage: 'home' },
    { label: 'CARS', route: { page: 'cars' }, icon: <Car className="h-3.5 w-3.5" suppressHydrationWarning />, matchPage: 'cars' },
    { label: 'WISHLIST', route: { page: 'cars', filters: { search: 'wishlist' } }, icon: <Heart className="h-3.5 w-3.5" suppressHydrationWarning />, matchPage: 'wishlist' },
    { label: 'ADMIN', route: { page: 'admin' }, icon: <Shield className="h-3.5 w-3.5" suppressHydrationWarning />, matchPage: 'admin' },
  ];

  const handleNav = (route: Route) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const isWishlist = route.page === 'cars' && (route as { page: string; filters?: { search?: string } }).filters?.search === 'wishlist';

  // 5. Dark mode toggle with rotation animation
  const handleDarkModeToggle = useCallback(() => {
    setToggleKey((k) => k + 1);
    toggleDarkMode();
  }, [toggleDarkMode]);

  // Render a placeholder icon of the same size during SSR to avoid hydration mismatch
  const darkModeIcon = hydrated ? (
    darkMode ? <Sun className="h-4 w-4" suppressHydrationWarning /> : <Moon className="h-4 w-4" suppressHydrationWarning />
  ) : (
    <Moon className="h-4 w-4" suppressHydrationWarning />
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: hidden ? -100 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-500 relative ${
        scrolled
          ? 'border-border bg-black/90 shadow-lg backdrop-blur-2xl supports-[backdrop-filter]:bg-black/85'
          : 'border-border bg-black/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40'
      }`}
      style={{
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <nav className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav({ page: 'home' })}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          suppressHydrationWarning
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded transition-transform duration-300 ease-out group-hover:scale-110"
            style={{
              backgroundColor: NEON,
              boxShadow: `0 0 12px ${NEON}40, 0 0 4px ${NEON}60`,
            }}
          >
            <Car className="h-3.5 w-3.5 text-white" suppressHydrationWarning />
          </div>
          <span className="text-base font-black tracking-tight text-white">
            Auto<span style={{ color: NEON }}>Elite</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const isActive = item.matchPage === 'wishlist'
              ? isWishlist
              : route.page === item.matchPage;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.route)}
                suppressHydrationWarning
                className={`nav-link group relative flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {/* Active link glow */}
                {isActive && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute inset-0 -z-10 rounded"
                    style={{
                      backgroundColor: `${NEON}10`,
                      boxShadow: `0 0 20px ${NEON}15, inset 0 0 20px ${NEON}08`,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Active dot indicator (beacon) */}
                {isActive && (
                  <motion.span
                    layoutId="nav-beacon"
                    className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: NEON,
                      boxShadow: `0 0 6px ${NEON}80, 0 0 12px ${NEON}40`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{ backgroundColor: `${NEON}60` }}
                    />
                  </motion.span>
                )}

                {item.icon}

                {/* Notification badge on Wishlist */}
                {item.matchPage === 'wishlist' && wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center"
                    style={{
                      boxShadow: `0 0 8px ${NEON}60`,
                    }}
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </motion.span>
                )}

                {item.label}
                {/* Active indicator / hover underline (neon orange) */}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300 ${
                    isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60'
                  }`}
                  style={{
                    backgroundColor: NEON,
                    boxShadow: isActive ? `0 0 8px ${NEON}60` : 'none',
                  }}
                />
              </button>
            );
          })}
          <div className="ml-2 h-4 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDarkModeToggle}
            suppressHydrationWarning
            className="ml-1.5 h-7 w-7 text-gray-400 transition-colors duration-200"
            style={{
              // @ts-expect-error CSS custom property for hover
              '--hover-bg': `${NEON}15`,
              '--hover-text': NEON,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = NEON;
              e.currentTarget.style.backgroundColor = `${NEON}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.backgroundColor = '';
            }}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={toggleKey}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                {darkModeIcon}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* Mobile dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDarkModeToggle}
            suppressHydrationWarning
            className="h-7 w-7 text-gray-400"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = NEON;
              e.currentTarget.style.backgroundColor = `${NEON}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.backgroundColor = '';
            }}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`mobile-${toggleKey}`}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                {darkModeIcon}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                suppressHydrationWarning
                className="h-7 w-7 text-gray-400"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = NEON;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
              >
                <Menu className="h-4 w-4" suppressHydrationWarning />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-0 bg-[#0A0A0A] p-0 gap-0"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              {/* Header: Logo + Close button */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded"
                    style={{
                      backgroundColor: NEON,
                      boxShadow: `0 0 12px ${NEON}40, 0 0 4px ${NEON}60`,
                    }}
                  >
                    <Car className="h-3.5 w-3.5 text-white" suppressHydrationWarning />
                  </div>
                  <span className="text-base font-black tracking-tight text-white">
                    Auto<span style={{ color: NEON }}>Elite</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  suppressHydrationWarning
                  className="h-7 w-7 text-gray-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" suppressHydrationWarning />
                </Button>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px" style={{ backgroundColor: 'rgba(255,77,0,0.15)' }} />

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto px-5 pt-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                <nav className="flex flex-col gap-0.5">
                  {/* Staggered slide-in animation for mobile menu items */}
                  {navItems.map((item, index) => {
                    const isActive = item.matchPage === 'wishlist'
                      ? isWishlist
                      : route.page === item.matchPage;
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.07,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        onClick={() => handleNav(item.route)}
                        suppressHydrationWarning
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {/* Gradient background for active mobile item */}
                        {isActive && (
                          <motion.span
                            layoutId="mobile-nav-active"
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: `linear-gradient(to right, ${NEON}18, ${NEON}08, transparent)`,
                              borderLeft: `2px solid ${NEON}`,
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        <span className="relative z-10 flex items-center gap-3">
                          <span style={{ color: isActive ? NEON : '' }}>
                            {item.icon}
                          </span>

                          {/* Notification badge on mobile Wishlist */}
                          {item.matchPage === 'wishlist' && wishlist.length > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                              style={{
                                boxShadow: `0 0 8px ${NEON}60`,
                              }}
                            >
                              {wishlist.length}
                            </motion.span>
                          )}

                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="my-3 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

                <motion.button
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: navItems.length * 0.07,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  onClick={handleDarkModeToggle}
                  suppressHydrationWarning
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold tracking-widest uppercase text-gray-500 transition-all duration-200 hover:text-gray-300"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`sheet-${toggleKey}`}
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="flex items-center justify-center"
                    >
                      {darkModeIcon}
                    </motion.span>
                  </AnimatePresence>
                  {hydrated ? (darkMode ? 'LIGHT MODE' : 'DARK MODE') : 'DARK MODE'}
                </motion.button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      {/* Bottom border gradient on scroll (neon orange) */}
      {scrolled && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${NEON}40, ${NEON}20, transparent)`,
          }}
        />
      )}
    </motion.header>
  );
}
