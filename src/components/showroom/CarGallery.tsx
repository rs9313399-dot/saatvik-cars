'use client';

import { useState, useRef } from 'react';
import { parseImages } from '@/lib/helpers';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Car } from '@/lib/types';

interface CarGalleryProps {
  car: Car;
}

export default function CarGallery({ car }: CarGalleryProps) {
  const images = parseImages(car.images);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        next();
      } else {
        prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        No images available
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  const currentImage = images[activeIndex];
  const isLocalImage = currentImage.startsWith('/uploads/');

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
        onClick={() => setIsZoomed(!isZoomed)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLocalImage ? (
          <Image
            src={currentImage}
            alt={`${car.name} - Image ${activeIndex + 1}`}
            fill
            className={`object-cover transition-transform duration-500 ${
              isZoomed ? 'scale-150' : 'group-hover:scale-105'
            }`}
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        ) : (
          <img
            src={currentImage}
            alt={`${car.name} - Image ${activeIndex + 1}`}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isZoomed ? 'scale-150' : 'group-hover:scale-105'
            }`}
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="h-4 w-4" suppressHydrationWarning />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="h-4 w-4" suppressHydrationWarning />
            </Button>
          </>
        )}

        {/* Zoom Icon */}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4 text-foreground" suppressHydrationWarning />
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, idx) => {
            const isLocal = img.startsWith('/uploads/');
            return (
              <button
                key={idx}
                suppressHydrationWarning
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                  idx === activeIndex
                    ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative h-16 w-24 sm:h-20 sm:w-28">
                  {isLocal ? (
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
