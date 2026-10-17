"use client";

import { ChatAuthGate } from "@/components/chat/ChatAuthGate";
import { ChatChannelSidebar } from "@/components/chat/ChatChannelSidebar";
import { ChatDopeCardModal } from "@/components/chat/ChatDopeCardModal";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ShooterDossierModal } from "@/components/chat/ShooterDossierModal";
import { ChatTermsModal } from "@/components/chat/ChatTermsModal";
import { ChatMobileMenuModal } from "@/components/chat/ChatMobileMenuModal";
import { ActiveMarksmenModal } from "@/components/chat/ActiveMarksmenModal";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
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
  Camera,
  LogOut,
  Plus,
  Trash2
} from "lucide-react";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { ChatMessage, DopeCardData, DirectPartner } from "@/lib/types";
import { evaluateChatMessage } from "@/lib/ai-moderator";
import { recordTelemetryEvent } from "@/lib/telemetry";
import { recordCommsAbuseAlert } from "@/lib/abuse-moderation";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";
import { analyzeMsgForPlink, buildPlinkMessage, getRoDirectAnswer } from "@/lib/plink-engine";
import { ChatTour } from "@/components/chat/ChatTour";
import { ChannelPickerModal } from "@/components/chat/ChannelPickerModal";
import { startBotEngine, BotSpeed, logBotActivity, subscribeToBotActivity } from "@/lib/chat-bots";
import {
  playTransmitChirp,
  playIncomingChirp,
  playDirectMessageChirp,
  playToggleAudioTone,
  playRealCommsChirp,
  playBotTelemetryChirp,
  playTacticalChirp as rawPlayTacticalChirp,
  unlockAudio,
} from "@/lib/chat-audio";
import { clearCommsAlert, incrementUnreadMessages } from "@/lib/comms-status";
import { getDmChannelId, parseDmParticipants, normalizeCallsign } from "@/lib/chat-utils";
import {
  DARK_AVATAR_COLORS,
  getAvatarColor,
  getUserInitials,
  formatLastActive,
} from "@/lib/avatar-colors";

// Tactical Network Definition
interface ChannelConfig {
  id: string;
  name: string;
  badge: string;
  desc: string;
  netType: "PUBLIC" | "PRO";
  activeUsers: number;
  adminOnly?: boolean;
  isCustom?: boolean;
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
    id: "dm_allen",
    callsign: "SUBX",
    name: "Allen Hurley",
    role: "OWNER_ADMIN",
    badgeText: "OWNER ADMIN",
    division: "Owner Admin / Executive",
    status: "offline",
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
    status: "offline",
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
  avatarColor?: string;
}

const DEFAULT_PROFILE: ShooterProfile = {
  name: "Guest Competitor",
  callsign: "GUEST",
  role: "MEMBER",
  division: "Pro Invitational Division",
  rifleSetup: "Unclaimed Rig",
  badgeText: "SOCIETY GUEST",
  avatarColor: "#0f172a",
};


function getChannelReadMap(callsign: string): Record<string, number> {
  if (typeof window === "undefined" || !callsign) return {};
  try {
    const raw = localStorage.getItem(`subsonic_read_map_${callsign.toLowerCase()}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markChannelRead(callsign: string, channelId: string, timestampMs = Date.now()) {
  if (typeof window === "undefined" || !callsign || !channelId) return;
  try {
    const map = getChannelReadMap(callsign);
    map[channelId] = Math.max(map[channelId] || 0, timestampMs);
    localStorage.setItem(`subsonic_read_map_${callsign.toLowerCase()}`, JSON.stringify(map));
  } catch {}
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeNetTab, setActiveNetTab] = useState<"PRO" | "PUBLIC">("PRO");
  const [currentChannel, setCurrentChannel] = useState("invitational");
  const [inputText, setInputText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("subsonic_chat_sound_enabled");
      if (stored !== null) return stored === "true";
    }
    return true;
  });

  // Fullscreen / Handheld Immersive Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobileRef = useRef(false);

  // Shooter Profile State
  const [shooterProfile, setShooterProfile] = useState<ShooterProfile>(DEFAULT_PROFILE);
  const isShooterAdmin = useMemo(() => {
    const role = (shooterProfile?.role || "").toUpperCase();
    const cs = (shooterProfile?.callsign || "").toUpperCase();
    return (
      role === "MASTER_OWNER" ||
      role === "OWNER_ADMIN" ||
      role === "DEV_ADMIN" ||
      role === "ADMIN" ||
      ["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY"].includes(cs)
    );
  }, [shooterProfile]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ShooterProfile>(DEFAULT_PROFILE);
  const [isChatUserMenuOpen, setIsChatUserMenuOpen] = useState(false);
  const [isChatMobileUserMenuOpen, setIsChatMobileUserMenuOpen] = useState(false);
  const chatUserMenuRef = useRef<HTMLDivElement>(null);
  const chatMobileUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatUserMenuRef.current && !chatUserMenuRef.current.contains(e.target as Node)) {
        setIsChatUserMenuOpen(false);
      }
      if (chatMobileUserMenuRef.current && !chatMobileUserMenuRef.current.contains(e.target as Node)) {
        setIsChatMobileUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Direct Comms (1-on-1 Closed Net) State
  const [directPartners, setDirectPartners] = useState<DirectPartner[]>(INITIAL_DIRECT_PARTNERS);
  const [selectedDossierShooter, setSelectedDossierShooter] = useState<DirectPartner | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const isDirectMode = currentChannel.startsWith("dm_");
  const activeDirectPartner = useMemo(() => {
    if (!isDirectMode) return null;
    const found = directPartners.find((p) => p.id === currentChannel);
    if (found) return found;

    // Check if channel is canonical (e.g. dm_radar_testx)
    const myCallsign = (shooterProfile.callsign || "").toUpperCase();
    const parts = parseDmParticipants(currentChannel);
    if (parts) {
      const other = (parts[0].toUpperCase() === myCallsign ? parts[1] : parts[0]).toUpperCase();
      const byCallsign = directPartners.find((p) => p.callsign.toUpperCase() === other);
      if (byCallsign) return byCallsign;
      return {
        id: currentChannel,
        callsign: other,
        name: other,
        role: "PRO_COMPETITOR" as const,
        badgeText: "COMPETITOR",
        status: "offline" as const,
        bio: "Verified competitor on direct encrypted frequency.",
      };
    }

    const clean = currentChannel.replace("dm_", "").toUpperCase();
    return {
      id: currentChannel,
      callsign: clean,
      name: clean,
      role: "PRO_COMPETITOR" as const,
      badgeText: "COMPETITOR",
      status: "offline" as const,
      bio: "Verified competitor on direct encrypted frequency.",
    };
  }, [currentChannel, directPartners, isDirectMode, shooterProfile.callsign]);

  // Tactical DOPE Drop Modal State
  const [isDopeModalOpen, setIsDopeModalOpen] = useState(false);
  const [dopeFormData, setDopeFormData] = useState<DopeCardData>({
    targetDistance: "150 YDS",
    targetDescription: "Stage 4 • Diamond KYL Rack",
    elevationMils: "3.9 MIL",
    windHoldMils: "L 0.4 MIL",
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

  // Custom Admin-Created Channels State
  const [customChannels, setCustomChannels] = useState<ChannelConfig[]>([]);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomBadge, setNewRoomBadge] = useState("MATCH ROOM");
  const [newRoomAdminOnly, setNewRoomAdminOnly] = useState(false);
  const [isSavingNewRoom, setIsSavingNewRoom] = useState(false);
  const [newRoomError, setNewRoomError] = useState<string | null>(null);

  // Active channel list (Invitational Official Comms + Admin-Created Rooms)
  const visibleChannels = useMemo(() => {
    const merged: ChannelConfig[] = [...ALL_CHANNELS];
    for (const ch of customChannels) {
      if (ch.id === "invitational") continue;
      if (ch.adminOnly && !isShooterAdmin) continue;
      if (!merged.some((m) => m.id === ch.id)) {
        merged.push(ch);
      }
    }
    return merged;
  }, [customChannels, isShooterAdmin]);

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
    return visibleChannels.find((ch) => ch.id === currentChannel) || visibleChannels[0] || ALL_CHANNELS[0];
  }, [currentChannel, isDirectMode, activeDirectPartner, visibleChannels]);

  const filteredMessages = useMemo(() => {
    const avatarByCallsign = new Map<string, string>();
    for (const p of directPartners) {
      if (p.callsign && p.image && !p.image.includes("SS-RWB-LOGO")) {
        avatarByCallsign.set(p.callsign.toUpperCase(), p.image);
        if (p.callsign.toUpperCase() === "SUBX") {
          avatarByCallsign.set("ALLEN", p.image);
          avatarByCallsign.set("AHURLEY", p.image);
        }
      }
    }
    if (shooterProfile?.callsign && shooterProfile?.image && !shooterProfile.image.includes("SS-RWB-LOGO")) {
      const myCall = shooterProfile.callsign.toUpperCase();
      avatarByCallsign.set(myCall, shooterProfile.image);
      if (myCall === "SUBX") {
        avatarByCallsign.set("ALLEN", shooterProfile.image);
        avatarByCallsign.set("AHURLEY", shooterProfile.image);
      }
    }

    return messages
      .filter((m) => m.channelId === currentChannel)
      .filter(
        (m) =>
          m.author?.id !== "plink_ai_moderator" &&
          m.author?.callsign?.toUpperCase() !== "RO" &&
          m.author?.callsign?.toUpperCase() !== "RO BOT" &&
          m.author?.name?.toUpperCase() !== "RO" &&
          m.author?.name?.toUpperCase() !== "RO BOT"
      )
      .filter(
        (m, idx, arr) =>
          arr.findIndex(
            (x) =>
              x.id === m.id ||
              (x.author.id === m.author.id &&
                x.content === m.content &&
                x.content.includes("Welcome to The Hideout"))
          ) === idx
      )
      .map((m) => {
        const call = (m.author?.callsign || "").toUpperCase();
        const isAllen = call === "SUBX" || call === "ALLEN" || call === "AHURLEY" || m.author?.name?.toLowerCase().includes("allen hurley");
        const latestAvatar =
          avatarByCallsign.get(call) ||
          (isAllen ? avatarByCallsign.get("SUBX") : undefined) ||
          (m.author?.avatarUrl && !m.author.avatarUrl.includes("SS-RWB-LOGO") ? m.author.avatarUrl : undefined);
        if (latestAvatar && latestAvatar !== m.author?.avatarUrl) {
          return {
            ...m,
            author: {
              ...m.author,
              avatarUrl: latestAvatar,
            },
          };
        }
        return m;
      });
  }, [messages, currentChannel, directPartners, shooterProfile?.callsign, shooterProfile?.image]);

  const handleOpenDossier = useCallback((shooter: DirectPartner) => {
    const call = (shooter.callsign || "").toUpperCase();
    const matchedPartner = directPartners.find(
      (p) => p.callsign.toUpperCase() === call || (call === "ALLEN" && p.callsign.toUpperCase() === "SUBX")
    );
    const selfMatch =
      shooterProfile?.callsign?.toUpperCase() === call ? shooterProfile.image : undefined;
    setSelectedDossierShooter({
      ...(matchedPartner || {}),
      ...shooter,
      image: shooter.image || matchedPartner?.image || selfMatch,
    });
    setIsDossierModalOpen(true);
    playTacticalChirp(1100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directPartners, shooterProfile?.callsign, shooterProfile?.image]);

  const handleStartDirectComms = useCallback((shooter: DirectPartner) => {
    const myCallsign = shooterProfile.callsign || "";
    const targetChannelId = shooter.id === "dm_ro"
      ? "dm_ro"
      : getDmChannelId(myCallsign, shooter.callsign);

    const partnerWithId = { ...shooter, id: targetChannelId };

    setDirectPartners((prev) => {
      const existsIndex = prev.findIndex((p) => p.callsign.toUpperCase() === shooter.callsign.toUpperCase());
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = partnerWithId;
        return copy;
      }
      return [partnerWithId, ...prev];
    });
    setCurrentChannel(targetChannelId);
    markChannelRead(myCallsign, targetChannelId, Date.now());
    setUnreadCounts((prev) => ({ ...prev, [targetChannelId]: 0 }));
    setIsDossierModalOpen(false);
    playTacticalChirp(1200);
  }, [shooterProfile.callsign]);

  const handleBackToInvitational = useCallback(() => {
    setCurrentChannel("invitational");
    playTacticalChirp(900);
  }, []);

  const handleOpenNewRoomModal = useCallback(() => {
    setNewRoomName("");
    setNewRoomDesc("");
    setNewRoomBadge("MATCH ROOM");
    setNewRoomAdminOnly(false);
    setNewRoomError(null);
    setIsNewRoomModalOpen(true);
    playTacticalChirp(1100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNewRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setNewRoomError("Please enter a room name (e.g. lunch-menu).");
      return;
    }

    setIsSavingNewRoom(true);
    setNewRoomError(null);
    try {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName.trim(),
          desc: newRoomDesc.trim() || `Match room #${newRoomName.trim().toLowerCase()}`,
          badge: newRoomBadge.trim() || (newRoomAdminOnly ? "ADMIN ONLY" : "MATCH ROOM"),
          adminOnly: newRoomAdminOnly,
          callsign: shooterProfile.callsign,
          role: shooterProfile.role,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.channel) {
        setNewRoomError(data.error || "Could not create room.");
        setIsSavingNewRoom(false);
        return;
      }

      if (Array.isArray(data.channels)) {
        setCustomChannels(data.channels);
      } else {
        setCustomChannels((prev) => [
          ...prev.filter((c) => c.id !== data.channel.id),
          data.channel,
        ]);
      }

      setCurrentChannel(data.channel.id);
      setIsNewRoomModalOpen(false);
      setIsSavingNewRoom(false);
      playTacticalChirp(1200);
    } catch {
      setNewRoomError("Network error while creating room.");
      setIsSavingNewRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!roomId || roomId === "invitational") return;
    if (typeof window !== "undefined" && !window.confirm(`Remove chat room #${roomId}?`)) {
      return;
    }

    setCustomChannels((prev) => prev.filter((c) => c.id !== roomId));
    if (currentChannel === roomId) {
      setCurrentChannel("invitational");
    }

    try {
      const res = await fetch("/api/chat/channels", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roomId,
          callsign: shooterProfile.callsign,
          role: shooterProfile.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.channels)) {
          setCustomChannels(data.channels);
        }
      }
      playTacticalChirp(700);
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  // Channel engagement & post counters map (dynamic per-room transmission & reaction counts)
  const channelEngagementMap = useMemo(() => {
    const map: Record<string, { postCount: number; reactionCount: number; dopeCount: number }> = {};
    for (const ch of visibleChannels) {
      map[ch.id] = { postCount: 0, reactionCount: 0, dopeCount: 0 };
    }
    for (const m of messages) {
      if (
        m.author?.id === "plink_ai_moderator" ||
        m.author?.callsign?.toUpperCase() === "RO" ||
        m.author?.callsign?.toUpperCase() === "RO BOT" ||
        m.author?.name?.toUpperCase() === "RO BOT"
      ) {
        continue;
      }
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
  }, [messages, visibleChannels]);

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
  const [pinnedAnnouncement] = useState<string | null>(null);
  const [announcementCollapsed, setAnnouncementCollapsed] = useState(true);

  // Unread counts per channel (channelId -> count)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const unreadDmCount = useMemo(() => {
    return Object.entries(unreadCounts).reduce((acc, [chId, count]) => {
      return chId.startsWith("dm_") ? acc + (count || 0) : acc;
    }, 0);
  }, [unreadCounts]);
  const prevChannelRef = useRef(currentChannel);

  // Real-time marksmen presence & last active timestamps
  const [onlineCallsigns, setOnlineCallsigns] = useState<string[]>([]);
  const [lastActiveMap, setLastActiveMap] = useState<Record<string, number>>({});

  // iOS visual viewport height for keyboard avoidance
  const [chatHeight, setChatHeight] = useState<string>("calc(100dvh - 10rem)");

  // Plink AI Moderator state
  const [plinkWarningHistory, setPlinkWarningHistory] = useState<Record<string, number>>({});
  const allenWelcomedRef = useRef<Set<string>>(new Set());
  // RO moderator: message IDs already evaluated, session start, per-author recent texts (flood window)
  const roProcessedIdsRef = useRef<Set<string>>(new Set());
  const roSessionStartRef = useRef<number>(Date.now());
  const roRecentByAuthorRef = useRef<Record<string, { text: string; t: number }[]>>({});

  // Live Mountain Weather Telemetry state
  const [liveWeather, setLiveWeather] = useState<{
    temp: number;
    dewPoint?: number;
    humidity: number;
    pressureHpa: number;
    pressureInHg?: number;
    windSpeed: number;
    windGusts: number;
    windDirection: string;
    windDegrees: number;
    densityAltitude: number;
    mach1Fps?: number;
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
  const [channelModalInitialTab, setChannelModalInitialTab] = useState<"ALL" | "MATCH" | "DIRECT">("ALL");
  // Tactical Mobile Menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Safe tactical audio chirp that respects mute state
  const playTacticalChirp = useCallback((frequency = 940) => {
    if (soundEnabledRef.current) {
      rawPlayTacticalChirp(frequency);
    }
  }, []);

  // Tactical Audio Toggle with instant feedback and persistent preference
  const handleToggleSound = useCallback(() => {
    unlockAudio();
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_sound_enabled", String(next));
        } catch {}
      }
      playToggleAudioTone(next);
      return next;
    });
  }, []);

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
              parsedShooter.callsign === "SUBX" ||
              parsedShooter.callsign === "SAID DONE" ||
              parsedShooter.callsign === "SAIDDONE" ||
              parsedShooter.callsign === "ALLEN" ||
              parsedShooter.callsign === "AHURLEY" ||
              parsedShooter.member_id === "SS-PRO-SUBX" ||
              parsedShooter.member_id === "SS-2026-0002" ||
              (parsedShooter.name && parsedShooter.name.toLowerCase().includes("hurley"))
            ) {
              parsedShooter.member_id = "SS-PRO-SUBX";
              parsedShooter.name = "Allen Hurley";
              parsedShooter.role = "OWNER_ADMIN";
              parsedShooter.division = "Owner Admin / Executive";
              parsedShooter.badgeText = "OWNER ADMIN";
              parsedShooter.callsign = "SUBX";
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(parsedShooter));
                localStorage.setItem("subsonic_member_profile", JSON.stringify({
                  member_id: "SS-PRO-SUBX",
                  full_name: "Allen Hurley",
                  callsign: "SUBX",
                  state: "TN",
                  experience_level: "Owner Admin / Executive",
                  rifle_setup: parsedShooter.rifleSetup || "Modacam Custom Precision V-22 / ZCO 527",
                  created_at: "2026-07-04T12:00:00Z"
                }));
              } catch {}
            }
            if (!parsedShooter.avatarColor) {
              parsedShooter.avatarColor = getAvatarColor(undefined, parsedShooter.callsign || parsedShooter.name).hex;
            }
            setShooterProfile(parsedShooter);
            setProfileForm(parsedShooter);
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
        const myCallsign = shooterProfile.callsign || "";
        const url = `/api/chat/messages?channel=${encodeURIComponent(currentChannel)}&userCallsign=${encodeURIComponent(myCallsign)}&limit=60`;
        const res = await fetch(url);
        if (!res.ok || !isMounted) return;
        const data = await res.json();

        if (Array.isArray(data.customChannels)) {
          setCustomChannels(data.customChannels);
        }

        // 1. Process messages for active channel
        if (Array.isArray(data.messages)) {
          let locallyDeleted = new Set<string>();
          if (typeof window !== "undefined") {
            try {
              locallyDeleted = new Set(JSON.parse(localStorage.getItem("subsonic_deleted_chat_ids") || "[]"));
            } catch {}
          }
          const validMessages = data.messages.filter((m: ChatMessage) => !locallyDeleted.has(m.id));

          setMessages((prev) => {
            const incomingMap = new Map<string, ChatMessage>(
              validMessages.map((m: ChatMessage) => [m.id, m])
            );
            const prevIds = new Set(prev.map((m) => m.id));

            // Check if any new external messages arrived for the comms chirp
            const newIncoming = validMessages.filter((m: ChatMessage) => !prevIds.has(m.id));
            if (newIncoming.length > 0) {
              const hasExternalMsg = newIncoming.some(
                (m: ChatMessage) => m.author.callsign?.toUpperCase() !== myCallsign.toUpperCase()
              );
              if (hasExternalMsg && soundEnabledRef.current) {
                if (currentChannel.startsWith("dm_")) {
                  playDirectMessageChirp();
                } else {
                  playIncomingChirp();
                }
              }
            }

            // Update existing messages with edited content, reactions, or status
            let updated = prev.filter((m) => !locallyDeleted.has(m.id)).map((m) => {
              const serverMsg = incomingMap.get(m.id);
              if (serverMsg) {
                if (
                  serverMsg.content !== m.content ||
                  serverMsg.isEdited !== m.isEdited ||
                  serverMsg.imageUrl !== m.imageUrl ||
                  JSON.stringify(serverMsg.reactions) !== JSON.stringify(m.reactions) ||
                  serverMsg.moderationStatus !== m.moderationStatus
                ) {
                  return { ...m, ...serverMsg, imageUrl: serverMsg.imageUrl || m.imageUrl };
                }
              }
              return m;
            });

            // Reconcile deleted messages: if a message in this channel was created within the server window but is absent, remove it
            if (data.messages.length > 0) {
              const oldestServerMs = data.messages[0].createdAtMs || 0;
              const serverIdSet = new Set(data.messages.map((m: ChatMessage) => m.id));
              const nowMs = Date.now();
              updated = updated.filter((m: any) => {
                if (m.channelId && m.channelId !== currentChannel) return true;
                // Keep newly sent local messages for 15s while their POST (e.g. photo upload) is in flight
                if (m.createdAtMs && nowMs - m.createdAtMs < 15000) return true;
                if (m.createdAtMs && m.createdAtMs >= oldestServerMs && !serverIdSet.has(m.id)) {
                  if (m.id.startsWith("msg_local_") || m.id.startsWith("mock_")) return true;
                  return false;
                }
                return true;
              });
            }

            // Append new incoming messages
            if (newIncoming.length > 0) {
              updated = [...updated, ...newIncoming];
            }

            return updated;
          });

          if (data.latestTimestamp > lastSyncTimestampRef.current) {
            lastSyncTimestampRef.current = data.latestTimestamp;
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("subsonic_last_read_chat", Date.now().toString());
          }
        }

        // 2. Process active DM conversations & unread badges across channels
        if (Array.isArray(data.dmConversations)) {
          const myCall = (shooterProfile.callsign || "").toUpperCase();
          const readMap = getChannelReadMap(myCall);
          const deletedRaw = typeof window !== "undefined" ? localStorage.getItem("subsonic_deleted_members") : null;
          const deletedList = new Set(deletedRaw ? (JSON.parse(deletedRaw) as string[]).map((x) => x.toLowerCase()) : []);

          setDirectPartners((prev) => {
            // Prune any deleted partners or partners that have been purged
            const filtered = prev.filter(
              (p) => !deletedList.has(p.callsign.toLowerCase()) && !deletedList.has(p.id.toLowerCase())
            );
            let changed = filtered.length !== prev.length;
            const updated = [...filtered];

            for (const conv of data.dmConversations) {
              const partnerCall = (conv.partnerCallsign || "").toUpperCase();
              if (!partnerCall || partnerCall === myCall) continue;
              if (deletedList.has(partnerCall.toLowerCase()) || deletedList.has(conv.channelId.toLowerCase())) continue;

              const exists = updated.some(
                (p) => p.callsign.toUpperCase() === partnerCall || p.id === conv.channelId
              );
              if (!exists) {
                updated.push({
                  id: conv.channelId,
                  callsign: conv.partnerCallsign,
                  name: conv.partnerName || conv.partnerCallsign,
                  role: conv.partnerRole || "PRO_COMPETITOR",
                  badgeText: conv.partnerRole === "MASTER_OWNER" ? "DEV ADVISOR" : conv.partnerRole === "OWNER_ADMIN" ? "OWNER ADMIN" : "PRO SHOOTER",
                  division: conv.partnerDivision || "Pro Division",
                  status: "offline",
                  bio: "Verified competitor on direct encrypted frequency.",
                });
                changed = true;
              }
            }
            return changed ? updated : prev;
          });

          // Unread badges: only count as unread if the latest transmission arrived AFTER user last read this channel
          setUnreadCounts((prev) => {
            const updated: Record<string, number> = {};
            let hasNewIncoming = false;

            for (const conv of data.dmConversations) {
              if (conv.channelId === currentChannel) {
                markChannelRead(myCall, currentChannel, Math.max(conv.createdAtMs || 0, Date.now()));
                continue;
              }
              const lastRead = readMap[conv.channelId] || 0;
              if ((conv.createdAtMs || 0) > lastRead && conv.unreadCount > 0) {
                updated[conv.channelId] = conv.unreadCount;
                if (conv.unreadCount > (prev[conv.channelId] || 0)) {
                  hasNewIncoming = true;
                }
              }
            }

            if (hasNewIncoming && soundEnabledRef.current) {
              playDirectMessageChirp();
            }
            return updated;
          });
        }

        // 3. Update real-time online/offline presence & last active timestamps
        if (data.lastActiveMap && typeof data.lastActiveMap === "object") {
          setLastActiveMap((prev) => ({ ...prev, ...data.lastActiveMap }));
        }

        if (Array.isArray(data.onlineCallsigns)) {
          setOnlineCallsigns(data.onlineCallsigns);
          const onlineSet = new Set(data.onlineCallsigns.map((c: string) => c.toUpperCase()));
          setDirectPartners((prev) =>
            prev.map((p) => {
              if (p.isBot) return { ...p, status: "online" };
              const isOnline = onlineSet.has(p.callsign.toUpperCase());
              const newStatus: "online" | "offline" = isOnline ? "online" : "offline";
              return p.status !== newStatus ? { ...p, status: newStatus } : p;
            })
          );
        }
      } catch {
        // silent
      }
    };

    // Immediate initial sync on channel switch
    syncMessages();

    // Adaptive polling loop: 2.5s when active tab, 12s when backgrounded
    let pollInterval: ReturnType<typeof setInterval>;
    const setupPolling = (delay: number) => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(syncMessages, delay);
    };

    const isHidden = typeof document !== "undefined" && document.hidden;
    setupPolling(isHidden ? 12000 : 2500);

    const handleVisibilityChange = () => {
      if (!isMounted) return;
      if (document.hidden) {
        setupPolling(12000);
      } else {
        syncMessages();
        setupPolling(2500);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [currentChannel, isAuthenticated, shooterProfile.callsign]);

  // ── Load Registered Shooters & Competitors into Direct Partners ──────────
  useEffect(() => {
    if (!isAuthenticated || !shooterProfile.callsign) return;
    let isCancelled = false;

    const loadShooters = async () => {
      try {
        const res = await fetch("/api/shooters");
        if (!res.ok || isCancelled) return;
        const data = await res.json();
        const shooters: any[] = Array.isArray(data.shooters) ? data.shooters : [];
        const deletedRaw = typeof window !== "undefined" ? localStorage.getItem("subsonic_deleted_members") : null;
        const deletedList = new Set(deletedRaw ? (JSON.parse(deletedRaw) as string[]).map((x) => x.toLowerCase()) : []);

        const myCallsign = (shooterProfile.callsign || "").toUpperCase();

        // Sync current logged-in shooter's headshot from database if available
        const myServerShooter = shooters.find((s) => {
          const sc = (s.callsign || "").toUpperCase();
          return (
            sc === myCallsign ||
            (myCallsign === "SUBX" && (sc === "ALLEN" || s.id?.toLowerCase() === "subx"))
          );
        });
        if (
          myServerShooter?.image &&
          !myServerShooter.image.includes("SS-RWB-LOGO") &&
          myServerShooter.image !== shooterProfile.image
        ) {
          setShooterProfile((prev) => {
            const next = { ...prev, image: myServerShooter.image };
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(next));
              } catch {}
            }
            return next;
          });
          setProfileForm((prev) => ({ ...prev, image: myServerShooter.image }));
        }

        setDirectPartners((prev) => {
          const partnersMap = new Map<string, DirectPartner>();

          // 1. Add Executives if not current user
          if (myCallsign !== "SUBX" && myCallsign !== "ALLEN" && myCallsign !== "SAID DONE") {
            const allenId = getDmChannelId(myCallsign, "SUBX");
            const allenRecord = shooters.find(
              (s) => (s.callsign || "").toUpperCase() === "SUBX" || s.id?.toLowerCase() === "subx"
            );
            partnersMap.set(allenId, {
              id: allenId,
              callsign: "SUBX",
              name: "Allen Hurley",
              role: "OWNER_ADMIN",
              badgeText: "OWNER ADMIN",
              division: "Owner Admin / Executive",
              status: "offline",
              bio: "Executive Match Host & Founder of The Hideout Invitational.",
              rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
              image:
                allenRecord?.image && !allenRecord.image.includes("SS-RWB-LOGO")
                  ? allenRecord.image
                  : undefined,
            });
          }

          if (myCallsign !== "RADAR" && myCallsign !== "ROB" && myCallsign !== "LTDAN") {
            const radarId = getDmChannelId(myCallsign, "RADAR");
            partnersMap.set(radarId, {
              id: radarId,
              callsign: "RADAR",
              name: "Rob Neilson",
              role: "MASTER_OWNER",
              badgeText: "MASTER ADMIN",
              division: "Master Admin",
              status: "offline",
              bio: "Master Admin",
              rifleSetup: "Systems & Infrastructure Architecture (Non-Shooter)",
            });
          }

          // 2. Map all registered shooters from database (excluding deleted members and test accounts)
          for (const s of shooters) {
            const sCallsign = (s.callsign || "").toUpperCase();
            const sName = (s.name || "").toUpperCase();
            if (!sCallsign || sCallsign === myCallsign) continue;
            if (sCallsign === "RO" || sCallsign === "RO BOT" || sName === "RO BOT") continue;
            if (sCallsign === "DOE" || sCallsign === "JOHNDOE" || sName.includes("JOHN DOE")) continue;
            if (deletedList.has(sCallsign.toLowerCase()) || (s.id && deletedList.has(s.id.toLowerCase()))) continue;

            const chId = getDmChannelId(myCallsign, sCallsign);
            const isOwner = sCallsign === "SUBX" || sCallsign === "SAID DONE" || sCallsign === "ALLEN";
            const isMaster = sCallsign === "RADAR" || sCallsign === "ROB";

            const existing = partnersMap.get(chId);
            const validImage =
              s.image && !s.image.includes("SS-RWB-LOGO")
                ? s.image
                : existing?.image;
            partnersMap.set(chId, {
              ...(existing || {}),
              id: chId,
              callsign: s.callsign,
              name: s.name || s.callsign,
              role: isMaster ? "MASTER_OWNER" : isOwner ? "OWNER_ADMIN" : (s.role || "PRO_COMPETITOR"),
              badgeText: isMaster ? "DEV ADVISOR" : isOwner ? "OWNER ADMIN" : (s.ranking || s.division || "PRO SHOOTER"),
              division: s.division || "Pro Invitational Division",
              status: existing?.status || "offline",
              bio: s.bio || s.quote || "Verified competitor on direct encrypted frequency.",
              rifleSetup: typeof s.rifleSetup === "object"
                ? `${s.rifleSetup.action || ""} ${s.rifleSetup.optic || ""}`.trim()
                : (s.rifleSetup || "Precision Rimfire"),
              image: validImage,
            });
          }

          // 3. Preserve any existing DM partners added dynamically (excluding deleted members and RO BOT)
          for (const p of prev) {
            const pCall = (p.callsign || "").toUpperCase();
            if (p.id === "dm_ro" || pCall === "RO" || pCall === "RO BOT") continue;
            if (pCall !== myCallsign) {
              if (deletedList.has(p.callsign.toLowerCase()) || deletedList.has(p.id.toLowerCase())) continue;
              const canonicalId = getDmChannelId(myCallsign, p.callsign);
              if (!partnersMap.has(canonicalId)) {
                partnersMap.set(canonicalId, { ...p, id: canonicalId });
              }
            }
          }

          return Array.from(partnersMap.values()).filter(
            (p) =>
              p.id !== "dm_ro" &&
              p.callsign.toUpperCase() !== "RO" &&
              p.callsign.toUpperCase() !== "RO BOT" &&
              !deletedList.has(p.callsign.toLowerCase()) &&
              !deletedList.has(p.id.toLowerCase())
          );
        });
      } catch (err) {
        console.error("Failed to load shooters for direct partners:", err);
      }
    };

    loadShooters();
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, shooterProfile.callsign]);

  // ── First-Login Welcome: Allen only ───────────────────────────────────────
  // Allen's welcome (with Competitor Packet button) shows ONE time per user —
  // the first time they enter chat. Tracked per callsign in localStorage.
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !shooterProfile.callsign) return;

    // No welcomes in direct / private chats
    if (currentChannel.startsWith("dm_")) return;

    const welcomeKey = `subsonic_chat_welcomed_${shooterProfile.callsign.toUpperCase()}`;
    try {
      if (typeof window !== "undefined" && localStorage.getItem(welcomeKey)) return;
    } catch {}
    if (allenWelcomedRef.current.size > 0) return;
    allenWelcomedRef.current.add(currentChannel);
    try {
      localStorage.setItem(welcomeKey, new Date().toISOString());
    } catch {}

    const now = new Date();
    const allenTimestamp = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const allenMsg: ChatMessage = {
      id: `welcome-allen-${currentChannel}`,
      channelId: currentChannel,
      type: "STANDARD",
      author: {
        id: "user-allen",
        name: "Allen Hurley",
        callsign: "SUBX",
        role: "OWNER_ADMIN",
        badgeText: "FOUNDER",
        division: "Executive / Match Host",
        rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
      },
      content: `Welcome to The Hideout, ${shooterProfile.callsign}. Two hundred and twenty acres of Tennessee ridgeline purpose-built for precision rimfire. Enjoy the chat, respect the range, and check the Competitor Packet below for schedule, Course of Fire and hotels.`,
      timestamp: allenTimestamp,
      reactions: [],
      moderationStatus: "APPROVED",
      aiModerationReport: { toxicityScore: 0, threatScore: 0, policyScore: 0, sentiment: "POSITIVE" as const, aiEngine: "System" },
    };

    setMessages((prev) => {
      if (prev.some((m) => m.id === allenMsg.id)) return prev;
      return [...prev, allenMsg];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, isAuthenticated, authChecked, shooterProfile.callsign]);

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
      if (shooterProfile.callsign) {
        markChannelRead(shooterProfile.callsign, currentChannel, Date.now());
      }
      prevChannelRef.current = currentChannel;
      lastSyncTimestampRef.current = 0;
      scrollContainerToBottom(false);
    }
  }, [currentChannel, scrollContainerToBottom, shooterProfile.callsign]);

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



  // Message history + live updates come from the server-backed sync above
  // (/api/chat/messages, polled every 2.5s). The browser no longer talks to the
  // database directly, so database access rules can stay locked down.

  // Handle Transmitting Message (Standard or DOPE Card or Photo)
  const handleTransmit = async (
    content: string,
    type: "STANDARD" | "DOPE_DROP" = "STANDARD",
    dopeCard?: DopeCardData,
    imageUrl?: string
  ) => {
    if (!content.trim() && !dopeCard && !imageUrl) return;

    setIsAiScanning(true);

    let evaluation: any = null;
    let aiEngine = "Google Gemini 2.5 Flash";

    const textToScan = content.trim() || (imageUrl ? "Transmitted photo attachment" : "");

    // 1. Try server-side Gemini 2.5 Flash route
    if (textToScan) {
      try {
        const res = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: textToScan + (dopeCard ? ` [DOPE Card: ${dopeCard.targetDistance} ${dopeCard.notes || ""}]` : ""),
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
        evaluation = evaluateChatMessage(textToScan, shooterProfile.role);
        aiEngine = "Subsonic Local Sentinel";
      }
    } else {
      evaluation = { status: "APPROVED", toxicityScore: 0, threatScore: 0, policyScore: 0, sentiment: "neutral" };
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

    const newMsg: ChatMessage & { createdAtMs?: number } = {
      id: "msg_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      channelId: currentChannel,
      type: type,
      dopeCard: dopeCard,
      imageUrl: imageUrl || undefined,
      createdAtMs: Date.now(),
      author: {
        id: "usr_" + shooterProfile.callsign.toLowerCase(),
        name: shooterProfile.name,
        callsign: shooterProfile.callsign,
        role: shooterProfile.role,
        badgeText: shooterProfile.badgeText,
        division: shooterProfile.division,
        rifleSetup: shooterProfile.rifleSetup,
        avatarUrl: shooterProfile.image,
        avatarColor: shooterProfile.avatarColor,
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
    setPendingImage(null);

    // Smoothly scroll only within the container for user's own sent message
    setTimeout(() => scrollContainerToBottom(true), 50);

    // Persist via the server (writes to the database; other members receive it via sync)
    const persistMessage = async (attempt = 1): Promise<void> => {
      try {
        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMsg }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (attempt < 2) return persistMessage(attempt + 1);
        console.error("Chat message failed to save:", err);
      }
    };
    void persistMessage();

    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_last_read_chat", Date.now().toString());
    }

    if (soundEnabled) {
      playTransmitChirp();
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
    // Direct messages to real marksmen/admins (e.g. Allen Hurley / SUBX) do not have simulated auto-replies.
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
    if (!inputText.trim() && !pendingImage) return;
    setIsTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    handleTransmit(inputText.trim(), "STANDARD", undefined, pendingImage || undefined);
  };

  const handleSendDopeCard = (e: React.FormEvent) => {
    e.preventDefault();
    const summaryText = `[DOPE CARD] Target: ${dopeFormData.targetDistance} • Dial: ${dopeFormData.elevationMils} • Wind Hold: ${dopeFormData.windHoldMils}`;
    handleTransmit(summaryText, "DOPE_DROP", dopeFormData);
    setIsDopeModalOpen(false);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: newContent.trim(),
              isEdited: true,
              editedAt: new Date().toISOString(),
            }
          : m
      )
    );

    try {
      const res = await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: messageId,
          content: newContent.trim(),
          editorCallsign: shooterProfile.callsign,
          editorRole: shooterProfile.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Edit message failed:", errData.error);
      } else {
        playTacticalChirp(900);
      }
    } catch (err) {
      console.error("Network error editing message:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    // 1. Optimistic update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    // 2. Persist deleted message ID in localStorage so client-side sync never restores it
    if (typeof window !== "undefined") {
      try {
        const stored: string[] = JSON.parse(localStorage.getItem("subsonic_deleted_chat_ids") || "[]");
        if (!stored.includes(messageId)) {
          stored.push(messageId);
          localStorage.setItem("subsonic_deleted_chat_ids", JSON.stringify(stored.slice(-500)));
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/chat/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: messageId,
          requesterCallsign: shooterProfile.callsign,
          requesterRole: shooterProfile.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn("Delete message server status:", errData.error || errData);
      } else {
        playTacticalChirp(700);
      }
    } catch (err) {
      console.error("Network error deleting message:", err);
    }
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
        window.dispatchEvent(new CustomEvent("subsonic_profile_updated", { detail: updated }));
      } catch {}

      // Persist to backend database
      fetch("/api/shooters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.callsign === "SUBX" ? "subx" : updated.callsign?.toLowerCase(),
          name: updated.name,
          callsign: updated.callsign,
          isProfileUpdate: true,
          isIntake: false,
          division: updated.division,
          image: updated.image,
          rifleSetup: { action: updated.rifleSetup },
        }),
      }).catch((e) => console.warn("Background shooter save error:", e));
    }
    // Show saved confirmation then close
    setProfileSaved(true);
    playTacticalChirp(1200);
    setTimeout(() => {
      setProfileSaved(false);
      setIsProfileModalOpen(false);
    }, 1500);
  };


  const handleAddReaction = async (messageId: string, emoji: string) => {
    const myCallsign = (shooterProfile?.callsign || "RADAR").toUpperCase();

    // Optimistic local update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const existing = currentReactions.find((r) => r.emoji === emoji);
        if (existing) {
          const userHasReacted = (existing.users || []).some(
            (u) => u.toUpperCase() === myCallsign || u.toLowerCase() === "you"
          );
          if (userHasReacted) {
            // Toggle off
            const remainingUsers = (existing.users || []).filter(
              (u) => u.toUpperCase() !== myCallsign && u.toLowerCase() !== "you"
            );
            if (remainingUsers.length === 0 || existing.count <= 1) {
              return {
                ...msg,
                reactions: currentReactions.filter((r) => r.emoji !== emoji),
              };
            }
            return {
              ...msg,
              reactions: currentReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: Math.max(1, r.count - 1), users: remainingUsers } : r
              ),
            };
          } else {
            // Increment
            return {
              ...msg,
              reactions: currentReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), myCallsign] } : r
              ),
            };
          }
        } else {
          // Brand new reaction
          return {
            ...msg,
            reactions: [...currentReactions, { emoji, count: 1, users: [myCallsign] }],
          };
        }
      })
    );

    // Audio tactical confirmation
    playTacticalChirp(900);

    // Persist to server
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reaction",
          messageId,
          emoji,
          userCallsign: myCallsign,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, ...data.message } : m))
          );
        }
      }
    } catch (err) {
      console.warn("Reaction persistence warning:", err);
    }
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

      setCurrentChannel("invitational");
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
    const prevCallsign = shooterProfile.callsign;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("subsonic_chat_authenticated");
        localStorage.removeItem("subsonic_shooter_profile");
        localStorage.removeItem("subsonic_member_profile");
      } catch (e) {
        console.warn("Failed to clear chat authentication from storage:", e);
      }
      // Signal server that this marksman logged out
      if (prevCallsign && prevCallsign !== "GUEST") {
        try {
          fetch("/api/chat/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callsign: prevCallsign, action: "logout" }),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }
    }
    setIsAuthenticated(false);
    setCurrentChannel("invitational");
    setDirectPartners(INITIAL_DIRECT_PARTNERS);
    setUnreadCounts({});
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
        <div className="shrink-0 px-2 sm:px-4 lg:px-6 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.35rem))] sm:pt-3">
        <div className="ios-glass rounded-2xl p-2 sm:p-3 border border-white/10">
          {/* Mobile Top Bar: Tactical Breadcrumbs + Quick Hub Switcher + Callsign + Actions */}
          <div className="flex sm:hidden items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 min-w-0">
              {/* Tactical Breadcrumb Trail: Direct Home Back Navigation */}
              <Link
                href="/"
                title="Return to Main Portal"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 active:scale-95 transition-all shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400 -mr-0.5" />
                <span className="font-extrabold text-xs text-slate-100">HOME</span>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-amber-400 font-extrabold text-xs">CHAT</span>
              </Link>

              {/* Shooter Callsign & Account Options Pill */}
              <div className="relative" ref={chatMobileUserMenuRef}>
                <button
                  id="tour-step-pass"
                  type="button"
                  onClick={() => setIsChatMobileUserMenuOpen(!isChatMobileUserMenuOpen)}
                  data-telemetry="chat_mobile_account_menu"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/60 border border-white/15 hover:border-amber-400/40 text-xs min-w-0 shrink cursor-pointer active:scale-95 transition-all"
                  title={`${shooterProfile.callsign} — Account & Session Options`}
                  aria-expanded={isChatMobileUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 overflow-hidden ring-1 ring-white/20 text-white font-bold font-mono"
                    style={{
                      backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                    }}
                  >
                    {shooterProfile.image ? (
                      <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                    ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                      <Radar className="w-3 h-3 text-cyan-300 stroke-[2.5]" />
                    ) : (
                      <span className="text-white font-bold tracking-tight text-[10px]">
                        {getUserInitials(shooterProfile.name, shooterProfile.callsign)}
                      </span>
                    )}
                  </div>
                  <span className={`font-mono font-bold text-xs truncate max-w-[80px] ${
                    shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                      ? "text-cyan-300"
                      : "text-amber-300"
                  }`}>
                    {shooterProfile.callsign}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isChatMobileUserMenuOpen ? "rotate-180 text-amber-400" : ""}`} />
                </button>

                {isChatMobileUserMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-60 ios-glass rounded-2xl p-2 border border-white/15 shadow-2xl backdrop-blur-2xl animate-fadeIn z-50 space-y-1">
                    <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 overflow-hidden ring-1 ring-white/20 text-white font-bold font-mono"
                        style={{
                          backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                        }}
                      >
                        {shooterProfile.image ? (
                          <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                        ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                          <Radar className="w-3.5 h-3.5 text-cyan-300 stroke-[2.5]" />
                        ) : (
                          <span>{getUserInitials(shooterProfile.name, shooterProfile.callsign)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-xs text-white truncate flex items-center gap-1.5">
                          <span>{shooterProfile.callsign}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans uppercase">Online</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {shooterProfile.badgeText || "SOCIETY OPERATIVE"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsChatMobileUserMenuOpen(false);
                        setIsFullProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Edit Profile &amp; Photos</span>
                    </button>

                    {isShooterAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsChatMobileUserMenuOpen(false);
                            handleOpenNewRoomModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/15 transition-colors text-left cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-amber-400" />
                          <span>Add New Chat Room</span>
                        </button>

                        <Link
                          href="/admin"
                          target="_blank"
                          onClick={() => setIsChatMobileUserMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsChatMobileUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions: Tactical Menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isShooterAdmin && (
                <button
                  type="button"
                  onClick={handleOpenNewRoomModal}
                  className="h-7 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 active:scale-95 transition-all"
                  title="Add New Chat Room (Admin)"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-extrabold text-[11px]">ROOM</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(true);
                  playTacticalChirp(1100);
                }}
                className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 transition-all relative"
                title="Tactical Menu"
                aria-label="Open Tactical Menu"
              >
                <Menu className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-extrabold text-[11px] text-slate-100">MENU</span>
                {unreadDmCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse absolute -top-0.5 -right-0.5 ring-2 ring-black" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Top Bar: 2x Stacked Command & Telemetry Tiers */}
          <div className="hidden sm:flex flex-col gap-2">
            {/* ROW 1: Identity, Room Indicator & Account Options */}
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

                {/* Active Main Room Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">
                    {visibleChannels.find((c) => c.id === currentChannel)?.name || "invitational"}
                  </span>
                </div>
              </div>

              {/* Right: Profile Pill */}
              <div className="flex items-center gap-2">
                {/* Unified User Account & Session Options */}
                <div className="relative" ref={chatUserMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsChatUserMenuOpen(!isChatUserMenuOpen)}
                    data-telemetry="chat_shooter_account_menu"
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-amber-400/40 transition-all text-xs group cursor-pointer"
                    title={`${shooterProfile.callsign} — Account & Session Options`}
                    aria-expanded={isChatUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] overflow-hidden ring-1 ring-white/20 text-white font-bold font-mono"
                      style={{
                        backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                      }}
                    >
                      {shooterProfile.image ? (
                        <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                      ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                        <Radar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300 stroke-[2.5]" />
                      ) : (
                        <span className="text-white font-bold tracking-tight text-[9px] sm:text-[10px]">
                          {getUserInitials(shooterProfile.name, shooterProfile.callsign)}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono font-bold text-[11px] sm:text-xs ${
                      shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER"
                        ? "text-cyan-300 group-hover:text-cyan-200"
                        : "text-amber-300 group-hover:text-amber-200"
                    }`}>
                      {shooterProfile.callsign}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200 ${isChatUserMenuOpen ? "rotate-180 text-amber-400" : ""}`} />
                  </button>

                  {isChatUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 ios-glass rounded-2xl p-2 border border-white/15 shadow-2xl backdrop-blur-2xl animate-fadeIn z-50 space-y-1">
                      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 overflow-hidden ring-1 ring-white/20 text-white font-bold font-mono"
                          style={{
                            backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                          }}
                        >
                          {shooterProfile.image ? (
                            <img src={shooterProfile.image} alt="" className="w-full h-full object-cover" />
                          ) : shooterProfile.callsign === "RADAR" || shooterProfile.callsign === "ROB" || shooterProfile.role === "MASTER_OWNER" ? (
                            <Radar className="w-3.5 h-3.5 text-cyan-300 stroke-[2.5]" />
                          ) : (
                            <span>{getUserInitials(shooterProfile.name, shooterProfile.callsign)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{shooterProfile.callsign}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans uppercase">Online</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {shooterProfile.badgeText || "SOCIETY OPERATIVE"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsChatUserMenuOpen(false);
                          setIsFullProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Edit Profile &amp; Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsChatUserMenuOpen(false);
                          setIsRosterModalOpen(true);
                          playTacticalChirp(1050);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span className="flex-1">Active Marksmen</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                          {onlineCallsigns.length > 0 ? `${onlineCallsigns.length} Online` : "1 Online"}
                        </span>
                      </button>

                      {isShooterAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsChatUserMenuOpen(false);
                              handleOpenNewRoomModal();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/15 transition-colors text-left cursor-pointer"
                          >
                            <Plus className="w-4 h-4 text-amber-400" />
                            <span>Add New Chat Room</span>
                          </button>

                          <Link
                            href="/admin"
                            target="_blank"
                            onClick={() => setIsChatUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Admin Control Center</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-white/10 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsChatUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 2: Compact Range Status (Left) + Utilities (Right) */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Compact Range Status Chip */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04]" title={liveWeather ? `Holston Ridge • Elev: ${liveWeather.elevationFt?.toLocaleString()} ft • Wind: ${liveWeather.windSpeed}-${liveWeather.windGusts} mph from ${liveWeather.windDirection} (${liveWeather.windDegrees}°) • Temp: ${liveWeather.temp}°F${liveWeather.dewPoint !== undefined ? ` (Dew: ${liveWeather.dewPoint}°F)` : ""} • Humidity: ${liveWeather.humidity}% • Baro: ${liveWeather.pressureInHg || (Math.round(liveWeather.pressureHpa * 0.02953 * 100) / 100)} inHg (${liveWeather.pressureHpa} hPa) • Density Alt: ${liveWeather.densityAltitude >= 0 ? "+" : ""}${liveWeather.densityAltitude?.toLocaleString()} ft${liveWeather.mach1Fps ? ` • Mach 1: ${liveWeather.mach1Fps} FPS` : ""} • Updated: ${liveWeather.updatedAt}` : "Live Mountain Telemetry"}>
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

              {/* Right: Tactical Utilities (Roster, Fullscreen) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsRosterModalOpen(true);
                    playTacticalChirp(1050);
                  }}
                  className="h-7 px-2 sm:px-2.5 rounded-lg border text-[10px] sm:text-[11px] flex items-center gap-1.5 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 transition-all cursor-pointer"
                  title="View Active Marksmen Online Roster"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineCallsigns.length > 0 ? `${onlineCallsigns.length} Online` : "1 Online"}</span>
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 active:scale-95 transition-all"
              title="Return to Main Portal"
            >
              <ChevronLeft className="w-4 h-4 text-amber-400 -mr-0.5" />
              <span className="font-extrabold text-xs text-slate-100">HOME</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold active:scale-95 transition-all"
              title="Exit Fullscreen Mode"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold">EXIT</span>
            </button>
          </div>

          {/* Center: Room Name */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-left min-w-0 flex-1 justify-center px-1">
            <span className="text-amber-400 font-bold text-sm sm:text-base md:text-lg">#</span>
            <span className="font-mono font-bold text-sm sm:text-base md:text-lg text-white whitespace-nowrap truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
              {currentChannelData.name}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold flex items-center gap-1 shrink-0" title={`${currentChannelEngagement.postCount} transmissions in this channel`}>
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>{currentChannelEngagement.postCount}</span>
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop-only: Weather, Staff Moderated */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-slate-200 text-xs font-mono" title={liveWeather ? `Wind ${liveWeather.windSpeed}-${liveWeather.windGusts} mph from ${liveWeather.windDirection} (${liveWeather.windDegrees}°) • DA ${liveWeather.densityAltitude >= 0 ? "+" : ""}${liveWeather.densityAltitude?.toLocaleString()} ft • Baro ${liveWeather.pressureInHg || (Math.round(liveWeather.pressureHpa * 0.02953 * 100) / 100)} inHg` : "Live Wind Telemetry"}>
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>{liveWeather ? `${liveWeather.windSpeed}-${liveWeather.windGusts} MPH ${liveWeather.windDirection}` : "4-6 MPH SE"}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono font-medium" title="Staff Moderated">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Moderated</span>
            </div>

            {isShooterAdmin && (
              <button
                type="button"
                onClick={handleOpenNewRoomModal}
                className="h-7 px-2 sm:px-2.5 rounded-lg border text-[11px] flex items-center gap-1 font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/35 transition-all cursor-pointer"
                title="Add New Chat Room (Admin Only)"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Room</span>
              </button>
            )}

            {/* Active Marksmen Online Roster Pill */}
            <button
              type="button"
              onClick={() => {
                setIsRosterModalOpen(true);
                playTacticalChirp(1050);
              }}
              className="h-7 px-2 sm:px-2.5 rounded-lg border text-[11px] flex items-center gap-1.5 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 transition-all cursor-pointer"
              title="View Active Marksmen Online Roster"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">{onlineCallsigns.length > 0 ? `${onlineCallsigns.length} Online` : "1 Online"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. CHANNEL SELECTOR — Visible on mobile & desktop so switching rooms (e.g. #invitational, #lunch-menu) and adding rooms (Admin) is 1 tap */}
      <div id="tour-step-channels" className="shrink-0 px-2 sm:px-4 lg:px-6 pt-1 pb-1">
        {/* MOBILE ROOM BAR (Horizontally scrollable room pills + Admin '+ Room' button) */}
        <div className="md:hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {visibleChannels.map((ch) => {
              const isActive = currentChannel === ch.id;
              const unread = unreadCounts[ch.id] || 0;
              const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
              const isCustomRoom = ch.id !== "invitational";

              return (
                <div
                  key={ch.id}
                  onClick={() => setCurrentChannel(ch.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-amber-500 text-black font-bold border-amber-400 shadow-sm"
                      : "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]"
                  }`}
                >
                  <span className={isActive ? "text-black font-bold" : "text-amber-400 font-bold"}>#</span>
                  <span className="font-mono font-bold">{ch.name}</span>
                  {ch.adminOnly && (
                    <Lock className={`w-3 h-3 ${isActive ? "text-black" : "text-emerald-400"}`} />
                  )}
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 ${
                    isActive ? "bg-black/25 text-white" : "bg-white/10 text-slate-300"
                  }`}>
                    <MessageSquare className="w-2.5 h-2.5" />
                    <span>{engagement.postCount}</span>
                  </span>
                  {unread > 0 && !isActive && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                  {isShooterAdmin && isCustomRoom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(ch.id);
                      }}
                      title={`Remove #${ch.name}`}
                      className={`ml-0.5 p-0.5 rounded hover:bg-red-500/20 ${
                        isActive ? "text-black/70 hover:text-red-900" : "text-slate-400 hover:text-red-400"
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {isShooterAdmin && (
              <button
                type="button"
                onClick={handleOpenNewRoomModal}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center gap-1 border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 active:scale-95 transition-all"
                title="Create a new chat room (Admin Only)"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Room</span>
              </button>
            )}
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
                const isCustomRoom = ch.id !== "invitational";
                return (
                  <div
                    key={ch.id}
                    onClick={() => setCurrentChannel(ch.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 border relative cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-black font-bold border-amber-400"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={isActive ? "text-black font-bold" : "text-amber-400"}>#</span>
                    <span className="font-medium">{ch.name}</span>
                    {ch.adminOnly && (
                      <Lock className={`w-3 h-3 ${isActive ? "text-black" : "text-emerald-400"}`} />
                    )}

                    {/* Post Counter Badge on Pill */}
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                      isActive
                        ? "bg-black/30 text-white"
                        : "bg-white/10 text-slate-300"
                    }`} title={`${engagement.postCount} posts in #${ch.name}`}>
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>{engagement.postCount}</span>
                    </span>

                    {unread > 0 && !isActive ? (
                      <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}

                    {isShooterAdmin && isCustomRoom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(ch.id);
                        }}
                        title={`Delete #${ch.name}`}
                        className={`ml-0.5 p-0.5 rounded transition-colors ${
                          isActive ? "text-black/70 hover:text-red-900" : "text-slate-400 hover:text-red-400"
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {isShooterAdmin && (
                <button
                  type="button"
                  onClick={handleOpenNewRoomModal}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center gap-1 border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-all cursor-pointer"
                  title="Add a new chat room (Admin Only)"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Room</span>
                </button>
              )}
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
            onEditProfile={() => {
              setIsFullProfileModalOpen(true);
            }}
            onLogout={handleLogout}
            onlineCallsigns={onlineCallsigns}
            lastActiveMap={lastActiveMap}
            isAdmin={isShooterAdmin}
            onOpenNewRoomModal={handleOpenNewRoomModal}
            onDeleteRoom={handleDeleteRoom}
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
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onlineCallsigns={onlineCallsigns}
            lastActiveMap={lastActiveMap}
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
            pendingImage={pendingImage}
            setPendingImage={setPendingImage}
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
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsFullProfileModalOpen(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    profileActiveTab === "EDIT"
                      ? isMasterOwner
                        ? "bg-cyan-500 text-black"
                        : "bg-amber-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Edit Profile &amp; Photos</span>
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

                  <div className="text-center pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setIsFullProfileModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Edit Profile &amp; Photos</span>
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

                  {/* Tactical Avatar Color (When no profile photo is uploaded) */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-mono font-bold text-slate-200">
                          Tactical Avatar Color
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Chosen insignia tone with white initials when no photo is uploaded
                        </p>
                      </div>

                      {/* Live Avatar Preview */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Preview:</span>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-2 ring-white/20 text-white shrink-0 shadow-lg transition-transform active:scale-95"
                          style={{
                            backgroundColor: getAvatarColor(profileForm.avatarColor, profileForm.callsign || profileForm.name).hex,
                            borderColor: getAvatarColor(profileForm.avatarColor, profileForm.callsign || profileForm.name).borderHex,
                          }}
                        >
                          <span className="text-white font-bold tracking-wider text-xs">
                            {getUserInitials(profileForm.name, profileForm.callsign)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dark Tactical Color Swatches */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1">
                      {DARK_AVATAR_COLORS.map((c) => {
                        const isSelected =
                          getAvatarColor(profileForm.avatarColor, profileForm.callsign || profileForm.name).id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, avatarColor: c.hex })}
                            title={c.name}
                            className={`group relative h-8 rounded-lg flex items-center justify-center transition-all ${
                              isSelected
                                ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-105"
                                : "hover:scale-105 border border-white/15"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />
                            )}
                            <span className="sr-only">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span>Selected color:</span>
                      <span className="text-amber-300 font-bold">
                        {getAvatarColor(profileForm.avatarColor, profileForm.callsign || profileForm.name).name}
                      </span>
                    </div>
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

      {/* 4.5 UNIFIED SHOOTER PROFILE & PHOTO EDITOR MODAL */}
      <ProfileEditModal
        isOpen={isFullProfileModalOpen}
        onClose={() => setIsFullProfileModalOpen(false)}
        initialShooter={shooterProfile}
        onSaved={(updated) => {
          const rifleString = typeof updated.rifleSetup === "object" && updated.rifleSetup
            ? `${updated.rifleSetup.action || ""}${updated.rifleSetup.optic ? ` / ${updated.rifleSetup.optic}` : ""}`
            : ((updated.rifleSetup as any) || "");

          const merged: ShooterProfile = {
            ...shooterProfile,
            name: updated.name,
            callsign: updated.callsign,
            division: updated.division,
            image: updated.image,
            rifleSetup: rifleString || shooterProfile.rifleSetup,
          };
          setShooterProfile(merged);
          setProfileForm(merged);
        }}
      />

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
        channels={visibleChannels}
        currentChannel={currentChannel}
        onSelectChannel={(chId) => setCurrentChannel(chId)}
        unreadCounts={unreadCounts}
        engagementCounts={channelEngagementMap}
        onPlayChirp={playTacticalChirp}
        directPartners={directPartners}
        initialTab={channelModalInitialTab}
        onlineCallsigns={onlineCallsigns}
        lastActiveMap={lastActiveMap}
      />

      {/* 7. SHOOTER DOSSIER MODAL */}
      <ShooterDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        shooter={selectedDossierShooter}
        onStartDirectComms={handleStartDirectComms}
        onlineCallsigns={onlineCallsigns}
        lastActiveMap={lastActiveMap}
      />

      {/* 7.5 ACTIVE MARKSMEN ONLINE ROSTER MODAL */}
      <ActiveMarksmenModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        onlineCallsigns={onlineCallsigns}
        lastActiveMap={lastActiveMap}
        directPartners={directPartners}
        shooterProfile={shooterProfile}
        onStartDirectComms={handleStartDirectComms}
        onOpenDossier={handleOpenDossier}
        onPlayChirp={playTacticalChirp}
      />

      {/* 8. TERMS OF USE & CODE OF CONDUCT MODAL */}
      <ChatTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onPlayChirp={playTacticalChirp}
      />

      {/* 9. TACTICAL MOBILE CHAT MENU DRAWER */}
      <ChatMobileMenuModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        shooterProfile={shooterProfile}
        onOpenPass={() => {
          setProfileForm(shooterProfile);
          setProfileActiveTab("PASS");
          setIsProfileModalOpen(true);
        }}
        onEditProfile={() => {
          setIsFullProfileModalOpen(true);
        }}
        onOpenChannels={() => {
          setChannelModalInitialTab("MATCH");
          setIsChannelModalOpen(true);
          playTacticalChirp(1100);
        }}
        onOpenDirectChats={() => {
          setChannelModalInitialTab("DIRECT");
          setIsChannelModalOpen(true);
          playTacticalChirp(1100);
        }}
        unreadDmCount={unreadDmCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onLogout={handleLogout}
        isAdmin={isShooterAdmin}
        onOpenNewRoomModal={handleOpenNewRoomModal}
      />

      {/* 10. ADMIN-ONLY CREATE & MANAGE CHAT ROOMS MODAL (MOBILE-FIRST) */}
      {isNewRoomModalOpen && isShooterAdmin && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsNewRoomModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-[#0B0F17] sm:ios-glass rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/15 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Add New Chat Room
                  </h3>
                  <p className="text-xs text-slate-400">
                    Admin-only • Create smaller rooms (lunch menu, stage updates, staff)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoomModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1-Tap Mobile Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Quick Templates (Tap to Fill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewRoomName("lunch-menu");
                    setNewRoomDesc("Daily lunch menus, food orders & dining updates");
                    setNewRoomBadge("FOOD & MENU");
                    setNewRoomAdminOnly(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95"
                >
                  <div className="text-xs font-bold text-white">#lunch-menu</div>
                  <div className="text-[10px] text-slate-400 truncate">Food &amp; daily menus</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewRoomName("stage-updates");
                    setNewRoomDesc("Live stage briefings, squad schedules & range calls");
                    setNewRoomBadge("STAGE OPS");
                    setNewRoomAdminOnly(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95"
                >
                  <div className="text-xs font-bold text-white">#stage-updates</div>
                  <div className="text-[10px] text-slate-400 truncate">Stage &amp; range updates</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewRoomName("lodging-dining");
                    setNewRoomDesc("Bristol hotels, dinner spots & evening meetups");
                    setNewRoomBadge("HOSPITALITY");
                    setNewRoomAdminOnly(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95"
                >
                  <div className="text-xs font-bold text-white">#lodging-dining</div>
                  <div className="text-[10px] text-slate-400 truncate">Hotels &amp; dinner plans</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewRoomName("admin-staff");
                    setNewRoomDesc("Private admin & match staff coordination");
                    setNewRoomBadge("ADMIN ONLY");
                    setNewRoomAdminOnly(true);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-left transition-all active:scale-95"
                >
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>#admin-staff</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Admins only private room</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateNewRoom} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-200">
                  Room Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-amber-400 font-mono font-bold text-sm">#</span>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. lunch-menu"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-base sm:text-sm focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-200">
                  Short Topic / Description (Optional)
                </label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="e.g. Saturday catered lunch menu & drink options"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-base sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-200">
                  Who Can View This Room?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewRoomAdminOnly(false);
                      if (newRoomBadge === "ADMIN ONLY") setNewRoomBadge("MATCH ROOM");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !newRoomAdminOnly
                        ? "bg-amber-500 text-black border-amber-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Shooters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRoomAdminOnly(true);
                      setNewRoomBadge("ADMIN ONLY");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newRoomAdminOnly
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Admins Only</span>
                  </button>
                </div>
              </div>

              {newRoomError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
                  {newRoomError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewRoomModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewRoom}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSavingNewRoom ? "CREATING..." : "CREATE ROOM"}</span>
                </button>
              </div>
            </form>

            {/* Existing Custom Rooms List for Easy Mobile Deletion */}
            {customChannels.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Active Custom Rooms ({customChannels.length})
                </span>
                <div className="space-y-1.5">
                  {customChannels.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-mono font-bold text-xs">#</span>
                          <span className="text-white font-mono font-bold text-xs truncate">{ch.name}</span>
                          {ch.adminOnly && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              ADMIN ONLY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{ch.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(ch.id)}
                        className="ml-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors shrink-0"
                        title={`Delete #${ch.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


