import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword, isPasswordHash } from '../src/lib/password.ts';

const TABLE_NAMES = [
  'admin',
  'car',
  'newsletterSubscriber',
  'testimonial',
  'lead',
  'sellInquiry',
  'blogPost',
  'serviceInquiry',
  'chatMessage',
  'sale',
  'priceHistory',
] as const;

type TableName = (typeof TABLE_NAMES)[number];
type Row = Record<string, unknown>;
type Snapshot = {
  schemaVersion: 1;
  source: 'supabase';
  exportedAt: string;
  tables: Record<TableName, Row[]>;
};

const DATE_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'featuredUntil',
  'publishedAt',
  'saleDate',
  'recordedAt',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function assertRowsMatch(name: TableName, expected: readonly unknown[], actual: readonly unknown[]) {
  if (actual.length !== expected.length) {
    throw new Error(`Read-back count mismatch for "${name}"; import rolled back.`);
  }
  for (let index = 0; index < expected.length; index++) {
    if (stableJson(expected[index]) !== stableJson(actual[index])) {
      throw new Error(`Read-back data mismatch for "${name}" at row ${index}; import rolled back.`);
    }
  }
}

function parseSnapshot(value: unknown): Snapshot {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.source !== 'supabase') {
    throw new Error('Input is not a supported Supabase database snapshot.');
  }
  if (
    typeof value.exportedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.exportedAt)) ||
    !isRecord(value.tables)
  ) {
    throw new Error('Snapshot metadata is invalid.');
  }

  const tables = {} as Record<TableName, Row[]>;
  for (const name of TABLE_NAMES) {
    const records = value.tables[name];
    if (!Array.isArray(records)) {
      throw new Error(`Snapshot table "${name}" is missing or invalid.`);
    }
    const ids = new Set<string>();
    tables[name] = records.map((record, index) => {
      if (!isRecord(record) || typeof record.id !== 'string' || !record.id) {
        throw new Error(`Invalid ${name} record at index ${index}.`);
      }
      if (ids.has(record.id)) {
        throw new Error(`Duplicate ID in snapshot table "${name}".`);
      }
      ids.add(record.id);

      const normalized: Row = { ...record };
      for (const field of DATE_FIELDS) {
        const dateValue = normalized[field];
        if (dateValue === null || dateValue === undefined) continue;
        if (typeof dateValue !== 'string' || !Number.isFinite(Date.parse(dateValue))) {
          throw new Error(`Invalid ${field} value in ${name} record "${record.id}".`);
        }
        normalized[field] = new Date(dateValue);
      }
      return normalized;
    });
  }

  return {
    schemaVersion: 1,
    source: 'supabase',
    exportedAt: value.exportedAt,
    tables,
  };
}

async function readSnapshotFromStdin(): Promise<Snapshot> {
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  if (!input.trim()) {
    throw new Error('Provide the verified snapshot JSON through standard input.');
  }
  return parseSnapshot(JSON.parse(input) as unknown);
}

async function insertRows<T>(
  rows: T[],
  insert: (records: T[]) => Promise<{ count: number }>,
): Promise<number> {
  if (rows.length === 0) return 0;
  const result = await insert(rows);
  if (result.count !== rows.length) {
    throw new Error(`Inserted ${result.count} of ${rows.length} expected records.`);
  }
  return result.count;
}

async function main() {
  const targetUrl = process.env.NEON_TARGET_DATABASE_URL;
  if (!targetUrl) {
    throw new Error('NEON_TARGET_DATABASE_URL must contain the Neon direct connection URL.');
  }
  if (!/^postgres(?:ql)?:\/\//i.test(targetUrl)) {
    throw new Error('NEON_TARGET_DATABASE_URL must be a PostgreSQL URL.');
  }

  const snapshot = await readSnapshotFromStdin();
  const expectedCounts = Object.fromEntries(
    TABLE_NAMES.map((name) => [name, snapshot.tables[name].length]),
  );
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    const importedCounts = await target.$transaction(async (tx) => {
      const existingCounts = await Promise.all([
        tx.admin.count(),
        tx.car.count(),
        tx.newsletterSubscriber.count(),
        tx.testimonial.count(),
        tx.lead.count(),
        tx.sellInquiry.count(),
        tx.blogPost.count(),
        tx.serviceInquiry.count(),
        tx.chatMessage.count(),
        tx.sale.count(),
        tx.priceHistory.count(),
      ]);
      if (existingCounts.some((count) => count !== 0)) {
        throw new Error('Target database is not empty; refusing to import or overwrite data.');
      }

      const admins = await Promise.all(
        snapshot.tables.admin.map(async (row) => {
          if (typeof row.password !== 'string') {
            throw new Error(`Admin record "${row.id}" has no password value.`);
          }
          return {
            ...row,
            password: isPasswordHash(row.password)
              ? row.password
              : await hashPassword(row.password),
            token: null,
          } as Prisma.AdminCreateManyInput;
        }),
      );
      const cars = snapshot.tables.car as Prisma.CarCreateManyInput[];
      const newsletters = snapshot.tables.newsletterSubscriber as Prisma.NewsletterSubscriberCreateManyInput[];
      const testimonials = snapshot.tables.testimonial as Prisma.TestimonialCreateManyInput[];
      const leads = snapshot.tables.lead as Prisma.LeadCreateManyInput[];
      const sellInquiries = snapshot.tables.sellInquiry as Prisma.SellInquiryCreateManyInput[];
      const blogPosts = snapshot.tables.blogPost as Prisma.BlogPostCreateManyInput[];
      const serviceInquiries = snapshot.tables.serviceInquiry as Prisma.ServiceInquiryCreateManyInput[];
      const chatMessages = snapshot.tables.chatMessage as Prisma.ChatMessageCreateManyInput[];
      const sales = snapshot.tables.sale as Prisma.SaleCreateManyInput[];
      const priceHistory = snapshot.tables.priceHistory as Prisma.PriceHistoryCreateManyInput[];

      const counts = {
        admin: await insertRows(admins, (data) => tx.admin.createMany({ data })),
        car: await insertRows(cars, (data) => tx.car.createMany({ data })),
        newsletterSubscriber: await insertRows(newsletters, (data) => tx.newsletterSubscriber.createMany({ data })),
        testimonial: await insertRows(testimonials, (data) => tx.testimonial.createMany({ data })),
        lead: await insertRows(leads, (data) => tx.lead.createMany({ data })),
        sellInquiry: await insertRows(sellInquiries, (data) => tx.sellInquiry.createMany({ data })),
        blogPost: await insertRows(blogPosts, (data) => tx.blogPost.createMany({ data })),
        serviceInquiry: await insertRows(serviceInquiries, (data) => tx.serviceInquiry.createMany({ data })),
        chatMessage: await insertRows(chatMessages, (data) => tx.chatMessage.createMany({ data })),
        sale: await insertRows(sales, (data) => tx.sale.createMany({ data })),
        priceHistory: await insertRows(priceHistory, (data) => tx.priceHistory.createMany({ data })),
      };

      for (const name of TABLE_NAMES) {
        if (counts[name] !== expectedCounts[name]) {
          throw new Error(`Record count mismatch for "${name}"; import rolled back.`);
        }
      }

      const storedRows = await Promise.all([
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
      const expectedRows = [
        admins,
        cars,
        newsletters,
        testimonials,
        leads,
        sellInquiries,
        blogPosts,
        serviceInquiries,
        chatMessages,
        sales,
        priceHistory,
      ];
      TABLE_NAMES.forEach((name, index) => {
        assertRowsMatch(name, expectedRows[index], storedRows[index]);
      });
      return counts;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120_000 });

    console.log(JSON.stringify({
      source: snapshot.source,
      exportedAt: snapshot.exportedAt,
      importedCounts,
      adminPasswordsHashed: true,
      previousAdminSessionsInvalidated: true,
    }, null, 2));
  } finally {
    await target.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    'Database snapshot import failed:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
