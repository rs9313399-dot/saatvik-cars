'use client';

import { useState } from 'react';
import {
  Search,
  ChevronDown,
  ArrowRight,
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
  { value: '5l-10l', label: '₹5-10 Lakh' },
  { value: '10l-20l', label: '₹10-20 Lakh' },
  { value: '20l-40l', label: '₹20-40 Lakh' },
  { value: 'above-40l', label: 'Above ₹40 Lakh' },
];

const fuelTypes = [
  { value: 'any', label: 'Any Fuel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
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
    toast.success('Finding cars', {
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
      className="hero-editorial relative flex min-h-[520px] items-center overflow-hidden sm:min-h-[600px]"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <div className="mb-5 sm:mb-6">
            <span className="premium-eyebrow inline-flex max-w-full items-center gap-2 rounded-md px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm" suppressHydrationWarning>
              <span className="inline-flex h-1.5 w-1.5 rounded-sm bg-emerald-400" suppressHydrationWarning />
              <span className="truncate">
                Used cars in Bilaspur, Chhattisgarh
              </span>
            </span>
          </div>

          <h1
            className="max-w-[21rem] text-[2.15rem] leading-[1.06] sm:max-w-none sm:text-5xl lg:text-[3.6rem] lg:leading-[1.04] font-bold text-white"
          >
            Used cars in Bilaspur.
            <br />
            <span className="text-[#D7B56D]">See the details before you visit.</span>
          </h1>

          <p
            className="mt-4 max-w-[21rem] text-[15px] sm:mt-5 sm:max-w-xl sm:text-base text-slate-300 leading-relaxed"
          >
            Browse current listings with their price, model year, fuel type and kilometres. Contact Saatvik Cars to confirm availability and arrange a visit.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            <Button
              type="button"
              className="h-11 rounded-lg bg-[#D7B56D] px-5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E7C77B]"
              suppressHydrationWarning
              onClick={handleBrowseCars}
            >
              View Available Cars
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden h-11 rounded-lg border-[#D7B56D]/25 bg-white/[0.04] px-5 text-sm font-semibold text-white backdrop-blur-md hover:bg-[#D7B56D]/10 hover:text-white sm:inline-flex"
              suppressHydrationWarning
              onClick={handleAdvisorChat}
            >
              <MessageCircle className="mr-2 h-4 w-4 text-[#D7B56D]" />
              Talk to Advisor
            </Button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            role="search"
            aria-label="Find cars"
            className="mt-6 premium-search search-bar-focus flex w-full max-w-[21rem] flex-col items-stretch gap-2 rounded-xl p-2 sm:mt-8 sm:max-w-none sm:flex-row sm:gap-0"
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
              Find Cars
            </Button>
          </form>

          <div className="mt-5 hidden max-w-full flex-wrap items-center gap-2 sm:flex">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/45" suppressHydrationWarning>
              <Search className="h-3.5 w-3.5" />
              Quick searches
            </span>
            {popularSearches.map((search, i) => (
              <button
                key={i}
                suppressHydrationWarning
                onClick={() => handlePopularSearch(search.brand)}
                className="group inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/75 transition-all hover:text-white hover:border-[#D7B56D]/40 hover:bg-[#D7B56D]/10"
              >
                {search.label}
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
