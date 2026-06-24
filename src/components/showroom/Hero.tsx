'use client';

import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Car, Users, Award, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const HERO_IMAGES = [
  '/images/hero-bg-main.jpg',
  '/images/hero-car-1.png',
  '/images/hero-car-2.png',
  '/images/hero-car-3.png',
  '/images/hero-car-4.png',
  '/images/hero-car-5.png',
];

// ─── Animated Counter Sub-Component ───
interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}

const AnimatedCounter = memo(function AnimatedCounter({
  target,
  suffix = '+',
  duration = 2000,
  delay = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hasStarted, target, duration]);

  return (
    <span className="will-change-[contents]" suppressHydrationWarning>
      {count}
      {suffix}
    </span>
  );
});

// ─── Stat Item Component ───
interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  animDelay: number;
}

const StatItem = memo(function StatItem({
  icon,
  value,
  label,
  animDelay,
}: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: animDelay, ease }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,77,0,0.15)] bg-[rgba(255,77,0,0.08)] text-[#FF4D00]">
        {icon}
      </div>
      <div className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        <AnimatedCounter target={value} suffix="+" delay={1200 + animDelay * 1000} />
      </div>
      <div className="mt-1 text-[11px] font-bold tracking-[0.2em] text-[#FF4D00]/70 uppercase">
        {label}
      </div>
    </motion.div>
  );
});

// ─── Main Hero Component ───
export default function Hero() {
  const { navigate } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModal, setIsVideoModal] = useState(false);

  // Touch/swipe support for mobile carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  const stats = useMemo(
    () =>
      [
        { value: 500, label: 'VERIFIED', icon: <Car className="h-4 w-4" suppressHydrationWarning /> },
        { value: 100, label: 'CUSTOMERS', icon: <Users className="h-4 w-4" suppressHydrationWarning /> },
        { value: 50, label: 'BRANDS', icon: <Award className="h-4 w-4" suppressHydrationWarning /> },
      ] as const,
    [],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }, [nextSlide, prevSlide]);

  const handleBrowseCars = useCallback(() => navigate({ page: 'cars' }), [navigate]);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── Cinematic Car Photo Background Carousel ─── */}
      <div className="absolute inset-0 z-[1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Car Image */}
            <img
              src={HERO_IMAGES[currentSlide]}
              alt={`Premium car ${currentSlide + 1}`}
              suppressHydrationWarning
              className="h-full w-full object-cover object-center"
              fetchPriority={currentSlide === 0 ? 'high' : undefined}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark cinematic overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-[2]" />
        {/* Gradient from bottom for smooth section transition — neon orange tint */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[45%] z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 70%, transparent 100%)' }}
        />
        {/* Top vignette */}
        <div
          className="absolute top-0 left-0 right-0 h-[25%] z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        />
        {/* Side vignettes for cinematic feel */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
        />
        {/* Neon orange glow accent at bottom */}
        <div
          className="absolute bottom-[15%] left-0 right-0 h-[30%] z-[3] pointer-events-none opacity-30"
          style={{ background: 'linear-gradient(to top, rgba(255,77,0,0.12) 0%, transparent 100%)' }}
        />
      </div>

      {/* ─── Texture Grid Overlay ─── */}
      <div className="hero-grid absolute inset-0 z-[4] pointer-events-none" />

      {/* ─── Power Lines Overlay ─── */}
      <div className="power-lines absolute inset-0 z-[4] pointer-events-none" />

      {/* ─── Carousel Navigation Arrows ─── */}
      <button
        onClick={prevSlide}
        suppressHydrationWarning
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-black/40 text-white/60 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-[#FF4D00] hover:border-[rgba(255,77,0,0.3)] hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" suppressHydrationWarning />
      </button>
      <button
        onClick={nextSlide}
        suppressHydrationWarning
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-black/40 text-white/60 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-[#FF4D00] hover:border-[rgba(255,77,0,0.3)] hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" suppressHydrationWarning />
      </button>

      {/* ─── Carousel Dots ─── */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            suppressHydrationWarning
            className={`h-2 rounded-full transition-all duration-500 ${
              i === currentSlide
                ? 'w-8 bg-[#FF4D00] shadow-[0_0_12px_rgba(255,77,0,0.5)]'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ─── Hero Content ─── */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Power badge — neon orange border + glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(255,77,0,0.25)] bg-[rgba(255,77,0,0.08)] px-5 py-2 text-[11px] font-bold tracking-[0.25em] text-[#FF4D00] uppercase backdrop-blur-sm neon-border-glow">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D00] shadow-[0_0_8px_rgba(255,77,0,0.6)]" />
            POWER // PERFORMANCE // PRECISION
          </span>
        </motion.div>

        {/* Main heading — bold, uppercase, tight tracking */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mx-auto max-w-4xl text-[clamp(2.75rem,8vw,5rem)] font-black leading-[1.05] tracking-[-0.02em] text-white sm:leading-[1.02]"
        >
          Find Your{' '}
          <span className="relative inline-block uppercase tracking-tight">
            PERFECT CAR
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent shadow-[0_0_10px_rgba(255,77,0,0.4)]" />
          </span>
        </motion.h1>

        {/* Subtext — silver/gray tones */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#C0C0C0]/60 sm:text-xl"
        >
          Verified listings. Direct owner deals. Best prices guaranteed.
        </motion.p>

        {/* CTA Buttons — Neon orange primary, dark outline secondary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            onClick={handleBrowseCars}
            size="lg"
            suppressHydrationWarning
            className="group h-[52px] min-w-[200px] rounded-full bg-[#FF4D00] px-8 text-[15px] font-bold tracking-wide text-black shadow-[0_0_25px_rgba(255,77,0,0.3)] transition-all duration-300 hover:bg-[#FF6B2B] hover:shadow-[0_0_40px_rgba(255,77,0,0.45)] hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center">
              Browse Cars
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" suppressHydrationWarning />
            </span>
          </Button>

          <Button
            onClick={handleBrowseCars}
            variant="outline"
            size="lg"
            suppressHydrationWarning
            className="group h-[52px] min-w-[200px] rounded-full border-[rgba(255,77,0,0.25)] bg-black/30 px-8 text-[15px] font-bold tracking-wide text-[#C0C0C0] backdrop-blur-sm transition-all duration-300 hover:border-[#FF4D00] hover:bg-[rgba(255,77,0,0.08)] hover:text-[#FF4D00] active:scale-[0.98]"
          >
            <Play className="mr-2 h-4 w-4" suppressHydrationWarning />
            View Gallery
          </Button>
        </motion.div>

        {/* Stats — neon orange accents, uppercase bold labels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20"
        >
          <div className="mx-auto mb-8 h-px w-48 bg-gradient-to-r from-transparent via-[rgba(255,77,0,0.15)] to-transparent" />
          <div className="flex items-center justify-center gap-12 sm:gap-20">
            {stats.map((stat, i) => (
              <StatItem
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                animDelay={0.85 + i * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Slide counter — neon orange active number ─── */}
      <div className="absolute bottom-32 right-8 z-20 hidden sm:flex items-center gap-2 text-white/30">
        <span className="text-2xl font-bold text-[#FF4D00] tabular-nums neon-text-glow" suppressHydrationWarning>
          {String(currentSlide + 1).padStart(2, '0')}
        </span>
        <span className="text-sm">/</span>
        <span className="text-sm tabular-nums" suppressHydrationWarning>{String(HERO_IMAGES.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
