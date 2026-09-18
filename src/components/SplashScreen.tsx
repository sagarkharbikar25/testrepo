'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('nexora_splash_seen');
  });

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('nexora_splash_seen', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-[#121217]">
              <Image
                src="/logo-new.png"
                alt="NexoraLink"
                width={96}
                height={96}
                className="w-full h-full object-cover scale-105"
                priority
              />
            </div>
            <div className="font-extrabold text-2xl text-white font-[family-name:var(--font-plus-jakarta)] tracking-tight">
              Nexora<span className="text-zinc-400">Link</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
