"use client";

import { useState } from "react";
import { PlusCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function RequesterDashboard() {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="text-neutral-400">Track and manage your requests for help.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            New Request
          </button>
        </header>

        {showForm && (
          <div className="glass-card p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">Create New Request</h2>
            <form className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">What do you need?</label>
                <input type="text" placeholder="e.g. 10 food packets for construction workers" className="w-full bg-input border border-border rounded-lg px-4 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-1">Location</label>
                  <button type="button" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-left flex items-center justify-between text-neutral-400">
                    Use My Location
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </button>
                </div>
              </div>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium">
                Submit Request
              </button>
              <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Gemini AI will automatically categorize and prioritize this based on urgency.
              </p>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Request 1 */}
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-rose-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded font-bold">CRITICAL</span>
            </div>
            <h3 className="text-lg font-bold mb-1 w-[80%]">Need insulin urgently</h3>
            <p className="text-sm text-neutral-400 mb-4">Dharampeth, Nagpur</p>
            
            <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 p-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span>Accepted by Priya D.</span>
            </div>
          </div>

          {/* Mock Request 2 */}
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">LOW</span>
            </div>
            <h3 className="text-lg font-bold mb-1 w-[80%]">Winter blankets</h3>
            <p className="text-sm text-neutral-400 mb-4">Sitabuldi, Nagpur</p>
            
            <div className="flex items-center gap-2 text-sm text-neutral-400 bg-white/5 p-3 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>Waiting for volunteer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
