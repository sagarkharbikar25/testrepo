"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "requester";
  
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call Supabase Auth here.
    // For prototype purposes, we simulate login and route to dashboard.
    console.log("Simulating auth for:", email);
    
    if (type === "volunteer") {
      router.push("/dashboard/volunteer");
    } else {
      router.push("/dashboard/requester");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl relative overflow-hidden">
        
        {/* Decorative background blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              {isLogin ? <LogIn className="h-6 w-6 text-primary" /> : <UserPlus className="h-6 w-6 text-primary" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {isLogin ? "Welcome Back" : `Join as a ${type === 'volunteer' ? 'Volunteer' : 'Requester'}`}
          </h2>
          <p className="text-neutral-400 text-sm text-center mb-8">
            {isLogin ? "Enter your credentials to access your account." : "Create an account to start making an impact."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Rahul Sharma"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all mt-4">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-neutral-400 hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
