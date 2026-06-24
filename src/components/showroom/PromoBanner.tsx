'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Gift, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const promos = [
  { icon: <Zap className="h-3.5 w-3.5" suppressHydrationWarning />, text: '🔥 Weekend Sale — Up to 15% off on select pre-owned cars!' },
  { icon: <Gift className="h-3.5 w-3.5" suppressHydrationWarning />, text: '🎉 Free first-year insurance on cars above ₹10 Lakh' },
  { icon: <Percent className="h-3.5 w-3.5" suppressHydrationWarning />, text: '💰 Special Financing — EMI starting at just ₹5,999/month' },
];

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate promos every 4 seconds
  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-[60] w-full bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white"
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-[13px] font-medium sm:text-sm"
            >
              {promos[currentIndex].icon}
              <span>{promos[currentIndex].text}</span>
            </motion.div>
          </AnimatePresence>
          <button
            suppressHydrationWarning
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            aria-label="Dismiss banner"
          >
            <X className="h-3 w-3" suppressHydrationWarning />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
