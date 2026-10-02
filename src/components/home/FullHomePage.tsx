"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { FacebookFeed } from "@/components/home/FacebookFeed";
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

      {/* 6. Official Subsonic Social Feed (Live Facebook RSS Integration) */}
      <div id="facebook-feed">
        <FacebookFeed />
      </div>

      {/* 6. Presenting Sponsors Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Backlight Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              PRECISION POWERED BY INDUSTRY LEADERS
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              PRESENTING SPONSORS & INDUSTRY PARTNERS
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
                  <span>Premier Presenting Partner</span>
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
                  Hand-crafted match grade rimfire platforms & custom chambering. Presenting sponsor of the $7,500 Invitational Purse.
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold group-hover:text-amber-300 pt-1">
                  <span>Explore Modacam Match Builds</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Industry Collaborators Grid */}
          <div className="relative z-10 pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Official Match Providers & Technical Collaborators
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-blue-400 font-bold tracking-wider">OFFICIAL AMMUNITION</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">LAPUA</span>
                <span className="text-[10px] text-slate-400">Center-X / Midas+</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">PRECISION OPTICS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">VORTEX</span>
                <span className="text-[10px] text-slate-400">Razor HD Gen III</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-purple-400 font-bold tracking-wider">ACTIONS & REPEATERS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">VUDOO</span>
                <span className="text-[10px] text-slate-400">Gun Works V-22</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">CHASSIS SYSTEMS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">MDT</span>
                <span className="text-[10px] text-slate-400">ACC Elite</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Free Society Membership CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-tactical-glow text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Invitation-Only Network
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              MEMBERSHIP BY INVITATION ONLY
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Log in with your invitation credentials we sent you, or enter your invite code to activate your digital marksman profile and Chat Room access.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/invite/pro"
              data-telemetry="home_bottom_join_cta"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <Key className="w-4 h-4 fill-black" />
              <span>Redeem Your Pro Invite</span>
            </Link>

            <Link
              href="/chat"
              data-telemetry="home_bottom_login_cta"
              className="px-8 py-3.5 rounded-2xl ios-glass text-white font-bold text-sm flex items-center gap-2 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Member Login</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
