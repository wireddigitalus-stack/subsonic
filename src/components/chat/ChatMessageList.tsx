"use client";

import React, { RefObject } from "react";
import { MessageSquare, Pin, ChevronDown, ChevronUp, AlertTriangle, Crosshair, Map, Maximize2, Shield, Flame, Wind, ArrowRight, Check, Target, Copy, BadgeAlert, Radio, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import { ChatMessage, DopeCardData } from "@/lib/types";

export interface ChatMessageListProps {
  pinnedAnnouncement: string | null;
  announcementCollapsed: boolean;
  setAnnouncementCollapsed: (val: boolean) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  handleContainerScroll: () => void;
  filteredMessages: ChatMessage[];
  currentChannelData: { name: string };
  shooterProfile: any;
  setProfileForm: (profile: any) => void;
  setProfileActiveTab: (tab: "PASS" | "EDIT") => void;
  setIsProfileModalOpen: (val: boolean) => void;
  playTacticalChirp: (freq: number) => void;
  currentChannel: string;
  quickBroadcast: (text: string) => void;
  setIsChannelModalOpen: (val: boolean) => void;
  copyDopeToClipboard: (id: string, dope: DopeCardData) => void;
  copiedDopeId: string | null;
  handleAddReaction: (id: string, emoji: string) => void;
  showScrollFab: boolean;
  scrollContainerToBottom: (smooth: boolean) => void;
  setShowScrollFab: (val: boolean) => void;
  aiBlockedNotice: string | null;
  isTyping: boolean;
  setInputText: (val: string) => void;
}

export function ChatMessageList({
  pinnedAnnouncement,
  announcementCollapsed,
  setAnnouncementCollapsed,
  messagesContainerRef,
  handleContainerScroll,
  filteredMessages,
  currentChannelData,
  shooterProfile,
  setProfileForm,
  setProfileActiveTab,
  setIsProfileModalOpen,
  playTacticalChirp,
  currentChannel,
  copyDopeToClipboard,
  copiedDopeId,
  handleAddReaction,
  showScrollFab,
  scrollContainerToBottom,
  setShowScrollFab,
  aiBlockedNotice,
  isTyping,
  setInputText,
  quickBroadcast,
  setIsChannelModalOpen,
}: ChatMessageListProps) {
  return (
    <>
      {/* Pinned Match Director Announcement — desktop only */}
          {pinnedAnnouncement && (
            <div
              className={`shrink-0 border-b border-amber-500/30 transition-all hidden md:flex ${announcementCollapsed ? "py-1" : "py-2 sm:py-2.5"} px-2.5 sm:px-4 bg-amber-950/60 items-center justify-between gap-2 cursor-pointer`}
              onClick={() => setAnnouncementCollapsed(!announcementCollapsed)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Pin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className={`text-[10px] sm:text-[11px] text-amber-200 font-mono ${announcementCollapsed ? "truncate" : "leading-relaxed"}`}>
                  {pinnedAnnouncement}
                </span>
              </div>
              {announcementCollapsed
                ? <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                : <ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              }
            </div>
          )}

          {/* Messages Stream — flex-1 fills all available space, scrolls internally */}
          <div
            ref={messagesContainerRef}
            onScroll={handleContainerScroll}
            className="px-2 py-2 md:p-5 space-y-2 md:space-y-4 flex-1 overflow-y-auto chat-scroll overscroll-contain min-h-0"
          >

            {filteredMessages.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-slate-400 font-mono text-sm">No transmissions in #{currentChannelData.name} yet.</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first competitor to broadcast DOPE or stage notes to the squad.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMasterOwner = msg.author.role === "MASTER_OWNER" || msg.author.role === "DEV_ADMIN" || msg.author.callsign === "ROB";
                const isOwnerAdmin = msg.author.role === "OWNER_ADMIN" || msg.author.callsign === "ALLEN" || msg.author.callsign === "AHURLEY";
                const isAdmin = msg.author.role === "ADMIN";
                const isMod = msg.author.role === "MODERATOR";
                const isMD = msg.author.role === "MATCH_DIRECTOR" || msg.type === "MATCH_ALERT";
                const isPro = msg.author.role === "PRO_COMPETITOR";
                const isDopeDrop = msg.type === "DOPE_DROP" || !!msg.dopeCard;
                const isFlagged = msg.moderationStatus === "FLAGGED";
                const isRO = msg.author.id === "plink_ai_moderator" || msg.author.name === "RO" || msg.author.callsign === "RO";
                // RO warning tier from aiEngine field
                const roSeverity: "warn" | "alert" | "info" = isRO
                  ? msg.aiModerationReport
                    ? (msg.aiModerationReport.toxicityScore >= 60 ? "alert" : "warn")
                    : "info"
                  : "info";

                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 md:p-5 rounded-xl md:rounded-2xl border transition-all space-y-1.5 md:space-y-3 ${
                      isRO
                        ? roSeverity === "alert"
                          ? "bg-gradient-to-r from-red-950/50 to-black/80 border-red-500/30"
                          : roSeverity === "warn"
                          ? "bg-gradient-to-r from-amber-950/40 to-black/80 border-amber-500/30"
                          : "bg-gradient-to-r from-amber-950/35 via-black/85 to-zinc-950 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : isMasterOwner
                        ? "bg-gradient-to-r from-amber-950/60 via-black/80 to-yellow-950/40 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                        : isOwnerAdmin
                        ? "bg-gradient-to-r from-emerald-950/60 via-black/80 to-teal-950/40 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                        : isAdmin
                        ? "bg-gradient-to-r from-cyan-950/60 via-black/80 to-blue-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                        : isMod
                        ? "bg-gradient-to-r from-purple-950/60 via-black/80 to-indigo-950/40 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                        : isMD
                        ? "bg-gradient-to-r from-amber-950/40 to-black/60 border-amber-500/40 shadow-tactical-glow"
                        : isDopeDrop
                        ? "bg-black/70 border-cyan-500/30 shadow-lg"
                        : isFlagged
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Message Header: Author, Badge, Timestamp */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {/* Avatar — desktop only */}
                        <div className={`hidden md:flex w-9 h-9 rounded-xl items-center justify-center font-mono font-bold text-xs border shrink-0 ${
                          isRO
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            : isMasterOwner
                            ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-black border-amber-300 font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            : isOwnerAdmin
                            ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            : isAdmin
                            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-black border-cyan-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            : isMod
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-300 font-black shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            : isMD
                            ? "bg-amber-500 text-black border-amber-400"
                            : isDopeDrop
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                            : "bg-black/60 text-amber-400 border-white/10"
                        }`}>
                          {isRO ? "🎯" : isMasterOwner ? "👑" : isOwnerAdmin ? "🎖️" : isAdmin ? "🛡️" : isMod ? "⚖️" : (msg.author.callsign?.slice(0, 2) || "SS")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs md:text-sm font-bold truncate ${isRO ? "text-amber-300 font-black" : isMasterOwner ? "text-amber-300" : isOwnerAdmin ? "text-emerald-300" : isAdmin ? "text-cyan-300" : isMod ? "text-purple-300" : "text-white"}`}>
                              {isRO ? "RO" : msg.author.name}
                            </span>
                            {/* Callsign brackets — desktop only */}
                            {msg.author.callsign && !isRO && (
                              <span className="hidden md:inline text-xs font-mono text-amber-400 font-bold">
                                [{msg.author.callsign}]
                              </span>
                            )}
                            <span
                              className={`text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                isRO
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                                  : isMasterOwner
                                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black border border-amber-300"
                                  : isOwnerAdmin
                                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black border border-emerald-300"
                                  : isAdmin
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black border border-cyan-300"
                                  : isMod
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black border border-purple-300"
                                  : isMD
                                  ? "bg-amber-500 text-black font-extrabold"
                                  : isPro
                                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {isRO ? "RANGE OFFICER" : isMasterOwner ? "👑 OWNER" : isOwnerAdmin ? "🎖️ ADMIN" : isAdmin ? "🛡️ ADMIN" : isMod ? "⚖️ MOD" : (msg.author.badgeText || msg.author.role)}
                            </span>
                            {/* Timestamp — inline on mobile */}
                            <span className="text-[10px] md:hidden text-slate-500 font-mono">{msg.timestamp}</span>
                          </div>
                          {/* Rig line or RO Subtitle — desktop only */}
                          {isRO ? (
                            <div className="hidden md:flex text-[10px] font-mono text-amber-400/90 items-center gap-1.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                              <span>Range Officer · The Hideout Official</span>
                            </div>
                          ) : msg.author.rifleSetup ? (
                            <div className="hidden md:block text-[10px] font-mono text-slate-400 truncate max-w-md">
                              Rig: {msg.author.rifleSetup}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Right Meta: Timestamp & Status — desktop only (mobile has it inline) */}
                      <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
                        <span>{msg.timestamp}</span>
                        {isFlagged ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            REVIEW
                          </span>
                        ) : isRO ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono">
                            OFFICIAL RO
                          </span>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>


                    {/* Standard Content with Clickable URLs & Competitor Packet Badge */}
                    {msg.content && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                          {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                            if (part.match(/^https?:\/\//)) {
                              return (
                                <a
                                  key={i}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/60 hover:decoration-amber-300 break-all transition-colors"
                                >
                                  <span>{part}</span>
                                  <ExternalLink className="w-3 h-3 inline shrink-0" />
                                </a>
                              );
                            }
                            return part;
                          })}
                        </p>

                        {/* Dedicated Interactive Button if message references the competitor packet */}
                        {msg.content.includes("competitor-packet") && (
                          <div className="pt-1">
                            <a
                              href="https://subsonic-omega.vercel.app/competitor-packet"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Open 2026 Competitor Packet (Guide & PDF)</span>
                              <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DOPE CARD — compact on mobile */}
                    {msg.dopeCard && (
                      <div className="p-2 md:p-3.5 rounded-lg md:rounded-2xl bg-black/85 border border-cyan-500/40 shadow-tactical-glow space-y-1 md:space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
                          <div className="flex items-center gap-1.5 sm:gap-2 font-mono min-w-0">
                            <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
                              BALLISTIC DOPE
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] sm:text-[10px] font-bold shrink-0">
                              {msg.dopeCard.targetDistance}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyDopeToClipboard(msg.id, msg.dopeCard!)}
                            className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[9px] sm:text-[10px] font-mono text-slate-300 hover:text-white transition-colors shrink-0"
                          >
                            {copiedDopeId === msg.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                                <span className="text-emerald-300">COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* DOPE Grid: Single row on all devices */}
                        <div className="grid grid-cols-4 gap-1 sm:gap-2 font-mono text-center">
                          <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">ELEV</span>
                            <div className="text-[11px] sm:text-sm font-bold text-amber-400 truncate">{msg.dopeCard.elevationMils}</div>
                          </div>
                          <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">WIND</span>
                            <div className="text-[11px] sm:text-sm font-bold text-cyan-300 truncate">{msg.dopeCard.windHoldMils}</div>
                          </div>
                          <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">SPEED</span>
                            <div className="text-[10px] sm:text-xs font-semibold text-slate-200 truncate">{msg.dopeCard.windVelocity || "8-14 MPH"}</div>
                          </div>
                          <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">DA</span>
                            <div className="text-[10px] sm:text-xs font-semibold text-emerald-300 truncate">{msg.dopeCard.densityAltitude || "+2,150 FT"}</div>
                          </div>
                        </div>

                        {/* Ammo & Notes — desktop only */}
                        {(msg.dopeCard.ammo || msg.dopeCard.notes) && (
                          <div className="hidden md:flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 gap-2">
                            {msg.dopeCard.ammo && (
                              <div className="truncate">Ammo: <strong className="text-slate-200">{msg.dopeCard.ammo}</strong></div>
                            )}
                            {msg.dopeCard.notes && (
                              <div className="text-cyan-300 italic truncate text-right">
                                &ldquo;{msg.dopeCard.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Staff Moderation Flag Notice */}
                    {isFlagged && msg.aiModerationReport?.flagReason && (
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                        <BadgeAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong>Moderation Alert:</strong> {msg.aiModerationReport.flagReason}
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar — compact on mobile */}
                    <div className="flex items-center gap-1 md:gap-2 pt-0.5 flex-wrap">
                      {msg.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          type="button"
                          onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                          className="px-1.5 md:px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10 text-[11px] md:text-xs text-slate-300 hover:border-amber-500/40 flex items-center gap-1 transition-all active:scale-95"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-mono text-[10px] font-bold">{reaction.count}</span>
                        </button>
                      ))}

                      {/* Quick Reactions Palette — desktop only */}
                      <div className="hidden md:flex items-center gap-1 pl-2 border-l border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                        {["🎯", "🔥", "⛰️", "💡"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="p-1 text-xs hover:scale-125 transition-transform active:scale-95"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* New Messages — compact pill on mobile, full banner on desktop */}
          {showScrollFab && (
            <button
              type="button"
              onClick={() => { scrollContainerToBottom(true); setShowScrollFab(false); }}
              className="w-full shrink-0 flex items-center justify-center gap-2 py-1.5 md:py-2 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent border-t border-amber-500/20 text-amber-400 hover:text-amber-300 transition-all animate-fadeIn group"
              title="Jump to latest"
            >
              <span className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-0.5 md:py-1 rounded-full bg-black/50 border border-amber-500/30 text-xs font-mono font-bold">
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden md:inline">New transmissions — tap to jump down</span>
                <span className="md:hidden">New messages ↓</span>
              </span>
            </button>
          )}

          {/* Blocked Transmission Notice Banner */}
          {aiBlockedNotice && (
            <div className="p-3 bg-red-950/90 border-t border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1 font-medium">{aiBlockedNotice}</div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="px-4 py-1.5 bg-black/60 border-t border-white/5 shrink-0 flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] font-mono text-slate-400">[{shooterProfile.callsign}] composing...</span>
            </div>
          )}

          {/* Quick Push-To-Talk Radio Chips above input — hidden on mobile to maximize chat window */}
          <div id="tour-step-plink" className="hidden sm:flex px-3 pt-2 pb-1 bg-black/70 items-center justify-between gap-1.5 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  setInputText("hey plink ");
                  playTacticalChirp(1100);
                }}
                className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 transition-all flex items-center gap-1 font-bold shrink-0"
                title="Chat with Plink AI Range Marshal"
              >
                🤖 &ldquo;Hey Plink&rdquo;
              </button>
              <button
                type="button"
                onClick={() => quickBroadcast("Impact confirmed! Center hold.")}
                className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-emerald-300 border border-white/5 transition-all shrink-0"
              >
                🎯 &ldquo;Impact!&rdquo;
              </button>
              <button
                type="button"
                onClick={() => quickBroadcast("Range is cold. Chamber flags in.")}
                className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-white/5 transition-all shrink-0"
              >
                🛑 &ldquo;Cold&rdquo;
              </button>
              <button
                type="button"
                onClick={() => quickBroadcast("Wind switch: Gusting 12mph 3 o'clock.")}
                className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/5 transition-all shrink-0"
              >
                💨 &ldquo;Wind switch 12mph&rdquo;
              </button>
              <button
                type="button"
                onClick={() => quickBroadcast("DOPE verified out to 465 yards.")}
                className="hidden md:inline-block whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all shrink-0"
              >
                📋 &ldquo;DOPE verified&rdquo;
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsChannelModalOpen(true);
                playTacticalChirp(1000);
              }}
              className="text-[10px] font-mono text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 shrink-0 px-1 py-0.5"
            >
              <span className="truncate max-w-[120px]">#{currentChannelData.name}</span>
            </button>
          </div>

          
    </>
  );
}
