'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Clock, User, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ──────────────────────────── types ──────────────────────────── */

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface GymClass {
  time: string;
  name: string;
  trainer: string;
  duration: string;
  difficulty: Difficulty;
}

/* ──────────────────────────── schedule data ──────────────────────────── */

const schedule: Record<string, GymClass[]> = {
  Mon: [
    { time: '6:00 AM', name: 'HIIT Blast', trainer: 'Vikram', duration: '30min', difficulty: 'Advanced' },
    { time: '7:30 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '9:00 AM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
    { time: '5:00 PM', name: 'Boxing', trainer: 'Rohit', duration: '45min', difficulty: 'Intermediate' },
    { time: '6:30 PM', name: 'Spin Class', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
    { time: '7:30 PM', name: 'CrossFit', trainer: 'Vikram', duration: '50min', difficulty: 'Advanced' },
  ],
  Tue: [
    { time: '6:00 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '8:00 AM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
    { time: '10:00 AM', name: 'Pilates', trainer: 'Ananya', duration: '45min', difficulty: 'Beginner' },
    { time: '5:00 PM', name: 'HIIT Blast', trainer: 'Vikram', duration: '30min', difficulty: 'Advanced' },
    { time: '6:30 PM', name: 'Dance Fitness', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
  ],
  Wed: [
    { time: '6:00 AM', name: 'CrossFit', trainer: 'Vikram', duration: '50min', difficulty: 'Advanced' },
    { time: '7:30 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '9:00 AM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
    { time: '4:00 PM', name: 'Boxing', trainer: 'Rohit', duration: '45min', difficulty: 'Intermediate' },
    { time: '6:00 PM', name: 'Spin Class', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
    { time: '7:30 PM', name: 'HIIT Blast', trainer: 'Vikram', duration: '30min', difficulty: 'Advanced' },
  ],
  Thu: [
    { time: '6:00 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '8:00 AM', name: 'Pilates', trainer: 'Ananya', duration: '45min', difficulty: 'Beginner' },
    { time: '10:00 AM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
    { time: '5:00 PM', name: 'CrossFit', trainer: 'Vikram', duration: '50min', difficulty: 'Advanced' },
    { time: '7:00 PM', name: 'Dance Fitness', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
  ],
  Fri: [
    { time: '6:00 AM', name: 'HIIT Blast', trainer: 'Vikram', duration: '30min', difficulty: 'Advanced' },
    { time: '7:30 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '9:00 AM', name: 'Boxing', trainer: 'Rohit', duration: '45min', difficulty: 'Intermediate' },
    { time: '5:00 PM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
    { time: '6:30 PM', name: 'Spin Class', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
  ],
  Sat: [
    { time: '7:00 AM', name: 'CrossFit', trainer: 'Vikram', duration: '50min', difficulty: 'Advanced' },
    { time: '8:30 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '45min', difficulty: 'Beginner' },
    { time: '10:00 AM', name: 'HIIT Blast', trainer: 'Vikram', duration: '30min', difficulty: 'Advanced' },
    { time: '11:00 AM', name: 'Dance Fitness', trainer: 'Neha', duration: '40min', difficulty: 'Beginner' },
  ],
  Sun: [
    { time: '8:00 AM', name: 'Yoga Flow', trainer: 'Priya', duration: '60min', difficulty: 'Beginner' },
    { time: '9:30 AM', name: 'Pilates', trainer: 'Ananya', duration: '45min', difficulty: 'Beginner' },
    { time: '11:00 AM', name: 'Strength Training', trainer: 'Arjun', duration: '60min', difficulty: 'Intermediate' },
  ],
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const difficultyColor: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

/* ──────────────────────────── animation variants ──────────────────────────── */

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const rowVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ──────────────────────────── component ──────────────────────────── */

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<string>('Mon');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const classes = schedule[activeDay] ?? [];

  return (
    <section id="schedule" className="relative py-20 bg-[#050a05]">
      {/* ── decorative glow ── */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-[400px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full opacity-[0.04] blur-[120px]"
        style={{ backgroundColor: '#10B981' }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
          suppressHydrationWarning
        >
          <Badge
            variant="outline"
            className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-widest uppercase px-4 py-1"
          >
            Weekly Schedule
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Class{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Timetable
            </span>
          </h2>
        </motion.div>

        {/* ── day tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
          suppressHydrationWarning
        >
          {days.map((day) => {
            const isActive = day === activeDay;
            return (
              <Button
                key={day}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDay(day)}
                className={
                  isActive
                    ? 'rounded-full px-5 text-xs font-semibold tracking-wide text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105'
                    : 'rounded-full px-5 text-xs font-semibold tracking-wide border-white/10 text-zinc-400 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white transition-all hover:scale-105'
                }
                style={isActive ? { backgroundColor: '#10B981' } : undefined}
              >
                {day}
              </Button>
            );
          })}
        </motion.div>

        {/* ── column headers (desktop) ── */}
        <div className="mb-3 hidden grid-cols-[100px_1fr_120px_80px_110px] gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:grid">
          <span>Time</span>
          <span>Class</span>
          <span>Trainer</span>
          <span>Duration</span>
          <span>Level</span>
        </div>

        {/* ── class list ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="flex flex-col gap-3"
            suppressHydrationWarning
          >
            {classes.map((gymClass, idx) => (
              <motion.div
                key={`${activeDay}-${idx}`}
                variants={rowVariants}
                className="
                  group
                  rounded-xl
                  border border-[rgba(16,185,129,0.08)]
                  bg-[rgba(10,15,10,0.6)]
                  backdrop-blur-md
                  p-5
                  transition-all duration-300
                  hover:border-emerald-500/30
                  hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]
                  hover:bg-[rgba(10,15,10,0.8)]
                "
                suppressHydrationWarning
              >
                {/* Mobile layout */}
                <div className="flex flex-col gap-3 lg:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-400">
                      {gymClass.time}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${difficultyColor[gymClass.difficulty]}`}
                    >
                      {gymClass.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {gymClass.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                      <User size={13} className="text-zinc-600" />
                      {gymClass.trainer}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-zinc-600" />
                      {gymClass.duration}
                    </span>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden grid-cols-[100px_1fr_120px_80px_110px] items-center gap-4 lg:grid">
                  <span className="text-sm font-semibold text-emerald-400">
                    {gymClass.time}
                  </span>
                  <span className="flex items-center gap-2 text-base font-semibold text-white">
                    <Flame
                      size={16}
                      className="text-emerald-500/40 transition-colors duration-300 group-hover:text-emerald-400"
                    />
                    {gymClass.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                    <User size={14} className="text-zinc-600" />
                    {gymClass.trainer}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                    <Clock size={14} className="text-zinc-600" />
                    {gymClass.duration}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit ${difficultyColor[gymClass.difficulty]}`}
                  >
                    {gymClass.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}

            {classes.length === 0 && (
              <div className="py-16 text-center text-zinc-500">
                No classes scheduled for this day.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
