'use client';

import { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
//   🏙️ AutoElite — City Skyline Background
//   Clean dark background with animated city skyline silhouette
//   Subtle star particles + floating ambient dots
// ═══════════════════════════════════════════════════════════════════

export const backgroundState = {
  mouseX: 0.5,
  mouseY: 0.5,
  ctaHover: 0,
  scrollY: 0,
};

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function ShowroomBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let destroyed = false;
    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // Generate stars
    const stars: Star[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.6, // top 60% of screen
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = rect.width + 'px';
      canvas!.style.height = rect.height + 'px';
    }
    resize();

    let globalTime = 0;
    let lastFrameTime = performance.now();

    function handleMouseMove(e: MouseEvent) {
      backgroundState.mouseX = e.clientX / window.innerWidth;
      backgroundState.mouseY = e.clientY / window.innerHeight;
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', resize);

    // ─── City Skyline Path Generator ───
    function drawCitySkyline(width: number, height: number) {
      const skylineY = height * 0.82; // skyline starts at 82% from top
      const buildingColor = '#0a0a0f';
      const buildingHighlight = 'rgba(255, 255, 255, 0.015)';

      ctx!.save();

      // Ground/base
      ctx!.fillStyle = '#060610';
      ctx!.fillRect(0, skylineY, width, height - skylineY);

      // Generate deterministic buildings using width-based seed
      const buildingCount = Math.floor(width / 30);
      const buildings: { x: number; w: number; h: number }[] = [];

      for (let i = 0; i < buildingCount; i++) {
        const x = (i / buildingCount) * width;
        const w = 15 + Math.abs(Math.sin(i * 1.7 + 3.2)) * 45;
        const h = 20 + Math.abs(Math.sin(i * 2.3 + 1.1)) * 120 +
                  Math.abs(Math.cos(i * 0.7 + 5.5)) * 60;
        buildings.push({ x, w, h });
      }

      // Draw building silhouettes
      for (const b of buildings) {
        const by = skylineY - b.h;

        // Main building body
        ctx!.fillStyle = buildingColor;
        ctx!.fillRect(b.x, by, b.w, b.h + (height - skylineY));

        // Subtle left edge highlight
        ctx!.fillStyle = buildingHighlight;
        ctx!.fillRect(b.x, by, 1, b.h);

        // Windows (small dots of light)
        const windowSize = 2 * dpr;
        const windowGap = 8 * dpr;
        const windowMarginX = 4 * dpr;
        const windowMarginY = 6 * dpr;

        for (let wy = by + windowMarginY; wy < skylineY - windowMarginY; wy += windowGap) {
          for (let wx = b.x + windowMarginX; wx < b.x + b.w - windowMarginX; wx += windowGap) {
            // Deterministic "random" window lighting
            const seed = Math.sin(wx * 0.13 + wy * 0.17 + b.x * 0.07);
            if (seed > 0.2) {
              const warmth = seed > 0.7 ? 
                `rgba(255, 220, 150, ${0.15 + seed * 0.25})` : 
                `rgba(200, 220, 255, ${0.08 + seed * 0.12})`;
              ctx!.fillStyle = warmth;
              ctx!.fillRect(wx, wy, windowSize, windowSize);
            }
          }
        }

        // Antenna/spire on some tall buildings
        if (b.h > 120 && Math.sin(b.x * 0.3) > 0.3) {
          ctx!.fillStyle = buildingColor;
          ctx!.fillRect(b.x + b.w / 2 - 1 * dpr, by - 15 * dpr, 2 * dpr, 15 * dpr);

          // Blinking red light on top
          const blink = Math.sin(globalTime * 2 + b.x * 0.1) > 0.3;
          if (blink) {
            ctx!.beginPath();
            ctx!.arc(b.x + b.w / 2, by - 15 * dpr, 2 * dpr, 0, Math.PI * 2);
            ctx!.fillStyle = 'rgba(255, 50, 50, 0.7)';
            ctx!.fill();
            // Glow
            ctx!.beginPath();
            ctx!.arc(b.x + b.w / 2, by - 15 * dpr, 6 * dpr, 0, Math.PI * 2);
            ctx!.fillStyle = 'rgba(255, 50, 50, 0.1)';
            ctx!.fill();
          }
        }
      }

      // Skyline horizon glow
      const horizonGrad = ctx!.createLinearGradient(0, skylineY - 30, 0, skylineY + 20);
      horizonGrad.addColorStop(0, 'rgba(30, 40, 60, 0)');
      horizonGrad.addColorStop(0.5, 'rgba(30, 40, 60, 0.15)');
      horizonGrad.addColorStop(1, 'rgba(15, 20, 35, 0.3)');
      ctx!.fillStyle = horizonGrad;
      ctx!.fillRect(0, skylineY - 30, width, 50);

      ctx!.restore();
    }

    // ─── ANIMATION LOOP ───
    function animate() {
      if (destroyed) return;
      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      globalTime += dt;

      const w = canvas!.width;
      const h = canvas!.height;

      // Clear with dark gradient
      const bgGrad = ctx!.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#050510');
      bgGrad.addColorStop(0.4, '#080818');
      bgGrad.addColorStop(0.7, '#0a0a20');
      bgGrad.addColorStop(1, '#060612');
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, w, h);

      // Subtle atmospheric glow (top center)
      const glowGrad = ctx!.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, w * 0.5);
      glowGrad.addColorStop(0, 'rgba(40, 50, 80, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(25, 30, 50, 0.05)');
      glowGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = glowGrad;
      ctx!.fillRect(0, 0, w, h);

      // Draw stars with twinkling
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(globalTime * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.opacity * twinkle;
        if (opacity < 0.05) continue;

        const sx = star.x * w;
        const sy = star.y * h;
        const size = star.size * dpr;

        // Star glow
        if (opacity > 0.2) {
          ctx!.beginPath();
          ctx!.arc(sx, sy, size * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(180, 200, 255, ${opacity * 0.08})`;
          ctx!.fill();
        }

        // Star core
        ctx!.beginPath();
        ctx!.arc(sx, sy, size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(220, 230, 255, ${opacity})`;
        ctx!.fill();
      }

      // City skyline
      drawCitySkyline(w, h);

      // Bottom gradient overlay to fade into page content
      const fadeGrad = ctx!.createLinearGradient(0, h - 80 * dpr, 0, h);
      fadeGrad.addColorStop(0, 'transparent');
      fadeGrad.addColorStop(1, 'rgba(5, 5, 16, 0.6)');
      ctx!.fillStyle = fadeGrad;
      ctx!.fillRect(0, h - 80 * dpr, w, 80 * dpr);

      // Vignette
      const vigGrad = ctx!.createRadialGradient(
        w / 2, h / 2, w * 0.2,
        w / 2, h / 2, w * 0.7
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, 'rgba(3, 3, 10, 0.4)');
      ctx!.fillStyle = vigGrad;
      ctx!.fillRect(0, 0, w, h);

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[1]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: '#050510' }} />
    </div>
  );
}
