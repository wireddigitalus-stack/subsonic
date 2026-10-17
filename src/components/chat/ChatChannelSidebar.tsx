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

export function ChatChannelSidebar({
  visibleChannels,
  currentChannel,
  setCurrentChannel,
  channelEngagementMap,
  directPartners = [],
  unreadCounts = {},
  onOpenDossier,
  shooterProfile,
  onEditProfile,
  onLogout,
  onlineCallsigns = [],
  lastActiveMap = {},
  isAdmin = false,
  onOpenNewRoomModal,
  onDeleteRoom,
}: ChatChannelSidebarProps) {
  const selfCallsign = (shooterProfile?.callsign || "").toUpperCase();
  const selfIsMaster = shooterProfile?.role === "MASTER_OWNER" || selfCallsign === "RADAR" || selfCallsign === "ROB";

  // Build unified list of everyone currently IN CHAT NOW (online within 90s + current user)
  const inChatNowList = React.useMemo(() => {
    const now = Date.now();
    const activeWindowMs = 90_000;
    const onlineSet = new Set(onlineCallsigns.map((c) => c.toUpperCase()));

    // Normalize executive aliases so ALLEN <-> SUBX and ROB <-> RADAR never duplicate
    const normalizeKey = (cs: string) => {
      const upper = (cs || "").trim().toUpperCase();
      if (["ALLEN", "AHURLEY", "HURLEY", "SAID DONE", "SAIDDONE", "SUBX"].includes(upper)) return "SUBX";
      if (["ROB", "LTDAN", "RADAR"].includes(upper)) return "RADAR";
      return upper;
    };

    const isKeyOnline = (cs: string) => {
      const key = normalizeKey(cs);
      const raw = (cs || "").toUpperCase();
      if (key === normalizeKey(selfCallsign)) return true;
      if (onlineSet.has(key) || onlineSet.has(raw)) return true;
      if (key === "SUBX" && (onlineSet.has("ALLEN") || onlineSet.has("SUBX"))) return true;
      if (key === "RADAR" && (onlineSet.has("ROB") || onlineSet.has("RADAR"))) return true;
      const lastSeen =
        (lastActiveMap && (lastActiveMap[key] || lastActiveMap[raw])) ||
        (key === "SUBX" ? lastActiveMap?.["ALLEN"] || 0 : 0) ||
        (key === "RADAR" ? lastActiveMap?.["ROB"] || 0 : 0);
      return lastSeen > 0 && now - lastSeen < activeWindowMs;
    };

    const resultMap = new Map<string, DirectPartner & { isSelf?: boolean }>();

    // 1. Always include current logged-in user first
    if (shooterProfile && selfCallsign && selfCallsign !== "GUEST") {
      const myKey = normalizeKey(selfCallsign);
      const matchedSelf = directPartners.find((p) => normalizeKey(p.callsign) === myKey);
      resultMap.set(myKey, {
        id: `self_${myKey}`,
        callsign: shooterProfile.callsign,
        name: shooterProfile.name || matchedSelf?.name || shooterProfile.callsign,
        role: (shooterProfile.role as any) || matchedSelf?.role || "MEMBER",
        badgeText: shooterProfile.badgeText || matchedSelf?.badgeText || "ONLINE",
        division: shooterProfile.division || matchedSelf?.division || "Competitor",
        rifleSetup: shooterProfile.rifleSetup || matchedSelf?.rifleSetup,
        image: shooterProfile.image || matchedSelf?.image,
        avatarColor: shooterProfile.avatarColor || matchedSelf?.avatarColor,
        status: "online",
        isSelf: true,
      });
    }

    // 2. Include any partner from directPartners who is currently online
    for (const p of directPartners) {
      if (p.id === "dm_ro" || p.callsign.toUpperCase() === "RO" || p.callsign.toUpperCase() === "RO BOT") continue;
      const key = normalizeKey(p.callsign);
      if (!key || resultMap.has(key)) continue;
      if (isKeyOnline(p.callsign)) {
        resultMap.set(key, {
          ...p,
          status: "online",
        });
      }
    }

    // 3. Include any onlineCallsign not yet in resultMap (e.g. a member who isn't in shooters table)
    for (const rawCs of onlineCallsigns) {
      const key = normalizeKey(rawCs);
      if (!key || key === "RO" || key === "RO BOT" || key === "GUEST" || resultMap.has(key)) continue;
      const matched = directPartners.find((p) => normalizeKey(p.callsign) === key);
      if (matched) {
        resultMap.set(key, { ...matched, status: "online" });
      } else {
        const isAllen = key === "SUBX";
        const isRadar = key === "RADAR";
        resultMap.set(key, {
          id: `online_${key}`,
          callsign: key,
          name: isAllen ? "Allen Hurley" : isRadar ? "Rob Neilson" : key,
          role: isRadar ? "MASTER_OWNER" : isAllen ? "OWNER_ADMIN" : "PRO_COMPETITOR",
          badgeText: isRadar ? "MASTER ADMIN" : isAllen ? "OWNER ADMIN" : "IN CHAT",
          division: isRadar ? "Master Admin" : isAllen ? "Owner Admin / Executive" : "Society Member",
          status: "online",
        });
      }
    }

    return Array.from(resultMap.values());
  }, [shooterProfile, selfCallsign, directPartners, onlineCallsigns, lastActiveMap]);

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

        {/* Scrollable Channels & In-Chat-Now List */}
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Chat Rooms
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

            <div className="space-y-1.5">
              {visibleChannels.map((ch) => {
                const isActive = currentChannel === ch.id;
                const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
                const unread = unreadCounts[ch.id] || 0;
                const isCustomRoom = ch.id !== "invitational";

                return (
                  <div
                    key={ch.id}
                    onClick={() => setCurrentChannel(ch.id)}
                    data-telemetry={`chat_channel_${ch.id}`}
                    className={`group w-full p-3 rounded-xl text-left transition-all border relative cursor-pointer ${
                      isActive
                        ? "bg-white/[0.08] border-amber-500/30 text-white"
                        : "bg-transparent border-transparent hover:bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm min-w-0">
                        <span className={isActive ? "text-amber-400" : "text-slate-500"}>#</span>
                        <span className="truncate">{ch.name}</span>
                        {ch.adminOnly && (
                          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono px-2 py-0.5 rounded font-medium flex items-center gap-1 bg-white/5 text-slate-300">
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          <span>{engagement.postCount}</span>
                        </span>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          ch.adminOnly
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isActive
                            ? "bg-amber-500 text-black"
                            : "bg-white/10 text-slate-200"
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
                            className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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

          {/* Section 2: In Chat Now (Live Online Users Only — No 94-Shooter Static Roster) */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                In Chat Now
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {inChatNowList.length} Online
              </span>
            </div>

            <div className="space-y-1.5">
              {inChatNowList.map((partner) => {
                const pCallsign = (partner.callsign || "").toUpperCase();
                const isMasterOwner = partner.role === "MASTER_OWNER" || pCallsign === "ROB" || pCallsign === "RADAR";
                const pColor = getAvatarColor(partner.avatarColor, pCallsign || partner.name);
                const pInitials = getUserInitials(partner.name, partner.callsign);

                return (
                  <div
                    key={partner.id}
                    onClick={() => onOpenDossier && onOpenDossier(partner)}
                    className="group w-full rounded-xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 flex items-center justify-between p-2.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-2 ring-emerald-400/40 text-white overflow-hidden shadow-sm shrink-0"
                          style={
                            !partner.image
                              ? {
                                  backgroundColor: pColor.hex,
                                  boxShadow: `inset 0 0 0 1px ${pColor.borderHex}`,
                                }
                              : undefined
                          }
                        >
                          {partner.image ? (
                            <img src={partner.image} alt="" className="w-full h-full object-cover" />
                          ) : isMasterOwner ? (
                            <Radar className="w-4 h-4 text-cyan-300 stroke-[2.2] animate-pulse" />
                          ) : (
                            <span className="text-white font-bold tracking-wider text-[11px]">
                              {pInitials}
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate text-white group-hover:text-amber-300 transition-colors">
                            {partner.name}
                          </span>
                          <span className={`text-xs font-mono font-bold shrink-0 ${
                            isMasterOwner ? "text-cyan-300" : "text-amber-300"
                          }`}>
                            [{partner.callsign}]
                          </span>
                          {partner.isSelf && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-emerald-400 truncate flex items-center gap-1 font-medium">
                          <span>Active now</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300 truncate">{partner.division || "Competitor"}</span>
                        </div>
                      </div>
                    </div>

                    {onOpenDossier && (
                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                        <span
                          className="p-1 rounded-lg group-hover:bg-white/10 text-slate-400 group-hover:text-amber-300 transition-colors"
                          title={`View ${partner.callsign} Profile`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
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


