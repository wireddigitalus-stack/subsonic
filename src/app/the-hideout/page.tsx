import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Mountain, 
  MapPin, 
  Wind, 
  Target, 
  ShieldCheck, 
  Compass, 
  Calendar, 
  Flame, 
  ExternalLink,
  Building,
  CheckCircle2
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hideout | Invitational Home | Subsonic Society",
  description: "The Hideout is the private range of the Hurley family, sitting on approximately 220 acres near the Tennessee-Virginia line in Bristol, Tennessee.",
};

export default function TheHideoutPage() {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Header */}
      <section className="relative pt-6 pb-12 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="relative w-full h-[500px] max-w-7xl mx-auto opacity-20 filter blur-[1px]">
            <Image
              src="/assets/subsonic-competition-mountain.png"
              alt="The Hideout Mountain Range"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-[#07090E]/90 to-[#07090E]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <Mountain className="w-3.5 h-3.5" />
            <span>THE HIDEOUT — YOUR INVITATIONAL HOME</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              THE HIDEOUT. <br />
              <span className="amber-gradient-text">BRISTOL, TENNESSEE.</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              The Hideout is the private range of the Hurley family, sitting on approximately 220 acres near the Tennessee-Virginia line — but have no fear, it is in Tennessee. The property was built to bring shooting, competition and hospitality together in one private setting.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">PRIVATE SETTING</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">~220 ACRES</span>
              <span className="text-[11px] text-amber-400">Hurley Family Property</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">RIMFIRE RANGE</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">300 YARDS</span>
              <span className="text-[11px] text-blue-400">Dedicated Rimfire &amp; Positional</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">ZERO DISTANCES</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">50 / 100 / 200</span>
              <span className="text-[11px] text-emerald-400">Sight-In Available</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">LOCATION</span>
              <span className="text-sm sm:text-lg font-black text-purple-300 font-mono block truncate">111 HWY 44</span>
              <span className="text-[11px] text-slate-400">Bristol, TN 37620</span>
            </div>
          </div>
        </div>
      </section>

      {/* Range Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            The Hideout — Private Setting
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            INVITATIONAL MATCH FEATURES
          </h2>
          <p className="text-sm text-slate-400">
            Built to bring shooting, competition and hospitality together in one private setting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold">SIGHT-IN &amp; ZERO</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">50 / 100 / 200 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">50, 100 &amp; 200-Yard Zero Available</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              50-yard, 100-yard, and 200-yard zero available for registered competitors during scheduled sight-in hours prior to the match stages.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Zero Distances: 50-yard, 100-yard, and 200-yard zero</li>
              <li>• Schedule: Friday 12:00 – 5:00 PM, Sat &amp; Sun 7:00 – 8:30 AM</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 font-bold">RIMFIRE &amp; POSITIONAL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">300 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">Dedicated 300-Yard Rimfire &amp; PRS-Style Positional Range</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dedicated 300-yard rimfire range and PRS-style positional rifle range set up for the Invitational stages (8 stages Saturday, 4 stages + 2 side stages Sunday).
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Saturday: 8 Stages (First shot 9:00 AM)</li>
              <li>• Sunday: 4 Stages + 2 Side Stages (First shot 9:00 AM)</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-400 font-bold">LONG RANGE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">1,000 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">1,000-Yard Long-Range Rifle Range</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              1,000-yard long-range rifle range across natural Appalachian mountain terrain on the private Hurley family property.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Terrain: Natural mountain elevation and wind channels</li>
              <li>• Setting: Private 220-acre property in Bristol, TN</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">HOSPITALITY</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">24&apos; x 40&apos; PAVILION</span>
            </div>
            <h3 className="text-xl font-bold text-white">24&apos; x 40&apos; Covered Pavilion &amp; 20&apos; x 20&apos; Fire Pit</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              24&apos; x 40&apos; covered pavilion, two restrooms and showers at the shooting range, and a 20&apos; x 20&apos; fire pit ready for relaxing in the evenings.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Hospitality: Saturday lunch and dinner provided</li>
              <li>• Gathering: 24&apos; x 40&apos; covered pavilion &amp; 20&apos; x 20&apos; fire pit</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Atmospheric Conditions Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Range Atmospheric Profile
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              HOW TO SHOOT THE BRISTOL MOUNTAIN CONDITIONS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                <Wind className="w-4 h-4" />
                <span>Thermal Canyon Drafts</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Between 10:00 AM and 1:30 PM, sun warming the valley floor creates strong rising thermals. This generates an apparent 0.3 to 0.5 MIL vertical lift on targets past 250 yards compared to early morning zero.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold font-mono">
                <Mountain className="w-4 h-4" />
                <span>Density Altitude Advantage</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                At 3,420 FT elevation, thinner air reduces aerodynamic drag on the bullet. Trajectories are roughly 5% flatter than sea-level matches, meaning your elevation dials will be slightly lower than baseline DOPE cards.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
                <Compass className="w-4 h-4" />
                <span>Cross-Valley Shear</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Flags at the firing line may read 4 mph from the left, while flags in the mid-draw at 180 yards may be calm or blowing from the right. Trust your mirage over line flags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visiting, Lodging & Directions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Location & Access</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The Hideout is located 20 minutes east of historic Bristol, Tennessee, nestled off Hwy 421 in Sullivan County. Four-wheel drive is recommended during early spring and late fall matches due to unpaved ridge roads.
            </p>
            <div className="p-3 rounded-xl bg-black/40 text-xs font-mono text-amber-400">
              Access: Registered Competitors &amp; Invited Members Only
            </div>
          </div>

          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <span>Competitor Lodging &amp; Dining</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Competitors stay at official Bristol hotels or rent lakeside cabins around South Holston Lake. Saturday lunch and dinner are included for all registered Invitational competitors.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
              <Link
                href="/invitational"
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-extrabold hover:brightness-110 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Calendar className="w-3.5 h-3.5 fill-black" />
                <span>Explore The Invitational</span>
              </Link>
              <Link
                href="/competitor-packet"
                className="px-4 py-2.5 rounded-xl ios-glass text-white text-xs font-bold border border-white/10 hover:bg-white/10 transition-all text-center w-full sm:w-auto"
              >
                <span>2026 Competitor Packet</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
