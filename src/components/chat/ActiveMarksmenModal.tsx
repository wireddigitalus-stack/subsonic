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
  onStartDirectComms: (partner: DirectPartner) => void;
  onPlayChirp?: (freq?: number) => void;
}

export function ActiveMarksmenModal({
  isOpen,
  onClose,
  onlineCallsigns = [],
  lastActiveMap = {},
  directPartners = [],
  onStartDirectComms,
  onPlayChirp,
}: ActiveMarksmenModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const onlineSet = new Set(onlineCallsigns.map((c) => c.toUpperCase()));

  // Separate partners into RO, Online humans, and Recently Active
  const roPartner = directPartners.find((p) => p.callsign === "RO BOT" || p.id === "dm_ro");

  const humanPartners = directPartners.filter(
    (p) => p.callsign !== "RO BOT" && p.id !== "dm_ro"
  );

  const filteredPartners = humanPartners.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.callsign.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.division && p.division.toLowerCase().includes(q))
    );
  });

  const currentlyOnline = filteredPartners.filter((p) =>
    onlineSet.has(p.callsign.toUpperCase())
  );

  const recentlyActive = filteredPartners.filter((p) => {
    if (onlineSet.has(p.callsign.toUpperCase())) return false;
    const lastSeen = (lastActiveMap && lastActiveMap[p.callsign.toUpperCase()]) || 0;
    // Seen in the last 24 hours
    return lastSeen > 0 && Date.now() - lastSeen < 24 * 60 * 60 * 1000;
  });

  const offline = filteredPartners.filter(
    (p) =>
      !onlineSet.has(p.callsign.toUpperCase()) &&
      !recentlyActive.some((ra) => ra.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="ios-glass rounded-2xl md:rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90dvh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-mono font-bold text-sm sm:text-base text-white tracking-wide uppercase">
              Active Frequency Roster
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              {Math.max(1, onlineCallsigns.length)} Online
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
            placeholder="Search active marksmen or callsigns..."
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
                Live on Frequency ({currentlyOnline.length})
              </span>
            </div>

            {currentlyOnline.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400 font-mono">
                No external marksmen currently active.
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
                const pColor = getAvatarColor(partner.avatarColor, partner.callsign);

                return (
                  <div
                    key={partner.id}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex items-center justify-between gap-3 group"
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

                    <button
                      type="button"
                      onClick={() => {
                        if (onPlayChirp) onPlayChirp(1200);
                        onStartDirectComms(partner);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 text-xs font-medium shrink-0 transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      <span>Message</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Recently Active Marksmen */}
          {recentlyActive.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                Active Today ({recentlyActive.length})
              </span>

              {recentlyActive.map((partner) => {
                const sLastSeen = (lastActiveMap && lastActiveMap[partner.callsign.toUpperCase()]) || 0;
                const lastActiveText = formatLastActive(sLastSeen, false);
                const pColor = getAvatarColor(partner.avatarColor, partner.callsign);

                return (
                  <div
                    key={partner.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex items-center justify-between gap-3"
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

                    <button
                      type="button"
                      onClick={() => {
                        if (onPlayChirp) onPlayChirp(1200);
                        onStartDirectComms(partner);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors shrink-0"
                    >
                      DM
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Other Registered Shooters (Offline) */}
          {offline.length > 0 && !search.trim() && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-500 uppercase px-1">
                Other Registered Competitors ({offline.length})
              </span>
              <p className="text-[11px] text-slate-500 px-1 font-mono">
                Competitors will appear live on frequency when they open the chat network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
