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
  ArrowRight
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

interface Props {
  initialShooter: ShooterProfile | null;
  slug: string;
}

export function ShooterProfileClient({ initialShooter, slug }: Props) {
  const [shooter, setShooter] = useState<ShooterProfile | null>(initialShooter);
  const [loading, setLoading] = useState(!initialShooter);

  useEffect(() => {
    if (shooter) return;

    const findShooterLocallyOrRemotely = async () => {
      const cleanSlug = slug.toLowerCase().trim();

      // 1. Check local storage full profile
      if (typeof window !== "undefined") {
        try {
          const rawFull = localStorage.getItem("subsonic_pro_full_profile");
          if (rawFull) {
            const parsed = JSON.parse(rawFull);
            if (
              parsed.id?.toLowerCase() === cleanSlug ||
              parsed.callsign?.toLowerCase() === cleanSlug ||
              parsed.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
            ) {
              setShooter(parsed);
              setLoading(false);
              // Sync to server in background
              fetch("/api/shooters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
              }).catch(() => {});
              return;
            }
          }

          // 2. Check all shooters array in local storage
          const rawAll = localStorage.getItem("subsonic_all_shooters");
          if (rawAll) {
            const list: ShooterProfile[] = JSON.parse(rawAll);
            const match = list.find(
              (s) =>
                s.id?.toLowerCase() === cleanSlug ||
                s.callsign?.toLowerCase() === cleanSlug ||
                s.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
            );
            if (match) {
              setShooter(match);
              setLoading(false);
              fetch("/api/shooters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(match),
              }).catch(() => {});
              return;
            }
          }

          // 3. Check current shooter profile
          const rawCur = localStorage.getItem("subsonic_shooter_profile");
          if (rawCur) {
            const parsed = JSON.parse(rawCur);
            if (
              parsed.callsign?.toLowerCase() === cleanSlug ||
              parsed.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
            ) {
              // Construct profile from saved session
              const constructed: ShooterProfile = {
                id: cleanSlug,
                name: parsed.name || "Marksman",
                callsign: parsed.callsign || cleanSlug.toUpperCase(),
                division: parsed.division || "Open Division Pro",
                ranking: "Appalachian Rimfire Competitor",
                homeRange: "The Hideout, Bristol, TN",
                podiums: 1,
                featuredMatch: "The Subsonic Society Invitational 2026",
                image: parsed.image || "/assets/subsonic-coin.jpg",
                actionPhoto: parsed.image || "/assets/subsonic-coin.jpg",
                quote: "Precision rimfire in the Appalachian mountains requires absolute consistency and reading the true wind.",
                accolades: ["VERIFIED COMPETITOR"],
                sponsors: ["Subsonic Society"],
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
          if (data.shooter) {
            setShooter(data.shooter);
          }
        }
      } catch (err) {
        console.error("Failed fetching shooter from API:", err);
      } finally {
        setLoading(false);
      }
    };

    findShooterLocallyOrRemotely();
  }, [slug, shooter]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Retrieving Marksman Dossier Telemetry...
        </p>
      </div>
    );
  }

  // Not Found State (replaces hard 404 with high-end tactical recovery)
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

  // Schema.org Person & Athlete Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: shooter.name,
    alternateName: shooter.callsign,
    description: shooter.quote,
    image: shooter.image?.startsWith("http")
      ? shooter.image
      : `https://subsonic-omega.vercel.app${shooter.image}`,
    jobTitle: shooter.division,
    memberOf: {
      "@type": "SportsOrganization",
      name: "The Subsonic Society",
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

  return (
    <div className="min-h-screen text-slate-100 pb-28">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/shooters" className="hover:text-white transition-colors">Marksmen Directory</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">{shooter.callsign}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/shooters"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Marksmen</span>
            </Link>

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* HERO DOSSIER CARD */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-amber-500/40 shadow-2xl overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Photo + Identity + Podiums */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Image with Tactical Ring */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-black relative shrink-0">
                <img
                  src={shooter.image || "/assets/subsonic-coin.jpg"}
                  alt={shooter.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity & Badges */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-wider">
                    CALLSIGN: {shooter.callsign}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono">
                    {shooter.division}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED PRO</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  {shooter.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-300 pt-0.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{shooter.ranking}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{shooter.homeRange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Podiums Metric Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center sm:text-right shrink-0 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center sm:justify-end gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Career Podiums</span>
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                {shooter.podiums}
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                Verified Match Finishes
              </div>
            </div>
          </div>

          {/* Accolades Bar */}
          {shooter.accolades && shooter.accolades.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Official Match Accolades & Honours
              </span>
              <div className="flex flex-wrap gap-2">
                {shooter.accolades.map((acc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{acc}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {shooter.quote && (
            <div className="relative p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/10 italic text-slate-200 text-sm sm:text-base leading-relaxed font-serif">
              <Quote className="w-8 h-8 text-amber-500/30 absolute top-4 right-4 pointer-events-none" />
              &ldquo;{shooter.quote}&rdquo;
            </div>
          )}
        </div>

        {/* SECTION 2: VERIFIED EQUIPMENT BLUEPRINT */}
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
              Verified component configuration fielded by {shooter.name} in Appalachian match conditions.
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

        {/* SECTION 3: SPONSORS & FACTORY ALLIANCES */}
        {shooter.sponsors && shooter.sponsors.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                Industry Endorsements
              </div>
              <h3 className="text-lg font-black text-white">Official Factory & Gear Partners</h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {shooter.sponsors.map((sp, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-2 hover:border-amber-400/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sp}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: ACTION PHOTO & TECHNICAL INTERVIEW */}
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
                  alt={`${shooter.name} in competition`}
                  className="w-full h-full object-cover"
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
              <span>MEMBER PROFILE: {shooter.callsign}</span>
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
    </div>
  );
}
