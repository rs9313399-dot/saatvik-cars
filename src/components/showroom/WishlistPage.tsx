'use client';

import { useEffect, useState } from 'react';
import type { Car } from '@/lib/types';
import { useStore } from '@/lib/store';
import { fetchCar } from '@/lib/api';
import CarCard from './CarCard';
import SkeletonCard from './SkeletonCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { navigate, wishlist } = useStore();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (wishlist.length === 0) {
        setCars([]);
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          wishlist.map((id) => fetchCar(id).catch(() => null))
        );
        setCars(results.filter(Boolean) as Car[]);
      } catch {
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wishlist]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">Your Wishlist</h1>
        <p className="mt-1 text-sm text-[#808080]">
          {cars.length} car{cars.length !== 1 ? 's' : ''} saved
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} onNavigate={navigate} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,77,0,0.2)] bg-[#111111]">
            <Heart className="h-8 w-8 text-[#808080]" suppressHydrationWarning />
          </div>
          <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-white">Your wishlist is empty</h3>
          <p className="mb-5 text-sm text-[#808080]">
            Start adding cars to your wishlist by tapping the heart icon on any car.
          </p>
          <Button
            onClick={() => navigate({ page: 'cars' })}
            className="rounded-lg border-[rgba(255,77,0,0.3)] bg-[#FF4D00] text-black font-bold uppercase tracking-wider hover:bg-[#FF6B2B] hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]"
          >
            Browse Cars
          </Button>
        </motion.div>
      )}
    </div>
  );
}
