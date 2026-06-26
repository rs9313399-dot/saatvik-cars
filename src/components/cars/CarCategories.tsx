'use client';

import { motion, type Variants } from "framer-motion";
import { Mountain, Car, Zap, Crown, Users, Bolt, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

interface Category {
  name: string;
  icon: LucideIcon;
  filterValue: string;
}

const categories: Category[] = [
  { name: 'SUV', icon: Mountain, filterValue: 'suv' },
  { name: 'Sedan', icon: Car, filterValue: 'sedan' },
  { name: 'Hatchback', icon: Zap, filterValue: 'hatchback' },
  { name: 'Luxury', icon: Crown, filterValue: 'luxury' },
  { name: 'MUV/MPV', icon: Users, filterValue: 'muv' },
  { name: 'Electric', icon: Bolt, filterValue: 'electric' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45,ease: "easeOut", },
  },
};

function CategoryCard({
  category,
  onExplore,
}: {
  category: Category;
  onExplore: (cat: Category) => void;
}) {
  const Icon = category.icon;

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      className="group min-h-[112px] cursor-pointer rounded-xl border border-white/[0.06] bg-[#111827] p-3 text-left transition-all duration-300 hover:border-[#D7B56D]/30 hover:shadow-[0_0_20px_rgba(215,181,109,0.08)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B56D]/40 sm:min-h-0 sm:p-4"
      suppressHydrationWarning
      onClick={() => onExplore(category)}
      aria-label={`Browse ${category.name} cars`}
    >
      {/* Icon — unified champagne accent for all categories */}
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#D7B56D]/15 text-[#D7B56D] transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
        suppressHydrationWarning
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3
        className="text-[13px] font-semibold text-white sm:text-sm"
        suppressHydrationWarning
      >
        {category.name}
      </h3>
      <div
        className="mt-2 flex items-center gap-1 text-xs font-medium text-[#D7B56D] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5"
        suppressHydrationWarning
      >
        Explore
        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

export default function CarCategories() {
  const { setActiveFilters, activeFilters } = useStore();

  const handleExplore = (category: Category) => {
    setActiveFilters({ ...activeFilters, category: category.filterValue });
    const carsSection = document.getElementById('cars');
    if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
    toast.success(`Browsing ${category.name} cars`, {
      duration: 3000,
    });
  };

  return (
    <section
      id="categories"
      className="py-12 sm:py-14 bg-[#0A0A0A]"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <h2
            className="text-2xl font-bold text-white sm:text-3xl"
            suppressHydrationWarning
          >
            Browse by Category
          </h2>
          <p
            className="mt-2 text-sm text-slate-500 sm:text-base"
            suppressHydrationWarning
          >
            Find the perfect car type for your lifestyle
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              onExplore={handleExplore}
            />
          ))}
        </motion.div>
      </div>
      <div className="section-separator" />
    </section>
  );
}
