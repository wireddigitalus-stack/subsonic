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
  title: "The Hideout | Official Range & Topography | Subsonic Society",
  description: "Perched at 3,420 FT in the Bristol TN high country, The Hideout is the testing ground and home facility of Subsonic Society. Steel hung out to 465 yards.",
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
            <span>HOME FACILITY & BALLISTICS PROVING GROUND</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              THE HIDEOUT. <br />
              <span className="amber-gradient-text">BRISTOL, TENNESSEE HIGH COUNTRY.</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              Perched at 3,420 feet along the Holston mountain ridgeline, The Hideout is the spiritual home and rigorous testing facility of Subsonic Society. Here, shifting mountain thermals, canyon shadows, and steel hung past 400 yards challenge every marksman.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">ELEVATION</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">3,420 FT</span>
              <span className="text-[11px] text-amber-400">Low Drag Atmosphere</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">MAX ENGAGEMENT</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">465 YARDS</span>
              <span className="text-[11px] text-blue-400">Deep Valley Steel</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">FIRING LANES</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">24 COVERED</span>
              <span className="text-[11px] text-emerald-400">Concrete Benches</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">COORDINATES</span>
              <span className="text-base sm:text-lg font-black text-purple-300 font-mono">36.59° N, 82.18° W</span>
              <span className="text-[11px] text-slate-400">Bristol, TN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Range Topography & Sectors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            Tactical Topography
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            FOUR SPECIALIZED SHOOTING SECTORS
          </h2>
          <p className="text-sm text-slate-400">
            From millimeter paper zeroing to extreme long-range subsonic glide down the canyon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector 1 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold">SECTOR 1 • ZERO BAY</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">50 METERS</span>
            </div>
            <h3 className="text-xl font-bold text-white">Olympic Paper & Chrono Pavilion</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              24 covered shooting bays equipped with heavy poured-concrete benches, integrated target cameras, and dedicated Garmin Xero / LabRadar mount stations. The perfect wind-baffled zeroing environment for precision lot tests and cold-bore truing.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Wind Baffles: Side acoustic retaining berms</li>
              <li>• Targets: Electronic target monitors + 1/4&quot; precision paper grids</li>
            </ul>
          </div>

          {/* Sector 2 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 font-bold">SECTOR 2 • POSITIONAL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">75 – 220 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">The Barricade Proving Grounds</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dedicated match training ground featuring authentic competition props: steel tank traps, dual rooftop pitches, wire ranch gates, spool pyramids, and unstable suspended platforms. Steel reactive targets range from 2&quot; KYL paddles to 66% IPSC silhouettes.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Props: 14 match-grade positional barricades</li>
              <li>• Targets: AR500 reactive flashers and Know-Your-Limits racks</li>
            </ul>
          </div>

          {/* Sector 3 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-400 font-bold">SECTOR 3 • LONG GONG</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">250 – 385 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">Holston Notch Ridge Line</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fired from natural elevated boulder shelves overlooking the hollow. Crosswinds funneling through the mountain cut produce deceptive lateral deflection requiring competitors to read mirage and pine tree branches across 3 separate distance zones.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Terrain: 18° downward slope into natural valley</li>
              <li>• Flight Time: 1.1 to 1.5 seconds per shot</li>
            </ul>
          </div>

          {/* Sector 4 */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">SECTOR 4 • EXTREME STEEL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">400 – 465 YDS</span>
            </div>
            <h3 className="text-xl font-bold text-white">The Subsonic Canyon Glide</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The ultimate rimfire test. Pushing standard velocity 40gr ammunition to its ballistic limits. Bullet drop exceeds 34 Mils (over 45 feet of trajectory arc) with flight times exceeding two full seconds before the distinctive &lsquo;clang&rsquo; returns.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              <li>• Optics Requirement: High-elevation 34mm tubes or 30+ MOA rails</li>
              <li>• Hit Confirmation: High-visibility kinetic flasher plates</li>
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
            <div className="p-3 rounded-xl bg-black/40 text-xs font-mono text-slate-300 space-y-1">
              <div>GPS: 36°35&apos;42.4&quot;N 82°11&apos;19.3&quot;W</div>
              <div className="text-amber-400">Access: Registered Competitors & Members Only</div>
            </div>
          </div>

          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <span>Competitor Lodging & Dining</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Competitors stay at the historic Bristol Hotel in downtown Bristol or rent lakeside cabins around South Holston Lake. The region is famous for Appalachian BBQ, trout fishing, and the Bristol Motor Speedway.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/matches"
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 fill-black" />
                <span>View Matches at The Hideout</span>
              </Link>
              <Link
                href="/join"
                className="px-4 py-2 rounded-xl ios-glass text-white text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"
              >
                <span>Request Range Access Pass</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
