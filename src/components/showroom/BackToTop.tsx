'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-20 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF4D00] text-white shadow-[0_0_18px_rgba(255,77,0,0.4)] transition-all duration-200 hover:bg-[#FF6B2B] hover:shadow-[0_0_28px_rgba(255,77,0,0.55)] sm:bottom-8 sm:right-20 sm:h-12 sm:w-12"
        >
          <ArrowUp className="h-5 w-5" suppressHydrationWarning />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
