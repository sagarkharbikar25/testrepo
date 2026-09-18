'use client';

import { motion } from 'framer-motion';

export function NexoraIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bracketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-secondary-ai)" />
        </linearGradient>
      </defs>

      {/* Top Left Bracket */}
      <motion.path
        d="M 30 15 L 15 15 L 15 30"
        stroke="url(#bracketGradient)"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Bottom Right Bracket */}
      <motion.path
        d="M 70 85 L 85 85 L 85 70"
        stroke="url(#bracketGradient)"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      />

      {/* Nodes and Connecting Lines */}
      {/* Top Node */}
      <circle cx="50" cy="30" r="4" fill="var(--color-primary)" />
      {/* Bottom Left Node */}
      <circle cx="30" cy="65" r="4" fill="var(--color-text)" />
      {/* Bottom Right Node */}
      <circle cx="70" cy="65" r="4" fill="var(--color-secondary-ai)" />
      
      {/* Lines */}
      <line x1="50" y1="30" x2="30" y2="65" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="30" y1="65" x2="70" y2="65" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="70" y1="65" x2="50" y2="30" stroke="var(--color-border)" strokeWidth="2" />

      {/* Center AI Match Point (glowing) */}
      <motion.circle
        cx="50" cy="53" r="3"
        fill="#FFFFFF"
        style={{ filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  );
}
