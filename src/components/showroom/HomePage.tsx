'use client';

import { useEffect, useState } from 'react';
import type { Car } from '@/lib/types';
import { BRANDS } from '@/lib/types';
import type { Route } from '@/lib/store';
import { useStore } from '@/lib/store';
import { fetchCars, fetchCar } from '@/lib/api';
import Hero from './Hero';
import CarCard from './CarCard';
import SkeletonCard from './SkeletonCard';
import ScrollReveal from './ScrollReveal';
import FAQSection from './FAQSection';
import dynamic from 'next/dynamic';
const CountdownTimer = dynamic(() => import('./CountdownTimer'), { ssr: false });
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Handshake, BadgePercent, Star, Quote, Clock, Sparkles, TrendingUp, Award, Search, Car, CircleDot, Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const testimonials = [
  {
    name: 'Rajesh Kumar',
    car: 'Honda City 2022',
    rating: 5,
    review: 'Excellent service! The car was exactly as described. No hidden issues, fair pricing.',
    avatar: 'RK',
  },
  {
    name: 'Priya Sharma',
    car: 'Hyundai Creta 2023',
    rating: 4,
    review: 'Found my dream car within a week. The verification process gave me complete confidence. Minor delay in paperwork.',
    avatar: 'PS',
  },
  {
    name: 'Amit Patel',
    car: 'Maruti Brezza 2023',
    rating: 5,
    review: 'Best place for pre-owned cars. Transparent dealing, no middlemen, amazing experience!',
    avatar: 'AP',
  },
];

// Fixed future date for promotional urgency (avoids hydration mismatch from Date.now())
const SALE_END_DATE = '2026-09-15T23:59:59';

/* ═══════════════════════════════════════════════════════════
   UNIQUE BENTO SHOWCASE SECTION — NEON ORANGE EDITION
   Combines: Premium Showroom + How It Works + Trust Badges
   ═══════════════════════════════════════════════════════════ */

function BentoShowcase({ navigate }: { navigate: (r: Route) => void }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', icon: <Search className="h-5 w-5" suppressHydrationWarning />, title: 'Browse & Discover', desc: 'Explore curated verified premium vehicles' },
    { num: '02', icon: <ShieldCheck className="h-5 w-5" suppressHydrationWarning />, title: 'Verify & Inspect', desc: 'Complete transparency with inspection reports' },
    { num: '03', icon: <Handshake className="h-5 w-5" suppressHydrationWarning />, title: 'Connect & Negotiate', desc: 'Direct owner deals — no middlemen' },
    { num: '04', icon: <Car className="h-5 w-5" suppressHydrationWarning />, title: 'Drive Home Happy', desc: 'Free paperwork & easy financing' },
  ];

  const trustItems = [
    { icon: <ShieldCheck className="h-7 w-7" suppressHydrationWarning />, title: 'Verified Listings', desc: 'Every car inspected & verified by our team', stat: '500+', statLabel: 'VERIFIED' },
    { icon: <Handshake className="h-7 w-7" suppressHydrationWarning />, title: 'Direct Owner Deals', desc: 'No middlemen, no hidden fees — save up to 20%', stat: '₹2L+', statLabel: 'SAVED' },
    { icon: <BadgePercent className="h-7 w-7" suppressHydrationWarning />, title: 'Best Prices', desc: 'Competitive market pricing with price match guarantee', stat: '100%', statLabel: 'GUARANTEED' },
  ];

  const showroomItems = [
    { src: '/images/hero-bg-main.jpg', label: 'Luxury Sedans', count: '120+' },
    { src: '/images/hero-car-3.png', label: 'Sports Cars', count: '80+' },
    { src: '/images/hero-car-5.png', label: 'Premium SUVs', count: '95+' },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-16">
      {/* ── Ambient background glow — neon orange ── */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#FF4D00]/[0.03] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)] px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-[#FF4D00]" suppressHydrationWarning />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF4D00]">POWER // PERFORMANCE</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl uppercase">
            Why We&apos;re <span className="bg-gradient-to-r from-[#FF4D00] via-[#FF6B2B] to-[#FF4D00] bg-clip-text text-transparent">Different</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[#C0C0C0]/50">
            From discovery to delivery — a premium experience at every step.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════
            BENTO GRID LAYOUT
            ═══════════════════════════════════════════ */}
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto]">

          {/* ── ROW 1: Showroom (spans full width) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-12"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-6 sm:p-8">
              {/* Section mini header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,77,0,0.1)] border border-[rgba(255,77,0,0.15)]">
                    <Sparkles className="h-5 w-5 text-[#FF4D00]" suppressHydrationWarning />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0C0C0]/40">Our Collection</p>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Premium Showroom</h3>
                  </div>
                </div>
                <button
                  onClick={() => navigate({ page: 'cars' })}
                  suppressHydrationWarning
                  className="group flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-white/5 px-4 py-2 text-xs font-bold text-[#C0C0C0]/60 transition-all duration-300 hover:border-[rgba(255,77,0,0.3)] hover:bg-[rgba(255,77,0,0.08)] hover:text-[#FF4D00]"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" suppressHydrationWarning />
                </button>
              </div>

              {/* Horizontal card row */}
              <div className="grid gap-4 sm:grid-cols-3">
                {showroomItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  >
                    <div
                      className="group relative overflow-hidden rounded-xl aspect-[16/9] cursor-pointer"
                      onClick={() => navigate({ page: 'cars' })}
                    >
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      {/* Bottom label */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4">
                        <div>
                          <span className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</span>
                          <p className="text-[11px] text-[#C0C0C0]/50">{item.count} cars</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-300 group-hover:bg-[rgba(255,77,0,0.2)] group-hover:text-[#FF4D00] group-hover:scale-110">
                          <ArrowRight className="h-3.5 w-3.5" suppressHydrationWarning />
                        </div>
                      </div>
                      {/* Corner accent — neon orange */}
                      <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,77,0,0.2)] backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-[#FF4D00]" suppressHydrationWarning />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── ROW 2: How It Works (spans 7 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8">
              {/* Decorative diagonal line */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rotate-45 rounded-full bg-[#FF4D00]/[0.04] blur-3xl" />

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-[rgba(255,255,255,0.06)]">
                  <CircleDot className="h-5 w-5 text-[#C0C0C0]/60" suppressHydrationWarning />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0C0C0]/30">Simple Process</p>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">How It Works</h3>
                </div>
              </div>

              {/* Steps - 2x2 grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="group relative flex items-start gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[rgba(255,77,0,0.2)] hover:bg-[rgba(255,77,0,0.04)]"
                  >
                    {/* Step number + icon — neon orange */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,77,0,0.1)] text-[#FF4D00] transition-colors duration-300 group-hover:bg-[rgba(255,77,0,0.2)]">
                        {step.icon}
                      </div>
                      <span className="text-[9px] font-bold text-[#FF4D00]/40">{step.num}</span>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-[#FF6B2B]">{step.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#C0C0C0]/40">{step.desc}</p>
                    </div>
                    {/* Connecting line for steps (hidden on last) */}
                    {i < 3 && (
                      <div className="pointer-events-none absolute -bottom-1.5 left-1/2 h-3 w-px bg-[rgba(255,255,255,0.06)] sm:hidden" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Horizontal connecting line between steps (desktop only) */}
              <div className="pointer-events-none absolute top-[52%] left-[12%] right-[12%] hidden h-px bg-gradient-to-r from-transparent via-[rgba(255,77,0,0.1)] to-transparent lg:block" />
            </div>
          </motion.div>

          {/* ── ROW 2: Trust Badges (spans 5 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border border-[rgba(255,77,0,0.1)] bg-gradient-to-br from-[rgba(255,77,0,0.06)] via-white/[0.02] to-transparent p-6 sm:p-8">
              {/* Subtle neon orange glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF4D00]/[0.06] blur-[80px]" />

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,77,0,0.1)] border border-[rgba(255,77,0,0.15)]">
                  <TrendingUp className="h-5 w-5 text-[#FF4D00]" suppressHydrationWarning />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF4D00]/60">Why Choose Us</p>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Trusted by Thousands</h3>
                </div>
              </div>

              {/* Trust cards - stacked */}
              <div className="flex flex-col gap-3">
                {trustItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                    className="group flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[rgba(255,77,0,0.2)] hover:bg-[rgba(255,77,0,0.04)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,77,0,0.1)] text-[#FF4D00] transition-all duration-300 group-hover:bg-[rgba(255,77,0,0.2)] group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-[#C0C0C0]/40 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-black text-[#FF4D00]">{item.stat}</div>
                      <div className="text-[10px] font-bold text-[#C0C0C0]/30">{item.statLabel}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { navigate, recentlyViewed, hydrated } = useStore();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [recentCars, setRecentCars] = useState<Car[]>([]);
  const [recentlyViewedCars, setRecentlyViewedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featured, recent] = await Promise.all([
          fetchCars({ sort: 'newest' }).then((result) =>
            result.cars.filter((c) => {
              const tags: string[] = c.tags
                ? typeof c.tags === 'string'
                  ? c.tags.split(',').filter(Boolean)
                  : Array.isArray(c.tags) ? c.tags : []
                : [];
              return tags.includes('featured');
            })
          ),
          fetchCars({ sort: 'newest' }).then((result) => result.cars),
        ]);
        setFeaturedCars(featured.slice(0, 4));
        setRecentCars(recent.slice(0, 6));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load recently viewed cars when store hydrates
  useEffect(() => {
    if (!hydrated || recentlyViewed.length === 0) return;
    const loadRecentlyViewed = async () => {
      try {
        const carPromises = recentlyViewed.slice(0, 4).map((id) =>
          fetchCar(id).catch(() => null)
        );
        const cars = (await Promise.all(carPromises)).filter((c): c is Car => c !== null);
        setRecentlyViewedCars(cars);
      } catch {
        // silently fail
      }
    };
    loadRecentlyViewed();
  }, [hydrated, recentlyViewed]);

  // Duplicate brand list 3x for seamless marquee loop
  const marqueeBrands = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <div className="pb-20 sm:pb-0">
      <Hero />

      {/* ─── Brand Marquee — Dark bg, neon orange hover ─── */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="fade" className="mb-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C0C0C0]/40">Trusted Brands We Deal In</p>
          </ScrollReveal>
        </div>
        <div className="marquee-container">
          <div className="marquee-track">
            {marqueeBrands.map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="inline-flex shrink-0 items-center rounded-full border border-[rgba(255,255,255,0.06)] bg-white/[0.03] px-5 py-2 text-sm font-medium text-[#C0C0C0]/60 transition-all duration-300 hover:border-[rgba(255,77,0,0.2)] hover:text-[#FF4D00]"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Flash Sale / Countdown Section — Neon Orange Pulse ─── */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="fade">
            <div className="pulse-border-neon relative overflow-hidden rounded-2xl border border-[rgba(255,77,0,0.2)] bg-gradient-to-br from-[rgba(255,77,0,0.08)] via-[rgba(255,107,43,0.04)] to-transparent p-8 sm:p-10">
              {/* Background glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#FF4D00]/[0.08] blur-[100px]" />

              <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(255,77,0,0.15)] px-3 py-1 text-xs font-bold tracking-widest text-[#FF4D00] uppercase">
                    <Sparkles className="h-3 w-3" suppressHydrationWarning />
                    LIMITED TIME OFFER
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                    Weekend Flash Sale
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-[#C0C0C0]/50">
                    Get up to 15% off on select premium pre-owned vehicles. Free insurance on cars above ₹10 Lakh. Don&apos;t miss out!
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4D00]/60">Offer ends in</p>
                  <CountdownTimer targetDate={SALE_END_DATE} />
                  <Button
                    onClick={() => navigate({ page: 'cars' })}
                    size="sm"
                    suppressHydrationWarning
                    className="mt-2 rounded-full bg-[#FF4D00] px-6 text-sm font-bold tracking-wide text-black shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all duration-300 hover:bg-[#FF6B2B] hover:scale-110 hover:shadow-[0_0_35px_rgba(255,77,0,0.45)] active:scale-95"
                  >
                    Shop Now <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" suppressHydrationWarning />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Featured Cars — Compact, Neon Orange Badge ─── */}
      <section className="bg-black py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <ScrollReveal direction="left">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FF4D00]" suppressHydrationWarning />
                <Badge variant="secondary" className="border-[rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)] text-[11px] font-bold tracking-[0.15em] text-[#FF4D00] uppercase">Featured</Badge>
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white uppercase">Featured Cars</h2>
            </ScrollReveal>
            <Button
              variant="ghost"
              onClick={() => navigate({ page: 'cars' })}
              className="group gap-1 text-sm font-bold text-[#C0C0C0]/50 hover:text-[#FF4D00]"
            >
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" suppressHydrationWarning />
            </Button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredCars.length > 0
                ? featuredCars.map((car) => (
                    <motion.div key={car.id} variants={itemVariants}>
                      <CarCard car={car} onNavigate={navigate} />
                    </motion.div>
                  ))
                : Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </motion.div>
        </div>
      </section>

      {/* ─── Recently Added — Compact, Neon Orange ─── */}
      <section className="bg-black py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <ScrollReveal direction="left">
              <Badge variant="secondary" className="border-[rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)] text-[11px] font-bold tracking-[0.15em] text-[#FF4D00] uppercase">New Arrivals</Badge>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white uppercase">Recently Added</h2>
            </ScrollReveal>
            <Button
              variant="ghost"
              onClick={() => navigate({ page: 'cars', filters: { sort: 'newest' } })}
              className="group gap-1 text-sm font-bold text-[#C0C0C0]/50 hover:text-[#FF4D00]"
            >
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" suppressHydrationWarning />
            </Button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : recentCars.map((car) => (
                  <motion.div key={car.id} variants={itemVariants}>
                    <CarCard car={car} onNavigate={navigate} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Recently Viewed — Compact, Neon Orange ─── */}
      {recentlyViewedCars.length > 0 && (
        <section className="bg-black py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <ScrollReveal direction="left">
                <Badge variant="secondary" className="border-[rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)] text-[11px] font-bold tracking-[0.15em] text-[#FF4D00] uppercase">
                  <Clock className="mr-1 h-3 w-3" suppressHydrationWarning />
                  History
                </Badge>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white uppercase">Recently Viewed</h2>
              </ScrollReveal>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {recentlyViewedCars.map((car) => (
                <motion.div key={car.id} variants={itemVariants}>
                  <CarCard car={car} onNavigate={navigate} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Testimonials — Dark glass cards, neon orange stars/avatars ─── */}
      <section className="bg-black py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="fade" className="mb-10 text-center">
            <Badge variant="secondary" className="border-[rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)] text-[11px] font-bold tracking-[0.15em] text-[#FF4D00] uppercase">Testimonials</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white uppercase">What Our Customers Say</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#C0C0C0]/50">Real stories from real car buyers who found their perfect match with AutoElite.</p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
                <div className="glass-card flex h-full flex-col p-6">
                  {/* Quote icon */}
                  <Quote className="mb-4 h-8 w-8 text-[#FF4D00]/15" suppressHydrationWarning />

                  {/* Stars — neon orange */}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-[#FF4D00] text-[#FF4D00]" suppressHydrationWarning />
                    ))}
                  </div>

                  {/* Review */}
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-[#C0C0C0]/60">&ldquo;{t.review}&rdquo;</p>

                  {/* Customer info — neon orange avatar */}
                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,77,0,0.1)] border border-[rgba(255,77,0,0.15)] text-sm font-bold text-[#FF4D00]">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-[#C0C0C0]/40">Bought {t.car}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <FAQSection />

      {/* ═══════════════════════════════════════════════════
          UNIQUE BENTO SHOWCASE — AT THE END!
          Combines: Showroom + How It Works + Trust Badges
          ═══════════════════════════════════════════════════ */}
      <BentoShowcase navigate={navigate} />

      {/* ─── CTA Section — Neon Orange Button, Compact ─── */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent px-8 py-20 text-center text-white backdrop-blur-sm sm:px-20"
          >
            {/* Subtle neon orange glow in CTA */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[250px] w-[500px] rounded-full bg-[#FF4D00]/[0.05] blur-[100px]" />

            <div className="relative z-10">
              <h2 className="mb-5 text-4xl font-black tracking-tight uppercase sm:text-5xl">
                Ready to Find Your{' '}
                <span className="bg-gradient-to-r from-[#FF4D00] via-[#FF6B2B] to-[#FF4D00] bg-clip-text text-transparent">PERFECT CAR</span>?
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-[#C0C0C0]/50">
                Browse our curated collection of premium pre-owned vehicles and find the perfect match for your lifestyle.
              </p>

              <Button
                onClick={() => navigate({ page: 'cars' })}
                size="lg"
                suppressHydrationWarning
                className="group h-[56px] rounded-full bg-[#FF4D00] px-10 text-[15px] font-bold tracking-wide text-black shadow-[0_0_25px_rgba(255,77,0,0.3)] transition-all duration-300 hover:bg-[#FF6B2B] hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,77,0,0.45)] active:scale-[0.98]"
              >
                Browse All Cars
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" suppressHydrationWarning />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}
