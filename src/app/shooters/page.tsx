"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  Trophy, 
  Crosshair, 
  Target, 
  Award, 
  Quote, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Search,
  PlusCircle,
  Camera,
  ExternalLink,
  Tag,
  Star,
  MessageSquare,
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

// Seed fallback data to guarantee immediate rendering even if network lags
const FALLBACK_SHOOTERS: ShooterProfile[] = [
  {
    id: "allen-hurley",
    name: "Allen Hurley",
    callsign: "SAID DONE",
    division: "Owner Admin / Executive",
    ranking: "Founder • Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 12,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "We built The Hideout because rimfire precision deserves a home that doesn't cut corners. Two hundred and twenty acres of Tennessee ridgeline purpose-built for marksmen who take this game seriously. Said. Done.",
    signature: "Allen Hurley",
    accolades: ["FOUNDER 👑", "MATCH HOST", "EXECUTIVE RO"],
    careerStats: {
      matches: 38,
      states: 9,
      countries: 1,
      wins: 12,
      top3: 20,
      top5: 28,
      top10: 35,
      nationalPlacements: ["Host & Director — Subsonic Society Invitational", "1st Place — Bristol Ridge Shootout"],
    },
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Modacam Custom Precision V-22 Rimfire",
      barrel: "22\" Custom Fluted Match Contour",
      trigger: "TriggerTech Diamond Pro Curved (5 oz)",
      chassis: "MDT ACC Elite Carbon Inlay Custom",
      optic: "Zero Compromise Optic ZC527",
      mount: "Spuhr 36mm Unimount",
      tuner: "Modacam Custom Harmonic Brake",
      ammoLot: "Lapua Center-X Hand-Sorted (1,064 FPS)",
    },
    interview: [
      {
        question: "What was the vision behind The Hideout complex in Bristol?",
        answer: "To bring together the best shooters in the country onto terrain that tests real wind reading and elevation, while providing hospitality, live scoring, and community that the sport has been missing.",
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
    status: "PUBLISHED",
  }
];

const isExcludedShooter = (s: { name?: string; callsign?: string; id?: string }): boolean => {
  const name = (s.name || "").toUpperCase();
  const call = (s.callsign || "").toUpperCase();
  const id = (s.id || "").toLowerCase();
  return (
    name.includes("ROB NEILSON") ||
    call === "RADAR" ||
    call === "ROB" ||
    call === "LTDAN" ||
    id === "rob-neilson" ||
    id === "radar" ||
    name.includes("JOHN DOE") ||
    call === "DOE" ||
    call === "JOHNDOE" ||
    id === "john-doe" ||
    id === "johndoe"
  );
};

function ShootersContent() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [shooters, setShooters] = useState<ShooterProfile[]>(FALLBACK_SHOOTERS);
  const [selectedShooter, setSelectedShooter] = useState<ShooterProfile>(FALLBACK_SHOOTERS[0]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");

  useEffect(() => {
    const fetchShooters = async () => {
      let localList: ShooterProfile[] = [];
      if (typeof window !== "undefined") {
        try {
          // Auto-sanitize any stale generic boilerplate or test profiles from previous invite tests
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
              if (isExcludedShooter(parsed)) {
                // If it is John Doe, purge it from test storage
                if (String(parsed.name).toUpperCase().includes("JOHN DOE")) {
                  localStorage.removeItem(key);
                }
              }
            }
          }

          const rawAll = localStorage.getItem("subsonic_all_shooters");
          if (rawAll) {
            const parsed = JSON.parse(rawAll);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.name === "VIP Pro Competitor" || item.name === "Invitational Competitor VIP") {
                  item.name = item.callsign || "TEST";
                }
                if (!isExcludedShooter(item)) {
                  localList.push(item);
                }
              }
            }
          }
          const rawPro = localStorage.getItem("subsonic_pro_full_profile");
          if (rawPro) {
            const pro = JSON.parse(rawPro);
            if (pro && pro.id) {
              if (pro.name === "VIP Pro Competitor" || pro.name === "Invitational Competitor VIP") {
                pro.name = pro.callsign || "TEST";
              }
              if (!isExcludedShooter(pro) && !localList.some((s) => s.id === pro.id)) {
                localList.unshift(pro);
              }
            }
          }
          const rawCur = localStorage.getItem("subsonic_shooter_profile");
          if (rawCur) {
            const cur = JSON.parse(rawCur);
            if (cur && (cur.callsign || cur.name)) {
              const curCallsign = cur.callsign || "TEST";
              const curName = (!cur.name || cur.name === "VIP Pro Competitor" || cur.name === "Invitational Competitor VIP") ? curCallsign : cur.name;
              const curId = curCallsign.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              if (!isExcludedShooter({ name: curName, callsign: curCallsign, id: curId }) && !localList.some((s) => s.id === curId || s.callsign?.toLowerCase() === curCallsign.toLowerCase())) {
                localList.unshift({
                  id: curId,
                  name: curName,
                  callsign: curCallsign,
                  division: cur.division || "Open Division Pro",
                  ranking: "Appalachian Rimfire Competitor",
                  homeRange: "The Hideout, Bristol, TN",
                  podiums: 1,
                  featuredMatch: "Subsonic Society Invitational 2026",
                  image: cur.image || "/images/SS-RWB-LOGO.png",
                  actionPhoto: cur.image || "/images/SS-RWB-LOGO.png",
                  quote: "Precision rimfire demands absolute trust in your elevation DOPE and wind read.",
                  accolades: ["VERIFIED COMPETITOR"],
                  sponsors: ["Subsonic Society"],
                  rifleSetup: {
                    action: cur.rifleSetup || "Custom Precision Rimfire Rig",
                    barrel: 'Match Contour 20" (1:16)',
                    trigger: "Match Grade Trigger",
                    chassis: "Precision Chassis",
                    optic: "Zero Compromise Optic",
                    mount: "Spuhr 0 MOA",
                    ammoLot: "Lapua Center-X",
                  },
                  createdAt: new Date().toISOString(),
                  status: "PUBLISHED",
                });
              }
            }
          }
        } catch (e) {
          console.warn("Error reading local shooters:", e);
        }
      }

      try {
        setLoading(true);
        const res = await fetch("/api/shooters");
        if (res.ok) {
          const data = await res.json();
          if (data.shooters && data.shooters.length > 0) {
            const map = new Map<string, ShooterProfile>();
            for (const s of data.shooters) {
              if (s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
                s.name = s.callsign || "TEST";
              }
              map.set(s.id.toLowerCase(), s);
            }
            for (const s of localList) {
              if (s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
                s.name = s.callsign || "TEST";
              }
              map.set(s.id.toLowerCase(), s);
            }
            const finalShooters = Array.from(map.values()).filter((s) => !isExcludedShooter(s));
            setShooters(finalShooters);

            if (requestedId) {
              const reqLower = requestedId.toLowerCase().replace(/^dm_/, "").trim();
              const matched = finalShooters.find((s: ShooterProfile) => 
                s.id?.toLowerCase() === reqLower ||
                s.callsign?.toLowerCase() === reqLower ||
                s.id?.toLowerCase().includes(reqLower) ||
                reqLower.includes(s.id?.toLowerCase())
              );
              if (matched) {
                setSelectedShooter(matched);
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  window.location.replace(`/shooters/${matched.id}`);
                }
                return;
              }
            }
            if (finalShooters.length > 0) {
              setSelectedShooter(finalShooters[0]);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch live shooters:", err);
      } finally {
        setLoading(false);
      }

      // Fallback merge if API network fails
      const fallbackMap = new Map<string, ShooterProfile>();
      for (const s of FALLBACK_SHOOTERS) {
        if (s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
          s.name = s.callsign || "TEST";
        }
        fallbackMap.set(s.id.toLowerCase(), s);
      }
      for (const s of localList) {
        if (s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
          s.name = s.callsign || "TEST";
        }
        fallbackMap.set(s.id.toLowerCase(), s);
      }
      const combined = Array.from(fallbackMap.values()).filter((s) => !isExcludedShooter(s));
      setShooters(combined);
      if (requestedId) {
        const reqLower = requestedId.toLowerCase().replace(/^dm_/, "").trim();
        const matched = combined.find((s: ShooterProfile) => 
          s.id?.toLowerCase() === reqLower ||
          s.callsign?.toLowerCase() === reqLower ||
          s.id?.toLowerCase().includes(reqLower) ||
          reqLower.includes(s.id?.toLowerCase())
        );
        if (matched) {
          setSelectedShooter(matched);
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            window.location.replace(`/shooters/${matched.id}`);
          }
          return;
        }
      }
      setSelectedShooter(combined[0]);
    };

    fetchShooters();
  }, [requestedId]);

  const getShooterDisplayName = (s: { name?: string; callsign?: string }): string => {
    if (!s.name || s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
      return s.callsign || "TEST";
    }
    return s.name;
  };

  // Handle filtering
  const filteredShooters = shooters.filter((shooter) => {
    const matchesDiv = divisionFilter === "ALL" || shooter.division.toLowerCase().includes(divisionFilter.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const displayName = getShooterDisplayName(shooter).toLowerCase();
    const matchesSearch = 
      !query ||
      displayName.includes(query) ||
      shooter.name.toLowerCase().includes(query) ||
      shooter.callsign.toLowerCase().includes(query) ||
      shooter.ranking.toLowerCase().includes(query) ||
      shooter.homeRange.toLowerCase().includes(query) ||
      (shooter.sponsors && shooter.sponsors.some((s) => s.toLowerCase().includes(query)));

    return matchesDiv && matchesSearch;
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-bold">Competitor Profiles</span>
        </nav>
      </div>

      {/* Header with Call-to-Action */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>SUBSONIC SOCIETY ATHLETE PROFILES</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all active:scale-95"
                title="Return to Live Chat Room"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>← Return to Live Chat</span>
              </Link>

              <Link
                href="/invite/pro"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Claim Pro Profile (VIP Code)</span>
              </Link>

              <Link
                href="/invite"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all"
              >
                <span>Member Invite</span>
              </Link>
            </div>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              MEET THE MARKSMEN. <br />
              <span className="amber-gradient-text">GEAR, DISCIPLINE & INTERVIEWS.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real competitors. Real equipment. No sponsored fluff. Explore the exact actions, barrels, triggers, and ammunition lots run by regional and national precision rimfire podium finishers.
            </p>
          </div>
        </div>
      </section>

      {/* Shooters Showcase Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Shooter Selectors + Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Featured Competitors ({filteredShooters.length})
              </span>
              <Link
                href="/shooters/intake"
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Add Profile</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, callsign, sponsor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Division Filters */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "ALL", label: "All" },
                { id: "Open", label: "Open Pro" },
                { id: "Production", label: "Production" },
                { id: "Ladies", label: "Ladies" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDivisionFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors ${
                    divisionFilter === tab.id
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Shooter List - Clean Vertical Cards on Mobile and Desktop */}
            <div className="flex flex-col gap-3">
              {filteredShooters.length === 0 ? (
                <div className="p-6 rounded-2xl ios-glass text-center text-xs sm:text-sm text-slate-400 border border-white/10">
                  No competitors matched your search.
                </div>
              ) : (
                filteredShooters.map((shooter) => {
                  const isSelected = selectedShooter?.id === shooter.id;
                  const rifleSummary = shooter.rifleSetup?.action || (typeof shooter.rifleSetup === "string" ? shooter.rifleSetup : null);

                  return (
                    <Link
                      key={shooter.id}
                      href={`/shooters/${shooter.id}`}
                      onClick={(e) => {
                        // On desktop (lg screens), clicking selects the competitor for live preview on the right
                        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                          e.preventDefault();
                          setSelectedShooter(shooter);
                        }
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl transition-all border block group ${
                        isSelected
                          ? "ios-glass-card border-amber-500/60 shadow-tactical-glow bg-amber-500/5"
                          : "ios-glass border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Competitor Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-md relative shrink-0 bg-black">
                            {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") ? (
                              <img
                                src={shooter.image}
                                alt={getShooterDisplayName(shooter)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-sm">
                                {shooter.callsign?.slice(0, 2) || "SS"}
                              </div>
                            )}
                          </div>

                          {/* Shooter Info */}
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold uppercase">
                                {shooter.callsign || "MARKS"}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase truncate">
                                {shooter.division}
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-black text-white truncate group-hover:text-amber-300 transition-colors">
                              {getShooterDisplayName(shooter)}
                            </h3>

                            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                              <span className="text-emerald-400 font-semibold">{shooter.ranking}</span>
                              {shooter.homeRange && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="truncate">{shooter.homeRange}</span>
                                </>
                              )}
                            </p>

                            {rifleSummary && (
                              <p className="text-[10px] font-mono text-slate-500 truncate hidden sm:block">
                                Rig: {rifleSummary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Podiums & View Full Profile Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-mono font-bold flex items-center gap-1 border border-white/5">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>{shooter.podiums}</span>
                            <span className="hidden sm:inline text-[9px] text-slate-400">Podiums</span>
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-amber-500/20 group-hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Nomination / Self-Submission Card */}
            <div className="p-5 rounded-2xl ios-glass border border-amber-500/20 bg-amber-500/5 space-y-3 mt-4 lg:mt-6">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated Athlete Profile</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you shooting in the 2026 Invitational or Appalachian circuit? Complete the 2-minute questionnaire to auto-generate your competitor card.
              </p>
              <Link
                href="/shooters/intake"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Launch Intake Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Deep Profile & Rifle Breakdown (Desktop Live Preview) */}
          <div className="hidden lg:block lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="ios-glass rounded-3xl p-5 sm:p-8 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] bg-black relative shrink-0">
                    {selectedShooter.image?.startsWith("data:") || selectedShooter.image?.startsWith("/") ? (
                      <img
                        src={selectedShooter.image}
                        alt={getShooterDisplayName(selectedShooter)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-xl">
                        {selectedShooter.callsign || "SS"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                        {selectedShooter.callsign}
                      </span>
                      <span className="text-xs font-mono text-slate-400 truncate">
                        {selectedShooter.homeRange}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white">
                      {getShooterDisplayName(selectedShooter)}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                      {selectedShooter.ranking}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-2.5">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">PODIUM FINISHES</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">
                      {selectedShooter.podiums}
                    </span>
                  </div>

                  <Link
                    href={`/shooters/${selectedShooter.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Full SEO Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Accolades & Badges if present */}
              {selectedShooter.accolades && selectedShooter.accolades.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedShooter.accolades.map((acc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{acc}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Sponsors Chips */}
              {selectedShooter.sponsors && selectedShooter.sponsors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    Official Factory & Industry Sponsors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedShooter.sponsors.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-white/5 border border-white/10 text-slate-300"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Tournament Spotlight Poster Graphic or Action Rig */}
              {selectedShooter.posterImage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Official Tournament Spotlight Poster</span>
                    </span>
                    <Link
                      href={`/shooters/${selectedShooter.id}`}
                      className="text-[11px] font-mono text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                    >
                      <span>Full SEO Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="w-full max-w-md mx-auto aspect-[682/1024] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black relative">
                    <img
                      src={selectedShooter.posterImage}
                      alt={`${selectedShooter.name} Spotlight Poster`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : selectedShooter.actionPhoto ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    <span>Rifle Rig in Action</span>
                  </span>
                  <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-white/10 relative bg-black">
                    <img
                      src={selectedShooter.actionPhoto}
                      alt={`${selectedShooter.name} Rifle Rig`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              ) : null}

              {/* Quote */}
              <div className="relative p-5 rounded-2xl bg-black/40 border border-white/5 italic text-slate-200 text-sm leading-relaxed">
                <Quote className="w-6 h-6 text-amber-500/40 absolute top-3 right-3 pointer-events-none" />
                &ldquo;{selectedShooter.quote}&rdquo;
              </div>



              {/* Long-form Q&A Interview */}
              {selectedShooter.interview && selectedShooter.interview.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>In The Crosshairs: Interview with {getShooterDisplayName(selectedShooter).split(" ")[0]}</span>
                  </h3>

                  <div className="space-y-4">
                    {selectedShooter.interview.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                        <div className="text-xs font-mono font-bold text-amber-400">
                          Q: {item.question}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Tactical Back to Chat Quick-Return Button (Desktop) */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <Link
          href="/chat"
          className="ios-glass px-4 py-2.5 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 hover:border-emerald-400 group"
          title="Return directly to Subsonic Society Live Chat"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>← Return to Live Chat</span>
        </Link>
      </div>
    </div>
  );
}

export default function ShootersPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ShootersContent />
    </Suspense>
  );
}
