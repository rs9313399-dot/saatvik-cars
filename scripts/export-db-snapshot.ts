import { PrismaClient } from '@prisma/client';

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DIRECT_URL;
  if (!sourceUrl) {
    throw new Error('Set SOURCE_DATABASE_URL or DIRECT_URL to the source direct connection URL.');
  }

  const parsedUrl = new URL(sourceUrl);
  if (!/^postgres(?:ql)?:$/.test(parsedUrl.protocol) || parsedUrl.hostname.includes('-pooler')) {
    throw new Error('The source connection must be a direct PostgreSQL connection, not a pooler.');
  }

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  try {
    const tables = await source.$transaction(async (tx) => {
      const [
        admin,
        car,
        newsletterSubscriber,
        testimonial,
        lead,
        sellInquiry,
        blogPost,
        serviceInquiry,
        chatMessage,
        sale,
        priceHistory,
      ] = await Promise.all([
        tx.admin.findMany({ orderBy: { id: 'asc' } }),
        tx.car.findMany({ orderBy: { id: 'asc' } }),
        tx.newsletterSubscriber.findMany({ orderBy: { id: 'asc' } }),
        tx.testimonial.findMany({ orderBy: { id: 'asc' } }),
        tx.lead.findMany({ orderBy: { id: 'asc' } }),
        tx.sellInquiry.findMany({ orderBy: { id: 'asc' } }),
        tx.blogPost.findMany({ orderBy: { id: 'asc' } }),
        tx.serviceInquiry.findMany({ orderBy: { id: 'asc' } }),
        tx.chatMessage.findMany({ orderBy: { id: 'asc' } }),
        tx.sale.findMany({ orderBy: { id: 'asc' } }),
        tx.priceHistory.findMany({ orderBy: { id: 'asc' } }),
      ]);
      return {
        admin,
        car,
        newsletterSubscriber,
        testimonial,
        lead,
        sellInquiry,
        blogPost,
        serviceInquiry,
        chatMessage,
        sale,
        priceHistory,
      };
    }, { isolationLevel: 'RepeatableRead', timeout: 120_000 });

    process.stdout.write(JSON.stringify({
      schemaVersion: 1,
      source: 'supabase',
      exportedAt: new Date().toISOString(),
      tables,
    }));
  } finally {
    await source.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    'Database snapshot export failed:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
