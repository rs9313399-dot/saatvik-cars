'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

/* ─────────────── Neon Orange Color Constants ─────────────── */
const NEON = '#FF4D00';
const NEON_LIGHT = '#FF6B2B';
const NEON_DARK = '#CC3D00';

/* ─────────────── Particle System ─────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  tint: number; // 0 = orange, 1 = silver
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.1,
      tint: Math.random() > 0.3 ? 0 : 1, // 70% orange, 30% silver
    });
  }
  return particles;
}

/* ─────────────── Speed Lines ─────────────── */
interface SpeedLine {
  id: number;
  y: number;
  width: number;
  delay: number;
  duration: number;
  side: 'left' | 'right';
  angle: number; // diagonal angle
  opacity: number;
}

function generateSpeedLines(count: number): SpeedLine[] {
  const lines: SpeedLine[] = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      id: i,
      y: Math.random() * 100,
      width: Math.random() * 35 + 15,
      delay: Math.random() * 1.5 + 0.3,
      duration: Math.random() * 0.6 + 0.3,
      side: Math.random() > 0.5 ? 'left' : 'right',
      angle: Math.random() * 20 - 10, // -10 to +10 degrees for diagonal
      opacity: Math.random() * 0.4 + 0.3,
    });
  }
  return lines;
}

/* ─────────────── Diagonal Speed Lines (replacing car silhouette) ─────────────── */
interface DiagonalLine {
  id: number;
  startX: number;
  startY: number;
  length: number;
  angle: number;
  delay: number;
  duration: number;
  thickness: number;
}

function generateDiagonalLines(count: number): DiagonalLine[] {
  const lines: DiagonalLine[] = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      id: i,
      startX: Math.random() * 100 - 50, // start off-center
      startY: Math.random() * 100,
      length: Math.random() * 60 + 30,
      angle: -25 - Math.random() * 20, // aggressive diagonal (-25 to -45 degrees)
      delay: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 0.5 + 0.3,
      thickness: Math.random() * 2 + 0.5,
    });
  }
  return lines;
}

/* ─────────────── Main Component ─────────────── */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  // Only generate random data on the client (after mount) to avoid hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([]);
  const [speedLines, setSpeedLines] = useState<SpeedLine[]>([]);
  const [diagonalLines, setDiagonalLines] = useState<DiagonalLine[]>([]);

  /* ── Generate random data on client only ── */
  useEffect(() => {
    setParticles(generateParticles(70));
    setSpeedLines(generateSpeedLines(16));
    setDiagonalLines(generateDiagonalLines(8));
  }, []);

  /* ── Typewriter for "UTOELITE" ── */
  const [typedSuffix, setTypedSuffix] = useState('');
  const typeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const text = 'UTOELITE';
    let i = 0;
    const startDelay = 400;
    const charDelay = 55;

    const startTyping = () => {
      if (i < text.length) {
        setTypedSuffix(text.slice(0, i + 1));
        i++;
        typeTimerRef.current = setTimeout(startTyping, charDelay);
      }
    };

    typeTimerRef.current = setTimeout(startTyping, startDelay);
    return () => {
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    };
  }, []);

  /* ── Progress bar simulation ── */
  useEffect(() => {
    const steps = [
      { target: 18, delay: 300 },
      { target: 35, delay: 450 },
      { target: 52, delay: 400 },
      { target: 70, delay: 350 },
      { target: 84, delay: 300 },
      { target: 94, delay: 250 },
      { target: 100, delay: 250 },
    ];

    let totalDelay = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step) => {
      totalDelay += step.delay;
      timeouts.push(
        setTimeout(() => setProgress(step.target), totalDelay)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  /* ── Fade out & fire onComplete ── */
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsVisible(false), 2400);
    const completeTimer = setTimeout(() => onCompleteRef.current(), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black"
        >
          {/* ── Radial Vignette ── */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 45%, transparent 0%, rgba(0,0,0,0.3) 100%)',
            }}
          />

          {/* ── Neon Orange Ambient Glow ── */}
          <motion.div
            className="pointer-events-none absolute"
            style={{
              width: 700,
              height: 700,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                `radial-gradient(circle, ${NEON}15 0%, ${NEON}08 30%, transparent 70%)`,
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />

          {/* ── Particles (client-only, neon orange tinted) ── */}
          <div className="pointer-events-none absolute inset-0">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.tint === 0
                    ? `rgba(255, 77, 0, ${p.opacity * 0.8})`
                    : `rgba(192, 192, 192, ${p.opacity * 0.5})`,
                  boxShadow: p.size > 1.5
                    ? `0 0 ${p.size * 3}px rgba(255, 77, 0, ${p.opacity * 0.4})`
                    : 'none',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, p.opacity, 0],
                  scale: [0, 1, 0.5],
                  y: [0, -40, -80],
                  x: p.tint === 0 ? [0, Math.random() * 20 - 10] : [0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ── Speed Lines (client-only, neon orange) ── */}
          <div className="pointer-events-none absolute inset-0">
            {speedLines.map((line) => (
              <motion.div
                key={line.id}
                className="absolute"
                style={{
                  top: `${line.y}%`,
                  [line.side === 'left' ? 'left' : 'right']: 0,
                  height: 1,
                  background: `linear-gradient(${
                    line.side === 'left' ? 'to right' : 'to left'
                  }, ${NEON}${Math.round(line.opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
                  transform: `rotate(${line.angle}deg)`,
                  transformOrigin: line.side === 'left' ? 'left center' : 'right center',
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${line.width}%`, opacity: [0, line.opacity, 0] }}
                transition={{
                  duration: line.duration,
                  delay: line.delay,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* ── Center Content ── */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* ── "AE" Monogram with Neon Orange Glow + Typewriter ── */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotateY: -90, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  rotateY: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                }}
                className="relative"
              >
                {/* Neon glow behind "AE" */}
                <motion.div
                  className="absolute inset-0 blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${NEON}60, ${NEON}20, transparent)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6] }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                />
                {/* Inner intense glow */}
                <motion.div
                  className="absolute inset-0 blur-lg"
                  style={{
                    background: `radial-gradient(circle, ${NEON_LIGHT}40, transparent)`,
                  }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span
                  className="relative text-7xl font-black tracking-tighter sm:text-8xl"
                  style={{
                    color: NEON,
                    textShadow: `0 0 20px ${NEON}80, 0 0 40px ${NEON}40, 0 0 80px ${NEON}20`,
                  }}
                  suppressHydrationWarning
                >
                  AE
                </span>
              </motion.div>

              {/* ── Typewriter for "UTOELITE" ── */}
              <motion.span
                className="text-5xl font-black tracking-tight sm:text-6xl"
                style={{
                  color: '#E0E0E0',
                  textShadow: `0 0 10px rgba(255,77,0,0.15)`,
                }}
                suppressHydrationWarning
              >
                {typedSuffix}
                {/* Cursor blink */}
                {typedSuffix.length < 8 && (
                  <motion.span
                    className="inline-block ml-0.5"
                    style={{
                      width: 3,
                      height: '0.8em',
                      backgroundColor: NEON,
                      verticalAlign: 'middle',
                      boxShadow: `0 0 8px ${NEON}80`,
                    }}
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                )}
              </motion.span>
            </div>

            {/* ── Aggressive Diagonal Speed Lines (replacing car silhouette) ── */}
            <motion.div
              className="relative h-16 w-full max-w-sm overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {/* Center track line */}
              <motion.div
                className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2"
                style={{
                  background: `linear-gradient(to right, transparent, ${NEON}20, ${NEON}40, ${NEON}20, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
              {/* Diagonal speed lines */}
              {diagonalLines.map((line) => (
                <motion.div
                  key={line.id}
                  className="absolute"
                  style={{
                    left: `${line.startX}%`,
                    top: `${line.startY}%`,
                    height: line.thickness,
                    background: `linear-gradient(${line.angle >= -35 ? 155 : 160}deg, ${NEON}CC, ${NEON}40, transparent)`,
                    transform: `rotate(${line.angle}deg)`,
                    transformOrigin: 'left center',
                    boxShadow: `0 0 6px ${NEON}40`,
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${line.length}%`, opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: line.duration,
                    delay: line.delay,
                    repeat: Infinity,
                    repeatDelay: 1.0,
                    ease: 'easeOut',
                  }}
                />
              ))}
              {/* Flash streak */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-[2px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${NEON}, ${NEON_LIGHT}, transparent)`,
                  boxShadow: `0 0 12px ${NEON}80, 0 0 24px ${NEON}40`,
                  left: 0,
                }}
                initial={{ width: '0%', x: '-10%' }}
                animate={{ width: '60%', x: ['0%', '150%'] }}
                transition={{
                  duration: 0.8,
                  delay: 0.8,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </motion.div>

            {/* ── Progress Bar (Neon Orange with glow) ── */}
            <motion.div
              className="w-64 sm:w-80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div
                className="relative h-[3px] w-full overflow-hidden rounded-full"
                style={{ backgroundColor: 'rgba(255,77,0,0.1)' }}
              >
                {/* Glow track behind bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: `${NEON}20`,
                    boxShadow: `0 0 12px ${NEON}40`,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {/* Main progress fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: NEON,
                    boxShadow: `0 0 10px ${NEON}80, 0 0 20px ${NEON}40`,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {/* Shimmer overlay */}
                <motion.div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    width: '40%',
                    background: `linear-gradient(to right, transparent, ${NEON_LIGHT}80, transparent)`,
                    boxShadow: `0 0 8px ${NEON_LIGHT}60`,
                  }}
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
              {/* Percentage */}
              <motion.p
                className="mt-3 text-center font-bold tracking-[0.4em] uppercase"
                style={{
                  fontSize: 10,
                  color: NEON,
                  textShadow: `0 0 8px ${NEON}40`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                suppressHydrationWarning
              >
                {progress}%
              </motion.p>
            </motion.div>

            {/* ── Tagline ── */}
            <motion.p
              className="mt-1 text-center font-black tracking-[0.3em] uppercase"
              style={{
                fontSize: 11,
                color: '#808080',
                letterSpacing: '0.35em',
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              suppressHydrationWarning
            >
              POWER. PRECISION. PERFORMANCE.
            </motion.p>
          </div>

          {/* ── Bottom Decorative Line (neon orange) ── */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${NEON}30, ${NEON}15, transparent)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
          />

          {/* ── Top accent line ── */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${NEON}20, ${NEON}10, transparent)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
