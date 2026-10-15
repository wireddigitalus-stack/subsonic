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
    title: "Subsonic Society Invitational",
    subtitle: "The Premier $7,500 Cash Purse Championship ($5,000 Main Match • $2,500 Side Matches) Presented by Modacam Custom Rifles",
    date: "November 13–15, 2026",
    location: "The Hideout Ridge Complex, Bristol, TN",
    purse: "$7,500 Total Cash Prizes",
    stages: 18,
    maxDistance: "465 Yards",
    entryFee: 275,
    totalSlots: 120,
    takenSlots: 94,
    presentingPartner: "Modacam Custom Rifles",
    status: "FILLING",
    tier: "INVITATIONAL",
    description: "The crown jewel of the Subsonic Society calendar. 18 natural-terrain stages across steep Appalachian ridgelines with extreme long-range subsonic engagements out to 465 yards. $5,000 Main Match cash payouts + $2,500 Cash Side Matches. Sat & Sun Meals Included.",
    featured: true,
  }
];

export default function MatchesPage() {
  const [showRulebookModal, setShowRulebookModal] = useState(false);

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
                2026 INVITATIONAL CHAMPIONSHIP
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Official course of fire, stage standards, and competitor guide for the Subsonic Society Invitational at The Hideout in Bristol, TN.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/competitor-packet"
                className="px-4 py-2.5 rounded-xl ios-glass text-amber-300 hover:text-white text-xs font-bold border border-amber-500/30 flex items-center gap-2 hover:bg-white/10 transition-all shadow-tactical-glow"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>2026 Competitor Packet</span>
              </Link>

              <button
                onClick={() => setShowRulebookModal(true)}
                className="px-4 py-2.5 rounded-xl ios-glass text-slate-200 hover:text-white text-xs font-bold border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>2026 Rulebook</span>
              </button>

              <Link
                href="/invitational"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Explore The Invitational</span>
              </Link>
            </div>
          </div>

          {/* Marquee Featured Match: Subsonic Society Invitational */}
          <div className="pt-4">
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-black/40 to-black/60">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-black" />
                  Marquee Invitational
                </span>
              </div>

              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/60 border border-white/10">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">Presented by</span>
                  <Link href="/partners" className="inline-flex items-center hover:opacity-80 transition-opacity">
                    <Image
                      src="/assets/modacam-logo-dark.png"
                      alt="MODACAM Custom Rifles"
                      width={120}
                      height={26}
                      className="h-4 sm:h-4.5 w-auto object-contain"
                    />
                  </Link>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  SUBSONIC SOCIETY INVITATIONAL
                </h2>

                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span>$7,500 TOTAL CASH PRIZES</span>
                  </div>
                  <div className="text-xs font-mono text-amber-300 font-bold">
                    $5,000 Main Match Purse • $2,500 Cash Side Matches • Sat &amp; Sun Meals Included
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  18 grueling stages in the high-elevation Appalachian wind at The Hideout in Bristol, TN. Over 465 yards of steel with cold-bore long gong targets and $2,500 in dedicated Friday cash side matches.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">DATES</span>
                    <span className="text-xs sm:text-sm font-bold text-white">Nov 13–15, 2026</span>
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
                    <span className="text-[10px] font-mono text-slate-400 block">HOSPITALITY</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">Sat &amp; Sun Meals Included</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href="/invitational"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>View Full Invitational Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/competitor-packet"
                    className="px-5 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>2026 Competitor Packet &amp; Guide</span>
                  </Link>

                  <a
                    href="/documents/2026-Subsonic-Society-Invitational-Competitor-Packet.pdf"
                    download="2026-Subsonic-Society-Invitational-Competitor-Packet.pdf"
                    className="px-4 py-3 rounded-xl ios-glass text-slate-300 hover:text-white text-xs font-semibold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                    title="Download Official PDF (246 KB)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <Link
                    href="/the-hideout"
                    className="px-4 py-3 rounded-xl ios-glass text-white text-xs font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>The Hideout</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Card Detail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          {MATCHES_DATA.map((m) => (
            <div
              key={m.id}
              className="ios-glass rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                    OFFICIAL 2026 CHAMPIONSHIP
                  </span>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sat &amp; Sun Meals Included
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {m.title}
                </h3>

                <p className="text-xs text-amber-400/90 font-mono">
                  {m.subtitle}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
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
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/invitational"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 fill-black" />
                    <span>Explore Invitational Overview</span>
                  </Link>

                  <Link
                    href="/competitor-packet"
                    className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="View Official Competitor Packet & Bristol Guide"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Competitor Packet</span>
                  </Link>

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
          ))}
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
