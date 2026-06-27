'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Wrench,
  Newspaper,
  Star,
  BellRing,
  ArrowRight,
  X,
  Link2,
  Mail,
  MessageCircle,
  Clock,
  User,
  Calendar,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = 'Guides' | 'Maintenance' | 'News' | 'Reviews' | 'Updates';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string;
  author: string;
  publishedAt: string;
  views: number;
}

// ---------------------------------------------------------------------------
// Category visual config (gradient + icon + badge colour)
// ---------------------------------------------------------------------------

interface CategoryStyle {
  icon: typeof BookOpen;
  gradient: string; // cover gradient block
  badge: string; // badge pill classes
  ring: string; // icon container border colour
  iconText: string; // icon stroke colour
  chip: string; // filter chip colour when active
}

const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Guides: {
    icon: BookOpen,
    gradient: 'bg-gradient-to-br from-[#D7B56D]/20 to-[#D7B56D]/5',
    badge: 'border-[#D7B56D]/30 bg-[#D7B56D]/10 text-[#D7B56D]',
    ring: 'border-[#D7B56D]/30 bg-[#D7B56D]/10',
    iconText: 'text-[#D7B56D]',
    chip: 'bg-[#D7B56D] text-[#0A0A0A] border-[#D7B56D]',
  },
  Maintenance: {
    icon: Wrench,
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    ring: 'border-emerald-500/30 bg-emerald-500/10',
    iconText: 'text-emerald-300',
    chip: 'bg-emerald-500 text-[#0A0A0A] border-emerald-500',
  },
  News: {
    icon: Newspaper,
    gradient: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    ring: 'border-amber-500/30 bg-amber-500/10',
    iconText: 'text-amber-300',
    chip: 'bg-amber-500 text-[#0A0A0A] border-amber-500',
  },
  Reviews: {
    icon: Star,
    gradient: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    ring: 'border-violet-500/30 bg-violet-500/10',
    iconText: 'text-violet-300',
    chip: 'bg-violet-500 text-[#0A0A0A] border-violet-500',
  },
  Updates: {
    icon: BellRing,
    gradient: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    ring: 'border-rose-500/30 bg-rose-500/10',
    iconText: 'text-rose-300',
    chip: 'bg-rose-500 text-[#0A0A0A] border-rose-500',
  },
};

const FILTERS: Array<'All' | Category> = [
  'All',
  'Guides',
  'Maintenance',
  'News',
  'Reviews',
  'Updates',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryStyle(category: string): CategoryStyle {
  if (category && category in CATEGORY_STYLES) {
    return CATEGORY_STYLES[category as Category];
  }
  return CATEGORY_STYLES.Guides;
}

function estimateReadTime(body: string): string {
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Render the markdown-ish body:
 *  - Split on double newlines into paragraphs.
 *  - If paragraph starts with `## ` render an <h3>.
 *  - If paragraph starts with `# ` render an <h2>.
 *  - Otherwise render a <p>.
 */
function renderBody(body: string) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h3
          key={i}
          className="mt-6 mb-2 text-lg font-semibold text-white"
          suppressHydrationWarning
        >
          {block.replace(/^##\s+/, '')}
        </h3>
      );
    }
    if (block.startsWith('# ')) {
      return (
        <h2
          key={i}
          className="mt-7 mb-3 text-xl font-bold text-white"
          suppressHydrationWarning
        >
          {block.replace(/^#\s+/, '')}
        </h2>
      );
    }
    return (
      <p
        key={i}
        className="mb-4 text-sm leading-relaxed text-slate-300"
        suppressHydrationWarning
      >
        {block}
      </p>
    );
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function CardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/50"
      suppressHydrationWarning
    >
      <Skeleton className="h-40 w-full rounded-none bg-white/5" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-20 rounded-full bg-white/5" />
        <Skeleton className="h-5 w-3/4 bg-white/5" />
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-24 bg-white/5" />
          <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article card
// ---------------------------------------------------------------------------

interface ArticleCardProps {
  post: BlogPost;
  onOpen: (post: BlogPost) => void;
  index: number;
}

function ArticleCard({ post, onOpen, index }: ArticleCardProps) {
  const style = getCategoryStyle(post.category);
  const Icon = style.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(post)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.42) }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.99 }}
      aria-label={`Read article: ${post.title}`}
      className="group flex min-h-[360px] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/50 text-left transition-colors duration-300 hover:border-[#D7B56D]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B56D]/60"
      suppressHydrationWarning
    >
      {/* Cover gradient block with category icon */}
      <div
        className={`relative flex h-40 w-full items-center justify-center overflow-hidden ${style.gradient}`}
        suppressHydrationWarning
      >
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${style.ring} backdrop-blur-sm transition-transform duration-300 group-hover:scale-110`}
          suppressHydrationWarning
        >
          <Icon
            className={`h-8 w-8 ${style.iconText}`}
            strokeWidth={1.6}
            suppressHydrationWarning
          />
        </div>
        <span
          className="absolute left-3 top-3"
          suppressHydrationWarning
        >
          <Badge
            variant="outline"
            className={`border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.badge}`}
            suppressHydrationWarning
          >
            {post.category}
          </Badge>
        </span>
      </div>

      {/* Card body */}
      <div
        className="flex flex-1 flex-col p-5"
        suppressHydrationWarning
      >
        <h3
          className="line-clamp-2 text-base font-semibold leading-snug text-white transition-colors group-hover:text-[#D7B56D]"
          suppressHydrationWarning
        >
          {post.title}
        </h3>
        <p
          className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-400"
          suppressHydrationWarning
        >
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500"
          suppressHydrationWarning
        >
          <span
            className="inline-flex items-center gap-1"
            suppressHydrationWarning
          >
            <User className="h-3 w-3" strokeWidth={2} />
            {post.author}
          </span>
          <span
            className="inline-flex items-center gap-1"
            suppressHydrationWarning
          >
            <Calendar className="h-3 w-3" strokeWidth={2} />
            {formatDate(post.publishedAt)}
          </span>
          <span
            className="inline-flex items-center gap-1"
            suppressHydrationWarning
          >
            <Clock className="h-3 w-3" strokeWidth={2} />
            {estimateReadTime(post.body)}
          </span>
        </div>

        {/* Read more button (visual; whole card is clickable) */}
        <div
          className="mt-auto pt-4"
          suppressHydrationWarning
        >
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D7B56D] transition-all group-hover:gap-2.5"
            suppressHydrationWarning
          >
            Read more
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Article reader modal
// ---------------------------------------------------------------------------

interface ReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

function ReaderModal({ post, onClose }: ReaderModalProps) {
  // ESC closes the modal.
  useEffect(() => {
    if (!post) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    // Lock body scroll while modal open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [post, onClose]);

  // Fire-and-forget view increment whenever a new post opens.
  useEffect(() => {
    if (!post) return;
    // fire-and-forget — we don't want to block the modal on a network call.
    void fetch(`/api/blog/${encodeURIComponent(post.slug)}/view`, {
      method: 'POST',
    }).catch(() => {
      /* silently ignore — view tracking is best-effort */
    });
  }, [post]);

  const shareUrl = useMemo(() => {
    if (!post) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/#blog-${post.slug}`;
  }, [post]);

  const handleCopyLink = useCallback(async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  }, [post, shareUrl]);

  const handleWhatsApp = useCallback(() => {
    if (!post) return;
    const text = encodeURIComponent(`${post.title}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }, [post, shareUrl]);

  const handleEmail = useCallback(() => {
    if (!post) return;
    const subject = encodeURIComponent(post.title);
    const body = encodeURIComponent(
      `I thought you might like this article from Saatvik Cars:\n\n${post.title}\n${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  }, [post, shareUrl]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={onClose}
          suppressHydrationWarning
        >
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-reader-title"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl"
            suppressHydrationWarning
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close article reader"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B56D]/60"
              suppressHydrationWarning
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>

            {/* Scrollable body, max-h to keep modal in viewport */}
            <div
              className="max-h-[85vh] overflow-y-auto"
              suppressHydrationWarning
            >
              {/* Hero gradient + title */}
              {(() => {
                const style = getCategoryStyle(post.category);
                const Icon = style.icon;
                return (
                  <div
                    className={`relative flex h-48 w-full items-center justify-center ${style.gradient}`}
                    suppressHydrationWarning
                  >
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${style.ring} backdrop-blur-sm`}
                      suppressHydrationWarning
                    >
                      <Icon
                        className={`h-10 w-10 ${style.iconText}`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span
                      className="absolute left-5 top-5"
                      suppressHydrationWarning
                    >
                      <Badge
                        variant="outline"
                        className={`border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.badge}`}
                        suppressHydrationWarning
                      >
                        {post.category}
                      </Badge>
                    </span>
                  </div>
                );
              })()}

              {/* Article body */}
              <article
                className="px-5 py-6 sm:px-8 sm:py-8"
                suppressHydrationWarning
              >
                <h2
                  id="blog-reader-title"
                  className="text-2xl font-bold leading-tight text-white sm:text-3xl"
                  suppressHydrationWarning
                >
                  {post.title}
                </h2>

                {/* Meta row */}
                <div
                  className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"
                  suppressHydrationWarning
                >
                  <span
                    className="inline-flex items-center gap-1.5"
                    suppressHydrationWarning
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    {post.author}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5"
                    suppressHydrationWarning
                  >
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5"
                    suppressHydrationWarning
                  >
                    <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                    {estimateReadTime(post.body)}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  suppressHydrationWarning
                />

                {/* Body */}
                <div
                  className="text-slate-300"
                  suppressHydrationWarning
                >
                  {renderBody(post.body)}
                </div>

                {/* Tags */}
                {post.tags && (
                  <div
                    className="mt-6 flex flex-wrap gap-2"
                    suppressHydrationWarning
                  >
                    {post.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-normal text-slate-400"
                          suppressHydrationWarning
                        >
                          #{tag}
                        </Badge>
                      ))}
                  </div>
                )}

                {/* Share row */}
                <div
                  className="mt-7 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between"
                  suppressHydrationWarning
                >
                  <span
                    className="text-xs font-medium uppercase tracking-wider text-slate-500"
                    suppressHydrationWarning
                  >
                    Share this article
                  </span>
                  <div
                    className="flex flex-wrap items-center gap-2"
                    suppressHydrationWarning
                  >
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleWhatsApp}
                      aria-label="Share on WhatsApp"
                      className="h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                      suppressHydrationWarning
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEmail}
                      aria-label="Share via Email"
                      className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                      suppressHydrationWarning
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCopyLink}
                      aria-label="Copy article link"
                      className="h-9 rounded-lg bg-[#D7B56D] px-3 text-xs font-bold text-[#0A0A0A] hover:bg-[#E7C77B]"
                      suppressHydrationWarning
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Newsletter inline form
// ---------------------------------------------------------------------------

function NewsletterInline() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) {
        toast.error('Please enter your email');
        return;
      }
      if (!EMAIL_RE.test(trimmed)) {
        toast.error('Please enter a valid email address');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Subscription failed');
        }
        toast.success('Subscribed! Watch your inbox for our next update.');
        setEmail('');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Could not subscribe. Try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#D7B56D]/[0.06] via-[#111827]/40 to-transparent p-6 sm:p-8"
      suppressHydrationWarning
    >
      <div
        className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        suppressHydrationWarning
      >
        <div
          className="max-w-xl"
          suppressHydrationWarning
        >
          <h3
            className="text-lg font-bold text-white sm:text-xl"
            suppressHydrationWarning
          >
            Never miss an update
          </h3>
          <p
            className="mt-1 text-sm text-slate-400"
            suppressHydrationWarning
          >
            Get the latest buying guides, maintenance tips, and Saatvik Cars
            offers delivered straight to your inbox. No spam, unsubscribe
            anytime.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          suppressHydrationWarning
        >
          <div
            className="flex-1"
            suppressHydrationWarning
          >
            <Label htmlFor="blog-newsletter-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="blog-newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-label="Email address"
              className="h-11 rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/60 focus-visible:ring-[#D7B56D]/30"
              suppressHydrationWarning
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            aria-label="Subscribe to newsletter"
            className="h-11 shrink-0 rounded-xl bg-[#D7B56D] px-5 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] disabled:opacity-60"
            suppressHydrationWarning
          >
            {loading ? (
              <>
                <span
                  className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0A0A0A]/40 border-t-[#0A0A0A]"
                  suppressHydrationWarning
                />
                Subscribing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Subscribe
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | Category>('All');
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/blog?limit=12', { cache: 'no-store' });
        const data = await res.json().catch(() => ({ posts: [] }));
        if (cancelled) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'All') return posts;
    return posts.filter((p) => p.category === activeFilter);
  }, [posts, activeFilter]);

  const handleOpen = useCallback((post: BlogPost) => {
    setOpenPost(post);
  }, []);

  const handleClose = useCallback(() => {
    setOpenPost(null);
  }, []);

  return (
    <section
      id="blog"
      className="bg-[#0A0A0A] py-12 sm:py-14"
      suppressHydrationWarning
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        suppressHydrationWarning
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
          suppressHydrationWarning
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]"
            suppressHydrationWarning
          >
            <Newspaper className="h-3.5 w-3.5" />
            Blog &amp; News
          </span>
          <h2
            className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
            suppressHydrationWarning
          >
            Guides, Tips &amp; Updates
          </h2>
          <p
            className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base"
            suppressHydrationWarning
          >
            Expert buying guides, maintenance tips, and the latest news from
            the Saatvik Cars desk — everything you need to make a smart
            used-car decision.
          </p>
        </motion.div>

        {/* Category filter chips */}
        <div
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
          suppressHydrationWarning
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            const activeStyle =
              f === 'All'
                ? 'bg-[#D7B56D] text-[#0A0A0A] border-[#D7B56D]'
                : getCategoryStyle(f).chip;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                aria-pressed={isActive}
                aria-label={`Filter posts by ${f}`}
                className={
                  isActive
                    ? `inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${activeStyle}`
                    : 'inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-white'
                }
                suppressHydrationWarning
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Articles grid (or skeletons) */}
        {loading ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            suppressHydrationWarning
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            className="rounded-2xl border border-white/[0.06] bg-[#111827]/40 p-12 text-center"
            suppressHydrationWarning
          >
            <Newspaper
              className="mx-auto h-10 w-10 text-slate-400"
              strokeWidth={1.5}
            />
            <p
              className="mt-3 text-sm text-slate-400"
              suppressHydrationWarning
            >
              No articles in this category yet. Check back soon.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            suppressHydrationWarning
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, i) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  onOpen={handleOpen}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Newsletter inline form */}
        <NewsletterInline />
      </div>

      {/* Article reader modal */}
      <ReaderModal post={openPost} onClose={handleClose} />
    </section>
  );
}
