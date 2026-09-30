import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const [cars, activeCars, testimonials, blogPosts] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { active: true } }),
    prisma.testimonial.count(),
    prisma.blogPost.count(),
  ]);

  console.log(JSON.stringify({ cars, activeCars, testimonials, blogPosts }, null, 2));
} catch (error) {
  console.error(
    'Database check failed:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
