"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Radio, 
  Lock, 
  Unlock, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Crosshair, 
  Compass, 
  Wind,
  CheckCircle2,
  FileText,
  Flame,
  Award
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
  isSystemInterceptor?: boolean;
}

const INITIAL_MESSAGES_STREAM: TerminalMessage[] = [
  {
    id: "msg-1",
    sender: {
      name: "Wyatt Sterling",
      callsign: "GHOST",
      role: "PRO_COMPETITOR",
      roleBadge: "OPEN PRO #4",
      avatar: "/assets/subsonic-coin.jpg",
      color: "border-amber-400 text-amber-400 bg-amber-500/15",
    },
    text: "Wind just sheared off the north hollow—switched to 4.2 MPH @ 285°. Hold 0.7 MIL left on the 340-yard KYL diamond.",
    timestamp: "10:42 AM",
  },
  {
    id: "msg-2",
    sender: {
      name: "Kendra Cross",
      callsign: "COLDBORE",
      role: "TOP_LADY",
      roleBadge: "TOP LADY PRO",
      avatar: "/assets/subsonic-logo-dark.png",
      color: "border-purple-400 text-purple-300 bg-purple-500/15",
    },
    text: "Confirmed Ghost. Lapua Center-X lot 32187 holding dead-true vertical at 3,420 FT. Plate rang twice back-to-back.",
    timestamp: "10:43 AM",
  },
  {
    id: "msg-3",
    sender: {
      name: "Subsonic Sentinel",
      callsign: "AI-BALLISTICS",
      role: "AI_ASSISTANT",
      roleBadge: "SOLVER AI",
      avatar: "/assets/subsonic-coin.jpg",
      color: "border-cyan-400 text-cyan-300 bg-cyan-500/15",
    },
    text: "📡 [VERIFIED DOPE DROP] Atmospheric Density Altitude calculated at +2,150 FT. High mirage boiling horizontal.",
    timestamp: "10:43 AM",
    dopeCard: {
      stage: "Stage 4 • Diamond KYL",
      distance: "340 YARDS",
      elev: "8.4 MIL",
      wind: "L 0.7 MIL",
      velocity: "1,062 FPS",
      hitProb: "94% FIRST ROUND",
    },
  },
  {
    id: "msg-4",
    sender: {
      name: "Allen Hurley",
      callsign: "DIRECTOR",
      role: "MATCH_DIRECTOR",
      roleBadge: "EXECUTIVE / MD",
      avatar: "/assets/subsonic-logo-round.png",
      color: "border-emerald-400 text-emerald-300 bg-emerald-500/15",
    },
    text: "Squad 3 on deck at Barricade 6. Invitational purse stands at $7,500 cash. Range is HOT—run your stages clean, marksmen.",
    timestamp: "10:44 AM",
  },
];

export function HeroChatTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [customReplyCount, setCustomReplyCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat terminal to bottom on message update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Sequenced message delivery for cinematic "wow" effect
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    setMessages([]);

    const sequence = [
      { delay: 400, typingDelay: 600, msg: INITIAL_MESSAGES_STREAM[0], typingWho: "Wyatt 'Ghost' Sterling" },
      { delay: 2400, typingDelay: 700, msg: INITIAL_MESSAGES_STREAM[1], typingWho: "Kendra 'Coldbore' Cross" },
      { delay: 4800, typingDelay: 800, msg: INITIAL_MESSAGES_STREAM[2], typingWho: "Subsonic Sentinel AI" },
      { delay: 7400, typingDelay: 600, msg: INITIAL_MESSAGES_STREAM[3], typingWho: "Match Director Allen" },
    ];

    sequence.forEach(({ delay, typingDelay, msg, typingWho }) => {
      // Trigger typing indicator
      const typingTimer = setTimeout(() => {
        setIsTyping(true);
        setTypingName(typingWho);
      }, delay);
      timers.push(typingTimer);

      // Deliver message
      const msgTimer = setTimeout(() => {
        setIsTyping(false);
        setTypingName(null);
        setMessages((prev) => [...prev, msg]);
        if (soundEnabled) {
          if (msg.sender.role === "AI_ASSISTANT") {
            playBotTelemetryChirp();
          } else {
            playRealCommsChirp();
          }
        }
      }, delay + typingDelay);
      timers.push(msgTimer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [soundEnabled]);

  // Quick prompt interaction
  const handleQuickPrompt = (actionType: "DOPE" | "SQUAD" | "DOCS") => {
    if (actionType === "DOCS") {
      window.location.href = "/documents";
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
            avatar: "/assets/subsonic-coin.jpg",
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
        setCustomReplyCount((c) => c + 1);
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
        setCustomReplyCount((c) => c + 1);
        if (soundEnabled) playRealCommsChirp();
      }, 700);
    }
  };

  return (
    <div className="relative ios-glass-card rounded-3xl border-2 border-amber-500/40 shadow-tactical-glow overflow-hidden bg-gradient-to-b from-black/80 via-black/90 to-[#07090E] transition-all">
      {/* 1. HUD Telemetry Bar (Tactical Satellite & Radio Banner) */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-black/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-white font-black tracking-wider">STAGE NET</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold hidden sm:inline">FREQ: 462.5625 MHz</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-cyan-400 font-semibold hidden md:inline">3,420 FT ELEV</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>AES-256</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
            }`}
            title="Toggle Tactical Radio Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? "AUDIO ON" : "AUDIO MUTED"}</span>
          </button>

          <Link
            href="/chat"
            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] flex items-center gap-1 transition-all active:scale-95 shadow-tactical-glow"
          >
            <span>LIVE ROOM</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Messages Display Viewport */}
      <div 
        ref={scrollRef}
        className="p-4 sm:p-6 space-y-3.5 max-h-[380px] sm:max-h-[420px] overflow-y-auto no-scrollbar overscroll-contain"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="animate-fadeIn space-y-1.5 max-w-2xl"
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

              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${msg.sender.color}`}>
                {msg.sender.callsign}
              </span>

              <span className="text-[10px] font-mono text-slate-400">
                {msg.timestamp}
              </span>
            </div>

            {/* Message Body Bubble */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm">
              <p>{msg.text}</p>

              {/* Dope Card Rich Visualizer */}
              {msg.dopeCard && (
                <div className="mt-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 font-mono space-y-2">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-cyan-500/20">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{msg.dopeCard.stage}</span>
                    </span>
                    <span className="text-amber-400 font-bold">{msg.dopeCard.distance}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[9px]">ELEVATION</span>
                      <span className="text-white font-bold">{msg.dopeCard.elev}</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[9px]">WIND HOLD</span>
                      <span className="text-amber-400 font-bold">{msg.dopeCard.wind}</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[9px]">MUZZLE VEL</span>
                      <span className="text-white font-bold">{msg.dopeCard.velocity}</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[9px]">CONFIDENCE</span>
                      <span className="text-emerald-400 font-bold">{msg.dopeCard.hitProb}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-2 text-xs font-mono text-amber-400 animate-fadeIn">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>{typingName || "Competitor"} is keying mic...</span>
          </div>
        )}

        {/* 3. The Conversion Trigger: Guest Monitor Mode Interceptor */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-black/80 to-emerald-500/15 border-2 border-amber-400/70 shadow-glow space-y-3.5 my-2 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-black" />
                  GUEST MONITOR MODE ACTIVE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  COMMS LINK OPEN
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                CLAIM YOUR CALLSIGN &amp; JOIN THE CONVERSATION
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                You are monitoring squad radio in read-only mode. Claim your official marksman callsign, access private squad DOPE drops, and auto-generate your competitor profile card.
              </p>
            </div>

            <div className="hidden sm:block shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link
              href="/join"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Claim Callsign &amp; Join Society</span>
            </Link>

            <Link
              href="/chat"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Enter Competitor Comms</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Interactive Quick-Reply Prompt Chips */}
      <div className="px-4 sm:px-6 py-2.5 bg-black/50 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
          PROMPTS:
        </span>

        <button
          type="button"
          onClick={() => handleQuickPrompt("DOPE")}
          className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Target className="w-3 h-3" />
          <span>Ask for Stage 8 DOPE</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("SQUAD")}
          className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Flame className="w-3 h-3" />
          <span>How Do I Squad Up?</span>
        </button>

        <Link
          href="/documents"
          className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          <FileText className="w-3 h-3 text-amber-400" />
          <span>18-Stage COF Dossier</span>
        </Link>
      </div>

      {/* 5. Simulated Composer Bar at Bottom */}
      <div className="p-3 sm:p-4 bg-[#0A0D14] border-t border-white/10 flex items-center gap-2.5">
        <Link
          href="/join"
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-amber-400/50 text-slate-400 hover:text-white transition-all text-xs font-mono group"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Sign up to transmit on squad net...</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold group-hover:underline">
            GET PASS →
          </span>
        </Link>

        <Link
          href="/join"
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-95 shadow-tactical-glow shrink-0"
          title="Sign up to broadcast"
        >
          <Send className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
