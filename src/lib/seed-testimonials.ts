import { db } from './db';

/**
 * Customer reviews are submitted by real buyers and moderated before display.
 * We intentionally do not seed placeholder testimonials.
 */
export async function seedTestimonials(): Promise<void> {
  try {
    await db.testimonial.count();
  } catch (error) {
    console.error('[seed] Testimonials seed failed:', error);
  }
}
