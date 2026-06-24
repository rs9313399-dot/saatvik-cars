'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/* ─────────────── Types ─────────────── */
interface TestDriveModalProps {
  car: { id: string; name: string; brand: string } | null;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success';

/* ─────────────── Helpers ─────────────── */
/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ─────────────── Component ─────────────── */
export default function TestDriveModal({ car, onClose }: TestDriveModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const isOpen = car !== null;
  const isBusy = submitState === 'submitting';

  /* Reset form whenever a new car opens the modal */
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setEmail('');
      setPreferredDate('');
      setMessage('');
      setSubmitState('idle');
    }
  }, [isOpen, car?.id]);

  /* Lock body scroll while the modal is open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  /* ESC to close (disabled while submitting) */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isBusy, onClose]);

  const handleClose = useCallback(() => {
    if (isBusy) return;
    onClose();
  }, [isBusy, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if the click was on the overlay itself, not inside the card
      if (e.target === e.currentTarget && !isBusy) {
        onClose();
      }
    },
    [isBusy, onClose]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!car) return;

    // --- Validation ---
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }
    if (!preferredDate) {
      toast.error('Please choose a preferred date.');
      return;
    }

    setSubmitState('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_drive',
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          preferredDate,
          message: message.trim(),
          carId: car.id,
          carName: car.name,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg =
          (data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : '') ||
          'Something went wrong. Please try again.';
        throw new Error(errMsg);
      }

      setSubmitState('success');
      toast.success('Test drive booked!');
    } catch (err) {
      setSubmitState('idle');
      const msg = err instanceof Error ? err.message : 'Booking failed.';
      toast.error(msg);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && car ? (
        <motion.div
          key="test-drive-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          suppressHydrationWarning
        >
          <motion.div
            key="test-drive-card"
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            suppressHydrationWarning
          >
            {/* Decorative top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/60 to-transparent" />

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              aria-label="Close dialog"
              suppressHydrationWarning
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {submitState === 'success' ? (
              <SuccessView onClose={handleClose} />
            ) : (
              <div className="px-6 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
                {/* Header */}
                <div className="mb-6 pr-8">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D4FF]/10 ring-1 ring-[#00D4FF]/30">
                    <CalendarCheck className="h-5 w-5 text-[#00D4FF]" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Book a Test Drive
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    <span className="font-medium text-slate-200">
                      {car.brand}
                    </span>
                    {' · '}
                    <span className="text-slate-300">{car.name}</span>
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Hidden fields */}
                  <input type="hidden" name="type" value="test_drive" />
                  <input type="hidden" name="carId" value={car.id} />
                  <input type="hidden" name="carName" value={car.name} />

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="td-name"
                      className="text-slate-200"
                      suppressHydrationWarning
                    >
                      Name <span className="text-[#00D4FF]">*</span>
                    </Label>
                    <Input
                      id="td-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isBusy}
                      suppressHydrationWarning
                      className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF]/50 focus-visible:ring-[#00D4FF]/20"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="td-phone"
                      className="text-slate-200"
                      suppressHydrationWarning
                    >
                      Phone <span className="text-[#00D4FF]">*</span>
                    </Label>
                    <Input
                      id="td-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isBusy}
                      suppressHydrationWarning
                      className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF]/50 focus-visible:ring-[#00D4FF]/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="td-email"
                      className="text-slate-200"
                      suppressHydrationWarning
                    >
                      Email{' '}
                      <span className="text-slate-500">(optional)</span>
                    </Label>
                    <Input
                      id="td-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isBusy}
                      suppressHydrationWarning
                      className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF]/50 focus-visible:ring-[#00D4FF]/20"
                    />
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="td-date"
                      className="text-slate-200"
                      suppressHydrationWarning
                    >
                      Preferred Date <span className="text-[#00D4FF]">*</span>
                    </Label>
                    <Input
                      id="td-date"
                      type="date"
                      min={todayISO()}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      disabled={isBusy}
                      suppressHydrationWarning
                      className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF]/50 focus-visible:ring-[#00D4FF]/20 [color-scheme:dark]"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="td-message"
                      className="text-slate-200"
                      suppressHydrationWarning
                    >
                      Message{' '}
                      <span className="text-slate-500">(optional)</span>
                    </Label>
                    <Textarea
                      id="td-message"
                      placeholder="Any questions or preferences?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isBusy}
                      rows={3}
                      suppressHydrationWarning
                      className="min-h-[80px] resize-none border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF]/50 focus-visible:ring-[#00D4FF]/20"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isBusy}
                    suppressHydrationWarning
                    className="mt-2 h-11 w-full rounded-xl bg-[#00D4FF] text-[#0A0A0A] font-semibold text-sm shadow-lg shadow-[#00D4FF]/20 hover:bg-[#00B8E6] hover:shadow-[#00B8E6]/25 transition-all"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Test Drive'
                    )}
                  </Button>

                  <p className="pt-1 text-center text-xs text-slate-500">
                    Our team will call you within 24 hours to confirm.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ─────────────── Success sub-view ─────────────── */
function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center px-6 pb-8 pt-12 text-center sm:px-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      suppressHydrationWarning
    >
      <motion.div
        className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#00D4FF]/15 ring-1 ring-[#00D4FF]/40"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.05 }}
        suppressHydrationWarning
      >
        <Check className="h-8 w-8 text-[#00D4FF]" strokeWidth={3} />
      </motion.div>

      <h3 className="text-xl font-semibold text-white sm:text-2xl">
        Test Drive Booked!
      </h3>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
        We&apos;ll call you within 24 hours to confirm the date and time.
      </p>

      <Button
        type="button"
        onClick={onClose}
        suppressHydrationWarning
        className="mt-6 h-11 w-full max-w-xs rounded-xl bg-[#00D4FF] text-[#0A0A0A] font-semibold text-sm shadow-lg shadow-[#00D4FF]/20 hover:bg-[#00B8E6] transition-all"
      >
        Close
      </Button>
    </motion.div>
  );
}
