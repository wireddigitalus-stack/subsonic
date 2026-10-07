"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  ChevronDown, 
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
  Target,
  Mail,
  Lock,
  LogOut,
  Key,
  BarChart3
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [callsign, setCallsign] = useState<string>("");

  // Track private chat room auth state & callsign
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkAuth = async () => {
      // First check if there is an active server admin session (Allen or Rob)
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.session) {
            setIsAuthenticated(true);
            setIsAdmin(true);
            setCallsign(data.session.callsign || "RADAR");
            return;
          }
        }
      } catch {}

      const isAuth = localStorage.getItem("subsonic_chat_authenticated") === "true";
      setIsAuthenticated(isAuth);
      const profile = localStorage.getItem("subsonic_shooter_profile");
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          if (
            parsed.callsign === "LTDAN" ||
            parsed.callsign === "ROB" ||
            parsed.member_id === "SS-2026-0001" ||
            (parsed.name && parsed.name.toLowerCase().includes("neilson"))
          ) {
            parsed.callsign = "RADAR";
            parsed.rifleSetup = "Systems & Infrastructure Architecture (Non-Shooter)";
            parsed.division = "Master Admin";
            parsed.badgeText = "MASTER ADMIN";
            parsed.member_id = "SS-2026-0001";
            parsed.role = "MASTER_OWNER";
            try {
              localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsed));
            } catch {}
          } else if (
            parsed.callsign === "SAID DONE" ||
            parsed.callsign === "SAIDDONE" ||
            parsed.callsign === "ALLEN" ||
            parsed.callsign === "AHURLEY" ||
            parsed.member_id === "SS-2026-0002" ||
            (parsed.name && parsed.name.toLowerCase().includes("hurley")) ||
            (parsed.name && parsed.name.toLowerCase().includes("allen"))
          ) {
            parsed.callsign = "SAID DONE";
            parsed.name = "Allen Hurley";
            parsed.rifleSetup = parsed.rifleSetup || "Modacam Custom Precision V-22 / ZCO 527";
            parsed.division = "Owner Admin / Executive";
            parsed.badgeText = "OWNER ADMIN";
            parsed.member_id = "SS-2026-0002";
            parsed.role = "OWNER_ADMIN";
            try {
              localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsed));
            } catch {}
          }
          if (parsed.callsign) setCallsign(parsed.callsign);
          const role = (parsed.role || "").toUpperCase();
          const cs = (parsed.callsign || "").toUpperCase();
          if (
            role === "MASTER_OWNER" ||
            role === "OWNER_ADMIN" ||
            role === "DEV_ADMIN" ||
            role === "ADMIN" ||
            ["RADAR", "ROB", "LTDAN", "SAID DONE", "SAIDDONE", "ALLEN", "AHURLEY", "HURLEY"].includes(cs)
          ) {
            setIsAdmin(true);
          }
        } catch {
          // ignore
        }
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLockChat = async () => {
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {}
      localStorage.removeItem("subsonic_chat_authenticated");
      localStorage.removeItem("subsonic_shooter_profile");
      localStorage.removeItem("subsonic_member_profile");
      setIsAuthenticated(false);
      setIsAdmin(false);
      window.location.reload();
    }
  };

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background page from scrolling when mobile menu is open (iOS & Android safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        const top = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        const parsedY = top ? Math.abs(parseInt(top, 10)) : scrollY;
        window.scrollTo(0, parsedY);
      };
    }
  }, [mobileMenuOpen]);

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
                src="/images/SS-RWB-LOGO.png"
                alt="Subsonic Society Official Emblem"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
            
            {/* Wordmark */}
            <div className="relative h-[26px] w-[125px] sm:h-[46px] sm:w-[220px] flex items-center shrink-0">
              <Image
                src="/assets/subsonic-banner-trimmed.png"
                alt="Subsonic Society"
                fill
                sizes="(max-width: 640px) 125px, 220px"
                className="object-contain object-left group-hover:brightness-110 transition-all duration-200"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation: Full Public Menus */}
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
                  pathname.startsWith("/society") || pathname.startsWith("/chat") || pathname.startsWith("/the-hideout") || pathname.startsWith("/partners") || pathname.startsWith("/contact") || activeDropdown === "society"
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
                    href="/chat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                        <span>Competitor Chat Room</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Live</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        DOPE drops & squad chat
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/partners"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400">
                        Modacam & Partners
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Presenting sponsors & industry leaders
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/contact"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400">
                        Contact & Inquiries
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Match inquiries, sponsorship & leads
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Link: The 2026 Invitational */}
            <Link
              href="/invitational"
              data-telemetry="nav_link_packet"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname === "/invitational" || pathname === "/competitor-packet"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>The 2026 Invitational</span>
            </Link>

            {/* Direct Link: Shooter Profiles */}
            <Link
              href="/shooters"
              data-telemetry="nav_link_shooters"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname.startsWith("/shooters")
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Shooter Profiles</span>
            </Link>
          </div>

          {/* Right Action: Private Comms controls, Join CTA, and Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-bold">{callsign}</span>
                </div>
                {pathname !== "/chat" && (
                  <Link
                    href="/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:brightness-110 active:scale-95 transition-all items-center gap-1.5 shadow-tactical-glow"
                    title="Open Live Chat Room in New Tab"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-black" />
                    <span>Enter The Chat</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLockChat}
                  title="Log Out & Lock Session"
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/chat"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Member Login</span>
                </Link>

                <Link
                  href="/invite/pro"
                  data-telemetry="nav_primary_invite_cta"
                  className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 fill-black" />
                  <span>Redeem Code</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-telemetry="nav_mobile_menu_toggle"
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Backdrop to prevent background interactions & close on tap */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm -z-10 lg:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />
        )}

        {/* Mobile Dropdown Menu with dedicated internal scroll container */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden mt-2 ios-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.85)] space-y-4 animate-fadeIn max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain ios-scrollbar touch-pan-y"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Group 1: The Society & Facility */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2">
                The Society & Facility
              </span>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat Room (Live)</span>
              </Link>
              <Link
                href="/partners"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>Modacam & Partners</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Contact & Inquiries</span>
              </Link>
            </div>

            {/* Group 2: Competitions & Athletes */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold px-2">
                Competitions & Athletes
              </span>
              <Link
                href="/invitational"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <div className="flex items-center justify-between w-full">
                  <span>The 2026 Invitational</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono font-bold uppercase">$7.5K Purse</span>
                </div>
              </Link>
              <Link
                href="/shooters"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Shooter Profiles & Rifle Builds</span>
              </Link>
            </div>

            {/* Group 3: Command & Administration (Admin only) */}
            {isAdmin && (
              <div className="space-y-1 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2">
                  Command & Administration
                </span>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Admin Control Center</span>
                </Link>
              </div>
            )}

            {/* Mobile Action: Member status & actions */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono font-bold text-white">Signed in as {callsign}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLockChat();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                  {pathname !== "/chat" && (
                    <Link
                      href="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 fill-black" />
                      <span>Enter The Chat</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/invite/pro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Key className="w-4 h-4 fill-black" />
                  <span>Redeem Code</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
