'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useId,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  TrendingUp,
  Clock,
  MessageCircle,
  Star,
  AlertCircle,
  Wrench,
  Calendar as CalendarIcon,
  Shield,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';
import { estimateCarValue } from '@/lib/valuation';
import {
  ALL_BRANDS,
  FUEL_TYPES,
  TRANSMISSIONS,
  OWNER_TYPES,
  BUSINESS,
} from '@/lib/business';

/* ─────────────────────────── Constants ─────────────────────────── */
/** Years 2025 → 2010 (16 options). valuation.ts clamps to this range. */
const YEARS = Array.from({ length: 16 }, (_, i) => 2025 - i);

const SLOTS = ['9 AM', '11 AM', '2 PM', '4 PM', '6 PM'] as const;

const MAX_PHOTOS = 10;

/** 10-digit Indian mobile (starts 6–9). */
const PHONE_RE = /^[6-9]\d{9}$/;
/** Basic email sanity. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ConditionOption {
  value: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  icon: typeof Star;
  desc: string;
  accent: string;
  ring: string;
  bg: string;
  border: string;
}

const CONDITIONS: ConditionOption[] = [
  {
    value: 'Excellent',
    icon: Star,
    desc: 'Like new — no scratches, dents, or issues',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
    bg: 'bg-emerald-500/[0.07]',
    border: 'border-emerald-500/30',
  },
  {
    value: 'Good',
    icon: Check,
    desc: 'Minor wear and tear, runs perfectly',
    accent: 'text-[#D7B56D]',
    ring: 'ring-[#D7B56D]/40',
    bg: 'bg-[#D7B56D]/[0.06]',
    border: 'border-[#D7B56D]/30',
  },
  {
    value: 'Fair',
    icon: AlertCircle,
    desc: 'Visible scratches/dents, minor repairs',
    accent: 'text-amber-400',
    ring: 'ring-amber-500/40',
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/30',
  },
  {
    value: 'Poor',
    icon: Wrench,
    desc: 'Needs significant repairs or work',
    accent: 'text-red-400',
    ring: 'ring-red-500/40',
    bg: 'bg-red-500/[0.06]',
    border: 'border-red-500/30',
  },
];

const STEP_LABELS = ['Car Details', 'Photos & Inspection', 'Contact'] as const;

/* ─────────────────────────── Helpers ─────────────────────────── */
interface PhotoEntry {
  file: File;
  url: string;
}

/** Format a Date as "Mon, 15 Jan 2025" using the user's locale. */
function formatLongDate(d: Date | undefined): string {
  if (!d) return '';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Calendar `disabled` predicate — disable past dates AND Sundays. */
function isPastOrSunday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today || date.getDay() === 0; // 0 = Sunday
}

/* ─────────────────────────── Component ─────────────────────────── */
export default function SellValuationModal() {
  const { sellValuationOpen, setSellValuationOpen } = useStore();

  /* ── Step / submit state ── */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Step 1 — Car Details ── */
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [ownerType, setOwnerType] = useState('');
  const [condition, setCondition] = useState('');

  /* ── Step 2 — Photos + Inspection ── */
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [inspectionDate, setInspectionDate] = useState<Date | undefined>(
    undefined
  );
  const [inspectionSlot, setInspectionSlot] = useState('');

  /* ── Step 3 — Contact ── */
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Stable IDs for label/id association (project convention). */
  const rid = useId();
  const idBrand = `${rid}-brand`;
  const idModel = `${rid}-model`;
  const idYear = `${rid}-year`;
  const idFuel = `${rid}-fuel`;
  const idTrans = `${rid}-trans`;
  const idKm = `${rid}-km`;
  const idOwner = `${rid}-owner`;
  const idCond = `${rid}-cond`;
  const idName = `${rid}-name`;
  const idPhone = `${rid}-phone`;
  const idEmail = `${rid}-email`;
  const idMessage = `${rid}-message`;
  const idPhotos = `${rid}-photos`;

  /* ── Live estimate (useMemo — recomputes when relevant inputs change) ── */
  const estimate = useMemo(() => {
    if (!brand || !year || !kmDriven || !condition || !ownerType) return null;
    const km = Number(kmDriven);
    if (!Number.isFinite(km) || km < 0) return null;
    return estimateCarValue({
      brand,
      model: model.trim(),
      year: Number(year),
      fuelType,
      kmDriven: km,
      ownerType,
      condition,
    });
  }, [brand, year, kmDriven, condition, ownerType, model, fuelType]);

  /* ── Body scroll lock while open ── */
  useEffect(() => {
    if (!sellValuationOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sellValuationOpen]);

  /* ── ESC to close (disabled while submitting) — defined after handleClose below ── */

  /* ── Revoke all object URLs on unmount (avoid memory leaks).
     We deliberately use `[]` deps so the cleanup only fires on unmount
     (not on every photos change, which would invalidate visible <img> URLs).
     The latest photos list is read from a ref so we always clean up what's
     actually there at unmount time. ── */
  const photosRef = useRef<PhotoEntry[]>([]);
  photosRef.current = photos;
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  /* ── Reset all state to initial ── */
  const resetState = useCallback(() => {
    setStep(1);
    setSubmitted(false);
    setLoading(false);
    setBrand('');
    setModel('');
    setYear('');
    setFuelType('');
    setTransmission('');
    setKmDriven('');
    setOwnerType('');
    setCondition('');
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    setInspectionDate(undefined);
    setInspectionSlot('');
    setCustomerName('');
    setPhone('');
    setEmail('');
    setMessage('');
  }, []);

  /* ── Close handler (resets state after exit animation) ── */
  const handleClose = useCallback(() => {
    if (loading) return;
    setSellValuationOpen(false);
    // Wait for exit animation, then reset state
    window.setTimeout(resetState, 260);
  }, [loading, setSellValuationOpen, resetState]);

  /* ── Overlay click (close when clicking outside the card) ── */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !loading) handleClose();
    },
    [loading, handleClose]
  );

  /* ── ESC to close (disabled while submitting) ── */
  useEffect(() => {
    if (!sellValuationOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sellValuationOpen, loading, handleClose]);

  /* ── Photo file handling ── */
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setPhotos((prev) => {
        const remaining = MAX_PHOTOS - prev.length;
        if (remaining <= 0) {
          toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
          return prev;
        }
        const added: PhotoEntry[] = [];
        let skipped = 0;
        for (let i = 0; i < files.length && added.length < remaining; i++) {
          const f = files[i];
          if (!f.type.startsWith('image/')) {
            skipped++;
            continue;
          }
          added.push({ file: f, url: URL.createObjectURL(f) });
        }
        if (skipped > 0) {
          toast.message(`${skipped} non-image file(s) skipped.`);
        }
        return [...prev, ...added];
      });
    },
    []
  );

  const removePhoto = useCallback((idx: number) => {
    setPhotos((prev) => {
      const item = prev[idx];
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  /* ── Step 1 validation ── */
  const canContinueStep1 = Boolean(
    brand &&
      model.trim().length > 0 &&
      year &&
      kmDriven &&
      condition &&
      ownerType
  );

  const handleContinueFrom1 = useCallback(() => {
    if (!brand) {
      toast.error('Please select a car brand.');
      return;
    }
    if (!model.trim()) {
      toast.error('Please enter the car model.');
      return;
    }
    if (!year) {
      toast.error('Please select the year.');
      return;
    }
    const km = Number(kmDriven);
    if (!Number.isFinite(km) || km < 0) {
      toast.error('Please enter a valid KM driven.');
      return;
    }
    if (km > 10_00_000) {
      toast.error('KM driven too high. Please check the value.');
      return;
    }
    if (!ownerType) {
      toast.error('Please select the owner type.');
      return;
    }
    if (!condition) {
      toast.error('Please select the car condition.');
      return;
    }
    setStep(2);
  }, [brand, model, year, kmDriven, ownerType, condition]);

  /* ── Step 2 validation ── */
  const canContinueStep2 = Boolean(inspectionDate && inspectionSlot);

  const handleContinueFrom2 = useCallback(() => {
    if (!inspectionDate) {
      toast.error('Please pick a preferred inspection date.');
      return;
    }
    if (!inspectionSlot) {
      toast.error('Please pick a preferred inspection slot.');
      return;
    }
    setStep(3);
  }, [inspectionDate, inspectionSlot]);

  /* ── Submit (step 3) ── */
  const handleSubmit = useCallback(async () => {
    // Validate contact fields
    if (!customerName.trim() || customerName.trim().length < 2) {
      toast.error('Please enter your name (at least 2 characters).');
      return;
    }
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (!PHONE_RE.test(normalizedPhone)) {
      toast.error(
        'Please enter a valid 10-digit Indian mobile (starts with 6–9).'
      );
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!estimate) {
      toast.error('Please go back and complete the car details.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sell-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: normalizedPhone,
          email: email.trim(),
          brand,
          model: model.trim(),
          year: Number(year),
          fuelType,
          transmission,
          kmDriven: Number(kmDriven),
          ownerType,
          condition,
          estimatedPrice: estimate,
          photos: photos.map((p) => p.file.name),
          inspectionDate: inspectionDate ? inspectionDate.toISOString() : '',
          inspectionSlot,
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg =
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Submission failed. Please try again.';
        throw new Error(errMsg);
      }

      setSubmitted(true);
      toast.success('Valuation request submitted!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [
    customerName,
    phone,
    email,
    estimate,
    brand,
    model,
    year,
    fuelType,
    transmission,
    kmDriven,
    ownerType,
    condition,
    photos,
    inspectionDate,
    inspectionSlot,
    message,
  ]);

  /* ── "Browse cars" — closes modal + scrolls to #cars ── */
  const handleBrowseCars = useCallback(() => {
    handleClose();
    window.setTimeout(() => {
      const el = document.getElementById('cars');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 280);
  }, [handleClose]);

  /* ── WhatsApp link (prefilled) ── */
  const waLink = useMemo(() => {
    const digits = BUSINESS.primaryPhone.replace(/\D/g, '');
    const est = estimate ? formatPrice(estimate) : 'TBD';
    const msg = `Hi, I just submitted a valuation request for my ${brand} ${model.trim()}. Estimated value: ${est}.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  }, [brand, model, estimate]);

  /* ── Back handlers ── */
  const handleBack = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }, []);

  /* ── Slide direction for step transitions ── */
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <AnimatePresence>
      {sellValuationOpen ? (
        <motion.div
          key="sell-valuation-overlay"
          className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/75 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Sell or trade your car — valuation form"
          suppressHydrationWarning
        >
          <motion.div
            key="sell-valuation-card"
            className="relative flex w-full max-w-2xl flex-col overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-black/60 sm:max-h-[92vh] sm:rounded-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            suppressHydrationWarning
          >
            {/* Decorative top accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D7B56D]/60 to-transparent" />

            {submitted ? (
              <SuccessView
                name={customerName.trim()}
                estimate={estimate}
                inspectionDate={inspectionDate}
                inspectionSlot={inspectionSlot}
                brand={brand}
                model={model.trim()}
                waLink={waLink}
                onClose={handleClose}
                onBrowseCars={handleBrowseCars}
              />
            ) : (
              <>
                {/* ── Header (sticky) ── */}
                <div className="relative shrink-0 border-b border-white/[0.06] px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close dialog"
                    suppressHydrationWarning
                    className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mb-3 flex items-center gap-3 pr-8">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D7B56D]/10 ring-1 ring-[#D7B56D]/30">
                      <Car className="h-5 w-5 text-[#D7B56D]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                        Sell / Trade Your Car
                      </h2>
                      <p className="truncate text-xs text-slate-400 sm:text-sm">
                        Get an instant valuation in 3 easy steps
                      </p>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex items-center gap-2">
                    {STEP_LABELS.map((label, idx) => {
                      const num = (idx + 1) as 1 | 2 | 3;
                      const isCurrent = step === num;
                      const isDone = step > num;
                      return (
                        <div
                          key={label}
                          className="flex flex-1 items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                                isCurrent
                                  ? 'bg-[#D7B56D] text-[#0A0A0A]'
                                  : isDone
                                    ? 'bg-[#D7B56D]/20 text-[#D7B56D]'
                                    : 'bg-white/[0.05] text-slate-500'
                              }`}
                              suppressHydrationWarning
                            >
                              {isDone ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              ) : (
                                num
                              )}
                            </div>
                            <span
                              className={`hidden text-xs font-medium sm:inline ${
                                isCurrent
                                  ? 'text-white'
                                  : isDone
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                          {idx < STEP_LABELS.length - 1 ? (
                            <div
                              className={`h-px flex-1 transition-colors ${
                                isDone ? 'bg-[#D7B56D]/40' : 'bg-white/[0.08]'
                              }`}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 sm:hidden">
                    Step {step} of 3 · {STEP_LABELS[step - 1]}
                  </p>
                </div>

                {/* ── Body (scrollable) ── */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent"
                  suppressHydrationWarning
                >
                  <AnimatePresence mode="wait" custom={1}>
                    {step === 1 ? (
                      <motion.div
                        key="step-1"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="space-y-5"
                        suppressHydrationWarning
                      >
                        <Step1Form
                          idBrand={idBrand}
                          idModel={idModel}
                          idYear={idYear}
                          idFuel={idFuel}
                          idTrans={idTrans}
                          idKm={idKm}
                          idOwner={idOwner}
                          idCond={idCond}
                          brand={brand}
                          setBrand={setBrand}
                          model={model}
                          setModel={setModel}
                          year={year}
                          setYear={setYear}
                          fuelType={fuelType}
                          setFuelType={setFuelType}
                          transmission={transmission}
                          setTransmission={setTransmission}
                          kmDriven={kmDriven}
                          setKmDriven={setKmDriven}
                          ownerType={ownerType}
                          setOwnerType={setOwnerType}
                          condition={condition}
                          setCondition={setCondition}
                          estimate={estimate}
                        />
                      </motion.div>
                    ) : step === 2 ? (
                      <motion.div
                        key="step-2"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="space-y-5"
                        suppressHydrationWarning
                      >
                        <Step2Form
                          idPhotos={idPhotos}
                          photos={photos}
                          onPickFiles={() => fileInputRef.current?.click()}
                          onFiles={handleFiles}
                          onRemove={removePhoto}
                          fileInputRef={fileInputRef}
                          inspectionDate={inspectionDate}
                          setInspectionDate={setInspectionDate}
                          inspectionSlot={inspectionSlot}
                          setInspectionSlot={setInspectionSlot}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step-3"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="space-y-5"
                        suppressHydrationWarning
                      >
                        <Step3Form
                          idName={idName}
                          idPhone={idPhone}
                          idEmail={idEmail}
                          idMessage={idMessage}
                          customerName={customerName}
                          setCustomerName={setCustomerName}
                          phone={phone}
                          setPhone={setPhone}
                          email={email}
                          setEmail={setEmail}
                          message={message}
                          setMessage={setMessage}
                          estimate={estimate}
                          brand={brand}
                          model={model}
                          year={year}
                          kmDriven={kmDriven}
                          fuelType={fuelType}
                          condition={condition}
                          inspectionDate={inspectionDate}
                          inspectionSlot={inspectionSlot}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Footer (sticky action bar) ── */}
                <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.06] bg-[#0A0A0A] px-5 py-4 sm:px-6">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      disabled={loading}
                      aria-label="Go back to previous step"
                      suppressHydrationWarning
                      className="h-11 gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : null}

                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={step === 1 ? handleContinueFrom1 : handleContinueFrom2}
                      disabled={
                        loading ||
                        (step === 1 ? !canContinueStep1 : !canContinueStep2)
                      }
                      suppressHydrationWarning
                      className="ml-auto h-11 gap-1.5 rounded-xl bg-[#D7B56D] px-5 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-[#D7B56D]/20 hover:bg-[#E7C77B] hover:shadow-[#E7C77B]/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      suppressHydrationWarning
                      className="ml-auto h-11 gap-2 rounded-xl bg-[#D7B56D] px-5 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-[#D7B56D]/20 hover:bg-[#E7C77B] hover:shadow-[#E7C77B]/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" strokeWidth={3} />
                          Submit Valuation Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ─────────────────────────── Step 1 — Car Details ─────────────────────────── */
interface Step1FormProps {
  idBrand: string;
  idModel: string;
  idYear: string;
  idFuel: string;
  idTrans: string;
  idKm: string;
  idOwner: string;
  idCond: string;
  brand: string;
  setBrand: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  fuelType: string;
  setFuelType: (v: string) => void;
  transmission: string;
  setTransmission: (v: string) => void;
  kmDriven: string;
  setKmDriven: (v: string) => void;
  ownerType: string;
  setOwnerType: (v: string) => void;
  condition: string;
  setCondition: (v: string) => void;
  estimate: number | null;
}

function Step1Form(props: Step1FormProps) {
  const {
    idBrand,
    idModel,
    idYear,
    idFuel,
    idTrans,
    idKm,
    idOwner,
    idCond,
    brand,
    setBrand,
    model,
    setModel,
    year,
    setYear,
    fuelType,
    setFuelType,
    transmission,
    setTransmission,
    kmDriven,
    setKmDriven,
    ownerType,
    setOwnerType,
    condition,
    setCondition,
    estimate,
  } = props;

  return (
    <div className="space-y-5">
      {/* Brand + Model */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={idBrand}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Brand <span className="text-[#D7B56D]">*</span>
          </Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger
              id={idBrand}
              suppressHydrationWarning
              className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm text-white data-[placeholder]:text-slate-500 hover:border-white/15 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
            >
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent
              suppressHydrationWarning
              className="z-[200] max-h-72 border-white/10 bg-[#0f172a] text-slate-200"
            >
              {ALL_BRANDS.map((b) => (
                <SelectItem
                  key={b}
                  value={b}
                  suppressHydrationWarning
                  className="focus:bg-[#D7B56D]/15 focus:text-white"
                >
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={idModel}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Model <span className="text-[#D7B56D]">*</span>
          </Label>
          <Input
            id={idModel}
            type="text"
            placeholder="e.g. Swift VXi"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            suppressHydrationWarning
            className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
          />
        </div>
      </div>

      {/* Year + Fuel */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={idYear}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Year <span className="text-[#D7B56D]">*</span>
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger
              id={idYear}
              suppressHydrationWarning
              className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm text-white data-[placeholder]:text-slate-500 hover:border-white/15 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
            >
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent
              suppressHydrationWarning
              className="z-[200] max-h-72 border-white/10 bg-[#0f172a] text-slate-200"
            >
              {YEARS.map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  suppressHydrationWarning
                  className="focus:bg-[#D7B56D]/15 focus:text-white"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={idFuel}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Fuel Type
          </Label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger
              id={idFuel}
              suppressHydrationWarning
              className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm text-white data-[placeholder]:text-slate-500 hover:border-white/15 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
            >
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent
              suppressHydrationWarning
              className="z-[200] max-h-72 border-white/10 bg-[#0f172a] text-slate-200"
            >
              {FUEL_TYPES.map((f) => (
                <SelectItem
                  key={f}
                  value={f}
                  suppressHydrationWarning
                  className="focus:bg-[#D7B56D]/15 focus:text-white"
                >
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transmission + KM */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={idTrans}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Transmission
          </Label>
          <Select value={transmission} onValueChange={setTransmission}>
            <SelectTrigger
              id={idTrans}
              suppressHydrationWarning
              className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm text-white data-[placeholder]:text-slate-500 hover:border-white/15 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
            >
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent
              suppressHydrationWarning
              className="z-[200] max-h-72 border-white/10 bg-[#0f172a] text-slate-200"
            >
              {TRANSMISSIONS.map((t) => (
                <SelectItem
                  key={t}
                  value={t}
                  suppressHydrationWarning
                  className="focus:bg-[#D7B56D]/15 focus:text-white"
                >
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={idKm}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            KM Driven <span className="text-[#D7B56D]">*</span>
          </Label>
          <Input
            id={idKm}
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="e.g. 45000"
            value={kmDriven}
            onChange={(e) => setKmDriven(e.target.value)}
            suppressHydrationWarning
            className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
          />
        </div>
      </div>

      {/* Owner Type */}
      <div className="space-y-1.5">
        <Label
          htmlFor={idOwner}
          className="text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          Owner Type <span className="text-[#D7B56D]">*</span>
        </Label>
        <Select value={ownerType} onValueChange={setOwnerType}>
          <SelectTrigger
            id={idOwner}
            suppressHydrationWarning
            className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm text-white data-[placeholder]:text-slate-500 hover:border-white/15 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
          >
            <SelectValue placeholder="Select owner type" />
          </SelectTrigger>
          <SelectContent
            suppressHydrationWarning
            className="z-[200] max-h-72 border-white/10 bg-[#0f172a] text-slate-200"
          >
            {OWNER_TYPES.map((o) => (
              <SelectItem
                key={o}
                value={o}
                suppressHydrationWarning
                className="focus:bg-[#D7B56D]/15 focus:text-white"
              >
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition (4 radio cards) */}
      <div className="space-y-2">
        <Label
          id={`${idCond}-label`}
          className="text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          Condition <span className="text-[#D7B56D]">*</span>
        </Label>
        <RadioGroup
          value={condition}
          onValueChange={setCondition}
          aria-labelledby={`${idCond}-label`}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        >
          {CONDITIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = condition === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={`${idCond}-${opt.value}`}
                className={`group flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                  selected
                    ? `${opt.border} ${opt.bg} ring-1 ${opt.ring}`
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
                suppressHydrationWarning
              >
                <RadioGroupItem
                  id={`${idCond}-${opt.value}`}
                  value={opt.value}
                  className="mt-0.5 border-white/20 text-[#D7B56D] focus-visible:ring-[#D7B56D]/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={`h-4 w-4 ${selected ? opt.accent : 'text-slate-400'}`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {opt.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Live estimate box */}
      <EstimateBox estimate={estimate} />
    </div>
  );
}

/* ─────────────────────────── Step 2 — Photos + Inspection ─────────────────────────── */
interface Step2FormProps {
  idPhotos: string;
  photos: PhotoEntry[];
  onPickFiles: () => void;
  onFiles: (files: FileList | null) => void;
  onRemove: (idx: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inspectionDate: Date | undefined;
  setInspectionDate: (d: Date | undefined) => void;
  inspectionSlot: string;
  setInspectionSlot: (s: string) => void;
}

function Step2Form(props: Step2FormProps) {
  const {
    idPhotos,
    photos,
    onPickFiles,
    onFiles,
    onRemove,
    fileInputRef,
    inspectionDate,
    setInspectionDate,
    inspectionSlot,
    setInspectionSlot,
  } = props;

  return (
    <div className="space-y-5">
      {/* ── Photo upload ── */}
      <div className="space-y-2">
        <Label
          htmlFor={idPhotos}
          className="text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          Car Photos
          <span className="ml-1 text-xs font-normal text-slate-500">
            (optional)
          </span>
        </Label>

        <input
          ref={fileInputRef}
          id={idPhotos}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(e) => {
            onFiles(e.target.files);
            // Reset the input value so the same file can be re-selected
            e.target.value = '';
          }}
          className="sr-only"
          aria-describedby={`${idPhotos}-hint`}
        />

        {/* Drop zone */}
        <button
          type="button"
          onClick={onPickFiles}
          disabled={photos.length >= MAX_PHOTOS}
          aria-label="Upload car photos"
          suppressHydrationWarning
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-6 text-center transition-colors hover:border-[#D7B56D]/40 hover:bg-[#D7B56D]/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#D7B56D]/10 ring-1 ring-[#D7B56D]/30">
            <Camera className="h-5 w-5 text-[#D7B56D]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Tap to upload photos</p>
            <p
              id={`${idPhotos}-hint`}
              className="mt-0.5 text-xs text-slate-500"
            >
              Max {MAX_PHOTOS} photos · JPG / PNG
              {photos.length > 0 ? ` · ${photos.length}/${MAX_PHOTOS} added` : ''}
            </p>
          </div>
        </button>

        {/* Thumbnails */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p, idx) => (
              <div
                key={p.url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                suppressHydrationWarning
              >
                <img
                  src={p.url}
                  alt={`Car photo ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  aria-label={`Remove photo ${idx + 1}`}
                  suppressHydrationWarning
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-red-500/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-xs text-slate-500">
          Note: Photos are stored as filenames for our team to review. The
          actual final offer is set after a physical inspection.
        </p>
      </div>

      {/* ── Inspection date ── */}
      <div className="space-y-2">
        <Label
          className="flex items-center gap-1.5 text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          <CalendarIcon className="h-4 w-4 text-[#D7B56D]" />
          Preferred Inspection Date <span className="text-[#D7B56D]">*</span>
        </Label>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:flex-row sm:items-start sm:gap-4">
          <Calendar
            mode="single"
            selected={inspectionDate}
            onSelect={setInspectionDate}
            disabled={isPastOrSunday}
            className="mx-auto bg-transparent p-0 text-white"
            classNames={{
              month: 'flex flex-col gap-3',
              month_caption:
                'flex h-9 w-full items-center justify-center text-sm font-medium text-white',
              weekdays: 'flex w-full',
              weekday:
                'flex-1 text-center text-xs font-medium text-slate-500',
              week: 'mt-1 flex w-full gap-1',
              day: 'aspect-square flex-1 p-0',
              today: 'rounded-md bg-white/[0.06] text-white',
              button_previous:
                'absolute left-1 top-1 grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white',
              button_next:
                'absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white',
            }}
          />
          <div className="w-full shrink-0 rounded-lg bg-[#D7B56D]/[0.04] p-3 text-sm sm:w-44">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Selected date
            </p>
            <p className="mt-1 font-semibold text-white">
              {inspectionDate ? formatLongDate(inspectionDate) : '—'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Sundays not available.
            </p>
          </div>
        </div>
      </div>

      {/* ── Inspection slot ── */}
      <div className="space-y-2">
        <Label
          className="flex items-center gap-1.5 text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          <Clock className="h-4 w-4 text-[#D7B56D]" />
          Preferred Inspection Slot <span className="text-[#D7B56D]">*</span>
        </Label>
        <RadioGroup
          value={inspectionSlot}
          onValueChange={setInspectionSlot}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-5"
        >
          {SLOTS.map((slot) => {
            const selected = inspectionSlot === slot;
            return (
              <label
                key={slot}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                  selected
                    ? 'border-[#D7B56D]/40 bg-[#D7B56D]/[0.08] ring-1 ring-[#D7B56D]/30'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
                suppressHydrationWarning
              >
                <RadioGroupItem
                  value={slot}
                  className="sr-only"
                  aria-label={slot}
                />
                <Clock
                  className={`h-4 w-4 ${
                    selected ? 'text-[#D7B56D]' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {slot}
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}

/* ─────────────────────────── Step 3 — Contact + Summary ─────────────────────────── */
interface Step3FormProps {
  idName: string;
  idPhone: string;
  idEmail: string;
  idMessage: string;
  customerName: string;
  setCustomerName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  estimate: number | null;
  brand: string;
  model: string;
  year: string;
  kmDriven: string;
  fuelType: string;
  condition: string;
  inspectionDate: Date | undefined;
  inspectionSlot: string;
}

function Step3Form(props: Step3FormProps) {
  const {
    idName,
    idPhone,
    idEmail,
    idMessage,
    customerName,
    setCustomerName,
    phone,
    setPhone,
    email,
    setEmail,
    message,
    setMessage,
    estimate,
    brand,
    model,
    year,
    kmDriven,
    fuelType,
    condition,
    inspectionDate,
    inspectionSlot,
  } = props;

  return (
    <div className="space-y-5">
      {/* Summary recap card */}
      <div
        className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]"
        suppressHydrationWarning
      >
        {/* Estimated value (champagne, prominent) */}
        <div className="border-b border-white/[0.06] bg-[#D7B56D]/[0.06] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#D7B56D]" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Estimated Value
              </span>
            </div>
            <span className="text-xl font-bold text-[#D7B56D]">
              {estimate ? formatPrice(estimate) : '—'}
            </span>
          </div>
        </div>

        {/* Inspection */}
        <div className="grid grid-cols-1 gap-2 px-4 py-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Inspection
            </p>
            <p className="mt-0.5 font-medium text-white">
              {inspectionDate ? formatLongDate(inspectionDate) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Slot
            </p>
            <p className="mt-0.5 font-medium text-white">
              {inspectionSlot || '—'}
            </p>
          </div>
        </div>

        {/* Car details */}
        <div className="border-t border-white/[0.06] px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Car</p>
          <p className="mt-0.5 font-medium text-white">
            {brand} {model} ({year || '—'})
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {Number(kmDriven || 0).toLocaleString('en-IN')} km
            {fuelType ? ` · ${fuelType}` : ''}
            {condition ? ` · ${condition} condition` : ''}
          </p>
        </div>
      </div>

      {/* Name + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={idName}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Name <span className="text-[#D7B56D]">*</span>
          </Label>
          <Input
            id={idName}
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            suppressHydrationWarning
            className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={idPhone}
            className="text-sm font-medium text-slate-200"
            suppressHydrationWarning
          >
            Phone <span className="text-[#D7B56D]">*</span>
          </Label>
          <Input
            id={idPhone}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            suppressHydrationWarning
            className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor={idEmail}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          Email <span className="text-xs font-normal text-slate-500">(optional)</span>
        </Label>
        <Input
          id={idEmail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          suppressHydrationWarning
          className="h-11 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label
          htmlFor={idMessage}
          className="text-sm font-medium text-slate-200"
          suppressHydrationWarning
        >
          Message{' '}
          <span className="text-xs font-normal text-slate-500">(optional)</span>
        </Label>
        <Textarea
          id={idMessage}
          placeholder="Tell us anything about your car..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          suppressHydrationWarning
          className="min-h-[80px] resize-none border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-[#D7B56D]/50 focus-visible:ring-[#D7B56D]/20"
        />
      </div>

      {/* Trust note */}
      <div
        className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-400"
        suppressHydrationWarning
      >
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D7B56D]" />
        <p>
          Your details are safe with us. We&apos;ll only use them to contact
          you about this valuation request.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Live Estimate Box ─────────────────────────── */
function EstimateBox({ estimate }: { estimate: number | null }) {
  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-xl border transition-colors ${
        estimate
          ? 'border-[#D7B56D]/30 bg-[#D7B56D]/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
      suppressHydrationWarning
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
            estimate
              ? 'bg-[#D7B56D]/15 ring-1 ring-[#D7B56D]/40'
              : 'bg-white/[0.04] ring-1 ring-white/[0.08]'
          }`}
        >
          <TrendingUp
            className={`h-5 w-5 ${
              estimate ? 'text-[#D7B56D]' : 'text-slate-500'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          {estimate ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Estimated Value
              </p>
              <motion.p
                key={estimate}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-[#D7B56D]"
                suppressHydrationWarning
              >
                {formatPrice(estimate)}
              </motion.p>
              <p className="mt-0.5 text-xs text-slate-500">
                Final offer set after physical inspection.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-300">
                Instant price estimate
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Fill car details to see your instant estimate
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── Success View ─────────────────────────── */
interface SuccessViewProps {
  name: string;
  estimate: number | null;
  inspectionDate: Date | undefined;
  inspectionSlot: string;
  brand: string;
  model: string;
  waLink: string;
  onClose: () => void;
  onBrowseCars: () => void;
}

function SuccessView(props: SuccessViewProps) {
  const {
    name,
    estimate,
    inspectionDate,
    inspectionSlot,
    brand,
    model,
    waLink,
    onClose,
    onBrowseCars,
  } = props;

  return (
    <motion.div
      className="flex flex-col items-center px-5 pb-8 pt-10 text-center sm:px-8 sm:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      suppressHydrationWarning
    >
      {/* Green check icon — animated scale-in */}
      <motion.div
        className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.05 }}
        suppressHydrationWarning
      >
        <CheckCircle2 className="h-9 w-9 text-emerald-400" strokeWidth={2.5} />
      </motion.div>

      <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Thank you{name ? `, ${name}` : ''}!
      </h3>
      <p className="mt-1.5 text-sm text-slate-400">
        Your valuation request has been received.
      </p>

      {/* Estimated value — champagne, prominent */}
      <div
        className="mt-5 w-full max-w-sm rounded-xl border border-[#D7B56D]/30 bg-[#D7B56D]/[0.06] px-4 py-4"
        suppressHydrationWarning
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Your estimated value
        </p>
        <p className="mt-1 text-3xl font-bold text-[#D7B56D]">
          {estimate ? formatPrice(estimate) : '—'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {brand} {model}
        </p>
      </div>

      {/* Inspection scheduled */}
      <div
        className="mt-3 w-full max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
        suppressHydrationWarning
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Inspection scheduled
        </p>
        <p className="mt-1 text-sm font-medium text-white">
          {inspectionDate ? formatLongDate(inspectionDate) : '—'}
          {inspectionSlot ? ` at ${inspectionSlot}` : ''}
        </p>
      </div>

      <p className="mt-4 max-w-sm text-sm text-slate-400">
        Our team will call you within{' '}
        <span className="font-medium text-white">24 hours</span> with a final
        offer.
      </p>

      {/* Actions */}
      <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#1ebe57] hover:shadow-[#1ebe57]/25"
          suppressHydrationWarning
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>

        <Button
          type="button"
          onClick={onBrowseCars}
          suppressHydrationWarning
          className="h-11 w-full gap-2 rounded-xl bg-[#D7B56D] px-5 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-[#D7B56D]/20 hover:bg-[#E7C77B] hover:shadow-[#E7C77B]/25"
        >
          <Car className="h-4 w-4" />
          Browse cars to buy
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          suppressHydrationWarning
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white"
        >
          Close
        </Button>
      </div>
    </motion.div>
  );
}
