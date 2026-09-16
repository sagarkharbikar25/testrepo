"use client";

import Link from "next/link";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground overflow-hidden">
      
      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl px-4 flex flex-col items-center justify-center text-center mt-32 relative z-10">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>

        <span className="px-4 py-1.5 rounded-full glass-card text-primary text-sm font-semibold mb-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Live in Nagpur
        </span>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Community Help, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            Bridged in Minutes.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10">
          NexoraLink connects neighbors who need help with nearby volunteers and NGOs instantly. 
          Powered by AI triage and geospatial matching.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/auth?type=requester" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
            I Need Help
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/auth?type=volunteer" className="glass-card hover:bg-white/5 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center">
            I Want to Volunteer
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="w-full max-w-6xl px-4 mt-32 mb-32 grid md:grid-cols-3 gap-8 relative z-10">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
            <Zap className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Auto-Triage</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Our Gemini-powered engine instantly categorizes requests and assigns urgency levels to prioritize critical needs.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
            <Globe className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Geospatial Matching</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Requests are routed to the nearest available volunteers using PostGIS and Leaflet maps for lightning-fast response times.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-lg bg-rose-500/10 flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Full Transparency</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Track requests from open to completed with our public impact feed, ensuring no one's plea for help goes unanswered.
          </p>
        </div>
      </section>
      
    </div>
  );
}
