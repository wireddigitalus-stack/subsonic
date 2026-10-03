"use client";

import { ChatAuthGate } from "@/components/chat/ChatAuthGate";
import { ChatChannelSidebar } from "@/components/chat/ChatChannelSidebar";
import { ChatDopeCardModal } from "@/components/chat/ChatDopeCardModal";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ShooterDossierModal } from "@/components/chat/ShooterDossierModal";
import { ChatTermsModal } from "@/components/chat/ChatTermsModal";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
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
  Info,
  BadgeAlert,
  Volume2,
  VolumeX,
  X,
  Crosshair,
  Compass,
  Wind,
  Thermometer,
  Copy,
  Sliders,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Maximize2,
  Minimize2,
  QrCode,
  Pin,
  ChevronUp,
  Bell,
  CheckCircle2,
  Mic,
  Bot,
  Activity,
  Radar,
  Hash,
  LogOut
} from "lucide-react";
import { INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { ChatMessage, DopeCardData, DirectPartner } from "@/lib/types";
import { evaluateChatMessage } from "@/lib/ai-moderator";
import { recordTelemetryEvent } from "@/lib/telemetry";
import { recordCommsAbuseAlert } from "@/lib/abuse-moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";
import { analyzeMsgForPlink, buildPlinkMessage, getRoDirectAnswer } from "@/lib/plink-engine";
import { ChatTour } from "@/components/chat/ChatTour";
import { ChannelPickerModal } from "@/components/chat/ChannelPickerModal";
import { startBotEngine, BotSpeed, logBotActivity, subscribeToBotActivity } from "@/lib/chat-bots";
import { playRealCommsChirp, playBotTelemetryChirp, playTacticalChirp, unlockAudio } from "@/lib/chat-audio";
import { clearCommsAlert, incrementUnreadMessages } from "@/lib/comms-status";

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
  {
    id: "invitational",
    name: "invitational",
    badge: "2026 MATCH",
    desc: "The Hideout Invitational: Match Ops, Bristol Lodging, Food & Entertainment",
    netType: "PRO",
    activeUsers: 94,
  },
];

const INITIAL_DIRECT_PARTNERS: DirectPartner[] = [
  {
    id: "dm_ro",
    callsign: "RO BOT",
    name: "RO BOT",
    role: "OFFICIAL",
    badgeText: "AI Range Officer",
    division: "Autonomous AI Match Assistant",
    status: "online",
    bio: "Official Autonomous AI Assistant & Range Officer for The Hideout Invitational. Available 24/7 with expert intel on Bristol lodging, dining, match schedule, and cash side matches.",
    rifleSetup: "Autonomous AI Agent • Neural Match & Safety Telemetry",
    isBot: true,
  },
  {
    id: "dm_allen",
    callsign: "SAID DONE",
    name: "Allen Hurley",
    role: "OWNER_ADMIN",
    badgeText: "OWNER ADMIN",
    division: "Owner Admin / Executive",
    status: "online",
    bio: "Executive Match Host & Founder of The Hideout Invitational.",
    rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
  },
  {
    id: "dm_radar",
    callsign: "RADAR",
    name: "Rob Neilson",
    role: "MASTER_OWNER",
    badgeText: "MASTER ADMIN",
    division: "Master Admin",
    status: "online",
    bio: "Master Admin",
    rifleSetup: "Systems & Infrastructure Architecture (Non-Shooter)",
  },
];

interface ShooterProfile {
  name: string;
  callsign: string;
  role: "MASTER_OWNER" | "DEV_ADMIN" | "OWNER_ADMIN" | "ADMIN" | "MODERATOR" | "PRO_COMPETITOR" | "MATCH_DIRECTOR" | "OFFICIAL" | "VIP" | "MEMBER";
  division: string;
  rifleSetup: string;
  badgeText: string;
  image?: string;
}

const DEFAULT_PROFILE: ShooterProfile = {
  name: "Guest Competitor",
  callsign: "GUEST",
  role: "MEMBER",
  division: "Pro Invitational Division",
  rifleSetup: "Unclaimed Rig",
  badgeText: "SOCIETY GUEST",
};


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeNetTab, setActiveNetTab] = useState<"PRO" | "PUBLIC">("PRO");
  const [currentChannel, setCurrentChannel] = useState("invitational");
  const [inputText, setInputText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fullscreen / Handheld Immersive Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobileRef = useRef(false);

  // Shooter Profile State
  const [shooterProfile, setShooterProfile] = useState<ShooterProfile>(DEFAULT_PROFILE);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ShooterProfile>(DEFAULT_PROFILE);

  // Direct Comms (1-on-1 Closed Net) State
  const [directPartners, setDirectPartners] = useState<DirectPartner[]>(INITIAL_DIRECT_PARTNERS);
  const [selectedDossierShooter, setSelectedDossierShooter] = useState<DirectPartner | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const isDirectMode = currentChannel.startsWith("dm_");
  const activeDirectPartner = useMemo(() => {
    if (!isDirectMode) return null;
    const found = directPartners.find((p) => p.id === currentChannel);
    if (found) return found;
    const clean = currentChannel.replace("dm_", "").toUpperCase();
    return {
      id: currentChannel,
      callsign: clean,
      name: clean,
      role: "PRO_COMPETITOR" as const,
      badgeText: "COMPETITOR",
      status: "online" as const,
      bio: "Verified competitor on direct encrypted frequency.",
    };
  }, [currentChannel, directPartners, isDirectMode]);

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

  // Moderation Status Notice
  const [aiBlockedNotice, setAiBlockedNotice] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [copiedDopeId, setCopiedDopeId] = useState<string | null>(null);

  // Messages Container Ref for internal container-only scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active channel list (Invitational Official Comms)
  const visibleChannels = ALL_CHANNELS;
  const currentChannelData = useMemo(() => {
    if (isDirectMode && activeDirectPartner) {
      return {
        id: currentChannel,
        name: `dm: ${activeDirectPartner.callsign.toLowerCase()}`,
        badge: "ENCRYPTED",
        desc: `Closed-net direct transmission with ${activeDirectPartner.name} [${activeDirectPartner.callsign}]`,
        netType: "PRO" as const,
        activeUsers: 2,
      };
    }
    return ALL_CHANNELS.find((ch) => ch.id === currentChannel) || ALL_CHANNELS[0];
  }, [currentChannel, isDirectMode, activeDirectPartner]);

  const filteredMessages = messages
    .filter((m) => m.channelId === currentChannel)
    .filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id || (x.author.id === m.author.id && x.content === m.content && x.content.includes("Welcome to The Hideout"))) === idx);

  const handleOpenDossier = useCallback((shooter: DirectPartner) => {
    setSelectedDossierShooter(shooter);
    setIsDossierModalOpen(true);
    playTacticalChirp(1100);
  }, []);

  const handleStartDirectComms = useCallback((shooter: DirectPartner) => {
    setDirectPartners((prev) => {
      if (prev.some((p) => p.id === shooter.id)) return prev;
      return [shooter, ...prev];
    });
    setCurrentChannel(shooter.id);
    setIsDossierModalOpen(false);
    playTacticalChirp(1200);
  }, []);

  const handleBackToInvitational = useCallback(() => {
    setCurrentChannel("invitational");
    playTacticalChirp(900);
  }, []);

  // Channel engagement & post counters map (dynamic per-room transmission & reaction counts)
  const channelEngagementMap = useMemo(() => {
    const map: Record<string, { postCount: number; reactionCount: number; dopeCount: number }> = {};
    for (const ch of ALL_CHANNELS) {
      map[ch.id] = { postCount: 0, reactionCount: 0, dopeCount: 0 };
    }
    for (const m of messages) {
      if (!map[m.channelId]) {
        map[m.channelId] = { postCount: 0, reactionCount: 0, dopeCount: 0 };
      }
      map[m.channelId].postCount++;
      if (m.dopeCard || m.type === "DOPE_DROP") {
        map[m.channelId].dopeCount++;
      }
      if (m.reactions && m.reactions.length > 0) {
        map[m.channelId].reactionCount += m.reactions.reduce((acc, r) => acc + r.count, 0);
      }
    }
    return map;
  }, [messages]);

  const currentChannelEngagement = channelEngagementMap[currentChannel] || {
    postCount: filteredMessages.length,
    reactionCount: 0,
    dopeCount: 0,
  };

  // Private Chat Room Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginCallsign, setLoginCallsign] = useState("");
  const [loginPasscode, setLoginPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authShake, setAuthShake] = useState(false);

  // Member Credential & Digital Pass State
  const [profileActiveTab, setProfileActiveTab] = useState<"PASS" | "EDIT">("PASS");
  const [memberId, setMemberId] = useState<string>("SS-2026-1042");
  const [memberState, setMemberState] = useState<string>("TN");

  // Typing indicator — simulated composer pulse
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll-to-bottom FAB
  const [showScrollFab, setShowScrollFab] = useState(false);

  // Pinned announcement banner
  const [pinnedAnnouncement] = useState<string | null>(
    "🔴 MATCH DAY ACTIVE — Holston Ridge Stage 1 now open. Range COLD until 08:00. Chamber flags in."
  );
  const [announcementCollapsed, setAnnouncementCollapsed] = useState(true);

  // Unread counts per channel (channelId -> count)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const prevChannelRef = useRef(currentChannel);

  // iOS visual viewport height for keyboard avoidance
  const [chatHeight, setChatHeight] = useState<string>("calc(100dvh - 10rem)");

  // Plink AI Moderator state
  const [plinkWarningHistory, setPlinkWarningHistory] = useState<Record<string, number>>({});
  const allenWelcomedRef = useRef<Set<string>>(new Set());
  const roWelcomedRef = useRef<Set<string>>(new Set());
  const roTimerRef = useRef<NodeJS.Timeout | null>(null);
  // track last non-Plink message content per user for spam detection
  const lastUserMessageRef = useRef<Record<string, string>>({});

  // Live Mountain Weather Telemetry state
  const [liveWeather, setLiveWeather] = useState<{
    temp: number;
    humidity: number;
    pressureHpa: number;
    windSpeed: number;
    windGusts: number;
    windDirection: string;
    windDegrees: number;
    densityAltitude: number;
    condition: string;
    location: string;
    elevationFt: number;
    stationName: string;
    updatedAt: string;
    isLive: boolean;
  } | null>(null);

  // Cross-device sync timestamp tracker
  const lastSyncTimestampRef = useRef<number>(0);

  // Interactive Guided Chat Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  // Tactile Channel Picker Drawer state
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  // Terms of Use & Code of Conduct Modal state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Bot Engine State (controlled from Admin Console via localStorage sync)
  const [botsEnabled, setBotsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("subsonic_bots_enabled") === "true";
    }
    return false;
  });
  const [botSpeed, setBotSpeed] = useState<BotSpeed>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("subsonic_bots_speed") as BotSpeed) || "NORMAL";
    }
    return "NORMAL";
  });
  const [badActorEnabled, setBadActorEnabled] = useState(true);

  // Sync bot state across tabs if Admin toggles bots
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "subsonic_bots_enabled") {
        setBotsEnabled(e.newValue === "true");
      }
      if (e.key === "subsonic_bots_speed" && e.newValue) {
        setBotSpeed(e.newValue as BotSpeed);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const botCleanupRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages; // keep ref in sync
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const currentChannelRef = useRef(currentChannel);
  currentChannelRef.current = currentChannel;

  // Unified Bot Message Handler — captures telemetry and dispatches abuse alerts on guidelines violations
  const handleIncomingBotMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    logBotActivity(msg);

    // Fire mobile nav beacon when user isn't actively viewing chat
    if (typeof document !== "undefined" && document.hidden) {
      incrementUnreadMessages(1);
    }

    // If bot message violates conduct/guidelines, record live abuse alert for Admin Console
    if (
      msg.moderationStatus === "FLAGGED" ||
      (msg.aiModerationReport &&
        (msg.aiModerationReport.threatScore > 50 ||
          msg.aiModerationReport.policyScore > 70 ||
          msg.aiModerationReport.toxicityScore > 60))
    ) {
      const isCritical =
        (msg.aiModerationReport?.threatScore || 0) > 70 ||
        (msg.aiModerationReport?.policyScore || 0) > 90;
      const category =
        (msg.aiModerationReport?.policyScore || 0) > 90
          ? "ILLEGAL_COMMERCE"
          : (msg.aiModerationReport?.threatScore || 0) > 70
          ? "PHYSICAL_THREAT"
          : /bit\.ly|telegram|whatsapp|crypto|giveaway/i.test(msg.content)
          ? "SPAM_SOLICITATION"
          : "UNSPORTSMANLIKE";

      recordCommsAbuseAlert({
        severity: isCritical ? "CRITICAL" : "HIGH",
        category,
        shooterName: msg.author.name,
        shooterCallsign: msg.author.callsign || msg.author.name,
        shooterRole: msg.author.role,
        squad: `Bot Fleet • #${msg.channelId}`,
        channel: msg.channelId,
        messageContent: msg.content,
        toxicityScore: msg.aiModerationReport?.toxicityScore || 75,
        threatScore: msg.aiModerationReport?.threatScore || 25,
        policyScore: msg.aiModerationReport?.policyScore || 80,
        status: "ACTIVE",
        aiRationale:
          msg.aiModerationReport?.flagReason ||
          "Autonomous bad-actor bot violation flagged by AI Sentinel.",
        autoActionTaken: isCritical
          ? "Transmission Suppressed • Bad Actor Flagged in Admin Console"
          : "Flagged with Warning Badge • Placed into Match Director Queue",
      });
    }

    if (soundEnabledRef.current) {
      playBotTelemetryChirp();
    }

    // Auto-scroll if user is near bottom
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const c = messagesContainerRef.current;
        const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 200;
        if (nearBottom) {
          c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
        }
      }
    }, 100);
  }, []);

  // Bot Engine — start/stop based on toggle
  useEffect(() => {
    if (botsEnabled) {
      // Clean up previous engine if any
      if (botCleanupRef.current) botCleanupRef.current();

      const cleanup = startBotEngine(
        botSpeed,
        {
          addMessage: handleIncomingBotMessage,
          addReaction: (msgId, emoji) => {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== msgId) return m;
                const existing = m.reactions.find((r) => r.emoji === emoji);
                if (existing) {
                  return {
                    ...m,
                    reactions: m.reactions.map((r) =>
                      r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                    ),
                  };
                }
                return {
                  ...m,
                  reactions: [...m.reactions, { emoji, count: 1, users: ["bot"] }],
                };
              })
            );
          },
          getMessages: () => messagesRef.current,
          getCurrentChannel: () => currentChannelRef.current,
        },
        { enableBadActor: badActorEnabled }
      );

      botCleanupRef.current = cleanup;
    } else {
      if (botCleanupRef.current) {
        botCleanupRef.current();
        botCleanupRef.current = null;
      }
    }

    return () => {
      if (botCleanupRef.current) {
        botCleanupRef.current();
        botCleanupRef.current = null;
      }
    };
  }, [botsEnabled, botSpeed, badActorEnabled]);

  // Sync bot transmissions triggered from Admin console
  useEffect(() => {
    const unsub = subscribeToBotActivity((botLogs) => {
      if (!botLogs || botLogs.length === 0) return;
      const latest = botLogs[0];
      if (latest && !messagesRef.current.some((m) => m.id === latest.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === latest.id)) return prev;
          return [...prev, latest];
        });
      }
    });
    return unsub;
  }, []);

  // Tour is opt-in only — user can launch it via the TOUR button in the desktop toolbar

  // Auto-fullscreen on mobile — messenger-style clean experience
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      if (mobile) {
        setIsFullscreen(true);
      }
    }
  }, []);

  // Load profile, member credential, and auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAuth = localStorage.getItem("subsonic_chat_authenticated");
        setIsAuthenticated(savedAuth === "true");
        setAuthChecked(true);

        const saved = localStorage.getItem("subsonic_shooter_profile");
        let parsedShooter: any = null;
        if (saved) {
          try {
            parsedShooter = JSON.parse(saved);
            // Reconcile Rob Neilson (RADAR, LTDAN, or ROB)
            if (
              parsedShooter.callsign === "RADAR" ||
              parsedShooter.callsign === "LTDAN" ||
              parsedShooter.callsign === "ROB" ||
              (parsedShooter.name && parsedShooter.name.toLowerCase().includes("neilson"))
            ) {
              parsedShooter.member_id = "SS-2026-0001";
              parsedShooter.name = "Rob Neilson";
              parsedShooter.callsign = "RADAR";
              parsedShooter.role = "MASTER_OWNER";
              parsedShooter.division = "Master Admin";
              parsedShooter.badgeText = "MASTER ADMIN";
              parsedShooter.rifleSetup = "Systems & Infrastructure Architecture (Non-Shooter)";
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsedShooter));
                localStorage.setItem("subsonic_member_profile", JSON.stringify({
                  member_id: "SS-2026-0001",
                  full_name: "Rob Neilson",
                  callsign: "RADAR",
                  state: "TN",
                  experience_level: "Master Admin",
                  rifle_setup: "Systems & Infrastructure Architecture (Non-Shooter)",
                  created_at: "2026-07-04T12:00:00Z"
                }));
              } catch {}
            } else if (
              parsedShooter.callsign === "SAID DONE" ||
              parsedShooter.callsign === "SAIDDONE" ||
              parsedShooter.callsign === "ALLEN" ||
              parsedShooter.callsign === "AHURLEY" ||
              (parsedShooter.name && parsedShooter.name.toLowerCase().includes("hurley"))
            ) {
              parsedShooter.member_id = "SS-2026-0002";
              parsedShooter.name = "Allen Hurley";
              parsedShooter.role = "OWNER_ADMIN";
              parsedShooter.division = "Owner Admin / Executive";
              parsedShooter.badgeText = "OWNER ADMIN";
              parsedShooter.callsign = "SAID DONE";
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsedShooter));
                localStorage.setItem("subsonic_member_profile", JSON.stringify({
                  member_id: "SS-2026-0002",
                  full_name: "Allen Hurley",
                  callsign: "SAID DONE",
                  state: "TN",
                  experience_level: "Owner Admin / Executive",
                  rifle_setup: parsedShooter.rifleSetup || "Modacam Custom Precision V-22 / ZCO 527",
                  created_at: "2026-07-04T12:00:00Z"
                }));
              } catch {}
            }
            setShooterProfile(parsedShooter);
            setProfileForm(parsedShooter);
            if (parsedShooter.callsign) setLoginCallsign(parsedShooter.callsign);
          } catch {}
        }

        const savedMember = localStorage.getItem("subsonic_member_profile");
        if (savedMember) {
          const parsedMem = JSON.parse(savedMember);
          if (parsedMem.member_id) setMemberId(parsedMem.member_id);
          if (parsedMem.state) setMemberState(parsedMem.state);
        } else if (parsedShooter) {
          if (parsedShooter.member_id) {
            setMemberId(parsedShooter.member_id);
          } else {
            const hash = parsedShooter.callsign
              ? Math.abs(parsedShooter.callsign.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 1000))
              : 1042;
            setMemberId(`SS-2026-${(hash % 8999) + 1000}`);
          }
        }
      } catch {
        setIsAuthenticated(true);
        setAuthChecked(true);
      }
      // When user enters chat room, clear green unread messages indicator
      clearCommsAlert("green");
    }
  }, []);

  // ── Live Mountain Weather Telemetry ─────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setLiveWeather(data);
        }
      } catch (err) {
        // silent fallback
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 3 * 60 * 1000); // 3 minutes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Cross-Device Real-Time Chat Sync via Server Storage ─────────────────────
  // Syncs messages across devices (Rob on Mac, Allen on iPhone, competitors)
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const syncMessages = async () => {
      try {
        const since = lastSyncTimestampRef.current;
        const url = `/api/chat/messages?channel=${encodeURIComponent(currentChannel)}${since ? `&since=${since}` : "&limit=60"}`;
        const res = await fetch(url);
        if (!res.ok || !isMounted) return;
        const data = await res.json();

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newIncoming = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newIncoming.length === 0) return prev;

            // Chirp for incoming messages from other marksmen
            const hasExternalMsg = newIncoming.some(
              (m: ChatMessage) => m.author.callsign?.toUpperCase() !== shooterProfile.callsign?.toUpperCase()
            );
            if (hasExternalMsg && soundEnabledRef.current) {
              playRealCommsChirp();
            }

            return [...prev, ...newIncoming];
          });

          if (data.latestTimestamp > lastSyncTimestampRef.current) {
            lastSyncTimestampRef.current = data.latestTimestamp;
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("subsonic_last_read_chat", Date.now().toString());
          }
        }
      } catch {
        // silent
      }
    };

    // Immediate initial sync on channel switch
    syncMessages();

    // Fast polling loop for near-instant cross-device comms
    const pollInterval = setInterval(syncMessages, 2500);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [currentChannel, isAuthenticated, shooterProfile.callsign]);

  // ── Channel Welcome: Allen + Delayed RO BOT ────────────────────────────────
  // Allen's welcome fires immediately upon authenticated entry.
  // RO BOT's condensed welcome fires after reading delay (~4.5s) with document packet link.
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !shooterProfile.callsign) return;

    // No welcomes in direct / private chats
    if (currentChannel.startsWith("dm_")) return;

    // 1. Allen's welcome — fires immediately
    if (!allenWelcomedRef.current.has(currentChannel)) {
      allenWelcomedRef.current.add(currentChannel);

      const now = new Date();
      const allenTimestamp = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

      const allenMsg: ChatMessage = {
        id: `welcome-allen-${currentChannel}`,
        channelId: currentChannel,
        type: "STANDARD",
        author: {
          id: "user-allen",
          name: "Allen Hurley",
          callsign: "SAID DONE",
          role: "OWNER_ADMIN",
          badgeText: "FOUNDER",
          division: "Executive / Match Host",
          rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
        },
        content: "Welcome to The Hideout, competitors. Two hundred and twenty acres of Tennessee ridgeline purpose-built for precision rimfire. Enjoy the chat, respect the range, and check the competitor packet for match details. Said. Done.",
        timestamp: allenTimestamp,
        reactions: [],
        moderationStatus: "APPROVED",
        aiModerationReport: { toxicityScore: 0, threatScore: 0, policyScore: 0, sentiment: "POSITIVE" as const, aiEngine: "System" },
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === allenMsg.id || (m.author.id === "user-allen" && m.channelId === currentChannel && m.content.includes("Welcome to The Hideout")))) {
          return prev;
        }
        return [...prev, allenMsg];
      });
    }

    // 2. RO BOT's welcome — fires after ~4.5 seconds (natural reading time)
    if (!roWelcomedRef.current.has(currentChannel)) {
      if (roTimerRef.current) {
        clearTimeout(roTimerRef.current);
      }

      const targetChannel = currentChannel;
      roTimerRef.current = setTimeout(() => {
        // Ensure user is still on the same channel
        if (currentChannelRef.current !== targetChannel) return;

        roWelcomedRef.current.add(targetChannel);
        const roTime = new Date();
        const roTimestamp = roTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        const roMsg: ChatMessage = {
          id: `welcome-ro-${targetChannel}`,
          channelId: targetChannel,
          type: "STANDARD",
          author: {
            id: "plink_ai_moderator",
            name: "RO BOT",
            callsign: "RO BOT",
            role: "AI_MODERATOR",
            badgeText: "AI Range Officer",
            division: "Autonomous AI Assistant • The Hideout",
            rifleSetup: "Autonomous AI Agent • Match Ops & Safety Telemetry",
          },
          content: `🤖 I'm RO BOT, your AI Range Officer. I have intel on the match schedule, The Hideout facility, Bristol dining & hotels (head to 620 State St for great steaks & sushi!), and side match details. Ask me anything — say 'hey ro' or '@ro help' anytime.\n\n📖 Competitor Packet: https://subsonic-omega.vercel.app/competitor-packet`,
          timestamp: roTimestamp,
          reactions: [],
          moderationStatus: "APPROVED",
          aiModerationReport: { toxicityScore: 0, threatScore: 0, policyScore: 0, sentiment: "POSITIVE" as const, aiEngine: "Autonomous AI Agent RO" },
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === roMsg.id || (m.author.id === "plink_ai_moderator" && m.channelId === targetChannel && m.content.includes("RO BOT")))) {
            return prev;
          }
          return [...prev, roMsg];
        });

        try {
          playTacticalChirp(900);
        } catch {}
      }, 4500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, isAuthenticated, authChecked]);

  // ── RO: Message & Direct Comms Watcher ────────────────────────────────────
  // Fires on every new message. RO monitors both public frequency and direct chats
  // for safety violations, code of conduct, and inquiries.
  useEffect(() => {
    if (!isAuthenticated) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;
    // Never react to our own messages
    if (lastMsg.author.id === "plink_ai_moderator") return;
    // Only respond to messages in the currently viewed channel
    if (lastMsg.channelId !== currentChannel) return;
    // If in 1-on-1 with RO, handleTransmit already provides RO's direct reply
    if (currentChannel === "dm_ro") return;

    const isDirect = currentChannel.startsWith("dm_");
    const lastContent = lastUserMessageRef.current[lastMsg.author.id];
    const response = analyzeMsgForPlink(lastMsg, plinkWarningHistory, lastContent, isDirect);

    // Update the last message ref for spam detection
    lastUserMessageRef.current[lastMsg.author.id] = lastMsg.content;

    if (!response) return;

    // Natural delay — feels like Plink is reading and thinking
    const delay = 1500 + Math.random() * 1000;
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        buildPlinkMessage(response.content, currentChannel, response.warningTier),
      ]);

      if (soundEnabledRef.current) {
        playTacticalChirp(response.warningTier >= 2 ? 800 : 1200);
      }

      // Update warning count for this user
      if (response.warningTier > 0) {
        setPlinkWarningHistory((prev) => ({
          ...prev,
          [lastMsg.author.id]: (prev[lastMsg.author.id] || 0) + 1,
        }));
      }

      // Escalate to admin abuse log if needed
      if (response.shouldEscalate) {
        recordCommsAbuseAlert({
            severity: response.warningTier >= 3 ? "CRITICAL" : "HIGH",
            category:
              response.violationType === "FIREARM_SALE"
                ? "ILLEGAL_COMMERCE"
                : response.violationType === "HARASSMENT"
                ? "PHYSICAL_THREAT"
                : response.violationType === "COMMERCIAL"
                ? "SPAM_SOLICITATION"
                : "UNSPORTSMANLIKE",
            shooterName: lastMsg.author.name,
            shooterCallsign: lastMsg.author.callsign || lastMsg.author.name,
            shooterRole: lastMsg.author.role,
            squad: lastMsg.channelId,
            channel: lastMsg.channelId,
            messageContent: lastMsg.content,
            toxicityScore: response.warningTier * 30,
            threatScore: response.violationType === "HARASSMENT" ? 85 : 20,
            policyScore: 90,
            status: "ACTIVE",
            aiRationale: `Plink detected: ${response.violationType}`,
            autoActionTaken: `Tier ${response.warningTier} warning issued in chat`,
          });
      }
    }, delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAuthenticated]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // iOS visual viewport keyboard avoidance — scroll messages up when keyboard opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = (window as any).visualViewport;
    if (!vv) return;
    let prevHeight = vv.height;
    const handleResize = () => {
      const vh = vv.height;
      const windowH = window.innerHeight;
      const keyboardOpen = vh < windowH * 0.85;
      if (keyboardOpen) {
        setChatHeight(`${vh}px`);
        // Keyboard just opened — scroll messages to bottom so replies are visible
        if (vh < prevHeight) {
          requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          });
        }
      } else {
        setChatHeight("calc(100dvh - 10rem)");
      }
      prevHeight = vh;
    };
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  // Dedicated container-only scroll that NEVER scrolls the outer window or jumps to footer
  const scrollContainerToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const targetTop = container.scrollHeight;
      if (smooth) {
        container.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      } else {
        container.scrollTop = targetTop;
      }
    }
  }, []);

  // Scroll FAB — show when user scrolls up, hide when at bottom
  const handleContainerScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollFab(distanceFromBottom > 120);
  };

  // Clear unread when switching to a channel; track prev channel for unread
  useEffect(() => {
    if (prevChannelRef.current !== currentChannel) {
      setUnreadCounts((prev) => ({ ...prev, [currentChannel]: 0 }));
      prevChannelRef.current = currentChannel;
      scrollContainerToBottom(false);
    }
  }, [currentChannel, scrollContainerToBottom]);

  // Scroll inner container to bottom only when switching channels (initial)
  useEffect(() => {
    scrollContainerToBottom(false);
  }, [scrollContainerToBottom]);

  // Auto-scroll upward whenever a new message arrives so the bubble is fully visible above the text field
  const lastMessage = filteredMessages[filteredMessages.length - 1];
  const lastMessageId = lastMessage?.id;
  useEffect(() => {
    if (!lastMessageId) return;

    // Trigger upward smooth scroll across frames so chat bubble is 100% visible above text field
    const frame = requestAnimationFrame(() => {
      scrollContainerToBottom(true);
    });
    const t1 = setTimeout(() => scrollContainerToBottom(true), 60);
    const t2 = setTimeout(() => scrollContainerToBottom(true), 220);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lastMessageId, currentChannel, scrollContainerToBottom]);

  // Maintain scroll pinning to bottom when keyboard/viewport resizes or typing indicator toggles
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom < 160) {
        scrollContainerToBottom(false);
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [scrollContainerToBottom]);



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
            type: d.content?.startsWith("[DOPE DROP]") ? "DOPE_DROP" : (d.message_type || "STANDARD"),
            dopeCard: d.dope_card || undefined,
            author: {
              id: d.author_id,
              name: d.author_name || "Verified Marksman",
              callsign: d.author_callsign || "MARKSMAN",
              role: d.author_role || "MEMBER",
              badgeText: d.author_badge || "MEMBER",
              division: d.author_division || "Open Division Pro",
              rifleSetup: d.author_rifle || "Custom Precision Rimfire",
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
            type: row.content?.startsWith("[DOPE DROP]") ? "DOPE_DROP" : (row.message_type || "STANDARD"),
            dopeCard: row.dope_card || undefined,
            author: {
              id: row.author_id,
              name: row.author_name || "Verified Marksman",
              callsign: row.author_callsign || "MARKSMAN",
              role: row.author_role || "MEMBER",
              badgeText: row.author_badge || "MEMBER",
              division: row.author_division || "Open Division Pro",
              rifleSetup: row.author_rifle || "Custom Precision Rimfire",
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

          // Track unread count for channels user isn't currently viewing
          const container = messagesContainerRef.current;
          const distanceFromBottom = container
            ? container.scrollHeight - container.scrollTop - container.clientHeight
            : 0;
          const isAtBottom = distanceFromBottom < 120;

          if (isAtBottom) {
            setTimeout(() => scrollContainerToBottom(true), 50);
          } else {
            // Increment unread badge for the incoming channel if not active
            setUnreadCounts((prev) => ({
              ...prev,
              [incoming.channelId]: (prev[incoming.channelId] || 0) + 1,
            }));
          }

          if (soundEnabled) {
            const isBot = incoming.author.id.startsWith("bot-") || incoming.author.id.startsWith("bot_") || incoming.author.role === "AI_MODERATOR";
            if (isBot) {
              playBotTelemetryChirp();
            } else {
              playRealCommsChirp();
            }
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
      targetText: `Channel: ${currentChannel} | Net: ${activeNetTab} | Type: ${type} | Status: ${evaluation.status}`,
    });

    // Check if blocked
    if (evaluation.shouldBlock) {
      setAiBlockedNotice(evaluation.flagReason || "Transmission blocked: Flagged by Range Safety Marshals.");
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

    // Persist to Supabase Cloud Database (Strictly Schema-Aligned)
    if (isSupabaseConfigured && supabase) {
      const payloadContent = newMsg.dopeCard
        ? `[DOPE DROP] 🎯 Target: ${newMsg.dopeCard.targetDistance} (${newMsg.dopeCard.targetDescription || ""}) | Elev: ${newMsg.dopeCard.elevationMils} | Wind: ${newMsg.dopeCard.windHoldMils} (${newMsg.dopeCard.windVelocity || ""}) | Ammo: ${newMsg.dopeCard.ammo || ""}\n${newMsg.content || ""}`.trim()
        : newMsg.content;

      supabase
        .from("chat_messages")
        .insert([
          {
            id: newMsg.id,
            channel_id: newMsg.channelId,
            author_id: newMsg.author.id,
            author_name: newMsg.author.name,
            author_callsign: newMsg.author.callsign,
            author_role: newMsg.author.role,
            author_badge: newMsg.author.badgeText,
            content: payloadContent,
            moderation_status: newMsg.moderationStatus,
            ai_toxicity_score: Math.round((newMsg.aiModerationReport?.toxicityScore || 0) * 100),
            ai_threat_score: Math.round((newMsg.aiModerationReport?.threatScore || 0) * 100),
            ai_policy_score: Math.round((newMsg.aiModerationReport?.policyScore || 0) * 100),
            ai_flag_reason: newMsg.aiModerationReport?.flagReason || null,
            ai_sentiment: newMsg.aiModerationReport?.sentiment || "NEUTRAL",
            reactions: newMsg.reactions || [],
            created_at: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) {
            console.error("Supabase live chat persistence error:", error.message);
          } else {
            console.log("Supabase: chat message saved live to cloud database.");
          }
        });
    }

    // Persist to server-backed durable storage (enables cross-device sync)
    fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMsg }),
    }).catch((err) => console.warn("Chat server persist warning:", err));

    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_last_read_chat", Date.now().toString());
    }

    if (soundEnabled) {
      playRealCommsChirp();
    }
    // Haptic feedback on send (Android/PWA)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Direct Comms Auto-Responses (Simulated Real-Time Point-to-Point Net)
    if (currentChannel === "dm_ro") {
      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const roText = getRoDirectAnswer(content, shooterProfile.callsign);
        const roMsg = buildPlinkMessage(roText, "dm_ro", 0);
        setMessages((prev) => [...prev, roMsg]);
        if (soundEnabledRef.current) {
          playTacticalChirp(1200);
        }
        setTimeout(() => scrollContainerToBottom(true), 50);
      }, delay);
    }
    // Direct messages to real marksmen/admins (e.g. Allen Hurley / SAID DONE) do not have simulated auto-replies.
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim()) {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
    } else {
      setIsTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    handleTransmit(inputText, "STANDARD");
  };

  const handleSendDopeCard = (e: React.FormEvent) => {
    e.preventDefault();
    const summaryText = `[DOPE CARD] Target: ${dopeFormData.targetDistance} • Dial: ${dopeFormData.elevationMils} • Wind Hold: ${dopeFormData.windHoldMils}`;
    handleTransmit(summaryText, "DOPE_DROP", dopeFormData);
    setIsDopeModalOpen(false);
  };

  // Push-to-Talk voice input
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handlePushToTalk = useCallback(() => {
    const SpeechRecognition =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

    if (!SpeechRecognition) {
      alert("Voice input isn't supported on this browser. Try Chrome or Safari.");
      return;
    }

    // If already listening — stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + " " + transcript : transcript));
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const isMasterOwner =
      profileForm.role === "MASTER_OWNER" ||
      profileForm.callsign === "RADAR" ||
      profileForm.callsign === "ROB" ||
      profileForm.callsign === "LTDAN" ||
      (profileForm.name && profileForm.name.toLowerCase().includes("neilson"));

    const updated = {
      ...profileForm,
      role: isMasterOwner ? "MASTER_OWNER" : profileForm.role,
      division: isMasterOwner
        ? profileForm.division || "Master Admin"
        : profileForm.division,
      rifleSetup: isMasterOwner
        ? profileForm.rifleSetup || "Systems & Infrastructure Architecture (Non-Shooter)"
        : profileForm.rifleSetup,
      badgeText: isMasterOwner
        ? "MASTER ADMIN"
        : profileForm.role === "MASTER_OWNER" || profileForm.role === "DEV_ADMIN"
        ? "MASTER ADMIN"
        : profileForm.role === "OWNER_ADMIN"
        ? "OWNER ADMIN"
        : profileForm.role === "ADMIN"
        ? "ADMIN"
        : profileForm.role === "MODERATOR"
        ? "MODERATOR"
        : profileForm.role === "MATCH_DIRECTOR"
        ? "MATCH DIRECTOR"
        : profileForm.role === "OFFICIAL"
        ? "OFFICIAL"
        : profileForm.role === "PRO_COMPETITOR"
        ? profileForm.division.toUpperCase().includes("PRO") ? "OPEN PRO" : "PRO SHOOTER"
        : "MEMBER",
    };
    setShooterProfile(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("subsonic_shooter_profile", JSON.stringify(updated));
        if (isMasterOwner) {
          const mem = localStorage.getItem("subsonic_member_profile");
          const parsed = mem ? JSON.parse(mem) : {};
          localStorage.setItem(
            "subsonic_member_profile",
            JSON.stringify({
              ...parsed,
              member_id: "SS-2026-0001",
              full_name: updated.name,
              callsign: updated.callsign,
              experience_level: updated.division,
              rifle_setup: updated.rifleSetup,
            })
          );
        }
      } catch {}
    }
    // Show saved confirmation then close
    setProfileSaved(true);
    playTacticalChirp(1200);
    setTimeout(() => {
      setProfileSaved(false);
      setIsProfileModalOpen(false);
    }, 1500);
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

  const triggerAuthError = (msg: string) => {
    setAuthError(msg);
    setAuthShake(true);
    setTimeout(() => setAuthShake(false), 600);
    playTacticalChirp(300);
  };
  const handleUnlockRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCallsign.trim()) {
      triggerAuthError("Callsign required to access the private net.");
      return;
    }

    try {
      const res = await fetch("/api/chat/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign: loginCallsign.trim(),
          pin: loginPasscode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        triggerAuthError(data.error || "Invalid Callsign, Member Key or PIN. If you have an invite code, click 'Claim Member Code' below.");
        return;
      }

      const profile: ShooterProfile = {
        name: data.profile.name,
        callsign: data.profile.callsign,
        role: data.profile.role,
        division: data.profile.division,
        rifleSetup: data.profile.rifleSetup,
        badgeText: data.profile.badgeText,
        image: data.profile.image,
      };

      if (data.member) {
        setMemberId(data.member.member_id);
        setMemberState(data.member.state || "TN");
      }

      setShooterProfile(profile);
      setProfileForm(profile);
      setAuthError(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_shooter_profile", JSON.stringify(profile));
          if (data.member) {
            localStorage.setItem("subsonic_member_profile", JSON.stringify(data.member));
          }
          localStorage.setItem("subsonic_chat_authenticated", "true");
        } catch {
          // Fallback
        }
      }
      setIsAuthenticated(true);
      playTacticalChirp(1200);
    } catch (err) {
      triggerAuthError("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("subsonic_chat_authenticated");
        localStorage.removeItem("subsonic_shooter_profile");
        localStorage.removeItem("subsonic_member_profile");
      } catch (e) {
        console.warn("Failed to clear chat authentication from storage:", e);
      }
    }
    setIsAuthenticated(false);
    setShooterProfile(DEFAULT_PROFILE);
    setProfileForm(DEFAULT_PROFILE);
    setLoginCallsign("");
    setLoginPasscode("");
    setIsProfileModalOpen(false);
    playTacticalChirp(400);
  };


  // If not authenticated, render the Private Chat Room Gate
  if (authChecked && !isAuthenticated) {
    return (
      <ChatAuthGate
        authShake={authShake}
        authError={authError}
        loginCallsign={loginCallsign}
        setLoginCallsign={setLoginCallsign}
        loginPasscode={loginPasscode}
        setLoginPasscode={setLoginPasscode}
        handleUnlockRoom={handleUnlockRoom}
      />
    );
  }

  return (
    <div
      data-section="chat"
      className={
        isFullscreen
          ? "fixed inset-0 z-[60] bg-[#07090E] p-0 md:p-4 flex flex-col h-[100dvh] w-full max-w-full overflow-hidden overflow-x-hidden animate-fadeIn"
          : "flex flex-col h-full w-full max-w-full overflow-hidden overflow-x-hidden bg-[#07090E]"
      }
    >
      {/* 1. TOP LIVE MOUNTAIN TELEMETRY & RANGE WEATHER BANNER */}
      {!isFullscreen ? (
        <div className="shrink-0 px-2 sm:px-4 lg:px-6 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:pt-3">
        <div className="ios-glass rounded-2xl p-2 sm:p-3 border border-white/10">
          {/* Mobile Top Bar: Tactical Breadcrumbs + Quick Hub Switcher + Callsign + Actions */}
          <div className="flex sm:hidden items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 min-w-0">
              {/* Tactical Breadcrumb Trail: Direct Home Back Navigation */}
              <Link
                href="/"
                title="Return to Main Portal"
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 active:scale-95 transition-all shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400 -mr-0.5" />
                <span className="font-extrabold text-[11px] text-slate-200">HOME</span>
                <span className="text-white/30 text-[10px]">/</span>
                <span className="text-amber-400 font-extrabold text-[11px]">CHAT ROOM</span>
              </Link>

              {/* Shooter Callsign & Pass Pill */}
              <button
                id="tour-step-pass"
                type="button"
                onClick={() => {
                  setProfileForm(shooterProfile);
                  setProfileActiveTab("PASS");
                  setIsProfileModalOpen(true);
                }}
                data-telemetry="chat_mobile_view_pass"
                className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-black/60 border border-amber-500/40 text-xs min-w-0 shrink"
                title="View Shooter Pass"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 overflow-hidden ${
                  shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                    ? "bg-blue-800 text-cyan-200 ring-1 ring-cyan-400"
                    : shooterProfile.callsign === "SAID DONE" || shooterProfile.callsign === "ALLEN" || shooterProfile.role === "OWNER_ADMIN"
                    ? "bg-emerald-500 text-black font-black ring-1 ring-emerald-300"
                    : "bg-amber-500 text-black font-bold"
                }`}>
                  {shooterProfile.image ? (
                    <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                  ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                    <Radar className="w-2.5 h-2.5 text-cyan-300 stroke-[2.5]" />
                  ) : shooterProfile.callsign === "SAID DONE" || shooterProfile.callsign === "ALLEN" || shooterProfile.role === "OWNER_ADMIN" ? (
                    "A"
                  ) : (
                    shooterProfile.callsign.slice(0, 2)
                  )}
                </div>
                <span className={`font-mono font-bold text-[10px] truncate max-w-[62px] ${
                  shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                    ? "text-cyan-300"
                    : "text-amber-300"
                }`}>
                  {shooterProfile.callsign}
                </span>
                <QrCode className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              </button>
            </div>

            {/* Mobile Actions: Shooter Profiles, Terms, Fullscreen, Audio, Lock */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/shooters"
                className="h-7 px-2 rounded-lg bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                title="View Full Shooter Profiles"
              >
                <Users className="w-3 h-3 text-purple-400 shrink-0" />
                <span>PROFILES</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsTermsModalOpen(true);
                  playTacticalChirp(1100);
                }}
                className="h-7 w-7 rounded-lg bg-black/50 hover:bg-amber-500/10 border border-white/15 text-amber-400 flex items-center justify-center transition-all"
                title="Terms of Use & Code of Conduct"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="h-7 px-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-all"
                title="Fullscreen Hand Mode"
              >
                <Maximize2 className="w-3 h-3 text-amber-400" />
                <span className="hidden xs:inline">FULL</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                  soundEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
                title={soundEnabled ? "Audio ON" : "Audio OFF"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Log Out of Chat"
                className="h-7 px-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 flex items-center gap-1 text-[10px] font-semibold transition-colors"
              >
                <LogOut className="w-3 h-3 shrink-0" />
                <span>EXIT</span>
              </button>
            </div>
          </div>

          {/* Desktop Top Bar: 2x Stacked Command & Telemetry Tiers */}
          <div className="hidden sm:flex flex-col gap-2">
            {/* ROW 1: Identity, Room Selector, Admin & Primary Action Controls */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
              {/* Left: Brand Portal Breadcrumb & Active Channel Indicator */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  title="Return to Main Site"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-white/10 border border-white/15 text-white transition-all group shrink-0 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-400/80 bg-black shrink-0">
                    <Image
                      src="/images/SS-RWB-LOGO.png"
                      alt="Subsonic"
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="font-extrabold text-[11px] font-mono tracking-wider text-slate-200 group-hover:text-amber-400">
                    PORTAL
                  </span>
                  <span className="text-white/20">/</span>
                  <span className="text-amber-400 font-bold">CHAT ROOM</span>
                </Link>

                {/* Quick Channel / Room Selector Chip */}
                <button
                  type="button"
                  onClick={() => {
                    setIsChannelModalOpen(true);
                    playTacticalChirp(1100);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition-all"
                  title="Switch Comms Channel"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">
                    {ALL_CHANNELS.find((c) => c.id === currentChannel)?.name || currentChannel}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Right: Shooter Profiles, Admin Link, Terms, Lock, and Profile Pill */}
              <div className="flex items-center gap-2">
                <Link
                  href="/shooters"
                  title="Explore Full Shooter Profiles & Accolades"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-[11px] font-mono text-purple-300 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="font-bold">SHOOTER PROFILES</span>
                </Link>
                {(shooterProfile?.role === "MASTER_OWNER" || 
                  shooterProfile?.role === "OWNER_ADMIN" || 
                  shooterProfile?.callsign === "RADAR" || 
                  shooterProfile?.callsign === "SAID DONE" || 
                  shooterProfile?.callsign === "ALLEN") && (
                  <Link
                    href="/admin"
                    target="_blank"
                    title="Open Staff Admin & Chat Moderation Dashboard"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-[11px] text-emerald-300 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-bold">ADMIN / MODERATION</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsTermsModalOpen(true);
                    playTacticalChirp(1100);
                  }}
                  title="Subsonic Society Terms of Use & Code of Conduct"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 hover:bg-white/[0.06] border border-white/10 text-[11px] text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                >
                  <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>TERMS &amp; CONDUCT</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log Out of Private Chat"
                  className="h-7 px-2.5 rounded-lg border text-[11px] flex items-center gap-1.5 font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Log Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileForm(shooterProfile);
                    setProfileActiveTab("EDIT");
                    setIsProfileModalOpen(true);
                  }}
                  data-telemetry="chat_edit_shooter_profile"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-xs group"
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] overflow-hidden ${
                    shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                      ? "bg-blue-800 text-cyan-200 ring-1 ring-cyan-400"
                      : shooterProfile.callsign === "SAID DONE" || shooterProfile.callsign === "ALLEN" || shooterProfile.role === "OWNER_ADMIN"
                      ? "bg-emerald-500 text-black font-black ring-1 ring-emerald-300"
                      : "bg-amber-500 text-black font-bold"
                  }`}>
                    {shooterProfile.image ? (
                      <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                    ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                      <Radar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300 stroke-[2.5]" />
                    ) : shooterProfile.callsign === "SAID DONE" || shooterProfile.callsign === "ALLEN" || shooterProfile.role === "OWNER_ADMIN" ? (
                      "A"
                    ) : (
                      shooterProfile.callsign.slice(0, 2)
                    )}
                  </div>
                  <span className={`font-mono font-bold text-[11px] sm:text-xs ${
                    shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                      ? "text-cyan-300 group-hover:text-cyan-200"
                      : "text-amber-300 group-hover:text-amber-200"
                  }`}>
                    {shooterProfile.callsign}
                  </span>
                  <Sliders className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* ROW 2: Compact Range Status (Left) + Utilities (Right) */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Compact Range Status Chip */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04]" title={liveWeather ? `Updated at ${liveWeather.updatedAt} • ${liveWeather.stationName} • Humidity: ${liveWeather.humidity}% • Baro: ${liveWeather.pressureHpa} hPa` : "Live Mountain Telemetry"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${liveWeather?.isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-slate-300 font-medium">{liveWeather?.location || "Holston Ridge"}</span>
                  <span className="text-white/20">·</span>
                  <span>{liveWeather?.elevationFt?.toLocaleString() || "3,420"} ft</span>
                  <span className="text-white/20">·</span>
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>
                    {liveWeather ? `${liveWeather.windSpeed}-${liveWeather.windGusts} mph ${liveWeather.windDirection}` : "4-6 mph SE"}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-white font-medium">{liveWeather ? `${liveWeather.temp}°F` : "68°F"}</span>
                  {liveWeather?.condition && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-amber-300 font-medium">{liveWeather.condition}</span>
                    </>
                  )}
                  <span className="hidden md:inline text-white/20">·</span>
                  <span className="hidden md:inline font-mono">
                    DA {liveWeather ? `${liveWeather.densityAltitude >= 0 ? "+" : ""}${liveWeather.densityAltitude.toLocaleString()} ft` : "+2,180 ft"}
                  </span>
                </div>
              </div>

              {/* Right: Tactical Utilities (Tour Guide, Fullscreen, Audio, Pass) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsTourOpen(true);
                    playTacticalChirp(1100);
                  }}
                  data-telemetry="chat_start_tour"
                  className="px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white border-amber-500/30 transition-all font-medium"
                  title="Start Interactive Chat Tour"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>TOUR GUIDE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  data-telemetry="chat_enter_fullscreen"
                  className="px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/10 transition-colors"
                  title="Expand to Fullscreen Fill Hand Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fullscreen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`h-7 px-2 rounded-lg border text-[11px] flex items-center gap-1 font-medium transition-all ${
                    soundEnabled
                      ? "bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.08]"
                      : "bg-transparent text-slate-500 border-white/5 hover:bg-white/[0.04] hover:text-slate-400"
                  }`}
                  title={soundEnabled ? "Audio Chirps: ON (Click to mute)" : "Audio Chirps: OFF (Click to unmute)"}
                  aria-label="Toggle Tactical Radio Audio"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-slate-500 shrink-0" />
                  )}
                  <span>{soundEnabled ? "Audio" : "Muted"}</span>
                </button>

                <button
                  id="tour-step-pass"
                  type="button"
                  onClick={() => {
                    setProfileForm(shooterProfile);
                    setProfileActiveTab("PASS");
                    setIsProfileModalOpen(true);
                  }}
                  title="View Digital Member Pass & Scannable QR Code"
                  data-telemetry="chat_view_digital_pass"
                  className="h-7 px-2 sm:px-2.5 rounded-lg border text-[10px] sm:text-[11px] flex items-center gap-1.5 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Fullscreen Top Bar — Messenger-clean on mobile, richer on desktop */
        <div className="bg-black/90 backdrop-blur-md md:ios-glass rounded-none md:rounded-2xl px-2 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2 md:py-2.5 border-b md:border border-white/10 flex items-center justify-between gap-1.5 sm:gap-3 md:mb-1.5 shrink-0 z-30">
          {/* Left: Breadcrumbs to Home + Fullscreen Exit */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 active:scale-95 transition-all"
              title="Return to Main Portal"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400 -mr-0.5" />
              <span className="font-extrabold text-[10px] sm:text-[11px]">HOME</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold active:scale-95 transition-all"
              title="Exit Fullscreen Mode"
            >
              <Minimize2 className="w-3 h-3 text-amber-400" />
              <span className="text-[10px]">EXIT</span>
            </button>
          </div>

          {/* Center: Tappable Room Name (cleanly spaced, properly truncated) */}
          <button
            type="button"
            onClick={() => {
              setIsChannelModalOpen(true);
              playTacticalChirp(1100);
            }}
            className="flex items-center gap-1 sm:gap-1.5 font-mono text-left min-w-0 group flex-1 justify-center px-1"
            title="Switch room"
          >
            <span className="text-amber-400 font-bold text-xs sm:text-sm md:text-base">#</span>
            <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white whitespace-nowrap truncate max-w-[90px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none group-hover:text-amber-300 transition-colors">
              {currentChannelData.name}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold flex items-center gap-0.5 sm:gap-1 shrink-0" title={`${currentChannelEngagement.postCount} transmissions in this channel`}>
              <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
              <span>{currentChannelEngagement.postCount}</span>
            </span>
            <ChevronDown className="w-3 h-3 text-amber-400/70 group-hover:text-amber-300 shrink-0" />
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop-only: Weather, Staff Moderated */}
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 text-[10px] font-mono" title={liveWeather ? `Wind ${liveWeather.windSpeed}-${liveWeather.windGusts} mph from ${liveWeather.windDirection} (${liveWeather.windDegrees}°) • DA ${liveWeather.densityAltitude >= 0 ? "+" : ""}${liveWeather.densityAltitude} ft` : "Live Wind Telemetry"}>
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>{liveWeather ? `${liveWeather.windSpeed}-${liveWeather.windGusts} MPH ${liveWeather.windDirection}` : "4-6 MPH SE"}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-300 font-mono" title="Staff Moderated">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Moderated</span>
            </div>

            {/* Terms & Code of Conduct */}
            <button
              type="button"
              onClick={() => {
                setIsTermsModalOpen(true);
                playTacticalChirp(1100);
              }}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-[9px] text-slate-300 hover:text-amber-300 font-mono transition-colors"
              title="Terms of Use & Code of Conduct"
            >
              <Scale className="w-2.5 h-2.5 text-amber-400" />
              <span>TERMS</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`h-7 w-7 sm:h-8 sm:w-8 md:h-7 md:w-auto md:px-2 rounded-lg sm:rounded-xl border flex items-center justify-center md:gap-1 font-mono font-semibold transition-all ${
                soundEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
              title={soundEnabled ? "Audio ON" : "Audio OFF"}
              aria-label="Toggle Audio"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden md:inline text-[10px]">{soundEnabled ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. CHANNEL SELECTOR — ZERO HORIZONTAL OVERFLOW ON MOBILE (Hidden on mobile if in Fullscreen since top bar handles it) */}
      <div id="tour-step-channels" className={`shrink-0 px-2 sm:px-4 lg:px-6 pt-1 pb-1 ${isFullscreen ? "hidden md:block" : ""}`}>
        {/* MOBILE TACTICAL FREQUENCY DIAL BUTTON (Fits 100% width, no side-scroll, voice & text searchable) */}
        <div className="md:hidden">
          <div className="flex items-center gap-1.5">
            {isDirectMode && (
              <button
                type="button"
                onClick={handleBackToInvitational}
                className="p-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                title="Return to #invitational"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>#inv</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsChannelModalOpen(true);
                playTacticalChirp(1100);
              }}
              className="w-full p-2 px-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] flex items-center justify-between gap-2 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                  isDirectMode ? "bg-emerald-500 text-black" : "bg-amber-500 text-black"
                }`}>
                  {isDirectMode ? "🔒" : "#"}
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-xs whitespace-nowrap truncate max-w-[140px]">
                      {currentChannelData.name}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold border shrink-0 ${
                      isDirectMode
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {currentChannelData.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isDirectMode && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                    <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                    {currentChannelEngagement.postCount} posts
                  </span>
                )}
                <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 font-mono text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  <span>{isDirectMode ? "SWITCH" : "ROOMS"}</span>
                  <ChevronDown className="w-3 h-3 text-amber-400" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* DESKTOP CHANNEL SELECTOR BAR (Hidden on mobile & small tablets) */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between gap-3">
            {/* Desktop Channel Pills on Left */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              {visibleChannels.map((ch) => {
                const isActive = currentChannel === ch.id;
                const unread = unreadCounts[ch.id] || 0;
                const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setCurrentChannel(ch.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 border relative ${
                      isActive
                        ? "bg-amber-500 text-black font-bold border-amber-400"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={isActive ? "text-black" : "text-amber-400"}>#</span>
                    <span>{ch.name}</span>

                    {/* Post Counter Badge on Pill */}
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 ${
                      isActive
                        ? "bg-black/30 text-white/80"
                        : "bg-white/5 text-slate-400"
                    }`} title={`${engagement.postCount} posts in #${ch.name}`}>
                      <MessageSquare className="w-2 h-2" />
                      <span>{engagement.postCount}</span>
                    </span>

                    {unread > 0 && !isActive ? (
                      <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* Active Direct Comms Pill */}
              {isDirectMode && activeDirectPartner && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-emerald-950/40 border border-emerald-500/30 text-white shrink-0 animate-fadeIn">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-bold truncate max-w-[200px]">
                    DM: {activeDirectPartner.name} [{activeDirectPartner.callsign}]
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToInvitational}
                    className="ml-1 p-0.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Close direct view and return to #invitational"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Terms & Browse Rooms */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsTermsModalOpen(true);
                  playTacticalChirp(1100);
                }}
                className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-amber-500/10 border border-white/15 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-all group shrink-0 shadow-sm"
                title="Subsonic Society Terms of Use & Code of Conduct"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400/90 group-hover:text-amber-400 shrink-0" />
                <span className="font-bold tracking-wider">TERMS OF USE &amp; CODE OF CONDUCT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChannelModalOpen(true);
                  playTacticalChirp(1100);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-all"
                title="Search and switch rooms"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Browse All Rooms</span>
              </button>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                {activeNetTab === "PRO" ? "VERIFIED SQUAD CHAT" : "OPEN SOCIETY"}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* 3. MAIN COMMS MATRIX — fills all remaining viewport height */}
      <div className={`flex-1 min-h-0 overflow-hidden px-2 sm:px-4 lg:px-6 pb-2 sm:pb-3 grid grid-cols-1 ${!isFullscreen ? "lg:grid-cols-12" : ""} gap-3`}>

        {/* DESKTOP-ONLY Channels Sidebar (Hidden in Fullscreen or Mobile) */}
        {!isFullscreen && (
          
          <ChatChannelSidebar
            activeNetTab={activeNetTab}
            visibleChannels={visibleChannels}
            currentChannel={currentChannel}
            setCurrentChannel={setCurrentChannel}
            channelEngagementMap={channelEngagementMap}
            setIsDopeModalOpen={setIsDopeModalOpen}
            directPartners={directPartners}
            unreadCounts={unreadCounts}
            onOpenDossier={handleOpenDossier}
            shooterProfile={shooterProfile}
            onLogout={handleLogout}
          />
        )}

        {/* MAIN CHAT STREAM & TRANSMITTER */}
        <div
          className={`${
            !isFullscreen ? "lg:col-span-8" : ""
          } md:ios-glass rounded-none md:rounded-2xl sm:rounded-3xl border-0 md:border border-white/10 flex flex-col overflow-hidden md:shadow-2xl relative h-full min-h-0`}
        >
          <ChatMessageList
            pinnedAnnouncement={pinnedAnnouncement}
            announcementCollapsed={announcementCollapsed}
            setAnnouncementCollapsed={setAnnouncementCollapsed}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            handleContainerScroll={handleContainerScroll}
            filteredMessages={filteredMessages}
            currentChannelData={currentChannelData}
            shooterProfile={shooterProfile}
            setProfileForm={setProfileForm}
            setProfileActiveTab={setProfileActiveTab}
            setIsProfileModalOpen={setIsProfileModalOpen}
            playTacticalChirp={playTacticalChirp}
            currentChannel={currentChannel}
            quickBroadcast={quickBroadcast}
            setIsChannelModalOpen={setIsChannelModalOpen}
            copyDopeToClipboard={copyDopeToClipboard}
            copiedDopeId={copiedDopeId}
            handleAddReaction={handleAddReaction}
            showScrollFab={showScrollFab}
            scrollContainerToBottom={scrollContainerToBottom}
            setShowScrollFab={setShowScrollFab}
            aiBlockedNotice={aiBlockedNotice}
            isTyping={isTyping}
            setInputText={setInputText}
            activeDirectPartner={activeDirectPartner}
            onBackToInvitational={handleBackToInvitational}
            onSelectShooter={handleOpenDossier}
          />
          <ChatInputBar
            handleSendMessage={handleSendMessage}
            isListening={isListening}
            currentChannelData={currentChannelData}
            inputText={inputText}
            handleInputChange={handleInputChange}
            messagesContainerRef={messagesContainerRef}
            handlePushToTalk={handlePushToTalk}
            setIsDopeModalOpen={setIsDopeModalOpen}
            isAiScanning={isAiScanning}
            shooterProfile={shooterProfile}
            scrollContainerToBottom={scrollContainerToBottom}
          />
        </div>
      </div>


      {/* 4. TACTICAL DOPE DROP BUILDER MODAL — hidden for initial onboarding */}

      {/* 5. SHOOTER PROFILE CUSTOMIZER MODAL */}
      {isProfileModalOpen && (() => {
        const isMasterOwner =
          shooterProfile.role === "MASTER_OWNER" ||
          shooterProfile.callsign === "RADAR" ||
          shooterProfile.callsign === "ROB" ||
          shooterProfile.callsign === "LTDAN" ||
          (shooterProfile.name && shooterProfile.name.toLowerCase().includes("neilson"));

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="ios-glass rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl p-5 sm:p-7 space-y-4 max-h-[92dvh] overflow-y-auto ios-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isMasterOwner
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                      : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                  }`}>
                    {isMasterOwner ? <Activity className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isMasterOwner ? "Systems Engineer Profile & Credential" : "Marksman Profile & Credential"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isMasterOwner ? "Your verified callsign, pass, and infrastructure architecture" : "Your verified callsign, pass, and rig specs"}
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

              {/* Modal Tabs: Pass vs Edit */}
              <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setProfileActiveTab("PASS")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    profileActiveTab === "PASS"
                      ? "bg-emerald-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Digital Member Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileActiveTab("EDIT")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    profileActiveTab === "EDIT"
                      ? isMasterOwner
                        ? "bg-cyan-500 text-black"
                        : "bg-amber-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isMasterOwner ? "Edit Systems Profile" : "Edit Callsign & Rig"}</span>
                </button>
              </div>

              {/* Tab 1: Live Digital Member Pass with Scannable QR & Barcode */}
              {profileActiveTab === "PASS" ? (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <MemberCredentialCard
                    memberId={memberId}
                    fullName={shooterProfile.name}
                    callsign={shooterProfile.callsign}
                    state={memberState}
                    experienceLevel={shooterProfile.division}
                    rifleSetup={shooterProfile.rifleSetup}
                    accessLevel={isMasterOwner ? "MASTER ADMIN" : shooterProfile.role === "PRO_COMPETITOR" ? "PRO COMPETITOR" : "CHAT ACCESS"}
                    showDownload={true}
                  />

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileActiveTab("EDIT")}
                      className="text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{isMasterOwner ? "Need to update system credentials or tech architecture? Edit Profile →" : "Need to change your callsign or rifle build? Edit Profile →"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Tab 2: Edit Callsign & Shooter/Systems Settings Form */
                <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">
                      {isMasterOwner ? "Systems Architect Full Name" : "Shooter Full Name"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-mono font-bold ${isMasterOwner ? "text-cyan-400" : "text-amber-400"}`}>
                      {isMasterOwner ? "Systems Callsign" : "Tactical Callsign"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.callsign}
                      onChange={(e) => setProfileForm({ ...profileForm, callsign: e.target.value.toUpperCase() })}
                      placeholder={isMasterOwner ? "RADAR" : "e.g. LEIPOLD"}
                      className={`w-full px-3 py-2 rounded-xl bg-black/50 border font-mono text-base sm:text-xs font-bold focus:outline-none ${
                        isMasterOwner
                          ? "border-cyan-500/40 text-cyan-300 focus:border-cyan-400"
                          : "border-amber-500/40 text-amber-300 focus:border-amber-400"
                      }`}
                      required
                    />
                  </div>

                  {isMasterOwner ? (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-cyan-400 font-bold">
                        System Role & Authority
                      </label>
                      <input
                        type="text"
                        value={profileForm.division || "Master Admin"}
                        onChange={(e) => setProfileForm({ ...profileForm, division: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-500/40 text-cyan-300 font-mono text-base sm:text-xs font-bold focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-300">Competition Division</label>
                      <select
                        value={profileForm.division}
                        onChange={(e) => setProfileForm({ ...profileForm, division: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                      >
                        <option value="Open Division Pro">Open Division Pro</option>
                        <option value="Production Division">Production Division</option>
                        <option value="Senior Division 55+">Senior Division 55+</option>
                        <option value="Ladies Rimfire Pro">Ladies Rimfire Pro</option>
                        <option value="Junior Division">Junior Division</option>
                      </select>
                    </div>
                  )}

                  {isMasterOwner ? (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-cyan-400 font-bold">
                        Infrastructure & Tech Stack
                      </label>
                      <input
                        type="text"
                        value={profileForm.rifleSetup}
                        onChange={(e) => setProfileForm({ ...profileForm, rifleSetup: e.target.value })}
                        placeholder="e.g. Server Core • Telemetry Relays • Encrypted Comms (Non-Shooter)"
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-500/40 text-cyan-300 font-mono text-base sm:text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-300">Rifle & Optic Setup</label>
                      <input
                        type="text"
                        value={profileForm.rifleSetup}
                        onChange={(e) => setProfileForm({ ...profileForm, rifleSetup: e.target.value })}
                        placeholder="e.g. Vudoo V-22 / Bartlein MTU / ZCO 527"
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">System Role</label>
                    {(profileForm.role === "MASTER_OWNER" || profileForm.role === "DEV_ADMIN" || profileForm.role === "OWNER_ADMIN" || profileForm.role === "ADMIN" || profileForm.role === "MODERATOR" || isMasterOwner) ? (
                      <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                        profileForm.role === "MASTER_OWNER" || isMasterOwner
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                          : profileForm.role === "OWNER_ADMIN"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : profileForm.role === "ADMIN"
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                          : profileForm.role === "MODERATOR"
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}>
                        <span className="text-xl shrink-0">
                          {profileForm.role === "MASTER_OWNER" || isMasterOwner ? (
                            <Radar className="w-6 h-6 text-cyan-300 stroke-[2.2] animate-pulse" />
                          ) : profileForm.role === "OWNER_ADMIN" ? (
                            <span className="font-mono font-black text-xl text-emerald-400">A</span>
                          ) : profileForm.role === "ADMIN" ? (
                            "🛡️"
                          ) : profileForm.role === "MODERATOR" ? (
                            "⚖️"
                          ) : (
                            "👑"
                          )}
                        </span>
                        <div>
                          <div className="font-extrabold text-xs">
                            {profileForm.role === "MASTER_OWNER" || isMasterOwner
                              ? "MASTER ADMIN (ROOT CLEARANCE)"
                              : profileForm.role === "OWNER_ADMIN"
                              ? "OWNER ADMIN (EXECUTIVE CLEARANCE)"
                              : profileForm.role === "ADMIN"
                              ? "SYSTEM ADMINISTRATOR (COMMAND)"
                              : profileForm.role === "MODERATOR"
                              ? "COMMS MODERATOR (CHAT DEFENSE)"
                              : "MASTER ADMIN (ROOT ACCESS)"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {profileForm.role === "MASTER_OWNER" || isMasterOwner
                              ? "Full Systems Architecture, Comms Relays & Root Administrative Authority (Non-Shooter)"
                              : profileForm.role === "OWNER_ADMIN"
                              ? "Verified Society Leadership Authority"
                              : profileForm.role === "ADMIN"
                              ? "Full Operations & Management Clearance"
                              : profileForm.role === "MODERATOR"
                              ? "Authorized Comms Moderation & Safety Clearance"
                              : "Full Administrative & Security Authority"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        {(["PRO_COMPETITOR", "MATCH_DIRECTOR", "MEMBER"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, role: r })}
                            className={`py-1.5 px-2 rounded-xl border text-center transition-all text-xs ${
                              profileForm.role === r
                                ? "bg-amber-500 text-black font-bold border-amber-400"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {r === "PRO_COMPETITOR" ? "PRO" : r === "MATCH_DIRECTOR" ? "DIRECTOR" : "MEMBER"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    {profileSaved && (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4" />
                        PROFILE SAVED!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      disabled={profileSaved}
                      className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaved}
                      className={`px-5 py-2 rounded-xl font-medium text-xs transition-all ${
                        profileSaved
                          ? "bg-emerald-500 text-white scale-105"
                          : isMasterOwner
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110"
                      }`}
                    >
                      {profileSaved ? "✓ SAVED!" : "SAVE PROFILE"}
                    </button>
                  </div>
                </form>
              )}

              {/* Session Control / Log Out */}
              <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Signed in as <strong className="text-white font-mono">{shooterProfile.callsign}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Log Out of Chat</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. INTERACTIVE GUIDED CHAT TOUR */}
      <ChatTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onPlayChirp={playTacticalChirp}
      />

      {/* 6. TACTILE CHANNEL SELECTOR DRAWER (VOICE & TEXT SEARCH) */}
      <ChannelPickerModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        channels={ALL_CHANNELS}
        currentChannel={currentChannel}
        onSelectChannel={(chId) => setCurrentChannel(chId)}
        unreadCounts={unreadCounts}
        engagementCounts={channelEngagementMap}
        onPlayChirp={playTacticalChirp}
        directPartners={directPartners}
      />

      {/* 7. SHOOTER DOSSIER MODAL */}
      <ShooterDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        shooter={selectedDossierShooter}
        onStartDirectComms={handleStartDirectComms}
      />

      {/* 8. TERMS OF USE & CODE OF CONDUCT MODAL */}
      <ChatTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onPlayChirp={playTacticalChirp}
      />
    </div>
  );
}

