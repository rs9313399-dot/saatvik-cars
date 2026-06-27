import { db } from './db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SAMPLE_CARS = [
  {
    name: 'Maruti Suzuki Swift VXI',
    brand: 'Maruti Suzuki',
    model: 'Swift VXI',
    year: 2023,
    price: 650000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 12000,
    ownerType: '1st Owner',
    location: 'Mumbai, Maharashtra',
    description:
      'Well-maintained Maruti Suzuki Swift VXI in excellent condition. Single owner, regularly serviced at authorized service center. Features include power steering, air conditioning, and infotainment system. Perfect city car with great mileage.',
    tags: 'featured',
    contactPhone: '+919644924777',
    images: JSON.stringify([]),
  },
  {
    name: 'Hyundai Creta SX',
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2022,
    price: 1250000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 28000,
    ownerType: '1st Owner',
    location: 'Delhi NCR',
    description:
      'Premium Hyundai Creta SX with automatic transmission. Loaded with features like sunroof, ventilated seats, BOSE sound system, and BlueLink connected car tech. Diesel engine delivers excellent performance and fuel efficiency on highways.',
    tags: 'featured',
    contactPhone: '+919876543221',
    images: JSON.stringify([]),
  },
  {
    name: 'Tata Nexon XZ+',
    brand: 'Tata',
    model: 'Nexon XZ+',
    year: 2023,
    price: 980000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 8000,
    ownerType: '1st Owner',
    location: 'Bangalore, Karnataka',
    description:
      'Top variant Tata Nexon XZ+ with stunning design and 5-star safety rating. Features include a touchscreen infotainment system, connected car tech, and premium interiors. Barely driven, like-new condition.',
    tags: 'featured',
    contactPhone: '+919876543222',
    images: JSON.stringify([]),
  },
  {
    name: 'Toyota Fortuner Legender',
    brand: 'Toyota',
    model: 'Fortuner Legender',
    year: 2021,
    price: 3950000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 45000,
    ownerType: '2nd Owner',
    location: 'Chennai, Tamil Nadu',
    description:
      'The legendary Toyota Fortuner Legender edition. Known for its unmatched reliability and off-road capability. This diesel automatic variant is in superb condition with full service history. Premium white pearl finish.',
    tags: 'urgent',
    contactPhone: '+919876543223',
    images: JSON.stringify([]),
  },
  {
    name: 'Honda City ZX CVT',
    brand: 'Honda',
    model: 'City ZX CVT',
    year: 2022,
    price: 1100000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 18000,
    ownerType: '1st Owner',
    location: 'Pune, Maharashtra',
    description:
      'Honda City ZX CVT — the king of sedans. Smooth CVT automatic transmission, spacious cabin, and Honda reliability. Features include lane watch camera, Honda Sensing ADAS, and premium leather seats.',
    tags: 'best_deal',
    contactPhone: '+919876543224',
    images: JSON.stringify([]),
  },
  {
    name: 'Kia Seltos HTX',
    brand: 'Kia',
    model: 'Seltos HTX',
    year: 2023,
    price: 850000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    kmDriven: 22000,
    ownerType: '1st Owner',
    location: 'Hyderabad, Telangana',
    description:
      'Kia Seltos HTX diesel — a perfect blend of style and substance. Feature-packed with a 10.25-inch touchscreen, ventilated seats, and Bose premium sound system. Diesel engine offers brilliant highway mileage.',
    tags: 'best_deal',
    contactPhone: '+919876543225',
    images: JSON.stringify([]),
  },
  {
    name: 'BMW 3 Series 320d Sport',
    brand: 'BMW',
    model: '3 Series 320d Sport',
    year: 2021,
    price: 3250000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 35000,
    ownerType: '2nd Owner',
    location: 'Mumbai, Maharashtra',
    description:
      'Experience Bavarian luxury with this BMW 3 Series 320d Sport. Powered by a refined 2.0L diesel engine mated to an 8-speed automatic gearbox, it delivers exhilarating performance with exceptional fuel efficiency. Comes with iDrive infotainment, ambient lighting, and M Sport steering wheel.',
    tags: 'featured,urgent',
    contactPhone: '+919876543226',
    images: JSON.stringify([]),
  },
  {
    name: 'Mercedes-Benz C-Class C200',
    brand: 'Mercedes-Benz',
    model: 'C-Class C200',
    year: 2022,
    price: 4200000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 22000,
    ownerType: '1st Owner',
    location: 'Delhi NCR',
    description:
      'Sophistication meets performance in this Mercedes-Benz C-Class C200. The turbocharged petrol engine delivers smooth power while the MBUX infotainment system with voice control keeps you connected. Dual-zone climate control, panoramic sunroof, and premium Burmester sound system make every drive special.',
    tags: 'featured',
    contactPhone: '+919876543227',
    images: JSON.stringify([]),
  },
  {
    name: 'Honda City VX MT',
    brand: 'Honda',
    model: 'City VX MT',
    year: 2020,
    price: 780000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 42000,
    ownerType: '1st Owner',
    location: 'Jaipur, Rajasthan',
    description:
      'Reliable and fuel-efficient Honda City VX in classic manual transmission. Known for its legendary i-VTEC engine refinement and low maintenance costs. Spacious cabin with premium fabric upholstery, dual airbags, ABS, and a touchscreen infotainment system with Android Auto and Apple CarPlay.',
    tags: 'best_deal',
    contactPhone: '+919876543228',
    images: JSON.stringify([]),
  },
  {
    name: 'MG Hector Sharp',
    brand: 'MG',
    model: 'Hector Sharp',
    year: 2022,
    price: 1650000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 19000,
    ownerType: '1st Owner',
    location: 'Kochi, Kerala',
    description:
      'Command the road with the MG Hector Sharp — one of the most tech-loaded SUVs in its segment. Features a massive 10.4-inch vertical touchscreen, AI-powered personal assistant, connected car tech with over 50 features, and a panoramic sunroof. The 1.5L turbo-petrol engine with CVT offers a refined driving experience.',
    tags: 'urgent,best_deal',
    contactPhone: '+919876543229',
    images: JSON.stringify([]),
  },
];

export async function seed(): Promise<void> {
  // Create default admin if none exists
  const adminCount = await db.admin.count();
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? '' : 'admin123');
  if (adminCount === 0 && adminPassword) {
    await db.admin.create({
      data: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: adminPassword,
      },
    });
    console.log('✅ Default admin created.');
  } else if (adminCount === 0) {
    console.log('ℹ️ ADMIN_PASSWORD is not configured; skipping default admin.');
  } else {
    console.log('ℹ️ Admin already exists, skipping.');
  }

  // Seed sample cars if none exist
  const carCount = await db.car.count();
  if (carCount === 0) {
    for (const carData of SAMPLE_CARS) {
      const slug = slugify(carData.name);
      await db.car.create({
        data: {
          ...carData,
          slug,
          active: true,
          views: Math.floor(Math.random() * 200) + 50,
          callClicks: Math.floor(Math.random() * 30),
          whatsappClicks: Math.floor(Math.random() * 40),
        },
      });
    }
    console.log(`✅ Seeded ${SAMPLE_CARS.length} sample cars.`);
  } else {
    console.log(`ℹ️ ${carCount} cars already exist, skipping seed.`);
  }
}

// Run seed if this file is executed directly
seed()
  .then(() => {
    console.log('🎉 Seeding complete.');
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
