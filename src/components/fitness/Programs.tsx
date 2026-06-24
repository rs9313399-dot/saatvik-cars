'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Zap,
  Heart,
  Flame,
  Shield,
  Bike,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Program {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  difficulty: Difficulty;
  duration: number;
  gradient: string;
  iconColor: string;
}

const programs: Program[] = [
  {
    id: 1,
    name: 'Strength Training',
    description:
      'Build raw power and lean muscle with progressive overload techniques and expert-led routines.',
    icon: Dumbbell,
    difficulty: 'Intermediate',
    duration: 60,
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)',
    iconColor: '#10B981',
  },
  {
    id: 2,
    name: 'HIIT Blast',
    description:
      'Push your limits with high-intensity intervals designed to torch calories and boost endurance.',
    icon: Zap,
    difficulty: 'Advanced',
    duration: 30,
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.25) 0%, rgba(244,63,94,0.05) 100%)',
    iconColor: '#F43F5E',
  },
  {
    id: 3,
    name: 'Yoga Flow',
    description:
      'Find balance and flexibility through guided flows that strengthen body and calm the mind.',
    icon: Heart,
    difficulty: 'Beginner',
    duration: 45,
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(251,191,36,0.10) 100%)',
    iconColor: '#10B981',
  },
  {
    id: 4,
    name: 'CrossFit',
    description:
      'Constantly varied functional movements performed at high intensity to forge elite fitness.',
    icon: Flame,
    difficulty: 'Advanced',
    duration: 50,
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.20) 0%, rgba(251,191,36,0.15) 100%)',
    iconColor: '#F43F5E',
  },
  {
    id: 5,
    name: 'Boxing',
    description:
      'Develop striking skills, footwork, and cardiovascular conditioning in the ring and on the bags.',
    icon: Shield,
    difficulty: 'Intermediate',
    duration: 45,
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(244,63,94,0.08) 100%)',
    iconColor: '#FBBF24',
  },
  {
    id: 6,
    name: 'Spin Class',
    description:
      'Climb, sprint, and ride to the beat in our immersive indoor cycling sessions for all levels.',
    icon: Bike,
    difficulty: 'Beginner',
    duration: 40,
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.30) 100%)',
    iconColor: '#10B981',
  },
];

const difficultyColor: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Programs() {
  return (
    <section
      id="programs"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      {/* Section header */}
      <div className="mx-auto max-w-7xl text-center mb-14">
        <Badge
          variant="outline"
          className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-widest uppercase px-4 py-1"
        >
          Our Programs
        </Badge>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white"
        >
          Train Your{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Way
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto"
        >
          From high-octane HIIT to restorative yoga, we have a program crafted
          for every goal and fitness level.
        </motion.p>
      </div>

      {/* Scrollable card row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="mx-auto max-w-7xl"
      >
        {/* Mobile: horizontal snap scroll — Desktop: responsive grid */}
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <motion.div
                key={program.id}
                variants={cardVariants}
                className="
                  glass-card-fit
                  group
                  flex-shrink-0 w-[85vw] sm:w-[320px]
                  lg:w-auto
                  snap-center
                  rounded-2xl
                  border border-[rgba(16,185,129,0.08)]
                  bg-[rgba(10,15,10,0.6)]
                  backdrop-blur-md
                  transition-all duration-300
                  hover:border-emerald-500/40
                  hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]
                  hover:scale-[1.02]
                  cursor-pointer
                "
              >
                {/* Gradient top portion with icon */}
                <div
                  className="relative flex items-center justify-center h-40 rounded-t-2xl overflow-hidden"
                  style={{ background: program.gradient }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                    style={{ background: program.iconColor }}
                  />
                  <div
                    className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
                    style={{ background: program.iconColor }}
                  />

                  <Icon
                    size={48}
                    className="relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: program.iconColor }}
                  />
                </div>

                {/* Card body */}
                <div className="p-6 flex flex-col gap-4">
                  {/* Program name */}
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {program.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Meta row: difficulty + duration */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${difficultyColor[program.difficulty]}`}
                    >
                      {program.difficulty}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={14} className="text-zinc-500" />
                      {program.duration} min
                    </span>
                  </div>

                  {/* Learn More link */}
                  <a
                    href="#programs"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 mt-1 transition-colors duration-200 hover:text-emerald-300 group/link"
                  >
                    Learn More
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                    />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
