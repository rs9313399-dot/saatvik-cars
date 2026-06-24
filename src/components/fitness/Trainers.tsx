'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Instagram, Twitter, Star, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Trainer {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  sessions: string;
  rating: string;
  initials: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
}

const trainers: Trainer[] = [
  {
    id: 1,
    name: 'Arjun Mehta',
    specialization: 'Strength & Conditioning',
    experience: 8,
    sessions: '1,200+ Sessions',
    rating: '4.9 Rating',
    initials: 'AM',
    accentColor: '#10B981',
    accentBg: 'rgba(16,185,129,0.15)',
    accentBorder: 'rgba(16,185,129,0.3)',
    accentGlow: 'rgba(16,185,129,0.12)',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    specialization: 'Yoga & Flexibility',
    experience: 6,
    sessions: '900+ Sessions',
    rating: '4.8 Rating',
    initials: 'PS',
    accentColor: '#F43F5E',
    accentBg: 'rgba(244,63,94,0.15)',
    accentBorder: 'rgba(244,63,94,0.3)',
    accentGlow: 'rgba(244,63,94,0.12)',
  },
  {
    id: 3,
    name: 'Vikram Singh',
    specialization: 'CrossFit & HIIT',
    experience: 10,
    sessions: '2,000+ Sessions',
    rating: '5.0 Rating',
    initials: 'VS',
    accentColor: '#10B981',
    accentBg: 'rgba(16,185,129,0.15)',
    accentBorder: 'rgba(16,185,129,0.3)',
    accentGlow: 'rgba(16,185,129,0.12)',
  },
  {
    id: 4,
    name: 'Ananya Patel',
    specialization: 'Pilates & Recovery',
    experience: 5,
    sessions: '700+ Sessions',
    rating: '4.9 Rating',
    initials: 'AP',
    accentColor: '#F43F5E',
    accentBg: 'rgba(244,63,94,0.15)',
    accentBorder: 'rgba(244,63,94,0.3)',
    accentGlow: 'rgba(244,63,94,0.12)',
  },
  {
    id: 5,
    name: 'Rohit Kapoor',
    specialization: 'Boxing & MMA',
    experience: 7,
    sessions: '1,500+ Sessions',
    rating: '4.8 Rating',
    initials: 'RK',
    accentColor: '#10B981',
    accentBg: 'rgba(16,185,129,0.15)',
    accentBorder: 'rgba(16,185,129,0.3)',
    accentGlow: 'rgba(16,185,129,0.12)',
  },
  {
    id: 6,
    name: 'Neha Gupta',
    specialization: 'Dance Fitness',
    experience: 4,
    sessions: '800+ Sessions',
    rating: '4.7 Rating',
    initials: 'NG',
    accentColor: '#F43F5E',
    accentBg: 'rgba(244,63,94,0.15)',
    accentBorder: 'rgba(244,63,94,0.3)',
    accentGlow: 'rgba(244,63,94,0.12)',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative"
    >
      <div
        className="
          glass-card-fit
          relative overflow-hidden rounded-2xl
          border border-[rgba(16,185,129,0.08)]
          bg-[rgba(10,15,10,0.6)]
          backdrop-blur-md
          p-6
          transition-all duration-300
          hover:border-emerald-500/40
          hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]
          hover:-translate-y-1
          cursor-pointer
        "
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Avatar + Info */}
        <div className="relative flex flex-col items-center text-center">
          {/* Avatar circle with initials */}
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold tracking-wide transition-all duration-300 group-hover:scale-105"
            style={{
              backgroundColor: trainer.accentBg,
              color: trainer.accentColor,
              border: `2px solid ${trainer.accentBorder}`,
              boxShadow: `0 0 0 0 ${trainer.accentGlow}`,
            }}
          >
            {trainer.initials}
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {trainer.name}
          </h3>

          {/* Specialization */}
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: trainer.accentColor }}
          >
            {trainer.specialization}
          </p>

          {/* Experience */}
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <Award size={14} className="text-zinc-500" />
            {trainer.experience} years experience
          </div>
        </div>

        {/* Stat badges */}
        <div className="relative mt-5 flex items-center justify-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: trainer.accentBg,
              borderColor: trainer.accentBorder,
              color: trainer.accentColor,
            }}
            suppressHydrationWarning
          >
            <Star size={12} fill={trainer.accentColor} stroke={trainer.accentColor} />
            {trainer.rating}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium text-zinc-300"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
            suppressHydrationWarning
          >
            {trainer.sessions}
          </span>
        </div>

        {/* Social icons row */}
        <div className="relative mt-5 flex items-center justify-center gap-4">
          <a
            href="#trainers"
            className="text-zinc-500 transition-colors duration-200 hover:text-emerald-400"
            aria-label={`${trainer.name} Instagram`}
          >
            <Instagram size={18} />
          </a>
          <a
            href="#trainers"
            className="text-zinc-500 transition-colors duration-200 hover:text-emerald-400"
            aria-label={`${trainer.name} Twitter`}
          >
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Trainers() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      id="trainers"
      ref={sectionRef}
      className="relative py-20 bg-[#050a05]"
    >
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
          <Badge
            variant="outline"
            className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-widest uppercase px-4 py-1"
          >
            Expert Trainers
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Meet Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Coaches
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Certified professionals who live and breathe fitness. Our coaches bring
            expertise, passion, and personalized guidance to every single session.
          </p>
        </motion.div>

        {/* Trainer cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
