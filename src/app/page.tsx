'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import {
  HandHelping,
  Users,
  Building2,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  MapPin,
  PackageCheck,
  CheckCircle2,
  Activity,
  Clock,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { StatusBadge } from '@/components/ui/StatusBadge';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white relative overflow-hidden selection:bg-white selection:text-black">
      {/* Top subtle spotlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Navigation — Devnovate style pill header */}
      <header className="h-20 border-b border-white/10 sticky top-0 z-40 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/15 group-hover:border-white transition-all bg-[#121217]">
              <Image
                src="/logo-new.png"
                alt="NexoraLink"
                width={40}
                height={40}
                className="object-cover w-full h-full scale-105"
                priority
              />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight font-[family-name:var(--font-plus-jakarta)] flex items-center text-white">
                Nexora<span className="text-zinc-400">Link</span>
              </div>
              <div className="text-[9px] font-bold tracking-wider uppercase text-zinc-500">
                People • Resources • Community
              </div>
            </div>
          </Link>

          {/* Center Pill Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            <a href="#how-it-works" className="px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
              How AI Works
            </a>
            <a href="#roles" className="px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
              The 3 Modules
            </a>
            <a href="#impact" className="px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
              Impact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Devnovate Style */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-36 flex-1 flex flex-col justify-center">
        {/* Ambient background beams */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          {/* Floating Nodes with horizontal light beams (Left & Right) */}
          <div className="hidden lg:block absolute left-4 top-16 space-y-20 pointer-events-none">
            {/* Left Node 1 */}
            <div className="relative flex items-center gap-3 bg-white/[0.04] border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                NL
              </div>
              <div className="text-[11px] font-mono text-zinc-300">
                • Urgent Triage <span className="text-zinc-500">19.2s</span>
              </div>
              {/* Horizontal beam trailing to the right */}
              <div className="absolute -bottom-2 left-2 right-[-40px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Left Node 2 */}
            <div className="relative flex items-center gap-3 bg-white/[0.04] border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md translate-y-8">
              <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] border border-white/20">
                GEO
              </div>
              <div className="text-[11px] font-mono text-zinc-300">
                • Flood Corridor <span className="text-zinc-500">0.8 km</span>
              </div>
              <div className="absolute -bottom-2 left-[-20px] right-2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>

          <div className="hidden lg:block absolute right-4 top-16 space-y-20 pointer-events-none">
            {/* Right Node 1 */}
            <div className="relative flex items-center gap-3 bg-white/[0.04] border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <div className="text-[11px] font-mono text-zinc-300">
                Volunteer Match <span className="text-emerald-400">96.8%</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#2EEA8D] text-black flex items-center justify-center font-bold text-[10px]">
                VOL
              </div>
              <div className="absolute -bottom-2 left-[-30px] right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Right Node 2 */}
            <div className="relative flex items-center gap-3 bg-white/[0.04] border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md translate-y-8">
              <div className="text-[11px] font-mono text-zinc-300">
                Active NGO Mesh <span className="text-zinc-400">34 Hubs</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                NGO
              </div>
              <div className="absolute -bottom-2 left-2 right-[-20px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>

          {/* Center Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
            {/* Devnovate Floating Capsule Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-zinc-300 text-xs font-medium mb-8 backdrop-blur-md hover:border-white/30 transition-all cursor-default"
            >
              <span>🚀</span>
              <span>Unlock AI Coordination Potential!</span>
              <span className="text-zinc-500 font-mono">→</span>
            </motion.div>

            {/* High-Contrast Editorial Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.08] mb-6 font-[family-name:var(--font-playfair)]"
            >
              One-click for your <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                Community
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed mb-10 font-[family-name:var(--font-inter)]"
            >
              Dive into the world of crisis coordination, where innovative technology meets
              collaborative problem-solving.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-4 mb-16"
            >
              <a href="#roles">
                <Button variant="primary" size="lg" className="rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Explore Operations
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* 3 Unified Module Cards */}
            <motion.div
              id="roles"
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left"
            >
              {/* Card 1: Requester */}
              <Link
                href="/register?role=requester"
                className="p-5 rounded-2xl bg-[#0F0F13] border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between hover:-translate-y-1 duration-200"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-3">
                    <HandHelping className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white font-[family-name:var(--font-plus-jakarta)] group-hover:text-zinc-200">
                    Need Help
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Log emergency aid requests with AI triage in seconds
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-white gap-1">
                  Request Aid <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Volunteer */}
              <Link
                href="/register?role=volunteer"
                className="p-5 rounded-2xl bg-[#0F0F13] border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between hover:-translate-y-1 duration-200"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-[#2EEA8D] flex items-center justify-center mb-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white font-[family-name:var(--font-plus-jakarta)] group-hover:text-zinc-200">
                    Volunteer
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Accept verified nearby missions tailored to your verified skills
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-[#2EEA8D] gap-1">
                  Join Network <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: NGO / Admin */}
              <Link
                href="/register?role=ngo"
                className="p-5 rounded-2xl bg-[#0F0F13] border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between hover:-translate-y-1 duration-200"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-3">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white font-[family-name:var(--font-plus-jakarta)] group-hover:text-zinc-200">
                    NGO / Admin
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Manage supplies, logistics & geospatial command map
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-white gap-1">
                  Open Operations <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Architecture Section */}
      <section id="how-it-works" className="py-20 bg-[#07070A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 bg-white/[0.05] px-3 py-1 rounded-full border border-white/10">
              Autonomous Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-plus-jakarta)] mt-4">
              Crisis Coordination Redefined
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Gemini neural reasoning analyzes natural language requests and executes real-time geospatial matches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)] mb-2">
                  AI Neural Triage
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Natural language input is instantly classified for urgency, medical hazards, and specific supply requirements.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>INPUT:</span>
                  <span className="text-[#2EEA8D]">PARSED</span>
                </div>
                <div className="p-2 bg-white/[0.04] rounded text-zinc-300 italic text-[11px]">
                  &quot;Oxygen cylinder urgently needed for elderly patient.&quot;
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status="ANALYZED" />
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    CRITICAL
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)] mb-2">
                  Geospatial Proximity Dispatch
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Computes precise volunteer proximity and skill suitability to generate optimal match scores.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">Responder Match</div>
                  <div className="text-[11px] text-zinc-400">Dr. Rahul Sharma (0.8 km)</div>
                  <div className="text-[10px] text-[#2EEA8D] font-mono mt-1">Medical + Transport</div>
                </div>
                <ScoreRing score={96} size={60} label="MATCH" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-4">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)] mb-2">
                  NGO Supply Allocation
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Depots track live stock of food kits, clean water, and medical gear with automated requisition approvals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-300 font-mono">
                  <span>Central Depot Hub</span>
                  <span className="text-white">120 Kits Available</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-3/4 rounded-full" />
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
                  <span>ALLOCATED: 75%</span>
                  <span>RESERVED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact & Community Metrics Section ── */}
      <section id="impact" className="py-24 bg-black/60 border-t border-white/10 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.03] blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/10 inline-flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Live Impact Metrics
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-[family-name:var(--font-plus-jakarta)] mt-4 tracking-tight">
              Real-Time Community <span className="font-[family-name:var(--font-playfair)] italic font-normal text-zinc-300">Resilience</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl mx-auto font-[family-name:var(--font-inter)]">
              Autonomous coordination intelligence connecting real people to real resources with verified lifecycle accountability.
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            <div className="p-6 rounded-2xl bg-[#0C0C10] border border-white/10 hover:border-white/20 transition-all">
              <div className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-wider">Aid Requisitions</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-plus-jakarta)]">
                14,280+
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                99.4% Verified Fulfillment
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C0C10] border border-white/10 hover:border-white/20 transition-all">
              <div className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-wider">Dispatch Velocity</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-plus-jakarta)]">
                18.4 min
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-300" />
                Down from 4.2h baseline
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C0C10] border border-white/10 hover:border-white/20 transition-all">
              <div className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-wider">Active Volunteers</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-plus-jakarta)]">
                3,850+
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
                <Users className="w-3.5 h-3.5 text-white" />
                Across 42 Urban Corridors
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C0C10] border border-white/10 hover:border-white/20 transition-all">
              <div className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-wider">Logistics Mesh</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-plus-jakarta)]">
                92 Hubs
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
                <Building2 className="w-3.5 h-3.5 text-white" />
                Connected Warehouses & NGOs
              </div>
            </div>
          </div>

          {/* Bottom Pre-Footer CTA */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/15 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-2xl sm:text-4xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                Ready to coordinate your community?
              </h3>
              <p className="text-sm text-zinc-400">
                Join thousands of responders, coordinators, and citizens using AI-powered crisis allocation.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    Get Started Now
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="rounded-full">
                    Sign In to Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-[#121217]">
              <Image src="/logo-new.png" alt="NexoraLink" width={36} height={36} className="object-cover scale-105" />
            </div>
            <div>
              <div className="font-bold text-base font-[family-name:var(--font-plus-jakarta)] text-white">
                Nexora<span className="text-zinc-400">Link</span>
              </div>
              <div className="text-[10px] text-zinc-500">People • Resources • Stronger Communities</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register?role=requester" className="hover:text-white transition-colors">
              Requester Portal
            </Link>
            <Link href="/register?role=volunteer" className="hover:text-white transition-colors">
              Volunteer Network
            </Link>
            <Link href="/register?role=ngo" className="hover:text-white transition-colors">
              NGO / Admin Operations
            </Link>
          </div>

          <div className="text-xs text-zinc-500">
            © {new Date().getFullYear()} NexoraLink. Built for resilient community response.
          </div>
        </div>
      </footer>
    </div>
  );
}
