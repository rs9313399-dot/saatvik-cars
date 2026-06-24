export interface Car {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  ownerType: string;
  location: string;
  description: string;
  tags: string;
  contactPhone: string;
  carNumber: string;
  color: string;
  insurance: string;
  rto: string;
  sunroof: string;
  finance: string;
  bodyType: string; // D7: Hatchback / Sedan / SUV / MUV / Luxury / Electric
  images: string; // JSON string array
  active: boolean;
  views: number;
  callClicks: number;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  ownerType: string;
  location: string;
  description: string;
  tags: string[];
  contactPhone: string;
  carNumber: string;
  color: string;
  insurance: string;
  rto: string;
  sunroof: string;
  finance: string;
  bodyType: string;
  images: string[];
}

export interface Stats {
  totalCars: number;
  activeCars: number;
  totalViews: number;
  totalCallClicks: number;
  totalWhatsappClicks: number;
  inactiveCars: number;
}

export interface CarFilters {
  brand?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort?: string;
  search?: string;
  all?: boolean;
}

export const BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota',
  'Mahindra', 'Kia', 'Volkswagen', 'Skoda', 'BMW',
  'Mercedes-Benz', 'Audi', 'Renault', 'Nissan', 'Ford',
  'MG', 'Jeep', 'Volvo', 'Land Rover', 'Jaguar'
] as const;

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'] as const;
export const TRANSMISSIONS = ['Manual', 'Automatic'] as const;
export const OWNER_TYPES = ['1st Owner', '2nd Owner', '3rd Owner'] as const;
export const TAGS = ['featured', 'urgent', 'best_deal'] as const;

export type Brand = typeof BRANDS[number];
export type FuelType = typeof FUEL_TYPES[number];
export type Transmission = typeof TRANSMISSIONS[number];
export type OwnerType = typeof OWNER_TYPES[number];
export type Tag = typeof TAGS[number];
