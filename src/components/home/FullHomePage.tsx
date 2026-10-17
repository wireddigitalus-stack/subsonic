"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { HomePreFacebookSpotlights } from "@/components/home/HomePreFacebookSpotlights";
import { 
  Users, 
  ChevronRight, 
  Sparkles, 
  Key
} from "lucide-react";

// Feature toggle: Set to true to re-enable the 4 spotlight sections between Countdown and Facebook Feed
const SHOW_PRE_FACEBOOK_SPOTLIGHTS = false;

export function FullHomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Cinematic Video Hero & Brand Statement (includes Live Countdown) */}
      <HeroSection />

      {/* 2. Intermediate Spotlights (Preserved & Saved: Match Spotlight, Competitor Packet, Wyatt Sterling, Documents Hub) */}
      {SHOW_PRE_FACEBOOK_SPOTLIGHTS && <HomePreFacebookSpotlights />}

      {/* Official Title Sponsor Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Backlight Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              PRECISION RIMFIRE REDEFINED
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              OFFICIAL TITLE SPONSOR
            </h3>
          </div>

          {/* Marquee Presenting Sponsor Hero Card */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <Link
              href="/partners"
              className="group block p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-amber-500/40 hover:border-amber-400 shadow-tactical-glow transition-all duration-300 hover:shadow-glow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="flex flex-col items-center justify-center space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Presenting Partner</span>
                </div>

                <div className="py-2 px-4 flex items-center justify-center">
                  <Image
                    src="/assets/modacam-logo-dark.png"
                    alt="MODACAM Custom Rifles"
                    width={400}
                    height={88}
                    className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
                    priority
                  />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-md font-medium leading-relaxed">
                  Precision Rimfire Rifles used by the Best Shooters in the World.
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold group-hover:text-amber-300 pt-1">
                  <span>Explore Modacam Custom Rifles</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
