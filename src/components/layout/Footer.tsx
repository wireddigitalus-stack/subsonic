import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Radio, 
  MapPin, 
  Mountain, 
  Target, 
  ExternalLink, 
  Shield, 
  Cpu,
  Microscope,
  Users,
  Trophy,
  Film,
  ShoppingBag,
  Award,
  Sparkles
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/80 backdrop-blur-xl mt-24 pb-20 md:pb-12 pt-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand, Tagline & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-black/60 flex items-center justify-center shrink-0">
                <Image
                  src="/assets/subsonic-coin.jpg"
                  alt="Subsonic Society Emblem"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-white block">
                  SUBSONIC SOCIETY
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold tracking-widest block">
                  PRECISION IS IN OUR DNA
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              A grassroots precision-rimfire community built around real-world knowledge, high-stakes competition, and figuring out what actually works.
            </p>

            {/* 4 Pillars Pill */}
            <div className="text-[10px] font-mono text-slate-400 flex flex-wrap gap-2">
              <span className="text-amber-400 font-semibold">Competition</span> •
              <span className="text-blue-400 font-semibold">Testing</span> •
              <span className="text-emerald-400 font-semibold">Education</span> •
              <span className="text-purple-400 font-semibold">Community</span>
            </div>

            {/* Mountain Specs Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>The Hideout (3,420 FT ELEV)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Bristol, Tennessee</span>
              </div>
            </div>
          </div>

          {/* Column 2: The Society & Facility */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              The Society
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/society" className="hover:text-amber-400 transition-colors">
                  Story & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold text-emerald-400/90">
                  <span>Competitor Comms (Live)</span>
                </Link>
              </li>
              <li>
                <Link href="/the-hideout" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>The Hideout Range</span>
                  <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">3,420&apos;</span>
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-amber-400 transition-colors">
                  Modacam & Sponsors
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Official Gear & Apparel</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-amber-400 font-bold hover:underline transition-all">
                  Join Free Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Competitions */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Competitions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/matches"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold text-amber-400/90"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>The Invitational ($7.5K)</span>
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-amber-400 transition-colors">
                  300X Long Gong Challenge
                </Link>
              </li>
              <li>
                <Link href="/bristol-pro" className="hover:text-amber-400 transition-colors">
                  Bristol Mountain Pro (18 Stages)
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  2026 Match Schedule
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
                  Squad Slot Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Testing & Media */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Subsonic DNA & Media
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dna" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                  <Microscope className="w-3 h-3 text-blue-400" />
                  <span>Ammunition Lot Database</span>
                </Link>
              </li>
              <li>
                <Link href="/dna" className="hover:text-blue-300 transition-colors">
                  Harmonic Tuner Matrices
                </Link>
              </li>
              <li>
                <Link href="/shooters" className="hover:text-purple-300 transition-colors">
                  Competitor Gear Specs
                </Link>
              </li>
              <li>
                <Link href="/watch" className="hover:text-red-300 transition-colors flex items-center gap-1">
                  <Film className="w-3 h-3 text-red-400" />
                  <span>Slow-Mo 300-Yd Video</span>
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Competitor Comms</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Feed Quick Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <a
            href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
            target="_blank"
            rel="noopener noreferrer"
            data-telemetry="footer_link_facebook"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 hover:text-white text-xs font-semibold transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Official Facebook Media Feed</span>
            <ExternalLink className="w-3 h-3 text-blue-400" />
          </a>

          <div className="text-[11px] text-slate-500">
            Strictly non-transactional sporting community adhering to all federal and state regulations.
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Subsonic Society. All rights reserved. Precision Is In Our DNA.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              TELEMETRY & RSS SYNC ACTIVE
            </span>
            <Link href="/admin" className="hover:text-slate-200">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
