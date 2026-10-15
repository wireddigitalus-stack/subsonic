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
            The Hideout — Your Invitational Home
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            BRISTOL, TENNESSEE <span className="amber-gradient-text">PRIVATE SETTING</span>
          </h2>
          <p className="text-sm text-slate-300">
            The Hideout is the private range of the Hurley family, sitting on approximately 220 acres near the Tennessee-Virginia line — in Tennessee. The property was built to bring shooting, competition and hospitality together in one private setting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mountain Atmosphere */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Dedicated Rimfire &amp; Long-Range
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Featuring a dedicated 300-yard rimfire range, PRS-style positional rifle range, and a 1,000-yard long-range rifle range with 50-yard, 100-yard, and 200-yard zero available during scheduled sight-in hours.
            </p>
            <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              Friday 12–5 PM Sight-In • Sat &amp; Sun 7:00–8:30 AM Sight-In
            </div>
          </div>

          {/* Card 2: Match Hospitality */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              24&apos; x 40&apos; Covered Pavilion &amp; Fire Pit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Includes a 24&apos; x 40&apos; covered pavilion, two restrooms and showers at the shooting range, and a 20&apos; x 20&apos; fire pit ready for relaxing in the evenings. Saturday lunch and dinner are provided for competitors.
            </p>
            <div className="text-[11px] font-mono text-blue-300 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
              Saturday Lunch &amp; Dinner Included With Registration
            </div>
          </div>

          {/* Card 3: Accommodations & Logistics */}
          <div className="ios-glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Lodging &amp; Travel
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Located a 10–15 minute drive from historic downtown Bristol, TN/VA (State Street) and recommended hotels, with Airbnb and VRBO rentals available throughout the Bristol area.
            </p>
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              111 Hwy 44 • Bristol, TN 37620
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
