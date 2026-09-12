import React from "react";
import Image from "next/image";
import { 
  Mountain, 
  Wind, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Building
} from "lucide-react";

export function VenueGuide() {
  return (
    <section data-section="venue-guide" className="py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-center gap-1.5">
            <Mountain className="w-4 h-4" />
            Competition Venue & Topography
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            THE BRISTOL, TENNESSEE <span className="amber-gradient-text">MOUNTAIN RIDGELINE</span>
          </h2>
          <p className="text-sm text-slate-300">
            Set in the rugged Appalachian foothills of Sullivan County, the Subsonic Society range presents one of the most demanding wind and elevation proving grounds in North America.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mountain Atmosphere */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Complex Valley Thermals
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              At 3,420 feet of elevation, morning mountain inversions give way to rapid updrafts along the canyon walls by mid-afternoon. Reading mirage and grass angle is essential to keep .22LR rounds centered.
            </p>
            <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              Average Density Altitude: 3,400 – 4,800 FT depending on humidity
            </div>
          </div>

          {/* Card 2: Range Infrastructure */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Pro Range Facilities
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with a 24-bench covered zero bay, LabRadar Doppler chronograph stations, squad staging pavilions, water hydration stations, and digital target flashers.
            </p>
            <div className="text-[11px] font-mono text-blue-300 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
              Full 465-yard laser-verified firing line with electronic hit indicators
            </div>
          </div>

          {/* Card 3: Accommodations & Logistics */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Lodging & Travel
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Located 20 minutes from downtown Bristol, TN/VA (State Street) and 30 minutes from Tri-Cities Regional Airport (TRI). Host hotels offering competitor rates and mountain cabin rentals.
            </p>
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              Coordinates: 36.5951° N, 82.1887° W • Bristol, TN
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
