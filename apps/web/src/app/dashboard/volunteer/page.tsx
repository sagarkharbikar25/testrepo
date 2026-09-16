"use client";

import { Navigation2, AlertTriangle, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("../../../components/Map"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-card/50 animate-pulse rounded-2xl border border-border flex items-center justify-center">Loading Map...</div>
});

const mockRequests = [
  { id: '1', title: 'Need food packets', urgency: 'CRITICAL', lat: 21.1458, lng: 79.0882, distance: '1.2 km' },
  { id: '2', title: 'Winter clothes', urgency: 'LOW', lat: 21.1555, lng: 79.1136, distance: '3.5 km' },
];

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState<'map'|'list'>('map');

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Nearby Requests <div className="h-3 w-3 bg-emerald-500 rounded-full animate-ping ml-2"></div>
            </h1>
            <p className="text-neutral-400">Find and accept community requests near you.</p>
          </div>
          <div className="flex bg-input rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'map' ? 'bg-primary text-primary-foreground' : 'text-neutral-400 hover:text-white'}`}
            >
              Map View
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'list' ? 'bg-primary text-primary-foreground' : 'text-neutral-400 hover:text-white'}`}
            >
              List View
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'map' ? (
              <Map markers={mockRequests} />
            ) : (
              <div className="space-y-4">
                {mockRequests.map((req) => (
                  <div key={req.id} className="glass-card p-6 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${req.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {req.urgency}
                        </span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1"><Navigation2 className="h-3 w-3"/> {req.distance} away</span>
                      </div>
                      <h3 className="text-lg font-bold">{req.title}</h3>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5 text-blue-400"/> Your Impact</h3>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-neutral-400">Requests Completed</span>
                <span className="font-bold text-lg">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Trust Score</span>
                <span className="font-bold text-lg text-emerald-400">98%</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl bg-rose-500/5 border-rose-500/20">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-rose-400"><AlertTriangle className="h-5 w-5"/> Urgent Need</h3>
              <p className="text-sm text-neutral-300 mb-4">
                Someone 1.2km away needs critical medicine delivery.
              </p>
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                View Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
