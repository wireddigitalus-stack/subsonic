"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Trophy,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  FileText,
  Download,
} from "lucide-react";

/**
 * Saved & Preserved Home Page Sections
 * These sections previously appeared between the HeroSection (Live Countdown)
 * and the Facebook Feed. Preserved intact for future activation or reuse.
 *
 * Included Sections:
 * 1. Upcoming Match Spotlight: Subsonic Society Invitational ($7,500 Cash Purse)
 * 2. 2026 Competitor Packet Spotlight (Schedule, Lodging, Dining)
 * 3. Featured Shooter Spotlight (Wyatt 'Ghost' Sterling)
 * 4. Competitor Profile & Documents Vault Hub (Auto-Generate Shooter Card & COF Vault)
 */
export function HomePreFacebookSpotlights() {
  return (
    <div className="space-y-16">
      {/* 1. Upcoming Match Spotlight: Subsonic Society Invitational */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-black/40 to-black/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  Upcoming Match Spotlight
                </span>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 border border-white/10">
                  <span className="text-[11px] font-mono text-slate-400">Presented by</span>
                  <Link href="/partners" className="inline-flex items-center hover:opacity-80 transition-opacity">
                    <Image
                      src="/assets/modacam-logo-dark.png"
                      alt="MODACAM Custom Rifles"
                      width={120}
                      height={26}
                      className="h-4 w-auto object-contain"
                    />
                  </Link>
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                SUBSONIC SOCIETY INVITATIONAL
              </h2>

              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>$7,500 GUARANTEED CASH PURSE</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                The premier precision rimfire shootout in the East Tennessee high country. 18 stages across rugged ridge terrain with steel stretched out to 465 yards. Open to top regional competitors and open lottery squads.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">DATES</span>
                  <span className="text-xs sm:text-sm font-bold text-white">Oct 17–18, 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">LOCATION</span>
                  <span className="text-xs sm:text-sm font-bold text-white">The Hideout, Bristol TN</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">COURSE OF FIRE</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-400">18 Stages / 465 Yds</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">AVAILABILITY</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">26 Squad Spots Left</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register?match=subsonic-invitational-2026"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <Flame className="w-4 h-4 fill-black" />
                  <span>Register Match Squad</span>
                </Link>

                <Link
                  href="/matches"
                  className="px-5 py-3 rounded-xl ios-glass text-white font-bold text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>View All 2026 Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-3xl ios-glass-card border border-amber-500/30 text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-glow mx-auto">
                  <Image
                    src="/images/SS-RWB-LOGO.png"
                    alt="Subsonic Society Official Emblem"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">THE INVITATIONAL CUP</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Guaranteed $7,500 cash purse payouts across Open, Production, and Senior divisions, presented by Modacam Custom Rifles.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Official Presenting Partner
                  </span>
                  <Link href="/partners" className="hover:opacity-80 transition-opacity">
                    <Image
                      src="/assets/modacam-logo-dark.png"
                      alt="MODACAM Custom Rifles"
                      width={160}
                      height={35}
                      className="h-6 w-auto object-contain"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 2026 Subsonic Society Invitational Competitor Packet Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-black/80 to-zinc-950 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL MATCH BRIEFING • THE HIDEOUT BRISTOL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                2026 INVITATIONAL COMPETITOR PACKET
              </h2>
            </div>

            <Link
              href="/competitor-packet"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-black shadow-tactical-glow flex items-center gap-2 transition-all"
            >
              <span>Explore Full Competitor Guide & PDF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold uppercase tracking-wider">SCHEDULE & PURSES</span>
                <span className="text-emerald-400 font-mono font-bold">$2,500 CASH</span>
              </div>
              <h4 className="text-base font-bold text-white">Full 3-Day Championship Timeline</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nov 13–15 at The Hideout. Friday zero & BBQ, Saturday 10 stages & $1,000 Speed Duel, Sunday 10 stages & $1,500 1,000Y Cold Bore.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold uppercase tracking-wider">BRISTOL LODGING</span>
                <span className="text-slate-300 font-mono font-bold">12 HOTELS</span>
              </div>
              <h4 className="text-base font-bold text-white">Curated Shooter Lodging Directory</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Bristol Hotel rooftop luxury, Hard Rock Hotel & Casino 24/7 gaming, Marriott suites near The Pinnacle, plus nearby Bristol RV campgrounds (Hilltop, Lakeview).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold uppercase tracking-wider">DINING & ACTIVITIES</span>
                <span className="text-amber-400 font-mono font-bold">TOP PICKS</span>
              </div>
              <h4 className="text-base font-bold text-white">Blackbird Bakery, BBQ & Fly Fishing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Famous 24h bakery doughnuts, slow-smoked Delta Blues BBQ, hand-cut steaks at 620 State, and world-class South Holston brown trout tailwaters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Shooter Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>FEATURED SHOOTER SPOTLIGHT</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white">
                WYATT &lsquo;GHOST&rsquo; STERLING
              </h2>

              <p className="text-xs sm:text-sm font-mono text-amber-400">
                National Rank #4 • Appalachian Cup 1st Place • Open Division Pro
              </p>

              <blockquote className="border-l-2 border-amber-500 pl-4 italic text-sm sm:text-base text-slate-200 leading-relaxed">
                &ldquo;In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2">
                <div className="p-2.5 rounded-xl bg-black/30">
                  <span className="text-[9px] text-slate-500 block">ACTION</span>
                  <span>Vudoo V-22 3-Lug</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30">
                  <span className="text-[9px] text-slate-500 block">BARREL</span>
                  <span>Bartlein MTU 20&quot;</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-500 block">OPTIC</span>
                  <span>Zero Compromise ZC527</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shooters"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span>Read Wyatt&apos;s Full Interview & Gear Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-black relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/SS-RWB-LOGO.png"
                  alt="Wyatt 'Ghost' Sterling - Subsonic Society Pro"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Competitor Profile & Documents Vault Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: 2-Minute Shooter Questionnaire & Auto-Card Generator */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2-MINUTE COMPETITOR ONBOARDING</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  AUTO-PROFILE
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  AUTO-GENERATE YOUR SHOOTER CARD
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Are you shooting in the 2026 Invitational or Appalachian circuit? Skip the manual forms. Enter your rig specs, 1-tap accolade badges (Team USA, National Champion), sponsor tags, and photos to generate your verified public profile.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-1">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-amber-400 font-bold block">1-TAP BADGES</span>
                  <span className="text-[11px] text-slate-300 truncate block">Team USA & Podiums</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-amber-400 font-bold block">6 RIG SPECS</span>
                  <span className="text-[11px] text-slate-300 truncate block">Action, Barrel, Ammo</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-amber-400 font-bold block">2 PHOTOS</span>
                  <span className="text-[11px] text-slate-300 truncate block">Headshot & Rig Action</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
              <Link
                href="/shooters/intake"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Launch Intake Questionnaire</span>
              </Link>

              <Link
                href="/shooters"
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Browse Marksmen Roster</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Competition Documents Vault */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-gradient-to-br from-cyan-500/10 via-black/40 to-black/60 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>OFFICIAL STAGE PACKETS & RULES</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  18 STAGES
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  COMPETITION DOCUMENTS VAULT
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Download verified Course of Fire stage packets, match rules, cold range liability waivers, and Appalachian elevation intel out to 465 yards. One-click access for all squadded competitors.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-1">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-cyan-400 font-bold block">18 STAGES</span>
                  <span className="text-[11px] text-slate-300 truncate block">Official Match COF</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-cyan-400 font-bold block">SAFETY WAIVER</span>
                  <span className="text-[11px] text-slate-300 truncate block">Mandatory Cold Range</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-cyan-400 font-bold block">ELEVATION</span>
                  <span className="text-[11px] text-slate-300 truncate block">3,420 FT Holston Topo</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
              <Link
                href="/documents"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Open Documents Vault</span>
              </Link>

              <Link
                href="/matches"
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>Match Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
