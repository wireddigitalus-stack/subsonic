"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  ChevronDown, 
  Mountain, 
  Calendar, 
  Crosshair, 
  MessageSquare, 
  Radio, 
  Activity, 
  Flame, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck,
  Trophy,
  Microscope,
  Users,
  Film,
  ShoppingBag,
  Award,
  Sparkles,
  Compass,
  Target
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menuKey: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <nav className="ios-glass rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between border border-white/10 shadow-ios-glass">
          {/* Brand Logo with Challenge Coin & Wordmark */}
          <Link 
            href="/" 
            rel="home"
            title="Subsonic Society - Precision Is In Our DNA"
            aria-label="Subsonic Society Homepage"
            data-telemetry="nav_brand_logo"
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
          >
            <div 
              className="relative rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] bg-black flex items-center justify-center shrink-0 w-[40px] h-[40px] sm:w-[48px] sm:h-[48px]"
            >
              <Image
                src="/assets/subsonic-coin.jpg"
                alt="Subsonic Society Official Emblem"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
            
            {/* Wordmark */}
            <div className="relative h-[38px] w-[180px] sm:h-[46px] sm:w-[220px] flex items-center shrink-0">
              <Image
                src="/assets/subsonic-banner-trimmed.png"
                alt="Subsonic Society"
                fill
                sizes="(max-width: 640px) 180px, 220px"
                className="object-contain object-left group-hover:brightness-110 transition-all duration-200"
                priority
              />
            </div>
          </Link>

          {/* Clean Desktop Navigation Bar */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] px-2 py-1 rounded-xl border border-white/5">
            {/* Overview */}
            <Link
              href="/"
              data-telemetry="nav_link_overview"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
            </Link>

            {/* Submenu 1: The Society */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("society")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "society" ? null : "society")}
                data-telemetry="nav_dropdown_society"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  pathname.startsWith("/society") || pathname.startsWith("/the-hideout") || pathname.startsWith("/partners") || activeDropdown === "society"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>The Society</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "society" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {activeDropdown === "society" && (
                <div className="absolute top-full left-0 mt-2 w-72 ios-glass rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-1">
                  <Link
                    href="/society"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400">
                        The Story & Philosophy
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Grassroots community & marksman code
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/the-hideout"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                        <span>The Hideout</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">3,420 FT</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Home facility, zero bay & 465-yd steel
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/partners"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                        Modacam & Partners
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Presenting sponsors & industry leaders
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Submenu 2: Competitions */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("matches")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "matches" ? null : "matches")}
                data-telemetry="nav_dropdown_matches"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  pathname.startsWith("/matches") || pathname.startsWith("/shooters") || pathname.startsWith("/bristol-pro") || pathname.startsWith("/calendar") || activeDropdown === "matches"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Matches</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "matches" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {activeDropdown === "matches" && (
                <div className="absolute top-full left-0 mt-2 w-72 ios-glass rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-1">
                  <Link
                    href="/matches"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                        <span>Match Schedule & Portal</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">$7.5K Purse</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        The Invitational, 300X Long Gong & 200X
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/shooters"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400">
                        Shooters & Gear Specs
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Competitor profiles, rifle builds & advice
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/bristol-pro"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                        <span>Bristol Mountain Pro</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">18 Stages</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Detailed stage briefs & high-angle COF
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Link: Subsonic DNA */}
            <Link
              href="/dna"
              data-telemetry="nav_link_dna"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname === "/dna"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Microscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Subsonic DNA</span>
            </Link>

            {/* Submenu 3: Media & Gear */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("media")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "media" ? null : "media")}
                data-telemetry="nav_dropdown_media"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  pathname.startsWith("/watch") || pathname.startsWith("/shop") || pathname.startsWith("/chat") || activeDropdown === "media"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Media & Gear</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "media" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {activeDropdown === "media" && (
                <div className="absolute top-full right-0 mt-2 w-72 ios-glass rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-1">
                  <Link
                    href="/watch"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 flex items-center gap-1.5">
                        <span>Watch Hub</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">Slow-Mo</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        300-yd impacts, stage runs & trace
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/shop"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                        <span>Community Shop</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">Gear & Apparel</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Official match jerseys, hats & gear
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/chat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                        <span>Competitor Comms</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">AI Shield</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        DOPE drops & squad chat
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Primary "JOIN THE SOCIETY" CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/join"
              data-telemetry="nav_primary_join_cta"
              className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 fill-black" />
              <span>Join The Society</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-telemetry="nav_mobile_menu_toggle"
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 ios-glass rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 animate-fadeIn">
            {/* Group 1: The Society & Facility */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2">
                The Society & Facility
              </span>
              <Link
                href="/society"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>The Story & Philosophy</span>
              </Link>
              <Link
                href="/the-hideout"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Mountain className="w-4 h-4 text-blue-400" />
                <span>The Hideout Range (3,420 FT)</span>
              </Link>
              <Link
                href="/partners"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Modacam & Sponsors</span>
              </Link>
            </div>

            {/* Group 2: Competitions & Shooters */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold px-2">
                Competitions & Athletes
              </span>
              <Link
                href="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>Matches ($7,500 Purse Invitational)</span>
              </Link>
              <Link
                href="/shooters"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Shooter Profiles & Rifle Builds</span>
              </Link>
            </div>

            {/* Group 3: Subsonic DNA & Media */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2">
                Ballistics & Media
              </span>
              <Link
                href="/dna"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10"
              >
                <Microscope className="w-4 h-4 text-blue-400" />
                <span>Subsonic DNA Testing Lab</span>
              </Link>
              <Link
                href="/watch"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Film className="w-4 h-4 text-red-400" />
                <span>Watch Slow-Mo 300-Yd Video</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Shop Official Gear & Apparel</span>
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Competitor Comms</span>
              </Link>
            </div>

            {/* Mobile Action: Join The Society */}
            <div className="pt-2 border-t border-white/10">
              <Link
                href="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Users className="w-4 h-4 fill-black" />
                <span>Join The Society — Free Forever</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
