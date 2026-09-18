'use client';

import { useEffect, useRef } from 'react';

interface ScoreRingProps {
  score: number; // 0–100
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 80, label = 'MATCH' }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    circle.style.strokeDashoffset = String(circumference);
    const anim = circle.animate(
      [
        { strokeDashoffset: String(circumference) },
        { strokeDashoffset: String(strokeDashoffset) },
      ],
      {
        duration: 900,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      }
    );

    return () => anim.cancel();
  }, [circumference, strokeDashoffset]);

  // Color mapping based on score
  const strokeColor =
    score >= 85 ? '#2EEA8D' : score >= 70 ? '#FFFFFF' : '#F59E0B';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3.5"
        />
        {/* Animated score arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span
          className="font-bold text-white leading-none font-mono"
          style={{ fontSize: size < 65 ? '13px' : '17px' }}
        >
          {score}
        </span>
        {label && (
          <span
            className="font-bold tracking-widest text-zinc-400 uppercase leading-none mt-0.5"
            style={{ fontSize: size < 65 ? '7px' : '9px' }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
