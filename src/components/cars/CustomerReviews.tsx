'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Pencil, CheckCircle2, Loader2, Quote, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CHAMPAGNE = '#D7B56D';
const AMBER = '#F5A623';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  carPurchased: string;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

interface FormState {
  name: string;
  location: string;
  rating: number;
  carPurchased: string;
  title: string;
  body: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  location: '',
  rating: 5,
  carPurchased: '',
  title: '',
  body: '',
};

/** Render 5 stars with `filled` of them filled in amber. */
function StarRow({
  filled,
  size = 14,
}: {
  filled: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" suppressHydrationWarning>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          suppressHydrationWarning
          className={i < filled ? 'fill-current' : 'fill-none'}
          style={{
            color: AMBER,
            opacity: i < filled ? 1 : 0.22,
          }}
          strokeWidth={i < filled ? 0 : 1.6}
        />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = (await res.json()) as { testimonials: Testimonial[] };
      setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const avg = useMemo(() => {
    if (testimonials.length === 0) return 0;
    const sum = testimonials.reduce((acc, t) => acc + (t.rating || 0), 0);
    return sum / testimonials.length;
  }, [testimonials]);

  const avgRounded = Math.round(avg);
  const avgLabel = avg.toFixed(1);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormOpen(false);
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const name = form.name.trim();
    const body = form.body.trim();
    if (!name) {
      toast.error('Please enter your name.');
      return;
    }
    if (!body) {
      toast.error('Please write a few words about your experience.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location: form.location.trim(),
          rating: form.rating,
          carPurchased: form.carPurchased.trim(),
          title: form.title.trim(),
          body,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Submission failed');
      }

      toast.success('Thank you! Your review will appear after moderation.', {
        duration: 5000,
      });
      setSubmitted(true);
      setFormOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submission failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  return (
    <section
      id="customer-reviews"
      className="py-16 sm:py-20 bg-[#0A0A0A]"
      suppressHydrationWarning
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        suppressHydrationWarning
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
          suppressHydrationWarning
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]"
            suppressHydrationWarning
          >
            <Star className="h-3.5 w-3.5" style={{ color: CHAMPAGNE }} />
            Customer Reviews
          </span>
          <h2
            className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
            suppressHydrationWarning
          >
            Customer Reviews
          </h2>
          <p
            className="mt-2 text-sm sm:text-base text-slate-400"
            suppressHydrationWarning
          >
            Real stories from real Saatvik Cars owners
          </p>
        </motion.div>

        {/* Summary + Write a Review */}
        {!loading && testimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#111827]/40 p-5"
            suppressHydrationWarning
          >
            <div
              className="flex items-center gap-4"
              suppressHydrationWarning
            >
              <div
                className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/5"
                suppressHydrationWarning
              >
                <span
                  className="text-xl font-bold text-white leading-none"
                  suppressHydrationWarning
                >
                  {avgLabel}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5"
                  suppressHydrationWarning
                >
                  / 5
                </span>
              </div>
              <div suppressHydrationWarning>
                <StarRow filled={avgRounded} size={16} />
                <p
                  className="mt-1 text-xs text-slate-400"
                  suppressHydrationWarning
                >
                  Based on{' '}
                  <span className="font-semibold text-white">
                    {testimonials.length}
                  </span>{' '}
                  verified {testimonials.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            <Button
              suppressHydrationWarning
              onClick={() => {
                setSubmitted(false);
                setFormOpen((v) => !v);
              }}
              className="h-10 rounded-xl bg-[#D7B56D] px-5 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] transition-all"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          </motion.div>
        )}

        {/* Inline submission form */}
        <AnimatePresence initial={false}>
          {formOpen && !submitted && (
            <motion.div
              key="review-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              suppressHydrationWarning
            >
              <div
                className="mb-8 rounded-2xl border border-[#D7B56D]/20 bg-[#111827]/60 p-5 sm:p-6"
                suppressHydrationWarning
              >
                <div
                  className="mb-4 flex items-center justify-between"
                  suppressHydrationWarning
                >
                  <h3
                    className="text-base font-semibold text-white"
                    suppressHydrationWarning
                  >
                    Share your experience
                  </h3>
                  <button
                    type="button"
                    suppressHydrationWarning
                    aria-label="Close form"
                    onClick={() => setFormOpen(false)}
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  suppressHydrationWarning
                >
                  <div className="flex flex-col gap-1.5" suppressHydrationWarning>
                    <label
                      htmlFor="cr-name"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Name <span className="text-[#D7B56D]">*</span>
                    </label>
                    <Input
                      id="cr-name"
                      suppressHydrationWarning
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Rohan Mehta"
                      maxLength={120}
                      className="h-10 rounded-lg border-white/10 bg-[#0A0A0A]/60 text-sm text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D]/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" suppressHydrationWarning>
                    <label
                      htmlFor="cr-location"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Location
                    </label>
                    <Input
                      id="cr-location"
                      suppressHydrationWarning
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                      maxLength={120}
                      className="h-10 rounded-lg border-white/10 bg-[#0A0A0A]/60 text-sm text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D]/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" suppressHydrationWarning>
                    <label
                      htmlFor="cr-rating"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Rating
                    </label>
                    <div
                      className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#0A0A0A]/60 px-3"
                      suppressHydrationWarning
                    >
                      <select
                        id="cr-rating"
                        suppressHydrationWarning
                        value={form.rating}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            rating: Number(e.target.value),
                          }))
                        }
                        className="h-full w-full bg-transparent text-sm text-white outline-none [&>option]:bg-[#111827] [&>option]:text-white"
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} star{r > 1 ? 's' : ''}
                            {r === 5 ? ' — Excellent' : ''}
                            {r === 4 ? ' — Good' : ''}
                            {r === 3 ? ' — Average' : ''}
                            {r === 2 ? ' — Poor' : ''}
                            {r === 1 ? ' — Terrible' : ''}
                          </option>
                        ))}
                      </select>
                      <StarRow filled={form.rating} size={14} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5" suppressHydrationWarning>
                    <label
                      htmlFor="cr-car"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Car purchased
                    </label>
                    <Input
                      id="cr-car"
                      suppressHydrationWarning
                      value={form.carPurchased}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, carPurchased: e.target.value }))
                      }
                      placeholder="e.g. Hyundai Creta SX"
                      maxLength={200}
                      className="h-10 rounded-lg border-white/10 bg-[#0A0A0A]/60 text-sm text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D]/50"
                    />
                  </div>

                  <div
                    className="flex flex-col gap-1.5 sm:col-span-2"
                    suppressHydrationWarning
                  >
                    <label
                      htmlFor="cr-title"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Title
                    </label>
                    <Input
                      id="cr-title"
                      suppressHydrationWarning
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="Summarise your experience in a few words"
                      maxLength={200}
                      className="h-10 rounded-lg border-white/10 bg-[#0A0A0A]/60 text-sm text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D]/50"
                    />
                  </div>

                  <div
                    className="flex flex-col gap-1.5 sm:col-span-2"
                    suppressHydrationWarning
                  >
                    <label
                      htmlFor="cr-body"
                      className="text-xs font-medium text-slate-300"
                      suppressHydrationWarning
                    >
                      Your review <span className="text-[#D7B56D]">*</span>
                    </label>
                    <Textarea
                      id="cr-body"
                      suppressHydrationWarning
                      value={form.body}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, body: e.target.value }))
                      }
                      placeholder="Tell us about your buying experience, the car's condition, paperwork, transparency…"
                      maxLength={4000}
                      className="min-h-28 rounded-lg border-white/10 bg-[#0A0A0A]/60 text-sm text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D]/50"
                    />
                  </div>
                </div>

                <div
                  className="mt-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3"
                  suppressHydrationWarning
                >
                  <Button
                    type="button"
                    variant="outline"
                    suppressHydrationWarning
                    onClick={() => setFormOpen(false)}
                    className="h-10 rounded-xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    suppressHydrationWarning
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="h-10 rounded-xl bg-[#D7B56D] px-6 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thank-you state after submit */}
        <AnimatePresence initial={false}>
          {submitted && (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#D7B56D]/30 bg-[#D7B56D]/[0.06] p-5"
              suppressHydrationWarning
            >
              <div
                className="flex items-center gap-3"
                suppressHydrationWarning
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7B56D]/15"
                  suppressHydrationWarning
                >
                  <CheckCircle2
                    className="h-5 w-5"
                    style={{ color: CHAMPAGNE }}
                  />
                </div>
                <div suppressHydrationWarning>
                  <p
                    className="text-sm font-semibold text-white"
                    suppressHydrationWarning
                  >
                    Thank you for your review!
                  </p>
                  <p
                    className="text-xs text-slate-400"
                    suppressHydrationWarning
                  >
                    Our team will moderate it shortly and it will appear here
                    once approved.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                suppressHydrationWarning
                onClick={resetForm}
                className="h-9 rounded-xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-medium"
              >
                Write another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            suppressHydrationWarning
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                suppressHydrationWarning
                className="rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5"
              >
                <div
                  className="mb-3 h-3 w-24 rounded bg-white/5 animate-pulse"
                  suppressHydrationWarning
                />
                <div
                  className="mb-2 h-4 w-3/4 rounded bg-white/5 animate-pulse"
                  suppressHydrationWarning
                />
                <div
                  className="mb-4 h-3 w-full rounded bg-white/5 animate-pulse"
                  suppressHydrationWarning
                />
                <div
                  className="mb-2 h-3 w-full rounded bg-white/5 animate-pulse"
                  suppressHydrationWarning
                />
                <div
                  className="h-3 w-5/6 rounded bg-white/5 animate-pulse"
                  suppressHydrationWarning
                />
              </div>
            ))}
          </div>
        )}

        {/* Reviews grid */}
        {!loading && testimonials.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            suppressHydrationWarning
          >
            {testimonials.map((t, i) => (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.36) }}
                suppressHydrationWarning
                className="group relative flex flex-col rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5 transition-all duration-300 hover:border-[#D7B56D]/20 hover:bg-[#D7B56D]/[0.02] overflow-hidden"
              >
                {/* Decorative quote mark */}
                <Quote
                  className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-white/[0.03]"
                  strokeWidth={1}
                />

                <div
                  className="mb-3 flex items-center justify-between"
                  suppressHydrationWarning
                >
                  <StarRow filled={t.rating} size={14} />
                  {t.carPurchased ? (
                    <Badge
                      variant="outline"
                      suppressHydrationWarning
                      className="border-[#D7B56D]/20 bg-[#D7B56D]/5 text-[10px] font-medium text-[#D7B56D]"
                    >
                      {t.carPurchased}
                    </Badge>
                  ) : null}
                </div>

                {t.title ? (
                  <h3
                    className="mb-2 text-sm font-bold text-white leading-snug"
                    suppressHydrationWarning
                  >
                    {t.title}
                  </h3>
                ) : null}

                <p
                  className="relative mb-4 text-[13px] leading-relaxed text-slate-400 line-clamp-6"
                  suppressHydrationWarning
                >
                  {t.body}
                </p>

                <div
                  className="mt-auto flex items-center gap-3 border-t border-white/[0.05] pt-3"
                  suppressHydrationWarning
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D7B56D]/30 to-[#D7B56D]/5 text-xs font-bold text-[#D7B56D] border border-[#D7B56D]/20"
                    suppressHydrationWarning
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0" suppressHydrationWarning>
                    <p
                      className="truncate text-sm font-semibold text-white"
                      suppressHydrationWarning
                    >
                      {t.name}
                    </p>
                    {t.location ? (
                      <p
                        className="flex items-center gap-1 truncate text-[11px] text-slate-500"
                        suppressHydrationWarning
                      >
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && testimonials.length === 0 && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111827]/40 p-8 sm:p-12 text-center"
            suppressHydrationWarning
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5"
              suppressHydrationWarning
            >
              <Star
                className="h-6 w-6"
                style={{ color: CHAMPAGNE }}
                strokeWidth={1.6}
              />
            </div>
            <h3
              className="text-lg font-semibold text-white"
              suppressHydrationWarning
            >
              No reviews yet
            </h3>
            <p
              className="mx-auto mt-2 max-w-md text-sm text-slate-400"
              suppressHydrationWarning
            >
              Be the first to share your Saatvik Cars experience. Your review
              helps other buyers make a confident choice.
            </p>
            <div
              className="mt-5 flex justify-center"
              suppressHydrationWarning
            >
              <Button
                suppressHydrationWarning
                onClick={() => setFormOpen(true)}
                className="h-10 rounded-xl bg-[#D7B56D] px-6 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] transition-all"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Write the First Review
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
