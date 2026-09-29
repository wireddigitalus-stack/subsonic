"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Target, 
  Mountain, 
  Flame, 
  ChevronRight, 
  ShieldCheck, 
  Crosshair, 
  Compass,
  Users,
  Microscope,
  MessageSquare,
  Sparkles,
  FileText,
  Key
} from "lucide-react";
import { CountdownBanner } from "./CountdownBanner";
import { HeroChatTerminal } from "./HeroChatTerminal";
import { HeroVideoBanner } from "./HeroVideoBanner";
import { HeroCrosshairLoader } from "./HeroCrosshairLoader";

export function HeroSection() {
  const [heroMode, setHeroMode] = useState<"video" | "loading" | "chat">("video");

  return (
    <section data-section="hero" className="relative pt-4 pb-16 overflow-hidden">
      {/* Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="relative w-full h-[620px] max-w-7xl mx-auto opacity-20 filter blur-[1px]">
          <Image
            src="/assets/subsonic-facebook-cover.jpg"
            alt="Subsonic Society Banner"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-[#07090E]/85 to-[#07090E]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Core Pillars Badge */}
        <div className="flex items-center justify-center sm:justify-start max-w-full">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] sm:text-xs font-mono max-w-full tracking-tight sm:tracking-normal text-center">
            <span className="text-amber-400 font-bold">COMPETITION</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-bold">TESTING</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">EDUCATION</span>
            <span className="text-slate-500">•</span>
            <span className="text-purple-400 font-bold">COMMUNITY</span>
          </div>
        </div>

        {/* Hero Headline & Brand Mantra */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            SUBSONIC SOCIETY <br />
            <span className="amber-gradient-text">
              PRECISION IS IN OUR DNA.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl">
            A grassroots precision-rimfire community built around real-world ballistic knowledge, extreme 300-yard competition, and figuring out what <strong className="text-white">actually works</strong>.
          </p>
        </div>

        {/* Video Banner Reel -> 3-Sec Crosshair Lock -> Live Animated Tactical Chat Terminal */}
        <div className="w-full transition-all duration-500">
          {heroMode === "video" && (
            <div className="animate-fadeIn">
              <HeroVideoBanner onComplete={() => setHeroMode("loading")} />
            </div>
          )}

          {heroMode === "loading" && (
            <div className="animate-fadeIn">
              <HeroCrosshairLoader onComplete={() => setHeroMode("chat")} />
            </div>
          )}

          {heroMode === "chat" && (
            <div className="animate-fadeIn">
              <HeroChatTerminal
                isActive={heroMode === "chat"}
                onReplayVideo={() => setHeroMode("video")}
              />
            </div>
          )}
        </div>

        {/* 3 PRIMARY BUTTONS: MATCHES • SUBSONIC DNA • CLAIM INVITE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">

          {/* Button 2: MATCHES */}
          <Link
            href="/matches"
            data-telemetry="hero_primary_btn_matches"
            className="p-3 sm:p-4 rounded-2xl ios-glass border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-white font-black text-xs sm:text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="truncate">MATCHES</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Button 3: COMPETITOR PACKET */}
          <Link
            href="/competitor-packet"
            data-telemetry="hero_primary_btn_packet"
            className="p-3 sm:p-4 rounded-2xl ios-glass border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-white font-black text-xs sm:text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="truncate">2026 PACKET</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Button 4: CLAIM INVITE (INVITATION ONLY) */}
          <Link
            href="/invite"
            data-telemetry="hero_primary_btn_invite"
            className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs sm:text-sm flex items-center justify-between shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/15 flex items-center justify-center text-black shrink-0">
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
              </div>
              <span className="truncate">CLAIM INVITE</span>
            </div>
            <ChevronRight className="w-4 h-4 text-black shrink-0" />
          </Link>
        </div>

        {/* Competitor Net & Portal Fast-Access Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <Link
            href="/chat"
            className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-white flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[11px] font-black text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                  <span>Competitor Comms</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Invite-only squad network
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/shooters/intake"
            className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-white flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[11px] font-black text-white group-hover:text-amber-400 flex items-center gap-1.5">
                  <span>Shooter Questionnaire</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">Auto-Card</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  2-Min rig & profile builder
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/documents"
            className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 text-white flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[11px] font-black text-white group-hover:text-cyan-400 flex items-center gap-1.5">
                  <span>Competition Vault</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">18 COF</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Stage packets & waivers
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>

        {/* Live Countdown Banner for The Invitational */}
        <CountdownBanner targetDate="2026-10-17T08:00:00" />
      </div>
    </section>
  );
}
