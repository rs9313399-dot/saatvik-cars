import { db } from './db';

interface SeedTestimonial {
  name: string;
  location: string;
  rating: number;
  carPurchased: string;
  title: string;
  body: string;
}

const SEED_TESTIMONIALS: SeedTestimonial[] = [
  {
    name: 'Rajesh Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    carPurchased: 'Hyundai Creta SX',
    title: 'Transparent deal, no hidden surprises',
    body:
      'The 150-point inspection report gave me full confidence before I even test-drove the Creta. The team walked me through every dent and scratch on the car and the final price was exactly what was quoted — zero hidden charges. RC transfer was completed within a week. Highly recommended.',
  },
  {
    name: 'Priya Iyer',
    location: 'Pune, Maharashtra',
    rating: 5,
    carPurchased: 'Maruti Swift VXI',
    title: 'Perfect first car for my daughter',
    body:
      'As a first-time buyer I had a lot of doubts, but the Saatvik Cars team was patient and honest. They explained the service history in detail and even helped me compare two Swift variants. The paperwork was handled end-to-end and I drove home the same day. Truly transparent experience.',
  },
  {
    name: 'Amit Patel',
    location: 'Bangalore, Karnataka',
    rating: 5,
    carPurchased: 'Tata Nexon XZ+',
    title: '5-star safety, 5-star service',
    body:
      'I was looking for a safe compact SUV for my family and the Nexon XZ+ was the perfect pick. The 7-day return policy sealed the deal for me — though I never needed it. The car was spotless, service records were verified, and finance was arranged through their partner bank at a great rate.',
  },
  {
    name: 'Sunita Reddy',
    location: 'Hyderabad, Telangana',
    rating: 4,
    carPurchased: 'BMW 3 Series 320d',
    title: 'Premium car at a fair price',
    body:
      'Buying a used BMW felt risky, but Saatvik Cars made it stress-free. Their certified inspection caught a minor electrical issue which they fixed before delivery. The luxury variant came at almost 40% off the new price and the insurance was renewed on the spot. Minor wait for delivery, otherwise excellent.',
  },
  {
    name: 'Vikram Singh',
    location: 'Delhi NCR',
    rating: 5,
    carPurchased: 'Honda City ZX CVT',
    title: 'Smooth CVT, smoother paperwork',
    body:
      'The Honda City ZX CVT I bought feels brand new even after 18,000 km on the odo. What impressed me most was the honesty — they told me about a previous minor fender-bender that had been repaired, which no other dealer would have disclosed. The loan was approved in 48 hours and I got the keys the next day.',
  },
  {
    name: 'Neha Gupta',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    carPurchased: 'Kia Seltos HTX',
    title: 'Genuine team, genuine cars',
    body:
      'From the first phone call to the final handover, every step was professional. The Seltos HTX I purchased had a complete service book and the team even arranged a free first service. I appreciated that they never pushed me to upgrade to a pricier model. Will definitely recommend Saatvik Cars to friends.',
  },
];

/**
 * Seed ~6 realistic Indian customer testimonials into the Testimonial table
 * if it is currently empty. All seeded reviews are pre-approved so they show
 * up on the public Customer Reviews section immediately.
 */
export async function seedTestimonials(): Promise<void> {
  try {
    const count = await db.testimonial.count();
    if (count > 0) {
      // Table already has data — nothing to do.
      return;
    }

    await db.testimonial.createMany({
      data: SEED_TESTIMONIALS.map((t) => ({
        name: t.name,
        location: t.location,
        rating: t.rating,
        carPurchased: t.carPurchased,
        title: t.title,
        body: t.body,
        approved: true,
      })),
    });

    console.log(`[seed] Inserted ${SEED_TESTIMONIALS.length} testimonials.`);
  } catch (error) {
    console.error('[seed] Testimonials seed failed:', error);
  }
}
