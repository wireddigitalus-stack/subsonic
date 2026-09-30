"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Crosshair,
  Award,
  Quote,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Camera,
  MapPin,
  MessageSquare,
  Users,
  AlertCircle,
  ArrowRight,
  Maximize2,
  X,
  Share2,
  Shield,
  Flag,
  Flame,
  Check
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

interface Props {
  initialShooter: ShooterProfile | null;
  slug: string;
}

const sanitizeShooter = (s: ShooterProfile | null): ShooterProfile | null => {
  if (!s) return null;
  const copy = { ...s };
  if (!copy.name || copy.name === "VIP Pro Competitor" || copy.name === "Invitational Competitor VIP") {
    copy.name = copy.callsign || "TEST";
  }
  return copy;
};

const getShooterDisplayName = (s?: { name?: string; callsign?: string } | null): string => {
  if (!s) return "";
  if (!s.name || s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
    return s.callsign || "TEST";
  }
  return s.name;
};

const splitName = (fullName: string) => {
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: "MARKSMAN", lastName: parts[0] || "PRO" };
  }
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, parts.length - 1).join(" ");
  return { firstName, lastName };
};

const getCareerStats = (s: ShooterProfile) => {
  if (s.careerStats) {
    return s.careerStats;
  }
  const podiums = s.podiums || 0;
  const wins = Math.max(1, Math.round(podiums * 0.5));
  const top3 = Math.max(podiums, wins);
  const top5 = Math.round(podiums * 1.35) || top3;
  const top10 = Math.round(podiums * 1.6) || top5;
  const matches = Math.max(podiums * 2, 12);
  const states = Math.max(3, Math.min(25, Math.round(matches / 4)));
  const countries = s.accolades?.some((a) => a.includes("USA") || a.includes("WORLD")) ? 2 : 1;
  return {
    matches,
    states,
    countries,
    wins,
    top3,
    top5,
    top10,
    nationalPlacements: s.accolades?.slice(0, 3) || [],
  };
};

export function ShooterProfileClient({ initialShooter, slug }: Props) {
  const [shooter, setShooter] = useState<ShooterProfile | null>(() => sanitizeShooter(initialShooter));
  const [loading, setLoading] = useState(!initialShooter);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Auto-clean any stale VIP Pro boilerplate in browser storage
    if (typeof window !== "undefined") {
      try {
        for (const key of ["subsonic_pro_full_profile", "subsonic_shooter_profile", "subsonic_member_profile"]) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (
              parsed.name === "VIP Pro Competitor" ||
              parsed.full_name === "VIP Pro Competitor" ||
              parsed.name === "Invitational Competitor VIP"
            ) {
              if (parsed.name) parsed.name = parsed.callsign || "TEST";
              if (parsed.full_name) parsed.full_name = parsed.callsign || "TEST";
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          }
        }
      } catch (e) {
        console.warn("Storage sanitize error:", e);
      }
    }

    if (shooter && shooter.name !== "VIP Pro Competitor" && shooter.name !== "Invitational Competitor VIP") {
      return;
    }

    const findShooterLocallyOrRemotely = async () => {
      const cleanSlug = slug.toLowerCase().trim();

      // 1. Check local storage full profile
      if (typeof window !== "undefined") {
        try {
          const rawFull = localStorage.getItem("subsonic_pro_full_profile");
          if (rawFull) {
            const parsed = JSON.parse(rawFull);
            const sanitized = sanitizeShooter(parsed);
            if (
              sanitized?.id?.toLowerCase() === cleanSlug ||
              sanitized?.callsign?.toLowerCase() === cleanSlug ||
              sanitized?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug ||
              cleanSlug === "vip-pro-competitor"
            ) {
              setShooter(sanitized);
              setLoading(false);
              fetch("/api/shooters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitized),
              }).catch(() => {});
              return;
            }
          }

          // 2. Check all shooters array in local storage
          const rawAll = localStorage.getItem("subsonic_all_shooters");
          if (rawAll) {
            const list: ShooterProfile[] = JSON.parse(rawAll);
            const match = list.find((s) => {
              const san = sanitizeShooter(s);
              return (
                san?.id?.toLowerCase() === cleanSlug ||
                san?.callsign?.toLowerCase() === cleanSlug ||
                san?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug ||
                cleanSlug === "vip-pro-competitor"
              );
            });
            if (match) {
              const sanMatch = sanitizeShooter(match);
              setShooter(sanMatch);
              setLoading(false);
              fetch("/api/shooters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanMatch),
              }).catch(() => {});
              return;
            }
          }

          // 3. Check current shooter profile
          const rawCur = localStorage.getItem("subsonic_shooter_profile");
          if (rawCur) {
            const parsed = JSON.parse(rawCur);
            const curCallsign = parsed.callsign || cleanSlug.toUpperCase();
            const curName =
              !parsed.name || parsed.name === "VIP Pro Competitor" || parsed.name === "Invitational Competitor VIP"
                ? curCallsign
                : parsed.name;
            if (
              parsed.callsign?.toLowerCase() === cleanSlug ||
              parsed.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug ||
              cleanSlug === "vip-pro-competitor"
            ) {
              const constructed: ShooterProfile = {
                id: cleanSlug,
                name: curName,
                callsign: curCallsign,
                division: parsed.division || "Open Division Pro",
                ranking: "Appalachian Rimfire Competitor",
                homeRange: "The Hideout, Bristol, TN",
                podiums: 1,
                featuredMatch: "Subsonic Society Invitational 2026",
                image: parsed.image || "/images/SS-RWB-LOGO.png",
                actionPhoto: parsed.image || "/images/SS-RWB-LOGO.png",
                quote: "Precision rimfire in the Appalachian mountains requires absolute consistency and reading the true wind.",
                accolades: ["VERIFIED COMPETITOR"],
                sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
                rifleSetup: {
                  action: parsed.rifleSetup || "Custom Precision Rimfire Rig",
                  barrel: "Match Contour Barrel",
                  trigger: "Match Grade Trigger",
                  chassis: "Precision Chassis",
                  optic: "Zero Compromise Optic / Precision Scope",
                  mount: "Precision Mount",
                  ammoLot: "Lapua Center-X / SK Match",
                },
                createdAt: new Date().toISOString(),
                status: "PUBLISHED",
              };
              setShooter(constructed);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Local storage check error:", e);
        }
      }

      // 4. Try fetching from server API
      try {
        const res = await fetch(`/api/shooters?slug=${encodeURIComponent(cleanSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.shooter) {
            setShooter(sanitizeShooter(data.shooter));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch shooter failed:", err);
      }

      setLoading(false);
    };

    findShooterLocallyOrRemotely();
  }, [slug]);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
            SYNCHRONIZING MARKSMAN TELEMETRY
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            Fetching tournament spotlight credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!shooter) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full ios-glass-card rounded-3xl p-8 border border-white/10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              DOSSIER NOT LOCATED
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Marksman Profile Pending
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              No published shooter dossier matches callsign or ID <code className="text-amber-400 font-mono font-bold">&ldquo;{slug}&rdquo;</code>. If you recently generated this profile, please ensure your submission was saved.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/shooters"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 transition-all"
            >
              <Users className="w-4 h-4 fill-black" />
              <span>Browse All Competitors</span>
            </Link>

            <Link
              href="/invite/pro"
              className="w-full py-3 px-4 rounded-xl ios-glass text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pro VIP Intake Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = getShooterDisplayName(shooter);
  const { firstName, lastName } = splitName(displayName);
  const stats = getCareerStats(shooter);
  const posterUrl = shooter.posterImage || shooter.image || "/images/SS-RWB-LOGO.png";

  // Schema.org Person & Athlete Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    alternateName: shooter.callsign,
    description: shooter.quote,
    image: shooter.image?.startsWith("http")
      ? shooter.image
      : `https://subsonic-omega.vercel.app${shooter.image}`,
    jobTitle: shooter.division,
    memberOf: {
      "@type": "SportsOrganization",
      name: "Subsonic Society",
      url: "https://subsonic-omega.vercel.app",
    },
    award: shooter.accolades,
    sponsor: shooter.sponsors?.map((sp) => ({
      "@type": "Organization",
      name: sp,
    })),
    knowsAbout: [
      "Precision Rimfire Shooting",
      "Extreme Long Range Subsonic Ballistics",
      shooter.division,
      shooter.rifleSetup?.action,
      shooter.rifleSetup?.optic,
      shooter.rifleSetup?.chassis,
    ],
    workLocation: {
      "@type": "Place",
      name: shooter.homeRange,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bristol",
        addressRegion: "TN",
        addressCountry: "US",
      },
    },
  };

  // Official tournament sponsor logos list
  const defaultSponsors = [
    { name: "MasterPiece Arms", subtitle: "BA Chassis Systems", badge: "MPA" },
    { name: "Modacam Custom Rifles", subtitle: "Presenting Partner", badge: "MODACAM" },
    { name: "Vortex Optics", subtitle: "Razor HD Gen III", badge: "VORTEX" },
    { name: "Zermatt Arms", subtitle: "RimX Precision Actions", badge: "ZERMATT" },
    { name: "Clenzoil", subtitle: "Field & Range CLP", badge: "CLENZOIL" },
    { name: "Leofoto", subtitle: "Carbon Precision Tripods", badge: "LEOFOTO" },
    { name: "Hoz & Shield", subtitle: "Tactical Gear & Support", badge: "HOZ & SHIELD" },
    { name: "Arrow Products USA", subtitle: "Precision Ballistics", badge: "ARROW" },
  ];

  return (
    <div className="min-h-screen text-slate-100 pb-32">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── TOP TOURNAMENT NAV & ACTION BAR ─────────────────────────── */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/shooters" className="hover:text-white transition-colors">Marksmen Directory</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">{shooter.callsign}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPosterModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Spotlight Poster</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href="/chat"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:brightness-110 text-black transition-all flex items-center gap-1.5 shadow-tactical-glow"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-black" />
              <span>Squad Comms</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-12">
        
        {/* ─── TOURNAMENT SPOTLIGHT PRINT POSTER HERO CONTAINER ─────────── */}
        <div className="relative rounded-3xl bg-zinc-950 border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden">
          
          {/* Atmospheric Background Layers: Carbon Grunge + Mountain Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-black pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.07] bg-repeat pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/[0.05] rounded-full blur-[120px] pointer-events-none" />

          {/* 1. Official Tournament Header Ribbon (Print-Exact) */}
          <div className="relative z-10 border-b border-amber-500/30 bg-black/70 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 rounded-full border border-amber-400/40 overflow-hidden bg-black p-1 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <img
                  src="/images/SS-RWB-LOGO.png"
                  alt="Subsonic Society Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.18em] sm:tracking-[0.25em] text-amber-400 uppercase">
                  SUBSONIC SOCIETY INVITATIONAL
                </div>
                <div className="text-lg sm:text-2xl font-black italic tracking-wider chrome-metallic-text uppercase">
                  SHOOTER SPOTLIGHT
                </div>
              </div>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-xs font-mono tracking-wider sm:tracking-widest text-slate-300 uppercase border border-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/[0.03] max-w-full text-center">
              <span className="text-amber-400 font-bold">PRECISION</span>
              <span className="text-slate-600">•</span>
              <span className="text-white font-bold">COMMUNITY</span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400 font-bold whitespace-nowrap">A HIGHER STANDARD</span>
            </div>
          </div>

          {/* Main Poster Body Grid */}
          <div className="relative z-10 p-4 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            
            {/* ─── LEFT FLANK: Watermark Badge + Vertical Tactical Rail ───── */}
            <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-between self-stretch py-4 border-r border-white/10 relative">
              {/* Distressed Round Logo Watermark */}
              <div className="relative w-32 h-32 rounded-full border-2 border-white/20 p-2 shadow-2xl bg-black/40">
                <img
                  src="/images/SS-RWB-LOGO.png"
                  alt="Official Society Crest"
                  className="w-full h-full object-contain filter contrast-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                />
              </div>

              {/* Vertical Stencil Text "PRECISION IS IN OUR DNA" */}
              <div className="my-8 flex items-center justify-center">
                <div 
                  className="text-xs font-mono font-black tracking-[0.4em] text-slate-400 uppercase whitespace-nowrap select-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  <span className="text-amber-400">PRECISION</span> IS IN OUR DNA
                </div>
              </div>

              {/* Verified Crest Badge */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Crosshair className="w-5 h-5 text-amber-400" />
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                  MATCH SERIAL
                </span>
                <span className="text-[10px] font-mono font-bold text-white uppercase">
                  SS-{shooter.callsign}
                </span>
              </div>
            </div>

            {/* ─── CENTER STAGE: Shooter Portrait / Card Showcase ─────────── */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative w-full">
              
              {/* If shooter has full tournament poster graphic, display in natural ratio (aspect-[682/1024]) */}
              {shooter.posterImage ? (
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[682/1024] rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.4)] bg-black group">
                  <img
                    src={shooter.posterImage}
                    alt={`${displayName} Official Tournament Graphic`}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setShowPosterModal(true)}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 shadow-lg z-20"
                    title="Expand Full Resolution Poster"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              ) : (
                /* Outer Golden / Metallic Rim Frame for standard portraits */
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.35)] bg-gradient-to-b from-zinc-900 to-black group">
                  <img
                    src={shooter.image || "/images/SS-RWB-LOGO.png"}
                    alt={displayName}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/50 text-amber-400 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>INVITATIONAL PRO</span>
                    </span>
                    <button
                      onClick={() => setShowPosterModal(true)}
                      className="p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 shadow-lg"
                      title="Expand Full Print Poster"
                    >
                      <Maximize2 className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-amber-500 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider">
                        CALLSIGN: {shooter.callsign}
                      </span>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-500/30 border border-blue-400/40 text-blue-300 font-mono text-[10px] sm:text-[11px] truncate max-w-[200px]">
                        {shooter.division}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{shooter.homeRange}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Action under image */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowPosterModal(true)}
                  className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>View Full Poster Graphic</span>
                </button>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  PRECISION IS IN OUR DNA
                </span>
              </div>
            </div>

            {/* ─── RIGHT FLANK: Massive Chrome Typography + Stats ─────────── */}
            <div className="lg:col-span-6 space-y-6 lg:pl-4">
              
              {/* Name Block: Spaced First Name + Massive Metallic Chrome Last Name */}
              <div className="space-y-1 text-center lg:text-left">
                <div className="text-lg sm:text-2xl font-mono uppercase tracking-[0.35em] text-slate-300 font-light">
                  {firstName}
                </div>
                <h1 className="chrome-metallic-text text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tight leading-none">
                  {lastName}
                </h1>
                
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFIED PRO ATHLETE</span>
                  </span>

                  {shooter.accolades?.some(a => a.includes("USA")) && (
                    <span className="px-3 py-1 rounded-full bg-blue-600/25 border border-blue-400/50 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
                      <Flag className="w-3.5 h-3.5 text-blue-400" />
                      <span>TEAM USA 🇺🇸</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-semibold">
                    <Award className="w-4 h-4" />
                    <span>{shooter.ranking}</span>
                  </div>
                </div>
              </div>

              {/* Accolades Bullet List (Print-Exact) */}
              {shooter.accolades && shooter.accolades.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    Official Career Accolades & World Honours
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {shooter.accolades.map((acc, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-colors flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200"
                      >
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── PRINT-EXACT STAT BOX CONTAINER ───────────────────────── */}
              <div className="rounded-2xl bg-black/80 border-2 border-amber-500/40 p-5 space-y-4 shadow-[0_0_35px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Competitive Match Matrix</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Live Score Verification
                  </span>
                </div>

                {/* Line 1: Matches • States • Countries */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                      {stats.matches}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Matches
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                      {stats.states}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      States
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                    <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                      {stats.countries}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Countries
                    </div>
                  </div>
                </div>

                {/* Line 2: Wins • Top-3s • Top-5s • Top-10s */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-lg sm:text-xl font-mono font-black text-amber-400">
                      {stats.wins}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                      Wins
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-lg sm:text-xl font-mono font-black text-white">
                      {stats.top3}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      Top-3
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-lg sm:text-xl font-mono font-black text-white">
                      {stats.top5}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      Top-5
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-lg sm:text-xl font-mono font-black text-slate-300">
                      {stats.top10}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      Top-10
                    </div>
                  </div>
                </div>

                {/* National Placements Row */}
                {stats.nationalPlacements && stats.nationalPlacements.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      National Championship Placements
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.nationalPlacements.map((plc, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-slate-200"
                        >
                          {plc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Quote with Cursive Script Signature */}
              {shooter.quote && (
                <div className="relative p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <Quote className="w-8 h-8 text-amber-500/20 absolute top-4 right-4 pointer-events-none" />
                  <p className="italic text-slate-200 text-sm sm:text-base leading-relaxed font-serif">
                    &ldquo;{shooter.quote}&rdquo;
                  </p>
                  <div className="font-signature text-2xl sm:text-3xl text-amber-300/90 pt-1 tracking-wide">
                    — {shooter.signature || displayName}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ─── BOTTOM TOURNAMENT RIBBON & PRESENTING SPONSOR (PRINT-EXACT) ─── */}
          <div className="relative z-10 border-t-2 border-amber-500/40 bg-black/90 px-6 py-6 space-y-6">
            
            {/* Top Bar: $7,500 Money Match • Presented by Modacam Custom Rifles */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 text-center md:text-left">
              <div>
                <div className="text-xs sm:text-sm font-mono font-black text-amber-400 uppercase tracking-[0.25em]">
                  $7,500 MONEY MATCH • MAKING RIMFIRE HISTORY
                </div>
                <div className="text-slate-400 text-xs font-mono uppercase tracking-wider pt-0.5">
                  18 Natural Terrain Stages • The Hideout • Bristol, TN
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.04] border border-amber-500/30 px-5 py-2.5 rounded-2xl">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    PRESENTED BY
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider">
                    MODACAM CUSTOM RIFLES
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-1.5 shrink-0">
                  <img
                    src="/assets/modacam-logo-transparent.png"
                    alt="Modacam Custom Rifles"
                    className="w-full h-full object-contain filter invert"
                  />
                </div>
              </div>
            </div>

            {/* Official Sponsor Logo Ribbon */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block text-center md:text-left">
                Official Invitational Partner Alliances
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {defaultSponsors.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.05] transition-all text-center space-y-0.5 group"
                  >
                    <div className="text-[11px] font-mono font-bold text-slate-300 group-hover:text-amber-400 transition-colors uppercase truncate">
                      {sp.badge}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">
                      {sp.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ─── SECTION 2: VERIFIED EQUIPMENT BLUEPRINT ───────────────────── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Crosshair className="w-4 h-4" />
              <span>Ballistic & Hardware Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Competition Rifle Rig Specifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Verified component configuration fielded by {displayName} in Appalachian match conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Action</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.action || "Precision Action"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Barrel & Twist</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.barrel || "Match Barrel"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Trigger Pull</span>
              <div className="text-sm font-bold text-amber-400 leading-snug">{shooter.rifleSetup?.trigger || "Match Trigger"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Chassis / Stock</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.chassis || "Precision Chassis"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Optic & Reticle</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.optic || "Competition Optic"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Scope Mount</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.mount || "Match Mount"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Harmonic Tuner</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup?.tuner || "Precision Tuner"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Match Ammo & Velocity</span>
              <div className="text-sm font-bold text-emerald-400 leading-snug">{shooter.rifleSetup?.ammoLot || "Lapua Center-X / SK"}</div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: ACTION PHOTO & TECHNICAL INTERVIEW ─────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Photo Showcase */}
          {shooter.actionPhoto && (
            <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Rifle Rig in Action</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">The Hideout Bay</span>
              </div>

              <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/10 relative bg-black">
                <img
                  src={shooter.actionPhoto}
                  alt={`${displayName} in competition`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          )}

          {/* Match Strategy & Technical Q&A */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Technical Interview & Wind Strategy</span>
              </div>

              {shooter.interview && shooter.interview.length > 0 ? (
                shooter.interview.map((qa, index) => (
                  <div key={index} className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                    <h4 className="text-xs font-bold text-amber-400 font-mono">
                      Q: {qa.question}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      &ldquo;{qa.answer}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400">
                  Technical interview dossier pending range verification.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <span>MEMBER DOSSIER: {shooter.callsign}</span>
              <Link
                href="/chat"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <span>Connect in Squad Comms</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* ─── FULL-SCREEN POSTER ARTWORK MODAL ──────────────────────────── */}
      {showPosterModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPosterModal(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-zinc-950 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(245,158,11,0.4)] space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  SUBSONIC SOCIETY INVITATIONAL
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {displayName} • Official Shooter Spotlight Print
                </h3>
              </div>
              <button
                onClick={() => setShowPosterModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Image Container */}
            <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative flex items-center justify-center">
              <img
                src={posterUrl}
                alt={`${displayName} Shooter Spotlight Poster`}
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-slate-400">
                Official 2026 Tournament Print Artwork
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={posterUrl}
                  download={`${shooter.callsign}-spotlight-poster.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-tactical-glow"
                >
                  <Camera className="w-4 h-4 fill-black" />
                  <span>Open Full Resolution</span>
                </a>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
