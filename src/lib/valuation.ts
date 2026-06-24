/**
 * Saatvik Cars — Car Valuation Algorithm
 * Shared between the client (SellValuationModal live estimate)
 * and the server (/api/sell-inquiry POST) so both always agree.
 *
 * The estimate is a *rule-of-thumb* instant offer range. Final offer
 * is set by our inspection team after a physical evaluation.
 */

/** Input shape for the valuation algorithm. */
export interface ValuationInput {
  brand: string;
  model?: string;
  year: number;
  fuelType?: string;
  kmDriven: number;
  ownerType?: string;
  condition?: string;
}

/* ─────────────── Brand Tiers (new-car base price estimate, INR) ─────────────── */
const BRAND_TIERS: Record<'mass' | 'premium' | 'luxury', number> = {
  mass: 7_00_000,
  premium: 11_00_000,
  luxury: 38_00_000,
};

const MASS_BRANDS = new Set([
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Renault',
  'Nissan',
  'Ford',
  'MG',
]);

const PREMIUM_BRANDS = new Set([
  'Honda',
  'Toyota',
  'Mahindra',
  'Kia',
  'Volkswagen',
  'Skoda',
  'Jeep',
]);

const LUXURY_BRANDS = new Set([
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volvo',
  'Land Rover',
  'Jaguar',
]);

function basePriceFor(brand: string): number {
  if (LUXURY_BRANDS.has(brand)) return BRAND_TIERS.luxury;
  if (PREMIUM_BRANDS.has(brand)) return BRAND_TIERS.premium;
  return BRAND_TIERS.mass;
}

/* ─────────────── Condition multipliers ─────────────── */
const CONDITION_MULT: Record<string, number> = {
  Excellent: 1.05,
  Good: 1.0,
  Fair: 0.9,
  Poor: 0.75,
};

/* ─────────────── Owner-type multipliers ─────────────── */
const OWNER_MULT: Record<string, number> = {
  '1st Owner': 1.0,
  '2nd Owner': 0.92,
  '3rd Owner': 0.84,
  '4th+ Owner': 0.76,
};

/* ─────────────── Fuel-type multipliers ─────────────── */
const FUEL_MULT: Record<string, number> = {
  Diesel: 1.02, // holds value better
  Electric: 0.92, // depreciates faster
};

/** Hard floor — we never quote below this. */
const MIN_VALUE = 50_000;
/** Reference year (current evaluation year). */
const REFERENCE_YEAR = 2025;
/** Per-year depreciation (compounding). */
const AGE_DEPRECIATION = 0.14;

/**
 * Compute the instant estimated value of a used car in INR.
 *
 * Algorithm:
 * 1. Base price by brand tier (mass / premium / luxury).
 * 2. Age depreciation: `price *= (1 - 0.14) ^ (2025 - year)`.
 *    Year clamped to [2010, 2025].
 * 3. KM depreciation: > 50k → −₹1.5/km extra; > 100k → −₹2/km extra.
 *    Floor at ₹50,000.
 * 4. Owner multiplier (1st/2nd/3rd/4th+).
 * 5. Condition multiplier (Excellent/Good/Fair/Poor).
 * 6. Fuel multiplier (Diesel +2%, Electric −8%, others neutral).
 * 7. Round to nearest ₹1,000. Clamp final ≥ ₹50,000.
 *
 * @returns integer INR (e.g. 523000)
 */
export function estimateCarValue(input: ValuationInput): number {
  const brand = (input.brand || '').trim();
  // Clamp year to a sane range
  const rawYear = Number(input.year);
  const year = Number.isFinite(rawYear)
    ? Math.min(REFERENCE_YEAR, Math.max(2010, rawYear))
    : REFERENCE_YEAR;

  const km = Math.max(0, Number(input.kmDriven) || 0);

  // 1) Base by tier
  let price = basePriceFor(brand);

  // 2) Age depreciation (compounding 14%/year)
  const ageYears = Math.max(0, REFERENCE_YEAR - year);
  price = price * Math.pow(1 - AGE_DEPRECIATION, ageYears);

  // 3) KM depreciation
  if (km > 1_00_000) {
    price -= 1.5 * (km - 50_000) + 2 * (km - 1_00_000);
  } else if (km > 50_000) {
    price -= 1.5 * (km - 50_000);
  }
  if (price < MIN_VALUE) price = MIN_VALUE;

  // 4) Owner multiplier
  const ownerKey = (input.ownerType || '').trim();
  const ownerMult = OWNER_MULT[ownerKey];
  if (ownerMult) price *= ownerMult;

  // 5) Condition multiplier
  const condKey = (input.condition || '').trim();
  const condMult = CONDITION_MULT[condKey];
  if (condMult) price *= condMult;

  // 6) Fuel multiplier
  const fuelKey = (input.fuelType || '').trim();
  const fuelMult = FUEL_MULT[fuelKey];
  if (fuelMult) price *= fuelMult;

  // 7) Round to nearest ₹1,000 + final floor
  const rounded = Math.round(price / 1000) * 1000;
  return Math.max(MIN_VALUE, rounded);
}
