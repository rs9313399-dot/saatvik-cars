'use client';

import { useState, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Landmark,
  Calculator,
  CheckCircle2,
  FileText,
  Percent,
  TrendingDown,
  Clock,
  ShieldCheck,
  IndianRupee,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { calcEMI, formatPrice, formatEMI } from '@/lib/helpers';

// --- Static data ---

interface PartnerBank {
  name: string;
  rate: string;
  color: string;
}

const partnerBanks: PartnerBank[] = [
  { name: 'HDFC Bank', rate: '9.50%–13.00% p.a.', color: '#004C8F' },
  { name: 'ICICI Bank', rate: '9.75%–12.50% p.a.', color: '#F37E20' },
  { name: 'SBI', rate: '9.20%–11.80% p.a.', color: '#2E86AB' },
  { name: 'Axis Bank', rate: '9.90%–13.25% p.a.', color: '#97144D' },
  { name: 'Kotak Mahindra', rate: '10.00%–13.50% p.a.', color: '#ED1C24' },
  { name: 'Bajaj Finserv', rate: '11.00%–14.00% p.a.', color: '#FDB913' },
  { name: 'Tata Capital', rate: '10.50%–13.75% p.a.', color: '#1B5E20' },
  { name: 'Yes Bank', rate: '10.25%–13.50% p.a.', color: '#5E35B1' },
];

interface RateRow {
  bank: string;
  rate: string;
  maxLoan: string;
  maxTenure: string;
  fee: string;
}

const rateTableData: RateRow[] = [
  { bank: 'HDFC Bank', rate: '9.50%–13.00%', maxLoan: '₹1 Cr', maxTenure: '7 yrs', fee: 'Up to 2.5%' },
  { bank: 'ICICI Bank', rate: '9.75%–12.50%', maxLoan: '₹1 Cr', maxTenure: '7 yrs', fee: 'Up to 2.5%' },
  { bank: 'SBI', rate: '9.20%–11.80%', maxLoan: '₹1.5 Cr', maxTenure: '7 yrs', fee: 'Up to 2%' },
  { bank: 'Axis Bank', rate: '9.90%–13.25%', maxLoan: '₹1 Cr', maxTenure: '7 yrs', fee: 'Up to 2.5%' },
  { bank: 'Kotak Mahindra', rate: '10.00%–13.50%', maxLoan: '₹75 L', maxTenure: '7 yrs', fee: 'Up to 3%' },
];

interface DocItem {
  title: string;
  desc: string;
}

const documents: DocItem[] = [
  { title: 'PAN Card', desc: 'Mandatory for all loan applicants' },
  { title: 'Aadhaar Card', desc: 'Identity & address verification' },
  { title: 'Address Proof', desc: 'Voter ID / Passport / Utility Bill' },
  {
    title: 'Income Proof',
    desc: 'Last 3 months salary slips (salaried) or ITR (self-employed)',
  },
  { title: 'Bank Statements', desc: 'Last 6 months bank statements' },
  { title: 'Photographs', desc: '2 passport-size photographs' },
  { title: 'Signature Proof', desc: 'Signed specimen / banker verification' },
];

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'What is the minimum down payment?',
    a: "Typically 10–20% of the car's price. A higher down payment reduces your EMI and total interest.",
  },
  {
    q: 'Can I prepay or foreclose my loan?',
    a: 'Yes, most partner banks allow prepayment after 6–12 months. Nominal foreclosure charges (2–5%) may apply.',
  },
  {
    q: 'What credit score do I need?',
    a: 'A CIBIL score of 700+ is preferred. Lower scores may still qualify with a higher down payment or co-applicant.',
  },
  {
    q: 'How long does loan approval take?',
    a: 'Pre-approval is instant. Final disbursement takes 24–72 hours after document verification.',
  },
  {
    q: 'Can I get finance on any car?',
    a: 'We offer finance on most cars under 15 years old. Luxury and older cars may have different terms.',
  },
];

// --- Helper sub-components ---

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center"
      suppressHydrationWarning
    >
      <span
        className="inline-flex items-center gap-2 rounded-full border border-[#D7B56D]/20 bg-[#D7B56D]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D7B56D]"
        suppressHydrationWarning
      >
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2
        className="mt-4 text-2xl sm:text-3xl font-bold text-white"
        suppressHydrationWarning
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mx-auto mt-2 max-w-2xl text-sm text-slate-400 sm:text-base"
          suppressHydrationWarning
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// --- Main component ---

export default function FinanceSection() {
  // --- EMI Calculator state ---
  const [price, setPrice] = useState(800000);
  const [downPct, setDownPct] = useState(20); // 0–50 %
  const [tenure, setTenure] = useState(60); // months
  const [rate, setRate] = useState(9.5); // annual %

  // --- Eligibility form state ---
  const [form, setForm] = useState({
    name: '',
    phone: '',
    income: '',
    employment: 'Salaried',
    age: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Stable IDs for label association ---
  const priceId = useId();
  const downPctId = useId();
  const tenureId = useId();
  const rateId = useId();
  const nameId = useId();
  const phoneId = useId();
  const incomeId = useId();
  const employmentId = useId();
  const ageId = useId();

  // --- Derived EMI values ---
  const downPayment = Math.round(price * (downPct / 100));
  const loanAmount = Math.max(0, price - downPayment);
  const emi = useMemo(
    () => calcEMI(loanAmount, rate, tenure),
    [loanAmount, rate, tenure]
  );
  const totalPayable = emi * tenure;
  const totalInterest = Math.max(0, totalPayable - loanAmount);

  // --- Comparison table (3 / 5 / 7 year) ---
  const comparisonTenures = [36, 60, 84];
  const comparisonRows = comparisonTenures.map((t) => {
    const e = calcEMI(loanAmount, rate, t);
    const tp = e * t;
    const ti = Math.max(0, tp - loanAmount);
    return { tenure: t, emi: e, totalInterest: ti, totalPayable: tp };
  });
  const bestIdx = comparisonRows.reduce(
    (best, r, i) =>
      r.totalPayable < comparisonRows[best].totalPayable ? i : best,
    0
  );

  // --- Principal vs interest bar widths ---
  const principalPct =
    totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 0;
  const interestPct =
    totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  // --- Eligibility computation ---
  const incomeNum = Number(form.income) || 0;
  const ageNum = Number(form.age) || 0;
  let eligibility = 0;
  let eligibilityNote = '';
  if (incomeNum > 0) {
    if (incomeNum < 15000) {
      eligibilityNote =
        'Please contact us — minimum income criteria may apply.';
    } else if (ageNum > 0 && (ageNum < 21 || ageNum > 60)) {
      eligibilityNote = 'Applicant age must be between 21 and 60 years.';
    } else {
      const multiplier = form.employment === 'Salaried' ? 48 : 36;
      eligibility = incomeNum * multiplier;
    }
  }

  // --- Handlers ---
  const scrollToEligibility = () => {
    const el = document.getElementById('finance-eligibility');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please fill in your name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'finance',
          name: form.name.trim(),
          phone: form.phone.trim(),
          message: `Employment: ${form.employment}, Monthly Income: ₹${
            form.income || '—'
          }, Age: ${form.age || '—'}, Estimated eligibility: ${
            eligibility > 0 ? formatPrice(eligibility) : 'N/A'
          }`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Submission failed') || 'Submission failed'
        );
      }
      toast.success(
        'Application received! Our finance team will call you within 24 hours.'
      );
      setForm({
        name: '',
        phone: '',
        income: '',
        employment: 'Salaried',
        age: '',
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tenureYears = (n: number) => {
    const y = n / 12;
    return Number.isInteger(y) ? `${y} yr` : `${y.toFixed(1)} yr`;
  };

  return (
    <section id="finance" className="bg-[#0A0A0A] py-16 sm:py-20" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Section heading --- */}
        <SectionHeading
          eyebrow="Finance"
          title="Drive Now, Pay Later"
          subtitle="Easy car finance with India's leading banks. Compare rates, calculate your EMI, and get instant pre-approval — all in one place."
          icon={Landmark}
        />

        {/* --- 1. EMI Calculator + Comparison table (2-col on lg) --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* EMI Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-6"
            suppressHydrationWarning
          >
            <div className="mb-5 flex items-center gap-2" suppressHydrationWarning>
              <Calculator className="h-5 w-5 text-[#D7B56D]" />
              <h3 className="text-base font-semibold text-white" suppressHydrationWarning>
                EMI Calculator
              </h3>
            </div>

            <div className="space-y-6">
              {/* Car Price */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label
                    htmlFor={priceId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Car Price
                  </Label>
                  <span
                    className="text-sm font-bold text-white"
                    suppressHydrationWarning
                  >
                    {formatPrice(price)}
                  </span>
                </div>
                <Slider
                  id={priceId}
                  aria-label="Car price"
                  min={100000}
                  max={10000000}
                  step={50000}
                  value={[price]}
                  onValueChange={(v) => setPrice(v[0] ?? price)}
                  className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[#D7B56D] [&_[data-slot=slider-thumb]]:border-[#D7B56D] [&_[data-slot=slider-thumb]]:bg-[#0A0A0A]"
                  suppressHydrationWarning
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400" suppressHydrationWarning>
                  <span>₹1L</span>
                  <span>₹1 Cr</span>
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label
                    htmlFor={downPctId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Down Payment
                  </Label>
                  <span
                    className="text-sm font-bold text-white"
                    suppressHydrationWarning
                  >
                    {downPct}% · {formatPrice(downPayment)}
                  </span>
                </div>
                <Slider
                  id={downPctId}
                  aria-label="Down payment percentage"
                  min={0}
                  max={50}
                  step={5}
                  value={[downPct]}
                  onValueChange={(v) => setDownPct(v[0] ?? downPct)}
                  className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[#D7B56D] [&_[data-slot=slider-thumb]]:border-[#D7B56D] [&_[data-slot=slider-thumb]]:bg-[#0A0A0A]"
                  suppressHydrationWarning
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400" suppressHydrationWarning>
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label
                    htmlFor={tenureId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Loan Tenure
                  </Label>
                  <span
                    className="text-sm font-bold text-white"
                    suppressHydrationWarning
                  >
                    {tenure} months · {tenureYears(tenure)}
                  </span>
                </div>
                <Slider
                  id={tenureId}
                  aria-label="Loan tenure in months"
                  min={12}
                  max={84}
                  step={6}
                  value={[tenure]}
                  onValueChange={(v) => setTenure(v[0] ?? tenure)}
                  className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[#D7B56D] [&_[data-slot=slider-thumb]]:border-[#D7B56D] [&_[data-slot=slider-thumb]]:bg-[#0A0A0A]"
                  suppressHydrationWarning
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400" suppressHydrationWarning>
                  <span>1 yr</span>
                  <span>7 yrs</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label
                    htmlFor={rateId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Interest Rate
                  </Label>
                  <span
                    className="text-sm font-bold text-white"
                    suppressHydrationWarning
                  >
                    {rate.toFixed(2)}% p.a.
                  </span>
                </div>
                <Slider
                  id={rateId}
                  aria-label="Interest rate percent per annum"
                  min={7}
                  max={15}
                  step={0.25}
                  value={[rate]}
                  onValueChange={(v) => setRate(v[0] ?? rate)}
                  className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[#D7B56D] [&_[data-slot=slider-thumb]]:border-[#D7B56D] [&_[data-slot=slider-thumb]]:bg-[#0A0A0A]"
                  suppressHydrationWarning
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400" suppressHydrationWarning>
                  <span>7%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EMI Result card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-[#D7B56D]/20 bg-gradient-to-br from-[#D7B56D]/[0.06] to-transparent p-6"
            suppressHydrationWarning
          >
            <div className="mb-5 flex items-center gap-2" suppressHydrationWarning>
              <IndianRupee className="h-5 w-5 text-[#D7B56D]" />
              <h3 className="text-base font-semibold text-white" suppressHydrationWarning>
                Your Monthly EMI
              </h3>
            </div>

            {/* Live EMI display - aria-live for screen readers */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="mb-5"
              suppressHydrationWarning
            >
              <p
                className="text-4xl font-bold text-[#D7B56D] sm:text-5xl"
                suppressHydrationWarning
              >
                {formatEMI(emi)}
                <span
                  className="ml-1 text-sm font-medium text-slate-500"
                  suppressHydrationWarning
                >
                  /mo
                </span>
              </p>
              <p
                className="mt-2 text-xs text-slate-500"
                suppressHydrationWarning
              >
                for {tenure} months at {rate.toFixed(2)}% p.a.
              </p>
            </div>

            {/* Principal vs interest bar */}
            <div className="mb-4" suppressHydrationWarning>
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5"
                role="img"
                aria-label={`Principal ${principalPct.toFixed(
                  0
                )} percent, Interest ${interestPct.toFixed(0)} percent`}
                suppressHydrationWarning
              >
                <div
                  className="h-full bg-[#D7B56D] transition-all duration-300"
                  style={{ width: `${principalPct}%` }}
                  suppressHydrationWarning
                />
                <div
                  className="h-full bg-slate-600 transition-all duration-300"
                  style={{ width: `${interestPct}%` }}
                  suppressHydrationWarning
                />
              </div>
              <div
                className="mt-2 flex items-center justify-between text-[11px]"
                suppressHydrationWarning
              >
                <span className="flex items-center gap-1.5 text-slate-400" suppressHydrationWarning>
                  <span className="h-2 w-2 rounded-full bg-[#D7B56D]" suppressHydrationWarning />
                  Principal {formatPrice(loanAmount)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400" suppressHydrationWarning>
                  <span className="h-2 w-2 rounded-full bg-slate-600" suppressHydrationWarning />
                  Interest {formatPrice(totalInterest)}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div
              className="space-y-2 border-t border-white/[0.06] pt-4"
              suppressHydrationWarning
            >
              <div className="flex items-center justify-between" suppressHydrationWarning>
                <span className="text-xs text-slate-400" suppressHydrationWarning>Loan Amount</span>
                <span className="text-sm font-medium text-white" suppressHydrationWarning>{formatPrice(loanAmount)}</span>
              </div>
              <div className="flex items-center justify-between" suppressHydrationWarning>
                <span className="text-xs text-slate-400" suppressHydrationWarning>Total Interest</span>
                <span className="text-sm font-medium text-white" suppressHydrationWarning>{formatPrice(totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2" suppressHydrationWarning>
                <span className="text-xs text-slate-400" suppressHydrationWarning>Total Payable</span>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{formatPrice(totalPayable)}</span>
              </div>
            </div>

            <Button
              suppressHydrationWarning
              className="mt-5 h-11 w-full bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B]"
              onClick={scrollToEligibility}
            >
              Apply for Finance
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.02] p-3" suppressHydrationWarning>
              <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D7B56D]/60" />
              <p className="text-[11px] leading-relaxed text-slate-500" suppressHydrationWarning>
                Indicative only. Actual EMI depends on bank approval, credit
                score, and processing fees.
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- 2. 3/5/7 Year comparison table --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/50"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] p-5" suppressHydrationWarning>
            <Clock className="h-5 w-5 text-[#D7B56D]" />
            <h3 className="text-base font-semibold text-white" suppressHydrationWarning>
              Tenure Comparison — 3 / 5 / 7 Years
            </h3>
          </div>

          <div className="overflow-x-auto" suppressHydrationWarning>
            <Table className="min-w-[640px]" suppressHydrationWarning>
              <TableHeader suppressHydrationWarning>
                <TableRow className="border-white/[0.06] hover:bg-transparent" suppressHydrationWarning>
                  <TableHead className="text-slate-400" suppressHydrationWarning>&nbsp;</TableHead>
                  {comparisonRows.map((r, i) => (
                    <TableHead
                      key={r.tenure}
                      className={`text-center align-bottom ${
                        i === bestIdx ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                      suppressHydrationWarning
                    >
                      <div className="flex flex-col items-center gap-1" suppressHydrationWarning>
                        {i === bestIdx && (
                          <span
                            className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400"
                            suppressHydrationWarning
                          >
                            Best Value
                          </span>
                        )}
                        <span className="text-sm font-bold text-white" suppressHydrationWarning>
                          {r.tenure / 12} Years
                        </span>
                        <span className="text-[10px] font-normal text-slate-500" suppressHydrationWarning>
                          ({r.tenure} months)
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody suppressHydrationWarning>
                <TableRow className="border-white/[0.06]" suppressHydrationWarning>
                  <TableCell className="text-xs font-medium text-slate-400" suppressHydrationWarning>EMI / month</TableCell>
                  {comparisonRows.map((r, i) => (
                    <TableCell
                      key={`emi-${r.tenure}`}
                      className={`text-center text-sm font-semibold ${
                        i === bestIdx ? 'text-emerald-400' : 'text-white'
                      }`}
                      suppressHydrationWarning
                    >
                      {formatEMI(r.emi)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-white/[0.06]" suppressHydrationWarning>
                  <TableCell className="text-xs font-medium text-slate-400" suppressHydrationWarning>Total Interest</TableCell>
                  {comparisonRows.map((r, i) => (
                    <TableCell
                      key={`ti-${r.tenure}`}
                      className={`text-center text-sm ${
                        i === bestIdx
                          ? 'text-emerald-300/90'
                          : 'text-slate-200'
                      }`}
                      suppressHydrationWarning
                    >
                      {formatPrice(r.totalInterest)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-white/[0.06]" suppressHydrationWarning>
                  <TableCell className="text-xs font-medium text-slate-400" suppressHydrationWarning>Total Payable</TableCell>
                  {comparisonRows.map((r, i) => (
                    <TableCell
                      key={`tp-${r.tenure}`}
                      className={`text-center text-sm font-bold ${
                        i === bestIdx ? 'text-emerald-400' : 'text-white'
                      }`}
                      suppressHydrationWarning
                    >
                      {formatPrice(r.totalPayable)}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Highlight ring row */}
                <TableRow className="border-white/[0.06] hover:bg-transparent" suppressHydrationWarning>
                  <TableCell className="text-[10px] text-slate-400" suppressHydrationWarning>&nbsp;</TableCell>
                  {comparisonRows.map((r, i) => (
                    <TableCell
                      key={`hl-${r.tenure}`}
                      className="p-0"
                      suppressHydrationWarning
                    >
                      <div
                        className={`mx-2 mb-2 h-1 rounded-full ${
                          i === bestIdx ? 'bg-emerald-400' : 'bg-transparent'
                        }`}
                        suppressHydrationWarning
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.02] px-5 py-3" suppressHydrationWarning>
            <p className="text-[11px] text-slate-500" suppressHydrationWarning>
              Based on loan amount <span className="font-medium text-slate-300" suppressHydrationWarning>{formatPrice(loanAmount)}</span> at <span className="font-medium text-slate-300" suppressHydrationWarning>{rate.toFixed(2)}% p.a.</span>
            </p>
            <span className="hidden items-center gap-1.5 text-[11px] text-emerald-400 sm:flex" suppressHydrationWarning>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Lowest total payable highlighted
            </span>
          </div>
        </motion.div>

        {/* --- 3. Partner banks grid --- */}
        <div className="mt-14" suppressHydrationWarning>
          <SectionHeading
            eyebrow="Partner Banks"
            title="Trusted by India's Leading Lenders"
            subtitle="We've partnered with 8 top banks and NBFCs to bring you the most competitive car loan offers."
            icon={Landmark}
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" suppressHydrationWarning>
            {partnerBanks.map((bank, i) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group flex flex-col rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5 transition-all hover:border-white/[0.12] hover:bg-[#111827]"
                suppressHydrationWarning
              >
                {/* Text-based bank logo */}
                <div
                  className="mb-4 flex h-16 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]"
                  suppressHydrationWarning
                >
                  <span
                    className="text-lg font-extrabold tracking-tight"
                    style={{ color: bank.color }}
                    suppressHydrationWarning
                  >
                    {bank.name}
                  </span>
                </div>

                <div className="flex flex-1 flex-col" suppressHydrationWarning>
                  <div className="flex items-center gap-1.5" suppressHydrationWarning>
                    <Percent className="h-3.5 w-3.5 text-[#D7B56D]/70" />
                    <span
                      className="text-xs font-medium text-slate-400"
                      suppressHydrationWarning
                    >
                      Interest Rate
                    </span>
                  </div>
                  <p
                    className="mt-1 text-sm font-bold text-white"
                    suppressHydrationWarning
                  >
                    {bank.rate}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  suppressHydrationWarning
                  onClick={scrollToEligibility}
                  className="mt-4 h-8 w-full justify-center border border-white/[0.06] text-xs font-medium text-slate-300 hover:bg-[#D7B56D]/10 hover:text-[#D7B56D]"
                >
                  Get Quote
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- 4. Interest rates table --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/50"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] p-5" suppressHydrationWarning>
            <FileText className="h-5 w-5 text-[#D7B56D]" />
            <h3 className="text-base font-semibold text-white" suppressHydrationWarning>
              Detailed Interest Rates
            </h3>
          </div>

          <div className="overflow-x-auto" suppressHydrationWarning>
            <Table className="min-w-[640px]" suppressHydrationWarning>
              <TableHeader suppressHydrationWarning>
                <TableRow className="border-white/[0.06] hover:bg-transparent" suppressHydrationWarning>
                  <TableHead className="text-slate-400" suppressHydrationWarning>Bank</TableHead>
                  <TableHead className="text-slate-400" suppressHydrationWarning>Interest Rate (p.a.)</TableHead>
                  <TableHead className="text-slate-400" suppressHydrationWarning>Max Loan</TableHead>
                  <TableHead className="text-slate-400" suppressHydrationWarning>Max Tenure</TableHead>
                  <TableHead className="text-slate-400" suppressHydrationWarning>Processing Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody suppressHydrationWarning>
                {rateTableData.map((row) => (
                  <TableRow
                    key={row.bank}
                    className="border-white/[0.06]"
                    suppressHydrationWarning
                  >
                    <TableCell className="font-medium text-white" suppressHydrationWarning>{row.bank}</TableCell>
                    <TableCell className="text-[#D7B56D]" suppressHydrationWarning>{row.rate}</TableCell>
                    <TableCell className="text-slate-300" suppressHydrationWarning>{row.maxLoan}</TableCell>
                    <TableCell className="text-slate-300" suppressHydrationWarning>{row.maxTenure}</TableCell>
                    <TableCell className="text-slate-300" suppressHydrationWarning>{row.fee}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* --- 5. Eligibility check form --- */}
        <motion.div
          id="finance-eligibility"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 scroll-mt-24"
          suppressHydrationWarning
        >
          <SectionHeading
            eyebrow="Eligibility Check"
            title="Check Your Loan Eligibility Instantly"
            subtitle="Fill in your details to see your estimated eligible loan amount — no paperwork required."
            icon={ShieldCheck}
          />

          <div className="mx-auto max-w-md" suppressHydrationWarning>
            <div
              className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-6"
              suppressHydrationWarning
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                suppressHydrationWarning
              >
                <div className="space-y-1.5" suppressHydrationWarning>
                  <Label
                    htmlFor={nameId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Full Name
                  </Label>
                  <Input
                    id={nameId}
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className="h-10 border-white/[0.08] bg-white/[0.02] text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D] focus-visible:ring-[#D7B56D]/20"
                    suppressHydrationWarning
                  />
                </div>

                <div className="space-y-1.5" suppressHydrationWarning>
                  <Label
                    htmlFor={phoneId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Phone Number
                  </Label>
                  <Input
                    id={phoneId}
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    required
                    className="h-10 border-white/[0.08] bg-white/[0.02] text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D] focus-visible:ring-[#D7B56D]/20"
                    suppressHydrationWarning
                  />
                </div>

                <div className="grid grid-cols-2 gap-3" suppressHydrationWarning>
                  <div className="space-y-1.5" suppressHydrationWarning>
                    <Label
                      htmlFor={incomeId}
                      className="text-xs font-medium text-slate-400"
                      suppressHydrationWarning
                    >
                      Monthly Income (₹)
                    </Label>
                    <Input
                      id={incomeId}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="50000"
                      value={form.income}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, income: e.target.value }))
                      }
                      className="h-10 border-white/[0.08] bg-white/[0.02] text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D] focus-visible:ring-[#D7B56D]/20"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-1.5" suppressHydrationWarning>
                    <Label
                      htmlFor={ageId}
                      className="text-xs font-medium text-slate-400"
                      suppressHydrationWarning
                    >
                      Age
                    </Label>
                    <Input
                      id={ageId}
                      type="number"
                      min={18}
                      max={70}
                      inputMode="numeric"
                      placeholder="30"
                      value={form.age}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, age: e.target.value }))
                      }
                      className="h-10 border-white/[0.08] bg-white/[0.02] text-white placeholder:text-slate-400 focus-visible:border-[#D7B56D] focus-visible:ring-[#D7B56D]/20"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-1.5" suppressHydrationWarning>
                  <Label
                    htmlFor={employmentId}
                    className="text-xs font-medium text-slate-400"
                    suppressHydrationWarning
                  >
                    Employment Type
                  </Label>
                  <Select
                    value={form.employment}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, employment: v }))
                    }
                  >
                    <SelectTrigger
                      id={employmentId}
                      className="h-10 w-full border-white/[0.08] bg-white/[0.02] text-white data-[placeholder]:text-slate-400 focus-visible:border-[#D7B56D] focus-visible:ring-[#D7B56D]/20"
                      suppressHydrationWarning
                    >
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-[#111827] text-white" suppressHydrationWarning>
                      <SelectItem value="Salaried" suppressHydrationWarning>Salaried</SelectItem>
                      <SelectItem value="Self-Employed" suppressHydrationWarning>Self-Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Eligibility result */}
                <div
                  className="rounded-xl border border-[#D7B56D]/20 bg-[#D7B56D]/[0.04] p-4"
                  aria-live="polite"
                  aria-atomic="true"
                  suppressHydrationWarning
                >
                  <p
                    className="text-xs font-medium uppercase tracking-wide text-slate-400"
                    suppressHydrationWarning
                  >
                    Eligible Loan Amount
                  </p>
                  {eligibility > 0 ? (
                    <p
                      className="mt-1 text-2xl font-bold text-[#D7B56D]"
                      suppressHydrationWarning
                    >
                      up to {formatPrice(eligibility)}
                    </p>
                  ) : eligibilityNote ? (
                    <p
                      className="mt-1 text-sm font-medium text-amber-400"
                      suppressHydrationWarning
                    >
                      {eligibilityNote}
                    </p>
                  ) : (
                    <p
                      className="mt-1 text-sm text-slate-500"
                      suppressHydrationWarning
                    >
                      Enter your income and age to see eligibility.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  suppressHydrationWarning
                  className="h-11 w-full bg-[#D7B56D] text-[#0A0A0A] font-bold hover:bg-[#E7C77B] disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Apply Now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* --- 6. Documents required --- */}
        <div className="mt-14" suppressHydrationWarning>
          <SectionHeading
            eyebrow="Documents"
            title="Documents Required for Car Finance"
            subtitle="Keep these documents ready for a smooth and quick loan approval."
            icon={FileText}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
            {documents.map((doc, i) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#111827]/50 p-4"
                suppressHydrationWarning
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#D7B56D]"
                />
                <div className="flex-1" suppressHydrationWarning>
                  <p
                    className="text-sm font-semibold text-white"
                    suppressHydrationWarning
                  >
                    {doc.title}
                  </p>
                  <p
                    className="mt-0.5 text-xs leading-relaxed text-slate-400"
                    suppressHydrationWarning
                  >
                    {doc.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- 7. Finance FAQ --- */}
        <div className="mt-14" suppressHydrationWarning>
          <SectionHeading
            eyebrow="FAQ"
            title="Finance Frequently Asked Questions"
            subtitle="Everything you need to know about car loans at Saatvik Cars."
            icon={Calculator}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-[#111827]/50 px-5"
            suppressHydrationWarning
          >
            <Accordion
              type="single"
              collapsible
              defaultValue="faq-0"
              className="w-full"
            >
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  value={`faq-${i}`}
                  className="border-white/[0.06]"
                  suppressHydrationWarning
                >
                  <AccordionTrigger
                    className="py-4 text-left text-sm font-medium text-white hover:no-underline hover:text-[#D7B56D] data-[state=open]:text-[#D7B56D]"
                    suppressHydrationWarning
                  >
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-[13px] leading-relaxed text-slate-400"
                    suppressHydrationWarning
                  >
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
