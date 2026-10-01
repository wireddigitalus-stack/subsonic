"use client";

import React from "react";
import { MessageSquare, Flame, Crosshair, Lock, Shield, Sparkles, User, Info, Bot } from "lucide-react";
import { DirectPartner } from "@/lib/types";

export interface ChatChannelSidebarProps {
  activeNetTab: "PRO" | "PUBLIC";
  visibleChannels: any[];
  currentChannel: string;
  setCurrentChannel: (id: string) => void;
  channelEngagementMap: Record<string, { postCount: number; reactionCount: number; dopeCount: number }>;
  setIsDopeModalOpen: (val: boolean) => void;
  directPartners?: DirectPartner[];
  unreadCounts?: Record<string, number>;
  onOpenDossier?: (partner: DirectPartner) => void;
}

export function ChatChannelSidebar({
  activeNetTab,
  visibleChannels,
  currentChannel,
  setCurrentChannel,
  channelEngagementMap,
  setIsDopeModalOpen,
  directPartners = [],
  unreadCounts = {},
  onOpenDossier,
}: ChatChannelSidebarProps) {
  return (
    <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0">
      <div className="ios-glass rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col h-full min-h-0">
        
        {/* Scrollable Channels & Direct Comms List */}
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
          
          {/* Section 1: Official Match Frequency */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Match Frequency
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {visibleChannels.reduce((acc, c) => acc + c.activeUsers, 0)} Shooters
              </span>
            </div>

            <div className="space-y-1.5">
              {visibleChannels.map((ch) => {
                const isActive = currentChannel === ch.id;
                const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
                const unread = unreadCounts[ch.id] || 0;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setCurrentChannel(ch.id)}
                    data-telemetry={`chat_channel_${ch.id}`}
                    className={`w-full p-3 rounded-2xl text-left transition-all border relative ${
                      isActive
                        ? "ios-glass bg-amber-500/15 border-amber-500/40 shadow-tactical-glow text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                        <span className={isActive ? "text-amber-400 font-black" : "text-slate-500"}>#</span>
                        <span>{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{engagement.postCount}</span>
                        </span>

                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"
                        }`}>
                          {ch.badge}
                        </span>

                        {unread > 0 && !isActive && (
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-400 line-clamp-1 flex-1">
                        {ch.desc}
                      </p>
                      {engagement.reactionCount > 0 && (
                        <span className="text-[9px] font-mono text-amber-300/80 flex items-center gap-0.5 shrink-0 font-bold">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          {engagement.reactionCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Point-to-Point Direct Comms */}
          {directPartners.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-1 mb-2.5 shrink-0 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Direct Comms (1-on-1)
                </span>
                <span className="text-[9px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Closed Net
                </span>
              </div>

              <div className="space-y-1.5">
                {directPartners.map((partner) => {
                  const isActive = currentChannel === partner.id;
                  const unread = unreadCounts[partner.id] || 0;
                  const isRO = partner.callsign === "RO" || partner.callsign === "RO BOT" || partner.id === "dm_ro";
                  const isOwnerAdmin = partner.role === "OWNER_ADMIN" || partner.callsign === "ALLEN";
                  const isMasterOwner = partner.role === "MASTER_OWNER" || partner.callsign === "ROB" || partner.callsign === "RADAR";

                  return (
                    <div
                      key={partner.id}
                      className={`group w-full rounded-xl transition-all border flex items-center justify-between p-2.5 ${
                        isActive
                          ? "bg-amber-500/20 border-amber-500/50 shadow-tactical-glow text-white"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                      }`}
                    >
                      {/* Left: Switch to DM channel */}
                      <button
                        type="button"
                        onClick={() => setCurrentChannel(partner.id)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                      >
                        {/* Avatar / Icon with Status Dot */}
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                            isRO
                              ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                              : isMasterOwner
                              ? "bg-amber-400 text-black border-amber-300"
                              : isOwnerAdmin
                              ? "bg-emerald-500 text-black border-emerald-300"
                              : "bg-black/60 text-amber-400 border-white/10"
                          }`}>
                            {isRO ? "🤖" : isMasterOwner ? "👑" : isOwnerAdmin ? "🎖️" : partner.callsign.slice(0, 2)}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                            partner.status === "on_range" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                        </div>

                        {/* Partner Name & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isActive ? "text-amber-300" : "text-white"}`}>
                              {partner.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400/90 font-bold shrink-0">
                              [{partner.callsign}]
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
                            {isRO ? (
                              <span className="text-cyan-300 font-bold flex items-center gap-1">
                                <Bot className="w-2.5 h-2.5 text-cyan-400" />
                                <span>AI Range Officer · 24/7 Intel</span>
                              </span>
                            ) : (
                              partner.division || partner.badgeText || "Competitor"
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Right: Unread Badge + Dossier Info Trigger */}
                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                        {unread > 0 && !isActive && (
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                            {unread}
                          </span>
                        )}

                        {onOpenDossier && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDossier(partner);
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                            title={`View ${partner.callsign} Dossier`}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* DOPE Drop Action Box */}
        <div className="pt-3 border-t border-white/10 space-y-2 shrink-0 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              Tactical DOPE Card
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Holston 340y Spec</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDopeModalOpen(true)}
            data-telemetry="chat_open_dope_modal"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Crosshair className="w-4 h-4" />
            <span>DROP VERIFIED DOPE CARD</span>
          </button>
        </div>

      </div>
    </div>
  );
}
