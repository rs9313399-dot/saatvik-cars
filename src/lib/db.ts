import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NODE_ENV === 'production'
    ? 'file:/tmp/saatvik-cars.db'
    : 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })

let initPromise: Promise<void> | null = null;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username")`,

  `CREATE TABLE IF NOT EXISTS "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "kmDriven" INTEGER NOT NULL,
    "ownerType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL,
    "carNumber" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '',
    "insurance" TEXT NOT NULL DEFAULT '',
    "rto" TEXT NOT NULL DEFAULT '',
    "sunroof" TEXT NOT NULL DEFAULT 'No',
    "finance" TEXT NOT NULL DEFAULT '',
    "bodyType" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featuredUntil" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "callClicks" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Car_slug_key" ON "Car"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Car_brand_idx" ON "Car"("brand")`,
  `CREATE INDEX IF NOT EXISTS "Car_price_idx" ON "Car"("price")`,
  `CREATE INDEX IF NOT EXISTS "Car_year_idx" ON "Car"("year")`,
  `CREATE INDEX IF NOT EXISTS "Car_active_idx" ON "Car"("active")`,
  `CREATE INDEX IF NOT EXISTS "Car_location_idx" ON "Car"("location")`,
  `CREATE INDEX IF NOT EXISTS "Car_createdAt_idx" ON "Car"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Car_bodyType_idx" ON "Car"("bodyType")`,

  `CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email")`,

  `CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "carPurchased" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Testimonial_approved_idx" ON "Testimonial"("approved")`,

  `CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'test_drive',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL,
    "carId" TEXT NOT NULL DEFAULT '',
    "carName" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "preferredDate" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Lead_type_idx" ON "Lead"("type")`,
  `CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status")`,
  `CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt")`,

  `CREATE TABLE IF NOT EXISTS "SellInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL DEFAULT '',
    "transmission" TEXT NOT NULL DEFAULT '',
    "kmDriven" INTEGER NOT NULL DEFAULT 0,
    "ownerType" TEXT NOT NULL DEFAULT '',
    "condition" TEXT NOT NULL DEFAULT 'Good',
    "estimatedPrice" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT NOT NULL DEFAULT '',
    "inspectionDate" TEXT NOT NULL DEFAULT '',
    "inspectionSlot" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "offerPrice" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "SellInquiry_status_idx" ON "SellInquiry"("status")`,
  `CREATE INDEX IF NOT EXISTS "SellInquiry_createdAt_idx" ON "SellInquiry"("createdAt")`,

  `CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Guides',
    "tags" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT 'Saatvik Cars',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")`,
  `CREATE INDEX IF NOT EXISTS "BlogPost_published_idx" ON "BlogPost"("published")`,
  `CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category")`,
  `CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt")`,

  `CREATE TABLE IF NOT EXISTS "ServiceInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "carDetail" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "ServiceInquiry_type_idx" ON "ServiceInquiry"("type")`,
  `CREATE INDEX IF NOT EXISTS "ServiceInquiry_status_idx" ON "ServiceInquiry"("status")`,
  `CREATE INDEX IF NOT EXISTS "ServiceInquiry_createdAt_idx" ON "ServiceInquiry"("createdAt")`,

  `CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId")`,
  `CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt")`,

  `CREATE TABLE IF NOT EXISTS "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "saleDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Sale_carId_idx" ON "Sale"("carId")`,
  `CREATE INDEX IF NOT EXISTS "Sale_saleDate_idx" ON "Sale"("saleDate")`,

  `CREATE TABLE IF NOT EXISTS "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "PriceHistory_carId_idx" ON "PriceHistory"("carId")`,
  `CREATE INDEX IF NOT EXISTS "PriceHistory_recordedAt_idx" ON "PriceHistory"("recordedAt")`,
];

const demoCars = [
  {
    name: 'Maruti Suzuki Swift VXI',
    slug: 'maruti-suzuki-swift-vxi',
    brand: 'Maruti Suzuki',
    model: 'Swift VXI',
    year: 2023,
    price: 650000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 12000,
    ownerType: '1st Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Well-maintained Swift VXI with clean interiors, smooth petrol engine, and city-friendly mileage.',
    tags: 'featured',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 2186',
    bodyType: 'Hatchback',
    color: 'Pearl White',
    insurance: 'Comprehensive valid till Dec 2026',
    rto: 'CG04 Raipur',
    sunroof: 'No',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/maruti-suzuki-swift-vxi-representative.webp']),
    active: true,
    views: 186,
    callClicks: 18,
    whatsappClicks: 24,
  },
  {
    name: 'Hyundai Creta SX',
    slug: 'hyundai-creta-sx',
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2022,
    price: 1250000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 28000,
    ownerType: '1st Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Feature-loaded Creta SX automatic with premium cabin, strong diesel performance, and excellent road presence.',
    tags: 'featured,best_deal',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 7421',
    bodyType: 'SUV',
    color: 'Phantom Black',
    insurance: 'Comprehensive valid till Mar 2027',
    rto: 'CG04 Raipur',
    sunroof: 'Panoramic',
    finance: 'Finance & Refinance available',
    images: JSON.stringify(['/images/cars/hyundai-creta-sx-representative.webp']),
    active: true,
    views: 221,
    callClicks: 27,
    whatsappClicks: 33,
  },
  {
    name: 'Tata Nexon XZ+',
    slug: 'tata-nexon-xz-plus',
    brand: 'Tata',
    model: 'Nexon XZ+',
    year: 2023,
    price: 980000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 8000,
    ownerType: '1st Owner',
    location: 'Bhilai, Chhattisgarh',
    description: 'Low-driven Nexon XZ+ with strong safety rating, modern features, and excellent compact SUV practicality.',
    tags: 'featured',
    contactPhone: '+919644924777',
    carNumber: 'CG07 XX 5308',
    bodyType: 'SUV',
    color: 'Daytona Grey',
    insurance: 'Zero-dep valid till Jan 2027',
    rto: 'CG07 Bhilai',
    sunroof: 'Single Pane',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/tata-nexon-xz-plus-representative.webp']),
    active: true,
    views: 172,
    callClicks: 16,
    whatsappClicks: 21,
  },
  {
    name: 'Toyota Fortuner Legender',
    slug: 'toyota-fortuner-legender',
    brand: 'Toyota',
    model: 'Fortuner Legender',
    year: 2021,
    price: 3950000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 45000,
    ownerType: '2nd Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Powerful Fortuner Legender automatic with commanding stance, reliable diesel engine, and premium comfort.',
    tags: 'urgent',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 9045',
    bodyType: 'SUV',
    color: 'Pearl White',
    insurance: 'Comprehensive valid till Sep 2026',
    rto: 'CG04 Raipur',
    sunroof: 'No',
    finance: 'Finance & Refinance available',
    images: JSON.stringify(['/images/cars/toyota-fortuner-legender-representative.webp']),
    active: true,
    views: 248,
    callClicks: 31,
    whatsappClicks: 39,
  },
  {
    name: 'Honda City ZX CVT',
    slug: 'honda-city-zx-cvt',
    brand: 'Honda',
    model: 'City ZX CVT',
    year: 2022,
    price: 1100000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 18000,
    ownerType: '1st Owner',
    location: 'Bilaspur, Chhattisgarh',
    description: 'Smooth Honda City ZX CVT with spacious cabin, refined petrol engine, and premium sedan comfort.',
    tags: 'best_deal',
    contactPhone: '+919644924777',
    carNumber: 'CG10 XX 1180',
    bodyType: 'Sedan',
    color: 'Platinum White',
    insurance: 'Comprehensive valid till Feb 2027',
    rto: 'CG10 Bilaspur',
    sunroof: 'Single Pane',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/honda-city-zx-cvt-representative.webp']),
    active: true,
    views: 159,
    callClicks: 13,
    whatsappClicks: 19,
  },
  {
    name: 'BMW 3 Series 320d Sport',
    slug: 'bmw-3-series-320d-sport',
    brand: 'BMW',
    model: '3 Series 320d Sport',
    year: 2021,
    price: 3250000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 35000,
    ownerType: '2nd Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Luxury BMW 3 Series diesel automatic with sharp handling, premium interiors, and excellent highway manners.',
    tags: 'featured,urgent',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 6320',
    bodyType: 'Luxury',
    color: 'Glacier Silver',
    insurance: 'Comprehensive valid till Nov 2026',
    rto: 'CG04 Raipur',
    sunroof: 'Single Pane',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/bmw-3-series-320d-sport-representative.webp']),
    active: true,
    views: 205,
    callClicks: 22,
    whatsappClicks: 28,
  },
  {
    name: 'Mahindra XUV700 AX7',
    slug: 'mahindra-xuv700-ax7',
    brand: 'Mahindra',
    model: 'XUV700 AX7',
    year: 2022,
    price: 2080000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 26000,
    ownerType: '1st Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Spacious XUV700 AX7 with automatic transmission, premium cabin features, and strong highway comfort.',
    tags: 'best_deal',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 7700',
    bodyType: 'SUV',
    color: 'Midnight Black',
    insurance: 'Zero-dep valid till Apr 2027',
    rto: 'CG04 Raipur',
    sunroof: 'Panoramic',
    finance: 'Finance & Refinance available',
    images: JSON.stringify(['/images/cars/mahindra-xuv700-ax7-representative.webp']),
    active: true,
    views: 193,
    callClicks: 20,
    whatsappClicks: 26,
  },
  {
    name: 'Mercedes-Benz C-Class C200',
    slug: 'mercedes-benz-c-class-c200',
    brand: 'Mercedes-Benz',
    model: 'C-Class C200',
    year: 2022,
    price: 4200000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 22000,
    ownerType: '1st Owner',
    location: 'Raipur, Chhattisgarh',
    description: 'Elegant C-Class C200 with refined petrol performance, premium interiors, and luxury sedan presence.',
    tags: 'featured',
    contactPhone: '+919644924777',
    carNumber: 'CG04 XX 2022',
    bodyType: 'Luxury',
    color: 'Obsidian Black',
    insurance: 'Comprehensive valid till Aug 2026',
    rto: 'CG04 Raipur',
    sunroof: 'Panoramic',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/mercedes-benz-c-class-c200-representative.webp']),
    active: true,
    views: 214,
    callClicks: 24,
    whatsappClicks: 31,
  },
  {
    name: 'MG Hector Sharp',
    slug: 'mg-hector-sharp',
    brand: 'MG',
    model: 'Hector Sharp',
    year: 2022,
    price: 1650000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 19000,
    ownerType: '1st Owner',
    location: 'Bhilai, Chhattisgarh',
    description: 'Tech-loaded MG Hector Sharp automatic with panoramic sunroof, connected features, and generous space.',
    tags: 'urgent,best_deal',
    contactPhone: '+919644924777',
    carNumber: 'CG07 XX 1650',
    bodyType: 'SUV',
    color: 'Starry Black',
    insurance: 'Comprehensive valid till Jul 2026',
    rto: 'CG07 Bhilai',
    sunroof: 'Panoramic',
    finance: 'Finance available',
    images: JSON.stringify(['/images/cars/mg-hector-sharp-representative.webp']),
    active: true,
    views: 184,
    callClicks: 17,
    whatsappClicks: 23,
  },
];

function hasStoredImages(images: string | null | undefined) {
  if (!images) return false;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) && parsed.some((src) => typeof src === 'string' && src.trim().length > 0);
  } catch {
    return false;
  }
}

async function seedDemoCars() {
  for (const car of demoCars) {
    const existing = await prisma.car.findUnique({ where: { slug: car.slug } });
    if (!existing) {
      await prisma.car.create({ data: car });
    } else {
      const data: Record<string, unknown> = {
        price: car.price,
        fuelType: car.fuelType,
        transmission: car.transmission,
        kmDriven: car.kmDriven,
        ownerType: car.ownerType,
        location: car.location,
        description: car.description,
        bodyType: car.bodyType,
        contactPhone: car.contactPhone,
        carNumber: car.carNumber,
        color: car.color,
        insurance: car.insurance,
        rto: car.rto,
        sunroof: car.sunroof,
        finance: car.finance,
        tags: car.tags,
        active: true,
      };

      if (!hasStoredImages(existing.images)) {
        data.images = car.images;
      }

      await prisma.car.update({
        where: { slug: car.slug },
        data,
      });
    }
  }
}

async function initializeDatabase() {
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }

  await seedDemoCars();
}

export async function ensureDatabaseReady() {
  initPromise ??= initializeDatabase();
  await initPromise;
}

export const db = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        await ensureDatabaseReady();
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
