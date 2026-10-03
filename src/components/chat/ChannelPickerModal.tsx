"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Radio, 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Check, 
  Lock, 
  Users, 
  ChevronRight, 
  Flame, 
  Wind, 
  Target, 
  Sparkles, 
  MessageSquare,
  Bot,
  Radar
} from "lucide-react";
import { ChannelConfig, DirectPartner } from "@/lib/types";

export interface ChannelEngagementInfo {
  postCount: number;
  reactionCount?: number;
  dopeCount?: number;
}

interface ChannelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelConfig[];
  currentChannel: string;
  onSelectChannel: (channelId: string) => void;
  unreadCounts?: Record<string, number>;
  engagementCounts?: Record<string, ChannelEngagementInfo>;
  onPlayChirp?: (freq?: number) => void;
  directPartners?: DirectPartner[];
}

export function ChannelPickerModal({
  isOpen,
  onClose,
  channels,
  currentChannel,
  onSelectChannel,
  unreadCounts = {},
  engagementCounts = {},
  onPlayChirp,
  directPartners = [],
}: ChannelPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<"ALL" | "MATCH" | "DIRECT">("ALL");
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setSearchQuery("");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsVoiceListening(false);
      }
    }
  }, [isOpen]);

  // Voice Search using Web Speech API
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

    if (!SpeechRecognition) {
      alert("Voice search isn't supported on this browser. Try Chrome or Safari.");
      return;
    }

    if (isVoiceListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsVoiceListening(true);
      if (onPlayChirp) onPlayChirp(1200);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSearchQuery(transcript);
      if (onPlayChirp) onPlayChirp(1400);

      // Auto-match if exact or close match
      const matchedCh = channels.find((c) =>
        c.name.toLowerCase().includes(transcript) || transcript.includes(c.name.toLowerCase())
      );
      if (matchedCh) {
        setTimeout(() => {
          onSelectChannel(matchedCh.id);
          onClose();
        }, 400);
        return;
      }

      const matchedPartner = directPartners.find((p) =>
        p.name.toLowerCase().includes(transcript) ||
        p.callsign.toLowerCase().includes(transcript) ||
        transcript.includes(p.callsign.toLowerCase())
      );
      if (matchedPartner) {
        setTimeout(() => {
          onSelectChannel(matchedPartner.id);
          onClose();
        }, 400);
      }
    };

    recognition.onerror = () => {
      setIsVoiceListening(false);
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [channels, directPartners, isVoiceListening, onClose, onPlayChirp, onSelectChannel]);

  if (!isOpen) return null;

  // Filter channels
  const filteredChannels = channels.filter((ch) => {
    if (activeFilterTab === "DIRECT") return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ch.name.toLowerCase().includes(q) || ch.desc.toLowerCase().includes(q) || ch.badge.toLowerCase().includes(q);
  });

  // Filter direct partners
  const filteredPartners = directPartners.filter((p) => {
    if (activeFilterTab === "MATCH") return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.callsign.toLowerCase().includes(q) ||
      (p.role && p.role.toLowerCase().includes(q)) ||
      (p.division && p.division.toLowerCase().includes(q))
    );
  });

  const totalResults = filteredChannels.length + filteredPartners.length;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="ios-glass rounded-3xl max-w-xl w-full border border-amber-500/40 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92dvh] flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tactical Frequency Selector</span>
              </h3>
              <p className="text-xs text-slate-400">
                Switch rooms or engage 1-on-1 direct comms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar with Voice Dial */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms or shooters (e.g. RO, Allen, Bristol)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2.5 px-3 rounded-xl border flex items-center gap-1.5 font-mono text-xs transition-all shrink-0 ${
              isVoiceListening
                ? "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-300 hover:text-white"
            }`}
            title={isVoiceListening ? "Listening... speak channel name" : "Voice search frequency"}
          >
            <Mic className={`w-4 h-4 ${isVoiceListening ? "text-white" : "text-amber-400"}`} />
            <span className="hidden sm:inline">{isVoiceListening ? "Listening" : "Speak"}</span>
          </button>
        </div>

        {/* Voice Listening Active Indicator Banner */}
        {isVoiceListening && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center justify-between animate-pulse shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Say &quot;Invitational&quot;, &quot;RO&quot;, or &quot;Allen&quot;...</span>
            </span>
            <span className="text-[10px] text-red-400 font-bold uppercase">MIC ACTIVE</span>
          </div>
        )}

        {/* Segmented Filter Tabs: ALL, MATCH NET, DIRECT COMMS */}
        <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilterTab("ALL")}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              activeFilterTab === "ALL"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ALL ({channels.length + directPartners.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab("MATCH")}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFilterTab === "MATCH"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>#MATCH NET ({channels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab("DIRECT")}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFilterTab === "DIRECT"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>DIRECT (1-on-1) ({directPartners.length})</span>
          </button>
        </div>

        {/* Scrollable Channel & DM Cards List */}
        <div className="flex-1 overflow-y-auto chat-scroll space-y-2 pr-1 -mr-1">
          {totalResults === 0 ? (
            <div className="py-8 text-center space-y-2 text-slate-400 font-mono text-xs">
              <Radio className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No frequencies or shooters found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-amber-400 hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <>
              {/* Channel Items */}
              {filteredChannels.map((ch) => {
                const isActive = currentChannel === ch.id;
                const unread = unreadCounts[ch.id] || 0;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      if (onPlayChirp) onPlayChirp(1200);
                      onSelectChannel(ch.id);
                      onClose();
                    }}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 via-black to-black/80 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                        : "bg-white/[0.03] border-white/5 hover:border-amber-500/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                        isActive
                          ? "bg-amber-500 text-black border-amber-400"
                          : "bg-black/60 text-amber-400 border-white/10 group-hover:border-amber-500/30"
                      }`}>
                        #
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold truncate ${
                            isActive ? "text-amber-300" : "text-white group-hover:text-amber-200"
                          }`}>
                            {ch.name}
                          </span>

                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            isActive
                              ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          }`}>
                            {ch.badge}
                          </span>

                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold flex items-center gap-1">
                            <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{(engagementCounts[ch.id]?.postCount ?? 0)} posts</span>
                          </span>

                          {isActive && (
                            <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 leading-snug">
                          {ch.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {unread > 0 && !isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold animate-pulse">
                          {unread} new
                        </span>
                      )}

                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? "text-amber-400" : "text-slate-500"
                      }`} />
                    </div>
                  </button>
                );
              })}

              {/* Direct Partner Items */}
              {filteredPartners.map((partner) => {
                const isActive = currentChannel === partner.id;
                const unread = unreadCounts[partner.id] || 0;
                const isRO = partner.callsign === "RO" || partner.callsign === "RO BOT" || partner.id === "dm_ro";
                const isOwnerAdmin = partner.role === "OWNER_ADMIN" || partner.callsign === "SAID DONE" || partner.callsign === "ALLEN";
                const isMasterOwner = partner.role === "MASTER_OWNER" || partner.callsign === "ROB" || partner.callsign === "RADAR";

                return (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => {
                      if (onPlayChirp) onPlayChirp(1200);
                      onSelectChannel(partner.id);
                      onClose();
                    }}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-950/40 via-black to-black/80 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                        : "bg-white/[0.03] border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border relative overflow-hidden ${
                        isRO
                          ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                          : isMasterOwner
                          ? "bg-gradient-to-br from-blue-700 via-indigo-900 to-cyan-950 text-cyan-200 border-cyan-400 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                          : isOwnerAdmin
                          ? "bg-emerald-500 text-black border-emerald-300 font-black"
                          : "bg-black/60 text-amber-400 border-white/10"
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
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                          partner.status === "on_range" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-bold truncate ${
                            isActive 
                              ? (isMasterOwner ? "text-blue-300" : "text-emerald-300")
                              : (isMasterOwner ? "text-white group-hover:text-blue-200" : "text-white group-hover:text-emerald-200")
                          }`}>
                            {partner.name}
                          </span>

                          <span className={`font-mono text-xs font-bold shrink-0 ${
                            isMasterOwner ? "text-blue-400" : "text-amber-400"
                          }`}>
                            [{partner.callsign}]
                          </span>

                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>DIRECT</span>
                          </span>

                          {isActive && (
                            <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 leading-snug">
                          {isRO ? "🤖 Autonomous AI Assistant · Range Officer & Bristol Intel" : partner.division || partner.rifleSetup || "Verified Competitor"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {unread > 0 && !isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold animate-pulse">
                          {unread} new
                        </span>
                      )}

                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? "text-emerald-400" : "text-slate-500"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Direct & Match Comms</span>
          </span>
          <span className="text-amber-400 font-bold">Bristol, TN • 3,420 FT</span>
        </div>
      </div>
    </div>
  );
}
