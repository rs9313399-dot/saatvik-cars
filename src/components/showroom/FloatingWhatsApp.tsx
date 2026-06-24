'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FloatingWhatsApp() {
  const [show, setShow] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  // Show after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide tooltip after 10 seconds
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20a%20car%20from%20AutoElite"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
        >
          <MessageCircle className="h-6 w-6" suppressHydrationWarning />

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background shadow-lg"
              >
                Chat with us!
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 bg-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
