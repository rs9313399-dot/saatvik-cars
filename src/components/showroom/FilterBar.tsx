'use client';

import { useState, useEffect } from 'react';
import type { CarFilters } from '@/lib/types';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'km_asc', label: 'KM: Low to High' },
  { value: 'year_desc', label: 'Year: Newest' },
];

const CURRENT_YEAR = 2025; // SSR-safe default

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted pattern needed for SSR hydration safety
    setMounted(true);
  }, []);

  // Use actual year on client, hardcoded on server
  const effectiveYear = mounted ? new Date().getFullYear() : CURRENT_YEAR;

  const updateFilter = (key: keyof CarFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, v]) => {
      if (key === 'sort') return false; // sort is not really a "filter"
      return v !== undefined && v !== '';
    }
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  const priceMax = filters.maxPrice ?? 20000000;
  const priceMin = filters.minPrice ?? 0;

  const yearMax = filters.maxYear ?? effectiveYear;
  const yearMin = filters.minYear ?? 2000;

  return (
    <div className="space-y-3">
      {/* Main row - always visible */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {/* Premium Search with neon glow on focus */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808080] transition-colors duration-200 group-focus-within:text-[#FF4D00]" suppressHydrationWarning />
          <Input
            placeholder="Search cars, brands, models..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="h-10 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] pl-10 text-sm text-white placeholder:text-[#808080] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#FF4D00]/20 focus-visible:border-[#FF4D00]/50 focus-visible:shadow-[0_0_12px_rgba(255,77,0,0.1)]"
          />
        </div>

        <div className="flex gap-2">
          {/* Sort dropdown with neon styling */}
          <Select
            value={filters.sort || 'newest'}
            onValueChange={(v) => updateFilter('sort', v)}
          >
            <SelectTrigger className="h-10 flex-1 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] transition-all duration-200 hover:border-[#FF4D00]/40 sm:flex-none sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] shadow-lg">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="rounded-md text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expand/Collapse with active filter count badge */}
          <Button
            variant="outline"
            size="default"
            onClick={() => setExpanded(!expanded)}
            className="relative h-10 gap-1.5 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] transition-all duration-200 hover:border-[#FF4D00]/40 hover:text-[#FF4D00] px-3 sm:gap-2 sm:px-3.5"
          >
            <SlidersHorizontal className="h-4 w-4" suppressHydrationWarning />
            <span className="hidden sm:inline text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <motion.span
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D00] text-[10px] font-bold text-black"
              >
                {activeFilterCount}
              </motion.span>
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              suppressHydrationWarning
            />
          </Button>
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="default"
              onClick={resetFilters}
              className="h-10 gap-1.5 rounded-lg text-[#808080] transition-all duration-200 hover:bg-[#FF4D00]/10 hover:text-[#FF4D00]"
            >
              <RotateCcw className="h-3.5 w-3.5" suppressHydrationWarning />
              <span className="text-sm">Clear</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Expanded filters with neon theme + AnimatePresence */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[rgba(255,77,0,0.12)] bg-[#0A0A0A] p-4 sm:p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/70">Brand</label>
                <Select
                  value={filters.brand || '__all__'}
                  onValueChange={(v) => updateFilter('brand', v === '__all__' ? undefined : v)}
                >
                  <SelectTrigger className="h-9 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] transition-colors hover:border-[#FF4D00]/40 text-sm">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent className="border-[rgba(255,77,0,0.15)] bg-[#111111]">
                    <SelectItem value="__all__" className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">All Brands</SelectItem>
                    {BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand} className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/70">Fuel Type</label>
                <Select
                  value={filters.fuelType || '__all__'}
                  onValueChange={(v) => updateFilter('fuelType', v === '__all__' ? undefined : v)}
                >
                  <SelectTrigger className="h-9 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] transition-colors hover:border-[#FF4D00]/40 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="border-[rgba(255,77,0,0.15)] bg-[#111111]">
                    <SelectItem value="__all__" className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">All Types</SelectItem>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/70">Transmission</label>
                <Select
                  value={filters.transmission || '__all__'}
                  onValueChange={(v) => updateFilter('transmission', v === '__all__' ? undefined : v)}
                >
                  <SelectTrigger className="h-9 rounded-lg border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] transition-colors hover:border-[#FF4D00]/40 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="border-[rgba(255,77,0,0.15)] bg-[#111111]">
                    <SelectItem value="__all__" className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">All Types</SelectItem>
                    {TRANSMISSIONS.map((type) => (
                      <SelectItem key={type} value={type} className="text-[#C0C0C0] focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/70">Price Range</label>
                  <span className="rounded-md bg-[#FF4D00]/10 px-2 py-0.5 text-xs font-medium text-[#FF4D00]">
                    {formatPrice(priceMin)} — {formatPrice(priceMax)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={20000000}
                  step={100000}
                  value={[priceMin, priceMax]}
                  onValueChange={([min, max]) => {
                    onFiltersChange({
                      ...filters,
                      minPrice: min > 0 ? min : undefined,
                      maxPrice: max < 20000000 ? max : undefined,
                    });
                  }}
                  className="py-2"
                />
              </div>

              {/* Year Range */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/70">Year Range</label>
                  <span className="rounded-md bg-[#FF4D00]/10 px-2 py-0.5 text-xs font-medium text-[#FF4D00]">
                    {yearMin} — {yearMax}
                  </span>
                </div>
                <Slider
                  min={2000}
                  max={effectiveYear}
                  step={1}
                  value={[yearMin, yearMax]}
                  onValueChange={([min, max]) => {
                    onFiltersChange({
                      ...filters,
                      minYear: min > 2000 ? min : undefined,
                      maxYear: max < effectiveYear ? max : undefined,
                    });
                  }}
                  className="py-2"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
