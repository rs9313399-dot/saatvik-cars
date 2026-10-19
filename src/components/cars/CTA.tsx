'use client';

import { Car, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { BUSINESS } from '@/lib/business';

export default function CTA() {
  const { setSellModalOpen, setSellValuationOpen, isAdmin } = useStore();

  const handleBrowseCars = () => {
    document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSellCar = () => {
    if (isAdmin) {
      setSellModalOpen(true);
    } else {
      setSellValuationOpen(true);
    }
  };

  return (
    <section id="contact" className="bg-[#0D0F12] py-14">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
          Visit Saatvik Cars in <span className="text-[#D7B56D]">Bilaspur</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Find us at Plot 14, Industrial Area, Bilaspur, Chhattisgarh 495001.
          Contact us to confirm a listing is available before you visit.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="h-11 min-w-48 rounded-lg bg-[#D7B56D] font-semibold text-[#0A0A0A] hover:bg-[#E7C77B]"
            onClick={handleBrowseCars}
          >
            <Car className="mr-2 h-4 w-4" aria-hidden="true" />
            Browse cars
          </Button>
          <Button
            variant="outline"
            className="h-11 min-w-48 rounded-lg border-white/15 text-white hover:bg-white/5"
            onClick={handleSellCar}
          >
            Sell or trade a car
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-slate-300">
          <a
            href={`mailto:${BUSINESS.email}`}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <Mail className="h-4 w-4 text-[#D7B56D]" aria-hidden="true" />
            {BUSINESS.email}
          </a>
          <a
            href={`tel:${BUSINESS.phones[0].tel}`}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <Phone className="h-4 w-4 text-[#D7B56D]" aria-hidden="true" />
            {BUSINESS.phones[0].display}
          </a>
          <a
            href={`https://wa.me/${BUSINESS.phones[0].digits}?text=${encodeURIComponent('Hi, I have a question about a car listing.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <MessageCircle className="h-4 w-4 text-[#D7B56D]" aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Bilaspur, Chhattisgarh
        </p>
      </div>
    </section>
  );
}
