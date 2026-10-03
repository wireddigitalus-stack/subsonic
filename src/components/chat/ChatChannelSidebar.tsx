"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Flame, Crosshair, Lock, Shield, Sparkles, User, Info, Bot, Radar, Users, ChevronRight } from "lucide-react";
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
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
                    className={`w-full p-3 rounded-xl text-left transition-all border relative ${
                      isActive
                        ? "bg-white/[0.08] border-amber-500/30 text-white"
                        : "bg-transparent border-transparent hover:bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                        <span className={isActive ? "text-amber-400" : "text-slate-500"}>#</span>
                        <span>{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-medium flex items-center gap-1 bg-white/5 text-slate-400">
                          <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{engagement.postCount}</span>
                        </span>

                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"
                        }`}>
                          {ch.badge}
                        </span>

                        {unread > 0 && !isActive && (
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                  Direct Chat (1-on-1)
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
                  const isOwnerAdmin = partner.role === "OWNER_ADMIN" || partner.callsign === "SAID DONE" || partner.callsign === "ALLEN";
                  const isMasterOwner = partner.role === "MASTER_OWNER" || partner.callsign === "ROB" || partner.callsign === "RADAR";

                  return (
                    <div
                      key={partner.id}
                      className={`group w-full rounded-xl transition-all border flex items-center justify-between p-2.5 ${
                        isActive
                          ? "bg-white/[0.08] border-amber-500/30 text-white"
                          : "bg-transparent border-transparent hover:bg-white/[0.04] text-slate-300"
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-2 overflow-hidden ${
                            isRO
                              ? "bg-cyan-950 text-cyan-300 ring-cyan-400/60 font-black shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                              : isMasterOwner
                              ? "bg-blue-800 text-cyan-200 ring-cyan-400"
                              : isOwnerAdmin
                              ? "bg-emerald-500 text-black ring-emerald-300"
                              : "bg-white/10 text-slate-300 ring-white/10"
                          }`}>
                            {partner.image ? (
                              <img src={partner.image} alt="" className="w-full h-full object-cover" />
                            ) : isRO ? (
                              "🤖"
                            ) : isMasterOwner ? (
                              <Radar className="w-4 h-4 text-cyan-300 stroke-[2.2] drop-shadow-[0_0_6px_rgba(6,182,212,0.85)] animate-pulse" />
                            ) : isOwnerAdmin ? (
                              <span className="font-mono font-black text-xs text-black">A</span>
                            ) : (
                              partner.callsign.slice(0, 2)
                            )}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                            partner.status === "on_range" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                        </div>

                        {/* Partner Name & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${
                              isActive ? (isRO ? "text-cyan-300" : isMasterOwner ? "text-blue-300" : "text-amber-300") : "text-white"
                            }`}>
                              {partner.name}
                            </span>
                            <span className={`text-[10px] font-mono font-bold shrink-0 ${
                              isRO ? "text-cyan-400" : isMasterOwner ? "text-blue-400" : "text-slate-400"
                            }`}>
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
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                            title={`View ${partner.callsign} Profile`}
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

        {/* Link to Full Shooter Profiles Directory */}
        <div className="pt-2">
          <Link
            href="/shooters"
            className="w-full py-2.5 px-3 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 font-mono text-xs font-semibold flex items-center justify-between transition-all group shadow-[0_0_12px_rgba(168,85,247,0.12)]"
            title="Explore all Competitor Profiles, Blueprints & Accolades"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Shooter Profiles</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 group-hover:bg-purple-500/30 flex items-center gap-0.5">
              <span>EXPLORE</span>
              <ChevronRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}
