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
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

// Seed fallback data to guarantee immediate rendering even if network lags
const FALLBACK_SHOOTERS: ShooterProfile[] = [
  {
    id: "subx",
    name: "Allen Hurley",
    callsign: "SUBX",
    division: "Owner Admin / Executive",
    ranking: "Founder • Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 21,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation.",
    signature: "Allen Hurley",
    accolades: ["FOUNDER 👑", "TEAM USA 🇺🇸", "NATIONAL CHAMPION 🏆", "MATCH HOST", "EVENT DIRECTOR"],
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
        question: "What was the vision behind the Subsonic Society Invitational at The Hideout?",
        answer: "We have worked hard to make the Invitational different — challenging stages, a meaningful cash purse, dedicated staff and spotters, hospitality, and an atmosphere where the competitors are the focus.",
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
    status: "PUBLISHED",
  }
];

const isExcludedShooter = (s: { name?: string; full_name?: string; callsign?: string; id?: string; member_id?: string }): boolean => {
  const name = (s.name || s.full_name || "").trim().toUpperCase();
  const call = (s.callsign || "").trim().toUpperCase();
  const id = (s.id || s.member_id || "").trim().toLowerCase();
  if (
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
    id === "johndoe" ||
    name === "TEST" ||
    name === "TEST 2" ||
    name === "TEST2" ||
    name === "TEST-2" ||
    name === "VIP PRO COMPETITOR" ||
    name === "INVITATIONAL COMPETITOR VIP" ||
    call === "TEST" ||
    call === "TEST 2" ||
    call === "TEST2" ||
    call === "TEST-2" ||
    id === "test" ||
    id === "test-2" ||
    id === "test2" ||
    id === "shooter_test" ||
    id === "shooter_test2" ||
    id === "shooter_test-2" ||
    id === "ss-pro-test" ||
    id === "ss-pro-test2" ||
    id === "ss-pro-test-2"
  ) {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      const rawDeleted = localStorage.getItem("subsonic_deleted_members");
      if (rawDeleted) {
        const deletedList: string[] = JSON.parse(rawDeleted);
        if (
          (id && deletedList.includes(id)) ||
          (call && deletedList.includes(call.toLowerCase())) ||
          (name && deletedList.includes(name.toLowerCase()))
        ) {
          return true;
        }
      }
    } catch {}
  }
  return false;
};

const isRealShooterPhoto = (img?: string | null): boolean => {
  if (!img) return false;
  if (
    img.includes("SS-RWB-LOGO") ||
    img.includes("subsonic-logo") ||
    img.includes("subsonic-coin") ||
    img.includes("subsoniccoin") ||
    img.includes("logo")
  ) {
    return false;
  }
  return img.startsWith("data:") || img.startsWith("http") || img.startsWith("/");
};

function ShootersContent() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [shooters, setShooters] = useState<ShooterProfile[]>(FALLBACK_SHOOTERS);
  const [selectedShooter, setSelectedShooter] = useState<ShooterProfile>(FALLBACK_SHOOTERS[0]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  useEffect(() => {
    const fetchShooters = async () => {
      if (typeof window !== "undefined") {
        try {
          // Purge any stale test / deleted profiles from browser localStorage
          localStorage.removeItem("subsonic_all_shooters");
          for (const key of ["subsonic_pro_full_profile", "subsonic_shooter_profile", "subsonic_member_profile"]) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (isExcludedShooter(parsed)) {
                localStorage.removeItem(key);
              }
            }
          }
        } catch (e) {
          console.warn("Error sanitizing local shooters:", e);
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
              if (!isExcludedShooter(s)) {
                map.set(s.id.toLowerCase(), s);
              }
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

      // Fallback if API network fails
      const combined = FALLBACK_SHOOTERS.filter((s) => !isExcludedShooter(s));
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

  // Handle search filtering
  const filteredShooters = shooters.filter((shooter) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const displayName = getShooterDisplayName(shooter).toLowerCase();
    return (
      displayName.includes(query) ||
      shooter.name.toLowerCase().includes(query) ||
      shooter.callsign.toLowerCase().includes(query) ||
      shooter.ranking.toLowerCase().includes(query) ||
      shooter.homeRange.toLowerCase().includes(query) ||
      (shooter.sponsors && shooter.sponsors.some((s) => s.toLowerCase().includes(query)))
    );
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

      {/* Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>SUBSONIC SOCIETY ATHLETE PROFILES</span>
            </div>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              MEET THE MARKSMEN. <br />
              <span className="amber-gradient-text">GEAR, DISCIPLINE & INTERVIEWS.</span>
            </h1>
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
                            {isRealShooterPhoto(shooter.image) ? (
                              <img
                                src={shooter.image!}
                                alt={getShooterDisplayName(shooter)}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/25 via-black to-zinc-900 text-amber-300 font-mono font-black text-xs uppercase tracking-wider">
                                <span>{shooter.callsign ? shooter.callsign.slice(0, 3) : shooter.name ? shooter.name.split(" ").map((w) => w[0]).join("").slice(0, 2) : "SS"}</span>
                              </div>
                            )}
                          </div>

                          {/* Shooter Info */}
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold uppercase">
                                {shooter.callsign || "MARKS"}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                SHOOTER
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
                        className="w-full h-full object-cover object-top"
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

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Edit Profile &amp; Photos</span>
                    </button>

                    <Link
                      href={`/shooters/${selectedShooter.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Full SEO Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
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
                      className="w-full h-full object-contain object-top"
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

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        initialShooter={selectedShooter}
        onSaved={(updated) => {
          setSelectedShooter(updated);
          setShooters((prev) =>
            prev.map((s) =>
              s.id === updated.id || s.callsign?.toUpperCase() === updated.callsign?.toUpperCase()
                ? updated
                : s
            )
          );
        }}
      />
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
