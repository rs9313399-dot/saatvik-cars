'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

interface ScrollRevealProps {
  /** Animation direction. Defaults to 'up'. */
  direction?: AnimationDirection;
  /** Delay before animation starts (seconds). Defaults to 0. */
  delay?: number;
  /** Animation duration (seconds). Defaults to 0.5. */
  duration?: number;
  /** Additional CSS classes for the wrapper. */
  className?: string;
  /** Content to animate. */
  children: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function getInitialVariants(direction: AnimationDirection) {
  const base = { opacity: 0 };

  switch (direction) {
    case 'up':
      return { ...base, y: 40 };
    case 'down':
      return { ...base, y: -40 };
    case 'left':
      return { ...base, x: -40 };
    case 'right':
      return { ...base, x: 40 };
    case 'scale':
      return { ...base, scale: 0.95 };
    case 'fade':
    default:
      return base;
  }
}

export default function ScrollReveal({
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className,
  children,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={getInitialVariants(direction)}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: EASE,
        },
      }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
}
