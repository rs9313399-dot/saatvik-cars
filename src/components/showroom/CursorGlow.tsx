'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorGlow — Premium cursor glow effect for the AutoElite showroom.
 *
 * Creates a subtle, warm radial gradient that follows the mouse cursor,
 * evoking the ambiance of luxury showroom lighting. Uses GPU-accelerated
 * transforms and requestAnimationFrame for buttery-smooth 60fps tracking
 * with elegant lerp easing.
 *
 * - Desktop only (fades out on touch / mobile devices)
 * - Respects `prefers-reduced-motion`
 * - Pointer-events: none — never blocks interaction
 * - z-index: 9999 (below modals at 10000+)
 */

const GLOW_SIZE = 500; // px — diameter of the glow circle
const LERP_FACTOR = 0.12; // easing — lower = more lag, more elegance
const BASE_OPACITY = 0.06; // subtle showroom glow

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -GLOW_SIZE, y: -GLOW_SIZE }); // off-screen initially
  const currentRef = useRef({ x: -GLOW_SIZE, y: -GLOW_SIZE });
  const rafRef = useRef<number>(0);
  const isTouchDeviceRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const isDarkRef = useRef(true);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Track dark mode for cursor glow adaptation
    const htmlEl = document.documentElement;
    const observer = new MutationObserver(() => {
      isDarkRef.current = htmlEl.classList.contains('dark');
      updateGlowStyle();
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    isDarkRef.current = htmlEl.classList.contains('dark');

    const updateGlowStyle = () => {
      const isDark = isDarkRef.current;
      glow.style.background = isDark
        ? 'radial-gradient(circle at center, rgba(255,248,235,0.35) 0%, rgba(255,238,210,0.15) 25%, rgba(255,225,180,0.06) 50%, transparent 70%)'
        : 'radial-gradient(circle at center, rgba(80,70,50,0.12) 0%, rgba(60,50,30,0.06) 25%, rgba(40,30,20,0.02) 50%, transparent 70%)';
      glow.style.mixBlendMode = isDark ? 'screen' : 'multiply';
    };
    updateGlowStyle();

    // ---- Detect prefers-reduced-motion ----
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mql.matches;

    // ---- Animation loop (lerp + GPU transform) ----
    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      // Lerp towards target for that silky delay
      current.x += (target.x - current.x) * LERP_FACTOR;
      current.y += (target.y - current.y) * LERP_FACTOR;

      // Use translate3d for GPU compositing — avoid layout thrash
      glow.style.transform = `translate3d(${current.x - GLOW_SIZE / 2}px, ${current.y - GLOW_SIZE / 2}px, 0)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    // ---- Mouse tracking ----
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDeviceRef.current || prefersReducedMotionRef.current) return;
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    // ---- Touch detection: hide glow on touch devices ----
    const handleTouchStart = () => {
      isTouchDeviceRef.current = true;
      glow.style.opacity = '0';
    };

    // ---- Mouse enter/leave to fade glow in/out ----
    const handleMouseEnter = () => {
      if (isTouchDeviceRef.current || prefersReducedMotionRef.current) return;
      glow.style.opacity = String(BASE_OPACITY);
    };

    const handleMouseLeave = () => {
      glow.style.opacity = '0';
    };

    // ---- Reduced-motion change handler ----
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      glow.style.opacity = e.matches ? '0' : String(BASE_OPACITY);
    };

    // ---- Attach listeners ----
    mql.addEventListener('change', handleMotionChange);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // ---- Start animation loop ----
    rafRef.current = requestAnimationFrame(animate);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(rafRef.current);
      mql.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 40,
        opacity: 0,
        willChange: 'transform, opacity',
        transition: 'opacity 0.4s ease',
        background:
          'radial-gradient(circle at center, rgba(255,248,235,0.35) 0%, rgba(255,238,210,0.15) 25%, rgba(255,225,180,0.06) 50%, transparent 70%)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
