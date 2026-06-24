/**
 * Saatvik Cars — Business Constants
 * Single source of truth for business info, contact details, and brand lists.
 * Import from here instead of hardcoding everywhere.
 */

export const BUSINESS = {
  dealerName: 'Saatvik Cars',
  parentCompany: 'Tarang Marketing',
  legalName: 'Saatvik Cars — A unit of Tarang Marketing',
  gstin: '22AAWPL4412H1ZQ',
  email: 'saatvikcars@tarangmarketing.in',
  address: 'Chhattisgarh, India',
  hours: 'Mon–Sat 9AM–8PM IST',
  // Canonical phone order (display order)
  phones: [
    { display: '+91 75828 5000', tel: '+91758285000', digits: '91758285000' },
    { display: '+91 96449 24777', tel: '+919644924777', digits: '919644924777' },
    { display: '+91 95756 01601', tel: '+919575601601', digits: '919575601601' },
  ],
  // Primary phone (used for fallback / demo cars)
  primaryPhone: '+919644924777',
  social: {
    instagram: 'https://instagram.com/saatvikcars',
    twitter: 'https://twitter.com/saatvikcars',
    youtube: 'https://youtube.com/@saatvikcars',
    facebook: 'https://facebook.com/saatvikcars',
    linkedin: 'https://linkedin.com/company/saatvikcars',
  },
} as const;

/** All car brands — used by Hero dropdown, BrandMarquee, Footer, SellCarModal */
export const ALL_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Toyota',
  'Mahindra',
  'Kia',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Skoda',
  'MG',
  'Jeep',
  'Volvo',
  'Renault',
  'Nissan',
  'Ford',
  'Land Rover',
  'Jaguar',
] as const;

/** Brands shown in the marquee strip (subset of ALL_BRANDS) */
export const MARQUEE_BRANDS = ALL_BRANDS.slice(0, 15);

/** Brands shown in the Hero dropdown (subset) */
export const HERO_BRANDS = ALL_BRANDS.slice(0, 15);

/** Brands shown in the Footer quick links (subset) */
export const FOOTER_BRANDS = ALL_BRANDS.slice(0, 8);

/** Fuel types */
export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG'] as const;

/** Transmissions */
export const TRANSMISSIONS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'] as const;

/** Owner types */
export const OWNER_TYPES = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'] as const;

/** Body / category types */
export const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV/MPV', 'Luxury', 'Electric', 'Convertible', 'Pickup'] as const;

/** Sunroof options */
export const SUNROOF_OPTIONS = ['No', 'Single Pane', 'Panoramic'] as const;

/** Finance options */
export const FINANCE_OPTIONS = [
  'Finance available',
  'Refinance available',
  'Finance & Refinance available',
  'Not available',
] as const;

/** Tag options (must match helpers.ts getTagLabel/getTagColor keys) */
export const TAG_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'urgent', label: 'Urgent Sale' },
  { value: 'best_deal', label: 'Best Deal' },
  { value: 'sold', label: 'Sold' },
] as const;

/** Car colours (common Indian market colours) */
export const CAR_COLORS = [
  'Pearl White', 'Platinum White', 'Arctic White', 'Pearl Arctic White',
  'Phantom Black', 'Obsidian Black', 'Midnight Black', 'Nightfall Black',
  'Silver', 'Glacier Silver', 'Machine Silver', 'Urban Titanium',
  'Grey', 'Gunmetal Grey', 'Nardo Grey', 'Sleek Silver',
  'Red', 'Burgundy Red', 'Solid Red', 'Racing Red', 'Crimson Red',
  'Blue', 'Intelligency Blue', 'Mediterranean Blue', 'Royal Blue', 'Indigo Blue',
  'Brown', 'Bronze', 'Mocha Brown', 'Java Brown',
  'Green', 'Forest Green', 'Olive Green',
  'Orange', 'Volcanic Orange',
  'Yellow', 'Racing Yellow',
  'Gold', 'Champagne Gold', 'Beige Gold',
  'Purple', 'Maroon', 'Other',
] as const;
