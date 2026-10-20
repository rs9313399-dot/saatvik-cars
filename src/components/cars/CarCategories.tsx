'use client';

import { useStore } from '@/lib/store';

const categories = [
  { name: 'SUV', filterValue: 'suv' },
  { name: 'Sedan', filterValue: 'sedan' },
  { name: 'Hatchback', filterValue: 'hatchback' },
  { name: 'Luxury', filterValue: 'luxury' },
  { name: 'MUV/MPV', filterValue: 'muv' },
  { name: 'Electric', filterValue: 'electric' },
];

export default function CarCategories() {
  const { setActiveFilters, activeFilters } = useStore();

  const handleExplore = (category: (typeof categories)[number]) => {
    setActiveFilters({ ...activeFilters, category: category.filterValue });
    document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories" className="bg-[#0A0A0A] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 sm:items-end sm:gap-10">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Browse by body type
          </h2>
          <p className="max-w-md text-base leading-7 text-slate-300 sm:justify-self-end">
            Choose a body type to filter the current car listings.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => handleExplore(category)}
              aria-label={`Browse ${category.name} cars`}
              className={`min-h-16 text-left text-xl font-medium transition-colors hover:text-[#D7B56D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B56D] sm:text-2xl ${
                activeFilters.category === category.filterValue ? 'text-[#D7B56D]' : 'text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
