'use client';

import { FileText, Phone, Search } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse the listings',
    description: 'Use the filters to find cars by make, price, fuel type or year.',
  },
  {
    icon: FileText,
    title: 'Review the details',
    description: 'Check the information and price shown on the listing.',
  },
  {
    icon: Phone,
    title: 'Contact Saatvik Cars',
    description: 'Confirm availability and arrange a showroom visit before travelling.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#0A0A0A] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            How to use the listings
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Browse, check the details and contact us about a car.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="rounded-xl border border-white/[0.06] bg-[#111827]/50 p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D7B56D]/20 bg-[#D7B56D]/10">
                <Icon className="h-5 w-5 text-[#D7B56D]" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Step {index + 1}
              </p>
              <h3 className="mt-1 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
