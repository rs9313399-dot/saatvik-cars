'use client';

import { useState, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calcEMI, formatPrice } from '@/lib/helpers';
import { BUSINESS } from '@/lib/business';

export default function EMICalculator() {
  const [price, setPrice] = useState(800000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenure, setTenure] = useState(60); // months
  const [rate, setRate] = useState(9.5); // annual %

  // Stable unique IDs for label/input association
  const priceId = useId();
  const downId = useId();
  const tenureId = useId();
  const rateId = useId();

  const loanAmount = Math.max(0, price - downPayment);
  const emi = useMemo(() => calcEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);
  const totalPayable = emi * tenure;
  const totalInterest = Math.max(0, totalPayable - loanAmount);

  const tenureYears = (tenure / 12).toFixed(tenure % 12 === 0 ? 0 : 1);

  const handleApplyFinance = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="emi" className="py-12 bg-[#0A0A0A]" suppressHydrationWarning>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
          suppressHydrationWarning
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#00D4FF]" suppressHydrationWarning>
            <Calculator className="h-3.5 w-3.5" />
            EMI Calculator
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white" suppressHydrationWarning>
            Plan Your Car Loan
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base" suppressHydrationWarning>
            Estimate your monthly EMI before you buy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-6 space-y-6"
            suppressHydrationWarning
          >
            {/* Car Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={priceId} className="text-xs font-medium text-slate-400" suppressHydrationWarning>Car Price</label>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{formatPrice(price)}</span>
              </div>
              <input
                id={priceId}
                type="range"
                min={100000}
                max={10000000}
                step={50000}
                value={price}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPrice(v);
                  if (downPayment > v * 0.9) setDownPayment(Math.round(v * 0.2));
                }}
                suppressHydrationWarning
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#00D4FF]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>₹1L</span>
                <span>₹1Cr</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={downId} className="text-xs font-medium text-slate-400" suppressHydrationWarning>Down Payment</label>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{formatPrice(downPayment)}</span>
              </div>
              <input
                id={downId}
                type="range"
                min={0}
                max={Math.round(price * 0.9)}
                step={10000}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                suppressHydrationWarning
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#00D4FF]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>₹0</span>
                <span>90% of price</span>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={tenureId} className="text-xs font-medium text-slate-400" suppressHydrationWarning>Loan Tenure</label>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{tenureYears} year{tenureYears !== '1' ? 's' : ''}</span>
              </div>
              <input
                id={tenureId}
                type="range"
                min={12}
                max={84}
                step={12}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                suppressHydrationWarning
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#00D4FF]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>1 yr</span>
                <span>7 yrs</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={rateId} className="text-xs font-medium text-slate-400" suppressHydrationWarning>Interest Rate</label>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{rate.toFixed(1)}% p.a.</span>
              </div>
              <input
                id={rateId}
                type="range"
                min={7}
                max={15}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                suppressHydrationWarning
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#00D4FF]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>7%</span>
                <span>15%</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#00D4FF]/[0.06] to-transparent p-6 flex flex-col justify-center"
            suppressHydrationWarning
          >
            {/* Monthly EMI — aria-live announces updates to screen readers */}
            <div className="mb-6" aria-live="polite" aria-atomic="true">
              <p className="text-xs font-medium text-slate-400 mb-1" suppressHydrationWarning>Your Monthly EMI</p>
              <p className="text-4xl font-bold text-[#00D4FF]" suppressHydrationWarning>
                ₹{emi.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] text-slate-500" suppressHydrationWarning>for {tenureYears} year{tenureYears !== '1' ? 's' : ''} at {rate.toFixed(1)}% p.a.</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400" suppressHydrationWarning>Loan Amount</span>
                <span className="text-sm font-medium text-white" suppressHydrationWarning>{formatPrice(loanAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400" suppressHydrationWarning>Total Interest</span>
                <span className="text-sm font-medium text-white" suppressHydrationWarning>{formatPrice(totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-xs text-slate-400" suppressHydrationWarning>Total Payable</span>
                <span className="text-sm font-bold text-white" suppressHydrationWarning>{formatPrice(totalPayable)}</span>
              </div>
            </div>

            {/* Apply for Finance CTA */}
            <Button
              suppressHydrationWarning
              className="mt-5 h-11 w-full rounded-xl bg-[#00D4FF] text-[#0A0A0A] font-bold hover:bg-[#00B8E6] transition-all"
              onClick={handleApplyFinance}
            >
              Apply for Finance
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Note */}
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
              <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00D4FF]/60" />
              <p className="text-[11px] leading-relaxed text-slate-500" suppressHydrationWarning>
                Indicative only. Actual EMI depends on bank approval, credit score, and processing fees. Contact us at {BUSINESS.phones[0].display} for finance assistance.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
