"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ChevronDown,
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
  Bot
} from "lucide-react";
import { INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { ChatMessage, DopeCardData } from "@/lib/types";
import { evaluateChatMessage } from "@/lib/ai-moderator";
import { recordTelemetryEvent } from "@/lib/telemetry";
import { recordCommsAbuseAlert } from "@/lib/abuse-moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";
import { analyzeMsgForPlink, buildPlinkMessage, getChannelWelcome } from "@/lib/plink-engine";
import { ChatTour } from "@/components/chat/ChatTour";
import { ChannelPickerModal } from "@/components/chat/ChannelPickerModal";
import { startBotEngine, BotSpeed } from "@/lib/chat-bots";
import { BotRosterCard } from "@/components/chat/BotRosterCard";
import { playRealCommsChirp, playBotTelemetryChirp, playTacticalChirp, unlockAudio } from "@/lib/chat-audio";

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
  role: "MASTER_OWNER" | "DEV_ADMIN" | "OWNER_ADMIN" | "ADMIN" | "MODERATOR" | "PRO_COMPETITOR" | "MATCH_DIRECTOR" | "OFFICIAL" | "VIP" | "MEMBER";
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


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeNetTab, setActiveNetTab] = useState<"PRO" | "PUBLIC">("PRO");
  const [currentChannel, setCurrentChannel] = useState("bristol-pro-shootout");
  const [inputText, setInputText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fullscreen / Handheld Immersive Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobileRef = useRef(false);

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

  // Moderation Status Notice
  const [aiBlockedNotice, setAiBlockedNotice] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [copiedDopeId, setCopiedDopeId] = useState<string | null>(null);

  // Messages Container Ref for internal container-only scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Channels filtered by current active Net tab
  const visibleChannels = ALL_CHANNELS.filter((ch) => ch.netType === activeNetTab);
  const currentChannelData = ALL_CHANNELS.find((ch) => ch.id === currentChannel) || ALL_CHANNELS[0];
  const filteredMessages = messages.filter((m) => m.channelId === currentChannel);

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
  const [plinkVisitedChannels, setPlinkVisitedChannels] = useState<Set<string>>(new Set());
  // track last non-Plink message content per user for spam detection
  const lastUserMessageRef = useRef<Record<string, string>>({});

  // Interactive Guided Chat Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  // Tactile Channel Picker Drawer state
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

  // Bot Engine & Bot Chats Card State
  const [botsEnabled, setBotsEnabled] = useState(false);
  const [botSpeed, setBotSpeed] = useState<BotSpeed>("NORMAL");
  const [badActorEnabled, setBadActorEnabled] = useState(true);
  const [isBotCardOpen, setIsBotCardOpen] = useState(false);
  const botCleanupRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages; // keep ref in sync
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const currentChannelRef = useRef(currentChannel);
  currentChannelRef.current = currentChannel;

  // Bot Engine — start/stop based on toggle
  useEffect(() => {
    if (botsEnabled) {
      // Clean up previous engine if any
      if (botCleanupRef.current) botCleanupRef.current();

      const cleanup = startBotEngine(
        botSpeed,
        {
          addMessage: (msg) => {
            setMessages((prev) => [...prev, msg]);
            // Distinct tone for bot chats: Digital Cyber Telemetry
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
          },
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
              parsedShooter.division = "Lead Developer & Tech Advisor";
              parsedShooter.badgeText = "DEV ADVISOR";
              parsedShooter.rifleSetup = "Smart Systems Integrations";
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsedShooter));
                localStorage.setItem("subsonic_member_profile", JSON.stringify({
                  member_id: "SS-2026-0001",
                  full_name: "Rob Neilson",
                  callsign: "RADAR",
                  state: "TN",
                  experience_level: "Lead Developer & Tech Advisor",
                  rifle_setup: "Smart Systems Integrations",
                  created_at: "2026-07-04T12:00:00Z"
                }));
              } catch {}
            } else if (
              parsedShooter.callsign === "ALLEN" ||
              parsedShooter.callsign === "AHURLEY" ||
              (parsedShooter.name && parsedShooter.name.toLowerCase().includes("hurley"))
            ) {
              parsedShooter.member_id = "SS-2026-0002";
              parsedShooter.name = "Allen Hurley";
              parsedShooter.role = "OWNER_ADMIN";
              parsedShooter.division = "Owner Admin / Executive";
              parsedShooter.badgeText = "OWNER ADMIN";
              parsedShooter.callsign = "ALLEN";
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsedShooter));
                localStorage.setItem("subsonic_member_profile", JSON.stringify({
                  member_id: "SS-2026-0002",
                  full_name: "Allen Hurley",
                  callsign: "ALLEN",
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
    }
  }, []);

  // Lock body scroll for viewport-pinned chat layout
  useEffect(() => {
    document.body.classList.add("chat-active");
    return () => document.body.classList.remove("chat-active");
  }, []);

  // ── Plink: Channel Welcome ────────────────────────────────────────────────
  // Fires once per channel — greets the user when they enter a new channel.
  useEffect(() => {
    if (!isAuthenticated || !shooterProfile.callsign) return;
    if (plinkVisitedChannels.has(currentChannel)) return;

    setPlinkVisitedChannels((prev) => new Set(Array.from(prev).concat(currentChannel)));

    const welcomeMsg = getChannelWelcome(currentChannel, shooterProfile.callsign);
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        buildPlinkMessage(welcomeMsg, currentChannel, 0),
      ]);
    }, 2200);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, isAuthenticated]);

  // ── Plink: Message Watcher ────────────────────────────────────────────────
  // Fires on every new message. Analyzes the last message for violations.
  useEffect(() => {
    if (!isAuthenticated) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;
    // Never react to our own messages
    if (lastMsg.author.id === "plink_ai_moderator") return;
    // Only respond to messages in the currently viewed channel
    if (lastMsg.channelId !== currentChannel) return;

    const lastContent = lastUserMessageRef.current[lastMsg.author.id];
    const response = analyzeMsgForPlink(lastMsg, plinkWarningHistory, lastContent);

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
  }, [currentChannel]);

  // Scroll inner container to bottom only when switching channels (initial)
  useEffect(() => {
    scrollContainerToBottom(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



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

    if (soundEnabled) {
      playRealCommsChirp();
    }
    // Haptic feedback on send (Android/PWA)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
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
    const updated = {
      ...profileForm,
      badgeText:
        profileForm.role === "MASTER_OWNER" || profileForm.role === "DEV_ADMIN"
          ? "MASTER OWNER"
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
      localStorage.setItem("subsonic_shooter_profile", JSON.stringify(updated));
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
  const handleUnlockRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCallsign.trim()) {
      triggerAuthError("Callsign required to access the private net.");
      return;
    }

    const cleanCallsign = loginCallsign.trim().toUpperCase();
    const cleanPass = loginPasscode.trim();

    // Specific Executive PINs:
    // Rob Neilson: "RADAR", "LTDAN", or "ROB" with PIN "2468" (Master Owner, Lead Developer & Tech Advisor)
    // Allen Hurley: "ALLEN" / "AHURLEY" with PIN "620620" (Owner Admin)
    const isRob = cleanCallsign === "RADAR" || cleanCallsign === "LTDAN" || cleanCallsign === "ROB" || cleanPass === "2468";
    const isAllen = cleanCallsign === "ALLEN" || cleanCallsign === "AHURLEY" || cleanPass === "620620";

    const isRobValid = isRob && (cleanPass === "2468" || cleanPass.toLowerCase() === "subsonic2026");
    const isAllenValid = isAllen && (cleanPass === "620620" || cleanPass.toLowerCase() === "subsonic2026");
    const isGeneralValid = ["SUBSONIC2026", "subsonic2026", "2468", "620620"].includes(cleanPass);

    if (!isRobValid && !isAllenValid && !isGeneralValid) {
      triggerAuthError("Invalid Member Key or PIN. Contact your Range Marshal for access.");
      return;
    }

    const profile: ShooterProfile = {
      name: isRob 
        ? "Rob Neilson" 
        : isAllen 
        ? "Allen Hurley" 
        : (shooterProfile.name || cleanCallsign),
      callsign: isAllen ? "ALLEN" : isRob ? "RADAR" : cleanCallsign,
      role: isRob 
        ? ("MASTER_OWNER" as const)
        : isAllen 
        ? ("OWNER_ADMIN" as const)
        : (shooterProfile.role || "PRO_COMPETITOR"),
      division: isRob 
        ? "Lead Developer & Tech Advisor" 
        : isAllen 
        ? "Owner Admin / Executive" 
        : (shooterProfile.division || "Open Division Pro"),
      rifleSetup: isRob 
        ? "Smart Systems Integrations" 
        : isAllen 
        ? (shooterProfile.rifleSetup || "Modacam Custom Precision V-22 / ZCO 527") 
        : (shooterProfile.rifleSetup || "Custom Precision Rimfire"),
      badgeText: isRob 
        ? "DEV ADVISOR" 
        : isAllen 
        ? "OWNER ADMIN" 
        : "PRO SHOOTER",
    };

    if (isRob) {
      setMemberId("SS-2026-0001");
      setMemberState("TN");
    } else if (isAllen) {
      setMemberId("SS-2026-0002");
      setMemberState("TN");
    }

    setShooterProfile(profile);
    setProfileForm(profile);
    setAuthError(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("subsonic_shooter_profile", JSON.stringify(profile));
        if (isRob) {
          localStorage.setItem("subsonic_member_profile", JSON.stringify({
            member_id: "SS-2026-0001",
            full_name: "Rob Neilson",
            callsign: "RADAR",
            state: "TN",
            experience_level: "Lead Developer & Tech Advisor",
            rifle_setup: "Smart Systems Integrations",
            created_at: "2026-07-04T12:00:00Z"
          }));
        } else if (isAllen) {
          localStorage.setItem("subsonic_member_profile", JSON.stringify({
            member_id: "SS-2026-0002",
            full_name: "Allen Hurley",
            callsign: "ALLEN",
            state: "TN",
            experience_level: "Owner Admin / Executive",
            rifle_setup: profile.rifleSetup,
            created_at: "2026-07-04T12:00:00Z"
          }));
        }
        localStorage.setItem("subsonic_chat_authenticated", "true");
      } catch {
        // Fallback
      }
    }
    setIsAuthenticated(true);
    playTacticalChirp(1200);
  };


  // If not authenticated, render the Private Chat Room Gate
  if (authChecked && !isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
        <div className={`w-full max-w-md ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow space-y-6 text-center animate-fadeIn transition-all ${authShake ? "animate-shake" : ""}`}>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-glow mx-auto relative">
            <Image
              src="/assets/subsonic-coin.jpg"
              alt="Subsonic Emblem"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Restricted Network • Member Key Required</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              PRIVATE CHAT ROOM
            </h2>
            <p className="text-xs text-slate-300">
              Enter your callsign and member key to access live squad comms and DOPE drops.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono text-left flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockRoom} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-bold">Callsign *</label>
              <input
                type="text"
                required
                value={loginCallsign}
                onChange={(e) => setLoginCallsign(e.target.value.toUpperCase())}
                placeholder="e.g. APEX-22 or ROB"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs font-bold uppercase focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                <span>Member Key or 4-Digit PIN</span>
                <span className="text-[10px] text-amber-400/80 font-normal normal-case">PIN 2468 for ROB</span>
              </label>
              <input
                type="password"
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                placeholder="Enter member key or 4-digit PIN (e.g. 2468)..."
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <Unlock className="w-4 h-4 fill-black" />
              <span>UNLOCK PRIVATE CHAT ROOM</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <Link
              href="/join"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>New here? Register for free chat access →</span>
            </Link>
            <a href="/" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Return to Main Portal
            </a>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div
      data-section="chat"
      className={
        isFullscreen
          ? "fixed inset-0 z-[60] bg-[#07090E] p-0 md:p-4 flex flex-col h-[100dvh] w-full max-w-full overflow-hidden overflow-x-hidden animate-fadeIn"
          : "flex flex-col h-full w-full max-w-full overflow-hidden overflow-x-hidden pt-20 sm:pt-24 bg-[#07090E]"
      }
    >
      {/* 1. TOP LIVE MOUNTAIN TELEMETRY & RANGE WEATHER BANNER */}
      {!isFullscreen ? (
        <div className="shrink-0 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-3">
        <div className="ios-glass rounded-2xl p-2.5 sm:p-3 border border-amber-500/20 shadow-tactical-glow">
          {/* Mobile Top Bar: Single clean, zero-clutter row */}
          <div className="flex sm:hidden items-center justify-between gap-2">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs min-w-0"
            >
              <div className="w-5 h-5 rounded-md bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0">
                {shooterProfile.callsign.slice(0, 2)}
              </div>
              <span className="font-mono font-bold text-amber-300 text-xs truncate max-w-[100px]">
                {shooterProfile.callsign}
              </span>
              <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </button>

            {/* Mobile Actions: Fullscreen, Audio, Lock */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="h-7 px-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-all"
                title="Fullscreen Hand Mode"
              >
                <Maximize2 className="w-3 h-3 text-amber-400" />
                <span>FULL</span>
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
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("subsonic_chat_authenticated");
                  }
                  setIsAuthenticated(false);
                  playTacticalChirp(400);
                }}
                title="Lock Chat"
                className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center"
              >
                <Lock className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Desktop Top Bar: Rich Weather & Expanded Controls */}
          <div className="hidden sm:flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4">
            {/* Left: Weather & Elevation Telemetry */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-bold tracking-wider">HOLSTON RIDGE:</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>ELEV: <strong className="text-white">3,420 FT</strong></span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>WIND: <strong className="text-cyan-300">9-14 MPH</strong></span>
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <span>TEMP: <strong className="text-white">64°F</strong></span>
              </div>

              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>DA: <strong className="text-emerald-300">+2,150 FT</strong></span>
              </div>
            </div>

            {/* Right: Controls & Profile Pill */}
            <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 pt-1.5 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsTourOpen(true);
                  playTacticalChirp(1100);
                }}
                data-telemetry="chat_start_tour"
                className="px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs flex items-center gap-1.5 font-mono bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border-amber-500/40 transition-all font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                title="Start Interactive Chat Tour"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>TOUR GUIDE</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                data-telemetry="chat_enter_fullscreen"
                className="px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs flex items-center gap-1.5 font-mono bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10 transition-colors"
                title="Expand to Fullscreen Fill Hand Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-6 sm:h-7 px-2 rounded-lg border text-[10px] sm:text-[11px] flex items-center gap-1 font-mono font-semibold transition-all ${
                  soundEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-300"
                }`}
                title={soundEnabled ? "Audio Chirps: ON (Click to mute)" : "Audio Chirps: OFF (Click to unmute)"}
                aria-label="Toggle Tactical Radio Audio"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <VolumeX className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <span className="text-slate-400 text-[9px] uppercase tracking-wider font-normal">Audio</span>
                <span>{soundEnabled ? "ON" : "OFF"}</span>
              </button>

              {/* Bot On/Off Switch & Fleet Card Access — Admin only */}
              {(shooterProfile.role === "MASTER_OWNER" || shooterProfile.role === "DEV_ADMIN" || shooterProfile.role === "OWNER_ADMIN" || shooterProfile.role === "ADMIN") && (
                <div className="flex items-center rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      setBotsEnabled(!botsEnabled);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 text-[10px] font-mono font-bold transition-all ${
                      botsEnabled
                        ? "bg-cyan-500/25 text-cyan-300 hover:bg-cyan-500/35 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
                    }`}
                    title={botsEnabled ? "Turn test bots OFF" : "Turn test bots ON"}
                  >
                    <span>🤖</span>
                    <span>{botsEnabled ? "BOTS ON" : "BOTS OFF"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      setIsBotCardOpen(true);
                      playTacticalChirp(1100);
                    }}
                    className={`px-1.5 py-0.5 sm:py-1 border-l border-white/10 transition-colors ${
                      botsEnabled
                        ? "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
                    }`}
                    title="Open Bot Fleet Card (roster, live metrics, tones)"
                    aria-label="Open Bot Fleet Card"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              )}

              <Link
                href="/admin"
                target="_blank"
                title="Open Staff Admin & Comms Moderation Dashboard"
                className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 transition-colors"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Admin / Moderation</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("subsonic_chat_authenticated");
                  }
                  setIsAuthenticated(false);
                  playTacticalChirp(400);
                }}
                title="Lock Private Chat Room"
                className="h-6 sm:h-7 px-2 rounded-lg border text-[10px] sm:text-[11px] flex items-center gap-1 font-mono font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 transition-all"
              >
                <Lock className="w-3 h-3 text-red-400 shrink-0" />
                <span>Lock</span>
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
                className="h-6 sm:h-7 px-2 sm:px-2.5 rounded-lg border text-[10px] sm:text-[11px] flex items-center gap-1.5 font-mono font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35 transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileForm(shooterProfile);
                  setProfileActiveTab("EDIT");
                  setIsProfileModalOpen(true);
                }}
                data-telemetry="chat_edit_shooter_profile"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/50 border border-amber-500/40 hover:border-amber-400 transition-all text-xs group"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center text-[9px] sm:text-[10px]">
                  {shooterProfile.callsign.slice(0, 2)}
                </div>
                <span className="font-mono font-bold text-amber-300 group-hover:text-amber-200 text-[11px] sm:text-xs">
                  {shooterProfile.callsign}
                </span>
                <Sliders className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Fullscreen Top Bar — Messenger-clean on mobile, richer on desktop */
        <div className="bg-black/80 md:ios-glass rounded-none md:rounded-2xl px-3 sm:px-4 py-2.5 md:py-2.5 border-b md:border border-white/10 flex items-center justify-between gap-2 sm:gap-3 md:mb-1.5 shrink-0">
          {/* Left: Back Button (mobile) */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              if (isMobileRef.current && typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="w-10 h-10 md:w-7 md:h-7 rounded-xl md:rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
            title="Back"
          >
            <ChevronDown className="w-5 h-5 md:w-3.5 md:h-3.5 text-amber-400 -rotate-90" />
          </button>

          {/* Center: Tappable Room Name */}
          <button
            type="button"
            onClick={() => {
              setIsChannelModalOpen(true);
              playTacticalChirp(1100);
            }}
            className="flex items-center gap-1.5 font-mono text-left min-w-0 group flex-1 justify-center md:justify-start"
            title="Switch room"
          >
            <span className="text-amber-400 font-bold text-sm md:text-base">#</span>
            <span className="font-mono font-bold text-sm md:text-base text-white whitespace-nowrap truncate max-w-[150px] sm:max-w-[220px] md:max-w-none group-hover:text-amber-300 transition-colors">
              {currentChannelData.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold flex items-center gap-1 shrink-0" title={`${currentChannelEngagement.postCount} transmissions in this channel`}>
              <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
              <span>{currentChannelEngagement.postCount}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 shrink-0" />
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop-only: Weather, Staff Moderated */}
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 text-[10px] font-mono">
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>9-14 MPH</span>
            </div>
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-300 font-mono" title="Staff Moderated">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Moderated</span>
            </div>

            {/* Audio Toggle — Icon only on mobile */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-10 md:h-7 md:w-auto md:px-2 rounded-xl md:rounded-lg border flex items-center justify-center md:gap-1 font-mono font-semibold transition-all ${
                soundEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
              title={soundEnabled ? "Audio ON" : "Audio OFF"}
              aria-label="Toggle Audio"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 md:w-3 md:h-3 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 md:w-3 md:h-3 text-slate-400" />
              )}
              <span className="hidden md:inline text-[10px]">{soundEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Desktop-only: Exit Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="hidden md:flex h-7 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs items-center gap-1 font-mono transition-all"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. CHANNEL SELECTOR — ZERO HORIZONTAL OVERFLOW ON MOBILE (Hidden on mobile if in Fullscreen since top bar handles it) */}
      <div id="tour-step-channels" className={`shrink-0 px-2 sm:px-4 lg:px-6 pt-1 pb-1 ${isFullscreen ? "hidden md:block" : ""}`}>
        {/* MOBILE TACTICAL FREQUENCY DIAL BUTTON (Fits 100% width, no side-scroll, voice & text searchable) */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => {
              setIsChannelModalOpen(true);
              playTacticalChirp(1100);
            }}
            className="w-full p-2 px-2.5 rounded-xl bg-black/70 border border-amber-500/40 hover:border-amber-400 shadow-tactical-glow flex items-center justify-between gap-2 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-black font-mono font-black text-xs flex items-center justify-center shrink-0">
                #
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs whitespace-nowrap truncate max-w-[140px]">
                    {currentChannelData.name}
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                    {currentChannelData.badge}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                {currentChannelEngagement.postCount} posts
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">{currentChannelData.activeUsers} online</span>
              <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 font-mono text-[9px] font-bold text-amber-300 flex items-center gap-1">
                <span>ROOMS</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </div>
            </div>
          </button>
        </div>

        {/* DESKTOP CHANNEL SELECTOR BAR (Hidden on mobile & small tablets) */}
        <div className="hidden md:block space-y-1.5">
          {/* Network Mode Selector Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveNetTab("PRO");
                  if (!ALL_CHANNELS.filter(c => c.netType === "PRO").some(c => c.id === currentChannel)) {
                    setCurrentChannel("bristol-pro-shootout");
                  }
                }}
                className={`px-2.5 sm:px-3.5 py-1 rounded-lg font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeNetTab === "PRO"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>PRO NET</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNetTab("PUBLIC");
                  if (!ALL_CHANNELS.filter(c => c.netType === "PUBLIC").some(c => c.id === currentChannel)) {
                    setCurrentChannel("general-society");
                  }
                }}
                className={`px-2.5 sm:px-3.5 py-1 rounded-lg font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeNetTab === "PUBLIC"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>PUBLIC NET</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
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
                {activeNetTab === "PRO" ? "VERIFIED SQUAD COMMS" : "OPEN SOCIETY"}
              </span>
            </div>
          </div>

          {/* Desktop Channel Pills */}
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
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-mono text-xs transition-all shrink-0 flex items-center gap-1.5 border relative ${
                    isActive
                      ? "bg-amber-500 text-black font-bold border-amber-400 shadow-tactical-glow scale-[1.02]"
                      : "bg-black/50 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className={isActive ? "text-black" : "text-amber-400"}>#</span>
                  <span>{ch.name}</span>

                  {/* Post Counter Badge on Pill */}
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5 ${
                    isActive
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-400/60 shadow-sm"
                      : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  }`} title={`${engagement.postCount} posts in #${ch.name}`}>
                    <MessageSquare className="w-2 h-2 text-cyan-400" />
                    <span>{engagement.postCount}</span>
                  </span>

                  {unread > 0 && !isActive ? (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* 3. MAIN COMMS MATRIX — fills all remaining viewport height */}
      <div className={`flex-1 min-h-0 overflow-hidden px-2 sm:px-4 lg:px-6 pb-2 sm:pb-3 grid grid-cols-1 ${!isFullscreen ? "lg:grid-cols-12" : ""} gap-3`}>

        {/* DESKTOP-ONLY Channels Sidebar (Hidden in Fullscreen or Mobile) */}
        {!isFullscreen && (
          <div className="hidden lg:block lg:col-span-4 space-y-4">
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
                  const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setCurrentChannel(ch.id)}
                      data-telemetry={`chat_channel_${ch.id}`}
                      className={`w-full p-3 rounded-2xl text-left transition-all border ${
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
                        <div className="flex items-center gap-1.5">
                          {/* Post Counter on Channel Card */}
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{engagement.postCount} {engagement.postCount === 1 ? "post" : "posts"}</span>
                          </span>

                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                            isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"
                          }`}>
                            {ch.badge}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-400 line-clamp-1 flex-1">
                          {ch.desc}
                        </p>
                        {engagement.reactionCount > 0 && (
                          <span className="text-[9px] font-mono text-amber-300/80 flex items-center gap-0.5 shrink-0 font-bold">
                            <Flame className="w-2.5 h-2.5 text-amber-400" />
                            {engagement.reactionCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* DOPE Drop Action Box */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    Tactical DOPE Card
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Holston 340y Spec</span>
                </div>
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

            </div>
          </div>
        )}

        {/* MAIN CHAT STREAM & TRANSMITTER */}
        <div
          className={`${
            !isFullscreen ? "lg:col-span-8" : ""
          } md:ios-glass rounded-none md:rounded-2xl sm:rounded-3xl border-0 md:border border-white/10 flex flex-col overflow-hidden md:shadow-2xl relative h-full min-h-0`}
        >
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
                const isPlink = msg.author.id === "plink_ai_moderator";
                // Plink warning tier from aiEngine field
                // Derive Plink warning severity: toxicityScore encodes tier * 30
                const plinkSeverity: "warn" | "alert" | "info" = isPlink
                  ? msg.aiModerationReport
                    ? (msg.aiModerationReport.toxicityScore >= 60 ? "alert" : "warn")
                    : "info"
                  : "info";

                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 md:p-5 rounded-xl md:rounded-2xl border transition-all space-y-1.5 md:space-y-3 ${
                      isPlink
                        ? plinkSeverity === "alert"
                          ? "bg-gradient-to-r from-red-950/50 to-black/80 border-red-500/30"
                          : plinkSeverity === "warn"
                          ? "bg-gradient-to-r from-amber-950/40 to-black/80 border-amber-500/30"
                          : "bg-gradient-to-r from-cyan-950/40 to-black/80 border-cyan-500/25"
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
                          isPlink
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/50"
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
                          {isPlink ? "🤖" : isMasterOwner ? "👑" : isOwnerAdmin ? "🎖️" : isAdmin ? "🛡️" : isMod ? "⚖️" : (msg.author.callsign?.slice(0, 2) || "SS")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs md:text-sm font-bold truncate ${isPlink ? "text-cyan-300" : isMasterOwner ? "text-amber-300" : isOwnerAdmin ? "text-emerald-300" : isAdmin ? "text-cyan-300" : isMod ? "text-purple-300" : "text-white"}`}>
                              {msg.author.name}
                            </span>
                            {/* Callsign brackets — desktop only */}
                            {msg.author.callsign && !isPlink && (
                              <span className="hidden md:inline text-xs font-mono text-amber-400 font-bold">
                                [{msg.author.callsign}]
                              </span>
                            )}
                            <span
                              className={`text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                isPlink
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
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
                              {isMasterOwner ? "👑 OWNER" : isOwnerAdmin ? "🎖️ ADMIN" : isAdmin ? "🛡️ ADMIN" : isMod ? "⚖️ MOD" : (msg.author.badgeText || msg.author.role)}
                            </span>
                            {/* Timestamp — inline on mobile */}
                            <span className="text-[10px] md:hidden text-slate-500 font-mono">{msg.timestamp}</span>
                          </div>
                          {/* Rig line — desktop only */}
                          {msg.author.rifleSetup && (
                            <div className="hidden md:block text-[10px] font-mono text-slate-400 truncate max-w-md">
                              Rig: {msg.author.rifleSetup}
                            </div>
                          )}
                          {/* Plink AI label — desktop only */}
                          {isPlink && (
                            <div className="hidden md:flex text-[10px] font-mono text-cyan-500 items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                              AI-powered · All channels monitored
                            </div>
                          )}
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
                        ) : isPlink ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 font-bold">AI</span>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>


                    {/* Standard Content */}
                    {msg.content && (
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        {msg.content}
                      </p>
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

          {/* TRANSMITTER INPUT BAR */}
          <form id="tour-step-ptt" onSubmit={handleSendMessage} className="p-2 md:p-4 bg-black/85 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-[max(0.6rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Main text input */}
              <input
                type="text"
                placeholder={isListening ? "Listening…" : (typeof window !== "undefined" && window.innerWidth < 768 ? "Message..." : `Broadcast to #${currentChannelData.name}...`)}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  // When keyboard opens on mobile, scroll messages to bottom so replies are visible
                  setTimeout(() => {
                    if (messagesContainerRef.current) {
                      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                  }, 300);
                }}
                spellCheck={true}
                autoCorrect="on"
                autoCapitalize="sentences"
                autoComplete="off"
                className="flex-1 min-w-0 px-3 py-2.5 md:px-4 md:py-3 rounded-full md:rounded-2xl bg-white/[0.06] border border-white/10 text-white text-sm md:text-base focus:border-amber-400 focus:outline-none placeholder:text-slate-400 placeholder:text-sm"
              />

              {/* Push-to-Talk mic button */}
              <button
                type="button"
                onClick={handlePushToTalk}
                className={`p-2.5 md:p-3 rounded-full md:rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-300 hover:text-white"
                }`}
                title={isListening ? "Listening…" : "Voice input"}
              >
                <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isListening ? "text-white" : "text-slate-300"}`} />
              </button>

              {/* DOPE card button — desktop only */}
              <button
                id="tour-step-dope"
                type="button"
                onClick={() => setIsDopeModalOpen(true)}
                className="hidden md:flex p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-cyan-300 hover:text-cyan-200 transition-all items-center gap-1 text-sm font-mono shrink-0"
                title="Drop DOPE Card"
              >
                <Crosshair className="w-4 h-4" />
                <span>DOPE</span>
              </button>

              {/* Send */}
              <button
                type="submit"
                disabled={isAiScanning}
                data-telemetry="chat_send_button"
                className="p-2.5 md:p-3 md:px-5 rounded-full md:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:brightness-110 active:scale-95 transition-all shadow-tactical-glow flex items-center gap-1.5 text-sm font-mono disabled:opacity-50 shrink-0"
                title="Send"
              >
                {isAiScanning ? (
                  <span className="animate-spin text-sm">⏳</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden md:inline">TRANSMIT</span>
                  </>
                )}
              </button>
            </div>

            {/* Transmitting footer: Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between text-xs font-mono text-slate-400 px-1 pt-1">
              <span>
                Transmitting as: <strong className="text-slate-200">[{shooterProfile.callsign}]</strong>
              </span>
              {isListening && (
                <span className="flex items-center gap-1.5 text-red-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  LISTENING — speak now
                </span>
              )}
            </div>
          </form>
        </div>
      </div>


      {/* 4. TACTICAL DOPE DROP BUILDER MODAL */}
      {isDopeModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-lg w-full border border-cyan-500/40 shadow-2xl p-5 sm:p-8 space-y-5">
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

            <form onSubmit={handleSendDopeCard} className="space-y-3.5 sm:space-y-4">
              {/* Target Distance & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Target Distance</label>
                  <input
                    type="text"
                    value={dopeFormData.targetDistance}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, targetDistance: e.target.value })}
                    placeholder="e.g. 340 YDS"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Elevation & Wind Holds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-amber-400 font-bold">Elevation Dial / Hold</label>
                  <input
                    type="text"
                    value={dopeFormData.elevationMils}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, elevationMils: e.target.value })}
                    placeholder="e.g. 8.4 MIL"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-base sm:text-xs font-bold focus:border-amber-400 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-500/40 text-cyan-300 font-mono text-base sm:text-xs font-bold focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Wind Speed & Ammo Lot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Wind Speed & Vector</label>
                  <input
                    type="text"
                    value={dopeFormData.windVelocity}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, windVelocity: e.target.value })}
                    placeholder="e.g. 9 MPH @ 260° WNW"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Ammunition Lot</label>
                  <input
                    type="text"
                    value={dopeFormData.ammo}
                    onChange={(e) => setDopeFormData({ ...dopeFormData, ammo: e.target.value })}
                    placeholder="e.g. Lapua Center-X (1,062 FPS)"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDopeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 shadow-tactical-glow flex items-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>TRANSMIT DOPE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SHOOTER PROFILE CUSTOMIZER MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-lg w-full border border-amber-500/40 shadow-2xl p-5 sm:p-7 space-y-4 max-h-[92dvh] overflow-y-auto ios-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Marksman Profile & Credential
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your verified callsign, pass, and rig specs
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
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  profileActiveTab === "PASS"
                    ? "bg-emerald-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Digital Member Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileActiveTab("EDIT")}
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  profileActiveTab === "EDIT"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Callsign & Rig</span>
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
                  accessLevel={shooterProfile.role === "PRO_COMPETITOR" ? "PRO COMPETITOR" : "CHAT ACCESS"}
                  showDownload={true}
                />

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setProfileActiveTab("EDIT")}
                    className="text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Need to change your callsign or rifle build? Edit Profile →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: Edit Callsign & Shooter Settings Form */
              <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Shooter Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-base sm:text-xs font-bold focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

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

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">System Role</label>
                  {(profileForm.role === "MASTER_OWNER" || profileForm.role === "DEV_ADMIN" || profileForm.role === "OWNER_ADMIN" || profileForm.role === "ADMIN" || profileForm.role === "MODERATOR") ? (
                    <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                      profileForm.role === "OWNER_ADMIN"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : profileForm.role === "ADMIN"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                        : profileForm.role === "MODERATOR"
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}>
                      <span className="text-xl shrink-0">
                        {profileForm.role === "OWNER_ADMIN" ? "🎖️" : profileForm.role === "ADMIN" ? "🛡️" : profileForm.role === "MODERATOR" ? "⚖️" : "👑"}
                      </span>
                      <div>
                        <div className="font-extrabold text-xs">
                          {profileForm.role === "OWNER_ADMIN"
                            ? "OWNER ADMIN (EXECUTIVE CLEARANCE)"
                            : profileForm.role === "ADMIN"
                            ? "SYSTEM ADMINISTRATOR (COMMAND)"
                            : profileForm.role === "MODERATOR"
                            ? "COMMS MODERATOR (CHAT DEFENSE)"
                            : "MASTER OWNER / DEV ADMIN (ROOT ACCESS)"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {profileForm.role === "OWNER_ADMIN"
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
                    className={`px-5 py-2 rounded-xl font-mono font-bold text-xs shadow-tactical-glow transition-all ${
                      profileSaved
                        ? "bg-emerald-500 text-white scale-105"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110"
                    }`}
                  >
                    {profileSaved ? "✓ SAVED!" : "SAVE PROFILE"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
      />

      {/* 7. BOT CHATS CARD WITH COUNTS, BOT NAMES & TONE AUDITION */}
      <BotRosterCard
        isOpen={isBotCardOpen}
        onClose={() => setIsBotCardOpen(false)}
        messages={messages}
        botsEnabled={botsEnabled}
        onToggleBots={() => setBotsEnabled(!botsEnabled)}
        botSpeed={botSpeed}
        onChangeSpeed={(speed) => setBotSpeed(speed)}
        currentChannel={currentChannel}
        onAddBotMessage={(msg) => setMessages((prev) => [...prev, msg])}
        soundEnabled={soundEnabled}
        badActorEnabled={badActorEnabled}
        onToggleBadActor={() => setBadActorEnabled(!badActorEnabled)}
      />
    </div>
  );
}

