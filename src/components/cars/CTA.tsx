'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Car, ArrowRight, Phone, Check, Shield, Mail, MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { BUSINESS } from '@/lib/business';

export default function CTA() {
  const { setSellModalOpen, setSellValuationOpen, isAdmin } = useStore();

  const handleBrowseCars = () => {
    const carsSection = document.getElementById('cars');
    if (carsSection) {
      carsSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast.success('Browse our verified collection!', { duration: 2500 });
  };

  const handleSellCar = () => {
    if (isAdmin) {
      // Admin → List Your Car (create car listing)
      setSellModalOpen(true);
    } else {
      // Customer → Sell/Trade valuation flow
      setSellValuationOpen(true);
    }
  };

  return (
    <section id="contact" className="py-16 cta-gradient" suppressHydrationWarning>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Large headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-white leading-tight"
          suppressHydrationWarning
        >
          Ready to Drive Your{' '}
          <span className="text-[#00D4FF]" suppressHydrationWarning>
            Dream Car
          </span>
          ?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-lg text-slate-400 text-sm sm:text-base leading-relaxed"
          suppressHydrationWarning
        >
          Join a GST-registered dealer you can trust. Verified cars, transparent
          pricing, and a hassle-free experience — every single time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          suppressHydrationWarning
        >
          <Button
            suppressHydrationWarning
            className="h-12 min-w-[200px] rounded-xl bg-[#00D4FF] text-[#0A0A0A] font-bold hover:bg-[#00B8E6] shadow-lg shadow-[#00D4FF]/25 transition-all duration-300 text-sm hover:scale-[1.03]"
            onClick={handleBrowseCars}
          >
            <Car className="mr-2 h-4 w-4" suppressHydrationWarning />
            Browse All Cars
          </Button>
          <Button
            suppressHydrationWarning
            className="h-12 min-w-[200px] rounded-xl border-2 border-[#00D4FF]/40 text-[#00D4FF] font-bold hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/60 transition-all duration-300 text-sm hover:scale-[1.03]"
            variant="outline"
            onClick={handleSellCar}
          >
            {isAdmin ? (
              <>
                <Car className="mr-2 h-4 w-4" suppressHydrationWarning />
                List Your Car
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" suppressHydrationWarning />
                Sell / Trade Your Car
              </>
            )}
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          suppressHydrationWarning
        >
          {['No Hidden Fees', 'Verified Papers', '7-Day Return', 'RC Transfer Included'].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
              suppressHydrationWarning
            >
              <Check className="h-3 w-3" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* Phone numbers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-5 flex flex-col items-center gap-3"
          suppressHydrationWarning
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${BUSINESS.email}`}
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-[#00D4FF] transition-colors"
            >
              <Mail className="h-4 w-4 text-[#00D4FF]" />
              {BUSINESS.email}
            </a>
            <span className="text-white/10">·</span>
            <a
              href={`https://wa.me/${BUSINESS.phones[0].digits}?text=${encodeURIComponent('Hi, I am interested in a car from Saatvik Cars.')}`}
              target="_blank"
              rel="noopener noreferrer"
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#00D4FF]" suppressHydrationWarning />
            <span className="text-sm text-[#00D4FF] font-medium" suppressHydrationWarning>
              Or call us:
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {BUSINESS.phones.map((phone, i) => (
              <Fragment key={phone.tel}>
                {i > 0 && <span className="text-white/10">·</span>}
                <a href={`tel:${phone.tel}`} suppressHydrationWarning className="text-sm text-white/80 hover:text-[#00D4FF] transition-colors">{phone.display}</a>
              </Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
