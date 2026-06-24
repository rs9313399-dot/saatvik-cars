'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Car } from '@/lib/types';
import { useStore } from '@/lib/store';
import { fetchCar, fetchCars } from '@/lib/api';
import { formatPrice, formatKM, getTagLabel, getTagColor, parseImages } from '@/lib/helpers';
import CarGallery from './CarGallery';
import CarCard from './CarCard';
import ContactButtons from './ContactButtons';
import SkeletonCard from './SkeletonCard';
import ScrollReveal from './ScrollReveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Calendar,
  Fuel,
  Settings2,
  Gauge,
  User,
  Eye,
  Share2,
  Check,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarDetailPageProps {
  slug: string;
}

export default function CarDetailPage({ slug }: CarDetailPageProps) {
  const { navigate, toggleWishlist, isInWishlist, addRecentlyViewed } = useStore();
  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emiTenure, setEmiTenure] = useState<24 | 36 | 60>(36);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCar(slug);
        setCar(data);
        addRecentlyViewed(data.id);

        // Load similar cars (same brand)
        const allCars = await fetchCars({ brand: data.brand });
        setSimilarCars(allCars.cars.filter((c) => c.id !== data.id).slice(0, 4));
      } catch {
        // Car not found
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, addRecentlyViewed]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    }
  }, []);

  // EMI calculation using standard formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
  // where r = annual rate / 12 / 100, n = tenure in months
  const INTEREST_RATE = 9; // 9% annual

  const calculateEMI = (price: number, tenureMonths: number): number => {
    const r = INTEREST_RATE / 12 / 100; // monthly interest rate
    const n = tenureMonths;
    const emi = price * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return Math.ceil(emi);
  };

  const formatEMI = (emi: number): string => {
    if (emi >= 100000) return `₹${(emi / 100000).toFixed(2)} L`;
    if (emi >= 1000) return `₹${(emi / 1000).toFixed(1)}K`;
    return `₹${emi.toLocaleString('en-IN')}`;
  };

  const emiTenures = [24, 36, 60] as const;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-24" />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight">Car Not Found</h2>
        <p className="mb-6 text-white/50">
          The car you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button
          onClick={() => navigate({ page: 'cars' })}
          variant="outline"
          suppressHydrationWarning
          className="gap-2 uppercase font-bold tracking-wider text-sm"
          style={{ borderColor: 'rgba(255,77,0,0.3)', color: '#FF4D00' }}
        >
          <ArrowLeft className="h-4 w-4" suppressHydrationWarning />
          Browse Cars
        </Button>
      </div>
    );
  }

  const wishlisted = isInWishlist(car.id);
  const tags: string[] = car.tags
    ? typeof car.tags === 'string'
      ? car.tags.split(',').filter(Boolean)
      : Array.isArray(car.tags) ? car.tags : []
    : [];

  const specs = [
    { icon: <Calendar className="h-5 w-5" suppressHydrationWarning />, label: 'Year', value: car.year },
    { icon: <Fuel className="h-5 w-5" suppressHydrationWarning />, label: 'Fuel', value: car.fuelType },
    { icon: <Settings2 className="h-5 w-5" suppressHydrationWarning />, label: 'Transmission', value: car.transmission },
    { icon: <Gauge className="h-5 w-5" suppressHydrationWarning />, label: 'KM Driven', value: formatKM(car.kmDriven) },
    { icon: <User className="h-5 w-5" suppressHydrationWarning />, label: 'Owner', value: car.ownerType },
    { icon: <MapPin className="h-5 w-5" suppressHydrationWarning />, label: 'Location', value: car.location },
    ...(car.carNumber ? [{ icon: <Hash className="h-5 w-5" suppressHydrationWarning />, label: 'Car No.', value: car.carNumber }] : []),
  ];

  const isDescriptionLong = car.description && car.description.length > 150;
  const displayDescription =
    isDescriptionLong && !descriptionExpanded
      ? car.description.slice(0, 150) + '…'
      : car.description;

  return (
    <div className="pb-20 lg:pb-0">
      {/* Scroll Progress Bar - Neon Orange Gradient */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
        <motion.div
          className="h-full"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(to right, #CC3D00, #FF4D00, #FF6B2B)',
            boxShadow: '0 0 12px rgba(255,77,0,0.5), 0 0 4px rgba(255,77,0,0.8)',
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Premium Back Button */}
        <ScrollReveal direction="left" duration={0.4}>
          <Button
            variant="ghost"
            onClick={() => navigate({ page: 'cars' })}
            suppressHydrationWarning
            className="group mb-6 gap-2 rounded-xl px-4 py-2 uppercase text-xs font-bold tracking-widest text-white/50 transition-all duration-300 hover:bg-[#FF4D00]/10 hover:pl-3 hover:text-[#FF4D00]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" suppressHydrationWarning />
            <span>Back to listings</span>
          </Button>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Cinematic Gallery */}
          <ScrollReveal direction="up" duration={0.5} className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Neon orange subtle outer glow */}
              <div
                className="absolute -inset-px rounded-xl"
                style={{ background: 'linear-gradient(to bottom, rgba(255,77,0,0.06), transparent, transparent)' }}
              />
              <CarGallery car={car} />
              {/* Gradient overlay at bottom of gallery */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(255,77,0,0.03) 50%, transparent 100%)' }}
              />
            </div>
          </ScrollReveal>

          {/* Details */}
          <ScrollReveal direction="right" duration={0.5} delay={0.1} className="lg:col-span-2">
            <div className="space-y-5 lg:sticky lg:top-24">
              {/* Title & Wishlist */}
              <div>
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">{car.name}</h1>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleWishlist(car.id)}
                    suppressHydrationWarning
                    className="flex-shrink-0 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110"
                    style={{
                      borderColor: wishlisted ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)',
                      boxShadow: wishlisted ? '0 0 12px rgba(239,68,68,0.2)' : 'none',
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        wishlisted ? 'fill-red-500 text-red-500' : 'text-white/40'
                      }`}
                      style={
                        wishlisted
                          ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' }
                          : undefined
                      }
                      suppressHydrationWarning
                    />
                  </Button>
                </div>
              </div>

              {/* Neon Orange Price Badge */}
              <div className="relative inline-block">
                <div
                  className="relative rounded-xl px-5 py-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,77,0,0.08) 0%, rgba(255,77,0,0.02) 50%, transparent 100%)',
                    border: '1px solid rgba(255,77,0,0.15)',
                  }}
                >
                  <p
                    className="text-3xl font-black uppercase tracking-tight sm:text-4xl"
                    style={{
                      background: 'linear-gradient(to right, #FF6B2B, #FF4D00, #CC3D00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none',
                      filter: 'drop-shadow(0 0 8px rgba(255,77,0,0.15))',
                    }}
                  >
                    {formatPrice(car.price)}
                  </p>
                </div>
              </div>

              {/* Compare EMI Section */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: '#0A0A0A',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Compare EMI</p>
                  <p className="text-xs text-white/40">@ {INTEREST_RATE}% p.a.</p>
                </div>
                <div className="flex gap-2">
                  {emiTenures.map((tenure) => {
                    const isActive = emiTenure === tenure;
                    return (
                      <motion.button
                        key={tenure}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setEmiTenure(tenure)}
                        suppressHydrationWarning
                        className="relative flex-1 rounded-lg px-3 py-2.5 text-center transition-all duration-200"
                        style={{
                          background: isActive ? '#FF4D00' : '#111111',
                          border: isActive ? '1px solid #FF4D00' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isActive ? '0 0 16px rgba(255,77,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                          color: isActive ? '#fff' : '#808080',
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider">{tenure} mo</p>
                        <motion.p
                          key={tenure}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-0.5 text-sm font-black"
                          style={{ color: isActive ? '#fff' : '#C0C0C0' }}
                        >
                          {formatEMI(calculateEMI(car.price, tenure))}
                        </motion.p>
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={emiTenure}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-xs text-white/40"
                  >
                    {formatEMI(calculateEMI(car.price, emiTenure))}/month for {emiTenure} months • Total: {formatPrice(Math.round(calculateEMI(car.price, emiTenure) * emiTenure))}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className={`text-xs font-bold uppercase tracking-wider ${getTagColor(tag)}`} variant="secondary">
                      {getTagLabel(tag)}
                    </Badge>
                  ))}
                </div>
              )}

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Specs Section */}
              <div>
                <h3 className="mb-4 text-base font-black uppercase tracking-widest text-white">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {specs.map((spec, idx) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * idx }}
                      className="group/spec group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: '#0A0A0A',
                        border: '1px solid rgba(192,192,192,0.1)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,77,0,0.2)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(255,77,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192,192,192,0.1)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/40 transition-all duration-300"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,77,0,0.15)';
                          (e.currentTarget as HTMLElement).style.color = '#FF4D00';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        }}
                      >
                        {spec.icon}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/30">{spec.label}</p>
                        <p className="mt-0.5 text-xs font-bold text-white/80">{spec.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Description */}
              <div>
                <h3 className="mb-2 text-base font-black uppercase tracking-widest text-white">Description</h3>
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/40">
                  {displayDescription}
                </p>
                {isDescriptionLong && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    suppressHydrationWarning
                    className="mt-2 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-[#FF4D00]/70 transition-colors hover:text-[#FF4D00]"
                  >
                    {descriptionExpanded ? (
                      <>Read less <ChevronUp className="h-3.5 w-3.5" suppressHydrationWarning /></>
                    ) : (
                      <>Read more <ChevronDown className="h-3.5 w-3.5" suppressHydrationWarning /></>
                    )}
                  </button>
                )}
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Views */}
              <div className="flex items-center gap-2 text-sm text-white/30">
                <Eye className="h-4 w-4" suppressHydrationWarning />
                {car.views} view{car.views !== 1 ? 's' : ''}
              </div>

              {/* Contact Buttons (desktop) */}
              <div className="hidden lg:block space-y-3 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      window.open(`tel:${car.contactPhone.replace(/[^0-9+]/g, '')}`, '_self');
                    }}
                    suppressHydrationWarning
                    className="group relative h-auto flex-col gap-1.5 rounded-xl py-4 text-white transition-all duration-300"
                    style={{
                      background: '#FF4D00',
                      boxShadow: '0 0 20px rgba(255,77,0,0.25)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#CC3D00';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255,77,0,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#FF4D00';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255,77,0,0.25)';
                    }}
                  >
                    <Phone className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" suppressHydrationWarning />
                    <span className="text-sm font-bold uppercase tracking-wider">Call Now</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Direct phone call</span>
                  </Button>
                  <Button
                    onClick={() => {
                      const cleanPhone = car.contactPhone.replace(/[^0-9]/g, '');
                      const message = encodeURIComponent(`Hi, I am interested in this car: ${car.name}`);
                      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                    }}
                    suppressHydrationWarning
                    className="group relative h-auto flex-col gap-1.5 rounded-xl py-4 text-white transition-all duration-300"
                    style={{
                      background: '#16A34A',
                      boxShadow: '0 0 20px rgba(255,77,0,0.15), 0 0 12px rgba(22,163,74,0.2)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#15803D';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255,77,0,0.25), 0 0 16px rgba(22,163,74,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#16A34A';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255,77,0,0.15), 0 0 12px rgba(22,163,74,0.2)';
                    }}
                  >
                    <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" suppressHydrationWarning />
                    <span className="text-sm font-bold uppercase tracking-wider">WhatsApp</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Chat instantly</span>
                  </Button>
                </div>
                {/* Share Button */}
                <Button
                  variant="outline"
                  onClick={handleShare}
                  suppressHydrationWarning
                  className="w-full gap-2 rounded-xl py-3 uppercase text-xs font-bold tracking-widest transition-all duration-300"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,77,0,0.3)';
                    (e.currentTarget as HTMLElement).style.color = '#FF4D00';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(255,77,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4" suppressHydrationWarning style={{ color: '#FF4D00' }} />
                      <span style={{ color: '#FF4D00' }}>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" suppressHydrationWarning />
                      <span>Share this car</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Similar Cars - Compact layout */}
        {similarCars.length > 0 && (
          <ScrollReveal direction="up" duration={0.5} delay={0.15} className="mt-16">
            <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-white">Similar Cars</h2>
            <div className="relative">
              {/* Left gradient fade */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-black to-transparent md:hidden" />
              {/* Right gradient fade */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-black to-transparent md:hidden" />

              {/* Mobile: horizontal scroll, Desktop: grid */}
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0" style={{ scrollbarWidth: 'none' }}>
                {similarCars.map((c) => (
                  <div key={c.id} className="min-w-[260px] flex-shrink-0 md:min-w-0">
                    <CarCard car={c} onNavigate={navigate} />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Contact Buttons (mobile - floating) with proper spacing */}
      <div className="lg:hidden pb-safe">
        <ContactButtons car={car} />
      </div>
    </div>
  );
}
