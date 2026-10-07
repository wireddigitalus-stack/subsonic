"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Radio, 
  Lock, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Target, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  FileText, 
  Flame, 
  Award,
  RefreshCw,
  Key,
  Play,
  MessageSquare
} from "lucide-react";
import { playRealCommsChirp, playBotTelemetryChirp } from "@/lib/chat-audio";

interface TerminalMessage {
  id: string;
  sender: {
    name: string;
    callsign: string;
    role: "PRO_COMPETITOR" | "AI_ASSISTANT" | "MATCH_DIRECTOR" | "TOP_LADY";
    roleBadge: string;
    avatar: string;
    color: string;
  };
  text: string;
  timestamp: string;
  dopeCard?: {
    stage: string;
    distance: string;
    elev: string;
    wind: string;
    velocity: string;
    hitProb: string;
  };
}

const STREAM_ITEMS: TerminalMessage[] = [
  {
    id: "msg-allen",
    sender: {
      name: "Allen Hurley",
      callsign: "SUBX",
      role: "MATCH_DIRECTOR",
      roleBadge: "EXECUTIVE / MD",
      avatar: "/assets/subsonic-logo-round.png",
      color: "border-amber-400 text-amber-400 bg-amber-500/15",
    },
    text: "Welcome marksmen. Squad registration for the 2026 Subsonic Invitational at The Hideout is live ($7,500 Cash Purse). If you received an invitation or squad pass, claim your credentials below to unlock private comms and stage DOPE.",
    timestamp: "10:41 AM",
  },
  {
    id: "msg-leipold",
    sender: {
      name: "Erich Leipold",
      callsign: "LEIPOLD",
      role: "PRO_COMPETITOR",
      roleBadge: "TEAM USA 🇺🇸",
      avatar: "/assets/erich-leipold-poster.jpg",
      color: "border-amber-400 text-amber-400 bg-amber-500/15",
    },
    text: "Zero confirmed at 50 on the RimX. Lapua Midas+ standard deviation is holding under 4.5 fps. Looking forward to The Hideout.",
    timestamp: "10:42 AM",
  },
  {
    id: "msg-verran",
    sender: {
      name: "Ron Verran",
      callsign: "VERRAN",
      role: "PRO_COMPETITOR",
      roleBadge: "TEAM USA 🇺🇸",
      avatar: "/assets/ron-verran-poster.jpg",
      color: "border-cyan-400 text-cyan-300 bg-cyan-500/15",
    },
    text: "Plate rang clean twice back-to-back across the mountain draw. Trust the elevation DOPE and commit cleanly to the break.",
    timestamp: "10:43 AM",
  },
  {
    id: "msg-sentinel",
    sender: {
      name: "Subsonic Sentinel",
      callsign: "AI-BALLISTICS",
      role: "AI_ASSISTANT",
      roleBadge: "SOLVER AI",
      avatar: "/images/SS-RWB-LOGO.png",
      color: "border-cyan-400 text-cyan-300 bg-cyan-500/15",
    },
    text: "📡 [VERIFIED DOPE DROP] Atmospheric Density Altitude calculated at +2,150 FT. High mirage boiling horizontal.",
    timestamp: "10:44 AM",
    dopeCard: {
      stage: "Stage 4 • Diamond KYL",
      distance: "340 YARDS",
      elev: "8.4 MIL",
      wind: "L 0.7 MIL",
      velocity: "1,062 FPS",
      hitProb: "94% FIRST ROUND",
    },
  },
];

export interface HeroChatTerminalProps {
  isActive?: boolean;
  onReplayVideo?: () => void;
  onReplayLock?: () => void;
}

export function HeroChatTerminal({ isActive = true, onReplayVideo, onReplayLock }: HeroChatTerminalProps) {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [showInterceptor, setShowInterceptor] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smooth scroll logic: keep Allen's welcome & Claim bubble anchored at top for quick interaction
  useEffect(() => {
    if (scrollRef.current) {
      if (messages.length <= 2) {
        scrollRef.current.scrollTop = 0;
      } else {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isTyping, showInterceptor]);

  // Sequenced message delivery
  useEffect(() => {
    if (!isActive) return;
    let timers: NodeJS.Timeout[] = [];
    setMessages([]);
    setShowInterceptor(false);
    setIsTyping(false);

    // Initial position at top
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    // Sequence: Stream Allen Hurley's welcome message, reveal the Claim Invitation card, and stop on that card
    const sequence = [
      { delay: 100, typingDelay: 600, msg: STREAM_ITEMS[0], typingWho: "Match Director Allen Hurley" },
    ];

    sequence.forEach(({ delay, typingDelay, msg, typingWho }) => {
      // Show typing indicator
      const t1 = setTimeout(() => {
        setIsTyping(true);
        setTypingName(typingWho);
      }, delay);
      timers.push(t1);

      // Post message
      const t2 = setTimeout(() => {
        setIsTyping(false);
        setTypingName(null);
        setMessages((prev) => [...prev, msg]);
        if (soundEnabled) {
          playRealCommsChirp();
        }
      }, delay + typingDelay);
      timers.push(t2);
    });

    // Reveal Claim Your Invite action bubble right after Allen's welcome message
    const tInterceptor = setTimeout(() => {
      setShowInterceptor(true);
      if (soundEnabled) playBotTelemetryChirp();
    }, 850);
    timers.push(tInterceptor);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [soundEnabled, replayCount, isActive]);

  const handleRestart = () => {
    setReplayCount((c) => c + 1);
  };

  const handleQuickPrompt = (actionType: "DOPE" | "SQUAD" | "DOCS") => {
    if (actionType === "DOCS") {
      window.location.href = "/invitational";
      return;
    }

    if (actionType === "DOPE") {
      setIsTyping(true);
      setTypingName("Subsonic Sentinel AI");
      setTimeout(() => {
        setIsTyping(false);
        setTypingName(null);
        const newMsg: TerminalMessage = {
          id: `custom-dope-${Date.now()}`,
          sender: {
            name: "Subsonic Sentinel",
            callsign: "AI-BALLISTICS",
            role: "AI_ASSISTANT",
            roleBadge: "SOLVER AI",
            avatar: "/images/SS-RWB-LOGO.png",
            color: "border-cyan-400 text-cyan-300 bg-cyan-500/15",
          },
          text: "🎯 [LIVE STAGE 8 SOLUTION] Cold Bore High-Angle Hollow shot (410 Yards @ -6° slope angle).",
          timestamp: "Just now",
          dopeCard: {
            stage: "Stage 8 • Mountain Hollow",
            distance: "410 YARDS",
            elev: "11.2 MIL",
            wind: "L 0.9 MIL",
            velocity: "1,061 FPS",
            hitProb: "89% IMPACT RATE",
          },
        };
        setMessages((prev) => [...prev, newMsg]);
        setShowInterceptor(true);
        if (soundEnabled) playBotTelemetryChirp();
      }, 700);
    } else if (actionType === "SQUAD") {
      setIsTyping(true);
      setTypingName("Match Director Allen");
      setTimeout(() => {
        setIsTyping(false);
        setTypingName(null);
        const newMsg: TerminalMessage = {
          id: `custom-squad-${Date.now()}`,
          sender: {
            name: "Allen Hurley",
            callsign: "DIRECTOR",
            role: "MATCH_DIRECTOR",
            roleBadge: "EXECUTIVE / MD",
            avatar: "/assets/subsonic-logo-round.png",
            color: "border-emerald-400 text-emerald-300 bg-emerald-500/15",
          },
          text: "Registration for the 2026 Invitational is 78% full. Claim your digital member pass below to lock your flight squad and entry ticket.",
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, newMsg]);
        setShowInterceptor(true);
        if (soundEnabled) playRealCommsChirp();
      }, 700);
    }
  };

  return (
    <div className="relative ios-glass-card rounded-3xl border-2 border-amber-500/40 shadow-tactical-glow overflow-hidden bg-gradient-to-b from-black/95 via-[#07090E]/95 to-black flex flex-col w-full select-none transition-all">
      {/* 1. HUD Telemetry Bar (Tactical Satellite & Radio Banner) */}
      <div className="h-11 sm:h-12 px-3 sm:px-6 border-b border-white/10 bg-black/70 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
            <span className="text-white font-black tracking-wider">STAGE NET</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-amber-400 font-bold hidden sm:inline">462.5625 MHz</span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-cyan-400 font-semibold hidden md:inline">3,420 FT ELEV</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono">
          {onReplayVideo && (
            <button
              type="button"
              onClick={onReplayVideo}
              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Watch Satellite Video Intro"
            >
              <Play className="w-3 h-3 fill-amber-400" />
              <span className="hidden sm:inline">VIDEO INTRO</span>
            </button>
          )}

          {onReplayLock && (
            <button
              type="button"
              onClick={onReplayLock}
              className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Calibrate Crosshair Reticle & Telemetry"
            >
              <Target className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">RETICLE LOCK</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Replay Transmission Sequence"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors ${
              soundEnabled
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
            }`}
            title="Toggle Tactical Radio Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{soundEnabled ? "AUDIO ON" : "MUTED"}</span>
          </button>

          <Link
            href="/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] tracking-wide flex items-center gap-1 transition-all active:scale-95 shadow-tactical-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            title="Launch Full Live Comms Terminal in New Tab"
          >
            <Radio className="w-3 h-3 text-black animate-pulse" />
            <span>ENTER THE CHAT</span>
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* 2. Messages Display Viewport — sized to fit full Claim Your Invite card and call-to-action buttons */}
      <div className="relative w-full aspect-video min-h-[400px] sm:min-h-[430px] md:min-h-[450px] bg-black/95 flex flex-col overflow-hidden shrink-0">
        <div 
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 no-scrollbar overscroll-contain"
        >
        {messages.length === 0 && !isTyping && (
          <div className="py-12 text-center space-y-2">
            <Radio className="w-6 h-6 text-amber-400 animate-pulse mx-auto" />
            <p className="text-xs font-mono text-slate-400">Locking onto Holston Ridge satellite transponder...</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            <div 
              className="space-y-1.5 max-w-2xl transition-all duration-300"
              style={{
                animation: "fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {/* Sender Metadata Bar */}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-black relative shrink-0">
                  <Image
                    src={msg.sender.avatar}
                    alt={msg.sender.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <span className="font-black text-white text-xs sm:text-sm">
                  {msg.sender.name}
                </span>

                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${msg.sender.color}`}>
                  {msg.sender.callsign}
                </span>

                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                  {msg.sender.roleBadge}
                </span>

                <span className="text-[10px] font-mono text-slate-400 ml-auto sm:ml-0">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Body Bubble with subtle neon edge glow */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm hover:border-white/20 transition-all">
                <p>{msg.text}</p>

                {/* Dope Card Rich Visualizer */}
                {msg.dopeCard && (
                  <div className="mt-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 font-mono space-y-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center justify-between text-[11px] pb-1 border-b border-cyan-500/20">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{msg.dopeCard.stage}</span>
                      </span>
                      <span className="text-amber-400 font-bold">{msg.dopeCard.distance}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="bg-black/50 p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">ELEVATION</span>
                        <span className="text-white font-bold">{msg.dopeCard.elev}</span>
                      </div>
                      <div className="bg-black/50 p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">WIND HOLD</span>
                        <span className="text-amber-400 font-bold">{msg.dopeCard.wind}</span>
                      </div>
                      <div className="bg-black/50 p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">MUZZLE VEL</span>
                        <span className="text-white font-bold">{msg.dopeCard.velocity}</span>
                      </div>
                      <div className="bg-black/50 p-1.5 rounded-lg border border-white/5">
                        <span className="text-emerald-400 block text-[9px]">CONFIDENCE</span>
                        <span className="text-emerald-400 font-bold">{msg.dopeCard.hitProb}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INSTANT CLAIM YOUR INVITE BUBBLE: Rendered right after Allen's welcome message */}
            {index === 0 && showInterceptor && (
              <div 
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-black/85 to-amber-500/10 border-2 border-amber-400 shadow-tactical-glow space-y-2 my-1.5 transition-all"
                style={{
                  animation: "fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 fill-black" />
                        OFFICIAL SQUAD PASS
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        INVITATION ONLY
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                      CLAIM YOUR INVITATION &amp; ACTIVATE CALLSIGN
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-xl">
                      Squad slots for the 2026 Subsonic Invitational ($7,500 Cash Purse) are strictly limited. Claim your code below to unlock private comms and competitor clearance.
                    </p>
                  </div>

                  <div className="hidden sm:block shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-tactical-glow">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                  <Link
                    href="/invite"
                    className="flex-1 py-1.5 sm:py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-tactical-glow active:scale-95 transition-all text-center"
                  >
                    <Key className="w-3.5 h-3.5 fill-black" />
                    <span>CLAIM YOUR INVITE</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/chat"
                    className="py-1.5 sm:py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Member Login</span>
                  </Link>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Dynamic In-Line Typing Indicator right below latest message */}
        {isTyping && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono text-amber-400 max-w-sm animate-pulse">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>{typingName || "Competitor"} is keying mic...</span>
          </div>
        )}

        {/* Interactive Quick-Reply Prompt Chips embedded in stream */}
        <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
            PROMPTS:
          </span>

          <button
            type="button"
            onClick={() => handleQuickPrompt("DOPE")}
            className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Target className="w-3 h-3" />
            <span>Ask for Stage 8 DOPE</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPrompt("SQUAD")}
            className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Flame className="w-3 h-3" />
            <span>How Do I Squad Up?</span>
          </button>

          <Link
            href="/invitational"
            className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>2026 Invitational Packet</span>
          </Link>
        </div>
      </div>
    </div>

      {/* 3. Bottom Simulated Composer / Clearance Bar */}
      <div className="h-11 sm:h-12 relative w-full bg-[#0A0D14] px-3 sm:px-6 border-t border-white/10 flex items-center justify-between gap-2.5 shrink-0">
        <Link
          href="/chat"
          className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-amber-400/50 text-slate-400 hover:text-white transition-all text-[11px] font-mono group truncate"
        >
          <div className="flex items-center gap-2 truncate">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Membership by invitation only • Log in with credentials...</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold group-hover:underline shrink-0 ml-2">
            LOGIN / CLAIM →
          </span>
        </Link>

        <Link
          href="/invite"
          className="p-1.5 sm:p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-95 shadow-tactical-glow shrink-0 flex items-center justify-center"
          title="Claim Invitation Code"
        >
          <Key className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
