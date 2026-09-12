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
  Unlock,
  Check,
  Target,
  Flame,
  Radio,
  Bot,
  Info,
  BadgeAlert,
  Volume2,
  VolumeX,
  Eye,
  X,
  Crosshair,
  Compass,
  Wind,
  Thermometer,
  Copy,
  Sliders,
  UserCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { ChatMessage, DopeCardData } from "@/lib/types";
import { evaluateChatMessage } from "@/lib/ai-moderator";
import { recordTelemetryEvent } from "@/lib/telemetry";
import { recordCommsAbuseAlert } from "@/lib/abuse-moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Tactical Network Definition
interface ChannelConfig {
  id: string;
  name: string;
  badge: string;
  desc: string;
  netType: "PUBLIC" | "PRO";
  activeUsers: number;
}

const ALL_CHANNELS: ChannelConfig[] = [
  // Competitor Pro Net
  {
    id: "bristol-pro-shootout",
    name: "bristol-pro-shootout",
    badge: "PRO SQUADS",
    desc: "Stage strategies, DOPE sharing, and ridge elevation calls",
    netType: "PRO",
    activeUsers: 48,
  },
  {
    id: "squad-briefings",
    name: "squad-briefings",
    badge: "SQUAD OPS",
    desc: "Staging times, rotation orders, and barricade pacing",
    netType: "PRO",
    activeUsers: 34,
  },
  {
    id: "match-day-alerts",
    name: "match-day-alerts",
    badge: "OFFICIAL MD",
    desc: "Priority match director broadcasts, cold ranges & hold calls",
    netType: "PRO",
    activeUsers: 92,
  },
  {
    id: "ro-disputes-appeals",
    name: "ro-disputes-appeals",
    badge: "RO CONTROL",
    desc: "Official target scoring challenges and stage rule inquiries",
    netType: "PRO",
    activeUsers: 16,
  },

  // Public Comms Net
  {
    id: "general-society",
    name: "general-society",
    badge: "OPEN NET",
    desc: "Precision rimfire community banter, travel, and range meetups",
    netType: "PUBLIC",
    activeUsers: 64,
  },
  {
    id: "ballistics-and-gear",
    name: "ballistics-and-gear",
    badge: "TECH TALK",
    desc: "Rifles, ammo lots, tuners, LabRadar data, and high-mag glass",
    netType: "PUBLIC",
    activeUsers: 51,
  },
  {
    id: "range-conditions-weather",
    name: "range-conditions-weather",
    badge: "WEATHER",
    desc: "Holston Mountain live crosswinds, mirage, DA & barometric updates",
    netType: "PUBLIC",
    activeUsers: 39,
  },
];

interface ShooterProfile {
  name: string;
  callsign: string;
  role: "PRO_COMPETITOR" | "MATCH_DIRECTOR" | "MEMBER";
  division: string;
  rifleSetup: string;
  badgeText: string;
}

const DEFAULT_PROFILE: ShooterProfile = {
  name: "Wyatt Sterling",
  callsign: "APEX-22",
  role: "PRO_COMPETITOR",
  division: "Open Division Pro",
  rifleSetup: "Vudoo V-22 / Bartlein MTU 20\" / ZCO 527",
  badgeText: "PRO SHOOTER",
};

function playTacticalChirp(frequency = 940) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // Silent fallback
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeNetTab, setActiveNetTab] = useState<"PRO" | "PUBLIC">("PRO");
  const [currentChannel, setCurrentChannel] = useState("bristol-pro-shootout");
  const [inputText, setInputText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shooter Profile State
  const [shooterProfile, setShooterProfile] = useState<ShooterProfile>(DEFAULT_PROFILE);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ShooterProfile>(DEFAULT_PROFILE);

  // Tactical DOPE Drop Modal State
  const [isDopeModalOpen, setIsDopeModalOpen] = useState(false);
  const [dopeFormData, setDopeFormData] = useState<DopeCardData>({
    targetDistance: "340 YDS",
    targetDescription: "Stage 4 • Diamond KYL Rack",
    elevationMils: "8.4 MIL",
    windHoldMils: "L 0.6 MIL",
    windVelocity: "9 MPH @ 260° WNW",
    ammo: "Lapua Center-X (1,062 FPS)",
    densityAltitude: "+2,150 FT",
    notes: "Hold left edge. Expect 0.2 mil vertical drop in canyon draw.",
  });

  // AI Moderation Inspection & Status
  const [inspectingMessage, setInspectingMessage] = useState<ChatMessage | null>(null);
  const [aiBlockedNotice, setAiBlockedNotice] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [copiedDopeId, setCopiedDopeId] = useState<string | null>(null);

  // Messages Container Ref (Used for internal container scrolling ONLY without moving the window)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Channels filtered by current active Net tab
  const visibleChannels = ALL_CHANNELS.filter((ch) => ch.netType === activeNetTab);
  const currentChannelData = ALL_CHANNELS.find((ch) => ch.id === currentChannel) || ALL_CHANNELS[0];
  const filteredMessages = messages.filter((m) => m.channelId === currentChannel);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("subsonic_shooter_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setShooterProfile(parsed);
          setProfileForm(parsed);
        }
      } catch {
        // Fallback to default
      }
    }
  }, []);

  // Dedicated container-only scroll that NEVER scrolls the outer window or jumps to the footer
  const scrollContainerToBottom = (smooth = true) => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll inner container to bottom only when switching channels
  useEffect(() => {
    scrollContainerToBottom(false);
  }, [currentChannel]);

  // Supabase Hydration & Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Initial fetch from cloud
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(120)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const cloudMsgs: ChatMessage[] = data.map((d: any) => ({
            id: d.id,
            channelId: d.channel_id,
            type: d.message_type || (d.dope_card ? "DOPE_DROP" : "STANDARD"),
            dopeCard: d.dope_card || undefined,
            author: {
              id: d.author_id,
              name: d.author_name,
              callsign: d.author_callsign,
              role: d.author_role,
              badgeText: d.author_badge,
              division: d.author_division,
              rifleSetup: d.author_rifle,
            },
            content: d.content,
            timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reactions: d.reactions || [],
            moderationStatus: d.moderation_status || "APPROVED",
            aiModerationReport: {
              toxicityScore: d.ai_toxicity_score || 0,
              threatScore: d.ai_threat_score || 0,
              policyScore: d.ai_policy_score || 0,
              sentiment: d.ai_sentiment || "NEUTRAL",
              flagReason: d.ai_flag_reason || undefined,
              aiEngine: d.ai_engine || "Google Gemini 2.5 Flash",
            },
          }));

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = cloudMsgs.filter((cm) => !existingIds.has(cm.id));
            return [...prev, ...fresh];
          });
        }
      });

    // Realtime changes
    const channel = supabase
      .channel("realtime-comms-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          const incoming: ChatMessage = {
            id: row.id,
            channelId: row.channel_id,
            type: row.message_type || (row.dope_card ? "DOPE_DROP" : "STANDARD"),
            dopeCard: row.dope_card || undefined,
            author: {
              id: row.author_id,
              name: row.author_name,
              callsign: row.author_callsign,
              role: row.author_role,
              badgeText: row.author_badge,
              division: row.author_division,
              rifleSetup: row.author_rifle,
            },
            content: row.content,
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reactions: row.reactions || [],
            moderationStatus: row.moderation_status || "APPROVED",
            aiModerationReport: {
              toxicityScore: row.ai_toxicity_score || 0,
              threatScore: row.ai_threat_score || 0,
              policyScore: row.ai_policy_score || 0,
              sentiment: row.ai_sentiment || "NEUTRAL",
              flagReason: row.ai_flag_reason || undefined,
              aiEngine: row.ai_engine || "Google Gemini 2.5 Flash",
            },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });

          // Scroll down inside container for new incoming message
          setTimeout(() => scrollContainerToBottom(true), 50);

          if (soundEnabled) {
            playTacticalChirp(1120);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [soundEnabled]);

  // Handle Transmitting Message (Standard or DOPE Card)
  const handleTransmit = async (content: string, type: "STANDARD" | "DOPE_DROP" = "STANDARD", dopeCard?: DopeCardData) => {
    if (!content.trim() && !dopeCard) return;

    setIsAiScanning(true);

    let evaluation: any = null;
    let aiEngine = "Google Gemini 2.5 Flash";

    // 1. Try server-side Gemini 2.5 Flash route
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content + (dopeCard ? ` [DOPE Card: ${dopeCard.targetDistance} ${dopeCard.notes || ""}]` : ""),
          authorRole: shooterProfile.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        evaluation = data.report;
        aiEngine = data.engine === "gemini-2.5-flash" ? "Google Gemini 2.5 Flash" : "Subsonic Neural Guard";
      }
    } catch {
      // Fallback to local rule engine
    }

    if (!evaluation) {
      evaluation = evaluateChatMessage(content, shooterProfile.role);
      aiEngine = "Subsonic Local Sentinel";
    }

    setIsAiScanning(false);

    // Track chat transmission telemetry
    recordTelemetryEvent({
      eventType: "action",
      targetElement: "chat_transmit",
      targetCategory: "Comms",
      pageRoute: "/chat",
      targetText: `Channel: ${currentChannel} | Net: ${activeNetTab} | Type: ${type} | AI: ${evaluation.status}`,
    });

    // Check if blocked
    if (evaluation.shouldBlock) {
      setAiBlockedNotice(evaluation.flagReason || "Transmission blocked by AI Safety Sentinel.");
      setTimeout(() => setAiBlockedNotice(null), 7000);

      // Report to Admin Abuse Telemetry Hub
      recordCommsAbuseAlert({
        severity: evaluation.threatScore > 75 || evaluation.policyScore > 90 ? "CRITICAL" : "HIGH",
        category: evaluation.policyScore > 90 ? "ILLEGAL_COMMERCE" : evaluation.threatScore > 70 ? "PHYSICAL_THREAT" : "HARASSMENT",
        shooterName: shooterProfile.name,
        shooterCallsign: shooterProfile.callsign,
        shooterRole: shooterProfile.role,
        squad: `Net: ${activeNetTab} • #${currentChannel}`,
        channel: currentChannel,
        messageContent: content,
        toxicityScore: evaluation.toxicityScore,
        threatScore: evaluation.threatScore,
        policyScore: evaluation.policyScore,
        aiRationale: evaluation.flagReason || "Violated Subsonic community safety protocols.",
        autoActionTaken: "Transmission dropped • IP & User flagged in Admin Console",
      });
      return;
    }

    if (evaluation.status === "FLAGGED") {
      recordCommsAbuseAlert({
        severity: "HIGH",
        category: "UNSPORTSMANLIKE",
        shooterName: shooterProfile.name,
        shooterCallsign: shooterProfile.callsign,
        shooterRole: shooterProfile.role,
        squad: `Net: ${activeNetTab} • #${currentChannel}`,
        channel: currentChannel,
        messageContent: content,
        toxicityScore: evaluation.toxicityScore,
        threatScore: evaluation.threatScore,
        policyScore: evaluation.policyScore,
        aiRationale: evaluation.flagReason || "Flagged for unverified or inflammatory conduct.",
        autoActionTaken: "Flagged with warning badge • Added to RO Review Queue",
      });
    }

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      channelId: currentChannel,
      type: type,
      dopeCard: dopeCard,
      author: {
        id: "usr_" + shooterProfile.callsign.toLowerCase(),
        name: shooterProfile.name,
        callsign: shooterProfile.callsign,
        role: shooterProfile.role,
        badgeText: shooterProfile.badgeText,
        division: shooterProfile.division,
        rifleSetup: shooterProfile.rifleSetup,
      },
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      moderationStatus: evaluation.status === "FLAGGED" ? "FLAGGED" : "APPROVED",
      aiModerationReport: {
        toxicityScore: evaluation.toxicityScore,
        threatScore: evaluation.threatScore,
        policyScore: evaluation.policyScore,
        sentiment: evaluation.sentiment,
        flagReason: evaluation.flagReason,
        aiEngine: aiEngine,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Smoothly scroll only within the container for user's own sent message
    setTimeout(() => scrollContainerToBottom(true), 50);

    // Persist to Supabase Cloud Database
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("chat_messages")
        .insert([
          {
            id: newMsg.id,
            channel_id: newMsg.channelId,
            message_type: newMsg.type,
            dope_card: newMsg.dopeCard,
            author_id: newMsg.author.id,
            author_name: newMsg.author.name,
            author_callsign: newMsg.author.callsign,
            author_role: newMsg.author.role,
            author_badge: newMsg.author.badgeText,
            author_division: newMsg.author.division,
            author_rifle: newMsg.author.rifleSetup,
            content: newMsg.content,
            moderation_status: newMsg.moderationStatus,
            ai_toxicity_score: newMsg.aiModerationReport?.toxicityScore || 0,
            ai_threat_score: newMsg.aiModerationReport?.threatScore || 0,
            ai_policy_score: newMsg.aiModerationReport?.policyScore || 0,
            ai_flag_reason: newMsg.aiModerationReport?.flagReason || null,
            ai_sentiment: newMsg.aiModerationReport?.sentiment || "NEUTRAL",
            ai_engine: aiEngine,
            reactions: newMsg.reactions,
            created_at: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) console.warn("Supabase persistence note:", error.message);
        });
    }

    if (soundEnabled) {
      playTacticalChirp(940);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleTransmit(inputText, "STANDARD");
  };

  const handleSendDopeCard = (e: React.FormEvent) => {
    e.preventDefault();
    const summaryText = `[DOPE CARD] Target: ${dopeFormData.targetDistance} • Dial: ${dopeFormData.elevationMils} • Wind Hold: ${dopeFormData.windHoldMils}`;
    handleTransmit(summaryText, "DOPE_DROP", dopeFormData);
    setIsDopeModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profileForm,
      badgeText:
        profileForm.role === "MATCH_DIRECTOR"
          ? "MATCH DIRECTOR"
          : profileForm.role === "PRO_COMPETITOR"
          ? profileForm.division.toUpperCase().includes("PRO") ? "OPEN PRO" : "PRO SHOOTER"
          : "MEMBER",
    };
    setShooterProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_shooter_profile", JSON.stringify(updated));
    }
    setIsProfileModalOpen(false);
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

  const copyDopeToClipboard = (msgId: string, dope: DopeCardData) => {
    const text = `🎯 SUBSONIC SOCIETY DOPE CARD\nTarget: ${dope.targetDistance} (${dope.targetDescription || ""})\nElevation: ${dope.elevationMils}\nWind Hold: ${dope.windHoldMils} (${dope.windVelocity || ""})\nAmmo: ${dope.ammo || ""}\nDA: ${dope.densityAltitude || ""}\nNotes: ${dope.notes || ""}`;
    navigator.clipboard.writeText(text);
    setCopiedDopeId(msgId);
    setTimeout(() => setCopiedDopeId(null), 2500);
  };

  const quickBroadcast = (text: string) => {
    setInputText(text);
  };

  return (
    <div data-section="chat" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* 1. TOP LIVE MOUNTAIN TELEMETRY & RANGE WEATHER BANNER */}
      <div className="ios-glass rounded-2xl p-4 border border-amber-500/20 shadow-tactical-glow flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Weather & Elevation Telemetry */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-bold tracking-wider">HOLSTON RIDGE TELEMETRY:</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>ELEV: <strong className="text-white">3,420 FT</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>WIND: <strong className="text-cyan-300">9-14 MPH @ 270° WNW</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span>TEMP: <strong className="text-white">64°F</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>DA: <strong className="text-emerald-300">+2,150 FT</strong></span>
          </div>
        </div>

        {/* Right: Quick Controls & Profile Pill */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
          {/* Audio Chirp Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 font-mono transition-colors ${
              soundEnabled
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 text-slate-400 border-white/10"
            }`}
            title="Toggle Tactical Radio Chirp"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{soundEnabled ? "Radio Audio ON" : "Muted"}</span>
          </button>

          {/* AI Sentinel Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Gemini 2.5 Flash Sentinel</span>
            <span className="sm:hidden">Gemini AI</span>
          </div>

          {/* Shooter Profile Button */}
          <button
            type="button"
            onClick={() => {
              setProfileForm(shooterProfile);
              setIsProfileModalOpen(true);
            }}
            data-telemetry="chat_edit_shooter_profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-500/40 hover:border-amber-400 transition-all text-xs group"
          >
            <div className="w-5 h-5 rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
              {shooterProfile.callsign.slice(0, 2)}
            </div>
            <span className="font-mono font-bold text-amber-300 group-hover:text-amber-200">
              {shooterProfile.callsign}
            </span>
            <Sliders className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. DUAL NETWORK TABS (PRO NET vs PUBLIC NET) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          {/* Pro Competitor Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveNetTab("PRO");
              if (!ALL_CHANNELS.filter(c => c.netType === "PRO").some(c => c.id === currentChannel)) {
                setCurrentChannel("bristol-pro-shootout");
              }
            }}
            data-telemetry="chat_switch_net_pro"
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeNetTab === "PRO"
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>COMPETITOR PRO NET</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeNetTab === "PRO" ? "bg-black/30 text-black font-extrabold" : "bg-white/10 text-slate-300"
            }`}>
              4 CHANNELS
            </span>
          </button>

          {/* Public Society Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveNetTab("PUBLIC");
              if (!ALL_CHANNELS.filter(c => c.netType === "PUBLIC").some(c => c.id === currentChannel)) {
                setCurrentChannel("general-society");
              }
            }}
            data-telemetry="chat_switch_net_public"
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeNetTab === "PUBLIC"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>PUBLIC COMMS NET</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeNetTab === "PUBLIC" ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
            }`}>
              3 CHANNELS
            </span>
          </button>
        </div>

        {/* Tactical Status Tag */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[11px]">ACCESS LEVEL:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            {activeNetTab === "PRO" ? "VERIFIED COMPETITOR (ENCRYPTED)" : "OPEN COMMUNITY (UNRESTRICTED)"}
          </span>
        </div>
      </div>

      {/* 3. MAIN COMMS MATRIX (CHANNELS SIDEBAR + MESSAGE STREAM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* LEFT COLUMN: Channels Sidebar & DOPE Preset Launcher (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="ios-glass rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                {activeNetTab === "PRO" ? "Pro Squad Channels" : "Society Channels"}
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {visibleChannels.reduce((acc, c) => acc + c.activeUsers, 0)} Active Shooters
              </span>
            </div>

            {/* Channels List */}
            <div className="space-y-2">
              {visibleChannels.map((ch) => {
                const isActive = currentChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setCurrentChannel(ch.id)}
                    data-telemetry={`chat_channel_${ch.id}`}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all border ${
                      isActive
                        ? "ios-glass bg-amber-500/15 border-amber-500/40 shadow-tactical-glow text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                        <span className={isActive ? "text-amber-400" : "text-slate-500"}>#</span>
                        <span>{ch.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"
                      }`}>
                        {ch.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {ch.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* DOPE Drop Action Box */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  Tactical DOPE Card
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Holston 340y Spec</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Broadcast target yardage, elevation dial, and wind hold directly into the channel.
              </p>
              <button
                type="button"
                onClick={() => setIsDopeModalOpen(true)}
                data-telemetry="chat_open_dope_modal"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Crosshair className="w-4 h-4" />
                <span>DROP VERIFIED DOPE CARD</span>
              </button>
            </div>

            {/* Quick Radio Call Presets */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                Quick Radio Transmissions:
              </span>
              <div className="flex flex-col gap-1.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => quickBroadcast("Impact confirmed on Stage 4 diamond! Center hold.")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 truncate"
                >
                  🎯 &ldquo;Impact confirmed on Stage 4!&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => quickBroadcast("Wind switch: Gusting 12mph from 3 o'clock across the draw.")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 truncate"
                >
                  💨 &ldquo;Wind switch: Gusting 12mph from 3 o'clock&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => quickBroadcast("Range is cold. Chamber flags in all rifles.")}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 truncate"
                >
                  🛑 &ldquo;Range is cold. Chamber flags in.&rdquo;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Stream & Transmitter Box (8 cols) */}
        <div className="lg:col-span-8 ios-glass rounded-3xl border border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Channel Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-amber-400 font-bold text-xl">#</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base">
                    {currentChannelData.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {currentChannelData.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {currentChannelData.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>COMMS LINK STABLE</span>
              </div>
            </div>
          </div>

          {/* Messages Stream: scrollable container ONLY without moving outer page */}
          <div
            ref={messagesContainerRef}
            className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto max-h-[560px] min-h-[420px]"
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
                const isMD = msg.author.role === "MATCH_DIRECTOR" || msg.type === "MATCH_ALERT";
                const isPro = msg.author.role === "PRO_COMPETITOR";
                const isDopeDrop = msg.type === "DOPE_DROP" || !!msg.dopeCard;
                const isFlagged = msg.moderationStatus === "FLAGGED";

                return (
                  <div
                    key={msg.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      isMD
                        ? "bg-gradient-to-r from-amber-950/40 to-black/60 border-amber-500/40 shadow-tactical-glow"
                        : isDopeDrop
                        ? "bg-black/60 border-cyan-500/30 shadow-lg"
                        : isFlagged
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Message Header: Author, Badge, Callsign, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                          isMD
                            ? "bg-amber-500 text-black border-amber-400"
                            : isDopeDrop
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                            : "bg-black/60 text-amber-400 border-white/10"
                        }`}>
                          {msg.author.callsign?.slice(0, 2) || "SS"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {msg.author.name}
                            </span>
                            {msg.author.callsign && (
                              <span className="text-xs font-mono text-amber-400 font-bold">
                                [{msg.author.callsign}]
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                                isMD
                                  ? "bg-amber-500 text-black font-extrabold"
                                  : isPro
                                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {msg.author.badgeText || msg.author.role}
                            </span>
                          </div>
                          {msg.author.rifleSetup && (
                            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[280px] sm:max-w-md">
                              Rig: {msg.author.rifleSetup}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Meta: AI Sentinel Inspector Button & Time */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <button
                          type="button"
                          onClick={() => setInspectingMessage(msg)}
                          data-telemetry="chat_inspect_sentinel"
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                          title="Inspect AI Neural Sentiment & Policy Breakdown"
                        >
                          <Eye className="w-2.5 h-2.5" />
                          <span>AI Sentinel</span>
                        </button>
                        <span>{msg.timestamp}</span>
                        {isFlagged ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            REVIEW
                          </span>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Standard Content */}
                    {msg.content && (
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {msg.content}
                      </p>
                    )}

                    {/* DEDICATED TACTICAL DOPE CARD RENDERER */}
                    {msg.dopeCard && (
                      <div className="p-4 rounded-2xl bg-black/80 border border-cyan-500/40 shadow-tactical-glow space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                          <div className="flex items-center gap-2 font-mono">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              VERIFIED BALLISTIC DOPE CARD
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                              {msg.dopeCard.targetDistance}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyDopeToClipboard(msg.id, msg.dopeCard!)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedDopeId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">DOPE COPIED!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>COPY DATA</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* DOPE Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase">ELEVATION</span>
                            <div className="text-sm font-bold text-amber-400">{msg.dopeCard.elevationMils}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase">WIND HOLD</span>
                            <div className="text-sm font-bold text-cyan-300">{msg.dopeCard.windHoldMils}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase">WIND SPEED</span>
                            <div className="text-xs font-semibold text-slate-200 truncate">{msg.dopeCard.windVelocity || "8-14 MPH"}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase">DENSITY ALT</span>
                            <div className="text-xs font-semibold text-emerald-300">{msg.dopeCard.densityAltitude || "+2,150 FT"}</div>
                          </div>
                        </div>

                        {/* Ammo & Notes */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 pt-1 gap-1">
                          {msg.dopeCard.ammo && (
                            <div>Ammo Lot: <strong className="text-slate-200">{msg.dopeCard.ammo}</strong></div>
                          )}
                          {msg.dopeCard.notes && (
                            <div className="text-cyan-300 italic sm:text-right">
                              &ldquo;{msg.dopeCard.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Flag Reason Notice */}
                    {isFlagged && msg.aiModerationReport?.flagReason && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                        <BadgeAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Moderation Alert:</strong> {msg.aiModerationReport.flagReason}
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      {msg.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          type="button"
                          onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                          className="px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10 text-xs text-slate-300 hover:border-amber-500/40 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-mono text-[10px] font-bold">{reaction.count}</span>
                        </button>
                      ))}

                      {/* Quick Reactions Palette */}
                      <div className="flex items-center gap-1 pl-2 border-l border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                        {["🎯", "🔥", "⛰️", "💡", "👏", "🏆"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="p-1 text-xs hover:scale-125 transition-transform"
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

          {/* AI Blocked Notice Banner */}
          {aiBlockedNotice && (
            <div className="p-3 bg-red-950/90 border-t border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1 font-medium">{aiBlockedNotice}</div>
            </div>
          )}

          {/* TRANSMITTER INPUT BAR */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/60 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Broadcast to #${currentChannelData.name} as [${shooterProfile.callsign}]...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => setIsDopeModalOpen(true)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 text-xs font-mono"
                title="Drop DOPE Card"
              >
                <Crosshair className="w-4 h-4" />
                <span className="hidden sm:inline">DOPE</span>
              </button>

              <button
                type="submit"
                disabled={isAiScanning}
                data-telemetry="chat_send_button"
                className="p-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:brightness-110 active:scale-95 transition-all shadow-tactical-glow flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
                title="Transmit message"
              >
                {isAiScanning ? (
                  <span className="animate-spin text-sm">⏳</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">TRANSMIT</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>Transmitting as: <strong className="text-slate-300">{shooterProfile.name} ({shooterProfile.callsign})</strong></span>
              <span>Protected by Google Gemini 2.5 Flash Sentinel</span>
            </div>
          </form>
        </div>
      </div>

      {/* 4. TACTICAL DOPE DROP BUILDER MODAL */}
      {isDopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-lg w-full border border-cyan-500/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Broadcast Ballistic DOPE Card
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transmits target parameters directly to #{currentChannelData.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDopeModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendDopeCard} className="space-y-4">
              {/* Target Distance & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Target Distance</label>
                  <input
                    type="text"
                    value={dopeFormData.targetDistance}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, targetDistance: e.target.value })}
                    placeholder="e.g. 340 YDS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Target / Stage Name</label>
                  <input
                    type="text"
                    value={dopeFormData.targetDescription}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, targetDescription: e.target.value })}
                    placeholder="e.g. Stage 4 Diamond KYL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Elevation & Wind Holds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-amber-400 font-bold">Elevation Dial / Hold</label>
                  <input
                    type="text"
                    value={dopeFormData.elevationMils}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, elevationMils: e.target.value })}
                    placeholder="e.g. 8.4 MIL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-cyan-400 font-bold">Wind Hold</label>
                  <input
                    type="text"
                    value={dopeFormData.windHoldMils}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, windHoldMils: e.target.value })}
                    placeholder="e.g. L 0.6 MIL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Wind Speed & Ammo Lot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Wind Speed & Vector</label>
                  <input
                    type="text"
                    value={dopeFormData.windVelocity}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, windVelocity: e.target.value })}
                    placeholder="e.g. 9 MPH @ 260° WNW"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Ammunition Lot</label>
                  <input
                    type="text"
                    value={dopeFormData.ammo}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, ammo: e.target.value })}
                    placeholder="e.g. Lapua Center-X (1,062 FPS)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Tactical Wind / Stage Notes</label>
                <textarea
                  rows={2}
                  value={dopeFormData.notes}
                  onChange={(e) => setDopeFormData({ ...dopeFormData, notes: e.target.value })}
                  placeholder="e.g. Watch for downdraft in canyon draw..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDopeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 shadow-tactical-glow flex items-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>TRANSMIT DOPE CARD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SHOOTER PROFILE CUSTOMIZER MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-md w-full border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Customize Shooter Profile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your tactical calls & badge across all channels
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Shooter Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-amber-400 font-bold">Tactical Callsign</label>
                <input
                  type="text"
                  value={profileForm.callsign}
                  onChange={(e) => setProfileForm({ ...profileForm, callsign: e.target.value.toUpperCase() })}
                  placeholder="e.g. APEX-22"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Competition Division</label>
                <select
                  value={profileForm.division}
                  onChange={(e) => setProfileForm({ ...profileForm, division: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="Open Division Pro">Open Division Pro</option>
                  <option value="Production Division">Production Division</option>
                  <option value="Senior Division 55+">Senior Division 55+</option>
                  <option value="Ladies Rimfire Pro">Ladies Rimfire Pro</option>
                  <option value="Junior Division">Junior Division</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Rifle & Optic Setup</label>
                <input
                  type="text"
                  value={profileForm.rifleSetup}
                  onChange={(e) => setProfileForm({ ...profileForm, rifleSetup: e.target.value })}
                  placeholder="e.g. Vudoo V-22 / Bartlein MTU / ZCO 527"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">System Role</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {(["PRO_COMPETITOR", "MATCH_DIRECTOR", "MEMBER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, role: r })}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        profileForm.role === r
                          ? "bg-amber-500 text-black font-bold border-amber-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {r === "PRO_COMPETITOR" ? "PRO" : r === "MATCH_DIRECTOR" ? "DIRECTOR" : "MEMBER"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 shadow-tactical-glow"
                >
                  SAVE PROFILE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. AI SENTINEL INSPECTION MODAL */}
      {inspectingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-md w-full border border-cyan-500/40 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Subsonic AI Sentinel Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingMessage(null)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1">
              <div className="text-[10px] font-mono text-slate-400">INSPECTED TRANSMISSION:</div>
              <div className="text-xs sm:text-sm text-white italic">&ldquo;{inspectingMessage.content}&rdquo;</div>
              <div className="text-[10px] text-slate-400 font-mono pt-1">
                Sender: {inspectingMessage.author.name} [{inspectingMessage.author.callsign || "COMMS"}] • {inspectingMessage.author.role}
              </div>
            </div>

            {/* Metric Bars */}
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Toxicity & Hostility Score</span>
                  <span className={`font-bold ${(inspectingMessage.aiModerationReport?.toxicityScore || 0) > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                    {inspectingMessage.aiModerationReport?.toxicityScore || 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(inspectingMessage.aiModerationReport?.toxicityScore || 0) > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(4, inspectingMessage.aiModerationReport?.toxicityScore || 0)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety & Threat Score</span>
                  <span className="text-emerald-400 font-bold">
                    {inspectingMessage.aiModerationReport?.threatScore || 0}% Threat
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "4%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Regulated Firearm Commerce Compliance</span>
                  <span className="text-emerald-400 font-bold">100% Policy Compliant</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="text-amber-400 font-bold">STATUS: {inspectingMessage.moderationStatus}</div>
              <div>Engine: <strong className="text-cyan-300">{inspectingMessage.aiModerationReport?.aiEngine || "Google Gemini 2.5 Flash"}</strong></div>
              <div>Sentiment: {inspectingMessage.aiModerationReport?.sentiment || "NEUTRAL"}</div>
              {inspectingMessage.aiModerationReport?.flagReason && (
                <div className="text-amber-300 mt-1">Notice: {inspectingMessage.aiModerationReport.flagReason}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectingMessage(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
