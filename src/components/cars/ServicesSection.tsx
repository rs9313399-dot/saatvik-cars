'use client';

import { useState, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  Umbrella,
  FileText,
  RefreshCw,
  Car,
  CheckCircle2,
  Clock,
  IndianRupee,
  Phone,
  Banknote,
  AlertCircle,
  Calculator,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Stamp,
  Repeat,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BUSINESS } from '@/lib/business';
import { estimateCarValue } from '@/lib/valuation';

/* ------------------------------------------------------------------ */
/* Shared data                                                          */
/* ------------------------------------------------------------------ */
const INSURANCE_PARTNERS = [
  'ICICI Lombard',
  'HDFC ERGO',
  'Bajaj Allianz',
  'TATA AIG',
  'Reliance General',
  'New India Assurance',
];

const INSURANCE_TYPES = [
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    icon: ShieldCheck,
    desc: 'Covers own damage + third-party liabilities. The most complete protection for your car.',
  },
  {
    id: 'third-party',
    name: 'Third-Party',
    icon: Shield,
    desc: 'Mandatory by law. Covers damage caused to third-party people and property only.',
  },
  {
    id: 'zero-dep',
    name: 'Zero Depreciation',
    icon: Umbrella,
    desc: 'Full claim value with no depreciation deduction on parts. Best for newer cars.',
  },
] as const;

const CLAIM_STEPS = [
  { step: 1, title: 'Intimate Claim', desc: 'Call the insurer helpline to register your claim.' },
  { step: 2, title: 'Inspection', desc: 'Bring your car to our showroom for surveyor inspection.' },
  { step: 3, title: 'Document Submission', desc: 'Submit RC, policy, licence and photos.' },
  { step: 4, title: 'Repair & Settlement', desc: 'We repair your car; insurer settles the claim.' },
];

const INSURANCE_DOCS = [
  'RC copy',
  'Previous policy',
  'Driving licence',
  'Vehicle photos',
  'FIR (if accident)',
];

const RC_PROCESS_STEPS = [
  { step: 1, title: 'Agreement & Form Filling', desc: 'Sign sale agreement and fill transfer forms.' },
  { step: 2, title: 'Submit to RTO', desc: 'Forms 29 & 30 submitted to the RTO on your behalf.' },
  { step: 3, title: 'RTO Verification', desc: 'RTO verifies documents and ownership details.' },
  { step: 4, title: 'New RC Issuance', desc: 'New RC issued in your name by the RTO.' },
  { step: 5, title: 'Delivery', desc: 'New RC dispatched to your registered address.' },
];

const RC_DOCS = [
  'Original RC',
  'Form 29 & 30',
  'Sale agreement',
  'Insurance certificate',
  'PUC certificate',
  'Address proof of buyer',
  'ID proof of buyer',
  'NOC from financier (if applicable)',
];

const RC_FEES = [
  { service: 'RC Transfer Assistance', fee: '₹1,500', note: 'Included free with car purchase' },
  { service: 'Hypothecation Removal', fee: '₹1,000', note: 'After loan closure' },
  { service: 'Duplicate RC', fee: '₹2,000', note: 'If original is lost' },
  { service: 'Fast-track (7 days)', fee: '+₹2,500', note: 'Expedited processing' },
];

const RC_FAQS = [
  {
    q: 'How long does RC transfer take?',
    a: 'Standard RC transfer takes 15–30 working days depending on the RTO workload. With our fast-track service, it can be completed in 7 working days.',
  },
  {
    q: 'What if the previous owner is unavailable?',
    a: 'We collect a signed authorisation and all required forms at the time of sale, so the previous owner\'s presence is not needed later. Our team handles the entire process on your behalf.',
  },
  {
    q: 'Is RC transfer mandatory?',
    a: 'Yes. As per the Motor Vehicles Act, the RC must be transferred to the new owner within 30 days of purchase. Driving without transfer can lead to penalties and legal complications.',
  },
];

const EXCHANGE_STEPS = [
  { step: 1, title: 'Get Estimate', desc: 'Use the calculator above for an instant valuation.' },
  { step: 2, title: 'Showroom Inspection', desc: 'Visit us for a free physical inspection of your car.' },
  { step: 3, title: 'Final Offer', desc: 'We make a final offer based on the inspection.' },
  { step: 4, title: 'Drive Home Your New Car', desc: 'Adjust the value against your new purchase.' },
];

const EXCHANGE_DOCS = [
  'RC',
  'Insurance',
  'PUC',
  'ID proof',
  'Address proof',
  'NOC (if financed)',
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-7 text-center"
      suppressHydrationWarning
    >
      <span
        className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]"
        suppressHydrationWarning
      >
        <Shield className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2
        className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-white"
        suppressHydrationWarning
      >
        {title}
      </h2>
      <p
        className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base"
        suppressHydrationWarning
      >
        {subtitle}
      </p>
    </motion.div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-[#D7B56D]/30 hover:bg-[#D7B56D]/[0.03]"
      suppressHydrationWarning
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#D7B56D]/10 text-sm font-bold text-[#D7B56D]"
        suppressHydrationWarning
      >
        {step}
      </div>
      <h4 className="text-sm font-semibold text-white" suppressHydrationWarning>
        {title}
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-400" suppressHydrationWarning>
        {desc}
      </p>
    </div>
  );
}

function DocChip({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
      suppressHydrationWarning
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      <span className="text-xs text-slate-300" suppressHydrationWarning>
        {label}
      </span>
    </div>
  );
}

function SubHeading({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2" suppressHydrationWarning>
      <Icon className="h-4 w-4 text-[#D7B56D]" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white" suppressHydrationWarning>
        {title}
      </h3>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Insurance Tab (C7)                                                  */
/* ------------------------------------------------------------------ */

function PremiumCalculator() {
  const [carValue, setCarValue] = useState(500000);
  const [carAge, setCarAge] = useState(3);
  const [ccRange, setCcRange] = useState<'lt1000' | '1000-1500' | 'gt1500'>('1000-1500');
  const [insType, setInsType] = useState<'comprehensive' | 'third-party' | 'zero-dep'>('comprehensive');

  const valueId = useId();
  const ageId = useId();
  const ccId = useId();
  const typeId = useId();

  const premium = useMemo(() => {
    const safeValue = Math.max(0, carValue);
    const safeAge = Math.max(0, carAge);
    if (insType === 'comprehensive') {
      return Math.round(safeValue * 0.03 + safeAge * 2000);
    }
    if (insType === 'third-party') {
      if (ccRange === 'lt1000') return 2500;
      if (ccRange === '1000-1500') return 3500;
      return 5000;
    }
    // zero-dep
    const comp = safeValue * 0.03 + safeAge * 2000;
    return Math.round(comp + safeValue * 0.015);
  }, [carValue, carAge, ccRange, insType]);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
      suppressHydrationWarning
    >
      <SubHeading icon={Calculator} title="Premium Calculator" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={valueId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Car Value (₹)
          </Label>
          <div className="relative" suppressHydrationWarning>
            <IndianRupee className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              id={valueId}
              type="number"
              min={0}
              step={10000}
              value={carValue}
              onChange={(e) => setCarValue(Math.max(0, Number(e.target.value) || 0))}
              className="border-white/10 bg-white/[0.03] pl-9 text-sm text-white"
              suppressHydrationWarning
            />
          </div>
        </div>
        <div>
          <Label htmlFor={ageId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Car Age (years)
          </Label>
          <Input
            id={ageId}
            type="number"
            min={0}
            max={30}
            value={carAge}
            onChange={(e) => setCarAge(Math.max(0, Number(e.target.value) || 0))}
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={ccId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Engine CC
          </Label>
          <Select value={ccRange} onValueChange={(v) => setCcRange(v as typeof ccRange)}>
            <SelectTrigger
              id={ccId}
              className="w-full border-white/10 bg-white/[0.03] text-sm text-white"
              suppressHydrationWarning
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111827] text-white">
              <SelectItem value="lt1000">Up to 1000 cc</SelectItem>
              <SelectItem value="1000-1500">1000 – 1500 cc</SelectItem>
              <SelectItem value="gt1500">Above 1500 cc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={typeId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Insurance Type
          </Label>
          <Select value={insType} onValueChange={(v) => setInsType(v as typeof insType)}>
            <SelectTrigger
              id={typeId}
              className="w-full border-white/10 bg-white/[0.03] text-sm text-white"
              suppressHydrationWarning
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111827] text-white">
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
              <SelectItem value="third-party">Third-Party</SelectItem>
              <SelectItem value="zero-dep">Zero Depreciation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="mt-5 flex items-center justify-between rounded-xl border border-[#D7B56D]/20 bg-gradient-to-br from-[#D7B56D]/[0.06] to-transparent p-4"
        aria-live="polite"
        aria-atomic="true"
        suppressHydrationWarning
      >
        <div>
          <p className="text-xs font-medium text-slate-400" suppressHydrationWarning>
            Estimated premium
          </p>
          <p className="text-2xl font-bold text-[#D7B56D]" suppressHydrationWarning>
            ₹{premium.toLocaleString('en-IN')}
            <span className="ml-1 text-sm font-normal text-slate-400">/yr</span>
          </p>
        </div>
        <Shield className="h-8 w-8 text-[#D7B56D]/40" />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500" suppressHydrationWarning>
        Indicative only. Actual premium depends on insurer, IDV, add-ons, NCB and city of registration.
      </p>
    </div>
  );
}

function InsuranceQuoteForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [insType, setInsType] = useState<'comprehensive' | 'third-party' | 'zero-dep'>('comprehensive');
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const phoneId = useId();
  const carModelId = useId();
  const insTypeId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !carModel.trim()) {
      toast.error('Please fill all required fields', { duration: 4000 });
      return;
    }
    if (!/^[0-9+\-()]{7,20}$/.test(phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number', { duration: 4000 });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'insurance',
          name: name.trim(),
          phone: phone.trim(),
          email: '',
          carDetail: carModel.trim(),
          message: `Insurance type: ${insType}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Submission failed');
      toast.success('Request received! We will call you within 24 hours.', { duration: 5000 });
      setName('');
      setPhone('');
      setCarModel('');
      setInsType('comprehensive');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
      suppressHydrationWarning
    >
      <SubHeading icon={FileText} title="Request Insurance Quote" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={nameId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={phoneId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Phone <span className="text-red-400">*</span>
          </Label>
          <Input
            id={phoneId}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={carModelId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Car Model <span className="text-red-400">*</span>
          </Label>
          <Input
            id={carModelId}
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="e.g. Hyundai Creta 2020"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={insTypeId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Insurance Type
          </Label>
          <Select value={insType} onValueChange={(v) => setInsType(v as typeof insType)}>
            <SelectTrigger
              id={insTypeId}
              className="w-full border-white/10 bg-white/[0.03] text-sm text-white"
              suppressHydrationWarning
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111827] text-white">
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
              <SelectItem value="third-party">Third-Party</SelectItem>
              <SelectItem value="zero-dep">Zero Depreciation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        type="submit"
        disabled={submitting}
        suppressHydrationWarning
        className="mt-5 h-11 w-full rounded-xl bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B] transition-all disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Get Quote'}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

function InsuranceTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      suppressHydrationWarning
    >
      <p className="text-sm leading-relaxed text-slate-300 sm:text-base" suppressHydrationWarning>
        Protect your car with comprehensive insurance from our partner insurers.
      </p>

      {/* Insurance Partners */}
      <div suppressHydrationWarning>
        <SubHeading icon={ShieldCheck} title="Our Insurance Partners" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INSURANCE_PARTNERS.map((p) => (
            <div
              key={p}
              className="flex h-20 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 text-center transition-all duration-300 hover:border-[#D7B56D]/30 hover:bg-[#D7B56D]/[0.03]"
              suppressHydrationWarning
            >
              <span className="text-xs font-semibold text-slate-200 sm:text-sm" suppressHydrationWarning>
                {p}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Types of Insurance */}
      <div suppressHydrationWarning>
        <SubHeading icon={Umbrella} title="Types of Insurance" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {INSURANCE_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-[#D7B56D]/30 hover:bg-[#D7B56D]/[0.03]"
                suppressHydrationWarning
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D7B56D]/10 text-[#D7B56D]"
                  suppressHydrationWarning
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-white" suppressHydrationWarning>
                  {t.name}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400" suppressHydrationWarning>
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Calculator + Quote Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" suppressHydrationWarning>
        <PremiumCalculator />
        <InsuranceQuoteForm />
      </div>

      {/* Claim Process */}
      <div suppressHydrationWarning>
        <SubHeading icon={RefreshCw} title="Claim Process" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CLAIM_STEPS.map((s) => (
            <StepCard key={s.step} step={s.step} title={s.title} desc={s.desc} />
          ))}
        </div>
      </div>

      {/* Documents Required */}
      <div suppressHydrationWarning>
        <SubHeading icon={FileText} title="Documents Required" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INSURANCE_DOCS.map((d) => (
            <DocChip key={d} label={d} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* RC Transfer Tab (C8)                                                */
/* ------------------------------------------------------------------ */

function RCTransferTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      suppressHydrationWarning
    >
      <p className="text-sm leading-relaxed text-slate-300 sm:text-base" suppressHydrationWarning>
        We handle the complete RC transfer process for you — hassle-free.
      </p>

      {/* Process Timeline */}
      <div suppressHydrationWarning>
        <SubHeading icon={RefreshCw} title="Process Timeline" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RC_PROCESS_STEPS.map((s) => (
            <StepCard key={s.step} step={s.step} title={s.title} desc={s.desc} />
          ))}
        </div>
        <div
          className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3"
          suppressHydrationWarning
        >
          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-100/80" suppressHydrationWarning>
            Typical timeline: <span className="font-semibold text-amber-300">15–30 working days</span> from submission.
          </p>
        </div>
      </div>

      {/* Documents Required */}
      <div suppressHydrationWarning>
        <SubHeading icon={FileText} title="Documents Required" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {RC_DOCS.map((d) => (
            <DocChip key={d} label={d} />
          ))}
        </div>
      </div>

      {/* Fees Structure */}
      <div
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
        suppressHydrationWarning
      >
        <SubHeading icon={Receipt} title="Fees Structure" />
        <Table suppressHydrationWarning>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-slate-400" suppressHydrationWarning>
                Service
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-slate-400" suppressHydrationWarning>
                Fee
              </TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider text-slate-400 sm:table-cell" suppressHydrationWarning>
                Note
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RC_FEES.map((row) => (
              <TableRow
                key={row.service}
                className="border-white/[0.06] hover:bg-white/[0.02]"
              >
                <TableCell className="py-3 text-sm text-white" suppressHydrationWarning>
                  {row.service}
                  {row.note.includes('free') && (
                    <span
                      className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400"
                      suppressHydrationWarning
                    >
                      Free with car
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className="py-3 text-sm font-semibold text-amber-300"
                  suppressHydrationWarning
                >
                  {row.fee}
                </TableCell>
                <TableCell
                  className="hidden py-3 text-xs text-slate-400 sm:table-cell"
                  suppressHydrationWarning
                >
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Track application note */}
      <div
        className="flex items-start gap-3 rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/[0.04] p-4"
        suppressHydrationWarning
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D7B56D]" />
        <p className="text-xs leading-relaxed text-slate-300" suppressHydrationWarning>
          After submitting, you&apos;ll get a reference number. Call us anytime at{' '}
          <a
            href={`tel:${BUSINESS.phones[0].tel}`}
            className="font-semibold text-[#D7B56D] hover:underline"
            suppressHydrationWarning
          >
            {BUSINESS.phones[0].display}
          </a>{' '}
          to check status.
        </p>
      </div>

      {/* FAQ */}
      <div suppressHydrationWarning>
        <SubHeading icon={AlertCircle} title="Frequently Asked Questions" />
        <Accordion type="single" collapsible className="space-y-2">
          {RC_FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`rc-faq-${i}`}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4"
            >
              <AccordionTrigger
                className="text-sm font-medium text-white hover:no-underline"
                suppressHydrationWarning
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent
                className="text-xs leading-relaxed text-slate-400"
                suppressHydrationWarning
              >
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Inquiry form */}
      <RCInquiryForm />
    </motion.div>
  );
}

function RCInquiryForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carDetail, setCarDetail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const phoneId = useId();
  const carDetailId = useId();
  const messageId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !carDetail.trim()) {
      toast.error('Please fill all required fields', { duration: 4000 });
      return;
    }
    if (!/^[0-9+\-()]{7,20}$/.test(phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number', { duration: 4000 });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rc_transfer',
          name: name.trim(),
          phone: phone.trim(),
          email: '',
          carDetail: carDetail.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Submission failed');
      toast.success('Inquiry received! We will call you within 24 hours.', { duration: 5000 });
      setName('');
      setPhone('');
      setCarDetail('');
      setMessage('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
      suppressHydrationWarning
    >
      <SubHeading icon={Stamp} title="RC Transfer Inquiry" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={nameId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={phoneId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Phone <span className="text-red-400">*</span>
          </Label>
          <Input
            id={phoneId}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={carDetailId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Which car did you buy? <span className="text-red-400">*</span>
          </Label>
          <Input
            id={carDetailId}
            value={carDetail}
            onChange={(e) => setCarDetail(e.target.value)}
            placeholder="e.g. Honda City ZX MT 2021"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={messageId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Message (optional)
          </Label>
          <Textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any specific question or context..."
            className="min-h-[80px] resize-y border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={submitting}
        suppressHydrationWarning
        className="mt-5 h-11 w-full rounded-xl bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B] transition-all disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Exchange / Buyback Tab (C9)                                         */
/* ------------------------------------------------------------------ */

function ValueYourCar() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() - 3);
  const [km, setKm] = useState(40000);
  const [condition, setCondition] = useState<'Excellent' | 'Good' | 'Fair'>('Good');

  const brandId = useId();
  const modelId = useId();
  const yearId = useId();
  const kmId = useId();
  const conditionId = useId();

  const estimate = useMemo(() => {
    if (!brand || !model || !year) return null;
    return estimateCarValue({
      brand: brand.trim(),
      model: model.trim(),
      year,
      kmDriven: km,
      condition,
    });
  }, [brand, model, year, km, condition]);

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
      suppressHydrationWarning
    >
      <SubHeading icon={Calculator} title="Value Your Car" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={brandId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Brand
          </Label>
          <Input
            id={brandId}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Hyundai"
            list="exchange-brands"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
          <datalist id="exchange-brands">
            <option value="Maruti Suzuki" />
            <option value="Hyundai" />
            <option value="Tata" />
            <option value="Honda" />
            <option value="Toyota" />
            <option value="Mahindra" />
            <option value="Kia" />
            <option value="BMW" />
            <option value="Mercedes-Benz" />
            <option value="Audi" />
          </datalist>
        </div>
        <div>
          <Label htmlFor={modelId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Model
          </Label>
          <Input
            id={modelId}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Creta SX"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={yearId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Year
          </Label>
          <Input
            id={yearId}
            type="number"
            min={1990}
            max={currentYear}
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || currentYear)}
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={kmId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            KM Driven
          </Label>
          <Input
            id={kmId}
            type="number"
            min={0}
            step={1000}
            value={km}
            onChange={(e) => setKm(Math.max(0, Number(e.target.value) || 0))}
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={conditionId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Condition
          </Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
            <SelectTrigger
              id={conditionId}
              className="w-full border-white/10 bg-white/[0.03] text-sm text-white"
              suppressHydrationWarning
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111827] text-white">
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="mt-5 flex items-center justify-between rounded-xl border border-[#D7B56D]/20 bg-gradient-to-br from-[#D7B56D]/[0.06] to-transparent p-4"
        aria-live="polite"
        aria-atomic="true"
        suppressHydrationWarning
      >
        <div>
          <p className="text-xs font-medium text-slate-400" suppressHydrationWarning>
            Estimated value
          </p>
          <p className="text-2xl font-bold text-[#D7B56D]" suppressHydrationWarning>
            {estimate ? `₹${estimate.toLocaleString('en-IN')}` : '—'}
          </p>
        </div>
        <Banknote className="h-8 w-8 text-[#D7B56D]/40" />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500" suppressHydrationWarning>
        Instant indicative estimate. Final offer is subject to physical inspection at our showroom.
      </p>
    </div>
  );
}

function ExchangeInquiryForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carDetails, setCarDetails] = useState('');
  const [desiredCar, setDesiredCar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const phoneId = useId();
  const carDetailsId = useId();
  const desiredCarId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !carDetails.trim()) {
      toast.error('Please fill all required fields', { duration: 4000 });
      return;
    }
    if (!/^[0-9+\-()]{7,20}$/.test(phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number', { duration: 4000 });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exchange',
          name: name.trim(),
          phone: phone.trim(),
          email: '',
          carDetail: carDetails.trim(),
          message: desiredCar.trim() ? `Interested in: ${desiredCar.trim()}` : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Submission failed');
      toast.success('Inquiry received! We will call you within 24 hours.', { duration: 5000 });
      setName('');
      setPhone('');
      setCarDetails('');
      setDesiredCar('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
      suppressHydrationWarning
    >
      <SubHeading icon={Repeat} title="Exchange / Buyback Inquiry" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={nameId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <Label htmlFor={phoneId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Phone <span className="text-red-400">*</span>
          </Label>
          <Input
            id={phoneId}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={carDetailsId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Your Car Details <span className="text-red-400">*</span>
          </Label>
          <Textarea
            id={carDetailsId}
            value={carDetails}
            onChange={(e) => setCarDetails(e.target.value)}
            placeholder="e.g. Hyundai Creta SX 2019, 45,000 km, Diesel"
            className="min-h-[80px] resize-y border-white/10 bg-white/[0.03] text-sm text-white"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={desiredCarId} className="mb-1.5 block text-xs font-medium text-slate-400" suppressHydrationWarning>
            Car You Want to Buy (optional)
          </Label>
          <Input
            id={desiredCarId}
            value={desiredCar}
            onChange={(e) => setDesiredCar(e.target.value)}
            placeholder="e.g. Toyota Innova Crysta"
            className="border-white/10 bg-white/[0.03] text-sm text-white"
            suppressHydrationWarning
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={submitting}
        suppressHydrationWarning
        className="mt-5 h-11 w-full rounded-xl bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B] transition-all disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

function ExchangeTab() {
  const handleBrowseCars = () => {
    const el = document.getElementById('cars');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      suppressHydrationWarning
    >
      <p className="text-sm leading-relaxed text-slate-300 sm:text-base" suppressHydrationWarning>
        Upgrade to your dream car. Exchange your current car and get instant value.
      </p>

      {/* Value your car + Browse cars note */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" suppressHydrationWarning>
        <ValueYourCar />
        <div
          className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-5 sm:p-6"
          suppressHydrationWarning
        >
          <div>
            <SubHeading icon={Car} title="Exchange Options" />
            <p className="text-sm leading-relaxed text-slate-300" suppressHydrationWarning>
              Once you get your estimate, browse our inventory and your old car&apos;s
              value will be adjusted against your new purchase.
            </p>
            <div
              className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.02] p-3"
              suppressHydrationWarning
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-[11px] leading-relaxed text-slate-400" suppressHydrationWarning>
                Final exchange value is determined after a physical inspection at our showroom.
              </p>
            </div>
          </div>
          <Button
            onClick={handleBrowseCars}
            suppressHydrationWarning
            className="mt-5 h-11 w-full rounded-xl border border-[#D7B56D]/30 bg-[#D7B56D]/10 text-[#D7B56D] font-semibold hover:bg-[#D7B56D]/20 transition-all"
          >
            <Car className="mr-2 h-4 w-4" />
            Browse Cars
          </Button>
        </div>
      </div>

      {/* Process */}
      <div suppressHydrationWarning>
        <SubHeading icon={RefreshCw} title="Exchange Process" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXCHANGE_STEPS.map((s) => (
            <StepCard key={s.step} step={s.step} title={s.title} desc={s.desc} />
          ))}
        </div>
      </div>

      {/* Documents Required */}
      <div suppressHydrationWarning>
        <SubHeading icon={FileText} title="Documents Required" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXCHANGE_DOCS.map((d) => (
            <DocChip key={d} label={d} />
          ))}
        </div>
      </div>

      {/* Inquiry form */}
      <ExchangeInquiryForm />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ServicesSection() {
  const [active, setActive] = useState('insurance');

  return (
    <section id="services" className="py-10 sm:py-12 bg-[#0A0A0A]" suppressHydrationWarning>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Our Services"
          title="Beyond Just Selling Cars"
          subtitle="End-to-end services — insurance, RC transfer, and exchange/buyback — all under one roof. Sit back, we handle the paperwork."
        />

        <Tabs
          value={active}
          onValueChange={setActive}
          className="w-full"
          suppressHydrationWarning
        >
          <TabsList
            className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-white/10 bg-transparent p-0"
            suppressHydrationWarning
          >
            <TabsTrigger
              value="insurance"
              className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-slate-400 whitespace-nowrap transition-colors data-[state=active]:border-[#D7B56D] data-[state=active]:bg-transparent data-[state=active]:text-[#D7B56D] data-[state=active]:shadow-none hover:text-white sm:text-sm"
              suppressHydrationWarning
            >
              <Shield className="h-4 w-4" />
              Insurance
            </TabsTrigger>
            <TabsTrigger
              value="rc-transfer"
              className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-slate-400 whitespace-nowrap transition-colors data-[state=active]:border-[#D7B56D] data-[state=active]:bg-transparent data-[state=active]:text-[#D7B56D] data-[state=active]:shadow-none hover:text-white sm:text-sm"
              suppressHydrationWarning
            >
              <FileText className="h-4 w-4" />
              RC Transfer
            </TabsTrigger>
            <TabsTrigger
              value="exchange"
              className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-slate-400 whitespace-nowrap transition-colors data-[state=active]:border-[#D7B56D] data-[state=active]:bg-transparent data-[state=active]:text-[#D7B56D] data-[state=active]:shadow-none hover:text-white sm:text-sm"
              suppressHydrationWarning
            >
              <RefreshCw className="h-4 w-4" />
              Exchange / Buyback
            </TabsTrigger>
          </TabsList>

          <div className="pt-8">
            <TabsContent value="insurance" className="outline-none" tabIndex={-1}>
              <InsuranceTab />
            </TabsContent>
            <TabsContent value="rc-transfer" className="outline-none" tabIndex={-1}>
              <RCTransferTab />
            </TabsContent>
            <TabsContent value="exchange" className="outline-none" tabIndex={-1}>
              <ExchangeTab />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer CTA — call us */}
        <div
          className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:flex-row sm:p-6"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-3" suppressHydrationWarning>
            <Phone className="h-5 w-5 text-[#D7B56D]" />
            <div suppressHydrationWarning>
              <p className="text-sm font-semibold text-white" suppressHydrationWarning>
                Need help choosing a service?
              </p>
              <p className="text-xs text-slate-400" suppressHydrationWarning>
                Our team is available {BUSINESS.hours}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" suppressHydrationWarning>
            {BUSINESS.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7B56D]/20 bg-[#D7B56D]/10 px-3 py-2 text-xs font-semibold text-[#D7B56D] transition-colors hover:bg-[#D7B56D]/20"
                suppressHydrationWarning
              >
                <Phone className="h-3 w-3" />
                {p.display}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
