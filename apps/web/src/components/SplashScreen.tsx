"use client";

import { useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000); // 2 seconds splash
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-1000">
      <div className="animate-pulse flex flex-col items-center">
        <HeartHandshake className="h-20 w-20 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
          NexoraLink
        </h1>
        <p className="mt-2 text-sm text-neutral-400 font-medium">Bridging the community.</p>
      </div>
    </div>
  );
}
