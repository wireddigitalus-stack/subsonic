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
    id: "erich-leipold",
    name: "Erich Leipold",
    callsign: "LEIPOLD",
    division: "Open Rimfire Pro • Team USA",
    ranking: "Team USA 🇺🇸 • Rimfire Challenge World Champion",
    homeRange: "National Tour / Pennsylvania",
    podiums: 61,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/assets/erich-leipold-poster.jpg",
    actionPhoto: "/assets/erich-leipold-poster.jpg",
    posterImage: "/assets/erich-leipold-poster.jpg",
    quote: "Consistency isn't an accident. It's the byproduct of testing every variable, knowing your DOPE down to the tenth of a mil, and executing with absolute confidence.",
    signature: "Erich Leipold",
    accolades: [
      "TEAM USA 🇺🇸 — 2026 RIMFIRE WORLD CHAMPIONSHIP",
      "RIMFIRE CHALLENGE WORLD CHAMPION",
      "2ND PLACE 2024 NRL22 NATIONAL CHAMPIONSHIP",
      "35+ RIMFIRE MATCH WINS",
    ],
    careerStats: {
      matches: 103,
      states: 25,
      countries: 2,
      wins: 35,
      top3: 61,
      top5: 76,
      top10: 91,
      nationalPlacements: [
        "2nd Place — 2024 NRL22 National Championship",
        "Top-5 — 2025 PRS Rimfire Finale",
        "Team USA — 2026 World Championship Qualifier",
      ],
    },
    sponsors: [
      "MasterPiece Arms (MPA)",
      "Modacam Custom Rifles",
      "Vortex Optics",
      "Zermatt Arms",
      "Clenzoil",
      "Leofoto",
      "Hoz & Shield",
      "Arrow Products USA",
    ],
    interview: [
      {
        question: "What is your mental preparation before a national championship stage?",
        answer: "I visualize the stage three times before loading: target acquisition order, transition footwork, and wind calls. When the timer beeps, muscle memory and DOPE take over.",
      },
      {
        question: "How do you dial in harmonic tuning for your RimX setup?",
        answer: "I test on calm mornings at 50 yards with a chronograph. I rotate the tuner 2 hash marks at a time until the vertical dispersion flattens into a single hole. Single-digit SD is the law.",
      },
    ],
    createdAt: "2026-09-30T00:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "ron-verran",
    name: "Ron Verran",
    callsign: "VERRAN",
    division: "Open Rimfire Pro • Team USA",
    ranking: "2x PRS National Champion • Team USA 🇺🇸",
    homeRange: "Great Lakes Region / National Tour",
    podiums: 52,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/assets/ron-verran-poster.jpg",
    actionPhoto: "/assets/ron-verran-poster.jpg",
    posterImage: "/assets/ron-verran-poster.jpg",
    quote: "It's not luck. It's a process.",
    signature: "Ron Verran",
    accolades: [
      "2021 PRS NATIONAL CHAMPION 🏆",
      "2023 PRS NATIONAL CHAMPION 🏆",
      "2022 & 2025 PRS GREAT LAKES SERIES CHAMPION 🥇",
      "2025 IPRF WORLD CHAMPIONSHIPS — 3RD OVERALL 🥉",
      "TEAM USA 🇺🇸",
      "DEDICATED TO GROWING THE SPORT OF RIMFIRE PRECISION 🎯",
    ],
    careerStats: {
      matches: 85,
      states: 22,
      countries: 2,
      wins: 28,
      top3: 52,
      top5: 64,
      top10: 78,
      nationalPlacements: [
        "2021 PRS National Champion 🏆",
        "2023 PRS National Champion 🏆",
        "2022 & 2025 PRS Great Lakes Series Champion 🥇",
        "2025 IPRF World Championships — 3rd Overall 🥉",
      ],
    },
    sponsors: [
      "Modacam Custom Rifles",
      "MasterPiece Arms (MPA)",
      "Vortex Optics",
      "Zermatt Arms",
      "Lapua Rimfire",
      "Subsonic Society",
    ],
    interview: [
      {
        question: "What separates a PRS National Championship run from an ordinary match weekend?",
        answer: "It's never luck. It's a disciplined, repeatable process. From barricade footwork to stage timing and DOPE verification, you remove variables until hitting center-steel is simply muscle memory.",
      },
      {
        question: "What advice do you give shooters entering the Subsonic Invitational in Bristol?",
        answer: "Respect the Appalachian mountain switch-winds. Trust your initial wind call, commit cleanly to your trigger press, and don't dwell on dropped points. Every stage is a clean slate.",
      },
    ],
    createdAt: "2026-09-30T00:00:00Z",
    status: "PUBLISHED",
  },
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
          // Auto-sanitize any stale generic boilerplate from previous invite tests
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

          const rawAll = localStorage.getItem("subsonic_all_shooters");
          if (rawAll) {
            const parsed = JSON.parse(rawAll);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.name === "VIP Pro Competitor" || item.name === "Invitational Competitor VIP") {
                  item.name = item.callsign || "TEST";
                }
                localList.push(item);
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
              if (!localList.some((s) => s.id === pro.id)) {
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
              if (!localList.some((s) => s.id === curId || s.callsign?.toLowerCase() === curCallsign.toLowerCase())) {
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
            const finalShooters = Array.from(map.values());
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
                return;
              }
            }
            setSelectedShooter(finalShooters[0]);
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
      const combined = Array.from(fallbackMap.values());
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
    <div className="space-y-12 pb-24">
      {/* Header with Call-to-Action */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>SUBSONIC SOCIETY ATHLETES & RIG BLUEPRINTS</span>
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

            {/* Shooter List */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-3 pb-2 lg:pb-0">
              {filteredShooters.length === 0 ? (
                <div className="p-4 rounded-xl ios-glass text-center text-xs text-slate-400">
                  No competitors matched your search.
                </div>
              ) : (
                filteredShooters.map((shooter) => {
                  const isSelected = selectedShooter.id === shooter.id;
                  return (
                    <button
                      key={shooter.id}
                      onClick={() => setSelectedShooter(shooter)}
                      className={`w-[280px] sm:w-[320px] lg:w-full shrink-0 lg:shrink text-left p-4 sm:p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? "ios-glass-card border-amber-500/60 shadow-tactical-glow bg-amber-500/5"
                          : "ios-glass border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/60 shadow-sm relative shrink-0 bg-black">
                            {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") ? (
                              <img
                                src={shooter.image}
                                alt={getShooterDisplayName(shooter)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                                {shooter.callsign?.slice(0, 2) || "SS"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase truncate">
                              {shooter.division}
                            </div>
                            <h3 className="text-sm font-black text-white truncate">
                              {getShooterDisplayName(shooter)}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {shooter.ranking}
                            </p>
                          </div>
                        </div>

                        <div className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold shrink-0">
                          {shooter.podiums} Podiums
                        </div>
                      </div>
                    </button>
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

          {/* Right Column: Deep Profile & Rifle Breakdown */}
          <div className="lg:col-span-2 space-y-6">
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

              {/* Complete Equipment Blueprint — only shown when shooter has shared rig data */}
              {selectedShooter.rifleSetup && selectedShooter.rifleSetup.action && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4" />
                    <span>Competition Rifle Blueprint</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Verified Precision Specs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">ACTION</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.action}</span>
                  </div>

                  {selectedShooter.rifleSetup.barrel && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">BARREL</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.barrel}</span>
                  </div>
                  )}

                  {selectedShooter.rifleSetup.trigger && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">TRIGGER</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.trigger}</span>
                  </div>
                  )}

                  {selectedShooter.rifleSetup.chassis && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">CHASSIS / STOCK</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.chassis}</span>
                  </div>
                  )}

                  {selectedShooter.rifleSetup.optic && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">OPTIC</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.optic}</span>
                  </div>
                  )}

                  {selectedShooter.rifleSetup.mount && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">RINGS & MOUNT</span>
                    <span className="font-bold text-white">{selectedShooter.rifleSetup.mount}</span>
                  </div>
                  )}

                  {selectedShooter.rifleSetup.tuner && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block">HARMONIC TUNER</span>
                      <span className="font-bold text-white">{selectedShooter.rifleSetup.tuner}</span>
                    </div>
                  )}

                  {selectedShooter.rifleSetup.ammoLot && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">AMMUNITION LOT</span>
                    <span className="font-bold text-amber-400">{selectedShooter.rifleSetup.ammoLot}</span>
                  </div>
                  )}
                </div>
              </div>
              )}

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
