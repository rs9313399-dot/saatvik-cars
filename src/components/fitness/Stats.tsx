'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Award, Calendar, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  { target: 5000, suffix: '+', label: 'Active Members', icon: Users },
  { target: 50, suffix: '+', label: 'Expert Trainers', icon: Award },
  { target: 200, suffix: '+', label: 'Weekly Classes', icon: Calendar },
  { target: 15, suffix: '+', label: 'Years Experience', icon: Clock },
];

function useCountUp(target: number, isActive: boolean, duration: number = 2000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, isActive, duration]);

  return count;
}

function StatCard({ stat, index, isActive }: { stat: StatItem; index: number; isActive: boolean }) {
  const count = useCountUp(stat.target, isActive);
  const Icon = stat.icon;

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      className="group relative"
    >
      <div
        className="
          relative overflow-hidden rounded-2xl
          bg-white/[0.04] backdrop-blur-xl
          border border-white/[0.08]
          p-8 text-center
          transition-all duration-300
          hover:bg-white/[0.07] hover:border-emerald-500/20
          hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]
        "
      >
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Icon */}
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors duration-300 group-hover:bg-emerald-500/20">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>

        {/* Number */}
        <div
          className="relative mb-2 text-4xl font-extrabold tracking-tight text-emerald-400 md:text-5xl"
          suppressHydrationWarning
        >
          {formatNumber(count)}
          <span className="text-emerald-400">{stat.suffix}</span>
        </div>

        {/* Label */}
        <p className="relative text-sm font-medium uppercase tracking-wider text-gray-400">
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-20 md:py-28"
    >
      {/* Emerald gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-900/10 to-[#050a05]" />
      <div className="absolute inset-0 bg-[#050a05]/80" />

      {/* Decorative radial glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Our Impact in{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Numbers
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            A decade and a half of transforming lives through fitness. Here&apos;s what drives us every day.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={index}
              isActive={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
