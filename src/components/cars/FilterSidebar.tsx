'use client';

import { useMemo } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore, type CarFilters } from '@/lib/store';
import { ALL_BRANDS } from '@/lib/business';
import { formatPrice, formatKM } from '@/lib/helpers';
import { toast } from 'sonner';
import type { Car } from '@/lib/types';

interface FilterSidebarProps {
  cars: Car[];
}

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSION_OPTIONS = ['Manual', 'Automatic'];
const OWNER_OPTIONS = ['1st Owner', '2nd Owner', '3rd Owner'];
const TAG_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'best_deal', label: 'Best Deal' },
];
const PRICE_STEPS = [0, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000];
const KM_STEPS = [0, 10000, 20000, 30000, 50000, 80000, 100000];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2014 }, (_, i) => CURRENT_YEAR - i);

/** Toggle a value inside a comma-separated multi-select filter string. */
function toggleMulti(current: string | undefined, value: string): string | undefined {
  const set = new Set(current ? current.split(',').filter(Boolean) : []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  const arr = Array.from(set);
  return arr.length > 0 ? arr.join(',') : undefined;
}

function isActive(filters: CarFilters): boolean {
  return Boolean(
    filters.brand || filters.fuelType || filters.transmission || filters.ownerType ||
    filters.location || filters.tags ||
    filters.minPrice !== undefined || filters.maxPrice !== undefined ||
    filters.maxKm !== undefined || filters.minYear !== undefined || filters.maxYear !== undefined ||
    filters.category
  );
}

export default function FilterSidebar({ cars }: FilterSidebarProps) {
  const { activeFilters, setActiveFilters, clearFilters } = useStore();
  const f = activeFilters;

  // Derive available locations from car data (unique, sorted)
  const locations = useMemo(() => {
    const set = new Set<string>();
    cars.forEach(c => { if (c.location) set.add(c.location); });
    return Array.from(set).sort();
  }, [cars]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (f.brand) n++;
    if (f.fuelType) n++;
    if (f.transmission) n++;
    if (f.ownerType) n++;
    if (f.location) n++;
    if (f.tags) n++;
    if (f.minPrice !== undefined || f.maxPrice !== undefined) n++;
    if (f.maxKm !== undefined) n++;
    if (f.minYear !== undefined || f.maxYear !== undefined) n++;
    if (f.category) n++;
    return n;
  }, [f]);

  const update = (patch: Partial<CarFilters>) => {
    // Remove undefined keys so hasActiveFilters stays accurate
    const cleaned: CarFilters = { ...activeFilters };
    Object.keys(patch).forEach(k => {
      const key = k as keyof CarFilters;
      if (patch[key] === undefined || patch[key] === '') delete cleaned[key];
      else (cleaned as any)[key] = patch[key];
    });
    setActiveFilters(cleaned);
  };

  const handleClear = () => {
    clearFilters();
    toast.success('All filters cleared', { duration: 2000 });
  };

  return (
    <aside
      id="filter-sidebar"
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/40 p-4 lg:p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      suppressHydrationWarning
      aria-label="Car filters"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#D7B56D]" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-[#D7B56D]/15 px-2 py-0.5 text-[10px] font-bold text-[#D7B56D]" suppressHydrationWarning>
              {activeCount}
            </span>
          )}
        </div>
        {isActive(f) && (
          <button
            onClick={handleClear}
            suppressHydrationWarning
            className="flex items-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-[#D7B56D]"
          >
            <RotateCcw className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Brand */}
        <FilterGroup label="Brand">
          <select
            value={f.brand || ''}
            onChange={(e) => update({ brand: e.target.value || undefined })}
            suppressHydrationWarning
            className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none cursor-pointer hover:border-white/15 focus:border-[#D7B56D]/50 focus:ring-2 focus:ring-[#D7B56D]/20"
          >
            <option value="" className="bg-[#0f172a]">All Brands</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b} className="bg-[#0f172a]">{b}</option>
            ))}
          </select>
        </FilterGroup>

        {/* Fuel Type */}
        <FilterGroup label="Fuel Type">
          <div className="flex flex-wrap gap-1.5">
            {FUEL_OPTIONS.map((opt) => {
              const selected = f.fuelType ? f.fuelType.split(',').includes(opt) : false;
              return (
                <button
                  key={opt}
                  suppressHydrationWarning
                  onClick={() => update({ fuelType: toggleMulti(f.fuelType, opt) })}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selected
                      ? 'border-[#D7B56D]/40 bg-[#D7B56D]/15 text-[#D7B56D]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        {/* Transmission */}
        <FilterGroup label="Transmission">
          <div className="flex gap-1.5">
            {TRANSMISSION_OPTIONS.map((opt) => {
              const selected = f.transmission ? f.transmission.split(',').includes(opt) : false;
              return (
                <button
                  key={opt}
                  suppressHydrationWarning
                  onClick={() => update({ transmission: toggleMulti(f.transmission, opt) })}
                  className={`flex-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selected
                      ? 'border-[#D7B56D]/40 bg-[#D7B56D]/15 text-[#D7B56D]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        {/* Max Price */}
        <FilterGroup label="Max Price">
          <input
            type="range"
            min={0}
            max={PRICE_STEPS.length - 1}
            step={1}
            value={(() => {
              if (f.maxPrice === undefined) return 0;
              const idx = PRICE_STEPS.findIndex(p => p >= f.maxPrice!);
              return idx === -1 ? PRICE_STEPS.length - 1 : idx;
            })()}
            onChange={(e) => {
              const idx = Number(e.target.value);
              const val = PRICE_STEPS[idx];
              update({ maxPrice: val === 0 ? undefined : val });
            }}
            suppressHydrationWarning
            className="w-full accent-[#D7B56D] cursor-pointer"
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Any</span>
            <span className="font-semibold text-[#D7B56D]" suppressHydrationWarning>
              {f.maxPrice !== undefined ? formatPrice(f.maxPrice) : 'Any'}
            </span>
          </div>
        </FilterGroup>

        {/* Max KM Driven */}
        <FilterGroup label="Max KM Driven">
          <input
            type="range"
            min={0}
            max={KM_STEPS.length - 1}
            step={1}
            value={(() => {
              if (f.maxKm === undefined) return 0;
              const idx = KM_STEPS.findIndex(k => k >= f.maxKm!);
              return idx === -1 ? KM_STEPS.length - 1 : idx;
            })()}
            onChange={(e) => {
              const idx = Number(e.target.value);
              const val = KM_STEPS[idx];
              update({ maxKm: val === 0 ? undefined : val });
            }}
            suppressHydrationWarning
            className="w-full accent-[#D7B56D] cursor-pointer"
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Any</span>
            <span className="font-semibold text-[#D7B56D]" suppressHydrationWarning>
              {f.maxKm !== undefined ? formatKM(f.maxKm) : 'Any'}
            </span>
          </div>
        </FilterGroup>

        {/* Year range */}
        <FilterGroup label="Year">
          <div className="flex items-center gap-2">
            <select
              value={f.minYear ?? ''}
              onChange={(e) => update({ minYear: e.target.value ? Number(e.target.value) : undefined })}
              suppressHydrationWarning
              className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white outline-none cursor-pointer hover:border-white/15 focus:border-[#D7B56D]/50"
            >
              <option value="" className="bg-[#0f172a]">From</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y} className="bg-[#0f172a]">{y}</option>
              ))}
            </select>
            <span className="text-slate-400">—</span>
            <select
              value={f.maxYear ?? ''}
              onChange={(e) => update({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
              suppressHydrationWarning
              className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white outline-none cursor-pointer hover:border-white/15 focus:border-[#D7B56D]/50"
            >
              <option value="" className="bg-[#0f172a]">To</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y} className="bg-[#0f172a]">{y}</option>
              ))}
            </select>
          </div>
        </FilterGroup>

        {/* Owner Type */}
        <FilterGroup label="Owner">
          <div className="flex flex-wrap gap-1.5">
            {OWNER_OPTIONS.map((opt) => {
              const selected = f.ownerType ? f.ownerType.split(',').includes(opt) : false;
              return (
                <button
                  key={opt}
                  suppressHydrationWarning
                  onClick={() => update({ ownerType: toggleMulti(f.ownerType, opt) })}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selected
                      ? 'border-[#D7B56D]/40 bg-[#D7B56D]/15 text-[#D7B56D]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        {/* Location */}
        {locations.length > 0 && (
          <FilterGroup label="Location">
            <select
              value={f.location || ''}
              onChange={(e) => update({ location: e.target.value || undefined })}
              suppressHydrationWarning
              className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none cursor-pointer hover:border-white/15 focus:border-[#D7B56D]/50 focus:ring-2 focus:ring-[#D7B56D]/20"
            >
              <option value="" className="bg-[#0f172a]">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-[#0f172a]">{loc}</option>
              ))}
            </select>
          </FilterGroup>
        )}

        {/* Tags */}
        <FilterGroup label="Special Tags">
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((opt) => {
              const selected = f.tags === opt.value;
              return (
                <button
                  key={opt.value}
                  suppressHydrationWarning
                  onClick={() => update({ tags: selected ? undefined : opt.value })}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selected
                      ? 'border-[#D7B56D]/40 bg-[#D7B56D]/15 text-[#D7B56D]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      </div>

      {isActive(f) && (
        <Button
          variant="outline"
          suppressHydrationWarning
          className="mt-5 w-full h-9 border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs"
          onClick={handleClear}
        >
          <X className="mr-1.5 h-3.5 w-3.5" /> Clear All Filters
        </Button>
      )}
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {children}
    </div>
  );
}
