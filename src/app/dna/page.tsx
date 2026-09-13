"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Microscope, 
  Activity, 
  Target, 
  Sliders, 
  Wind, 
  ArrowDownRight, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown,
  Info,
  Layers,
  Thermometer
} from "lucide-react";

interface AmmoLot {
  id: string;
  brand: string;
  name: string;
  lotNumber: string;
  avgVelocity: number; // fps
  sd: number; // fps
  es: number; // fps
  group50yd: number; // inches (5 shots)
  group100yd: number; // MOA
  group300yd: number; // inches vertical
  tempSensitivity: string;
  notes: string;
  rating: "TOP_TIER_MATCH" | "EXCELLENT" | "PRACTICE_GRADE";
}

const AMMO_LOTS: AmmoLot[] = [
  {
    id: "lot-lapua-cx-32187",
    brand: "Lapua",
    name: "Center-X 40gr LRN",
    lotNumber: "32187 / 2025-Q4",
    avgVelocity: 1062.4,
    sd: 4.8,
    es: 12.2,
    group50yd: 0.198,
    group100yd: 0.38,
    group300yd: 3.4,
    tempSensitivity: "0.4 fps / 10°F",
    notes: "Exceptional lot consistency. Shot through Vudoo V-22 Bartlein 20\". Zero flyers across 100 rounds.",
    rating: "TOP_TIER_MATCH",
  },
  {
    id: "lot-lapua-midas-99120",
    brand: "Lapua",
    name: "Midas+ 40gr Match",
    lotNumber: "99120-M",
    avgVelocity: 1058.1,
    sd: 3.9,
    es: 9.4,
    group50yd: 0.165,
    group100yd: 0.31,
    group300yd: 2.8,
    tempSensitivity: "0.3 fps / 10°F",
    notes: "Gold standard Olympic grade. Sub-3 inch vertical dispersion at 300 yards in mild 4 mph mountain breeze.",
    rating: "TOP_TIER_MATCH",
  },
  {
    id: "lot-eley-tenex-1058",
    brand: "Eley",
    name: "Tenex Flat Nose 40gr",
    lotNumber: "1025-06104",
    avgVelocity: 1066.8,
    sd: 5.2,
    es: 14.1,
    group50yd: 0.210,
    group100yd: 0.42,
    group300yd: 3.8,
    tempSensitivity: "0.6 fps / 10°F",
    notes: "Signature flat nose design cuts clean paper holes. Performs best in tight European match chambers (Anschutz & RimX).",
    rating: "TOP_TIER_MATCH",
  },
  {
    id: "lot-rws-r50-7711",
    brand: "RWS",
    name: "R50 Match 40gr",
    lotNumber: "R50-7711",
    avgVelocity: 1071.2,
    sd: 6.1,
    es: 16.5,
    group50yd: 0.235,
    group100yd: 0.46,
    group300yd: 4.1,
    tempSensitivity: "0.5 fps / 10°F",
    notes: "Very consistent primer seating depth. Smooth chamber feed with slight velocity pickup on hot summer afternoons.",
    rating: "EXCELLENT",
  },
  {
    id: "lot-sk-match-4412",
    brand: "SK",
    name: "Rifle Match 40gr",
    lotNumber: "SK-24-4412",
    avgVelocity: 1051.6,
    sd: 7.9,
    es: 21.0,
    group50yd: 0.310,
    group100yd: 0.62,
    group300yd: 5.8,
    tempSensitivity: "0.8 fps / 10°F",
    notes: "Outstanding club match and practice lot. Economical performance with occasional vertical dispersion past 200 yards.",
    rating: "EXCELLENT",
  },
];

const TUNER_TESTS = [
  {
    tuner: "Harrell Precision Rimfire Tuner",
    barrel: "Bartlein MTU 20\" (1:16 Twist)",
    baselineGroup100: "0.48 MOA (Tuner Off)",
    tunedGroup100: "0.26 MOA (Setting 14.5)",
    notes: "Dramatic reduction in vertical stringing. Required 1/4 click adjustments per 5°F ambient temperature shift.",
  },
  {
    tuner: "EC Tuner Brake (Eric Cortina)",
    barrel: "Proof Research Carbon 22\" (1:16 Twist)",
    baselineGroup100: "0.55 MOA",
    tunedGroup100: "0.32 MOA (Setting 18)",
    notes: "Dual benefit: subtle recoil moderation for sight picture retention and clean harmonic node stabilization.",
  },
  {
    tuner: "PVA Mad Scientist Rimfire",
    barrel: "MullerWorks 8-Groove 24\" (1:14.5 Twist)",
    baselineGroup100: "0.41 MOA",
    tunedGroup100: "0.22 MOA (Setting 09)",
    notes: "Tuned specifically for Lapua Midas+. Exceptional 300-yard stability with zero transonic wobble.",
  },
];

export default function SubsonicDnaPage() {
  const [selectedLot, setSelectedLot] = useState<AmmoLot>(AMMO_LOTS[0]);
  const [activeTab, setActiveTab] = useState<"LOT_TESTING" | "TUNERS" | "DOPE_WIND" | "BARRELS">("LOT_TESTING");

  return (
    <div className="space-y-12 pb-20">
      {/* Schema.org TechArticle JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Subsonic DNA: Precision .22LR Ammunition Lot Testing & Rimfire Ballistics",
            "description": "Comprehensive chronograph, velocity SD/ES, and 50 to 300 yard dispersion testing across Lapua, Eley, RWS, and harmonic tuners.",
            "author": {
              "@type": "Organization",
              "name": "Subsonic Society Ballistics Lab"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Subsonic Society"
            }
          }),
        }}
      />

      {/* Header Banner */}
      <section className="relative pt-6 pb-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold">
            <Microscope className="w-3.5 h-3.5" />
            <span>SUBSONIC DNA • RIGOROUS BALLISTIC TELEMETRY</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              PRECISION IS IN OUR DNA. <br />
              <span className="amber-gradient-text">THE SUBSONIC TESTING LAB.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We don&apos;t guess. We verify. Explore empirical chronograph data, lot variance, barrel harmonic tuning matrices, and extreme 300-yard rimfire bullet behavior under high-altitude Appalachian atmospheric conditions.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">TESTED ROUNDS</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">14,280+</span>
              <span className="text-[11px] text-emerald-400">Garmin Xero & LabRadar</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">LOWEST SD LOGGED</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">3.9 FPS</span>
              <span className="text-[11px] text-slate-400">Lapua Midas+ Lot 99120</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">MAX DISTANCE TESTED</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">465 YARDS</span>
              <span className="text-[11px] text-slate-400">Subsonic Flight 1.62s</span>
            </div>
            <div className="p-4 rounded-2xl ios-glass border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">TEST BENCH ELEVATION</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">3,420 FT</span>
              <span className="text-[11px] text-slate-400">The Hideout Ridge Bay</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 p-1.5 ios-glass rounded-2xl border border-white/10 overflow-x-auto no-scrollbar touch-pan-x">
          <button
            onClick={() => setActiveTab("LOT_TESTING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "LOT_TESTING"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ammunition Lot Database</span>
          </button>

          <button
            onClick={() => setActiveTab("TUNERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "TUNERS"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Harmonic Tuner Tests</span>
          </button>

          <button
            onClick={() => setActiveTab("DOPE_WIND")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "DOPE_WIND"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Mountain DOPE & Wind Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("BARRELS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "BARRELS"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Custom Barrels & Builds</span>
          </button>
        </div>
      </section>

      {/* Main Tab Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === "LOT_TESTING" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Ammo Lots List */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Select Ammunition Batch
              </span>
              <div className="space-y-2">
                {AMMO_LOTS.map((lot) => {
                  const isSelected = selectedLot.id === lot.id;
                  return (
                    <button
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? "ios-glass-card border-amber-500/60 shadow-tactical-glow bg-amber-500/5"
                          : "ios-glass border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-mono text-amber-400 font-bold">
                            {lot.brand}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {lot.name}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          SD {lot.sd}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Lot: {lot.lotNumber}</span>
                        <span className="text-white font-bold">{lot.avgVelocity} FPS</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Lot Telemetry Card */}
            <div className="lg:col-span-2 ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                    Detailed Ballistic Telemetry Card
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedLot.brand} {selectedLot.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Batch Serial: {selectedLot.lotNumber}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  {selectedLot.rating.replace(/_/g, " ")}
                </div>
              </div>

              {/* Chronograph Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">AVG VELOCITY</span>
                  <span className="text-lg font-black font-mono text-white">
                    {selectedLot.avgVelocity} <span className="text-xs text-slate-400">FPS</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">STANDARD DEV (SD)</span>
                  <span className="text-lg font-black font-mono text-amber-400">
                    {selectedLot.sd} <span className="text-xs text-slate-400">FPS</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">EXTREME SPREAD (ES)</span>
                  <span className="text-lg font-black font-mono text-blue-400">
                    {selectedLot.es} <span className="text-xs text-slate-400">FPS</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">TEMP COEFF</span>
                  <span className="text-sm font-bold font-mono text-purple-300">
                    {selectedLot.tempSensitivity}
                  </span>
                </div>
              </div>

              {/* Distance Group Dispersion Targets */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Dispersion Matrix Across Distances
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>50 Yards</span>
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      {selectedLot.group50yd}&quot;
                    </div>
                    <p className="text-[11px] text-slate-400">5-shot center-to-center</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>100 Yards</span>
                      <Target className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      {selectedLot.group100yd} MOA
                    </div>
                    <p className="text-[11px] text-slate-400">True angular dispersion</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>300 Yards</span>
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      {selectedLot.group300yd}&quot;
                    </div>
                    <p className="text-[11px] text-slate-400">Vertical stringing on steel</p>
                  </div>
                </div>
              </div>

              {/* Lab Technician Observations */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                  <Info className="w-4 h-4" />
                  <span>Subsonic DNA Lab Technician Notes</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedLot.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "TUNERS" && (
          <div className="space-y-6">
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="text-2xl font-black text-white">
                HARMONIC TUNER EFFECTIVENESS TESTS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                Does an adjustable barrel weight actually shrink rimfire groups? We tested leading tuners across high-end match barrels using 100-round sample batches of Lapua Center-X to map acoustic node convergence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TUNER_TESTS.map((t, idx) => (
                <div
                  key={idx}
                  className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{t.tuner}</h4>
                    <p className="text-xs text-amber-400 font-mono mt-0.5">{t.barrel}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                    <div className="flex justify-between p-2 rounded bg-black/30">
                      <span className="text-slate-400">Baseline (No Tuner):</span>
                      <span className="font-mono text-slate-300">{t.baselineGroup100}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      <span>Tuned Sweet Spot:</span>
                      <span className="font-mono">{t.tunedGroup100}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {t.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "DOPE_WIND" && (
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                HIGH-ALTITUDE MOUNTAIN DOPE MATRIX (3,420 FT)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Calculated for standard 40gr lead projectile at 1,060 FPS muzzle velocity with a 50-yard zero, 72°F, 29.92 inHg, and 55% humidity.
              </p>
            </div>

            <div className="overflow-x-auto ios-scrollbar touch-pan-x pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
              <div className="sm:hidden text-[10px] text-amber-400/80 font-mono mb-2 flex items-center gap-1">
                <span>← Swipe table horizontally for full 465-yard wind holds →</span>
              </div>
              <table className="w-full text-left text-xs font-mono min-w-[620px]">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4">DISTANCE</th>
                    <th className="py-3 px-4">ELEVATION (MIL)</th>
                    <th className="py-3 px-4">ELEVATION (MOA)</th>
                    <th className="py-3 px-4">FLIGHT TIME</th>
                    <th className="py-3 px-4">VELOCITY REMAINING</th>
                    <th className="py-3 px-4 text-amber-400">5 MPH 90° WIND</th>
                    <th className="py-3 px-4 text-amber-400">10 MPH 90° WIND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {[
                    { dist: "50 Yds", mil: "0.0 MIL", moa: "0.0 MOA", time: "0.14 s", rem: "1,012 fps", w5: "0.2 MIL", w10: "0.4 MIL" },
                    { dist: "100 Yds", mil: "1.9 MIL", moa: "6.5 MOA", time: "0.30 s", rem: "945 fps", w5: "0.5 MIL", w10: "1.0 MIL" },
                    { dist: "150 Yds", mil: "4.2 MIL", moa: "14.4 MOA", time: "0.48 s", rem: "888 fps", w5: "0.8 MIL", w10: "1.6 MIL" },
                    { dist: "200 Yds", mil: "7.1 MIL", moa: "24.4 MOA", time: "0.68 s", rem: "838 fps", w5: "1.2 MIL", w10: "2.3 MIL" },
                    { dist: "250 Yds", mil: "10.6 MIL", moa: "36.4 MOA", time: "0.91 s", rem: "792 fps", w5: "1.5 MIL", w10: "3.1 MIL" },
                    { dist: "300 Yds", mil: "14.8 MIL", moa: "50.9 MOA", time: "1.16 s", rem: "750 fps", w5: "1.9 MIL", w10: "3.9 MIL" },
                    { dist: "350 Yds", mil: "19.8 MIL", moa: "68.1 MOA", time: "1.44 s", rem: "712 fps", w5: "2.4 MIL", w10: "4.8 MIL" },
                    { dist: "400 Yds", mil: "25.6 MIL", moa: "88.0 MOA", time: "1.74 s", rem: "677 fps", w5: "2.9 MIL", w10: "5.8 MIL" },
                    { dist: "465 Yds", mil: "34.2 MIL", moa: "117.5 MOA", time: "2.18 s", rem: "634 fps", w5: "3.6 MIL", w10: "7.2 MIL" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.dist}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{row.mil}</td>
                      <td className="py-3 px-4 text-slate-300">{row.moa}</td>
                      <td className="py-3 px-4 text-slate-400">{row.time}</td>
                      <td className="py-3 px-4 text-slate-400">{row.rem}</td>
                      <td className="py-3 px-4 text-amber-400">{row.w5}</td>
                      <td className="py-3 px-4 text-amber-300">{row.w10}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "BARRELS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-white">Twist Rate Comparison: 1:16 vs 1:14</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Standard rimfire barrels utilize a 1:16 twist, optimized for 40gr lead round-nose ammo inside 100 yards. However, in long-range rimfire competitions stretching to 300+ yards, faster 1:14 or 1:14.5 twist barrels (such as MullerWorks 8-groove) provide higher gyroscopic stability (Sg &gt; 1.8) that prevents bullet yaw as the projectile drops through the transonic speed barrier.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-amber-400">
                RECOMMENDATION: For matches featuring steel beyond 250 yards, 1:14.5 twist consistently delivers tighter vertical groups.
              </div>
            </div>

            <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-white">Chamber Leade & Bore Profiling</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                European rimfire ammunition (Lapua / Eley) uses slightly different bullet ogive and driving band diameters. Match chambers cut with a Calfee or EPS reamer engage the rifling lands upon bolt closure, ensuring perfect concentricity before ignition.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-blue-300">
                PRO TIP: Always measure bolt close resistance when switching from SK to Eley Tenex to prevent bullet deformation.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Lab Community Dispatch CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <div className="ios-glass-card rounded-3xl p-8 border border-blue-500/30 space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            WANT YOUR AMMUNITION LOT BENCHMARKED?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Subsonic Society members can submit ammunition lots for our digital testing queue at The Hideout. We return full Garmin velocity plots and 300-yard high-speed video trace.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-extrabold text-xs shadow-tactical-glow hover:brightness-110 transition-all"
          >
            <span>Register as Society Tester</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
