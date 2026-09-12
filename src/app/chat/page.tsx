"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  Smile, 
  Lock, 
  Check, 
  Target, 
  Flame, 
  Radio, 
  Bot, 
  Info,
  BadgeAlert
} from "lucide-react";
import { INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { ChatMessage } from "@/lib/types";
import { evaluateChatMessage } from "@/lib/ai-moderator";
import { recordTelemetryEvent } from "@/lib/telemetry";

const CHANNELS = [
  { id: "bristol-championship", name: "bristol-pro-shootout", badge: "PRO SQUADS", desc: "Stages, DOPE & mountain winds" },
  { id: "general-society", name: "general-society", badge: "OPEN", desc: "Precision rimfire community banter" },
  { id: "ballistics-and-gear", name: "ballistics-and-gear", badge: "TECH", desc: "Rifles, ammo lots, tuners, optics" },
  { id: "match-day-alerts", name: "match-day-alerts", badge: "OFFICIAL", desc: "Match Director broadcasts only" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [currentChannel, setCurrentChannel] = useState("bristol-championship");
  const [inputText, setInputText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<"MEMBER" | "PRO_COMPETITOR" | "MATCH_DIRECTOR">("PRO_COMPETITOR");
  const [aiBlockedNotice, setAiBlockedNotice] = useState<string | null>(null);
  const [aiInspectionDetails, setAiInspectionDetails] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter((m) => m.channelId === currentChannel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 1. Run AI Moderation evaluation
    const evaluation = evaluateChatMessage(inputText, currentUserRole);
    setAiInspectionDetails(evaluation);

    // Track chat telemetry
    recordTelemetryEvent({
      eventType: "action",
      targetElement: "chat_send_message",
      targetCategory: "Chat",
      pageRoute: "/chat",
      targetText: `Channel: ${currentChannel} | AI Status: ${evaluation.status}`,
    });

    // If blocked outright
    if (evaluation.shouldBlock) {
      setAiBlockedNotice(evaluation.flagReason || "Message blocked by AI Policy Guard.");
      setTimeout(() => setAiBlockedNotice(null), 6000);
      return;
    }

    // Otherwise post message (either APPROVED or FLAGGED)
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now().toString(36),
      channelId: currentChannel,
      author: {
        id: "current-user",
        name: currentUserRole === "MATCH_DIRECTOR" ? "Garrett Vance (MD)" : currentUserRole === "PRO_COMPETITOR" ? "Bristol Marksman" : "Guest Shooter",
        callsign: currentUserRole === "PRO_COMPETITOR" ? "APEX-22" : "GUEST",
        role: currentUserRole,
        badgeText: currentUserRole === "MATCH_DIRECTOR" ? "MATCH DIRECTOR" : currentUserRole === "PRO_COMPETITOR" ? "PRO SHOOTER" : "MEMBER",
      },
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      moderationStatus: evaluation.status === "FLAGGED" ? "FLAGGED" : "APPROVED",
      aiModerationReport: {
        toxicityScore: evaluation.toxicityScore,
        threatScore: evaluation.threatScore,
        policyScore: evaluation.policyScore,
        sentiment: evaluation.sentiment,
        flagReason: evaluation.flagReason,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existing = msg.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...msg,
            reactions: msg.reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: ["you"] }],
          };
        }
      })
    );
  };

  const insertTestPrompt = (text: string) => {
    setInputText(text);
  };

  return (
    <div data-section="chat" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: AI Moderation Shield Status */}
      <div className="ios-glass rounded-2xl p-4 border border-emerald-500/20 shadow-tactical-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Subsonic AI Sentinel Active
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Real-Time NLP Screening
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Scans all transmissions for sportsman conduct, safety compliance, and unauthorized firearm transactions.
            </p>
          </div>
        </div>

        {/* Competitor Role Switcher (Simulated) */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] font-mono text-slate-400 pl-2">Role:</span>
          <button
            onClick={() => setCurrentUserRole("PRO_COMPETITOR")}
            data-telemetry="chat_role_pro"
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentUserRole === "PRO_COMPETITOR"
                ? "bg-amber-500 text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            PRO SHOOTER
          </button>
          <button
            onClick={() => setCurrentUserRole("MATCH_DIRECTOR")}
            data-telemetry="chat_role_md"
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentUserRole === "MATCH_DIRECTOR"
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            DIRECTOR
          </button>
          <button
            onClick={() => setCurrentUserRole("MEMBER")}
            data-telemetry="chat_role_member"
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentUserRole === "MEMBER"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            MEMBER
          </button>
        </div>
      </div>

      {/* Main Chat Layout: Channels Sidebar + Message Stream */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left: Channels Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="ios-glass rounded-3xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-2">
              Transmission Channels
            </h3>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const isActive = currentChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setCurrentChannel(ch.id)}
                    data-telemetry={`chat_switch_channel_${ch.id}`}
                    className={`w-full p-3 rounded-2xl text-left transition-all border ${
                      isActive
                        ? "ios-glass bg-white/10 border-amber-500/40 shadow-tactical-glow text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                        <span className="text-amber-400">#</span>
                        <span>{ch.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {ch.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ch.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* AI Moderation Test Simulator Box */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Bot className="w-3 h-3 text-cyan-400" />
                AI Test Presets:
              </span>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => insertTestPrompt("What elevation hold are you dialing at the 340-yard diamond stage with Lapua Center-X?")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 truncate"
                >
                  🟢 Benign Ballistics Question
                </button>
                <button
                  type="button"
                  onClick={() => insertTestPrompt("Stage 2 was completely rigged by the match director, absolute trash morons!")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 truncate"
                >
                  🟡 Code of Conduct Flag (Hostility)
                </button>
                <button
                  type="button"
                  onClick={() => insertTestPrompt("Privately selling my rifle cash only no paperwork DM me right now")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 truncate"
                >
                  🔴 Policy Violation (Direct Sale Block)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Stream & Input Box (8 cols) */}
        <div className="md:col-span-8 ios-glass rounded-3xl border border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Channel Header */}
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-amber-400 font-bold text-lg">#</span>
              <span className="text-white font-bold text-sm">
                {CHANNELS.find((c) => c.id === currentChannel)?.name}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                • {CHANNELS.find((c) => c.id === currentChannel)?.desc}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE COMMS</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No transmissions in this channel yet. Be the first to broadcast!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMD = msg.author.role === "MATCH_DIRECTOR";
                const isPro = msg.author.role === "PRO_COMPETITOR";
                const isFlagged = msg.moderationStatus === "FLAGGED";

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isMD
                        ? "bg-amber-950/20 border-amber-500/30"
                        : isFlagged
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Author & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-400">
                          {msg.author.callsign?.slice(0, 2) || "SS"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {msg.author.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                                isMD
                                  ? "bg-amber-500 text-black"
                                  : isPro
                                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {msg.author.badgeText}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{msg.timestamp}</span>
                        {isFlagged ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            AI REVIEW PENDING
                          </span>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {msg.content}
                    </p>

                    {/* AI Flag Warning if present */}
                    {isFlagged && msg.aiModerationReport?.flagReason && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                        <BadgeAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{msg.aiModerationReport.flagReason} (Sent to Admin Queue)</span>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      {msg.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                          className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-300 hover:border-amber-500/40 flex items-center gap-1 transition-all"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-mono text-[10px]">{reaction.count}</span>
                        </button>
                      ))}

                      {/* Quick reaction add buttons */}
                      <div className="flex items-center gap-1 pl-2 border-l border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                        {["🎯", "🔥", "⛰️", "👍"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="p-1 text-xs hover:scale-125 transition-transform"
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
            <div ref={messagesEndRef} />
          </div>

          {/* AI Blocked Notice Banner */}
          {aiBlockedNotice && (
            <div className="p-3 bg-red-950/80 border-t border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1 font-medium">{aiBlockedNotice}</div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/50 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Send message to #${CHANNELS.find((c) => c.id === currentChannel)?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              data-telemetry="chat_send_button"
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 active:scale-95 transition-all shadow-tactical-glow"
              title="Transmit message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
