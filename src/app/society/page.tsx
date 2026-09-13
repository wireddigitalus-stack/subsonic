import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Target, 
  Flame, 
  ShieldCheck, 
  Award, 
  Microscope, 
  Users, 
  Compass, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Society | Precision Is In Our DNA | Subsonic Society",
  description: "Subsonic Society isn't another match organization. It's a grassroots precision-rimfire community built around knowledge, competition, and figuring out what actually works.",
};

export default function SocietyPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="relative w-full h-[450px] max-w-7xl mx-auto opacity-15 filter blur-[1px]">
            <Image
              src="/assets/subsonic-facebook-cover.jpg"
              alt="Subsonic Society Ridge"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-[#07090E]/90 to-[#07090E]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GRASSROOTS PRECISION RIMFIRE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            WE DIDN’T BUILD ANOTHER SANCTIONING BODY. <br />
            <span className="amber-gradient-text">WE BUILT A BROTHERHOOD OF BALLISTICS.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Subsonic Society is a grassroots precision-rimfire community built around real-world knowledge, high-stakes competition, and figuring out what <strong className="text-white">actually works</strong> when a 40-grain lead bullet meets 300 yards of mountain wind.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/join"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-tactical-glow hover:brightness-110 transition-all"
            >
              <Users className="w-4 h-4 fill-black" />
              <span>Join The Society — Free Forever</span>
            </Link>

            <Link
              href="/dna"
              className="px-6 py-3 rounded-xl ios-glass text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Microscope className="w-4 h-4 text-amber-400" />
              <span>Explore Subsonic DNA Lab</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            The Foundation
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            FOUR PILLARS OF SUBSONIC SOCIETY
          </h2>
          <p className="text-sm text-slate-400">
            Every match we hold, every chronograph dataset we publish, and every video we shoot is guided by four immutable convictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="ios-glass rounded-3xl p-8 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              1. Competition Without Gatekeeping
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We design courses of fire that reward mechanical discipline, wind reading, and barricade stability rather than an endless checkbook. From our flagship $7,500 Invitational to local 300X Long Gong challenges, every shooter lines up with an equal chance at glory.
            </p>
            <div className="text-xs font-mono text-amber-400/80 pt-2 flex items-center gap-1">
              <span>EXPLORE SCHEDULE</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="ios-glass rounded-3xl p-8 border border-white/10 space-y-4 hover:border-blue-500/30 transition-all relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              2. Radical Testing & Subsonic DNA
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Manufacturers make bold claims. We verify them on the firing line with LabRadar, Garmin Xero, and high-speed optical cameras. We test ammunition lots, harmonic tuners, carbon vs steel barrels, and cold-bore shifts with unvarnished, publicly verifiable telemetry.
            </p>
            <div className="text-xs font-mono text-blue-400/80 pt-2 flex items-center gap-1">
              <span>VIEW LAB DATA</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="ios-glass rounded-3xl p-8 border border-white/10 space-y-4 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              3. Education & Mentorship
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Precision shooting can feel overwhelming. We demystify atmospheric truing, density altitude adjustments, and natural point of aim through video masterclasses, clinic matches, and open DOPE card drops from top national champions.
            </p>
            <div className="text-xs font-mono text-emerald-400/80 pt-2 flex items-center gap-1">
              <span>LEARN MORE</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="ios-glass rounded-3xl p-8 border border-white/10 space-y-4 hover:border-purple-500/30 transition-all relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
              4. Authentic Grassroots Community
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              At the end of the day, Subsonic Society is about the people huddled under the pavilion sharing hand warmers, loaning spare magazines on the line, and talking ballistics around a campfire at The Hideout after 200 rounds downrange.
            </p>
            <div className="text-xs font-mono text-purple-400/80 pt-2 flex items-center gap-1">
              <span>COMMUNITY STORIES</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* The Story & Philosophy Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-8 sm:p-12 border border-white/10 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              The Origin Story
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              WHY SUBSONIC RIMFIRE IS THE ULTIMATE TRUTH TELLER
            </h2>
          </div>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              In large-caliber centerfire shooting, heavy recoil, massive powder charges, and hyper-velocity can sometimes disguise poor fundamentals or imperfect follow-through. When a 140-grain 6.5 Creedmoor leaves the muzzle at 2,800 feet per second, its flat trajectory covers up slight wind judgment errors inside 500 yards.
            </p>

            <blockquote className="border-l-2 border-amber-500 pl-4 py-1 italic text-white text-base sm:text-lg">
              “Rimfire is merciless. When a 40-grain lead projectile leaves your barrel at 1,060 feet per second, there is zero recoil to mask your flaws. Every breath, every micro-flinch, and every 1-mph wind eddy is etched into the steel.”
            </blockquote>

            <p>
              At 300 yards, a standard velocity .22LR has over 1.2 seconds of flight time and drops more than 35 feet. That means by the time your round strikes a 6-inch gong, you have already breathed twice and watched the bullet trace ripple through the atmosphere.
            </p>

            <p>
              We founded Subsonic Society to create a dedicated haven for shooters who appreciate that nuance. Whether you shoot a tuned CZ 457 or a full custom Vudoo V-22 built on an MDT ACC Elite chassis, you are welcome here.
            </p>
          </div>

          {/* Marksman Code List */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">The Subsonic Marksman Code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Never gatekeep data: share good lots and DOPE cards openly.</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Respect the cold line and master muzzle awareness at all times.</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Test your gear honestly—truth is measured in standard deviations.</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cheer for your competitor’s impact as loudly as your own.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="ios-glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-tactical-glow space-y-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-glow mx-auto">
            <Image
              src="/assets/subsonic-coin.jpg"
              alt="Subsonic Coin"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              BECOME PART OF THE SOCIETY TODAY
            </h3>
            <p className="text-sm text-slate-300">
              Free membership gives you access to the Subsonic DNA testing lab, squad registrations, digital member pass, and community comms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/join"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              Claim Your Free Digital Member ID
            </Link>
            <Link
              href="/matches"
              className="px-8 py-3.5 rounded-2xl ios-glass text-white font-bold text-sm border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              Explore 2026 Matches
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
