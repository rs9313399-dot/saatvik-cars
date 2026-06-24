'use client';

import type { Car } from '@/lib/types';
import { trackClick } from '@/lib/api';
import { getWhatsAppLink, getCallLink } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';

interface ContactButtonsProps {
  car: Car;
}

export default function ContactButtons({ car }: ContactButtonsProps) {
  const handleCall = () => {
    trackClick(car.id, 'call');
    window.open(getCallLink(car.contactPhone), '_self');
  };

  const handleWhatsApp = () => {
    trackClick(car.id, 'whatsapp');
    window.open(getWhatsAppLink(car.contactPhone, car.name), '_blank');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(255,77,0,0.15)] bg-[#0A0A0A]/95 px-4 py-3 backdrop-blur-xl sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
      <div className="mx-auto flex max-w-7xl gap-3 sm:flex-col">
        <Button
          onClick={handleCall}
          className="h-11 flex-1 gap-2 rounded-lg bg-[#FF4D00] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_18px_rgba(255,77,0,0.4)] hover:bg-[#FF6B2B] hover:shadow-[0_0_28px_rgba(255,77,0,0.55)] transition-all duration-200 sm:h-10 sm:flex-none"
        >
          <Phone className="h-4 w-4" suppressHydrationWarning />
          <span>Call Now</span>
        </Button>
        <Button
          onClick={handleWhatsApp}
          className="h-11 flex-1 gap-2 rounded-lg bg-green-600 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,77,0,0.2)] hover:bg-green-500 hover:shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all duration-200 sm:h-10 sm:flex-none"
        >
          <MessageCircle className="h-4 w-4" suppressHydrationWarning />
          <span>WhatsApp</span>
        </Button>
      </div>
    </div>
  );
}
