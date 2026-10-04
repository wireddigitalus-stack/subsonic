"use client";

import React from "react";
import { 
  MessageSquare, 
  Pin, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Crosshair, 
  Map, 
  Maximize2, 
  Shield, 
  Flame, 
  Wind, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Target, 
  Copy, 
  BadgeAlert, 
  Radio, 
  ExternalLink, 
  FileText,
  Lock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bot,
  Radar,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import { ChatMessage, DopeCardData, DirectPartner } from "@/lib/types";

export interface ChatMessageListProps {
  pinnedAnnouncement: string | null;
  announcementCollapsed: boolean;
  setAnnouncementCollapsed: (val: boolean) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
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
  activeDirectPartner?: DirectPartner | null;
  onBackToInvitational?: () => void;
  onSelectShooter?: (shooter: DirectPartner) => void;
  onEditMessage?: (id: string, newContent: string) => Promise<void> | void;
  onDeleteMessage?: (id: string) => Promise<void> | void;
}

export function ChatMessageList({
  pinnedAnnouncement,
  announcementCollapsed,
  setAnnouncementCollapsed,
  messagesContainerRef,
  messagesEndRef,
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
  activeDirectPartner,
  onBackToInvitational,
  onSelectShooter,
  onEditMessage,
  onDeleteMessage,
}: ChatMessageListProps) {
  const isDirectMode = currentChannel.startsWith("dm_");

  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");
  const [deletingMessageId, setDeletingMessageId] = React.useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  const isCurrentUserAdmin = Boolean(
    shooterProfile &&
    (
      shooterProfile.role === "MASTER_OWNER" ||
      shooterProfile.role === "DEV_ADMIN" ||
      shooterProfile.role === "OWNER_ADMIN" ||
      shooterProfile.role === "ADMIN" ||
      shooterProfile.role === "MODERATOR" ||
      ["RADAR", "ROB", "LTDAN", "SAID DONE", "ALLEN", "AHURLEY", "HURLEY"].includes(shooterProfile.callsign?.toUpperCase())
    )
  );

  const startEditing = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
    setDeletingMessageId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const submitEdit = async (msgId: string) => {
    if (!editContent.trim() || isSubmittingEdit) return;
    setIsSubmittingEdit(true);
    try {
      if (onEditMessage) {
        await onEditMessage(msgId, editContent.trim());
      }
      setEditingMessageId(null);
      setEditContent("");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const confirmDelete = async (msgId: string) => {
    if (onDeleteMessage) {
      await onDeleteMessage(msgId);
    }
    setDeletingMessageId(null);
  };

  const handleAuthorClick = (author: ChatMessage["author"]) => {
    if (!onSelectShooter) return;
    const isRO = author.id === "plink_ai_moderator" || author.name === "RO" || author.name === "RO BOT" || author.callsign === "RO" || author.callsign === "RO BOT";
    const partner: DirectPartner = {
      id: isRO ? "dm_ro" : `dm_${(author.callsign || author.id).toLowerCase()}`,
      callsign: isRO ? "RO BOT" : (author.callsign || "MARKS"),
      name: isRO ? "RO BOT" : author.name,
      role: author.role,
      badgeText: isRO ? "AI Range Officer" : (author.badgeText || author.role),
      division: isRO ? "Autonomous AI Match Assistant" : author.division,
      rifleSetup: isRO ? "Autonomous AI Agent • Match Ops & Safety" : author.rifleSetup,
      status: isRO ? "online" : "online",
      bio: isRO 
        ? "Official Autonomous AI Range Officer & Match Assistant for The Hideout. 24/7 intel on match schedules, Bristol lodging, dining, and range safety." 
        : `Verified Subsonic Society competitor in ${author.division || "Open Division"}.`,
    };
    onSelectShooter(partner);
  };

  return (
    <>
      {/* 1. TOP HEADER BANNER */}
      {isDirectMode ? (
        /* Point-to-Point Direct Comms Active Banner */
        <div className="shrink-0 p-2.5 sm:p-3.5 bg-gradient-to-r from-amber-950/80 via-black to-zinc-950 border-b border-amber-500/40 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBackToInvitational && (
              <button
                type="button"
                onClick={onBackToInvitational}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                title="Return to #invitational match chat"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline">#invitational</span>
                <span className="xs:hidden">Back</span>
              </button>
            )}

            <div className="min-w-0 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                    {activeDirectPartner ? activeDirectPartner.name : currentChannel.replace("dm_", "").toUpperCase()}
                  </span>
                  {activeDirectPartner && (
                    <span className="font-mono text-[10px] sm:text-xs text-amber-400 font-bold shrink-0">
                      [{activeDirectPartner.callsign}]
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400/90 truncate flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Closed Net</span>
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25">
                    <Bot className="w-2.5 h-2.5 text-cyan-400" />
                    <span>AI Range Officer Monitored</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeDirectPartner && onSelectShooter && (
            <button
              type="button"
              onClick={() => onSelectShooter(activeDirectPartner)}
              className="px-2 sm:px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-mono text-[10px] sm:text-xs flex items-center gap-1 border border-white/10 shrink-0 transition-colors"
              title="View Shooter Profile"
            >
              <span>Profile</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        /* Pinned Match Director Announcement — desktop only */
        pinnedAnnouncement && (
          <div
            className={`shrink-0 border-b border-amber-500/30 transition-all hidden md:flex ${announcementCollapsed ? "py-1" : "py-2 sm:py-2.5"} px-2.5 sm:px-4 bg-amber-950/60 items-center justify-between gap-2 cursor-pointer`}
            onClick={() => setAnnouncementCollapsed(!announcementCollapsed)}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Pin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className={`text-[11px] text-amber-200 ${announcementCollapsed ? "truncate" : "leading-relaxed"}`}>
                {pinnedAnnouncement}
              </span>
            </div>
            {announcementCollapsed
              ? <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              : <ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            }
          </div>
        )
      )}

      {/* Messages Stream — flex-1 fills all available space, scrolls internally */}
      <div
        ref={messagesContainerRef}
        onScroll={handleContainerScroll}
        className="px-2 pt-2 pb-8 md:px-5 md:pt-4 md:pb-12 space-y-2.5 md:space-y-4 flex-1 overflow-y-auto chat-scroll overscroll-contain min-h-0 scroll-smooth"
      >
        {filteredMessages.length === 0 ? (
          isDirectMode ? (
            <div className="text-center py-12 md:py-16 px-4 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-white text-base">Point-to-Point Uplink Established</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct communication channel with <strong className="text-white">{activeDirectPartner?.name || "this competitor"}</strong>. Messages are private to this net.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono text-cyan-300">
                  <Bot className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Monitored by RO BOT · Autonomous AI Match & Safety Agent</span>
                </div>
              </div>

              {(activeDirectPartner?.callsign === "RO" || activeDirectPartner?.callsign === "RO BOT" || activeDirectPartner?.id === "dm_ro") && (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 text-left space-y-2.5 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                  <div className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Autonomous AI Assistant Quick Inquiries:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      "Where should I stay in Bristol?",
                      "What are the best dinner spots?",
                      "Tell me about the $2,500 cash side matches",
                      "What is the schedule for Saturday?"
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputText(promptText)}
                        className="text-[10px] font-mono p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                      >
                        &ldquo;{promptText}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-400 font-mono text-sm">No transmissions in #{currentChannelData.name} yet.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first competitor to broadcast DOPE or stage notes to the squad.
              </p>
            </div>
          )
        ) : (
          filteredMessages.map((msg) => {
            const isMasterOwner = msg.author.role === "MASTER_OWNER" || msg.author.role === "DEV_ADMIN" || msg.author.callsign === "ROB" || msg.author.callsign === "RADAR";
            const isOwnerAdmin = msg.author.role === "OWNER_ADMIN" || msg.author.callsign === "SAID DONE" || msg.author.callsign === "ALLEN" || msg.author.callsign === "AHURLEY";
            const isAdmin = msg.author.role === "ADMIN";
            const isMod = msg.author.role === "MODERATOR";
            const isMD = msg.author.role === "MATCH_DIRECTOR" || msg.type === "MATCH_ALERT";
            const isPro = msg.author.role === "PRO_COMPETITOR";
            const isDopeDrop = msg.type === "DOPE_DROP" || !!msg.dopeCard;
            const isFlagged = msg.moderationStatus === "FLAGGED";
            const isRO = msg.author.id === "plink_ai_moderator" || msg.author.name === "RO" || msg.author.name === "RO BOT" || msg.author.callsign === "RO" || msg.author.callsign === "RO BOT";
            // RO warning tier from aiEngine field
            const roSeverity: "warn" | "alert" | "info" = isRO
              ? msg.aiModerationReport
                ? (msg.aiModerationReport.toxicityScore >= 60 ? "alert" : "warn")
                : "info"
              : "info";

            const isAuthor = Boolean(
              shooterProfile &&
              (
                (shooterProfile.callsign && msg.author?.callsign && msg.author.callsign.toUpperCase() === shooterProfile.callsign.toUpperCase()) ||
                (shooterProfile.id && msg.author?.id && msg.author.id === shooterProfile.id)
              )
            );
            const canEdit = (isAuthor || isCurrentUserAdmin) && !isRO;
            const canDelete = isAuthor || isCurrentUserAdmin;

            return (
              <div
                key={msg.id}
                className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl transition-all space-y-1.5 md:space-y-2.5 scroll-mb-8 border-l-2 ${
                  isRO
                    ? roSeverity === "alert"
                      ? "bg-red-950/20 border-l-red-500 border-y border-r border-y-white/5 border-r-white/5"
                      : roSeverity === "warn"
                      ? "bg-amber-950/15 border-l-amber-500 border-y border-r border-y-white/5 border-r-white/5"
                      : "bg-cyan-950/15 border-l-cyan-400 border-y border-r border-y-cyan-500/10 border-r-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                    : isMasterOwner
                    ? "bg-blue-950/30 border-l-blue-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isOwnerAdmin
                    ? "bg-emerald-950/25 border-l-emerald-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isAdmin
                    ? "bg-cyan-950/25 border-l-cyan-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isMod
                    ? "bg-purple-950/25 border-l-purple-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isMD
                    ? "bg-amber-950/15 border-l-amber-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isDopeDrop
                    ? "bg-cyan-950/15 border-l-cyan-500 border-y border-r border-y-white/5 border-r-white/5"
                    : isFlagged
                    ? "bg-amber-500/5 border-l-amber-500 border-y border-r border-y-white/5 border-r-white/5"
                    : "bg-white/[0.02] border-l-transparent border-y border-r border-y-transparent border-r-transparent hover:bg-white/[0.04]"
                }`}
              >
                {/* Message Header: Author, Badge, Timestamp */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    {/* Avatar — clickable to open profile & start DM */}
                    <button
                      type="button"
                      onClick={() => handleAuthorClick(msg.author)}
                      title={`View ${msg.author.name} Profile & Direct Chat`}
                      className={`flex w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center font-mono font-bold text-xs ring-2 shrink-0 transition-transform active:scale-95 hover:ring-cyan-400 cursor-pointer overflow-hidden ${
                        isRO
                          ? "bg-cyan-950 text-cyan-300 ring-cyan-400/60 font-black shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                          : isMasterOwner
                          ? "bg-blue-800 text-cyan-200 ring-cyan-400 font-black"
                          : isOwnerAdmin
                          ? "bg-emerald-500 text-black ring-emerald-300 font-black"
                          : isAdmin
                          ? "bg-cyan-600 text-black ring-cyan-300 font-black"
                          : isMod
                          ? "bg-purple-600 text-white ring-purple-300 font-black"
                          : isMD
                          ? "bg-amber-500 text-black ring-amber-400"
                          : isDopeDrop
                          ? "bg-cyan-950 text-cyan-300 ring-cyan-500/40"
                          : "bg-white/10 text-slate-300 ring-white/10"
                      }`}
                    >
                      {msg.author.avatarUrl ? (
                        <img src={msg.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : isRO ? (
                        "🤖"
                      ) : isMasterOwner ? (
                        <Radar className="w-4 h-4 md:w-5 md:h-5 text-cyan-300 stroke-[2.2] drop-shadow-[0_0_8px_rgba(6,182,212,0.85)] animate-pulse" />
                      ) : isOwnerAdmin ? (
                        <span className="font-mono font-black text-sm md:text-base text-black">A</span>
                      ) : isAdmin ? (
                        "🛡️"
                      ) : isMod ? (
                        "⚖️"
                      ) : (
                        msg.author.callsign?.slice(0, 2) || "SS"
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Author Name clickable */}
                        <button
                          type="button"
                          onClick={() => handleAuthorClick(msg.author)}
                          title={`View ${msg.author.name} Profile & Direct Chat`}
                          className={`text-sm font-semibold truncate text-left hover:underline underline-offset-2 transition-all cursor-pointer ${
                            isRO ? "text-cyan-300 font-bold" : isMasterOwner ? "text-blue-400 font-black" : isOwnerAdmin ? "text-emerald-300" : isAdmin ? "text-cyan-300" : isMod ? "text-purple-300" : "text-white"
                          }`}
                        >
                          {isRO ? "RO BOT" : msg.author.name}
                        </button>

                        {/* Callsign brackets */}
                        {msg.author.callsign && !isRO && (
                          <button
                            type="button"
                            onClick={() => handleAuthorClick(msg.author)}
                            title={`View ${msg.author.callsign} Profile`}
                            className={`hidden md:inline text-xs font-mono font-medium hover:underline ${
                              isMasterOwner ? "text-blue-400/80 hover:text-blue-300" : "text-slate-400 hover:text-slate-300"
                            }`}
                          >
                            [{msg.author.callsign}]
                          </button>
                        )}

                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded uppercase ${
                            isRO
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                              : isMasterOwner
                              ? "bg-blue-500/20 text-blue-300"
                              : isOwnerAdmin
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isAdmin
                              ? "bg-cyan-500/20 text-cyan-300"
                              : isMod
                              ? "bg-purple-500/20 text-purple-300"
                              : isMD
                              ? "bg-amber-500/20 text-amber-300"
                              : isPro
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {isRO ? (
                            "🤖 AI Range Officer"
                          ) : isMasterOwner ? (
                            <span className="inline-flex items-center gap-1">
                              <Radar className="w-2.5 h-2.5 text-cyan-200 stroke-[2.5]" />
                              <span>MASTER ADMIN</span>
                            </span>
                          ) : isOwnerAdmin ? (
                            "🎖️ ADMIN"
                          ) : isAdmin ? (
                            "🛡️ ADMIN"
                          ) : isMod ? (
                            "⚖️ MOD"
                          ) : (
                            msg.author.badgeText || msg.author.role
                          )}
                        </span>

                        {/* Timestamp — inline on mobile */}
                        <span className="text-[11px] md:hidden text-slate-500">
                          {msg.timestamp}
                          {msg.isEdited && <span className="text-[9px] text-slate-500 italic ml-1">(edited)</span>}
                        </span>
                      </div>

                      {/* Rig line or RO Subtitle */}
                      {isRO ? (
                        <div className="hidden md:flex text-[11px] text-cyan-300/80 items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                          <span>Autonomous AI Match Assistant · The Hideout Official Guide</span>
                        </div>
                      ) : msg.author.rifleSetup ? (
                        <div className="hidden md:block text-[11px] text-slate-400 truncate max-w-md">
                          Rig: {msg.author.rifleSetup}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Meta: Timestamp, Actions & Status */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 shrink-0">
                    {/* Action buttons (Edit & Delete) */}
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-0.5 sm:gap-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {canEdit && editingMessageId !== msg.id && (
                          <button
                            type="button"
                            onClick={() => startEditing(msg)}
                            title="Edit transmission"
                            className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
                          >
                            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                        {canDelete && deletingMessageId !== msg.id && (
                          <button
                            type="button"
                            onClick={() => setDeletingMessageId(msg.id)}
                            title="Delete transmission"
                            className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="hidden md:flex items-center gap-1">
                      {msg.isEdited && (
                        <span className="text-[10px] text-slate-500 italic select-none" title={msg.editedAt ? `Edited at ${msg.editedAt}` : "Edited"}>
                          (edited)
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>

                    {isFlagged ? (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        REVIEW
                      </span>
                    ) : isRO ? (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                        <Bot className="w-3 h-3 text-cyan-400" />
                        AI RO
                      </span>
                    ) : (
                      <Check className="hidden md:inline w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Inline Delete Confirmation */}
                {deletingMessageId === msg.id && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Delete transmission permanently?</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDeletingMessageId(null)}
                        className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(msg.id)}
                        className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Edit Form OR Standard Content */}
                {editingMessageId === msg.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitEdit(msg.id);
                        } else if (e.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-amber-500/40 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-sans resize-none"
                      placeholder="Edit message..."
                      autoFocus
                    />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 hidden sm:inline">Enter to save • Esc to cancel</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isSubmittingEdit}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitEdit(msg.id)}
                          disabled={isSubmittingEdit || !editContent.trim()}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  msg.content && (
                    <div className="space-y-2">
                      <p className={`text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line ${
                        isRO ? "text-cyan-50/95" : "text-slate-200"
                      }`}>
                        {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                          if (part.match(/^https?:\/\//)) {
                            return (
                              <a
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 font-mono font-bold underline underline-offset-4 break-all transition-colors ${
                                  isRO
                                    ? "text-cyan-300 hover:text-cyan-200 decoration-cyan-400/60 hover:decoration-cyan-200"
                                    : "text-amber-400 hover:text-amber-300 decoration-amber-500/60 hover:decoration-amber-300"
                                }`}
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
                      {(msg.content.includes("competitor-packet") || msg.id.startsWith("welcome-allen")) && (
                        <div className="pt-1">
                          <a
                            href="/competitor-packet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 ${
                              isRO
                                ? "bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                                : "bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200"
                            }`}
                          >
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isRO ? "text-cyan-400" : "text-amber-400"}`} />
                            <span>Open 2026 Competitor Packet (Guide & PDF)</span>
                            <ExternalLink className={`w-3 h-3 shrink-0 ${isRO ? "text-cyan-400" : "text-amber-400"}`} />
                          </a>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* DOPE CARD — hidden for initial onboarding */}

                {/* Staff Moderation Flag Notice */}
                {isFlagged && msg.aiModerationReport?.flagReason && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                    <BadgeAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <strong>Moderation Alert:</strong> {msg.aiModerationReport.flagReason}
                    </div>
                  </div>
                )}

                {/* Reactions Bar */}
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

                  {/* Quick Reactions Palette */}
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
        {/* Bottom anchor sentinel for upward scroll clearance above input bar */}
        <div ref={messagesEndRef} className="h-6 sm:h-10 w-full shrink-0 pointer-events-none" aria-hidden="true" />
      </div>

      {/* New Messages FAB */}
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

      {/* Blocked Notice */}
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
          <span className="text-[10px] font-mono text-slate-400">[{shooterProfile.callsign}] transmitting...</span>
        </div>
      )}

      {/* Quick Radio Chips above input — hidden on mobile to maximize room */}
      <div id="tour-step-plink" className="hidden sm:flex px-3 pt-2 pb-1 bg-black/70 items-center justify-between gap-1.5 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
          {isDirectMode ? (
            (activeDirectPartner?.callsign === "RO" || activeDirectPartner?.callsign === "RO BOT" || activeDirectPartner?.id === "dm_ro") ? (
              <>
                <button
                  type="button"
                  onClick={() => quickBroadcast("What are the recommended hotels in Bristol?")}
                  className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition-all shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                >
                  🏨 &ldquo;Bristol Lodging&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => quickBroadcast("What are the best dinner and BBQ spots near the match?")}
                  className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-950/25 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-500/30 transition-all shrink-0"
                >
                  🍖 &ldquo;Bristol Food&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => quickBroadcast("How do the $2,500 cash side matches work?")}
                  className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 transition-all shrink-0"
                >
                  💵 &ldquo;Cash Matches&rdquo;
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => quickBroadcast("Copy that. On frequency.")}
                  className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-white/10 transition-all shrink-0"
                >
                  📻 &ldquo;Copy that&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => quickBroadcast("What squad are you running in?")}
                  className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all shrink-0"
                >
                  🎯 &ldquo;Which squad?&rdquo;
                </button>
              </>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setInputText("hey ro ");
                  playTacticalChirp(1100);
                }}
                className="whitespace-nowrap text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 transition-all flex items-center gap-1 font-bold shrink-0"
                title="Chat with RO BOT, your AI Range Officer"
              >
                🤖 &ldquo;Hey RO&rdquo;
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
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsChannelModalOpen(true);
            playTacticalChirp(1000);
          }}
          className="text-[10px] font-mono text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 shrink-0 px-1 py-0.5"
        >
          <span className="truncate max-w-[120px]">
            {isDirectMode ? `🔒 ${activeDirectPartner?.callsign || "DM"}` : `#${currentChannelData.name}`}
          </span>
        </button>
      </div>
    </>
  );
}
