"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Target, 
  Calendar, 
  MapPin, 
  Flame, 
  Trophy, 
  Search, 
  ChevronRight, 
  Users, 
  ShieldAlert, 
  FileText, 
  Download,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface MatchCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  purse: string;
  stages: number;
  maxDistance: string;
  entryFee: number;
  totalSlots: number;
  takenSlots: number;
  presentingPartner?: string;
  status: "OPEN" | "FILLING" | "WAITLIST" | "COMPLETED";
  tier: "INVITATIONAL" | "CHAMPIONSHIP" | "LONG_GONG" | "REGIONAL";
  description: string;
  featured?: boolean;
}

const MATCHES_DATA: MatchCard[] = [
  {
    id: "subsonic-invitational-2026",
    title: "The Subsonic Society Invitational",
    subtitle: "The Premier $7,500 Cash Purse Championship Presented by Modacam Custom Rifles",
    date: "October 17–18, 2026",
    location: "The Hideout Ridge Complex, Bristol, TN",
    purse: "$7,500 Guaranteed Cash Purse",
    stages: 18,
    maxDistance: "465 Yards",
    entryFee: 275,
    totalSlots: 120,
    takenSlots: 94,
    presentingPartner: "Modacam Custom Rifles",
    status: "FILLING",
    tier: "INVITATIONAL",
    description: "The crown jewel of the Subsonic Society calendar. 18 stages across steep Appalachian terrain with extreme long-range subsonic engagements out to 465 yards. Solid cash purse payouts for Top 5 Open, Top Production, and Senior Divisions.",
    featured: true,
  },
  {
    id: "300x-long-gong",
    title: "300X Long Gong Challenge",
    subtitle: "Extreme Distance Rimfire Precision & Cold Bore Barricade Shootout",
    date: "August 22, 2026",
    location: "The Hideout Valley Steel Bay, Bristol, TN",
    purse: "$3,500 Gear & Ammo Table",
    stages: 10,
    maxDistance: "300–385 Yards",
    entryFee: 140,
    totalSlots: 60,
    takenSlots: 51,
    presentingPartner: "Lapua Rimfire",
    status: "FILLING",
    tier: "LONG_GONG",
    description: "A dedicated 300-yard plus precision match where every stage is positioned at extreme subsonic distances. Tests pure wind-reading capability, aerodynamic drag consistency, and rifle harmonic tuning.",
  },
  {
    id: "200x-mountain-match",
    title: "200X Mountain Match",
    subtitle: "Technical High-Angle Ridge Barricade Championship",
    date: "July 11, 2026",
    location: "The Hideout Ridge Barricade Line, Bristol, TN",
    purse: "$2,800 Cash & Trophies",
    stages: 12,
    maxDistance: "200 Yards",
    entryFee: 110,
    totalSlots: 75,
    takenSlots: 68,
    presentingPartner: "Vortex Optics",
    status: "FILLING",
    tier: "CHAMPIONSHIP",
    description: "Fast, positional precision on tank traps, spool pyramids, wire fences, and rocking platforms. Pure barricade agility and rapid target acquisition inside 200 yards.",
  },
  {
    id: "x-factor-head-to-head",
    title: "The X-Factor Shootout",
    subtitle: "Double-Elimination Bracket Duel on Reactive Steel Targets",
    date: "September 12, 2026",
    location: "Pavilion Speedway Arena, The Hideout, TN",
    purse: "$4,000 Winner-Take-All",
    stages: 8,
    maxDistance: "100–175 Yards",
    entryFee: 95,
    totalSlots: 32,
    takenSlots: 32,
    presentingPartner: "Modacam Custom Rifles",
    status: "WAITLIST",
    tier: "INVITATIONAL",
    description: "Head-to-head electronic timer duels. Shooters start standing, take position upon the buzzer, and race through matching steel racks to trigger the center stop-plate.",
  },
  {
    id: "spring-opener-2026",
    title: "Appalachian Spring Kickoff",
    subtitle: "Season Opening Regional Points Qualifier",
    date: "April 25, 2026",
    location: "The Hideout Range, Bristol, TN",
    purse: "$2,000 Prize Table",
    stages: 10,
    maxDistance: "250 Yards",
    entryFee: 90,
    totalSlots: 60,
    takenSlots: 60,
    status: "COMPLETED",
    tier: "REGIONAL",
    description: "The 2026 season inaugural match featuring cold morning density altitude shifts and 10 dynamic stages.",
  }
];

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showRulebookModal, setShowRulebookModal] = useState(false);

  const filteredMatches = MATCHES_DATA.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.presentingPartner && m.presentingPartner.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTier = tierFilter === "ALL" || m.tier === tierFilter;
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Top Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>OFFICIAL MATCH PORTAL</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                COMPETITION SCHEDULE & RESULTS
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Searchable, dedicated match records, course of fires, and squad registration. No lost posts or buried leaderboards.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRulebookModal(true)}
                className="px-4 py-2.5 rounded-xl ios-glass text-slate-200 hover:text-white text-xs font-bold border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>2026 Rulebook</span>
              </button>

              <Link
                href="/register?match=subsonic-invitational-2026"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Enter Match Squad</span>
              </Link>
            </div>
          </div>

          {/* Marquee Featured Match: The Subsonic Society Invitational */}
          <div className="pt-4">
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-black/40 to-black/60">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-black" />
                  Marquee Invitational
                </span>
              </div>

              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                  <span>Presented by</span>
                  <span className="text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    Modacam Custom Rifles
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  THE SUBSONIC SOCIETY INVITATIONAL
                </h2>

                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>$7,500 GUARANTEED CASH PURSE</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  18 grueling stages in the high-elevation Appalachian wind. Over 465 yards of steel with cold-bore long gong bonus targets. Reserved slots for national qualifier podium finishers and open lottery entries.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">DATES</span>
                    <span className="text-xs sm:text-sm font-bold text-white">Oct 17–18, 2026</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">LOCATION</span>
                    <span className="text-xs sm:text-sm font-bold text-white">Bristol, TN</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">COURSE OF FIRE</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-400">18 Stages / 220 Rnds</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">SQUAD SLOTS</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">26 Spots Remaining</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href="/register?match=subsonic-invitational-2026"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Register For The Invitational</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/the-hideout"
                    className="px-5 py-3 rounded-xl ios-glass text-white text-xs font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Venue & Range Topography</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by match name, location, or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e131d]">All Events</option>
                <option value="INVITATIONAL" className="bg-[#0e131d]">Invitational</option>
                <option value="CHAMPIONSHIP" className="bg-[#0e131d]">Championship</option>
                <option value="LONG_GONG" className="bg-[#0e131d]">Long Gong</option>
                <option value="REGIONAL" className="bg-[#0e131d]">Regional</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e131d]">All Statuses</option>
                <option value="FILLING" className="bg-[#0e131d]">Registration Open</option>
                <option value="WAITLIST" className="bg-[#0e131d]">Sold Out / Waitlist</option>
                <option value="COMPLETED" className="bg-[#0e131d]">Past Results</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Match Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((m) => {
            const isSoldOut = m.status === "WAITLIST";
            const isCompleted = m.status === "COMPLETED";

            return (
              <div
                key={m.id}
                className="ios-glass rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {m.tier.replace("_", " ")}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          : isSoldOut
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {isCompleted ? "Scores Final" : isSoldOut ? "Waitlist Only" : `${m.totalSlots - m.takenSlots} Slots Left`}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs text-amber-400/90 font-mono">
                    {m.subtitle}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {m.description}
                  </p>
                </div>

                {/* Match Specs Row */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-black/30">
                      <span className="text-[10px] font-mono text-slate-500 block">DATE</span>
                      <span className="font-semibold text-slate-200">{m.date}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30">
                      <span className="text-[10px] font-mono text-slate-500 block">PRIZE / PURSE</span>
                      <span className="font-bold text-amber-400">{m.purse}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono text-slate-500 block">DISTANCE</span>
                      <span className="font-semibold text-slate-200">{m.maxDistance}</span>
                    </div>
                  </div>

                  {m.presentingPartner && (
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span>Presented by:</span>
                      <strong className="text-white">{m.presentingPartner}</strong>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    {isCompleted ? (
                      <Link
                        href={`/matches?id=${m.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Match Leaderboard</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/register?match=${m.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Flame className="w-3.5 h-3.5 fill-black" />
                        <span>{isSoldOut ? "Join Waitlist" : "Register Squad"}</span>
                      </Link>
                    )}

                    <Link
                      href="/chat"
                      className="px-3.5 py-2.5 rounded-xl ios-glass text-slate-300 hover:text-white text-xs font-semibold border border-white/10 hover:bg-white/10 transition-all"
                      title="Match Comms"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Official Rulebook Modal */}
      {showRulebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Official Standard
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Subsonic Society Rules & Match Standards
                </h3>
              </div>
              <button
                onClick={() => setShowRulebookModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">1. Ammunition Regulations</h4>
                <p>Standard .22LR rimfire only. All projectiles must be factory rated or chronographed under 1,120 FPS at ambient temperature (subsonic). Hyper-velocity or magnum rounds (.22 WMR / .17 HMR) are strictly prohibited.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">2. Cold Range & Safety Protocol</h4>
                <p>All rifles must be unloaded with chamber flags inserted and magazines removed until the shooter is on the firing line and given the command to prepare. Discharging a round before the start buzzer results in immediate match DQ.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">3. Scoring & Hit Confirmation</h4>
                <p>Impacts on reactive steel must produce visual flash, audible ring, or electronic light confirmation verified by the Stage Range Officer. Hits that skip off the dirt into steel are scored as misses.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">4. Divisions</h4>
                <p><strong>Open Division:</strong> Any rimfire chassis, custom actions, harmonic tuners, and optics.<br /><strong>Production Division:</strong> Factory barreled actions with MSRP under $1,200 and optics under $1,500.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-400">Version 2026.3 • Official Rulebook</span>
              <button
                onClick={() => setShowRulebookModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:brightness-110 transition-all"
              >
                I Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
