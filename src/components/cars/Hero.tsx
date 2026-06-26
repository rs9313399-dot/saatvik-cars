'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ShieldCheck,
  BadgeCheck,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { HERO_BRANDS, BUSINESS } from '@/lib/business';

const brands = [
  { value: 'all', label: 'All Brands' },
  ...HERO_BRANDS.map((b) => ({ value: b, label: b })),
];

const budgets = [
  { value: 'any', label: 'Any Budget' },
  { value: 'under-5l', label: 'Under ₹5 Lakh' },
  { value: '5l-10l', label: '₹5–10 Lakh' },
  { value: '10l-20l', label: '₹10–20 Lakh' },
  { value: '20l-40l', label: '₹20–40 Lakh' },
  { value: 'above-40l', label: 'Above ₹40 Lakh' },
];

const fuelTypes = [
  { value: 'any', label: 'Any Fuel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
];

const stats = [
  { number: '9+', label: 'Ready cars' },
  { number: '150-pt', label: 'Inspection' },
  { number: '7-day', label: 'Return policy' },
  { number: 'GST', label: 'Registered dealer' },
];

const trustItems = [
  { icon: ShieldCheck, text: '150-point inspection' },
  { icon: BadgeCheck, text: 'Verified documents' },
  { icon: RefreshCw, text: '7-day return' },
];

const conciergeItems = [
  'Private showroom viewing',
  'Finance guidance',
  'RC transfer support',
];

const popularSearches = [
  { label: 'Swift', brand: 'Maruti Suzuki' },
  { label: 'Creta', brand: 'Hyundai' },
  { label: 'Nexon', brand: 'Tata' },
  { label: 'City', brand: 'Honda' },
  { label: 'Fortuner', brand: 'Toyota' },
  { label: 'BMW', brand: 'BMW' },
];

export default function Hero() {
  const [brand, setBrand] = useState('all');
  const [budget, setBudget] = useState('any');
  const [fuel, setFuel] = useState('any');
  const { setActiveFilters } = useStore();

  const handleSearch = () => {
    const filters: Record<string, string | number> = {};
    if (brand !== 'all') {
      filters.brand = brands.find((b) => b.value === brand)?.label || brand;
    }
    if (budget !== 'any') {
      switch (budget) {
        case 'under-5l': filters.minPrice = 0; filters.maxPrice = 500000; break;
        case '5l-10l': filters.minPrice = 500000; filters.maxPrice = 1000000; break;
        case '10l-20l': filters.minPrice = 1000000; filters.maxPrice = 2000000; break;
        case '20l-40l': filters.minPrice = 2000000; filters.maxPrice = 4000000; break;
        case 'above-40l': filters.minPrice = 4000000; break;
      }
    }
    if (fuel !== 'any') {
      filters.fuelType = fuelTypes.find((f) => f.value === fuel)?.label || fuel;
    }
    setActiveFilters(filters);
    const carsSection = document.getElementById('cars');
    if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
    toast.success('Searching cars', {
      description: `${brand !== 'all' ? brands.find((b) => b.value === brand)?.label : 'All brands'} · ${budget !== 'any' ? budgets.find((b) => b.value === budget)?.label : 'Any budget'}`,
      duration: 3000,
    });
  };

  const handleBrowseCars = () => {
    const carsSection = document.getElementById('cars');
    if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdvisorChat = () => {
    window.open(
      `https://wa.me/${BUSINESS.phones[0].digits}?text=${encodeURIComponent('Hi Saatvik Cars, I want help choosing a premium used car.')}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handlePopularSearch = (searchBrand: string) => {
    const matchedBrand = brands.find((b) => b.label.toLowerCase() === searchBrand.toLowerCase());
    if (matchedBrand) {
      setBrand(matchedBrand.value);
      setActiveFilters({ brand: matchedBrand.label });
    } else {
      setActiveFilters({ brand: searchBrand });
    }
    const carsSection = document.getElementById('cars');
    if (carsSection) setTimeout(() => { carsSection.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  return (
    <section
      id="hero"
      className="hero-editorial relative min-h-[640px] lg:min-h-[88vh] flex items-center overflow-hidden"
    >
      {/* ── Full-bleed car photograph ── */}
      <img
        src="/images/hero-bg-main.jpg"
        alt="Premium pre-owned car at Saatvik Cars"
        className="absolute inset-0 h-full w-full object-cover object-center"
        suppressHydrationWarning
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6"
          >
            <span className="premium-eyebrow inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm" suppressHydrationWarning>
              <span className="relative flex h-1.5 w-1.5" suppressHydrationWarning>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" suppressHydrationWarning />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" suppressHydrationWarning />
              </span>
              <span className="truncate">
                Open Now · {BUSINESS.hours}
                <span className="hidden sm:inline"> · A unit of Tarang Marketing</span>
              </span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            className="max-w-[22rem] text-[2.35rem] leading-[1.06] sm:max-w-none sm:text-5xl lg:text-[3.8rem] lg:leading-[1.01] font-bold text-white"
          >
            Premium cars,
            <br />
            <span className="text-white/55">verified confidence.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
            className="mt-5 max-w-[21rem] text-base sm:max-w-lg sm:text-lg text-white/70 leading-relaxed"
          >
            A curated used-car buying experience with inspected inventory,
            refined guidance, and complete paperwork support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
            className="mt-6 flex flex-wrap gap-2"
          >
            <Button
              type="button"
              className="h-11 rounded-lg bg-[#D7B56D] px-5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E7C77B]"
              suppressHydrationWarning
              onClick={handleBrowseCars}
            >
              Explore Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-lg border-[#D7B56D]/25 bg-white/[0.04] px-5 text-sm font-semibold text-white backdrop-blur-md hover:bg-[#D7B56D]/10 hover:text-white"
              suppressHydrationWarning
              onClick={handleAdvisorChat}
            >
              <MessageCircle className="mr-2 h-4 w-4 text-[#D7B56D]" />
              Talk to Advisor
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-5 grid max-w-[21rem] grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:max-w-[34rem] sm:flex sm:flex-wrap"
          >
            {conciergeItems.map((item) => (
              <span
                key={item}
                className="shrink-0 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/[0.055] px-3 py-1 text-center text-[11px] font-medium text-[#E8D4A2] sm:text-left"
                suppressHydrationWarning
              >
                {item}
              </span>
            ))}
          </motion.div>

          {/* ── Search bar — wrapped in <form> so Enter submits ── */}
          <motion.form
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            role="search"
            aria-label="Find cars"
            className="mt-8 premium-search search-bar-focus flex w-full max-w-[21rem] flex-col items-stretch gap-2 rounded-xl p-2 sm:max-w-none sm:flex-row sm:gap-0"
          >
            {/* Brand */}
            <div className="relative flex-1 min-w-0">
              <label htmlFor="hero-brand" className="sr-only">Brand</label>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <select
                id="hero-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                suppressHydrationWarning
                className="h-11 w-full appearance-none rounded-lg border-0 bg-transparent px-4 pr-9 text-sm text-white/90 outline-none hover:bg-white/5 focus:bg-white/5 transition-colors cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.value} value={b.value} className="bg-[#11131A] text-white/90">{b.label}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block w-px bg-white/10 my-2" />
            {/* Budget */}
            <div className="relative flex-1 min-w-0">
              <label htmlFor="hero-budget" className="sr-only">Budget</label>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <select
                id="hero-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                suppressHydrationWarning
                className="h-11 w-full appearance-none rounded-lg border-0 bg-transparent px-4 pr-9 text-sm text-white/90 outline-none hover:bg-white/5 focus:bg-white/5 transition-colors cursor-pointer"
              >
                {budgets.map((b) => (
                  <option key={b.value} value={b.value} className="bg-[#11131A] text-white/90">{b.label}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block w-px bg-white/10 my-2" />
            {/* Fuel */}
            <div className="relative flex-1 min-w-0">
              <label htmlFor="hero-fuel" className="sr-only">Fuel Type</label>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <select
                id="hero-fuel"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                suppressHydrationWarning
                className="h-11 w-full appearance-none rounded-lg border-0 bg-transparent px-4 pr-9 text-sm text-white/90 outline-none hover:bg-white/5 focus:bg-white/5 transition-colors cursor-pointer"
              >
                {fuelTypes.map((f) => (
                  <option key={f.value} value={f.value} className="bg-[#11131A] text-white/90">{f.label}</option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              suppressHydrationWarning
              className="h-11 rounded-lg bg-[#D7B56D] px-6 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E7C77B] active:scale-[0.98] transition-all shrink-0"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </motion.form>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease: 'easeOut' }}
            className="mt-5 flex max-w-full flex-wrap items-center gap-2"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/45" suppressHydrationWarning>
              <TrendingUp className="h-3.5 w-3.5" />
              Trending
            </span>
            {popularSearches.map((search, i) => (
              <button
                key={i}
                suppressHydrationWarning
                onClick={() => handlePopularSearch(search.brand)}
                className="group inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/65 transition-all hover:text-white hover:border-white/25 hover:bg-white/[0.08]"
              >
                {search.label}
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48, ease: 'easeOut' }}
            className="mt-10 premium-stat-grid grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl backdrop-blur-sm"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-black/20 px-4 py-3.5" suppressHydrationWarning>
                <p className="text-lg font-bold text-white" suppressHydrationWarning>{stat.number}</p>
                <p className="text-[11px] text-white/50 mt-0.5" suppressHydrationWarning>{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.56, ease: 'easeOut' }}
            className="mt-6 grid max-w-full grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2"
          >
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-white/60" suppressHydrationWarning>
                <item.icon className="h-4 w-4 text-[#D7B56D]" />
                <span>{item.text}</span>
              </div>
            ))}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                const el = document.getElementById('customer-reviews');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition-colors"
              aria-label="See customer reviews"
            >
              <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
              <span>See customer reviews</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Secondary CTA pinned bottom-right (desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.64, ease: 'easeOut' }}
        className="absolute bottom-8 right-8 z-10 hidden lg:block"
      >
        <Button
          suppressHydrationWarning
          variant="outline"
          className="h-11 rounded-xl border-[#D7B56D]/25 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-md hover:bg-[#D7B56D]/10 hover:text-white"
          onClick={handleBrowseCars}
        >
          Browse all cars
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </section>
  );
}
