'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Car, CarFilters } from '@/lib/types';
import { BRANDS, FUEL_TYPES } from '@/lib/types';
import type { Route } from '@/lib/store';
import { useStore } from '@/lib/store';
import { fetchCars, fetchCar } from '@/lib/api';
import CarCard from './CarCard';
import SkeletonCard from './SkeletonCard';
import FilterBar from './FilterBar';
import ScrollReveal from './ScrollReveal';
import { Car as CarIcon, SearchX, Sparkles, X, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'BMW'];

export default function CarsPage() {
  const { navigate, route, viewMode, setViewMode } = useStore();
  const [cars, setCars] = useState<Car[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CarFilters>({});

  // Check if this is a wishlist view
  const isWishlist = route.page === 'cars' && route.filters?.search === 'wishlist';
  const { wishlist } = useStore();

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      if (isWishlist) {
        // Fetch each wishlisted car individually
        const results = await Promise.all(
          wishlist.map((id) => fetchCar(id).catch(() => null))
        );
        setCars(results.filter(Boolean) as Car[]);
        setTotalActive(results.filter(Boolean).length);
      } else {
        const { cars: data, totalActive: total } = await fetchCars(filters);
        setCars(data);
        setTotalActive(total);
      }
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters, isWishlist, wishlist]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleFiltersChange = (newFilters: CarFilters) => {
    setFilters(newFilters);
  };

  const handleBrandPillClick = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand === brand ? undefined : brand,
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Enhanced Header with animated count badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
              {isWishlist ? 'Your Wishlist' : 'Browse Cars'}
            </h1>
            <p className="mt-1 text-sm text-[#808080]">
              {isWishlist
                ? `${cars.length} car${cars.length !== 1 ? 's' : ''} saved`
                : `${cars.length} car${cars.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Animated count badge + View Mode Toggle */}
          {!isWishlist && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex items-center gap-2 rounded-full border border-[rgba(255,77,0,0.2)] bg-[#111111] px-3.5 py-1.5">
                <Sparkles className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning />
                <span className="text-sm font-medium text-[#C0C0C0]">
                  Showing <span className="font-bold text-white">{cars.length}</span>
                  {' '}of{' '}
                  <span className="font-bold text-white">{totalActive}</span>
                </span>
              </div>
              <motion.div
                key={cars.length}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4D00] text-black text-sm font-bold shadow-[0_0_15px_rgba(255,77,0,0.4)]"
              >
                {cars.length}
              </motion.div>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-[rgba(255,77,0,0.15)] bg-[#111111] p-0.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  suppressHydrationWarning
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-[#FF4D00] text-black shadow-[0_0_10px_rgba(255,77,0,0.3)]'
                      : 'text-[#808080] hover:text-[#FF4D00]'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" suppressHydrationWarning />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  suppressHydrationWarning
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-[#FF4D00] text-black shadow-[0_0_10px_rgba(255,77,0,0.3)]'
                      : 'text-[#808080] hover:text-[#FF4D00]'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" suppressHydrationWarning />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick filter pills for popular brands */}
      {!isWishlist && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className="flex flex-wrap gap-2">
            {POPULAR_BRANDS.map((brand) => {
              const isActive = filters.brand === brand;
              return (
                <motion.button
                  key={brand}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleBrandPillClick(brand)}
                  suppressHydrationWarning
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'border-[#FF4D00] bg-[#FF4D00] text-black shadow-[0_0_12px_rgba(255,77,0,0.3)]'
                      : 'border-[rgba(255,77,0,0.15)] bg-[#111111] text-[#C0C0C0] hover:border-[#FF4D00]/50 hover:text-[#FF4D00]'
                  }`}
                >
                  {isActive && (
                    <X className="h-3 w-3" suppressHydrationWarning />
                  )}
                  {brand}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {!isWishlist && (
        <div className="mb-6">
          <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      )}

      {/* Cars Grid / List */}
      {loading ? (
        <div className="stagger-fade-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      ) : cars.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            layout
            className="stagger-fade-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {cars.map((car, index) => (
                <ScrollReveal
                  key={car.id}
                  direction="up"
                  delay={index * 0.05}
                  duration={0.4}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CarCard car={car} onNavigate={navigate} variant="grid" index={index} />
                  </motion.div>
                </ScrollReveal>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="stagger-fade-in flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {cars.map((car, index) => (
                <ScrollReveal
                  key={car.id}
                  direction="up"
                  delay={index * 0.04}
                  duration={0.35}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CarCard car={car} onNavigate={navigate} variant="list" index={index} />
                  </motion.div>
                </ScrollReveal>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          {/* Premium empty state illustration */}
          <div className="relative mb-5">
            {/* Decorative circles */}
            <div className="absolute -inset-6 rounded-full bg-[#FF4D00]/5" />
            <div className="absolute -inset-3 rounded-full bg-[#FF4D00]/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[rgba(255,77,0,0.2)] bg-[#111111]">
              <CarIcon className="h-10 w-10 text-[#808080]" suppressHydrationWarning />
            </div>
            {/* Floating accent dots */}
            <div className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-[#FF4D00]/60" />
            <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-[#FF6B2B]/60" />
            <div className="absolute right-1 -bottom-3 h-2.5 w-2.5 rounded-full bg-[#FF4D00]/30" />
          </div>

          <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-white">
            {isWishlist ? 'Your wishlist is empty' : 'No cars found'}
          </h3>
          <p className="mb-2 max-w-sm text-sm text-[#808080]">
            {isWishlist
              ? 'Start adding cars to your wishlist by tapping the heart icon.'
              : 'We couldn\'t find any cars matching your current filters.'}
          </p>
          {!isWishlist && (
            <>
              <div className="mb-5 flex items-center gap-2 text-xs text-[#808080]/60">
                <SearchX className="h-3.5 w-3.5" suppressHydrationWarning />
                <span>Try adjusting your search or filter criteria</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilters({})}
                suppressHydrationWarning
                className="inline-flex items-center gap-2 rounded-full border border-[#FF4D00]/40 bg-[#FF4D00] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(255,77,0,0.3)] transition-all duration-200 hover:bg-[#FF6B2B] hover:shadow-[0_0_25px_rgba(255,77,0,0.5)]"
              >
                <X className="h-3.5 w-3.5" suppressHydrationWarning />
                Clear all filters
              </motion.button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
