'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Trash2, Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { fetchCars } from '@/lib/api';
import { formatPrice, formatEMI, calcEMI, parseImages, getWhatsAppLink, getCallLink } from '@/lib/helpers';
import { toast } from 'sonner';
import type { Car } from '@/lib/types';

export default function WishlistDrawer() {
  const { wishlistOpen, setWishlistOpen, wishlistIds, removeFromWishlist, clearWishlist } = useStore();
  const [cars, setCars] = useState<Car[] | null>(null);

  // Fetch all cars when drawer opens (stale-while-revalidate pattern)
  useEffect(() => {
    if (!wishlistOpen) return;
    let mounted = true;
    fetchCars({ sort: 'newest' })
      .then((res) => { if (mounted) setCars(res.cars); })
      .catch(() => { if (mounted) setCars([]); });
    return () => { mounted = false; };
  }, [wishlistOpen]);

  // Derived loading: true only on first open before data arrives
  const loading = wishlistOpen && cars === null;
  const wishlistedCars = cars ? cars.filter((c) => wishlistIds.includes(c.id)) : [];

  // ESC key closes
  useEffect(() => {
    if (!wishlistOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setWishlistOpen(false); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [wishlistOpen, setWishlistOpen]);

  const handleClearAll = () => {
    clearWishlist();
    toast.success('Wishlist cleared', { duration: 2000 });
  };

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
          onClick={() => setWishlistOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Your wishlist"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            suppressHydrationWarning
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4" suppressHydrationWarning>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/20">
                  <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Your Wishlist</h2>
                  <p className="text-[11px] text-slate-500" suppressHydrationWarning>
                    {wishlistedCars.length} saved car{wishlistedCars.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                suppressHydrationWarning
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                aria-label="Close wishlist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-white/[0.04]" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.04]" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                        <div className="h-2.5 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : wishlistedCars.length > 0 ? (
                <div className="space-y-3">
                  {wishlistedCars.map((car) => {
                    const imgs = parseImages(car.images);
                    const thumb = imgs[0];
                    return (
                      <motion.div
                        key={car.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="group flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#00D4FF]/20"
                        suppressHydrationWarning
                      >
                        {/* Thumbnail */}
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-black/30">
                          {thumb ? (
                            <img src={thumb} alt={car.name} className="h-full w-full object-cover" loading="lazy" suppressHydrationWarning />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/[0.08]">
                              {car.brand?.charAt(0) || 'C'}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm font-semibold text-white" suppressHydrationWarning>{car.name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500" suppressHydrationWarning>
                            {car.year} · {car.fuelType} · {car.transmission}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white" suppressHydrationWarning>{formatPrice(car.price)}</p>
                              <p className="text-[10px] text-[#00D4FF]" suppressHydrationWarning>EMI {formatEMI(calcEMI(car.price))}/mo</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <a
                                href={getCallLink(car.contactPhone)}
                                suppressHydrationWarning
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
                                aria-label={`Call about ${car.name}`}
                                onClick={() => toast.success('Calling seller...', { duration: 1500 })}
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={getWhatsAppLink(car.contactPhone, car.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                suppressHydrationWarning
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                aria-label={`WhatsApp about ${car.name}`}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={() => { removeFromWishlist(car.id); toast.info('Removed from wishlist', { duration: 1500 }); }}
                                suppressHydrationWarning
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                aria-label={`Remove ${car.name} from wishlist`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center" suppressHydrationWarning>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                    <ShoppingBag className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-300">Your wishlist is empty</h3>
                  <p className="mt-1 max-w-[260px] text-sm text-slate-500">
                    Tap the heart icon on any car to save it here for later.
                  </p>
                  <Button
                    suppressHydrationWarning
                    variant="outline"
                    className="mt-4 border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
                    onClick={() => {
                      setWishlistOpen(false);
                      setTimeout(() => {
                        const el = document.getElementById('cars');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                  >
                    Browse Cars
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistedCars.length > 0 && (
              <div className="border-t border-white/[0.06] px-5 py-3" suppressHydrationWarning>
                <Button
                  suppressHydrationWarning
                  variant="ghost"
                  className="w-full text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5"
                  onClick={handleClearAll}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear All
                </Button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
