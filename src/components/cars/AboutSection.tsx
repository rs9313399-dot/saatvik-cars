'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, Navigation } from 'lucide-react';
import { BUSINESS } from '@/lib/business';

// Full showroom address (BUSINESS.address is just the state - this is the specific location)
const FULL_ADDRESS = 'Plot 14, Industrial Area, Bilaspur, Chhattisgarh 495001, India';
const MAPS_QUERY = encodeURIComponent('Saatvik Cars Tarang Marketing Bilaspur Chhattisgarh');
const MAPS_DIR_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

export default function AboutSection() {
  return (
    <section id="about" className="py-12 bg-[#0A0A0A]" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Story */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            suppressHydrationWarning
          >
            <span className="inline-flex items-center gap-2 rounded-md border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]" suppressHydrationWarning>
              <Building2 className="h-3.5 w-3.5" />
              About Us
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white" suppressHydrationWarning>
              {BUSINESS.legalName}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400" suppressHydrationWarning>
              Saatvik Cars operates under Tarang Marketing in Bilaspur, Chhattisgarh.
              Browse the current listings and contact us to confirm a car&apos;s
              availability before visiting.
            </p>

            {/* Contact info - phone numbers as tel: links, email as mailto: */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" />
                <div>
                  <p className="text-xs font-medium text-slate-300" suppressHydrationWarning>Location</p>
                  <p className="text-xs text-slate-500" suppressHydrationWarning>{FULL_ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" />
                <div>
                  <p className="text-xs font-medium text-slate-300" suppressHydrationWarning>Call Us</p>
                  <p className="text-xs text-slate-500" suppressHydrationWarning>
                    {BUSINESS.phones.map((p, i) => (
                      <span key={p.tel}>
                        {i > 0 && ' · '}
                        <a href={`tel:${p.tel}`} className="transition-colors hover:text-[#D7B56D]">{p.display}</a>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" />
                <div>
                  <p className="text-xs font-medium text-slate-300" suppressHydrationWarning>Email</p>
                  <a href={`mailto:${BUSINESS.email}`} className="text-xs text-slate-500 transition-colors hover:text-[#D7B56D]" suppressHydrationWarning>{BUSINESS.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div>
                  <p className="text-xs font-medium text-slate-300" suppressHydrationWarning>GSTIN</p>
                  <p className="text-xs text-slate-500" suppressHydrationWarning>{BUSINESS.gstin}</p>
                </div>
              </div>
            </div>

            {/* Get Directions button */}
            <a
              href={MAPS_DIR_URL}
              target="_blank"
              rel="noopener noreferrer"
              suppressHydrationWarning
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-[#D7B56D]/30 bg-[#D7B56D]/5 px-4 text-xs font-semibold text-[#D7B56D] transition-all hover:bg-[#D7B56D]/10 hover:border-[#D7B56D]/50"
            >
              <Navigation className="h-3.5 w-3.5" />
              Get Directions
            </a>
          </motion.div>

          {/* Right: Map and registered business details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
            suppressHydrationWarning
          >
            {/* Google Maps embed */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08]" suppressHydrationWarning>
              <iframe
                title="Saatvik Cars showroom location on Google Maps"
                src={MAPS_EMBED}
                width="100%"
                height="220"
                style={{ border: 0, filter: 'invert(0.92) hue-rotate(180deg) saturate(0.8)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5">
              <h3 className="text-sm font-semibold text-white">Business details</h3>
              <p className="mt-2 text-xs text-slate-400">{BUSINESS.legalName}</p>
              <p className="mt-1 text-xs text-slate-400">GSTIN: {BUSINESS.gstin}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
