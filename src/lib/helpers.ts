export function formatPrice(price: number): string {
  if (!price || price <= 0) return '₹0';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

/** Real EMI calculation: P*r*(1+r)^n / ((1+r)^n - 1) */
export function calcEMI(price: number, annualRate = 9.5, months = 60): number {
  if (!price || price <= 0) return 0;
  const r = annualRate / 100 / 12; // monthly interest rate
  const n = months;
  const factor = Math.pow(1 + r, n);
  return Math.round((price * r * factor) / (factor - 1));
}

/** Format EMI amount with L/K suffixes */
export function formatEMI(emi: number): string {
  if (emi >= 100000) return `₹${(emi / 100000).toFixed(2)} L`;
  if (emi >= 1000) return `₹${emi.toLocaleString('en-IN')}`;
  return `₹${emi}`;
}

export function formatKM(km: number): string {
  if (!km || km <= 0) return '0 km';
  if (km >= 100000) return `${(km / 1000).toFixed(0)}K km`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
  return `${km.toLocaleString('en-IN')} km`;
}

export function getTagLabel(tag: string): string {
  // Normalize: lowercase, then replace spaces, hyphens AND camelCase boundaries with underscore
  const normalized = tag
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]/g, '_');
  const map: Record<string, string> = {
    featured: 'Featured',
    urgent: 'Urgent Sale',
    best_deal: 'Best Deal',
    bestdeal: 'Best Deal',
    sold: 'Sold',
  };
  return map[normalized] || map[tag] || tag;
}

export function getTagColor(tag: string): string {
  // Normalize: lowercase, then replace spaces, hyphens AND camelCase boundaries with underscore
  const normalized = tag
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]/g, '_');
  const map: Record<string, string> = {
    best_deal: 'bg-emerald-500/20 text-emerald-400',
    bestdeal: 'bg-emerald-500/20 text-emerald-400',
    featured: 'bg-[#00D4FF]/20 text-[#00D4FF]',
    urgent: 'bg-red-500/20 text-red-400',
    sold: 'bg-slate-500/20 text-slate-400',
  };
  return map[normalized] || map[tag] || 'bg-white/10 text-white/70';
}

export function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getWhatsAppLink(phone: string, carName: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(`Hi, I am interested in this car: ${carName}`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export function getCallLink(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleanPhone}`;
}
