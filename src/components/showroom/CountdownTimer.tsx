'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  /** Target date as ISO string */
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(255,77,0,0.35)] bg-[#111111] text-xl font-bold tabular-nums text-white sm:h-16 sm:w-16 sm:text-2xl"
        style={{ boxShadow: '0 0 15px rgba(255,77,0,0.15), inset 0 0 10px rgba(255,77,0,0.05)' }}
      >
        <span style={{ textShadow: '0 0 10px rgba(255,77,0,0.5)' }}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D00]/60">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted pattern needed for SSR hydration safety
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // During SSR and initial hydration, render a placeholder to avoid mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3 sm:gap-4" suppressHydrationWarning>
        {['Days', 'Hours', 'Min', 'Sec'].map((label) => (
          <TimeBlock key={label} value={0} label={label} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 sm:gap-4"
      suppressHydrationWarning
    >
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="mt-[-16px] text-xl font-bold text-[#FF4D00]/60">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="mt-[-16px] text-xl font-bold text-[#FF4D00]/60">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="mt-[-16px] text-xl font-bold text-[#FF4D00]/60">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </motion.div>
  );
}
