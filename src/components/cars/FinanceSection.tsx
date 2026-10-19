'use client';

import { useId, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { calcEMI, formatEMI, formatPrice } from '@/lib/helpers';

export default function FinanceSection() {
  const priceId = useId();
  const downPaymentId = useId();
  const interestRateId = useId();
  const tenureId = useId();
  const [price, setPrice] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [annualInterestRate, setAnnualInterestRate] = useState(10);
  const [tenureMonths, setTenureMonths] = useState(60);

  const downPayment = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyPayment =
    loanAmount > 0 ? calcEMI(loanAmount, annualInterestRate, tenureMonths) : 0;
  const totalPayment = monthlyPayment * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  return (
    <section id="finance" className="bg-[#0A0A0A] py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Calculator className="mx-auto h-6 w-6 text-[#D7B56D]" aria-hidden="true" />
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Estimate a car loan payment
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Enter your own figures to estimate a monthly payment. This is a
            calculation, not a lender quote or loan approval.
          </p>
        </div>

        <div className="grid gap-6 rounded-xl border border-white/10 bg-[#111827]/60 p-5 sm:p-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor={priceId} className="text-sm text-slate-300">
                Car price (₹)
              </Label>
              <Input
                id={priceId}
                type="number"
                min={0}
                step={10000}
                value={price || ''}
                onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
                placeholder="Enter car price"
                className="border-white/10 bg-white/[0.03] text-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor={downPaymentId} className="text-sm text-slate-300">
                  Down payment
                </Label>
                <span className="text-sm text-white">{downPaymentPercent}%</span>
              </div>
              <Slider
                id={downPaymentId}
                min={0}
                max={80}
                step={1}
                value={[downPaymentPercent]}
                onValueChange={([value]) => setDownPaymentPercent(value ?? 0)}
                aria-label="Down payment percentage"
              />
              <p className="text-xs text-slate-500">
                {price > 0 ? formatPrice(downPayment) : 'Enter a car price to calculate the down payment.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor={interestRateId} className="text-sm text-slate-300">
                  Assumed annual interest rate
                </Label>
                <span className="text-sm text-white">{annualInterestRate}%</span>
              </div>
              <Slider
                id={interestRateId}
                min={0}
                max={30}
                step={0.25}
                value={[annualInterestRate]}
                onValueChange={([value]) => setAnnualInterestRate(value ?? 0)}
                aria-label="Assumed annual interest rate"
              />
              <p className="text-xs text-slate-500">
                Change this assumption to match a quote from your lender.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={tenureId} className="text-sm text-slate-300">
                Loan term
              </Label>
              <select
                id={tenureId}
                value={tenureMonths}
                onChange={(event) => setTenureMonths(Number(event.target.value))}
                className="h-10 w-full rounded-md border border-white/10 bg-[#111827] px-3 text-sm text-white"
              >
                {[12, 24, 36, 48, 60, 72, 84].map((months) => (
                  <option key={months} value={months}>
                    {months} months
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-slate-400">Estimated monthly payment</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {monthlyPayment > 0 ? formatEMI(monthlyPayment) : 'Enter a car price'}
            </p>
            {monthlyPayment > 0 && (
              <dl className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Estimated loan amount</dt>
                  <dd className="text-white">{formatPrice(loanAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Estimated total interest</dt>
                  <dd className="text-white">{formatPrice(totalInterest)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Estimated total payments</dt>
                  <dd className="text-white">{formatPrice(totalPayment)}</dd>
                </div>
              </dl>
            )}
            <p className="mt-auto pt-6 text-xs leading-relaxed text-slate-500">
              Actual rates, fees, eligibility and loan terms are set by the lender.
              Confirm them directly before making a decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
