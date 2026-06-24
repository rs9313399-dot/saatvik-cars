'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// OutputPass removed — using renderer tone mapping directly (matches official Three.js bloom examples)

// ═══════════════════════════════════════════════════════════════════
//   🏎️ AutoElite — Car Emerging From Void
//   Hyper-premium Three.js WebGL particle animation
//   6-phase: CHAOS → ATTRACTION → FORMATION → REVEAL → STABLE → BREATHING
// ═══════════════════════════════════════════════════════════════════

// ─── Sports Car Side Profile (Supercar silhouette) ───
const CAR_PROFILE: [number, number][] = [
  [-0.95, -0.10], [-0.98, -0.04], [-0.97, 0.02], [-0.93, 0.06],
  [-0.88, 0.09], [-0.78, 0.13], [-0.65, 0.16], [-0.50, 0.19],
  [-0.38, 0.20], [-0.30, 0.21], [-0.22, 0.33], [-0.15, 0.40],
  [-0.05, 0.44], [0.05, 0.46], [0.15, 0.45], [0.25, 0.42],
  [0.35, 0.36], [0.42, 0.30], [0.50, 0.27], [0.58, 0.25],
  [0.65, 0.27], [0.70, 0.25], [0.76, 0.20], [0.80, 0.12],
  [0.83, 0.02], [0.84, -0.05], [0.82, -0.10], [0.78, -0.12],
  [0.70, -0.13], [0.65, -0.10], [0.60, -0.14], [0.52, -0.14],
  [0.48, -0.10], [0.40, -0.12], [0.25, -0.12], [0.15, -0.10],
  [0.10, -0.14], [0.02, -0.14], [-0.05, -0.10], [-0.15, -0.12],
  [-0.30, -0.12], [-0.40, -0.10], [-0.50, -0.12], [-0.65, -0.12],
  [-0.80, -0.11], [-0.90, -0.10], [-0.95, -0.10],
];

const WHEELS = [
  { cx: -0.02, cy: -0.02, r: 0.065 },
  { cx: 0.56, cy: -0.02, r: 0.065 },
];

// ─── Utility: Point-in-polygon ───
function isInsidePolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ─── Utility: Sample points along a closed path ───
function samplePath(profile: [number, number][], count: number): [number, number][] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < profile.length - 1; i++) {
    const dx = profile[i + 1][0] - profile[i][0];
    const dy = profile[i + 1][1] - profile[i][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segs.push(len);
    total += len;
  }
  const pts: [number, number][] = [];
  for (let p = 0; p < count; p++) {
    const target = (p / count) * total;
    let acc = 0;
    for (let i = 0; i < segs.length; i++) {
      if (acc + segs[i] >= target) {
        const t = segs[i] > 0 ? (target - acc) / segs[i] : 0;
        pts.push([
          profile[i][0] + t * (profile[i + 1][0] - profile[i][0]),
          profile[i][1] + t * (profile[i + 1][1] - profile[i][1]),
        ]);
        break;
      }
      acc += segs[i];
    }
  }
  return pts;
}

// ─── Utility: Sample interior points of polygon ───
function sampleInterior(poly: [number, number][], count: number): [number, number][] {
  const xs = poly.map(p => p[0]);
  const ys = poly.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pts: [number, number][] = [];
  let attempts = 0;
  while (pts.length < count && attempts < count * 30) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (isInsidePolygon(x, y, poly)) pts.push([x, y]);
    attempts++;
  }
  return pts;
}

// ─── Utility: Sample wheel rim + fill ───
function sampleWheel(cx: number, cy: number, r: number, count: number): [number, number][] {
  const pts: [number, number][] = [];
  const rimCount = Math.floor(count * 0.4);
  for (let i = 0; i < rimCount; i++) {
    const a = (i / rimCount) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  for (let i = 0; i < count - rimCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * r * 0.85;
    pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]);
  }
  return pts;
}

// ─── Smoothstep ───
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// ═══════════════════════════════════════════════════════════════════
//   SHADERS
// ═══════════════════════════════════════════════════════════════════

const carVertexShader = /* glsl */ `
  attribute vec3 aRandomPos;
  attribute float aDelay;
  attribute float aSize;
  attribute float aBaseOpacity;
  attribute vec3 aTargetColor;

  uniform float uTime;
  uniform float uMorphProgress;
  uniform float uBrightness;
  uniform float uSweepX;
  uniform float uSweepActive;
  uniform float uBreathing;
  uniform float uReflection;

  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    // Per-particle morph with delay for wave effect
    float mp = clamp((uMorphProgress - aDelay) / max(1.0 - aDelay, 0.01), 0.0, 1.0);
    mp = mp * mp * (3.0 - 2.0 * mp);

    // Interpolate between random (void) and target (car) position
    vec3 pos = mix(aRandomPos, position, mp);

    // Organic noise — stronger in chaos, weaker when formed
    float noiseStr = 0.04 * (1.0 - mp * 0.85);
    float nx = sin(pos.x * 4.3 + uTime * 0.7) * cos(pos.y * 3.1 + uTime * 0.5);
    float ny = cos(pos.x * 3.2 + uTime * 0.6) * sin(pos.y * 4.4 + uTime * 0.8);
    float nz = sin(pos.x * 2.7 + uTime * 0.4) * cos(pos.z * 3.5 + uTime * 0.9);
    pos += vec3(nx, ny, nz) * noiseStr;

    // Breathing when formed
    float breath = sin(uTime * 0.8 + length(position.xy) * 3.5) * 0.004 * uBreathing;
    pos += normalize(position + vec3(0.001)) * breath;

    // Light sweep
    float sweepDist = abs(pos.x - uSweepX);
    float sweepBoost = exp(-sweepDist * 10.0) * uSweepActive * 0.7;

    // Color & opacity
    vColor = aTargetColor;
    vColor = mix(vColor, vec3(1.0), sweepBoost * 0.8);
    // Reflection dimmer
    vOpacity = aBaseOpacity * uBrightness * mix(1.0, 0.1, uReflection);
    vOpacity += sweepBoost * mix(1.0, 0.2, uReflection);
    vOpacity = clamp(vOpacity, 0.0, 1.0);

    // Size boost during formation drama
    float sizeBoost = 1.0 + sin(mp * 3.14159) * 0.35;
    float finalSize = aSize * sizeBoost;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = finalSize * (280.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const carFragmentShader = /* glsl */ `
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.6);
    alpha *= vOpacity;

    // Bright white core
    float core = 1.0 - smoothstep(0.0, 0.1, dist);
    vec3 color = mix(vColor, vec3(1.0), core * 0.65);

    if (alpha < 0.005) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const ambientVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aBaseOpacity;
  attribute vec3 aTargetColor;
  attribute vec3 aVelocity;

  uniform float uTime;

  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.3 + position.y * 2.0) * 0.06;
    pos.y += cos(uTime * 0.4 + position.x * 1.5) * 0.05;
    pos.z += sin(uTime * 0.35 + position.z * 1.8) * 0.04;
    pos += aVelocity * uTime * 0.02;
    pos = mod(pos + 2.5, 5.0) - 2.5;

    vOpacity = aBaseOpacity * (0.4 + 0.6 * sin(uTime * 0.5 + position.x * 3.0));
    vColor = aTargetColor;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (180.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ambientFragmentShader = /* glsl */ `
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 2.0);
    alpha *= vOpacity;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════
//   COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CarParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL support check
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) {
      container.style.background = '#000000';
      return;
    }

    let destroyed = false;
    const isMobile = window.innerWidth < 768;

    // ─── Scene ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.12, 3.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    // ─── Generate Car Points ───
    const outlineN = isMobile ? 1800 : 3500;
    const interiorN = isMobile ? 1200 : 3500;
    const wheelN = isMobile ? 400 : 700;
    const totalCarN = outlineN + interiorN + wheelN * 2;

    const outlinePts = samplePath(CAR_PROFILE, outlineN);
    const interiorPts = sampleInterior(CAR_PROFILE, interiorN);
    const frontWheelPts = sampleWheel(WHEELS[0].cx, WHEELS[0].cy, WHEELS[0].r, wheelN);
    const rearWheelPts = sampleWheel(WHEELS[1].cx, WHEELS[1].cy, WHEELS[1].r, wheelN);
    const allCarPts: [number, number][] = [...outlinePts, ...interiorPts, ...frontWheelPts, ...rearWheelPts];

    // ─── Car Particle Buffers ───
    const positions = new Float32Array(totalCarN * 3);
    const randomPos = new Float32Array(totalCarN * 3);
    const delays = new Float32Array(totalCarN);
    const sizes = new Float32Array(totalCarN);
    const opacities = new Float32Array(totalCarN);
    const colors = new Float32Array(totalCarN * 3);

    let maxDist = 0;

    for (let i = 0; i < totalCarN; i++) {
      const [x, y] = allCarPts[i];
      const isOutline = i < outlineN;
      const isInterior = i >= outlineN && i < outlineN + interiorN;
      // const isWheel = i >= outlineN + interiorN;

      // Target position with Z depth
      const z = isOutline
        ? (Math.random() - 0.5) * 0.04
        : isInterior
          ? (Math.random() - 0.5) * 0.1
          : (Math.random() - 0.5) * 0.03;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random void position — spread in a sphere
      const rx = (Math.random() - 0.5) * 5;
      const ry = (Math.random() - 0.5) * 4;
      const rz = (Math.random() - 0.5) * 2.5;
      randomPos[i * 3] = rx;
      randomPos[i * 3 + 1] = ry;
      randomPos[i * 3 + 2] = rz;

      const dist = Math.sqrt((rx - x) ** 2 + (ry - y) ** 2);
      if (dist > maxDist) maxDist = dist;

      if (isOutline) {
        sizes[i] = 2.8 + Math.random() * 1.8;
        opacities[i] = 0.8 + Math.random() * 0.2;
        // Neon cyan outline
        colors[i * 3] = 0.0 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.75 + Math.random() * 0.25;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (isInterior) {
        sizes[i] = 1.6 + Math.random() * 1.2;
        opacities[i] = 0.35 + Math.random() * 0.3;
        // White-blue interior
        colors[i * 3] = 0.55 + Math.random() * 0.35;
        colors[i * 3 + 1] = 0.65 + Math.random() * 0.25;
        colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
      } else {
        sizes[i] = 2.2 + Math.random() * 1.2;
        opacities[i] = 0.6 + Math.random() * 0.3;
        // Bright cyan wheels
        colors[i * 3] = 0.0 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      }
    }

    // Set delays — closer particles arrive first (condensation wave)
    for (let i = 0; i < totalCarN; i++) {
      const dx = randomPos[i * 3] - positions[i * 3];
      const dy = randomPos[i * 3 + 1] - positions[i * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      delays[i] = maxDist > 0 ? (dist / maxDist) * 0.55 : 0;
    }

    // ─── Car Geometry & Material ───
    const carGeo = new THREE.BufferGeometry();
    carGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    carGeo.setAttribute('aRandomPos', new THREE.BufferAttribute(randomPos, 3));
    carGeo.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
    carGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    carGeo.setAttribute('aBaseOpacity', new THREE.BufferAttribute(opacities, 1));
    carGeo.setAttribute('aTargetColor', new THREE.BufferAttribute(colors, 3));

    const carUniforms = {
      uTime: { value: 0 },
      uMorphProgress: { value: 0 },
      uBrightness: { value: 0.25 },
      uSweepX: { value: -1.5 },
      uSweepActive: { value: 0 },
      uBreathing: { value: 0 },
      uReflection: { value: 0 },
    };

    const carMat = new THREE.ShaderMaterial({
      uniforms: carUniforms,
      vertexShader: carVertexShader,
      fragmentShader: carFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const carPoints = new THREE.Points(carGeo, carMat);
    scene.add(carPoints);

    // ─── Reflection (mirrored, dimmer) ───
    const reflUniforms = {
      uTime: { value: 0 },
      uMorphProgress: { value: 0 },
      uBrightness: { value: 0.25 },
      uSweepX: { value: -1.5 },
      uSweepActive: { value: 0 },
      uBreathing: { value: 0 },
      uReflection: { value: 1.0 },
    };

    const reflMat = new THREE.ShaderMaterial({
      uniforms: reflUniforms,
      vertexShader: carVertexShader,
      fragmentShader: carFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const reflPoints = new THREE.Points(carGeo, reflMat);
    reflPoints.scale.y = -1;
    reflPoints.position.y = -0.32;
    scene.add(reflPoints);

    // ─── Ambient Background Particles ───
    const ambientN = isMobile ? 800 : 2000;
    const aPos = new Float32Array(ambientN * 3);
    const aSizes = new Float32Array(ambientN);
    const aOps = new Float32Array(ambientN);
    const aCols = new Float32Array(ambientN * 3);
    const aVels = new Float32Array(ambientN * 3);

    for (let i = 0; i < ambientN; i++) {
      aPos[i * 3] = (Math.random() - 0.5) * 6;
      aPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      aPos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      aSizes[i] = 0.6 + Math.random() * 1.8;
      aOps[i] = 0.08 + Math.random() * 0.25;

      const hue = 0.58 + Math.random() * 0.18;
      const c = new THREE.Color().setHSL(hue, 0.35 + Math.random() * 0.4, 0.12 + Math.random() * 0.18);
      aCols[i * 3] = c.r;
      aCols[i * 3 + 1] = c.g;
      aCols[i * 3 + 2] = c.b;

      aVels[i * 3] = (Math.random() - 0.5) * 0.03;
      aVels[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      aVels[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    ambGeo.setAttribute('aSize', new THREE.BufferAttribute(aSizes, 1));
    ambGeo.setAttribute('aBaseOpacity', new THREE.BufferAttribute(aOps, 1));
    ambGeo.setAttribute('aTargetColor', new THREE.BufferAttribute(aCols, 3));
    ambGeo.setAttribute('aVelocity', new THREE.BufferAttribute(aVels, 3));

    const ambMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: ambientVertexShader,
      fragmentShader: ambientFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ambPoints = new THREE.Points(ambGeo, ambMat);
    scene.add(ambPoints);

    // ─── Post-Processing: Bloom ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      isMobile ? 1.0 : 1.6, // strength
      0.4,                   // radius
      0.7                    // threshold
    );
    composer.addPass(bloomPass);
    // No OutputPass — renderer's toneMapping handles it (official Three.js bloom pattern)

    // ─── Mouse Parallax ───
    let mouseX = 0, mouseY = 0;
    let tMouseX = 0, tMouseY = 0;

    function onMouseMove(e: MouseEvent) {
      tMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      tMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ─── Resize ───
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    }
    window.addEventListener('resize', onResize);

    // ─── IntersectionObserver: pause rendering when not visible ───
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // ─── Animation Phases ───
    const CHAOS_END = 3.0;
    const ATTRACT_END = 7.5;
    const FORM_END = 11.5;

    const startTime = performance.now();

    function animate() {
      if (destroyed) return;

      const now = performance.now();
      const t = (now - startTime) / 1000;

      // Smooth mouse
      mouseX += (tMouseX - mouseX) * 0.04;
      mouseY += (tMouseY - mouseY) * 0.04;

      // Camera parallax
      camera.position.x = mouseX * 0.18;
      camera.position.y = 0.12 + mouseY * -0.1;
      camera.lookAt(0, 0.1, 0);

      // ─── Phase logic ───
      let morph = 0;
      let brightness = 0.25;
      let sweepX = -1.5;
      let sweepActive = 0;
      let breathing = 0;

      if (t < CHAOS_END) {
        // CHAOS — particles drift in void
        morph = 0;
        brightness = 0.15 + smoothstep(0, CHAOS_END, t) * 0.15;
      } else if (t < ATTRACT_END) {
        // ATTRACTION — particles condense toward car shape
        const p = (t - CHAOS_END) / (ATTRACT_END - CHAOS_END);
        morph = smoothstep(0, 1, p);
        brightness = 0.3 + p * 0.4;
      } else if (t < FORM_END) {
        // FORMATION — solidify + light sweep
        const p = (t - ATTRACT_END) / (FORM_END - ATTRACT_END);
        morph = 1.0;
        brightness = 0.7 + p * 0.3;

        // Cinematic light sweep
        if (p > 0.1 && p < 0.7) {
          sweepActive = 1.0;
          sweepX = -1.2 + ((p - 0.1) / 0.6) * 2.4;
        } else {
          sweepActive = 0;
        }

        if (p > 0.5) {
          breathing = (p - 0.5) / 0.5;
        }
      } else {
        // STABLE — fully formed, breathing, interactive
        morph = 1.0;
        breathing = 1.0;
        sweepActive = 0;
        // Subtle brightness pulse
        brightness = 0.85 + Math.sin(t * 0.5) * 0.12;
      }

      // ─── Update uniforms ───
      const allUniforms = [carUniforms, reflUniforms];
      for (const u of allUniforms) {
        u.uTime.value = t;
        u.uMorphProgress.value = morph;
        u.uBrightness.value = brightness;
        u.uSweepX.value = sweepX;
        u.uSweepActive.value = sweepActive;
        u.uBreathing.value = breathing;
      }

      ambMat.uniforms.uTime.value = t;

      // ─── Render only when visible (saves GPU when scrolled away) ───
      if (isVisible) {
        composer.render();
      }
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // ─── Cleanup ───
    return () => {
      destroyed = true;
      intersectionObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      carGeo.dispose();
      carMat.dispose();
      reflMat.dispose();
      ambGeo.dispose();
      ambMat.dispose();
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-[1]">
      {/* Bottom fog gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      />
      {/* Top vignette */}
      <div
        className="absolute top-0 left-0 right-0 h-[15%] pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
      />
    </div>
  );
}
