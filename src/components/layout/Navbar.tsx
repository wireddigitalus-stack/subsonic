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
  BarChart3,
  Sliders,
  Camera,
} from "lucide-react";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [callsign, setCallsign] = useState<string>("");
  const [userAvatarPhoto, setUserAvatarPhoto] = useState<string | null>(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            parsed.callsign === "SUBX" ||
            parsed.callsign === "SAID DONE" ||
            parsed.callsign === "SAIDDONE" ||
            parsed.callsign === "ALLEN" ||
            parsed.callsign === "AHURLEY" ||
            parsed.member_id === "SS-PRO-SUBX" ||
            parsed.member_id === "SS-2026-0002" ||
            (parsed.name && parsed.name.toLowerCase().includes("hurley")) ||
            (parsed.name && parsed.name.toLowerCase().includes("allen"))
          ) {
            parsed.callsign = "SUBX";
            parsed.name = "Allen Hurley";
            parsed.rifleSetup = parsed.rifleSetup || "Modacam Custom Precision V-22 / ZCO 527";
            parsed.division = "Owner Admin / Executive";
            parsed.badgeText = "OWNER ADMIN";
            parsed.member_id = "SS-PRO-SUBX";
            parsed.role = "OWNER_ADMIN";
            try {
              localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsed));
            } catch {}
          }
          if (parsed.callsign) setCallsign(parsed.callsign);
          if (parsed.image && parsed.image !== "/images/SS-RWB-LOGO.png") {
            setUserAvatarPhoto(parsed.image);
          } else {
            setUserAvatarPhoto(null);
          }
          const role = (parsed.role || "").toUpperCase();
          const cs = (parsed.callsign || "").toUpperCase();
          if (
            role === "MASTER_OWNER" ||
            role === "OWNER_ADMIN" ||
            role === "DEV_ADMIN" ||
            role === "ADMIN" ||
            ["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY"].includes(cs)
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
    window.addEventListener("subsonic_profile_updated", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("subsonic_profile_updated", checkAuth);
    };
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
    setUserMenuOpen(false);
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
    <header className="site-header fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-2 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
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
                {/* Unified User Account Button with Profile & Logout Options */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    title={`${callsign} — Account & Session Options`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-amber-400/40 text-[11px] sm:text-xs font-mono text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95 group"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {userAvatarPhoto ? (
                      <img src={userAvatarPhoto} alt={callsign} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0 ring-1 ring-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shrink-0" />
                    )}
                    <span className="font-bold text-white group-hover:text-amber-300 transition-colors">{callsign}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-amber-400" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 ios-glass rounded-2xl p-2 border border-white/15 shadow-2xl backdrop-blur-2xl animate-fadeIn z-50 space-y-1">
                      {/* Identity Header */}
                      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2.5">
                        {userAvatarPhoto ? (
                          <img src={userAvatarPhoto} alt={callsign} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs shrink-0">
                            {callsign.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{callsign}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans uppercase">Online</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {isAdmin ? (callsign === "RADAR" ? "Master Owner • Dev Advisor" : "Owner Admin") : "Verified Competitor"}
                          </p>
                        </div>
                      </div>

                      {/* Option 1: Edit Profile & Photos */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsProfileEditOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Edit Profile &amp; Photos</span>
                      </button>

                      {/* Option 2: Enter The Chat */}
                      {pathname !== "/chat" && (
                        <Link
                          href="/chat"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span>Enter Live Chat</span>
                        </Link>
                      )}

                      {/* Option 3: Admin Center if admin */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                          <BarChart3 className="w-4 h-4 text-cyan-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      {/* Divider */}
                      <div className="border-t border-white/10 my-1" />

                      {/* Option 4: Log Out */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLockChat();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm -z-10 lg:hidden animate-fadeIn pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />
        )}

        {/* Mobile Dropdown Menu with dedicated internal scroll container */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden mt-2 ios-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.85)] space-y-4 animate-fadeIn max-h-[calc(100dvh-6rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto overscroll-contain ios-scrollbar touch-pan-y pointer-events-auto"
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
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {userAvatarPhoto ? (
                        <img src={userAvatarPhoto} alt={callsign} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                          {callsign.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          <span>{callsign}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans uppercase">Online</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {isAdmin ? (callsign === "RADAR" ? "Master Owner • Dev Advisor" : "Owner Admin") : "Verified Competitor"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsProfileEditOpen(true);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLockChat();
                      }}
                      className="py-2 px-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>

                  {pathname !== "/chat" && (
                    <Link
                      href="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black flex items-center justify-center gap-2 active:scale-95 transition-all mt-1"
                    >
                      <MessageSquare className="w-4 h-4 fill-black" />
                      <span>Enter The Chat</span>
                    </Link>
                  )}
                </div>
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

      {/* Unified Shooter Profile & Photo Editor Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        onSaved={(updated) => {
          if (updated.image && updated.image !== "/images/SS-RWB-LOGO.png") {
            setUserAvatarPhoto(updated.image);
          }
          if (updated.callsign) {
            setCallsign(updated.callsign);
          }
        }}
      />
    </header>
  );
}
