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
  Trophy
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
          {/* Brand Logo */}
          <Link 
            href="/" 
            data-telemetry="nav_brand_logo"
            className="flex items-center gap-3 group shrink-0"
          >
            <div 
              className="relative rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-black flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, minWidth: 38, minHeight: 38, maxWidth: 38, maxHeight: 38 }}
            >
              <Image
                src="/assets/subsonic-coin.jpg"
                alt="Subsonic Society Coin"
                width={38}
                height={38}
                style={{ width: 38, height: 38, objectFit: "cover" }}
                className="rounded-full transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base tracking-wider text-white">
                SUBSONIC
              </span>
              <span className="font-extrabold text-xs sm:text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                SOCIETY
              </span>
            </div>
          </Link>

          {/* Clean Desktop Navigation with Modern Submenus */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.02] px-2 py-1 rounded-xl border border-white/5">
            {/* Overview Link */}
            <Link
              href="/"
              data-telemetry="nav_link_overview"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
            </Link>

            {/* Submenu 1: Competitions */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("competition")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "competition" ? null : "competition")}
                data-telemetry="nav_dropdown_competition"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  pathname.includes("/bristol-pro") || pathname.includes("/calendar") || activeDropdown === "competition"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Competitions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "competition" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {/* Submenu Panel */}
              {activeDropdown === "competition" && (
                <div className="absolute top-full left-0 mt-2 w-72 ios-glass rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-1">
                  <Link
                    href="/bristol-pro"
                    data-telemetry="nav_submenu_bristol_pro"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                        <span>Bristol Mountain Pro</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">18 Stages</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Course of fire, 465-yd targets & live leaderboard
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/calendar"
                    data-telemetry="nav_submenu_calendar"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400">
                        Event Calendar & Squads
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        2026 match schedule & online registration
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/bristol-pro"
                    data-telemetry="nav_submenu_ballistics"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400">
                        Mountain DOPE Solver
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Elevation holds & wind deflection matrix
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Submenu 2: Community & Comms */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("community")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "community" ? null : "community")}
                data-telemetry="nav_dropdown_community"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  pathname.includes("/chat") || activeDropdown === "community"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Community</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "community" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {/* Submenu Panel */}
              {activeDropdown === "community" && (
                <div className="absolute top-full left-0 mt-2 w-72 ios-glass rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-1">
                  <Link
                    href="/chat"
                    data-telemetry="nav_submenu_chat"
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
                        Tactical channels & match discussions
                      </p>
                    </div>
                  </Link>

                  <a
                    href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-telemetry="nav_submenu_facebook"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-1">
                        <span>Facebook Feed</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Latest video reels, match scores & photos
                      </p>
                    </div>
                  </a>

                  <Link
                    href="/admin"
                    data-telemetry="nav_submenu_admin"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400 flex items-center gap-1.5">
                        <span>Telemetry Admin</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">Live</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Visitor clicks, dwell time & moderation
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Clean Primary Register CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              data-telemetry="nav_primary_register_cta"
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 fill-black" />
              <span>Enter Shootout</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-telemetry="nav_mobile_menu_toggle"
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel with Clean Groupings */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 ios-glass rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 animate-fadeIn">
            {/* Group 1: Competition */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2">
                Competitions
              </span>
              <Link
                href="/bristol-pro"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10"
              >
                <Mountain className="w-4 h-4 text-amber-400" />
                <span>Bristol Mountain Pro (18 Stages)</span>
              </Link>
              <Link
                href="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Event Calendar & Squad Registration</span>
              </Link>
            </div>

            {/* Group 2: Community */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2">
                Community
              </span>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Competitor Comms (AI Shield)</span>
              </Link>
              <a
                href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-blue-400" />
                  <span>Facebook Dispatch Feed</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Admin Telemetry Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
