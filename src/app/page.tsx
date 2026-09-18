import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, Users, Box, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-[var(--color-border)] flex items-center justify-between px-6 lg:px-12">
        <div className="font-bold text-2xl text-[var(--color-primary)]">
          NexoraLink
        </div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <Badge variant="medium" className="mb-6 py-1 px-3">
          Powered by Gemini AI
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-[var(--color-foreground)] max-w-4xl">
          Community help, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            coordinated by AI.
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl">
          A tactical dashboard to match citizens in need with the right volunteers and NGOs instantly, using intelligent geographic and skill-based matching.
        </p>
        
        <div className="flex gap-4">
          <Link href="/register?role=requester">
            <Button variant="primary" className="h-12 px-8 text-lg">
              Get Help Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/register?role=volunteer">
            <Button variant="ghost" className="h-12 px-8 text-lg">
              Become a Volunteer
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-4xl">
          <Card className="flex flex-col items-center p-6 bg-slate-800/50 backdrop-blur border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Activity className="text-blue-400 w-6 h-6" />
            </div>
            <div className="text-4xl font-bold font-mono text-slate-50 mb-1">1,204</div>
            <div className="text-sm text-slate-400">Requests Helped</div>
          </Card>
          
          <Card className="flex flex-col items-center p-6 bg-slate-800/50 backdrop-blur border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <Users className="text-emerald-400 w-6 h-6" />
            </div>
            <div className="text-4xl font-bold font-mono text-slate-50 mb-1">853</div>
            <div className="text-sm text-slate-400">Active Volunteers</div>
          </Card>

          <Card className="flex flex-col items-center p-6 bg-slate-800/50 backdrop-blur border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Box className="text-amber-400 w-6 h-6" />
            </div>
            <div className="text-4xl font-bold font-mono text-slate-50 mb-1">4.2k</div>
            <div className="text-sm text-slate-400">Resources Shared</div>
          </Card>
        </div>
      </main>
    </div>
  );
}
