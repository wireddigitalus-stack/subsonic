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
  Play,
  Film,
  Users,
  Microscope,
  Volume2,
  VolumeX
} from "lucide-react";
import { CountdownBanner } from "./CountdownBanner";

export function HeroSection() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

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
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
            <span className="text-amber-400 font-bold">COMPETITION</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">TESTING</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">EDUCATION</span>
            <span>•</span>
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

        {/* Cinematic Video Showcase Container */}
        <div className="relative ios-glass rounded-3xl p-2 sm:p-3 border border-white/15 shadow-2xl overflow-hidden group">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {/* Cinematic Background Poster / Video Preview */}
            <Image
              src="/assets/subsonic-facebook-cover.jpg"
              alt="Cinematic slow-motion rimfire shots, 300-yard impacts at The Hideout, wind flags, rifles, ammunition, steel"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              priority
            />

            {/* Video Overlay Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

            {/* Cinematic Telemetry Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white/80 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold tracking-wider text-red-400">4K CINEMATIC TRACE</span>
                <span className="hidden sm:inline text-slate-400">| 1,000 FPS PHANTOM HIGH-SPEED</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-slate-300">
                <span>300 YD STEEL IMPACT</span>
                <span>THE HIDEOUT • 3,420 FT</span>
              </div>
            </div>

            {/* Center Play Button with Slow-Mo Motif */}
            <div className="relative z-10 text-center space-y-3 max-w-lg px-4">
              <Link
                href="/watch"
                data-telemetry="hero_play_cinematic_video"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-110 active:scale-95 transition-all mx-auto group/btn"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white drop-shadow-md">
                  SLOW-MOTION 300-YARD RIMFIRE IMPACTS
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-mono drop-shadow">
                  High-speed bullet trace, mountain wind flags & custom match builds at The Hideout
                </p>
              </div>
            </div>

            {/* Bottom Specs Bar inside Video */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
              <span className="truncate">Lapua Center-X 40gr • 1,062 FPS • Flight Time: 1.18s</span>
              <span className="text-amber-400 font-bold hidden sm:inline">WATCH REEL</span>
            </div>
          </div>
        </div>

        {/* 4 PRIMARY BUTTONS as requested by Allen: WATCH • MATCHES • SUBSONIC DNA • JOIN THE SOCIETY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Button 1: WATCH */}
          <Link
            href="/watch"
            data-telemetry="hero_primary_btn_watch"
            className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-white font-black text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <Play className="w-4 h-4 fill-red-400" />
              </div>
              <span>WATCH</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Button 2: MATCHES */}
          <Link
            href="/matches"
            data-telemetry="hero_primary_btn_matches"
            className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-white font-black text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <span>MATCHES</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Button 3: SUBSONIC DNA */}
          <Link
            href="/dna"
            data-telemetry="hero_primary_btn_dna"
            className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-black text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Microscope className="w-4 h-4" />
              </div>
              <span>SUBSONIC DNA</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Button 4: JOIN THE SOCIETY */}
          <Link
            href="/join"
            data-telemetry="hero_primary_btn_join"
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm flex items-center justify-between shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 fill-black" />
              <span>JOIN THE SOCIETY</span>
            </div>
            <ChevronRight className="w-4 h-4 text-black" />
          </Link>
        </div>

        {/* Live Countdown Banner for The Invitational */}
        <CountdownBanner targetDate="2026-10-17T08:00:00" />
      </div>
    </section>
  );
}
