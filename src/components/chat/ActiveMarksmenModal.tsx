"use client";

import React, { useState } from "react";
import {
  X,
  Radar,
  Bot,
  MessageSquare,
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
  Target
} from "lucide-react";
import { DirectPartner } from "@/lib/types";
import { getUserInitials, getAvatarColor, formatLastActive } from "@/lib/avatar-colors";

export interface ActiveMarksmenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineCallsigns?: string[];
  lastActiveMap?: Record<string, number>;
  directPartners?: DirectPartner[];
  shooterProfile?: {
    name?: string;
    callsign: string;
    image?: string;
    avatarColor?: string;
    role?: string;
    division?: string;
    rifleSetup?: string;
    badgeText?: string;
  };
  onStartDirectComms: (partner: DirectPartner) => void;
  onOpenDossier?: (partner: DirectPartner) => void;
  onPlayChirp?: (freq?: number) => void;
}

export function ActiveMarksmenModal({
  isOpen,
  onClose,
  onlineCallsigns = [],
  lastActiveMap = {},
  directPartners = [],
  shooterProfile,
  onStartDirectComms,
  onOpenDossier,
  onPlayChirp,
}: ActiveMarksmenModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const onlineSet = new Set(onlineCallsigns.map((c) => c.toUpperCase()));
  if (shooterProfile?.callsign) {
    onlineSet.add(shooterProfile.callsign.toUpperCase());
  }

  const normalizeCallsign = (cs: string) => {
    const u = (cs || "").trim().toUpperCase();
    if (["ALLEN", "SUBX", "AHURLEY", "HURLEY", "SAID DONE"].includes(u)) return "SUBX";
    if (["ROB", "RADAR", "LTDAN"].includes(u)) return "RADAR";
    return u;
  };

  const allLivePartners: DirectPartner[] = [];
  const seenCallsigns = new Set<string>();

  // 1. Always include current logged-in user first
  if (shooterProfile?.callsign) {
    const selfNorm = normalizeCallsign(shooterProfile.callsign);
    seenCallsigns.add(selfNorm);
    allLivePartners.push({
      id: `self_${shooterProfile.callsign}`,
      name: shooterProfile.name || shooterProfile.callsign,
      callsign: shooterProfile.callsign,
      role: shooterProfile.role || "MEMBER",
      division: shooterProfile.division,
      rifleSetup: shooterProfile.rifleSetup,
      badgeText: shooterProfile.badgeText,
      avatarColor: shooterProfile.avatarColor,
      image: shooterProfile.image,
      status: "online",
    });
  }

  // 2. Include online partners from directPartners
  for (const p of directPartners) {
    if (p.callsign === "RO BOT" || p.id === "dm_ro") continue;
    const pNorm = normalizeCallsign(p.callsign);
    if (seenCallsigns.has(pNorm)) continue;
    const isPartnerOnline =
      onlineSet.has(p.callsign.toUpperCase()) ||
      onlineSet.has(pNorm) ||
      (pNorm === "SUBX" && (onlineSet.has("ALLEN") || onlineSet.has("SUBX"))) ||
      (pNorm === "RADAR" && (onlineSet.has("ROB") || onlineSet.has("RADAR")));
    if (isPartnerOnline) {
      seenCallsigns.add(pNorm);
      allLivePartners.push(p);
    }
  }

  // 3. Include any onlineCallsigns not already in directPartners
  for (const cs of onlineCallsigns) {
    const csUpper = (cs || "").trim().toUpperCase();
    if (!csUpper || csUpper === "RO BOT") continue;
    const csNorm = normalizeCallsign(csUpper);
    if (seenCallsigns.has(csNorm)) continue;
    seenCallsigns.add(csNorm);
    const matchInPartners = directPartners.find(
      (dp) => normalizeCallsign(dp.callsign) === csNorm
    );
    if (matchInPartners) {
      allLivePartners.push(matchInPartners);
    } else {
      allLivePartners.push({
        id: `online_${csUpper}`,
        name: csNorm === "SUBX" ? "Allen Hurley" : csNorm === "RADAR" ? "Rob Neilson" : csUpper,
        callsign: csUpper,
        role: csNorm === "RADAR" ? "MASTER_OWNER" : csNorm === "SUBX" ? "OWNER_ADMIN" : "MEMBER",
        division: csNorm === "RADAR" ? "Master Admin" : csNorm === "SUBX" ? "Owner Admin" : "Society Member",
        rifleSetup: "",
        badgeText: csNorm === "RADAR" ? "MASTER ADMIN" : csNorm === "SUBX" ? "OWNER ADMIN" : "IN CHAT",
        image: csNorm === "SUBX" ? "/shooters/allen-hurley.jpg" : undefined,
        status: "online",
      });
    }
  }

  const filterFn = (p: DirectPartner) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.callsign.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      Boolean(p.division && p.division.toLowerCase().includes(q))
    );
  };

  const currentlyOnline = allLivePartners.filter(filterFn);

  const recentlyActive = directPartners
    .filter((p) => {
      if (p.callsign === "RO BOT" || p.id === "dm_ro") return false;
      const pNorm = normalizeCallsign(p.callsign);
      if (seenCallsigns.has(pNorm)) return false;
      const lastSeen =
        (lastActiveMap &&
          (lastActiveMap[p.callsign.toUpperCase()] || lastActiveMap[pNorm])) ||
        0;
      return lastSeen > 0 && Date.now() - lastSeen < 24 * 60 * 60 * 1000;
    })
    .filter(filterFn);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="ios-glass rounded-2xl md:rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90dvh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-mono font-bold text-sm sm:text-base text-white tracking-wide uppercase">
              Active Users
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              {Math.max(1, allLivePartners.length)} Online
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active users..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* Scrollable Roster Body */}
        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
          {/* Currently Online Marksmen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Users Online ({currentlyOnline.length})
              </span>
            </div>

            {currentlyOnline.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400 font-mono">
                No matching users in chat right now.
              </div>
            ) : (
              currentlyOnline.map((partner) => {
                const isMasterOwner =
                  partner.role === "MASTER_OWNER" ||
                  partner.callsign === "ROB" ||
                  partner.callsign === "RADAR";
                const isOwnerAdmin =
                  partner.role === "OWNER_ADMIN" ||
                  partner.callsign === "ALLEN" ||
                  partner.callsign === "SUBX" ||
                  partner.callsign === "SAID DONE";
                const isSelf =
                  shooterProfile?.callsign &&
                  normalizeCallsign(partner.callsign) ===
                    normalizeCallsign(shooterProfile.callsign);
                const pColor = getAvatarColor(partner.avatarColor, partner.callsign);

                return (
                  <div
                    key={partner.id}
                    onClick={() => {
                      if (onOpenDossier) {
                        onOpenDossier(partner);
                        onClose();
                      }
                    }}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-2 ring-white/20 text-white overflow-hidden"
                          style={
                            !partner.image
                              ? { backgroundColor: pColor.hex }
                              : undefined
                          }
                        >
                          {partner.image ? (
                            <img src={partner.image} alt="" className="w-full h-full object-cover" />
                          ) : isMasterOwner ? (
                            <Radar className="w-4 h-4 text-cyan-300 animate-pulse" />
                          ) : (
                            <span>{getUserInitials(partner.name, partner.callsign)}</span>
                          )}
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black absolute -bottom-0.5 -right-0.5 animate-pulse" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {partner.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            [{partner.callsign}]
                          </span>
                          {isSelf && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300">
                              YOU
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              isMasterOwner
                                ? "bg-blue-500/20 text-blue-300"
                                : isOwnerAdmin
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {isMasterOwner ? "MASTER ADMIN" : isOwnerAdmin ? "OWNER ADMIN" : (partner.badgeText || "PRO SHOOTER")}
                          </span>
                        </div>
                        {partner.rifleSetup && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                            {partner.rifleSetup}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recently Active Marksmen (Seen Today in Chat) */}
          {recentlyActive.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                Active in Chat Today ({recentlyActive.length})
              </span>

              {recentlyActive.map((partner) => {
                const pNorm = normalizeCallsign(partner.callsign);
                const sLastSeen =
                  (lastActiveMap &&
                    (lastActiveMap[partner.callsign.toUpperCase()] ||
                      lastActiveMap[pNorm])) ||
                  0;
                const lastActiveText = formatLastActive(sLastSeen, false);
                const pColor = getAvatarColor(partner.avatarColor, partner.callsign);

                return (
                  <div
                    key={partner.id}
                    onClick={() => {
                      if (onOpenDossier) {
                        onOpenDossier(partner);
                        onClose();
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-1 ring-white/10 text-white overflow-hidden shrink-0"
                        style={!partner.image ? { backgroundColor: pColor.hex } : undefined}
                      >
                        {partner.image ? (
                          <img src={partner.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{getUserInitials(partner.name, partner.callsign)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-300 truncate">
                            {partner.name}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            [{partner.callsign}]
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {lastActiveText}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
