"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Trophy, 
  Crosshair, 
  Target, 
  Award, 
  Quote, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface Shooter {
  id: string;
  name: string;
  callsign: string;
  division: string;
  ranking: string;
  homeRange: string;
  podiums: number;
  featuredMatch: string;
  quote: string;
  rifleSetup: {
    action: string;
    barrel: string;
    trigger: string;
    chassis: string;
    optic: string;
    mount: string;
    tuner: string;
    ammoLot: string;
  };
  interview: {
    question: string;
    answer: string;
  }[];
}

const SHOOTERS_DATA: Shooter[] = [
  {
    id: "wyatt-sterling",
    name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    division: "Open Division Pro",
    ranking: "National Rank #4 • Appalachian Cup 1st Place",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 14,
    featuredMatch: "The Subsonic Society Invitational 2026",
    quote: "In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.",
    rifleSetup: {
      action: "Vudoo Gun Works V-22 (3-Lug Rimfire)",
      barrel: "Bartlein MTU 20\" Match (1:16 Twist)",
      trigger: "Bix'n Andy TacSport PRO (4.2 oz)",
      chassis: "MDT ACC Elite Chassis with Titanium Weights",
      optic: "Zero Compromise Optic ZC527 MPCT3X",
      mount: "Spuhr QDP-4002 0 MOA with Level",
      tuner: "Harrell Precision Custom Rimfire Tuner",
      ammoLot: "Lapua Center-X Lot #32187 (1,062 FPS)",
    },
    interview: [
      {
        question: "How do you read mirage on targets past 300 yards in the Tennessee high country?",
        answer: "I back my magnification down from 25x to around 16x. High mag over-exaggerates boiling heat shimmer and makes the steel dance. By backing off, I can see the horizontal boil direction clearly and hold the true center of the plate."
      },
      {
        question: "What is your pre-match lot testing routine?",
        answer: "I clean down to bare metal with Bore Tech Rimfire Blend, shoot 30 rounds of the test lot to season the wax lubricant in the bore, and then fire three consecutive 10-shot groups through a Garmin Xero chronograph. If the SD is over 6 fps, it becomes practice ammo."
      },
      {
        question: "What advice do you give someone shooting their first match at The Hideout?",
        answer: "Don't rush the clock. Most beginners burn their 90 seconds panicking on barricade position. Build a rock-solid rear bag foundation first; a 3-second delay building the bag beats a 0-for-2 miss every single time."
      }
    ]
  },
  {
    id: "kendra-cross",
    name: "Kendra 'Coldbore' Cross",
    callsign: "COLDBORE",
    division: "Open Rimfire Pro",
    ranking: "Southeast Regional Champion • Top Lady Marksman",
    homeRange: "Smoky Mountain Precision, TN",
    podiums: 19,
    featuredMatch: "300X Long Gong Challenge",
    quote: "Subsonic rimfire is pure shooting discipline. Without recoil to mask your flaws, every breath and trigger press is written directly onto the steel plate.",
    rifleSetup: {
      action: "Zermatt RimX Precision Rimfire Action",
      barrel: "Proof Research Competition Contour 22\"",
      trigger: "TriggerTech Diamond Single-Stage (6 oz)",
      chassis: "Foundation Revelation Heavy Stock (Dark Distressed)",
      optic: "Tangent Theta TT525P Gen 3XR",
      mount: "Hawkins Precision Ultra Light Tactical",
      tuner: "EC Tuner Brake (Eric Cortina)",
      ammoLot: "Eley Tenex Batch 1058 (1,066 FPS)",
    },
    interview: [
      {
        question: "Why did you choose the Foundation stock over an aluminum chassis?",
        answer: "The micarta composite deadens vibrational energy in a way metal can't replicate. On barricades, when you plant the rifle into wood or rock props, the rifle settles into your shoulder instantly with zero bounce."
      },
      {
        question: "How critical is chronograph SD at 300 yards?",
        answer: "At 50 yards, an SD of 12 fps won't hurt you. But at 300 yards, a 20 fps spread equates to over 8 inches of vertical dispersion—meaning you can hold perfectly center and miss completely over the top or into the dirt. Low SD is non-negotiable."
      }
    ]
  },
  {
    id: "eli-mcallister",
    name: "Eli 'Dialed' McAllister",
    callsign: "DIALED",
    division: "Production Division Champion",
    ranking: "Appalachian Cup Production 1st",
    homeRange: "Tri-Cities Rimfire Club, Bristol, TN",
    podiums: 8,
    featuredMatch: "200X Mountain Match",
    quote: "You don't need a $10,000 custom rig to win if you master stage timing, barricade stability, and find a lot of ammunition your factory barrel loves.",
    rifleSetup: {
      action: "CZ 457 MTR (Match Target Rifle Factory Tuned)",
      barrel: "Factory 20.5\" Match Chamber Cold Hammer Forged",
      trigger: "Yo-Dave Spring Mod (12 oz)",
      chassis: "MDT XRS Hybrid Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      mount: "Seekins Precision Match Rings",
      tuner: "None (Production Spec)",
      ammoLot: "SK Rifle Match Lot #4412 (1,051 FPS)",
    },
    interview: [
      {
        question: "What is your secret to out-shooting custom rifles with a factory CZ 457?",
        answer: "I spent all my money on ammo lots instead of titanium actions. I tested 14 different lots of SK and Lapua until I found one that shot 0.28 MOA at 100 yards. The rifle doesn't know how much it costs; it only knows how true the bullet is."
      }
    ]
  }
];

export default function ShootersPage() {
  const [selectedShooter, setSelectedShooter] = useState<Shooter>(SHOOTERS_DATA[0]);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>SUBSONIC SOCIETY ATHLETES & BUILD REVIEWS</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              MEET THE MARKSMEN. <br />
              <span className="amber-gradient-text">GEAR, DISCIPLINE & INTERVIEWS.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real competitors. Real equipment. No sponsored fluff. Explore the exact actions, barrels, triggers, and ammunition lots run by top regional and national precision rimfire podium finishers.
            </p>
          </div>
        </div>
      </section>

      {/* Shooters Showcase Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Shooter Selectors */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
              Featured Athletes
            </span>

            <div className="space-y-3">
              {SHOOTERS_DATA.map((shooter) => {
                const isSelected = selectedShooter.id === shooter.id;
                return (
                  <button
                    key={shooter.id}
                    onClick={() => setSelectedShooter(shooter)}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${
                      isSelected
                        ? "ios-glass-card border-amber-500/60 shadow-tactical-glow bg-amber-500/5"
                        : "ios-glass border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                          {shooter.division}
                        </div>
                        <h3 className="text-lg font-black text-white">
                          {shooter.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {shooter.ranking}
                        </p>
                      </div>

                      <div className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-mono font-bold shrink-0">
                        {shooter.podiums} Podiums
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nomination Card */}
            <div className="p-5 rounded-2xl ios-glass border border-white/10 space-y-3 mt-6">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase block">
                Nominate a Shooter
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Know a marksman making waves in PRS Rimfire or NRL22? Submit their profile to be featured on Subsonic Society.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-amber-400 transition-colors"
              >
                <span>Submit Athlete Story</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Deep Profile & Rifle Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                      {selectedShooter.callsign}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedShooter.homeRange}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    {selectedShooter.name}
                  </h2>
                  <p className="text-sm font-semibold text-emerald-400">
                    {selectedShooter.ranking}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">PODIUM FINISHES</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {selectedShooter.podiums}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <div className="relative p-5 rounded-2xl bg-black/40 border border-white/5 italic text-slate-200 text-sm leading-relaxed">
                <Quote className="w-6 h-6 text-amber-500/40 absolute top-3 right-3 pointer-events-none" />
                &ldquo;{selectedShooter.quote}&rdquo;
              </div>

              {/* Complete Equipment Blueprint */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4" />
                    <span>Competition Rifle Specs</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Verified Match Gear</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">ACTION</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.action}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">BARREL</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.barrel}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">TRIGGER</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.trigger}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">CHASSIS / STOCK</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.chassis}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">OPTIC</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.optic}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">RINGS & MOUNT</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.mount}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">HARMONIC TUNER</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.tuner}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">AMMUNITION LOT</span>
                    <span className="font-bold text-amber-400">{selectedShooter.rifleSetup.ammoLot}</span>
                  </div>
                </div>
              </div>

              {/* Long-form Q&A Interview */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>In The Crosshairs: Interview with {selectedShooter.name.split(" ")[0]}</span>
                </h3>

                <div className="space-y-4">
                  {selectedShooter.interview.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                      <div className="text-xs font-mono font-bold text-amber-400">
                        Q: {item.question}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
