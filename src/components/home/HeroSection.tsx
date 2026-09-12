"use client";

import React from "react";
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
  Radio
} from "lucide-react";
import { CountdownBanner } from "./CountdownBanner";

export function HeroSection() {
  return (
    <section data-section="hero" className="relative pt-4 pb-16 overflow-hidden">
      {/* Mountain Ambient Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[620px] opacity-30">
          <Image
            src="/assets/subsonic-competition-mountain.png"
            alt="Bristol TN Mountain Range"
            fill
            className="object-cover object-top mask-image-gradient"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-[#07090E]/85 to-[#07090E]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold shadow-sm">
            <Mountain className="w-3.5 h-3.5" />
            <span>BRISTOL, TENNESSEE • HIGH COUNTRY PRO RIMFIRE</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span>ELEVATION: 3,420 FT</span>
          </div>
        </div>

        {/* Hero Title & Mission */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            THE HIGH-STAKES <br />
            <span className="amber-gradient-text">
              MOUNTAIN PRO RIMFIRE
            </span>{" "}
            CHAMPIONSHIP
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl">
            <strong className="text-white font-semibold">Subsonic Society</strong> is a precision rimfire shooting media and community platform. We cover competitions, highlight athletes, discuss equipment, showcase venues and performance within the growing rimfire shooting sports world.
          </p>
        </div>

        {/* Tactical Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "MAX STEEL DISTANCE",
              value: "465 YARDS",
              sub: "Extreme Subsonic Flight",
              icon: Target,
              accent: "text-amber-400",
            },
            {
              label: "PRECISION STAGES",
              value: "18 STAGES",
              sub: "High-Angle Ridge Props",
              icon: Compass,
              accent: "text-blue-400",
            },
            {
              label: "CASH & GEAR PURSE",
              value: "$28,500",
              sub: "Plus Custom Minted Coins",
              icon: Flame,
              accent: "text-emerald-400",
            },
            {
              label: "PRO ROSTER LIMIT",
              value: "120 SHOOTERS",
              sub: "Squad Slots Filling Fast",
              icon: ShieldCheck,
              accent: "text-purple-400",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="ios-glass-card rounded-2xl p-4 sm:p-5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    {stat.label}
                  </span>
                  <Icon className={`w-4 h-4 ${stat.accent}`} />
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Countdown Banner */}
        <CountdownBanner targetDate="2026-10-17T08:00:00" />

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Link
            href="/calendar"
            data-telemetry="hero_cta_register_match"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>Register For Bristol Pro Shootout</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <a
            href="#facebook-feed"
            data-telemetry="hero_cta_facebook_feed"
            className="px-6 py-3.5 rounded-2xl ios-glass text-white font-bold text-sm flex items-center justify-center gap-2 border border-blue-500/30 hover:bg-blue-600/20 active:scale-[0.98] transition-all"
          >
            <Radio className="w-4 h-4 text-blue-400" />
            <span>View Facebook Page Updates</span>
          </a>

          <Link
            href="/chat"
            data-telemetry="hero_cta_competitor_chat"
            className="px-6 py-3.5 rounded-2xl ios-glass text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <span>Live Competitor Comms</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              AI Monitored
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
