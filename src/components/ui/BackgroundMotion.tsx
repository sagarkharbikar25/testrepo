'use client';

import { motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Beam {
  id: number;
  top: number;
  width: number;
  duration: number;
  delay: number;
}

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Deterministic constellation nodes for consistent GPU rendering
const PARTICLES: Particle[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: ((i * 37) % 94) + 3,
  y: ((i * 53) % 92) + 4,
  size: (i % 3) + 1,
  duration: (i % 4) + 3.5,
  delay: (i % 5) * 0.6,
}));

const BEAMS: Beam[] = [
  { id: 1, top: 18, width: 140, duration: 16, delay: 0 },
  { id: 2, top: 38, width: 220, duration: 22, delay: 4 },
  { id: 3, top: 62, width: 180, duration: 19, delay: 8 },
  { id: 4, top: 82, width: 130, duration: 24, delay: 2 },
];

export function BackgroundMotion() {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-black"
    >
      {/* ── 1. Subtle Perspective Grid Mask ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black 20%, transparent 75%)',
        }}
      />

      {/* ── 2. Primary Floating Luminous Orb (Upper Center / Left) ── */}
      <motion.div
        className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(200, 200, 215, 0.03) 45%, transparent 70%)',
        }}
        animate={{
          x: [0, 80, -60, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── 3. Secondary Drifting Silver Orb (Lower Right) ── */}
      <motion.div
        className="absolute bottom-[-10%] right-[10%] w-[750px] h-[750px] rounded-full blur-[160px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(160, 160, 175, 0.02) 50%, transparent 75%)',
        }}
        animate={{
          x: [0, -100, 40, 0],
          y: [0, -80, 50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── 4. Subtle Ambient Center Spotlight Pulse ── */}
      <motion.div
        className="absolute top-[35%] left-[40%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [0.95, 1.15, 0.95],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── 5. Horizontal Devnovate Light Beams (Laser Trails) ── */}
      {BEAMS.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute h-[1px]"
          style={{
            top: `${beam.top}%`,
            width: `${beam.width}px`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.6), 0 0 2px rgba(255, 255, 255, 0.9)',
          }}
          initial={{ left: '-20%', opacity: 0 }}
          animate={{
            left: ['-20%', '120%'],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: beam.duration,
            repeat: Infinity,
            delay: beam.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* ── 6. Twinkling Network Nodes (Constellation Field) ── */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)',
          }}
          animate={{
            opacity: [0.1, 0.85, 0.1],
            scale: [0.8, 1.4, 0.8],
            y: [0, -12, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
