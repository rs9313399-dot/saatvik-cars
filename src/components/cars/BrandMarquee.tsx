'use client';

import { motion } from 'framer-motion';
import { MARQUEE_BRANDS } from '@/lib/business';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

const TRIPLED = [...MARQUEE_BRANDS, ...MARQUEE_BRANDS, ...MARQUEE_BRANDS];

export default function BrandMarquee() {
  const { setActiveFilters, activeFilters } = useStore();

  const handleBrandClick = (brand: string) => {
    setActiveFilters({ ...activeFilters, brand });
    const carsSection = document.getElementById('cars');
    if (carsSection) {
      carsSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast.success(`Showing ${brand} cars`, { duration: 2500 });
  };

  return (
    <section
      className="border-y border-white/[0.04]"
      suppressHydrationWarning
    >
      <div className="section-separator" />

      {/* Centered Label */}
      <div
        className="flex justify-center pt-10 pb-6"
        suppressHydrationWarning
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 px-4 py-1.5 text-xs uppercase tracking-widest font-semibold text-[#00D4FF]"
          suppressHydrationWarning
        >
          <span
            className="relative flex h-2 w-2"
            suppressHydrationWarning
          >
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-75"
              suppressHydrationWarning
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]"
              suppressHydrationWarning
            />
          </span>
          Brands Available in Our Inventory
        </motion.div>
      </div>

      {/* Marquee */}
      <div
        className="marquee-container pb-10"
        suppressHydrationWarning
      >
        <div
          className="marquee-track flex items-center gap-4"
          suppressHydrationWarning
        >
          {TRIPLED.map((brand, i) => (
            <button
              type="button"
              key={`${brand}-${i}`}
              className="group relative flex-shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-2 transition-all duration-300 hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5 hover:shadow-[0_0_16px_rgba(0,212,255,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/40"
              suppressHydrationWarning
              onClick={() => handleBrandClick(brand)}
              aria-label={`Browse ${brand} cars`}
            >
              {/* Watermark initial letter */}
              <span
                className="pointer-events-none absolute -top-1 -right-0.5 select-none text-5xl font-black text-white/[0.025] transition-colors duration-300 group-hover:text-[#00D4FF]/[0.06]"
                aria-hidden="true"
                suppressHydrationWarning
              >
                {brand[0]}
              </span>
              <span
                className="relative text-sm font-medium text-white/40 transition-colors duration-300 group-hover:text-[#00D4FF]"
                suppressHydrationWarning
              >
                {brand}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
