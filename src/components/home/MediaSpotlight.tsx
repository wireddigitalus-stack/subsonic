"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Award, 
  Target, 
  Wrench, 
  Flame, 
  Sparkles, 
  Compass, 
  ChevronRight,
  ShieldCheck,
  Disc
} from "lucide-react";
import { INITIAL_ATHLETES } from "@/lib/initial-data";

export function MediaSpotlight() {
  const [selectedAthlete, setSelectedAthlete] = useState(INITIAL_ATHLETES[0]);

  return (
    <section data-section="media-spotlight" className="py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Subsonic Society Media & Athletes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              PRECISION ATHLETES & <span className="amber-gradient-text">CUSTOM HARDWARE</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md">
            We spotlight the shooters, custom rimfire actions, Lothar/Bartlein match barrels, and subsonic ballistics that conquer the mountain stages.
          </p>
        </div>

        {/* Featured Athlete & Rifle Build Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Athlete Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Featured Pro Competitors
            </h3>
            <div className="space-y-2">
              {INITIAL_ATHLETES.map((athlete) => {
                const isSelected = selectedAthlete.id === athlete.id;
                return (
                  <button
                    key={athlete.id}
                    onClick={() => setSelectedAthlete(athlete)}
                    data-telemetry={`athlete_select_${athlete.id}`}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? "ios-glass bg-white/10 border-amber-500/40 shadow-tactical-glow"
                        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-black/60 flex items-center justify-center">
                        <Image
                          src={athlete.imageUrl}
                          alt={athlete.name}
                          width={40}
                          height={40}
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {athlete.name}
                        </div>
                        <div className="text-xs text-amber-400/90 font-mono">
                          {athlete.division}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                  </button>
                );
              })}
            </div>

            {/* Subsonic Precision Creed & Emblem Box */}
            <div className="ios-glass-card rounded-2xl p-5 border border-amber-500/30 space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400/40 shadow-tactical-glow shrink-0">
                  <Image
                    src="/assets/subsonic-coin.jpg"
                    alt="Subsonic Society Emblem"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                    Precision Is In Our DNA
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    Subsonic Society Crest
                  </h4>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Symbol of our grassroots commitment to unvarnished ballistic data, mechanical discipline, and high-altitude mountain precision.
              </p>
            </div>
          </div>

          {/* Detailed Rifle Build & Ballistics Card (8 cols) */}
          <div className="lg:col-span-8 ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedAthlete.ranking}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedAthlete.homeRange}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedAthlete.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-mono text-slate-400">PODIUM FINISHES</div>
                    <div className="text-lg font-mono font-black text-white">
                      {selectedAthlete.podiums} Top 3 Medals
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="p-4 rounded-2xl bg-white/[0.02] border-l-2 border-amber-400 text-sm sm:text-base italic text-slate-300">
                &ldquo;{selectedAthlete.quote}&rdquo;
              </blockquote>

              {/* Rifle Setup Specs Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                  <Wrench className="w-4 h-4" />
                  <span>Competition Match Rifle Specs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "PRECISION ACTION", value: selectedAthlete.rifleSetup.action },
                    { label: "MATCH BARREL", value: selectedAthlete.rifleSetup.barrel },
                    { label: "CHASSIS SYSTEM", value: selectedAthlete.rifleSetup.chassis },
                    { label: "COMPETITION OPTIC", value: selectedAthlete.rifleSetup.optic },
                    { label: "MATCH AMMO", value: selectedAthlete.rifleSetup.ammo },
                    { label: "MUZZLE VELOCITY", value: "1055 FPS (Subsonic 0.94 Mach)" },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3 rounded-xl bg-black/40 border border-white/5"
                    >
                      <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                        {spec.label}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white mt-0.5 truncate">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom highlight pill */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Target className="w-4 h-4 text-amber-400" />
                Zeroed at 50 Yds • Dialed to 465 Yds (34.2 Mils Elevation)
              </span>
              <span>Subsonic Society Official Athlete Profile</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
