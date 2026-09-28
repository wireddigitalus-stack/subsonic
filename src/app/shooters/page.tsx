"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  CheckCircle2,
  Search,
  PlusCircle,
  Camera,
  ExternalLink,
  Tag,
  Star
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

// Seed fallback data to guarantee immediate rendering even if network lags
const FALLBACK_SHOOTERS: ShooterProfile[] = [
  {
    id: "wyatt-sterling",
    name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    division: "Open Division Pro",
    ranking: "National Rank #4 • Appalachian Cup 1st Place",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 14,
    featuredMatch: "The Subsonic Society Invitational 2026",
    image: "/assets/subsonic-coin.jpg",
    quote: "In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.",
    accolades: ["TEAM USA 🇺🇸", "APPALACHIAN CUP CHAMPION", "NATIONAL RANK #4"],
    sponsors: ["Modacam Custom Rifles", "Vudoo Gun Works", "Lapua Rimfire"],
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
      }
    ],
    createdAt: "2026-09-01T00:00:00Z",
    status: "PUBLISHED"
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
    image: "/assets/subsonic-logo-dark.png",
    quote: "Subsonic rimfire is pure shooting discipline. Without recoil to mask your flaws, every breath and trigger press is written directly onto the steel plate.",
    accolades: ["TOP LADY MARKSMAN", "SOUTHEAST REGIONAL CHAMPION"],
    sponsors: ["Zermatt Arms", "Foundation Stocks", "Eley Tenex"],
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
      }
    ],
    createdAt: "2026-09-05T00:00:00Z",
    status: "PUBLISHED"
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
    image: "/assets/subsonic-logo-round.png",
    quote: "You don't need a $10,000 custom rig to win if you master stage timing, barricade stability, and find a lot of ammunition your factory barrel loves.",
    accolades: ["PRODUCTION DIVISION CHAMPION", "APPALACHIAN 1ST PLACE"],
    sponsors: ["CZ USA", "MDT Sporting Goods", "SK Ammunition"],
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
    ],
    createdAt: "2026-09-10T00:00:00Z",
    status: "PUBLISHED"
  }
];

function ShootersContent() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [shooters, setShooters] = useState<ShooterProfile[]>(FALLBACK_SHOOTERS);
  const [selectedShooter, setSelectedShooter] = useState<ShooterProfile>(FALLBACK_SHOOTERS[0]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");

  useEffect(() => {
    const fetchShooters = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/shooters");
        if (res.ok) {
          const data = await res.json();
          if (data.shooters && data.shooters.length > 0) {
            setShooters(data.shooters);
            // If requested ID in URL, select it
            if (requestedId) {
              const matched = data.shooters.find((s: ShooterProfile) => s.id === requestedId);
              if (matched) {
                setSelectedShooter(matched);
                return;
              }
            }
            setSelectedShooter(data.shooters[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live shooters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShooters();
  }, [requestedId]);

  // Handle filtering
  const filteredShooters = shooters.filter((shooter) => {
    const matchesDiv = divisionFilter === "ALL" || shooter.division.toLowerCase().includes(divisionFilter.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      shooter.name.toLowerCase().includes(query) ||
      shooter.callsign.toLowerCase().includes(query) ||
      shooter.ranking.toLowerCase().includes(query) ||
      shooter.homeRange.toLowerCase().includes(query) ||
      (shooter.sponsors && shooter.sponsors.some((s) => s.toLowerCase().includes(query)));

    return matchesDiv && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-24">
      {/* Header with Call-to-Action */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>SUBSONIC SOCIETY ATHLETES & RIG BLUEPRINTS</span>
            </div>

            <Link
              href="/shooters/intake"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Auto-Generate Your Shooter Card</span>
            </Link>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              MEET THE MARKSMEN. <br />
              <span className="amber-gradient-text">GEAR, DISCIPLINE & INTERVIEWS.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real competitors. Real equipment. No sponsored fluff. Explore the exact actions, barrels, triggers, and ammunition lots run by regional and national precision rimfire podium finishers.
            </p>
          </div>
        </div>
      </section>

      {/* Shooters Showcase Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Shooter Selectors + Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Featured Competitors ({filteredShooters.length})
              </span>
              <Link
                href="/shooters/intake"
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Add Profile</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, callsign, sponsor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Division Filters */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "ALL", label: "All" },
                { id: "Open", label: "Open Pro" },
                { id: "Production", label: "Production" },
                { id: "Ladies", label: "Ladies" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDivisionFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors ${
                    divisionFilter === tab.id
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Shooter List */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-3 pb-2 lg:pb-0">
              {filteredShooters.length === 0 ? (
                <div className="p-4 rounded-xl ios-glass text-center text-xs text-slate-400">
                  No competitors matched your search.
                </div>
              ) : (
                filteredShooters.map((shooter) => {
                  const isSelected = selectedShooter.id === shooter.id;
                  return (
                    <button
                      key={shooter.id}
                      onClick={() => setSelectedShooter(shooter)}
                      className={`w-[280px] sm:w-[320px] lg:w-full shrink-0 lg:shrink text-left p-4 sm:p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? "ios-glass-card border-amber-500/60 shadow-tactical-glow bg-amber-500/5"
                          : "ios-glass border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/60 shadow-sm relative shrink-0 bg-black">
                            {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") ? (
                              <img
                                src={shooter.image}
                                alt={shooter.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                                {shooter.callsign?.slice(0, 2) || "SS"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase truncate">
                              {shooter.division}
                            </div>
                            <h3 className="text-sm font-black text-white truncate">
                              {shooter.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {shooter.ranking}
                            </p>
                          </div>
                        </div>

                        <div className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold shrink-0">
                          {shooter.podiums} Podiums
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Nomination / Self-Submission Card */}
            <div className="p-5 rounded-2xl ios-glass border border-amber-500/20 bg-amber-500/5 space-y-3 mt-4 lg:mt-6">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated Athlete Dossier</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you shooting in the 2026 Invitational or Appalachian circuit? Complete the 2-minute questionnaire to auto-generate your competitor card.
              </p>
              <Link
                href="/shooters/intake"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Launch Intake Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Deep Profile & Rifle Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="ios-glass rounded-3xl p-5 sm:p-8 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] bg-black relative shrink-0">
                    {selectedShooter.image?.startsWith("data:") || selectedShooter.image?.startsWith("/") ? (
                      <img
                        src={selectedShooter.image}
                        alt={selectedShooter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-xl">
                        {selectedShooter.callsign || "SS"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                        {selectedShooter.callsign}
                      </span>
                      <span className="text-xs font-mono text-slate-400 truncate">
                        {selectedShooter.homeRange}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white">
                      {selectedShooter.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                      {selectedShooter.ranking}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">PODIUM FINISHES</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {selectedShooter.podiums}
                  </span>
                </div>
              </div>

              {/* Accolades & Badges if present */}
              {selectedShooter.accolades && selectedShooter.accolades.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedShooter.accolades.map((acc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{acc}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Sponsors Chips */}
              {selectedShooter.sponsors && selectedShooter.sponsors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    Official Factory & Industry Sponsors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedShooter.sponsors.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-white/5 border border-white/10 text-slate-300"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action / Rig Photo (if present) */}
              {selectedShooter.actionPhoto && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    <span>Rifle Rig in Action</span>
                  </span>
                  <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-white/10 relative bg-black">
                    <img
                      src={selectedShooter.actionPhoto}
                      alt={`${selectedShooter.name} Rifle Rig`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

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
                    <span>Competition Rifle Blueprint</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Verified Precision Specs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">ACTION</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.action || "Custom Rimfire"}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">BARREL</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.barrel || "Match Barrel"}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">TRIGGER</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.trigger || "Match Spec"}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">CHASSIS / STOCK</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.chassis || "Precision Chassis"}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">OPTIC</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.optic || "Competition Glass"}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">RINGS & MOUNT</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup?.mount || "Direct Clamp"}</span>
                  </div>

                  {selectedShooter.rifleSetup?.tuner && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block">HARMONIC TUNER</span>
                      <span className="font-bold text-white">{selectedShooter.rifleSetup.tuner}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">AMMUNITION LOT</span>
                    <span className="font-bold text-amber-400">{selectedShooter.rifleSetup?.ammoLot || "Selected Lot"}</span>
                  </div>
                </div>
              </div>

              {/* Long-form Q&A Interview */}
              {selectedShooter.interview && selectedShooter.interview.length > 0 && (
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ShootersPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ShootersContent />
    </Suspense>
  );
}
