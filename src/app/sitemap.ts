import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://saatvikcars.in';
  const lastModified = new Date();

  // Single-page app — declare the homepage + main section anchors so
  // search engines know the key navigation targets exist on the page.
  // Priority: homepage 1.0, sections 0.8.
  const sections: Array<{ hash: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { hash: '', priority: 1.0, changeFrequency: 'weekly' },
    { hash: '#cars', priority: 0.8, changeFrequency: 'daily' },
    { hash: '#finance', priority: 0.8, changeFrequency: 'monthly' },
    { hash: '#services', priority: 0.8, changeFrequency: 'monthly' },
    { hash: '#about', priority: 0.8, changeFrequency: 'monthly' },
    { hash: '#blog', priority: 0.7, changeFrequency: 'weekly' },
    { hash: '#contact', priority: 0.8, changeFrequency: 'monthly' },
  ];

  const sectionEntries: MetadataRoute.Sitemap = sections.map((s) => ({
    url: `${base}/${s.hash}`,
    lastModified,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  // Published blog posts — the blog opens in a modal on the same page,
  // so each post points to the #blog anchor with its own lastModified date.
  let blogPosts: { slug: string; updatedAt: Date }[] = [];
  try {
    blogPosts = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // If the DB is not reachable at build time, skip blog entries
    // rather than failing the whole sitemap generation.
    blogPosts = [];
  }

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/#blog`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...sectionEntries, ...blogEntries];
}
