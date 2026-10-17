"use client";

import React from "react";
import { MessageSquare, Flame, Lock, Radar, LogOut, Camera, Plus, Trash2, Info } from "lucide-react";
import { DirectPartner } from "@/lib/types";
import { getUserInitials, getAvatarColor } from "@/lib/avatar-colors";

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
    division?: string;
    rifleSetup?: string;
    badgeText?: string;
  };
  onEditProfile?: () => void;
  onLogout?: () => void;
  onlineCallsigns?: string[];
  lastActiveMap?: Record<string, number>;
  isAdmin?: boolean;
  onOpenNewRoomModal?: () => void;
  onDeleteRoom?: (id: string) => void;
}

const ROOM_COLOR_THEMES: Record<
  string,
  {
    dot: string;
    hash: string;
    activeCard: string;
    inactiveCard: string;
    badgeActive: string;
    badgeInactive: string;
  }
> = {
  amber: {
    dot: "bg-amber-400",
    hash: "text-amber-400",
    activeCard: "bg-amber-500/15 border-amber-500/40 text-white shadow-[inset_3px_0_0_0_#f59e0b]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-amber-500/30 hover:bg-amber-500/[0.06] text-slate-200",
    badgeActive: "bg-amber-500 text-black",
    badgeInactive: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  emerald: {
    dot: "bg-emerald-400",
    hash: "text-emerald-400",
    activeCard: "bg-emerald-500/15 border-emerald-500/40 text-white shadow-[inset_3px_0_0_0_#10b981]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] text-slate-200",
    badgeActive: "bg-emerald-500 text-black",
    badgeInactive: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  cyan: {
    dot: "bg-cyan-400",
    hash: "text-cyan-400",
    activeCard: "bg-cyan-500/15 border-cyan-500/40 text-white shadow-[inset_3px_0_0_0_#06b6d4]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] text-slate-200",
    badgeActive: "bg-cyan-400 text-black",
    badgeInactive: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  },
  purple: {
    dot: "bg-purple-400",
    hash: "text-purple-400",
    activeCard: "bg-purple-500/15 border-purple-500/40 text-white shadow-[inset_3px_0_0_0_#a855f7]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-purple-500/30 hover:bg-purple-500/[0.06] text-slate-200",
    badgeActive: "bg-purple-500 text-white",
    badgeInactive: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  },
  rose: {
    dot: "bg-rose-400",
    hash: "text-rose-400",
    activeCard: "bg-rose-500/15 border-rose-500/40 text-white shadow-[inset_3px_0_0_0_#f43f5e]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-rose-500/30 hover:bg-rose-500/[0.06] text-slate-200",
    badgeActive: "bg-rose-500 text-white",
    badgeInactive: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  },
  blue: {
    dot: "bg-blue-400",
    hash: "text-blue-400",
    activeCard: "bg-blue-500/15 border-blue-500/40 text-white shadow-[inset_3px_0_0_0_#3b82f6]",
    inactiveCard: "bg-white/[0.02] border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.06] text-slate-200",
    badgeActive: "bg-blue-500 text-white",
    badgeInactive: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  },
};

function resolveRoomColorKey(ch: any, idx: number): string {
  if (ch?.color && ROOM_COLOR_THEMES[ch.color]) return ch.color;
  const id = (ch?.id || "").toLowerCase();
  if (id === "invitational") return "amber";
  if (id.includes("lunch") || id.includes("food") || id.includes("menu")) return "emerald";
  if (id.includes("stage") || id.includes("range") || id.includes("dope")) return "cyan";
  if (id.includes("lodg") || id.includes("hotel") || id.includes("dining")) return "purple";
  if (id.includes("admin") || id.includes("staff") || ch?.adminOnly) return "rose";
  const keys = ["emerald", "cyan", "purple", "blue", "rose", "amber"];
  return keys[idx % keys.length];
}

export function ChatChannelSidebar({
  visibleChannels,
  currentChannel,
  setCurrentChannel,
  channelEngagementMap,
  unreadCounts = {},
  shooterProfile,
  onEditProfile,
  onLogout,
  isAdmin = false,
  onOpenNewRoomModal,
  onDeleteRoom,
}: ChatChannelSidebarProps) {
  const selfCallsign = (shooterProfile?.callsign || "").toUpperCase();
  const selfIsMaster = shooterProfile?.role === "MASTER_OWNER" || selfCallsign === "RADAR" || selfCallsign === "ROB";

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
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Log Out of Chat"
                  className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">LOGOUT</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Chat Rooms List (Color-Coded) */}
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Chat Rooms ({visibleChannels.length})
              </span>
              {isAdmin && onOpenNewRoomModal && (
                <button
                  type="button"
                  onClick={onOpenNewRoomModal}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Add a new chat room (Admin Only)"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Room</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {visibleChannels.map((ch, idx) => {
                const isActive = currentChannel === ch.id;
                const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
                const unread = unreadCounts[ch.id] || 0;
                const isCustomRoom = ch.id !== "invitational";
                const colorKey = resolveRoomColorKey(ch, idx);
                const theme = ROOM_COLOR_THEMES[colorKey] || ROOM_COLOR_THEMES.amber;

                return (
                  <div
                    key={ch.id}
                    onClick={() => setCurrentChannel(ch.id)}
                    data-telemetry={`chat_channel_${ch.id}`}
                    className={`group w-full p-3 rounded-xl text-left transition-all border relative cursor-pointer ${
                      isActive ? theme.activeCard : theme.inactiveCard
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                        <span className={theme.hash}>#</span>
                        <span className="truncate">{ch.name}</span>
                        {ch.adminOnly && (
                          <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono px-2 py-0.5 rounded font-medium flex items-center gap-1 bg-white/5 text-slate-300">
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          <span>{engagement.postCount}</span>
                        </span>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isActive ? theme.badgeActive : theme.badgeInactive
                        }`}>
                          {ch.badge}
                        </span>

                        {unread > 0 && !isActive && (
                          <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}

                        {isAdmin && isCustomRoom && onDeleteRoom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRoom(ch.id);
                            }}
                            title={`Delete #${ch.name}`}
                            className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


