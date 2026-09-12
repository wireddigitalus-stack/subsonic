import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FacebookFeed } from "@/components/home/FacebookFeed";
import { MediaSpotlight } from "@/components/home/MediaSpotlight";
import { VenueGuide } from "@/components/home/VenueGuide";
import Link from "next/link";
import { Calendar, MessageSquare, Flame } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 1. High Impact Hero Section */}
      <HeroSection />

      {/* 2. Official Facebook Feed Integration */}
      <FacebookFeed />

      {/* 3. Media, Athletes & Custom Precision Gear */}
      <MediaSpotlight />

      {/* 4. Bristol TN Mountain Venue & Topography Guide */}
      <VenueGuide />

      {/* 5. Pre-footer Call-To-Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="ios-glass rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-tactical-glow text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Secure Your Squad Slot
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              READY TO TEST YOUR RIFLE IN THE TENNESSEE HIGH COUNTRY?
            </h3>
            <p className="text-sm text-slate-300">
              Only 26 spots remain for the 2026 Appalachian Mountain Rimfire Pro Invitational. Join fellow marksmen and experience precision shooting at its finest.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register?match=match-001"
              data-telemetry="home_bottom_register_cta"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>Register Match Squad</span>
            </Link>

            <Link
              href="/chat"
              data-telemetry="home_bottom_chat_cta"
              className="px-8 py-3.5 rounded-2xl ios-glass text-white font-bold text-sm flex items-center gap-2 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Join Competitor Comms</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
