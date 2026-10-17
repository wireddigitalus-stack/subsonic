"use client";

import React from "react";
import { MessageSquare, Flame, Crosshair, Lock, Shield, Sparkles, User, Info, Bot, Radar, LogOut, Camera } from "lucide-react";
import { DirectPartner } from "@/lib/types";
import { getUserInitials, getAvatarColor, formatLastActive } from "@/lib/avatar-colors";

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
  shooterProfile?: {
    name?: string;
    callsign: string;
    image?: string;
    avatarColor?: string;
    role?: string;
    badgeText?: string;
  };
  onEditProfile?: () => void;
  onLogout?: () => void;
  onlineCallsigns?: string[];
  lastActiveMap?: Record<string, number>;
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
  shooterProfile,
  onEditProfile,
  onLogout,
  onlineCallsigns = [],
  lastActiveMap = {},
}: ChatChannelSidebarProps) {
  const selfCallsign = (shooterProfile?.callsign || "").toUpperCase();
  const selfIsMaster = shooterProfile?.role === "MASTER_OWNER" || selfCallsign === "RADAR" || selfCallsign === "ROB";
  const selfIsOwner = shooterProfile?.role === "OWNER_ADMIN" || selfCallsign === "SUBX" || selfCallsign === "ALLEN";
  // You're pinned at the top — don't list yourself or RO BOT under Direct Chat
  directPartners = directPartners.filter(
    (p) =>
      p.callsign.toUpperCase() !== selfCallsign &&
      p.id !== "dm_ro" &&
      p.callsign.toUpperCase() !== "RO BOT" &&
      p.callsign.toUpperCase() !== "RO"
  );
  return (
    <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0">
      <div className="ios-glass rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col h-full min-h-0">

        {/* Current User — always pinned at the top of your own panel */}
        {shooterProfile && (
          <div className="pb-3 mb-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-2 ring-white/20 text-white overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                  }}
                >
                  {shooterProfile.image ? (
                    <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                  ) : selfIsMaster ? (
                    <Radar className="w-4 h-4 text-cyan-300" />
                  ) : (
                    <span className="text-white font-bold tracking-wider text-xs">
                      {getUserInitials(shooterProfile.name, shooterProfile.callsign)}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate font-mono leading-tight">
                    {shooterProfile.callsign}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 shrink-0">
                    YOU
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium truncate leading-tight">
                  {shooterProfile.name || "Society Member"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  title="Edit Profile & Photos"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Log Out of Chat"
                  className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">LOGOUT</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Channels & Direct Comms List */}
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
          
          {/* Section 1: Official Match Frequency */}
          <div>
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
                        <span className="text-xs font-mono px-2 py-0.5 rounded font-medium flex items-center gap-1 bg-white/5 text-slate-300">
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          <span>{engagement.postCount}</span>
                        </span>

                        <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                          isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-200"
                        }`}>
                          {ch.badge}
                        </span>

                        {unread > 0 && !isActive && (
                          <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-300 line-clamp-1 flex-1 font-normal">
                        {ch.desc}
                      </p>
                      {engagement.reactionCount > 0 && (
                        <span className="text-xs font-mono text-amber-300 flex items-center gap-0.5 shrink-0 font-bold">
                          <Flame className="w-3 h-3 text-amber-400" />
                          {engagement.reactionCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
