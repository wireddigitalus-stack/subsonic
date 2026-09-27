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
  MessageSquare
} from "lucide-react";
import { ChannelConfig } from "@/lib/types";

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
}: ChannelPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<"ALL" | "PRO" | "PUBLIC">("ALL");
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
      const matched = channels.find((ch) => 
        ch.name.toLowerCase().includes(transcript) ||
        ch.id.toLowerCase().includes(transcript) ||
        ch.badge.toLowerCase().includes(transcript) ||
        (transcript.includes("weather") && ch.id.includes("weather")) ||
        (transcript.includes("bristol") && ch.id.includes("bristol")) ||
        (transcript.includes("squad") && ch.id.includes("squad")) ||
        (transcript.includes("general") && ch.id.includes("general")) ||
        (transcript.includes("gear") && ch.id.includes("gear")) ||
        (transcript.includes("alert") && ch.id.includes("alert"))
      );

      if (matched) {
        setTimeout(() => {
          onSelectChannel(matched.id);
          onClose();
        }, 500);
      }
    };

    recognition.onerror = () => setIsVoiceListening(false);
    recognition.onend = () => setIsVoiceListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isVoiceListening, channels, onSelectChannel, onClose, onPlayChirp]);

  // Filter channels based on tab and search query
  const filteredChannels = channels.filter((ch) => {
    const matchesTab = 
      activeFilterTab === "ALL" 
        ? true 
        : ch.netType === activeFilterTab;

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      ch.name.toLowerCase().includes(q) ||
      ch.id.toLowerCase().includes(q) ||
      ch.badge.toLowerCase().includes(q) ||
      ch.desc.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Drawer / Modal */}
      <div className="relative z-10 w-full max-w-lg ios-glass-card bg-[#090C12] border-t sm:border-2 border-amber-500/50 shadow-2xl rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 space-y-4 max-h-[88vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>SELECT FREQUENCY</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {channels.length} ROOMS
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Tap or speak to switch active channel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with Voice-to-Text Button */}
        <div className="relative flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room (e.g. weather, DOPE, squad)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
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
              <span>Say &quot;Weather&quot;, &quot;Bristol&quot;, or &quot;Squad&quot;...</span>
            </span>
            <span className="text-[10px] text-red-400 font-bold uppercase">MIC ACTIVE</span>
          </div>
        )}

        {/* Segmented Filter Tabs: ALL, PRO NET, PUBLIC NET */}
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
            ALL ({channels.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab("PRO")}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFilterTab === "PRO"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>PRO NET</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab("PUBLIC")}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFilterTab === "PUBLIC"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3 h-3" />
            <span>PUBLIC NET</span>
          </button>
        </div>

        {/* Scrollable Channel Cards List */}
        <div className="flex-1 overflow-y-auto chat-scroll space-y-2 pr-1 -mr-1">
          {filteredChannels.length === 0 ? (
            <div className="py-8 text-center space-y-2 text-slate-400 font-mono text-xs">
              <Radio className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No frequencies found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-amber-400 hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredChannels.map((ch) => {
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
                            : ch.netType === "PRO"
                            ? "bg-red-500/10 text-red-300 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        }`}>
                          {ch.badge}
                        </span>

                        {/* Engagement / Post Counter Badge */}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{(engagementCounts[ch.id]?.postCount ?? 0)} {(engagementCounts[ch.id]?.postCount === 1 ? "post" : "posts")}</span>
                        </span>

                        {engagementCounts[ch.id]?.reactionCount ? (
                          <span className="text-[9px] font-mono text-amber-300/80 flex items-center gap-0.5 font-bold">
                            <Flame className="w-2.5 h-2.5 text-amber-400" />
                            {engagementCounts[ch.id]?.reactionCount}
                          </span>
                        ) : null}

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

                    <div className="text-right font-mono text-[11px] text-slate-400 hidden xs:block">
                      <div className="flex items-center justify-end gap-1 text-slate-200">
                        <strong className="text-white font-mono">{engagementCounts[ch.id]?.postCount ?? 0}</strong>
                        <span className="text-slate-400 text-[10px]">posts</span>
                      </div>
                      <div className="text-[9px] text-slate-400 hidden sm:block">
                        {ch.activeUsers} shooters
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? "text-amber-400" : "text-slate-500"
                    }`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <span>Encrypted Subsonic Comms Net</span>
          <span className="text-amber-400 font-bold">Bristol, TN • 3,420 FT</span>
        </div>
      </div>
    </div>
  );
}
