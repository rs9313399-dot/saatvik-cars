'use client';

import { useState, useEffect, useMemo, useRef, useCallback, Fragment, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Fuel, Gauge, Settings2, Calendar, ArrowRight, X, Phone, MessageCircle, Eye, Tag, GitCompare, Check, Heart, ChevronLeft, ChevronRight, Maximize2, SlidersHorizontal, CalendarCheck, Link2, Mail, AlertCircle, RefreshCw, SearchX, Sparkles, Printer, Trash2, CheckCircle2, XCircle, ShieldCheck, Camera, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCars } from '@/lib/api';
import { useStore } from '@/lib/store';
import { BUSINESS } from '@/lib/business';
import type { Car } from '@/lib/types';
import { formatPrice, formatKM, parseImages, getTagLabel, getTagColor, getWhatsAppLink, getCallLink, calcEMI, formatEMI } from '@/lib/helpers';
import FilterSidebar from './FilterSidebar';
import TestDriveModal from './TestDriveModal';
import { toast } from 'sonner';

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827]">
      <div className="skeleton-shimmer aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton-shimmer h-3 w-16 rounded-full" />
        <div className="skeleton-shimmer h-5 w-3/4 rounded" />
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-3 w-10 rounded" />
          <div className="skeleton-shimmer h-3 w-12 rounded" />
          <div className="skeleton-shimmer h-3 w-14 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="skeleton-shimmer h-7 w-1/3 rounded" />
          <div className="skeleton-shimmer h-3 w-20 rounded" />
        </div>
        <div className="skeleton-shimmer h-3 w-2/5 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton-shimmer h-9 flex-1 rounded-lg" />
          <div className="skeleton-shimmer h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const NON_CAR_IMAGE_PATHS = new Set([
  '/uploads/0bfee020-1823-48f3-b819-84a234f3d369.jpeg',
  '/uploads/26162f59-3424-40b8-9791-9ffa518583a9.jpg',
  '/uploads/284e27e0-df05-4ad3-a9ae-7618fb814e02.jpg',
  '/uploads/3dc86405-9b8f-4c6d-9f3c-e2ea40a0f50b.jpg',
  '/uploads/423ae36c-9a32-416f-8d85-5f4310a80067.jpg',
  '/uploads/63943f32-f58c-4ae9-9451-077b3b20ae74.jpg',
  '/uploads/bb9c9097-e8bd-4626-a170-3e8516775367.jpg',
  '/uploads/ccc87f84-f202-4361-8d88-868fb5ae388f.jpg',
  '/uploads/efdc16d4-a5be-4144-bf40-7b3f2fae7801.jpg',
]);

function getTrustedImages(images: string[]) {
  return images.filter((src) => src && !NON_CAR_IMAGE_PATHS.has(src));
}

function isRepresentativeImage(src: string) {
  return src.includes('/images/cars/') && src.includes('-representative.');
}

function getIndicativeEmi(price: number) {
  return calcEMI(price * 0.8, 9.5, 60);
}

function getFallbackDetailId(carId: string) {
  return `car-detail-${carId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function getEngineLabel(car: Pick<Car, 'brand' | 'model' | 'fuelType'>) {
  const model = `${car.brand} ${car.model}`.toLowerCase();
  if (model.includes('swift')) return '1.2L K-Series Petrol';
  if (model.includes('creta')) return '1.5L CRDi Diesel';
  if (model.includes('nexon')) return '1.2L Revotron Petrol';
  if (model.includes('fortuner')) return '2.8L GD Diesel';
  if (model.includes('city')) return '1.5L i-VTEC Petrol';
  if (model.includes('320d') || model.includes('3 series')) return '2.0L TwinPower Diesel';
  if (model.includes('xuv700')) return '2.2L mHawk Diesel';
  if (model.includes('c200') || model.includes('c-class')) return '1.5L Turbo Petrol';
  if (model.includes('hector')) return '1.5L Turbo Petrol';
  return car.fuelType ? `${car.fuelType} engine` : '';
}

function PremiumCarVisual({ brand, name }: { brand: string; name: string }) {
  const checklist = ['Exterior', 'Interior', 'Odometer', 'Tyres'];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#151922_0%,#090A0D_72%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7B56D]/80">
            Photos required
          </p>
          <p className="mt-1 max-w-[14rem] truncate text-sm font-semibold text-white/90">{name}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[#D7B56D]/25 bg-[#D7B56D]/10">
          <ImageOff className="h-5 w-5 text-[#D7B56D]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {checklist.map((item) => (
          <div key={item} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.035] px-2 py-1.5 text-[10px] font-medium text-slate-300">
            <Camera className="h-3 w-3 text-[#D7B56D]" />
            {item}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-100/80">
        Real inventory photos are pending. Ask for latest showroom photos before booking.
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7B56D]/80">{brand || 'Saatvik Cars'}</p>
      </div>
    </div>
  );
}

/* ─── Car Image with graceful fallback ─── */
function CarImage({
  src,
  alt,
  brand,
  loading,
  className,
}: {
  src: string;
  alt: string;
  brand: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}) {
  // Track the specific src that failed to load. When `src` changes,
  // `isErrored` automatically becomes false again — no effect needed.
  const [erroredSrc, setErroredSrc] = useState<string>('');
  const isErrored = src === erroredSrc;

  if (!src || isErrored) {
    return (
      <PremiumCarVisual brand={brand} name={alt} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      suppressHydrationWarning
      onError={() => setErroredSrc(src)}
    />
  );
}

/* ─── Image Carousel (shows all car photos slide-by-slide) ─── */
function CarImageCarousel({
  images,
  alt,
  brand,
  tagsList,
  wishlisted,
  onToggleWishlist,
  carId,
  onExpand,
}: {
  images: string[];
  alt: string;
  brand: string;
  tagsList: string[];
  wishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
  carId: string;
  onExpand: (index: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [erroredSrcs, setErroredSrcs] = useState<Set<string>>(new Set());
  const touchStartX = useRef<number | null>(null);

  // Filter to only valid (non-errored) images for navigation math
  const validImages = useMemo(
    () => getTrustedImages(images).filter((src) => !erroredSrcs.has(src)),
    [images, erroredSrcs]
  );
  const total = validImages.length;

  const goNext = useCallback(() => {
    setCurrent((c) => (total <= 1 ? 0 : (c + 1) % total));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (total <= 1 ? 0 : (c - 1 + total) % total));
  }, [total]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < total) setCurrent(idx);
    },
    [total]
  );

  // NOTE: No global window keyboard listener here — every card carousel
  // would otherwise add its own listener, causing 9 simultaneous handlers
  // on ArrowRight. Card navigation is via on-screen arrows + touch swipe.
  // The full-screen PhotoLightbox has its own dedicated keyboard handler.

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
  };

  const markErrored = (src: string) => {
    setErroredSrcs((prev) => {
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  // No images at all → fallback placeholder
  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d]">
        <PremiumCarVisual brand={brand} name={alt} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d]">
      {/* Slides track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {validImages.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full w-full shrink-0 cursor-zoom-in"
            onClick={() => onExpand(i)}
          >
            <img
              src={src}
              alt={`${alt} - photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              suppressHydrationWarning
              onError={() => markErrored(src)}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay at bottom for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

      {validImages.some(isRepresentativeImage) && (
        <div className="absolute left-3 bottom-3 z-20 rounded-full border border-[#D7B56D]/25 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#D7B56D] backdrop-blur-sm">
          Representative photo
        </div>
      )}

      {/* Tags */}
      {tagsList.length > 0 && (
        <div className="absolute left-3 top-3 z-20 flex gap-1.5">
          {tagsList.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${getTagColor(tag)}`}
              suppressHydrationWarning
            >
              {getTagLabel(tag)}
            </span>
          ))}
        </div>
      )}

      {/* Slide counter badge (top-right) + Expand button */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
        {total > 1 && (
          <div className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm" suppressHydrationWarning>
            {current + 1} / {total}
          </div>
        )}
        <button
          suppressHydrationWarning
          onClick={(e) => { e.stopPropagation(); onExpand(current); }}
          aria-label="View full size"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white/90 backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white active:scale-95"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Prev / Next arrows (only if > 1 image) */}
      {total > 1 && (
        <>
          <button
            suppressHydrationWarning
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            suppressHydrationWarning
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Wishlist */}
      <button
        suppressHydrationWarning
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(carId); }}
        className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-red-400 hover:bg-black/60 transition-all"
      >
        <Heart className={`h-4 w-4 transition-all ${wishlisted ? 'fill-red-400 text-red-400' : ''}`} />
      </button>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {validImages.map((_, i) => (
            <button
              key={i}
              suppressHydrationWarning
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-[#D7B56D]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Full-screen Photo Viewer (lightbox) ─── */
function PhotoLightbox({
  images,
  alt,
  startIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length);
      else if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  const goNext = () => setCurrent((c) => (c + 1) % images.length);
  const goPrev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      data-lightbox-active="true"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        suppressHydrationWarning
        className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm" suppressHydrationWarning>
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          suppressHydrationWarning
          className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-20 max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[current]}
          alt={`${alt} - photo ${current + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          suppressHydrationWarning
          draggable={false}
        />
      </motion.div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          suppressHydrationWarning
          className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail strip at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-30 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/40 p-2 backdrop-blur-sm" style={{ scrollbarWidth: 'thin' }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              suppressHydrationWarning
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition-all ${
                i === current ? 'ring-2 ring-[#D7B56D]' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" suppressHydrationWarning draggable={false} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Car Detail Modal ─── */
function CarDetailModal({ car, onClose, wishlisted, onToggleWishlist, onBookTestDrive, allCars, onSelectCar }: { car: Car; onClose: () => void; wishlisted: boolean; onToggleWishlist: (carId: string) => void; onBookTestDrive: (car: Car) => void; allCars: Car[]; onSelectCar: (car: Car) => void }) {
  const images = getTrustedImages(parseImages(car.images));
  const tagsList = car.tags ? car.tags.split(',').filter(Boolean) : [];
  // Indicative EMI — assumes 80% loan amount at 9.5% interest over 60 months.
  // Clicking the badge scrolls to the main EMI calculator section (#emi).
  const emi = getIndicativeEmi(car.price);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Related cars: same brand (different id) → fallback to similar price ±20%.
  // Always returns up to 4 cars, deduplicated against the same-brand set.
  const relatedCars = useMemo(() => {
    const others = allCars.filter(c => c.id !== car.id);
    const sameBrand = others.filter(c => c.brand === car.brand);
    let result: Car[] = [...sameBrand];
    if (result.length < 3) {
      const lower = car.price * 0.8;
      const upper = car.price * 1.2;
      const existingIds = new Set(result.map(r => r.id));
      const similarPrice = others
        .filter(c => !existingIds.has(c.id) && c.price >= lower && c.price <= upper)
        .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price));
      result = [...result, ...similarPrice];
    }
    return result.slice(0, 4);
  }, [allCars, car.id, car.brand, car.price]);

  // Car schema JSON-LD — built from the in-memory car prop so search
  // engines (Google rich results) can parse the vehicle listing. Only
  // rendered while the modal is open (the parent only mounts this
  // component when `selectedCar` is set, so the schema never pollutes
  // the DOM on the base page).
  const carJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: car.name,
      brand: { '@type': 'Brand', name: car.brand },
      model: car.model,
      vehicleModelDate: String(car.year),
      fuelType: car.fuelType,
      vehicleTransmission: car.transmission,
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: car.kmDriven,
        unitText: 'km',
      },
      offerPrice: `${car.price} INR`,
      itemCondition: 'https://schema.org/UsedCondition',
      color: car.color,
      vehicleIdentificationNumber: car.carNumber,
    }),
    [car.name, car.brand, car.model, car.year, car.fuelType, car.transmission, car.kmDriven, car.price, car.color, car.carNumber],
  );

  // Share helpers — WhatsApp prefilled text, mailto subject/body, copy link.
  const shareText = `Check out this ${car.name} at Saatvik Cars — ${formatPrice(car.price)}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const emailShareLink = `mailto:?subject=${encodeURIComponent(`Check out: ${car.name}`)}&body=${encodeURIComponent(`${shareText}\n\nView more cars at Saatvik Cars.`)}`;

  const handleCopyLink = () => {
    const url = (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '') + '#cars';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Could not copy link'));
    } else {
      toast.error('Clipboard not supported on this browser');
    }
  };

  const handleScrollToEmi = () => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById('emi');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  // ESC key closes the modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); };
  }, [onClose]);

  // When the user switches cars via the "Similar cars" list, reset the modal's
  // scroll position to the top so they see the photo + title first.
  useEffect(() => {
    if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0;
  }, [car.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${car.name} details`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        ref={modalScrollRef}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          suppressHydrationWarning
          aria-label="Close details"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image carousel — shows ALL photos of the car, slide by slide */}
        <CarImageCarousel
          key={car.id}
          images={images}
          alt={car.name}
          brand={car.brand}
          tagsList={tagsList}
          wishlisted={wishlisted}
          onToggleWishlist={onToggleWishlist}
          carId={car.id}
          onExpand={(idx) => setLightboxIndex(idx)}
        />

        {/* Content */}
        <div className="px-5 pb-5 -mt-4 relative z-10">
          {/* Name + Price */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5" suppressHydrationWarning>{car.brand}</p>
              <h2 className="text-xl font-bold text-white leading-tight" suppressHydrationWarning>{car.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white" suppressHydrationWarning>{formatPrice(car.price)}</p>
            </div>
          </div>

          {/* Share + EMI row */}
          {/* Share buttons — WhatsApp / Copy Link / Email */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] text-slate-500 mr-1">Share:</span>
            <a
              href={whatsappShareLink}
              target="_blank"
              rel="noopener noreferrer"
              suppressHydrationWarning
              aria-label="Share on WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 transition-all hover:bg-green-500/20"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleCopyLink}
              aria-label="Copy link"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all hover:text-white hover:bg-white/[0.06]"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <a
              href={emailShareLink}
              suppressHydrationWarning
              aria-label="Share via Email"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all hover:text-white hover:bg-white/[0.06]"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* EMI Calculator Section — clickable to jump to the main #emi section */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleScrollToEmi}
            aria-label="Open full EMI calculator"
            className="w-full text-left rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/[0.06] px-4 py-3 mb-4 transition-all hover:border-[#D7B56D]/40 hover:bg-[#D7B56D]/[0.10]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#D7B56D]" suppressHydrationWarning>
                EMI from {formatEMI(emi)}/mo
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-[#D7B56D]/70" suppressHydrationWarning>
                <SlidersHorizontal className="h-3 w-3" /> Calculate
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#D7B56D]/50" suppressHydrationWarning>
              Indicative • 80% loan • 9.5% interest • 60 months
            </p>
          </button>

          {/* Specs 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { icon: Calendar, label: 'Year', value: car.year },
              { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
              { icon: Gauge, label: 'KM Driven', value: formatKM(car.kmDriven) },
              { icon: Settings2, label: 'Transmission', value: car.transmission },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 leading-none mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-white" suppressHydrationWarning>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vehicle Details: Reg No, Colour, RTO, Insurance, Sunroof, Finance */}
          {(car.carNumber || car.color || car.rto || car.insurance || car.sunroof || car.finance) && (
            <div className="rounded-xl border border-[#D7B56D]/15 bg-[#D7B56D]/[0.03] p-4 mb-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#D7B56D]/80">Vehicle Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                {car.carNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Reg No:</span>
                    <span className="font-medium text-white" suppressHydrationWarning>{car.carNumber}</span>
                  </div>
                )}
                {car.color && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Colour:</span>
                    <span className="flex items-center gap-1.5 font-medium text-white" suppressHydrationWarning>
                      <span className="inline-block h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: car.color.toLowerCase().includes('white') ? '#f8fafc' : car.color.toLowerCase().includes('black') ? '#1e293b' : car.color.toLowerCase().includes('red') || car.color.toLowerCase().includes('burgundy') ? '#b91c1c' : car.color.toLowerCase().includes('blue') ? '#2563eb' : car.color.toLowerCase().includes('grey') || car.color.toLowerCase().includes('graphite') || car.color.toLowerCase().includes('silver') ? '#94a3b8' : car.color.toLowerCase().includes('brown') || car.color.toLowerCase().includes('bronze') || car.color.toLowerCase().includes('golden') ? '#a16207' : car.color.toLowerCase().includes('beige') ? '#d6c5a8' : '#475569' }} />
                      {car.color}
                    </span>
                  </div>
                )}
                {car.rto && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">RTO:</span>
                    <span className="font-medium text-white" suppressHydrationWarning>{car.rto}</span>
                  </div>
                )}
                {car.insurance && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Insurance:</span>
                    <span className="font-medium text-white" suppressHydrationWarning>{car.insurance}</span>
                  </div>
                )}
                {car.sunroof && car.sunroof !== 'No' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Sunroof:</span>
                    <span className="font-medium text-white" suppressHydrationWarning>{car.sunroof}</span>
                  </div>
                )}
                {car.finance && car.finance !== 'Not available' && (
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-slate-500">Finance:</span>
                    <span className="font-medium text-[#D7B56D]" suppressHydrationWarning>{car.finance}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Specifications table — exhaustive key/value list of every populated field.
              Rows with no value (e.g. Body Type, RC Available, Service History, Road Tax,
              Seller Type — not stored in the Car schema) are filtered out at render time. */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#D7B56D]/80">Full Specs</p>
            <div className="overflow-hidden rounded-lg border border-white/[0.05]">
              <table className="w-full text-xs">
                <tbody>
                  {[
                    { label: 'Engine', value: getEngineLabel(car) },
                    { label: 'Fuel Type', value: car.fuelType || '' },
                    { label: 'Transmission', value: car.transmission || '' },
                    { label: 'Year', value: car.year ? String(car.year) : '' },
                    { label: 'KM Driven', value: car.kmDriven ? formatKM(car.kmDriven) : '' },
                    { label: 'Owner Type', value: car.ownerType || '' },
                    { label: 'Color', value: car.color || '' },
                    { label: 'Insurance', value: car.insurance || '' },
                    { label: 'RTO', value: car.rto || '' },
                    { label: 'Registration No.', value: car.carNumber || '' },
                    { label: 'Sunroof', value: car.sunroof && car.sunroof !== 'No' ? car.sunroof : '' },
                    { label: 'Finance', value: car.finance && car.finance !== 'Not available' ? car.finance : '' },
                    { label: 'Location', value: car.location || '' },
                  ]
                    .filter(row => row.value && String(row.value).trim().length > 0)
                    .map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-white/[0.015]' : ''}>
                        <td className="py-2 px-3 text-slate-500 w-[45%] align-top">{row.label}</td>
                        <td className="py-2 px-3 font-medium text-white" suppressHydrationWarning>{row.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/60 text-xs hover:bg-white/[0.06]" suppressHydrationWarning>
              <Tag className="mr-1.5 h-3 w-3" /> {car.ownerType}
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/60 text-xs hover:bg-white/[0.06]" suppressHydrationWarning>
              <MapPin className="mr-1.5 h-3 w-3" /> {car.location}
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/60 text-xs hover:bg-white/[0.06]" suppressHydrationWarning>
              <Eye className="mr-1.5 h-3 w-3" /> {car.views} views
            </Badge>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-sm leading-relaxed text-slate-400" suppressHydrationWarning>{car.description}</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <Button
                suppressHydrationWarning
                className="flex-1 h-11 bg-[#D7B56D] text-[#0A0A0A] hover:bg-[#E7C77B] font-semibold text-sm shadow-lg shadow-[#D7B56D]/20"
                onClick={() => {
                  window.open(getCallLink(car.contactPhone || '+919644924777'), '_self');
                  toast.success('Calling seller...', { description: `Connecting to ${car.contactPhone}` });
                }}
              >
                <Phone className="mr-2 h-4 w-4" /> Call Seller
              </Button>
              <Button
                suppressHydrationWarning
                className="flex-1 h-11 bg-green-600 text-white hover:bg-green-700 font-semibold text-sm shadow-lg shadow-green-500/20"
                onClick={() => {
                  window.open(getWhatsAppLink(car.contactPhone || '+919644924777', car.name), '_blank');
                  toast.success('Opening WhatsApp...');
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </div>
            <Button
              suppressHydrationWarning
              variant="outline"
              className="w-full h-10 border-[#D7B56D]/30 text-[#D7B56D] hover:bg-[#D7B56D]/10 hover:text-[#D7B56D] hover:border-[#D7B56D]/50 font-semibold text-sm"
              onClick={() => onBookTestDrive(car)}
            >
              <CalendarCheck className="mr-2 h-4 w-4" /> Book Test Drive
            </Button>
          </div>

          {/* Similar cars you may like — same brand (or similar price ±20%), max 4.
              Clicking a card calls onSelectCar which swaps the modal content + scrolls to top. */}
          {relatedCars.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#D7B56D]/80 flex items-center gap-1.5" suppressHydrationWarning>
                <Sparkles className="h-3 w-3" /> Similar cars you may like
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relatedCars.map(rc => {
                  const rcImgs = getTrustedImages(parseImages(rc.images));
                  const thumb = rcImgs[0];
                  return (
                    <button
                      key={rc.id}
                      suppressHydrationWarning
                      onClick={() => onSelectCar(rc)}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-all hover:border-[#D7B56D]/30 hover:bg-[#D7B56D]/[0.04]"
                      aria-label={`View ${rc.name}`}
                    >
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-black/30">
                        {thumb ? (
                          <img src={thumb} alt={rc.name} className="h-full w-full object-cover" loading="lazy" suppressHydrationWarning draggable={false} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/[0.15]" suppressHydrationWarning>{rc.brand?.charAt(0) || 'C'}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white truncate" suppressHydrationWarning>{rc.name}</p>
                        <p className="text-[10px] text-slate-500 mb-0.5" suppressHydrationWarning>{rc.year} • {formatKM(rc.kmDriven)}</p>
                        <p className="text-xs font-semibold text-[#D7B56D]" suppressHydrationWarning>{formatPrice(rc.price)}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Full-screen photo viewer (lightbox) */}
      <AnimatePresence>
        {lightboxIndex !== null && images.length > 0 && (
          <PhotoLightbox
            images={images}
            alt={car.name}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
      {/* Car schema JSON-LD — emitted only while the modal is mounted
          (parent guards with `selectedCar && <CarDetailModal ... />`),
          so search engines see vehicle data only when a car is open. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carJsonLd) }}
      />
    </motion.div>
  );
}

/* ─── Compare Modal ─── */
function CompareModal({ cars, onClose }: { cars: Car[]; onClose: () => void }) {
  const toggleCompare = useStore(s => s.toggleCompare);
  const clearCompare = useStore(s => s.clearCompare);

  // ESC key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Empty state — not enough cars to compare
  if (cars.length < 2) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} suppressHydrationWarning className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} suppressHydrationWarning className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 text-center shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
          <GitCompare className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <h3 className="text-lg font-bold text-white">Select Cars to Compare</h3>
          <p className="mt-1 text-sm text-slate-400">Add at least 2 cars using the compare button to see a side-by-side comparison with up to 4 cars.</p>
          <Button suppressHydrationWarning className="mt-4 bg-[#D7B56D] text-[#0A0A0A] hover:bg-[#E7C77B] font-medium" onClick={onClose}>Got it</Button>
        </motion.div>
      </motion.div>
    );
  }

  // --- Best / worst car IDs for numeric highlightable metrics ---
  const bestPriceId = cars.reduce((best, c) => c.price < best.price ? c : best, cars[0]).id;
  const worstPriceId = cars.reduce((w, c) => c.price > w.price ? c : w, cars[0]).id;
  const bestKmId = cars.reduce((best, c) => c.kmDriven < best.kmDriven ? c : best, cars[0]).id;
  const worstKmId = cars.reduce((w, c) => c.kmDriven > w.kmDriven ? c : w, cars[0]).id;
  const bestYearId = cars.reduce((best, c) => c.year > best.year ? c : best, cars[0]).id;
  const worstYearId = cars.reduce((w, c) => c.year < w.year ? c : w, cars[0]).id;
  const pricePerKm = (c: Car) => (c.kmDriven > 0 ? c.price / c.kmDriven : Infinity);
  const bestPpkId = cars.reduce((best, c) => pricePerKm(c) < pricePerKm(best) ? c : best, cars[0]).id;
  const worstPpkId = cars.reduce((w, c) => pricePerKm(c) > pricePerKm(w) ? c : w, cars[0]).id;
  const ownerRank = (c: Car) => {
    const s = (c.ownerType || '').toLowerCase();
    if (s.includes('1st')) return 1;
    if (s.includes('2nd')) return 2;
    if (s.includes('3rd')) return 3;
    if (s.includes('4th')) return 4;
    return 99;
  };
  const bestOwnerId = cars.reduce((best, c) => ownerRank(c) < ownerRank(best) ? c : best, cars[0]).id;

  // --- Feature presence helpers ---
  const hasSunroof = (c: Car) => {
    const s = (c.sunroof || '').trim().toLowerCase();
    return !!s && s !== 'no' && s !== 'none' && s !== 'n/a' && s !== '-';
  };
  const hasValidInsurance = (c: Car) => {
    const s = (c.insurance || '').toLowerCase();
    return s.includes('valid') || s.includes('comprehensive') || s.includes('own damage');
  };
  const hasFinance = (c: Car) => {
    const s = (c.finance || '').toLowerCase();
    return s.includes('finance') && !s.includes('not available');
  };

  // --- Actions ---
  const handleRemove = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    toggleCompare(carId);
    if (cars.length - 1 < 2) {
      onClose();
      toast.info(`${car?.name || 'Car'} removed. Add more cars to compare.`, { duration: 2500 });
    } else {
      toast.info(`${car?.name || 'Car'} removed from comparison`, { duration: 2000 });
    }
  };

  const handleShare = async () => {
    const ids = cars.map(c => c.id).join(',');
    const url = `https://saatvikcars.in/#compare=${ids}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success('Comparison link copied!', { description: 'Paste it anywhere to share.', duration: 2500 });
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      toast.error('Could not copy link', { description: 'Your browser blocked clipboard access.', duration: 3000 });
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      toast.error('Print failed', { duration: 2000 });
    }
  };

  const handleClearAll = () => {
    clearCompare();
    onClose();
    toast.info('Compare list cleared', { duration: 2000 });
  };

  // --- Cell styling based on best/worst state ---
  type CellState = 'best' | 'worst' | 'neutral';
  const cellClass = (state: CellState) =>
    state === 'best'
      ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
      : state === 'worst'
        ? 'bg-rose-500/15 text-rose-400 font-semibold'
        : 'text-white/80';

  // --- Feature presence cell renderer ---
  const FeatureCell = ({ present, label }: { present: boolean; label?: string }) => (
    <span className="inline-flex items-center gap-1.5">
      {present ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" suppressHydrationWarning />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-rose-400" suppressHydrationWarning />
      )}
      {label && <span className="text-xs">{label}</span>}
    </span>
  );

  // --- Spec table definition ---
  type Row = {
    label: string;
    render: (c: Car) => ReactNode;
    state?: (c: Car) => CellState;
  };
  type Section = { title: string; rows: Row[] };

  const sections: Section[] = [
    {
      title: 'Price & Value',
      rows: [
        {
          label: 'Price',
          render: (c) => formatPrice(c.price),
          state: (c) => c.id === bestPriceId ? 'best' : c.id === worstPriceId ? 'worst' : 'neutral',
        },
        {
          label: 'EMI / month',
          render: (c) => formatEMI(calcEMI(c.price * 0.8, 9.5, 60)),
          state: (c) => c.id === bestPriceId ? 'best' : c.id === worstPriceId ? 'worst' : 'neutral',
        },
        {
          label: 'Price per km',
          render: (c) => (c.kmDriven > 0 ? `₹${Math.round(pricePerKm(c)).toLocaleString('en-IN')}` : '—'),
          state: (c) => c.id === bestPpkId ? 'best' : c.id === worstPpkId ? 'worst' : 'neutral',
        },
      ],
    },
    {
      title: 'Performance & Specs',
      rows: [
        { label: 'Fuel Type', render: (c) => c.fuelType || '—' },
        { label: 'Transmission', render: (c) => c.transmission || '—' },
        {
          label: 'Year',
          render: (c) => String(c.year),
          state: (c) => c.id === bestYearId ? 'best' : c.id === worstYearId ? 'worst' : 'neutral',
        },
        {
          label: 'KM Driven',
          render: (c) => formatKM(c.kmDriven),
          state: (c) => c.id === bestKmId ? 'best' : c.id === worstKmId ? 'worst' : 'neutral',
        },
        {
          label: 'Owner Type',
          render: (c) => c.ownerType || '—',
          state: (c) => c.id === bestOwnerId ? 'best' : 'neutral',
        },
      ],
    },
    {
      title: 'Condition & Features',
      rows: [
        { label: 'Colour', render: (c) => c.color || '—' },
        {
          label: 'Sunroof',
          render: (c) => <FeatureCell present={hasSunroof(c)} label={hasSunroof(c) ? (c.sunroof || 'Yes') : 'No'} />,
          state: (c) => hasSunroof(c) ? 'best' : 'worst',
        },
        {
          label: 'Insurance',
          render: (c) => <FeatureCell present={hasValidInsurance(c)} label={c.insurance || 'No'} />,
          state: (c) => hasValidInsurance(c) ? 'best' : 'worst',
        },
        {
          label: 'Finance',
          render: (c) => <FeatureCell present={hasFinance(c)} label={hasFinance(c) ? 'Available' : 'Not available'} />,
          state: (c) => hasFinance(c) ? 'best' : 'worst',
        },
      ],
    },
    {
      title: 'Documentation',
      rows: [
        { label: 'RTO', render: (c) => c.rto || '—' },
        { label: 'Reg. No.', render: (c) => c.carNumber || '—' },
        {
          label: 'Tags',
          render: (c) => {
            const tags = c.tags ? c.tags.split(',').filter(Boolean) : [];
            if (!tags.length) return <span className="text-slate-500">—</span>;
            return (
              <div className="flex flex-wrap gap-1" suppressHydrationWarning>
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className={`h-5 px-1.5 text-[10px] ${getTagColor(t)}`} suppressHydrationWarning>
                    {getTagLabel(t)}
                  </Badge>
                ))}
              </div>
            );
          },
        },
      ],
    },
    {
      title: 'Location & Contact',
      rows: [
        { label: 'Location', render: (c) => c.location || '—' },
        { label: 'Views', render: (c) => String(c.views ?? 0) },
        {
          label: 'Contact',
          render: (c) => c.contactPhone ? (
            <a href={getCallLink(c.contactPhone)} className="inline-flex items-center gap-1 text-[#D7B56D] hover:underline" suppressHydrationWarning>
              <Phone className="h-3 w-3" /> {c.contactPhone}
            </a>
          ) : <span className="text-slate-500">—</span>,
        },
      ],
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} suppressHydrationWarning className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Compare cars">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        suppressHydrationWarning
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Toolbar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#111827] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <GitCompare className="h-5 w-5 shrink-0 text-[#D7B56D]" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold leading-tight text-white">Compare Cars</h2>
              <p className="text-[11px] text-slate-500" suppressHydrationWarning>
                {cars.length} of 4 cars · side-by-side specs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" suppressHydrationWarning aria-label="Share comparison" title="Share comparison" onClick={handleShare} className="h-8 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white">
              <Link2 className="h-3.5 w-3.5" />
              <span className="ml-1 hidden sm:inline">Share</span>
            </Button>
            <Button variant="ghost" size="sm" suppressHydrationWarning aria-label="Print comparison" title="Print comparison" onClick={handlePrint} className="h-8 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white">
              <Printer className="h-3.5 w-3.5" />
              <span className="ml-1 hidden sm:inline">Print</span>
            </Button>
            <Button variant="ghost" size="sm" suppressHydrationWarning aria-label="Clear all cars from comparison" title="Clear all" onClick={handleClearAll} className="h-8 px-2.5 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
              <Trash2 className="h-3.5 w-3.5" />
              <span className="ml-1 hidden sm:inline">Clear</span>
            </Button>
            <Button variant="ghost" size="sm" suppressHydrationWarning aria-label="Close compare dialog" title="Close" onClick={onClose} className="h-8 w-8 p-0 text-slate-300 hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Spec table — horizontally scrollable on mobile */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0A0A0A]">
                <th className="sticky left-0 z-20 min-w-[110px] bg-[#0A0A0A] px-3 py-3 text-left align-bottom text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Specification
                </th>
                {cars.map((car) => {
                  const imgs = getTrustedImages(parseImages(car.images));
                  const thumb = imgs[0];
                  return (
                    <th key={car.id} className="relative min-w-[200px] border-l border-white/[0.06] px-3 py-3 text-left align-top sm:min-w-[240px]">
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(car.id)}
                        suppressHydrationWarning
                        aria-label={`Remove ${car.name} from comparison`}
                        title="Remove from comparison"
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white/50 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="mb-2 h-20 w-full overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/[0.06]">
                        {thumb ? (
                          <img src={thumb} alt={car.name} className="h-full w-full object-cover" loading="lazy" suppressHydrationWarning />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <GitCompare className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <p className="pr-6 text-sm font-semibold leading-tight text-white" suppressHydrationWarning>{car.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500" suppressHydrationWarning>
                        {car.year} · {formatKM(car.kmDriven)}
                      </p>
                      <p className="mt-1 text-base font-bold text-[#D7B56D]" suppressHydrationWarning>{formatPrice(car.price)}</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr>
                    <td colSpan={cars.length + 1} className="border-y border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#D7B56D]/80">
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, idx) => (
                    <tr key={row.label} className={idx % 2 === 0 ? 'bg-white/[0.015]' : ''}>
                      <td className="sticky left-0 z-[1] min-w-[110px] bg-[#0A0A0A] px-3 py-2.5 align-middle text-xs font-medium text-slate-400">
                        {row.label}
                      </td>
                      {cars.map((car) => {
                        const state = row.state ? row.state(car) : 'neutral';
                        return (
                          <td key={car.id} className={`border-l border-white/[0.04] px-3 py-2.5 align-middle text-sm ${cellClass(state)}`} suppressHydrationWarning>
                            <span className="inline-flex items-center gap-1.5">
                              {state === 'best' && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                              {state === 'worst' && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />}
                              {row.render(car)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/10 bg-[#111827] px-4 py-2.5 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-500/15">
              <Check className="h-3 w-3 text-emerald-400" />
            </span>
            Best value
          </span>
          <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-rose-500/15">
              <AlertCircle className="h-3 w-3 text-rose-400" />
            </span>
            Needs attention
          </span>
          <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Feature present
          </span>
          <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            Feature absent / expired
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Car Card ─── */
function FallbackCarDetailPopup({ car }: { car: Car }) {
  const images = getTrustedImages(parseImages(car.images));
  const mainImage = images[0] || '';
  const emi = getIndicativeEmi(car.price);
  const fallbackId = getFallbackDetailId(car.id);

  return (
    <div id={fallbackId} className="car-detail-fallback fixed inset-0 z-[120] items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${car.name} details`}>
      <a href="#cars" className="absolute inset-0 bg-black/75 backdrop-blur-md" aria-label="Close details" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40">
        <a
          href="#cars"
          aria-label="Close details"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white/75 transition-all hover:bg-black/75 hover:text-white"
        >
          <X className="h-4 w-4" />
        </a>

        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <CarImage
            src={mainImage}
            alt={car.name}
            brand={car.brand}
            loading="eager"
            className="h-full w-full object-cover"
          />
          {isRepresentativeImage(mainImage) && (
            <div className="absolute left-3 bottom-3 rounded-full border border-[#D7B56D]/25 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#D7B56D]">
              Representative photo
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{car.brand}</p>
              <h2 className="text-xl font-bold leading-tight text-white">{car.name}</h2>
            </div>
            <p className="text-2xl font-bold text-white">{formatPrice(car.price)}</p>
          </div>

          <div className="rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/[0.06] px-4 py-3">
            <p className="text-sm font-semibold text-[#D7B56D]">EMI from {formatEMI(emi)}/mo</p>
            <p className="mt-0.5 text-[11px] text-[#D7B56D]/60">Indicative • 80% loan • 9.5% interest • 60 months</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Year', value: car.year },
              { label: 'Fuel Type', value: car.fuelType },
              { label: 'KM Driven', value: formatKM(car.kmDriven) },
              { label: 'Transmission', value: car.transmission },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="mb-1 text-[10px] text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#D7B56D]/80">Vehicle Details</p>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              {[
                ['Engine', getEngineLabel(car)],
                ['Reg No', car.carNumber],
                ['Colour', car.color],
                ['RTO', car.rto],
                ['Insurance', car.insurance],
                ['Finance', car.finance],
                ['Owner', car.ownerType],
                ['Location', car.location],
              ].filter(([, value]) => value && String(value).trim().length > 0).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-slate-500">{label}:</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-400">{car.description}</p>

          <div className="flex gap-3">
            <a
              href={getCallLink(car.contactPhone || BUSINESS.primaryPhone)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#D7B56D] text-sm font-semibold text-[#0A0A0A] hover:bg-[#E7C77B]"
            >
              <Phone className="mr-2 h-4 w-4" /> Call Seller
            </a>
            <a
              href={getWhatsAppLink(car.contactPhone || BUSINESS.primaryPhone, car.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-green-600 text-sm font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarCard({
  car,
  index,
  onDetails,
  isCompared,
  onToggleCompare,
  wishlisted,
  onToggleWishlist,
}: {
  car: Car;
  index: number;
  onDetails: (car: Car) => void;
  isCompared: boolean;
  onToggleCompare: (carId: string) => void;
  wishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
}) {
  const images = getTrustedImages(parseImages(car.images));
  const mainImage = images[0] || '';
  const tagsList = car.tags ? car.tags.split(',').filter(Boolean) : [];
  const emi = getIndicativeEmi(car.price);
  const quickWhatsappLink = getWhatsAppLink(car.contactPhone || BUSINESS.primaryPhone, car.name);
  const fallbackDetailId = getFallbackDetailId(car.id);
  const openDetails = useCallback((event?: { stopPropagation: () => void; preventDefault?: () => void }) => {
    event?.stopPropagation();
    event?.preventDefault?.();
    onDetails(car);
  }, [car, onDetails]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`premium-car-card group relative overflow-hidden rounded-xl border transition-all duration-300 ${
          isCompared
            ? 'border-[#D7B56D]/45 shadow-md shadow-[#D7B56D]/10'
            : 'border-white/[0.07] bg-[#111827]'
        }`}
        suppressHydrationWarning
        onClick={() => onDetails(car)}
      >
      {isCompared && (
        <div className="absolute left-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#D7B56D] text-xs text-white font-bold shadow-lg shadow-[#D7B56D]/30">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Image Area */}
      <div className="relative aspect-[16/10] cursor-pointer overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#0d0d0d]">
        <CarImage
          src={mainImage}
          alt={car.name}
          brand={car.brand}
          loading={index < 3 ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isRepresentativeImage(mainImage) && (
          <div className="absolute right-2.5 bottom-2.5 z-10 rounded-full border border-[#D7B56D]/25 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#D7B56D] backdrop-blur-sm">
            Representative photo
          </div>
        )}
        <div className="absolute left-2.5 bottom-2.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-sm">
          <ShieldCheck className="h-3 w-3 text-[#D7B56D]" />
          Verified
        </div>
        {/* Tags as colored pills */}
        {tagsList.length > 0 && (
          <div className="absolute left-2.5 top-2.5 flex gap-1.5 z-10">
            {tagsList.slice(0, 2).map((tag) => (
              <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getTagColor(tag)}`} suppressHydrationWarning>
                {getTagLabel(tag)}
              </span>
            ))}
          </div>
        )}
        {/* Heart/Wishlist button */}
        <button
          type="button"
          suppressHydrationWarning
          aria-label={wishlisted ? `Remove ${car.name} from wishlist` : `Add ${car.name} to wishlist`}
          aria-pressed={wishlisted}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(car.id); }}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm text-white/75 hover:text-red-400 hover:bg-black/65 transition-all"
        >
          <Heart className={`h-4 w-4 transition-all ${wishlisted ? 'fill-red-400 text-red-400 scale-110' : ''}`} />
        </button>
        {/* Bottom gradient for smooth visual */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111827] via-[#111827]/55 to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="p-4 pt-3">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#D7B56D]/80 mb-0.5 tracking-wide uppercase" suppressHydrationWarning>{car.brand}</p>
            <h3 className="text-[15px] font-semibold text-white leading-tight line-clamp-1" suppressHydrationWarning>{car.name}</h3>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-medium text-slate-300" suppressHydrationWarning>
            {car.bodyType || 'Car'}
          </span>
        </div>

        {/* Specs Row */}
        <div className="mb-3 grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.025] px-2 py-1.5" suppressHydrationWarning><Calendar className="h-3 w-3 text-slate-500" />{car.year}</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.025] px-2 py-1.5" suppressHydrationWarning><Fuel className="h-3 w-3 text-slate-500" />{car.fuelType}</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.025] px-2 py-1.5" suppressHydrationWarning><Gauge className="h-3 w-3 text-slate-500" />{formatKM(car.kmDriven)}</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.025] px-2 py-1.5" suppressHydrationWarning><Settings2 className="h-3 w-3 text-slate-500" />{car.transmission}</span>
        </div>

        {/* Price + EMI */}
        <div className="mb-2 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(5.25rem,auto)] items-end gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Price</p>
              <p className="truncate text-lg font-bold text-white sm:text-xl" suppressHydrationWarning>{formatPrice(car.price)}</p>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">EMI from</p>
              <p className="truncate text-xs font-semibold text-[#D7B56D] sm:text-sm" suppressHydrationWarning>{formatEMI(emi)}/mo</p>
            </div>
          </div>
        </div>

        {/* Location + Owner */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3.5" suppressHydrationWarning>
          <MapPin className="h-3 w-3 text-slate-400" />{car.location}
          <span className="mx-1 text-slate-700">·</span>
          {car.ownerType}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <a
            href={`#${fallbackDetailId}`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#D7B56D] px-3 text-xs font-semibold text-[#0A0A0A] transition-all duration-200 hover:bg-[#E7C77B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B56D]/60"
            aria-label={`Open details for ${car.name}`}
            data-open-car-details={car.id}
            onPointerDown={openDetails}
            onMouseDown={openDetails}
            onTouchStart={openDetails}
            onClickCapture={openDetails}
            onClick={openDetails}
          >
            Details <ArrowRight className="ml-1 h-3 w-3" />
          </a>
          <Button
            type="button"
            variant="outline"
            className="h-9 w-9 rounded-lg border-green-500/25 bg-green-500/[0.08] p-0 text-green-400 hover:bg-green-500/15 hover:text-green-300"
            suppressHydrationWarning
            onClick={(e) => { e.stopPropagation(); window.open(quickWhatsappLink, '_blank', 'noopener,noreferrer'); }}
            title="Ask on WhatsApp"
            aria-label={`Ask about ${car.name} on WhatsApp`}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className={`h-9 w-9 rounded-lg p-0 border-white/10 transition-all text-xs font-medium ${
              isCompared
                ? 'bg-[#D7B56D]/10 text-[#D7B56D] border-[#D7B56D]/30 hover:bg-[#D7B56D]/20'
                : 'bg-transparent text-slate-500 hover:text-white hover:border-white/20'
            }`}
            suppressHydrationWarning
            onClick={(e) => { e.stopPropagation(); onToggleCompare(car.id); }}
            title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
            aria-label={isCompared ? `Remove ${car.name} from comparison` : `Compare ${car.name}`}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      </motion.div>
      <FallbackCarDetailPopup car={car} />
    </>
  );
}

/* ─── Main Component ─── */
export default function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [testDriveCar, setTestDriveCar] = useState<{ id: string; name: string; brand: string } | null>(null);
  const { activeFilters, compareList, toggleCompare, clearCompare, carListVersion, wishlistIds, toggleWishlist: storeToggleWishlist } = useStore();
  const wishlist = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'km_asc' | 'km_desc' | 'year_desc' | 'year_asc'>('newest');
  const [showAll, setShowAll] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (mounted) { setLoading(true); setLoadError(false); }
      try {
        const result = await fetchCars({ sort: 'newest' });
        if (mounted) {
          setCars(result.cars || []);
          setLoadError(false);
        }
      } catch {
        if (mounted) {
          setCars([]);
          setLoadError(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [carListVersion]);

  const filteredCars = useMemo(() => {
    let result = cars;
    if (activeFilters.brand) {
      const brandLower = activeFilters.brand.toLowerCase();
      result = result.filter(car => car.brand.toLowerCase().includes(brandLower) || car.name.toLowerCase().includes(brandLower));
    }
    if (activeFilters.fuelType) {
      const fuels = activeFilters.fuelType.toLowerCase().split(',').filter(Boolean);
      if (fuels.length > 0) result = result.filter(car => fuels.includes(car.fuelType.toLowerCase()));
    }
    if (activeFilters.transmission) {
      const trans = activeFilters.transmission.toLowerCase().split(',').filter(Boolean);
      if (trans.length > 0) result = result.filter(car => trans.includes(car.transmission.toLowerCase()));
    }
    if (activeFilters.ownerType) {
      const owners = activeFilters.ownerType.toLowerCase().split(',').filter(Boolean);
      if (owners.length > 0) result = result.filter(car => owners.includes(car.ownerType.toLowerCase()));
    }
    if (activeFilters.location) {
      result = result.filter(car => car.location.toLowerCase() === activeFilters.location!.toLowerCase());
    }
    if (activeFilters.tags) {
      const tag = activeFilters.tags.toLowerCase();
      result = result.filter(car => {
        const carTags = car.tags ? car.tags.toLowerCase().split(',') : [];
        return carTags.includes(tag);
      });
    }
    if (activeFilters.minPrice !== undefined) result = result.filter(car => car.price >= (activeFilters.minPrice as number));
    if (activeFilters.maxPrice !== undefined) result = result.filter(car => car.price <= (activeFilters.maxPrice as number));
    if (activeFilters.maxKm !== undefined) result = result.filter(car => car.kmDriven <= (activeFilters.maxKm as number));
    if (activeFilters.minYear !== undefined) result = result.filter(car => car.year >= (activeFilters.minYear as number));
    if (activeFilters.maxYear !== undefined) result = result.filter(car => car.year <= (activeFilters.maxYear as number));
    if (activeFilters.category) {
      const cat = activeFilters.category.toLowerCase();
      result = result.filter(car => {
        const name = car.name.toLowerCase();
        const fuel = car.fuelType.toLowerCase();
        const price = car.price;
        switch (cat) {
          case 'suv': return name.includes('creta') || name.includes('brezza') || name.includes('fortuner') || name.includes('xuv') || name.includes('nexon') || name.includes('seltos') || name.includes('hector');
          case 'sedan': return name.includes('city') || name.includes('c-class') || name.includes('3 series') || name.includes('verna');
          case 'hatchback': return name.includes('i20') || name.includes('swift') || name.includes('baleno');
          case 'luxury': return car.brand === 'BMW' || car.brand === 'Mercedes-Benz' || car.brand === 'Audi' || price >= 2500000;
          case 'muv': return name.includes('xuv') || name.includes('innova') || name.includes('ertiga');
          case 'electric': return fuel === 'electric' || name.includes('ev');
          default: return true;
        }
      });
    }
    return result;
  }, [cars, activeFilters]);

  const sortedFilteredCars = useMemo(() => {
    const arr = [...filteredCars];
    switch (sortBy) {
      case 'price_asc': arr.sort((a, b) => a.price - b.price); break;
      case 'price_desc': arr.sort((a, b) => b.price - a.price); break;
      case 'km_asc': arr.sort((a, b) => a.kmDriven - b.kmDriven); break;
      case 'km_desc': arr.sort((a, b) => b.kmDriven - a.kmDriven); break;
      case 'year_desc': arr.sort((a, b) => b.year - a.year); break;
      case 'year_asc': arr.sort((a, b) => a.year - b.year); break;
      default: break; // newest keeps original order (createdAt desc from API)
    }
    return arr;
  }, [filteredCars, sortBy]);

  const displayedCars = showAll ? sortedFilteredCars : sortedFilteredCars.slice(0, 9);
  const hasMoreCars = sortedFilteredCars.length > 9;

  useEffect(() => {
    const openFromDetailsTrigger = (event: Event) => {
      const target = event.target as Element | null;
      const trigger = target?.closest?.('[data-open-car-details]');
      if (!trigger) return;

      const carId = trigger.getAttribute('data-open-car-details');
      const car = cars.find((item) => item.id === carId);
      if (!car) return;

      event.preventDefault();
      event.stopPropagation();
      setSelectedCar(car);
    };

    document.addEventListener('pointerdown', openFromDetailsTrigger, true);
    document.addEventListener('mousedown', openFromDetailsTrigger, true);
    document.addEventListener('touchstart', openFromDetailsTrigger, true);
    document.addEventListener('pointerup', openFromDetailsTrigger, true);
    document.addEventListener('click', openFromDetailsTrigger, true);

    return () => {
      document.removeEventListener('pointerdown', openFromDetailsTrigger, true);
      document.removeEventListener('mousedown', openFromDetailsTrigger, true);
      document.removeEventListener('touchstart', openFromDetailsTrigger, true);
      document.removeEventListener('pointerup', openFromDetailsTrigger, true);
      document.removeEventListener('click', openFromDetailsTrigger, true);
    };
  }, [cars]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const inventoryInsights = useMemo(() => {
    const source = sortedFilteredCars.length > 0 ? sortedFilteredCars : cars;
    const prices = source.map((car) => car.price).filter((price) => price > 0);
    const years = source.map((car) => car.year).filter((year) => year > 0);
    const brands = new Set(source.map((car) => car.brand).filter(Boolean));
    const featuredCount = source.filter((car) => car.tags?.toLowerCase().includes('featured')).length;

    return {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
      latestYear: years.length > 0 ? Math.max(...years) : 0,
      brandCount: brands.size,
      featuredCount,
    };
  }, [cars, sortedFilteredCars]);

  const handleToggleCompare = (carId: string) => {
    const isCurrentlyCompared = compareList.includes(carId);
    // Removing — always allowed.
    if (isCurrentlyCompared) {
      toggleCompare(carId);
      const car = cars.find(c => c.id === carId);
      toast.info(`${car?.name || 'Car'} removed from compare`, { duration: 2000 });
      return;
    }
    // Adding — enforce max 4 with a clear warning instead of silent failure.
    if (compareList.length >= 4) {
      toast.warning('Compare is full (4 max). Remove a car to add another.', { duration: 3000 });
      return;
    }
    toggleCompare(carId);
    const car = cars.find(c => c.id === carId);
    toast.success(`${car?.name || 'Car'} added to compare`, { description: `${compareList.length + 1}/4 cars selected`, duration: 2000 });
  };

  const handleToggleWishlist = (carId: string) => {
    const wasWishlisted = wishlist.has(carId);
    const car = cars.find(c => c.id === carId);
    storeToggleWishlist(carId);
    if (wasWishlisted) {
      toast.info('Removed from wishlist', { description: `${car?.name || 'Car'} removed`, duration: 2000 });
    } else {
      toast.success('Added to wishlist', { description: `${car?.name || 'Car'} saved`, duration: 2000 });
    }
  };

  return (
    <section id="cars" className="inventory-section bg-[#0A0A0A] py-14" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white sm:text-3xl" suppressHydrationWarning>Ready-To-Drive Cars</h2>
              <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-400 text-xs font-medium" suppressHydrationWarning>
                {filteredCars.length}
              </Badge>
            </div>
            <p className="text-sm text-slate-500" suppressHydrationWarning>
              Verified pre-owned cars with transparent pricing, quick contact, and EMI support
            </p>
          </div>
          {/* Sort Dropdown + Mobile Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={() => setShowFilters((v) => !v)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D7B56D]/30 bg-[#D7B56D]/5 px-3 text-xs font-semibold text-[#D7B56D] transition-all hover:bg-[#D7B56D]/10 lg:hidden"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
            <span className="hidden sm:inline text-xs text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              suppressHydrationWarning
              className="h-9 appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 pr-8 text-xs text-white outline-none cursor-pointer hover:border-white/15 focus:border-[#D7B56D]/50 focus:ring-2 focus:ring-[#D7B56D]/20"
            >
              <option value="newest" className="bg-[#0f172a]">Newest</option>
              <option value="price_asc" className="bg-[#0f172a]">Price ↑</option>
              <option value="price_desc" className="bg-[#0f172a]">Price ↓</option>
              <option value="km_asc" className="bg-[#0f172a]">KM ↑</option>
              <option value="km_desc" className="bg-[#0f172a]">KM ↓</option>
              <option value="year_desc" className="bg-[#0f172a]">Year ↓</option>
              <option value="year_asc" className="bg-[#0f172a]">Year ↑</option>
            </select>
          </div>
        </div>

        {!loading && cars.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-2 xl:grid-cols-4" suppressHydrationWarning>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[11px]">
                <Tag className="h-3.5 w-3.5 text-[#D7B56D]" />
                Starts From
              </div>
              <p className="text-sm font-semibold text-white">{formatPrice(inventoryInsights.lowestPrice)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[11px]">
                <CalendarCheck className="h-3.5 w-3.5 text-[#D7B56D]" />
                Latest Model
              </div>
              <p className="text-sm font-semibold text-white">{inventoryInsights.latestYear || 'Available'}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-[#D7B56D]" />
                Brands
              </div>
              <p className="text-sm font-semibold text-white">{inventoryInsights.brandCount}+ in stock</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                Featured Picks
              </div>
              <p className="text-sm font-semibold text-white">{inventoryInsights.featuredCount} inspected highlights</p>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            suppressHydrationWarning
          >
            <span className="text-xs text-slate-400">Filters:</span>
            {activeFilters.brand && <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 text-xs" suppressHydrationWarning>{activeFilters.brand}</Badge>}
            {activeFilters.fuelType && <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 text-xs" suppressHydrationWarning>{activeFilters.fuelType}</Badge>}
            {activeFilters.category && <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 text-xs" suppressHydrationWarning>{activeFilters.category}</Badge>}
            {(activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined) && (
              <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 text-xs" suppressHydrationWarning>
                {formatPrice(activeFilters.minPrice || 0)} - {activeFilters.maxPrice ? formatPrice(activeFilters.maxPrice as number) : '∞'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              suppressHydrationWarning
              className="h-6 text-xs text-slate-500 hover:text-white ml-auto"
              onClick={() => { useStore.getState().clearFilters(); toast.success('Filters cleared', { duration: 2000 }); }}
            >
              <X className="mr-1 h-3 w-3" />Clear
            </Button>
          </motion.div>
        )}

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/[0.06] px-4 py-2.5"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-[#D7B56D]" />
              <span className="text-xs font-medium text-[#D7B56D]" suppressHydrationWarning>
                {compareList.length} car{compareList.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                suppressHydrationWarning
                className="h-7 bg-[#D7B56D] text-[#0A0A0A] hover:bg-[#E7C77B] font-medium text-xs shadow-lg shadow-[#D7B56D]/20"
                onClick={() => setShowCompare(true)}
              >
                Compare Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                suppressHydrationWarning
                className="h-7 text-xs text-slate-500 hover:text-white"
                onClick={clearCompare}
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}

        {/* Mobile collapsible filter sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden lg:hidden"
              suppressHydrationWarning
            >
              <FilterSidebar cars={cars} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar + Grid layout */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Desktop sticky sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar cars={cars} />
          </div>

          {/* Grid */}
          <div>
            {loading ? (
              // Loading state — skeleton count matches the 9-card grid (3 cols × 3 rows)
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : loadError ? (
              // Error state — API failed. Offer a retry button that bumps carListVersion.
              <div role="alert" className="py-16 text-center" suppressHydrationWarning>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.05]">
                  <AlertCircle className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Couldn’t load cars</h3>
                <p className="mt-1 text-sm text-slate-500">Please check your connection and try again.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-[#D7B56D]/30 text-[#D7B56D] hover:bg-[#D7B56D]/10 hover:text-[#D7B56D] hover:border-[#D7B56D]/50 text-sm font-medium"
                  suppressHydrationWarning
                  onClick={() => useStore.getState().bumpCarListVersion()}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            ) : cars.length === 0 ? (
              // Empty inventory — API succeeded but no cars exist yet.
              <div className="py-16 text-center" suppressHydrationWarning>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
                  <SearchX className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-white">No cars available yet</h3>
                <p className="mt-1 text-sm text-slate-500">Our inventory is being updated — check back soon.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button
                    suppressHydrationWarning
                    className="bg-[#D7B56D] text-[#0A0A0A] hover:bg-[#E7C77B] text-sm font-medium"
                    onClick={() => window.open(getCallLink(BUSINESS.phones[0].tel), '_self')}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Call us
                  </Button>
                  <Button
                    variant="outline"
                    suppressHydrationWarning
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-sm font-medium"
                    onClick={() => window.open(`https://wa.me/${BUSINESS.phones[0].digits}?text=${encodeURIComponent("Hi Saatvik Cars, I'd like to know what cars you currently have available.")}`, '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                </div>
              </div>
            ) : filteredCars.length === 0 ? (
              // No results after filters — show Clear All + suggestion chips.
              <div className="py-16 text-center" suppressHydrationWarning>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
                  <SearchX className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-white">No cars match your filters</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting or clearing your filters to see more options.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-[#D7B56D]/30 text-[#D7B56D] hover:bg-[#D7B56D]/10 hover:text-[#D7B56D] hover:border-[#D7B56D]/50 text-sm font-medium"
                  suppressHydrationWarning
                  onClick={() => { useStore.getState().clearFilters(); toast.success('Filters cleared', { duration: 2000 }); }}
                >
                  Clear All Filters
                </Button>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    suppressHydrationWarning
                    onClick={() => { useStore.getState().setActiveFilters({ category: 'suv' }); }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 hover:border-[#D7B56D]/30 hover:text-[#D7B56D] transition-all"
                  >
                    Browse all SUVs
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => { useStore.getState().setActiveFilters({ maxPrice: 1000000 }); }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 hover:border-[#D7B56D]/30 hover:text-[#D7B56D] transition-all"
                  >
                    Try expanding your budget
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => { useStore.getState().setActiveFilters({ tags: 'best_deal' }); }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 hover:border-[#D7B56D]/30 hover:text-[#D7B56D] transition-all"
                  >
                    Best deals
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => { useStore.getState().setActiveFilters({ fuelType: 'Petrol' }); }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 hover:border-[#D7B56D]/30 hover:text-[#D7B56D] transition-all"
                  >
                    Petrol cars
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Results count */}
                <p className="mb-4 text-xs text-slate-500" suppressHydrationWarning>
                  {showAll ? (
                    <>Showing all <span className="text-white font-medium">{sortedFilteredCars.length}</span> {sortedFilteredCars.length === 1 ? 'car' : 'cars'}</>
                  ) : (
                    <>Showing <span className="text-white font-medium">1–{Math.min(9, sortedFilteredCars.length)}</span> of <span className="text-white font-medium">{sortedFilteredCars.length}</span> cars</>
                  )}
                </p>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {displayedCars.map((car, i) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      index={i}
                      onDetails={setSelectedCar}
                      isCompared={compareList.includes(car.id)}
                      onToggleCompare={handleToggleCompare}
                      wishlisted={wishlist.has(car.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
                {hasMoreCars && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      suppressHydrationWarning
                      className="border-[#D7B56D]/30 text-[#D7B56D] hover:bg-[#D7B56D]/10 hover:text-[#D7B56D] hover:border-[#D7B56D]/50 text-sm font-medium"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? 'Show Less' : `Load More (${sortedFilteredCars.length - 9} more)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCar && (
          <CarDetailModal
            car={selectedCar}
            allCars={cars}
            onSelectCar={setSelectedCar}
            onClose={() => setSelectedCar(null)}
            wishlisted={wishlist.has(selectedCar.id)}
            onToggleWishlist={handleToggleWishlist}
            onBookTestDrive={(car) => {
              setSelectedCar(null);
              setTestDriveCar({ id: car.id, name: car.name, brand: car.brand });
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCompare && (
          <CompareModal
            cars={cars.filter(c => compareList.includes(c.id))}
            onClose={() => setShowCompare(false)}
          />
        )}
      </AnimatePresence>
      <TestDriveModal car={testDriveCar} onClose={() => setTestDriveCar(null)} />
      <div className="section-separator" />
    </section>
  );
}
