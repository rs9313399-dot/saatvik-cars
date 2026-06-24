'use client';

import { useCallback, useRef, useState } from 'react';
import type { Car } from '@/lib/types';
import type { Route } from '@/lib/store';
import { useStore } from '@/lib/store';
import { formatPrice, formatKM, parseImages, getTagLabel, getTagColor } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Gauge, Fuel, Settings2, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CarCardProps {
  car: Car;
  onNavigate: (route: Route) => void;
  variant?: 'grid' | 'list';
  index?: number;
}

export default function CarCard({ car, onNavigate, variant = 'grid', index = 0 }: CarCardProps) {
  const { toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(car.id);
  const images = parseImages(car.images);
  const mainImage = images[0] || '';
  const isLocalImage = mainImage.startsWith('/uploads/');

  // 3D Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<{
    transform: string;
    transition: string;
  }>({
    transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  });

  // Shine position state (follows cursor)
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });

  // Heart pop animation state
  const [heartPop, setHeartPop] = useState(false);

  const MAX_TILT = 8; // degrees

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalize to -1..1
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      // Tilt: mouse-right → rotateY positive, mouse-down → rotateX negative
      const rotateY = normX * MAX_TILT;
      const rotateX = -normY * MAX_TILT;

      setTiltStyle({
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.12s ease-out',
      });

      // Update shine position (percentage)
      setShinePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    });
  }, []);

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleWishlist(car.id);
      // Trigger pop animation
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 350);
    },
    [car.id, toggleWishlist]
  );

  const tags: string[] = car.tags
    ? typeof car.tags === 'string'
      ? car.tags.split(',').filter(Boolean)
      : Array.isArray(car.tags)
        ? car.tags
        : []
    : [];

  // Priority for first 4 cards for faster LCP
  const shouldPrioritize = index < 4;

  // List variant - horizontal card
  if (variant === 'list') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => onNavigate({ page: 'car', slug: car.slug })}
        className="group relative flex cursor-pointer overflow-hidden rounded-xl transition-all duration-300"
        style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Neon orange hover border glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,77,0,0.15), 0 8px 40px rgba(255,77,0,0.08)',
          }}
        />

        {/* Image - left side */}
        <div className="relative z-[2] w-48 flex-shrink-0 overflow-hidden bg-muted sm:w-56">
          {mainImage ? (
            isLocalImage ? (
              <Image
                src={mainImage}
                alt={car.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                sizes="224px"
                loading={shouldPrioritize ? 'eager' : 'lazy'}
                priority={shouldPrioritize}
              />
            ) : (
              <img
                src={mainImage}
                alt={car.name}
                loading={shouldPrioritize ? 'eager' : 'lazy'}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Neon orange tinted sweep overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,77,0,0.06) 50%, transparent 60%)',
            }}
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            suppressHydrationWarning
            className="absolute right-2 top-2 z-[5] flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <motion.div
              animate={
                heartPop
                  ? { scale: [1, 1.4, 0.9, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={
                heartPop
                  ? { duration: 0.35, ease: 'easeInOut' }
                  : { duration: 0.15 }
              }
            >
              <Heart
                className={`h-3.5 w-3.5 transition-all duration-300 ${
                  wishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-white/50'
                }`}
                style={
                  wishlisted
                    ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }
                    : undefined
                }
                suppressHydrationWarning
              />
            </motion.div>
          </button>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="absolute left-2 top-2 z-[5] flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  className={`text-[9px] font-semibold uppercase tracking-wider backdrop-blur-md ${getTagColor(tag)}`}
                  variant="secondary"
                >
                  {getTagLabel(tag)}
                </Badge>
              ))}
            </div>
          )}

          {/* Fuel type badge - neon orange border */}
          <div
            className="absolute bottom-2 right-2 z-[5] rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,77,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {car.fuelType}
          </div>
        </div>

        {/* Content - right side */}
        <div className="relative z-[2] flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-bold uppercase tracking-tight text-white/90">
                {car.name}
              </h3>
            </div>

            <p
              className="text-lg font-extrabold uppercase tracking-tight text-white transition-all duration-500 group-hover:text-[#FF6B2B]"
              style={{
                textShadow: wishlisted
                  ? '0 0 16px rgba(239,68,68,0.3)'
                  : undefined,
              }}
            >
              {formatPrice(car.price)}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
              <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-white/60">
                <Calendar className="h-3 w-3" suppressHydrationWarning />
                {car.year}
              </span>
              <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-white/60">
                <Fuel className="h-3 w-3" suppressHydrationWarning />
                {car.fuelType}
              </span>
              <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-white/60">
                <Settings2 className="h-3 w-3" suppressHydrationWarning />
                {car.transmission}
              </span>
              <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-white/60">
                <Gauge className="h-3 w-3" suppressHydrationWarning />
                {formatKM(car.kmDriven)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-white/30">
            <MapPin className="h-3 w-3" suppressHydrationWarning />
            {car.location}
            <span className="mx-1 text-white/10">•</span>
            <User className="h-3 w-3" suppressHydrationWarning />
            {car.ownerType}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid variant - original vertical card (default)
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onNavigate({ page: 'car', slug: car.slug })}
      className="group relative cursor-pointer overflow-hidden rounded-xl"
      style={{
        ...tiltStyle,
        background: '#0A0A0A',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Dynamic cursor-following neon orange shine overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,77,0,0.12) 0%, rgba(255,77,0,0.03) 30%, transparent 60%)`,
        }}
      />

      {/* Neon orange border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255,77,0,0.15), 0 8px 40px rgba(255,77,0,0.08)',
        }}
      />

      {/* Image */}
      <div className="relative z-[2] aspect-[16/10] overflow-hidden bg-muted">
        {mainImage ? (
          isLocalImage ? (
            <Image
              src={mainImage}
              alt={car.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={shouldPrioritize ? 'eager' : 'lazy'}
              priority={shouldPrioritize}
            />
          ) : (
            <img
              src={mainImage}
              alt={car.name}
              loading={shouldPrioritize ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Neon orange tinted image overlay gradient for depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(to top, rgba(255,77,0,0.08) 0%, rgba(255,77,0,0.02) 30%, transparent 60%)',
          }}
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          suppressHydrationWarning
          className="absolute right-3 top-3 z-[5] flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <motion.div
            animate={
              heartPop
                ? { scale: [1, 1.4, 0.9, 1.15, 1] }
                : { scale: 1 }
            }
            transition={
              heartPop
                ? { duration: 0.35, ease: 'easeInOut' }
                : { duration: 0.15 }
            }
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                wishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-white/50'
              }`}
              style={
                wishlisted
                  ? { filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' }
                  : undefined
              }
              suppressHydrationWarning
            />
          </motion.div>
        </button>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="absolute left-3 top-3 z-[5] flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className={`text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getTagColor(tag)}`}
                variant="secondary"
              >
                {getTagLabel(tag)}
              </Badge>
            ))}
          </div>
        )}

        {/* Fuel type badge - neon orange border */}
        <div
          className="absolute bottom-2 right-2 z-[5] rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,77,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {car.fuelType}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[2] p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-bold uppercase tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white">
            {car.name}
          </h3>
        </div>

        {/* Price with neon orange glow */}
        <p
          className="text-xl font-extrabold uppercase tracking-tight text-white transition-all duration-500 group-hover:text-[#FF6B2B]"
          style={{
            textShadow: wishlisted
              ? '0 0 16px rgba(239,68,68,0.3)'
              : undefined,
          }}
        >
          {formatPrice(car.price)}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/40">
          <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-[#FF6B2B]/70">
            <Fuel className="h-3 w-3" suppressHydrationWarning />
            {car.fuelType}
          </span>
          <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-[#FF6B2B]/70">
            <Settings2 className="h-3 w-3" suppressHydrationWarning />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-[#FF6B2B]/70">
            <Gauge className="h-3 w-3" suppressHydrationWarning />
            {formatKM(car.kmDriven)}
          </span>
          <span className="flex items-center gap-1 transition-colors duration-300 group-hover:text-[#FF6B2B]/70">
            <MapPin className="h-3 w-3" suppressHydrationWarning />
            {car.location}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
