'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      {/* Image skeleton */}
      <Skeleton className="aspect-[16/10] w-full rounded-none bg-white/[0.04]" />
      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4 bg-white/[0.06]" />
        <Skeleton className="h-7 w-1/2 bg-white/[0.06]" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-14 bg-white/[0.04]" />
          <Skeleton className="h-3 w-16 bg-white/[0.04]" />
          <Skeleton className="h-3 w-12 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
