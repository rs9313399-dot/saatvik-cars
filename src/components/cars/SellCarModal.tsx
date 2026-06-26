'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Upload, Check, Shield, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { createCar, uploadImages } from '@/lib/api';
import {
  ALL_BRANDS,
  CAR_COLORS,
  SUNROOF_OPTIONS as SUNROOF_OPTIONS_LIB,
  FINANCE_OPTIONS as FINANCE_OPTIONS_LIB,
  TAG_OPTIONS,
} from '@/lib/business';

/* ─────────────── Constants ─────────────── */
const CHAMPAGNE = '#D7B56D';

const BRANDS = [...ALL_BRANDS];

const YEARS = Array.from({ length: 11 }, (_, i) => String(2025 - i));

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

const TRANSMISSIONS = ['Manual', 'Automatic'];

const OWNER_TYPES = ['1st Owner', '2nd Owner', '3rd Owner'];

const SUNROOF_OPTIONS = [...SUNROOF_OPTIONS_LIB];

const FINANCE_OPTIONS = [...FINANCE_OPTIONS_LIB];

const COLORS = [...CAR_COLORS];

/* Tag options for the form (excludes 'sold' — admins can't mark a new car as sold) */
const FORM_TAGS = TAG_OPTIONS.filter((t) => t.value !== 'sold');

const STEPS = [
  { label: 'Car Details', num: 1 },
  { label: 'Contact Info', num: 2 },
  { label: 'Review & Submit', num: 3 },
];

/* ─────────────── Form State Type ─────────────── */
interface FormState {
  brand: string;
  model: string;
  year: string;
  price: string;
  fuelType: string;
  transmission: string;
  kmDriven: string;
  ownerType: string;
  location: string;
  contactPhone: string;
  carNumber: string;
  color: string;
  insurance: string;
  rto: string;
  sunroof: string;
  finance: string;
  description: string;
  tags: string[];
}

const INITIAL_FORM: FormState = {
  brand: '',
  model: '',
  year: '',
  price: '',
  fuelType: '',
  transmission: '',
  kmDriven: '',
  ownerType: '',
  location: '',
  contactPhone: '',
  carNumber: '',
  color: '',
  insurance: '',
  rto: '',
  sunroof: 'No',
  finance: '',
  description: '',
  tags: [],
};

/* ─────────────── Reusable Styled Select ─────────────── */
function NativeSelect({
  value,
  onChange,
  placeholder,
  options,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        suppressHydrationWarning
        className={`h-10 w-full appearance-none rounded-lg border bg-white/[0.03] px-3 pr-9 text-sm text-white outline-none transition-all focus:ring-2 hover:border-white/15 cursor-pointer ${
          hasError
            ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'
            : 'border-white/[0.08] focus:border-[#D7B56D]/50 focus:ring-[#D7B56D]/20'
        }`}
      >
        <option value="" disabled className="bg-[#0f172a] text-slate-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0f172a] text-slate-200">
            {opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D7B56D]/60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ─────────────── Image Entry Type ─────────────── */
interface ImageEntry {
  preview: string; // object URL for local preview
  file: File; // actual file to upload
}

/* ─────────────── Main Component ─────────────── */
export default function SellCarModal() {
  const { sellModalOpen, setSellModalOpen, isAdmin, setLoginModalOpen, bumpCarListVersion } = useStore();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ImageEntry[]>([]);

  /* ── Clean up object URLs on unmount to avoid memory leaks ── */
  useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  /* ── Helpers ── */
  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const handleClose = useCallback(() => {
    setSellModalOpen(false);
  }, [setSellModalOpen]);

  /* ── ESC key closes the modal ── */
  useEffect(() => {
    if (!sellModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sellModalOpen, handleClose]);

  const resetAndClose = useCallback(() => {
    setForm(INITIAL_FORM);
    setSubmitting(false);
    setUploading(false);
    setCurrentStep(0);
    setUploadedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
    setSellModalOpen(false);
  }, [setSellModalOpen]);

  /* ── Validation ── */
  const validateStep0 = useCallback(() => {
    if (!form.brand || !form.model || !form.year || !form.price || !form.fuelType) {
      toast.error('Please fill required fields', {
        description: 'Brand, Model, Year, Price, and Fuel Type are required.',
        duration: 4000,
      });
      return false;
    }
    const priceNum = parseInt(form.price, 10);
    if (isNaN(priceNum) || priceNum < 50000) {
      toast.error('Price too low', {
        description: 'Minimum car price is ₹50,000. Enter price in rupees (e.g. 550000 = ₹5.50 L).',
        duration: 5000,
      });
      return false;
    }
    if (priceNum > 50000000) {
      toast.error('Price too high', {
        description: 'Maximum car price is ₹5 Crore. Please check the value.',
        duration: 5000,
      });
      return false;
    }
    if (form.kmDriven) {
      const kmNum = parseInt(form.kmDriven, 10);
      if (isNaN(kmNum) || kmNum < 0) {
        toast.error('Invalid KM driven', { description: 'KM driven cannot be negative.', duration: 4000 });
        return false;
      }
      if (kmNum > 500000) {
        toast.error('KM driven too high', {
          description: 'Maximum 5,00,000 km allowed. Please check the value.',
          duration: 5000,
        });
        return false;
      }
    }
    if (form.model.toLowerCase().includes(form.brand.toLowerCase())) {
      toast.error('Model name issue', {
        description: `Don't repeat the brand in the model name. You selected "${form.brand}" — just enter the model (e.g. "Nexon XZ+" not "Tata Nexon XZ+").`,
        duration: 6000,
      });
      return false;
    }
    return true;
  }, [form.brand, form.model, form.year, form.price, form.fuelType, form.kmDriven]);

  const validateStep1 = useCallback(() => {
    if (!form.location || !form.contactPhone) {
      toast.error('Please fill required fields', {
        description: 'Location and Contact Phone are required.',
        duration: 4000,
      });
      return false;
    }
    return true;
  }, [form.location, form.contactPhone]);

  const handleNext = useCallback(() => {
    if (currentStep === 0 && !validateStep0()) return;
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep((s) => s + 1);
  }, [currentStep, validateStep0, validateStep1]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => s - 1);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setSubmitting(true);

      try {
        // ── Step 1: Upload selected images (if any) to the server ──
        let imagePaths: string[] = [];
        if (uploadedImages.length > 0) {
          setUploading(true);
          try {
            imagePaths = await uploadImages(uploadedImages.map((img) => img.file));
          } catch (uploadErr) {
            const msg = uploadErr instanceof Error ? uploadErr.message : 'Failed to upload images';
            const status = uploadErr instanceof Error && 'status' in uploadErr
              ? (uploadErr as { status: number }).status
              : 0;
            if (status === 401) {
              // Session expired — guide the user to re-login.
              toast.error('Session expired', {
                description: 'Please log in again as admin. Your form data will be kept.',
                duration: 5000,
              });
              setSubmitting(false);
              setUploading(false);
              setSellModalOpen(false);
              setLoginModalOpen(true);
              return;
            }
            toast.error('Image upload failed', {
              description: msg,
              duration: 5000,
            });
            setSubmitting(false);
            setUploading(false);
            return;
          }
          setUploading(false);
        }

        // ── Step 2: Create the car with the uploaded image paths ──
        const carData = {
          name: `${form.brand} ${form.model}`,
          brand: form.brand,
          model: form.model,
          year: parseInt(form.year, 10),
          price: parseInt(form.price, 10),
          fuelType: form.fuelType,
          transmission: form.transmission,
          kmDriven: parseInt(form.kmDriven || '0', 10),
          ownerType: form.ownerType,
          location: form.location,
          description: form.description || 'No description provided',
          tags: form.tags.join(','),
          contactPhone: form.contactPhone,
          carNumber: form.carNumber,
          color: form.color,
          insurance: form.insurance,
          rto: form.rto,
          sunroof: form.sunroof || 'No',
          finance: form.finance,
          images: imagePaths,
          active: true,
        };

        await createCar(carData);

        toast.success('Car Listed Successfully!', {
          description: `${form.brand} ${form.model} has been published and is now visible in the listings.`,
          duration: 4000,
        });

        // Trigger refresh of car lists across the app
        bumpCarListVersion();

        resetAndClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to list car';
        const status = err instanceof Error && 'status' in err
          ? (err as { status: number }).status
          : 0;
        if (status === 401) {
          toast.error('Session expired', {
            description: 'Please log in again as admin, then retry.',
            duration: 5000,
          });
          setSellModalOpen(false);
          setLoginModalOpen(true);
        } else {
          toast.error(message, {
            description: 'Please check your admin login and try again.',
            duration: 4000,
          });
        }
      } finally {
        setSubmitting(false);
        setUploading(false);
      }
    },
    [form, uploadedImages, resetAndClose, bumpCarListVersion, setSellModalOpen, setLoginModalOpen]
  );

  /* ── Derived: which step-0 fields are missing ── */
  const step0Missing = !form.brand || !form.model || !form.year || !form.price || !form.fuelType;
  const step1Missing = !form.location || !form.contactPhone;

  /* ── Render ── */
  return (
    <AnimatePresence>
      {sellModalOpen && (
        <motion.div
          key="sell-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={handleClose}
        >
          <motion.div
            key="sell-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] shadow-[0_0_80px_rgba(215,181,109,0.08)]"
          >
            {/* ── Close Button ── */}
            <button
              onClick={handleClose}
              suppressHydrationWarning
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ── Admin-Only Guard ── */}
            {!isAdmin ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
                  <Lock className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin Access Required</h3>
                <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
                  Only authorized admins can list cars on Saatvik Cars. Please log in with your admin credentials to continue.
                </p>
                <Button
                  suppressHydrationWarning
                  className="h-11 rounded-xl bg-[#D7B56D] px-6 text-sm font-bold text-[#0A0A0A] hover:bg-[#E7C77B] transition-all shadow-[0_0_20px_rgba(215,181,109,0.2)]"
                  onClick={() => { handleClose(); setLoginModalOpen(true); }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Login as Admin
                </Button>
              </div>
            ) : (
              <>
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${CHAMPAGNE}, ${CHAMPAGNE}cc)`,
                    boxShadow: `0 0 20px ${CHAMPAGNE}25`,
                  }}
                >
                  <Car className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Sell Your Car</h2>
                  <p className="text-xs text-slate-400">List your car on Saatvik Cars marketplace</p>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="flex items-center gap-2 flex-1">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-all"
                      style={{
                        backgroundColor:
                          i < currentStep
                            ? `${CHAMPAGNE}25`
                            : i === currentStep
                            ? `${CHAMPAGNE}15`
                            : 'transparent',
                        color:
                          i < currentStep
                            ? CHAMPAGNE
                            : i === currentStep
                            ? CHAMPAGNE
                            : 'rgba(215,181,109,0.35)',
                        borderColor:
                          i < currentStep
                            ? `${CHAMPAGNE}60`
                            : i === currentStep
                            ? `${CHAMPAGNE}40`
                            : `${CHAMPAGNE}15`,
                      }}
                    >
                      {i < currentStep ? <Check className="h-3.5 w-3.5" /> : step.num}
                    </div>
                    <span
                      className="text-xs font-medium hidden sm:inline transition-colors"
                      style={{
                        color:
                          i < currentStep
                            ? CHAMPAGNE
                            : i === currentStep
                            ? CHAMPAGNE
                            : 'rgba(215,181,109,0.35)',
                      }}
                    >
                      {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div
                        className="flex-1 h-px mx-1 transition-colors"
                        style={{
                          backgroundColor:
                            i < currentStep ? `${CHAMPAGNE}30` : 'rgba(215,181,109,0.1)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
              {/* ═══════ Step 0: Car Details ═══════ */}
              {currentStep === 0 && (
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D7B56D] pb-2 border-b border-[#D7B56D]/15">
                    Car Details
                  </h3>

                  <div className="space-y-5">
                    {/* Brand & Model row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Brand <span className="text-red-400">*</span>
                        </label>
                        <NativeSelect
                          value={form.brand}
                          onChange={(v) => updateField('brand', v)}
                          placeholder="Select Brand"
                          options={BRANDS}
                          hasError={step0Missing && !form.brand}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Model <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. City ZX (don't include brand)"
                          value={form.model}
                          onChange={(e) => updateField('model', e.target.value)}
                          suppressHydrationWarning
                          className={`h-10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:ring-[#D7B56D]/20 ${
                            step0Missing && !form.model
                              ? 'border-red-500/50 focus:border-red-500/60'
                              : 'border-white/[0.08] focus:border-[#D7B56D]/50'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Year & Price row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Year <span className="text-red-400">*</span>
                        </label>
                        <NativeSelect
                          value={form.year}
                          onChange={(v) => updateField('year', v)}
                          placeholder="Select Year"
                          options={YEARS}
                          hasError={step0Missing && !form.year}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Price (&#x20B9;) <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g. 550000"
                          value={form.price}
                          onChange={(e) => updateField('price', e.target.value)}
                          suppressHydrationWarning
                          min={50000}
                          max={50000000}
                          className={`h-10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:ring-[#D7B56D]/20 ${
                            step0Missing && !form.price
                              ? 'border-red-500/50 focus:border-red-500/60'
                              : 'border-white/[0.08] focus:border-[#D7B56D]/50'
                          }`}
                        />
                        {form.price && parseInt(form.price, 10) > 0 && (
                          <p className="mt-1 text-[11px] text-[#D7B56D]/70" suppressHydrationWarning>
                            = &#x20B9;{parseInt(form.price, 10).toLocaleString('en-IN')}
                            {parseInt(form.price, 10) >= 100000 && ` (${(parseInt(form.price, 10) / 100000).toFixed(2)} L)`}
                            {parseInt(form.price, 10) >= 10000000 && ` (${(parseInt(form.price, 10) / 10000000).toFixed(2)} Cr)`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fuel Type & Transmission row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Fuel Type <span className="text-red-400">*</span>
                        </label>
                        <NativeSelect
                          value={form.fuelType}
                          onChange={(v) => updateField('fuelType', v)}
                          placeholder="Select Fuel Type"
                          options={FUEL_TYPES}
                          hasError={step0Missing && !form.fuelType}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Transmission
                        </label>
                        <NativeSelect
                          value={form.transmission}
                          onChange={(v) => updateField('transmission', v)}
                          placeholder="Select Transmission"
                          options={TRANSMISSIONS}
                        />
                      </div>
                    </div>

                    {/* KM Driven & Owner Type row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          KM Driven
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g. 45000"
                          value={form.kmDriven}
                          onChange={(e) => updateField('kmDriven', e.target.value)}
                          suppressHydrationWarning
                          min={0}
                          max={500000}
                          className="h-10 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-[#D7B56D]/50 focus:ring-[#D7B56D]/20"
                        />
                        {form.kmDriven && parseInt(form.kmDriven, 10) > 0 && (
                          <p className="mt-1 text-[11px] text-[#D7B56D]/70" suppressHydrationWarning>
                            = {parseInt(form.kmDriven, 10).toLocaleString('en-IN')} km
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Owner Type
                        </label>
                        <NativeSelect
                          value={form.ownerType}
                          onChange={(v) => updateField('ownerType', v)}
                          placeholder="Select Owner Type"
                          options={OWNER_TYPES}
                        />
                      </div>
                    </div>

                    {/* Vehicle Details: Colour, Insurance, RTO, Sunroof, Finance */}
                    <div className="rounded-xl border border-[#D7B56D]/15 bg-[#D7B56D]/[0.03] p-4 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#D7B56D]">
                        Vehicle Details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Colour */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-400">Colour</label>
                          <NativeSelect
                            value={form.color}
                            onChange={(v) => updateField('color', v)}
                            placeholder="Select Colour"
                            options={COLORS}
                          />
                        </div>
                        {/* RTO */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-400">RTO</label>
                          <Input
                            type="text"
                            placeholder="e.g. CG-04"
                            value={form.rto}
                            onChange={(e) => updateField('rto', e.target.value.toUpperCase())}
                            suppressHydrationWarning
                            className="h-10 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-[#D7B56D]/50 focus:ring-[#D7B56D]/20"
                          />
                        </div>
                        {/* Insurance */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-400">Insurance</label>
                          <Input
                            type="text"
                            placeholder="e.g. Valid till 03/2026"
                            value={form.insurance}
                            onChange={(e) => updateField('insurance', e.target.value)}
                            suppressHydrationWarning
                            className="h-10 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-[#D7B56D]/50 focus:ring-[#D7B56D]/20"
                          />
                        </div>
                        {/* Sunroof */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-400">Sunroof</label>
                          <NativeSelect
                            value={form.sunroof}
                            onChange={(v) => updateField('sunroof', v)}
                            placeholder="Select Sunroof"
                            options={SUNROOF_OPTIONS}
                          />
                        </div>
                        {/* Finance / Refinance */}
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-medium text-slate-400">Finance / Refinance</label>
                          <NativeSelect
                            value={form.finance}
                            onChange={(v) => updateField('finance', v)}
                            placeholder="Select Finance Option"
                            options={FINANCE_OPTIONS}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">
                        Upload Photos
                      </label>
                      <div
                        className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-8 transition-colors hover:border-[#D7B56D]/30 hover:bg-white/[0.04] cursor-pointer"
                        onClick={() => document.getElementById('car-photos')?.click()}
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${CHAMPAGNE}10`,
                            border: `1px solid ${CHAMPAGNE}20`,
                          }}
                        >
                          <Upload className="h-5 w-5" style={{ color: CHAMPAGNE }} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-300">
                            Drag & drop photos here
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            or click to browse (PNG, JPG up to 5MB each)
                          </p>
                        </div>
                        <Button
                          type="button"
                          suppressHydrationWarning
                          className="mt-1 h-8 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-xs font-medium text-slate-300 hover:bg-white/[0.1] hover:text-white transition-colors"
                          style={{ boxShadow: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('car-photos')?.click();
                          }}
                        >
                          Choose Files
                        </Button>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="car-photos"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          const newEntries: ImageEntry[] = files.map((f) => ({
                            preview: URL.createObjectURL(f),
                            file: f,
                          }));
                          setUploadedImages((prev) => {
                            const next = [...prev, ...newEntries].slice(0, 8);
                            // If we exceeded the limit, revoke the URLs that didn't make the cut
                            if (next.length < prev.length + newEntries.length) {
                              for (let i = next.length; i < prev.length + newEntries.length; i++) {
                                const entry = [...prev, ...newEntries][i];
                                if (entry) URL.revokeObjectURL(entry.preview);
                              }
                            }
                            return next;
                          });
                          // Reset the input value so selecting the same file again still triggers onChange
                          e.target.value = '';
                        }}
                      />
                      {uploadedImages.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {uploadedImages.map((entry, i) => (
                            <div
                              key={i}
                              className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-white/10"
                            >
                              <img
                                src={entry.preview}
                                alt={`Upload ${i + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(entry.preview);
                                  setUploadedImages((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  );
                                }}
                                className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 text-white/80 flex items-center justify-center"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ Step 1: Contact Info ═══════ */}
              {currentStep === 1 && (
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D7B56D] pb-2 border-b border-[#D7B56D]/15">
                    Contact Info
                  </h3>

                  <div className="space-y-5">
                    {/* Location & Phone row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Location / City <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Mumbai"
                          value={form.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          suppressHydrationWarning
                          className={`h-10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:ring-[#D7B56D]/20 ${
                            step1Missing && !form.location
                              ? 'border-red-500/50 focus:border-red-500/60'
                              : 'border-white/[0.08] focus:border-[#D7B56D]/50'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Contact Phone <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="e.g. 9644924777"
                          value={form.contactPhone}
                          onChange={(e) => updateField('contactPhone', e.target.value)}
                          suppressHydrationWarning
                          className={`h-10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:ring-[#D7B56D]/20 ${
                            step1Missing && !form.contactPhone
                              ? 'border-red-500/50 focus:border-red-500/60'
                              : 'border-white/[0.08] focus:border-[#D7B56D]/50'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Car Number / Registration */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">
                        Car Number / Registration
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. MH01AB1234"
                        value={form.carNumber}
                        onChange={(e) => updateField('carNumber', e.target.value)}
                        suppressHydrationWarning
                        className="h-10 border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-[#D7B56D]/50 focus:ring-[#D7B56D]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ Step 2: Review & Submit ═══════ */}
              {currentStep === 2 && (
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D7B56D] pb-2 border-b border-[#D7B56D]/15">
                    Review & Submit
                  </h3>

                  <div className="space-y-5">
                    {/* Review Summary */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-white">
                        {form.brand} {form.model}
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        <div>
                          <span className="text-slate-500">Year:</span>{' '}
                          <span className="text-slate-300">{form.year || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Price:</span>{' '}
                          <span className="text-slate-300">
                            {form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Fuel:</span>{' '}
                          <span className="text-slate-300">{form.fuelType || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Transmission:</span>{' '}
                          <span className="text-slate-300">{form.transmission || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">KM Driven:</span>{' '}
                          <span className="text-slate-300">
                            {form.kmDriven ? `${parseInt(form.kmDriven).toLocaleString('en-IN')} km` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Owner:</span>{' '}
                          <span className="text-slate-300">{form.ownerType || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Location:</span>{' '}
                          <span className="text-slate-300">{form.location || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Phone:</span>{' '}
                          <span className="text-slate-300">{form.contactPhone || '—'}</span>
                        </div>
                        {form.carNumber && (
                          <div className="col-span-2">
                            <span className="text-slate-500">Registration:</span>{' '}
                            <span className="text-slate-300">{form.carNumber}</span>
                          </div>
                        )}
                        <div className="col-span-2 pt-2 border-t border-white/[0.06]">
                          <span className="text-[#D7B56D]/70 text-[11px] font-semibold uppercase tracking-wider">Vehicle Details</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Colour:</span>{' '}
                          <span className="text-slate-300">{form.color || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">RTO:</span>{' '}
                          <span className="text-slate-300">{form.rto || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Insurance:</span>{' '}
                          <span className="text-slate-300">{form.insurance || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Sunroof:</span>{' '}
                          <span className="text-slate-300">{form.sunroof || 'No'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Finance:</span>{' '}
                          <span className="text-slate-300">{form.finance || '—'}</span>
                        </div>
                      </div>
                      {uploadedImages.length > 0 && (
                        <div className="pt-3 border-t border-white/[0.06]">
                          <span className="mb-2 block text-xs text-slate-500">
                            {uploadedImages.length} photo{uploadedImages.length > 1 ? 's' : ''} attached
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {uploadedImages.map((entry, i) => (
                              <div
                                key={i}
                                className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden border border-white/10"
                              >
                                <img
                                  src={entry.preview}
                                  alt={`Photo ${i + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your car's condition, features, and any additional details..."
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={4}
                        suppressHydrationWarning
                        className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-[#D7B56D]/50 focus:ring-2 focus:ring-[#D7B56D]/20 hover:border-white/15"
                      />
                    </div>

                    {/* Tags (Checkboxes) */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-400">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {FORM_TAGS.map((tag) => {
                          const isChecked = form.tags.includes(tag.value);
                          return (
                            <label
                              key={tag.value}
                              className="group flex cursor-pointer items-center gap-2"
                            >
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded border transition-all"
                                style={{
                                  backgroundColor: isChecked ? `${CHAMPAGNE}25` : 'transparent',
                                  borderColor: isChecked ? `${CHAMPAGNE}60` : 'rgba(255,255,255,0.12)',
                                  boxShadow: isChecked ? `0 0 8px ${CHAMPAGNE}20` : 'none',
                                }}
                              >
                                {isChecked && <Check className="h-3 w-3 text-[#D7B56D]" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTag(tag.value)}
                                suppressHydrationWarning
                                className="sr-only"
                              />
                              <span
                                className="text-xs font-medium transition-colors"
                                style={{
                                  color: isChecked ? CHAMPAGNE : 'rgba(148,163,184,0.8)',
                                }}
                              >
                                {tag.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* ── Sticky Bottom Button Bar ── */}
            <div className="sticky bottom-0 z-10 border-t border-white/[0.06] bg-[#0f172a] px-6 py-4 flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  onClick={handleBack}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              {currentStep < 2 ? (
                <Button
                  type="button"
                  className="bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B]"
                  onClick={handleNext}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B] disabled:opacity-60"
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploading ? 'Uploading Photos...' : 'Listing Car...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      List My Car
                    </span>
                  )}
                </Button>
              )}
            </div>

            {/* ── Admin Guard Close ── */}
              </>
            )}

            {/* ── Subtle bottom glow ── */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-3/4 rounded-full opacity-[0.06]"
              style={{
                background: `radial-gradient(ellipse at center, ${CHAMPAGNE}, transparent)`,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
