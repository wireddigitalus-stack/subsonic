"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, 
  MousePointerClick, 
  Clock, 
  Users, 
  Smartphone, 
  Laptop, 
  ShieldAlert, 
  Calendar, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Flame, 
  Target, 
  Radio, 
  Eye,
  Compass,
  Sliders,
  Database,
  Play,
  Share2,
  Route,
  BellRing,
  X,
  UserCheck,
  Trophy,
  Mail,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  FileText,
  Building2,
  Phone,
  Sparkles,
  Tag,
  Pause,
  Ban,
  Edit3,
  Save,
  AlertTriangle,
  QrCode,
  Crosshair,
  UserX,
  ShieldCheck,
  MessageSquare,
  Pin,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Gavel,
  Crown,
  Shield,
  Key,
  LogOut,
  Copy,
  Bot
} from "lucide-react";
import { BotRosterCard } from "@/components/chat/BotRosterCard";
import { BotSpeed, getBotActivityLog, subscribeToBotActivity, logBotActivity, clearBotActivityLog } from "@/lib/chat-bots";
import { 
  getLocalTelemetryEvents, 
  computeTelemetryAnalytics, 
  clearLocalTelemetry,
  recordTelemetryEvent,
  fetchServerTelemetry,
  downloadTelemetryExport
} from "@/lib/telemetry";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  TelemetryEvent, 
  MatchEvent, 
  ChatMessage, 
  CommsAbuseAlert,
  SocietyMember,
  MatchRegistration,
  ContactLead,
  ShooterProfile,
  CompetitionDocument
} from "@/lib/types";
import { INITIAL_MATCHES, INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { CommsAbuseModerator } from "@/components/admin/CommsAbuseModerator";
import { getCommsAbuseAlerts } from "@/lib/abuse-moderation";
import { AdminMembersTab } from "@/components/admin/AdminMembersTab";
import { AdminRegistrationsTab } from "@/components/admin/AdminRegistrationsTab";
import { AdminLeadsTab } from "@/components/admin/AdminLeadsTab";
import { AdminShootersTab } from "@/components/admin/AdminShootersTab";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";
import { AdminInviteGeneratorTab } from "@/components/admin/AdminInviteGeneratorTab";
import { CallsignInput } from "@/components/common/CallsignInput";
import { isAdminRole, pinMaxLength, generatePin } from "@/lib/pin-policy";
import { setCommsAlertLevel, clearCommsAlert, getCommsStatus, CommsAlertLevel } from "@/lib/comms-status";

const INITIAL_SOCIETY_MEMBERS: SocietyMember[] = [
  {
    member_id: "SS-2026-0001",
    full_name: "Rob Neilson",
    callsign: "RADAR",
    email: "rob@subsonicsociety.com",
    state: "TN",
    experience_level: "Master Admin",
    rifle_setup: "Systems & Infrastructure Architecture (Non-Shooter)",
    interests: ["Systems Engineering", "Network Infrastructure", "Telemetry Uplinks", "Private Encrypted Comms", "Server Architecture", "Smart Systems Integrations"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "MASTER_OWNER",
    notes: "Master Admin — Systems Architecture & Network Operations (Callsign: RADAR)",
  },
  {
    member_id: "SS-2026-0002",
    full_name: "Allen Hurley",
    callsign: "SAID DONE",
    email: "allen@subsonicsociety.com",
    state: "TN",
    experience_level: "Owner Admin / Executive",
    rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
    interests: ["Society Leadership", "Executive Comms", "Match Operations", "The Hideout Bristol"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "OWNER_ADMIN",
    notes: "Owner Admin & Executive — Full Management Authority (Callsign: SAID DONE)",
  },
];

const isExcludedShooter = (s: { name?: string; callsign?: string; id?: string }): boolean => {
  const name = (s.name || "").toUpperCase();
  const call = (s.callsign || "").toUpperCase();
  const id = (s.id || "").toLowerCase();
  return (
    name.includes("ROB NEILSON") ||
    call === "RADAR" ||
    call === "ROB" ||
    call === "LTDAN" ||
    id === "rob-neilson" ||
    id === "radar" ||
    name.includes("JOHN DOE") ||
    call === "DOE" ||
    call === "JOHNDOE" ||
    id === "john-doe" ||
    id === "johndoe"
  );
};

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSession, setAdminSession] = useState<{
    name: string;
    callsign: string;
    role: "MASTER_OWNER" | "DEV_ADMIN" | "OWNER_ADMIN" | "ADMIN";
    memberId: string;
  } | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState(false);
  const [detectedNonAdmin, setDetectedNonAdmin] = useState<{ callsign: string; role: string } | null>(null);

  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [abuseAlerts, setAbuseAlerts] = useState<CommsAbuseAlert[]>([]);
  const [globalBannerDismissed, setGlobalBannerDismissed] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    "MEMBERS" | "INVITES" | "REGISTRATIONS" | "LEADS" | "SHOOTERS" | "DOCUMENTS" | "EVENTS" | "CLICKSTREAM" | "PAGES_AND_CLICKS" | "AI_MODERATION" | "CHAT"
  >("MEMBERS");
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);
  const [simulating, setSimulating] = useState(false);
  const [commsBeaconLevel, setCommsBeaconLevel] = useState<CommsAlertLevel>("green");

  // Autonomous Test Bot Fleet & Simulator State (Off-Chat Control)
  const [isBotCardOpen, setIsBotCardOpen] = useState(false);
  const [botsEnabled, setBotsEnabled] = useState(false);
  const [botSpeed, setBotSpeed] = useState<BotSpeed>("NORMAL");
  const [badActorEnabled, setBadActorEnabled] = useState(true);

  const [botActivityMessages, setBotActivityMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("subsonic_bots_enabled");
      if (stored !== null) setBotsEnabled(stored === "true");
      const speed = localStorage.getItem("subsonic_bots_speed");
      if (speed) setBotSpeed(speed as BotSpeed);
      setBotActivityMessages(getBotActivityLog());
      const unsub = subscribeToBotActivity((msgs) => {
        setBotActivityMessages(msgs);
      });
      return unsub;
    }
  }, []);

  const handleToggleBots = () => {
    const next = !botsEnabled;
    setBotsEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_bots_enabled", String(next));
    }
  };

  const handleChangeBotSpeed = (speed: BotSpeed) => {
    setBotSpeed(speed);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_bots_speed", speed);
    }
  };

  // Shooter Profiles & Competition Vault state
  const [shooterProfiles, setShooterProfiles] = useState<ShooterProfile[]>([]);
  const [competitionDocs, setCompetitionDocs] = useState<CompetitionDocument[]>([]);
  const [shooterSearch, setShooterSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [newDocForm, setNewDocForm] = useState<{
    title: string;
    category: "COF" | "RULES" | "SCHEDULE" | "RANGE_INTEL" | "WAIVER";
    matchTitle: string;
    description: string;
    fileName: string;
    fileUrl: string;
    version: string;
    isMandatory: boolean;
  }>({
    title: "",
    category: "COF",
    matchTitle: "Subsonic Society Invitational 2026",
    description: "",
    fileName: "",
    fileUrl: "",
    version: "v1.0",
    isMandatory: false,
  });

  // Telemetry filter state (strictly page landings, items clicked, and members)
  const [telemetryTypeFilter, setTelemetryTypeFilter] = useState<"ALL" | "PAGE_LANDED" | "CLICK">("ALL");
  const [telemetryAudienceFilter, setTelemetryAudienceFilter] = useState<"ALL" | "MEMBER" | "GUEST">("ALL");
  const [telemetrySearch, setTelemetrySearch] = useState("");

  // Members, Registrations & Leads state
  const [members, setMembers] = useState<SocietyMember[]>(INITIAL_SOCIETY_MEMBERS);
  const [registrations, setRegistrations] = useState<MatchRegistration[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberStateFilter, setMemberStateFilter] = useState("ALL");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"ALL" | "ADMINS" | "MEMBERS">("ALL");
  const [memberStatusFilter, setMemberStatusFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "BANNED">("ALL");
  const [appointMemberId, setAppointMemberId] = useState("");
  const [appointRole, setAppointRole] = useState<SocietyMember["role"]>("MODERATOR");
  const [isAppointing, setIsAppointing] = useState(false);

  // 2-Step Card Delete Confirmation State
  const [cardDeleteConfirmId, setCardDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Member Profile Management Modal State
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<{
    member_id: string;
    full_name: string;
    callsign: string;
    email: string;
    state: string;
    experience_level: string;
    rifle_setup: string;
    status: "ACTIVE" | "PAUSED" | "BANNED" | "PROVISIONAL" | "HONORARY";
    role?: SocietyMember["role"];
    notes: string;
    pin?: string;
    // Shooter Blueprint specs
    shooterId?: string;
    division?: string;
    ranking?: string;
    podiums?: number;
    homeRange?: string;
    action?: string;
    barrel?: string;
    trigger?: string;
    chassis?: string;
    optic?: string;
    ammoLot?: string;
    quote?: string;
    accolades?: string[];
    sponsors?: string[];
  }>({
    member_id: "",
    full_name: "",
    callsign: "",
    email: "",
    state: "TN",
    experience_level: "Competitor",
    rifle_setup: "",
    status: "ACTIVE",
    notes: "",
    pin: "",
    division: "Open Division",
    ranking: "Pro Competitor",
    podiums: 0,
    homeRange: "The Hideout, Bristol TN",
    action: "",
    barrel: "",
    trigger: "",
    chassis: "",
    optic: "",
    ammoLot: "",
    quote: "",
    accolades: [],
    sponsors: [],
  });
  const [memberModalTab, setMemberModalTab] = useState<"DETAILS" | "BLUEPRINT" | "PASS">("DETAILS");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedCredentialMemberId, setCopiedCredentialMemberId] = useState<string | null>(null);
  const [copiedFullProfile, setCopiedFullProfile] = useState(false);

  // Admin Passkeys Security Management Modal State
  const [isAdminPasskeyModalOpen, setIsAdminPasskeyModalOpen] = useState(false);
  const [adminPasskeyAccounts, setAdminPasskeyAccounts] = useState<any[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [updatingPasskeyCallsign, setUpdatingPasskeyCallsign] = useState<string | null>(null);
  const [newPasskeyInputs, setNewPasskeyInputs] = useState<Record<string, string>>({});
  const [passkeyNotice, setPasskeyNotice] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [regSearch, setRegSearch] = useState("");
  const [regMatchFilter, setRegMatchFilter] = useState("ALL");
  const [regDivisionFilter, setRegDivisionFilter] = useState("ALL");

  const [leadSearch, setLeadSearch] = useState("");
  const [leadCategoryFilter, setLeadCategoryFilter] = useState("ALL");
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");

  // Load telemetry events from persistent server storage, Supabase, and local client buffer
  const loadData = async () => {
    const localEvts = getLocalTelemetryEvents();
    
    // 1. Fetch server-persisted telemetry (data/telemetry-events.jsonl)
    const serverResult = await fetchServerTelemetry(2000);
    const serverEvts = serverResult?.events || [];

    // 2. Merge local + server events uniquely by ID
    const eventMap = new Map<string, TelemetryEvent>();
    for (const e of serverEvts) eventMap.set(e.id, e);
    for (const e of localEvts) if (!eventMap.has(e.id)) eventMap.set(e.id, e);

    // 3. If Supabase is connected, hydrate with cloud database events
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await supabase
          .from("telemetry_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);

        if (!res.error && res.data && res.data.length > 0) {
          for (const d of res.data) {
            if (!eventMap.has(d.id)) {
              eventMap.set(d.id, {
                id: d.id,
                eventType: d.event_type,
                targetElement: d.target_element,
                targetText: d.target_text,
                targetCategory: d.target_category,
                pageRoute: d.page_route,
                isMember: Boolean(d.is_member ?? d.isMember),
                memberType: d.member_type || d.memberType,
                memberId: d.member_id || d.memberId,
                memberCallsign: d.member_callsign || d.memberCallsign,
                memberName: d.member_name || d.memberName,
                dwellSeconds: d.dwell_seconds,
                scrollDepth: d.scroll_depth,
                timestamp: d.created_at,
                device: d.device_data || { isMobile: false, isIOS: false, screenWidth: 1280, screenHeight: 800, userAgent: "" },
                sessionId: d.session_id,
                visitorId: d.visitor_id,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Supabase telemetry fetch failed:", err);
      }
    }

    const mergedList = Array.from(eventMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setEvents(mergedList);

    const alerts = getCommsAbuseAlerts();
    setAbuseAlerts(alerts);
    setCommsBeaconLevel(getCommsStatus().level);

    // Populate flagged chat transmissions from live abuse alerts queue
    const flaggedFromAlerts: ChatMessage[] = alerts.map((a) => ({
      id: a.id,
      channelId: a.channel,
      type: "STANDARD",
      author: {
        id: `usr_${a.shooterCallsign.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: a.shooterName,
        callsign: a.shooterCallsign,
        role: a.shooterRole as any,
        badgeText: a.shooterRole,
        division: a.squad,
        rifleSetup: "Competition Rig",
      },
      content: a.messageContent,
      timestamp: new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      moderationStatus: "FLAGGED",
      aiModerationReport: {
        toxicityScore: a.toxicityScore,
        threatScore: a.threatScore,
        policyScore: a.policyScore,
        sentiment: "TOXIC",
        flagReason: a.aiRationale,
        aiEngine: "Subsonic Sentinel",
      },
    }));
    setFlaggedMessages(flaggedFromAlerts);

    // Fetch Society Members
    try {
      const res = await fetch("/api/join");
      if (res.ok) {
        const data = await res.json();
        let apiMembers: SocietyMember[] = data.members || [];

        // Hybrid merge with local storage for newly registered members/pros
        if (typeof window !== "undefined") {
          try {
            // Auto-clean stale VIP Pro boilerplate in browser storage
            for (const key of ["subsonic_pro_full_profile", "subsonic_shooter_profile", "subsonic_member_profile"]) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (
                  parsed.name === "VIP Pro Competitor" || 
                  parsed.full_name === "VIP Pro Competitor" ||
                  parsed.name === "Invitational Competitor VIP"
                ) {
                  if (parsed.name) parsed.name = parsed.callsign || "TEST";
                  if (parsed.full_name) parsed.full_name = parsed.callsign || "TEST";
                  localStorage.setItem(key, JSON.stringify(parsed));
                }
              }
            }

            const rawDeleted = localStorage.getItem("subsonic_deleted_members");
            const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
            const isDeletedOrExec = (id?: string, cs?: string, name?: string) => {
              const cleanCs = (cs || "").trim().toUpperCase();
              const cleanName = (name || "").trim().toUpperCase();
              if (["RADAR", "ROB", "LTDAN", "ALLEN", "SAID DONE", "AHURLEY", "HURLEY"].includes(cleanCs)) return true;
              if (cleanName.includes("JOHN DOE") || cleanCs === "DOE" || cleanCs === "JOHNDOE") return true;
              return (
                (id && deletedList.includes(id.toLowerCase())) ||
                (cs && deletedList.includes(cs.toLowerCase())) ||
                (name && deletedList.includes(name.toLowerCase()))
              );
            };

            const rawPro = localStorage.getItem("subsonic_pro_full_profile");
            if (rawPro) {
              const pro = JSON.parse(rawPro);
              const proCallsign = pro.callsign || "TEST";
              const proName = (!pro.name || pro.name === "VIP Pro Competitor" || pro.name === "Invitational Competitor VIP") ? proCallsign : pro.name;
              if (
                proName &&
                !isDeletedOrExec(pro.member_id, proCallsign, proName) &&
                !apiMembers.some((m) => m.callsign?.toLowerCase() === proCallsign.toLowerCase() || m.full_name === proName)
              ) {
                apiMembers.unshift({
                  member_id: `SS-PRO-${proCallsign}`,
                  full_name: proName,
                  callsign: proCallsign,
                  email: `${proCallsign.toLowerCase()}@competitor.subsonicsociety.com`,
                  state: "TN",
                  experience_level: pro.division || "Pro Division Marksman",
                  rifle_setup: pro.rifleSetup?.action || "Precision Rimfire Rig",
                  interests: ["Competition", "PRS Rimfire", "Subsonic DNA"],
                  created_at: pro.createdAt || new Date().toISOString(),
                  status: "ACTIVE",
                  role: "MEMBER",
                  notes: `Pro VIP Onboarding. Career Podiums: ${pro.podiums || 0}. Home Range: ${pro.homeRange || "The Hideout"}`,
                });
              }
            }

            const rawMem = localStorage.getItem("subsonic_member_profile");
            if (rawMem) {
              const mem = JSON.parse(rawMem);
              const memCallsign = mem.callsign || "OPERATIVE";
              const memName = (!mem.full_name || mem.full_name === "VIP Pro Competitor" || mem.full_name === "Invitational Competitor VIP") ? memCallsign : mem.full_name;
              if (
                memName &&
                !isDeletedOrExec(mem.member_id, memCallsign, memName) &&
                !apiMembers.some((m) => m.callsign?.toLowerCase() === memCallsign.toLowerCase() || m.member_id === mem.member_id)
              ) {
                apiMembers.unshift({
                  member_id: mem.member_id || `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  full_name: memName,
                  callsign: memCallsign,
                  email: mem.email || undefined,
                  state: mem.state || "TN",
                  experience_level: mem.experience_level || "Member",
                  rifle_setup: mem.rifle_setup || "Precision Rimfire",
                  interests: mem.interests || ["Competition"],
                  created_at: mem.created_at || new Date().toISOString(),
                  status: "ACTIVE",
                  role: "MEMBER",
                  notes: "Enrolled via invitation code",
                });
              }
            }

            const rawCurShooter = localStorage.getItem("subsonic_shooter_profile");
            if (rawCurShooter) {
              const cur = JSON.parse(rawCurShooter);
              const curCallsign = cur.callsign || "TEST";
              const curName = (!cur.name || cur.name === "VIP Pro Competitor" || cur.name === "Invitational Competitor VIP") ? curCallsign : cur.name;
              if (
                curCallsign &&
                !isDeletedOrExec(cur.id, curCallsign, curName) &&
                !apiMembers.some((m) => m.callsign?.toLowerCase() === curCallsign.toLowerCase())
              ) {
                apiMembers.unshift({
                  member_id: `SS-PRO-${curCallsign}`,
                  full_name: curName,
                  callsign: curCallsign,
                  email: `${curCallsign.toLowerCase()}@member.subsonicsociety.com`,
                  state: "TN",
                  experience_level: cur.division || "Pro Competitor",
                  rifle_setup: cur.rifleSetup || "Precision Rimfire",
                  interests: ["Competition", "Subsonic DNA"],
                  created_at: new Date().toISOString(),
                  status: "ACTIVE",
                  role: "MEMBER",
                  notes: "Enrolled Marksman",
                });
              }
            }
          } catch (e) {
            console.warn("Local storage member merge error:", e);
          }
        }

        apiMembers = apiMembers.map((m) => {
          if (m.full_name === "VIP Pro Competitor" || m.full_name === "Invitational Competitor VIP") {
            return { ...m, full_name: m.callsign || "TEST" };
          }
          return m;
        });

        // Filter out John Doe test profile from member display
        apiMembers = apiMembers.filter(
          (m) =>
            !(
              (m.full_name || "").toUpperCase().includes("JOHN DOE") ||
              (m.callsign || "").toUpperCase() === "DOE" ||
              (m.callsign || "").toUpperCase() === "JOHNDOE"
            )
        );

        setMembers(apiMembers);
      }
    } catch (err) {
      console.warn("Error fetching society members:", err);
    }

    // Fetch Registered Shooters
    try {
      const res = await fetch("/api/register");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.warn("Error fetching registrations:", err);
    }

    // Fetch Contact Leads & Inquiries
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.warn("Error fetching contact leads:", err);
    }

    // Fetch Shooter Profiles (Intake & Custom)
    try {
      const res = await fetch("/api/shooters");
      if (res.ok) {
        const data = await res.json();
        let list: ShooterProfile[] = data.shooters || [];

        // Hybrid merge with local storage for newly registered pro shooters
        if (typeof window !== "undefined") {
          try {
            // Auto-clean stale VIP Pro boilerplate or test profiles in browser storage
            for (const key of ["subsonic_pro_full_profile", "subsonic_shooter_profile", "subsonic_member_profile"]) {
              const raw = localStorage.getItem(key);
              if (raw) {
                try {
                  const parsed = JSON.parse(raw);
                  if (isExcludedShooter(parsed) && String(parsed.name || parsed.full_name).toUpperCase().includes("JOHN DOE")) {
                    localStorage.removeItem(key);
                  }
                } catch {}
              }
            }

            const rawPro = localStorage.getItem("subsonic_pro_full_profile");
            if (rawPro) {
              const pro = JSON.parse(rawPro);
              if (pro?.name === "VIP Pro Competitor" || pro?.name === "Invitational Competitor VIP") {
                pro.name = pro.callsign || "TEST";
              }
              if (!isExcludedShooter(pro) && pro?.id && !list.some((s) => s.id === pro.id || s.callsign === pro.callsign)) {
                list.unshift(pro);
              }
            }
            const rawAll = localStorage.getItem("subsonic_all_shooters");
            if (rawAll) {
              const all = JSON.parse(rawAll);
              if (Array.isArray(all)) {
                const cleanAll = all.filter((item) => !isExcludedShooter(item));
                try {
                  localStorage.setItem("subsonic_all_shooters", JSON.stringify(cleanAll));
                } catch {}
                for (const item of cleanAll) {
                  if (item?.name === "VIP Pro Competitor" || item?.name === "Invitational Competitor VIP") {
                    item.name = item.callsign || "TEST";
                  }
                  if (item?.id && !list.some((s) => s.id === item.id)) {
                    list.unshift(item);
                  }
                }
              }
            }

            const rawCurShooter = localStorage.getItem("subsonic_shooter_profile");
            if (rawCurShooter) {
              const cur = JSON.parse(rawCurShooter);
              if (cur && (cur.callsign || cur.name)) {
                const curCallsign = cur.callsign || "TEST";
                const curName = (!cur.name || cur.name === "VIP Pro Competitor" || cur.name === "Invitational Competitor VIP") ? curCallsign : cur.name;
                const curId = curCallsign.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                if (
                  !isExcludedShooter({ name: curName, callsign: curCallsign, id: curId }) &&
                  !list.some((s) => s.id === curId || s.callsign?.toLowerCase() === curCallsign.toLowerCase())
                ) {
                  list.unshift({
                    id: curId,
                    name: curName,
                    callsign: curCallsign,
                    division: cur.division || "Open Division Pro",
                    ranking: "Appalachian Rimfire Competitor",
                    homeRange: "The Hideout, Bristol, TN",
                    podiums: 1,
                    featuredMatch: "Subsonic Society Invitational 2026",
                    image: cur.image || "/images/SS-RWB-LOGO.png",
                    actionPhoto: cur.image || "/images/SS-RWB-LOGO.png",
                    quote: "Precision rimfire demands absolute trust in your elevation DOPE and wind read.",
                    accolades: ["VERIFIED COMPETITOR"],
                    sponsors: ["Subsonic Society"],
                    rifleSetup: {
                      action: cur.rifleSetup || "Custom Precision Rimfire Rig",
                      barrel: 'Match Contour 20" (1:16)',
                      trigger: "Match Grade Trigger",
                      chassis: "Precision Chassis",
                      optic: "Zero Compromise Optic",
                      mount: "Spuhr 0 MOA",
                      ammoLot: "Lapua Center-X",
                    },
                    createdAt: new Date().toISOString(),
                    status: "PUBLISHED",
                  });
                }
              }
            }
          } catch (e) {
            console.warn("Local storage shooters merge error:", e);
          }
        }

        list = list.map((s) => {
          if (s.name === "VIP Pro Competitor" || s.name === "Invitational Competitor VIP") {
            return { ...s, name: s.callsign || "TEST" };
          }
          return s;
        });

        // Filter out any occurrences of Rob Neilson or John Doe
        list = list.filter((s) => !isExcludedShooter(s));

        setShooterProfiles(list);
      }
    } catch (err) {
      console.warn("Error fetching shooter profiles:", err);
    }

    // Fetch Competition Documents Vault
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setCompetitionDocs(data.documents || []);
      }
    } catch (err) {
      console.warn("Error fetching competition documents:", err);
    }
  };

  const handleDeleteShooter = async (id: string, name: string) => {
    if (!confirm(`Delete profile for marksman "${name}"?`)) return;
    try {
      const res = await fetch(`/api/shooters?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setShooterProfiles((prev) => prev.filter((s) => s.id !== id && s.callsign?.toLowerCase() !== id.toLowerCase()));
        setMembers((prev) => prev.filter((m) => m.member_id !== id && m.callsign?.toLowerCase() !== id.toLowerCase()));
        fetch(`/api/chat/messages?purgeCallsign=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete shooter profile.");
      }
    } catch (err) {
      alert("Error deleting shooter profile");
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.title || !newDocForm.fileName) {
      alert("Please provide at least a title and file name.");
      return;
    }
    setIsSubmittingDoc(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDocForm),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.document) {
          setCompetitionDocs((prev) => [data.document, ...prev]);
        }
        setIsAddDocModalOpen(false);
        setNewDocForm({
          title: "",
          category: "COF",
          matchTitle: "Subsonic Society Invitational 2026",
          description: "",
          fileName: "",
          fileUrl: "",
          version: "v1.0",
          isMandatory: false,
        });
      } else {
        alert("Failed to create document.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving document.");
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Permanently remove document "${title}" from the competition vault?`)) return;
    try {
      const res = await fetch(`/api/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setCompetitionDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      alert("Error deleting document");
    }
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: "NEW" | "IN_REVIEW" | "CONTACTED" | "ARCHIVED") => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      }
    } catch (err) {
      console.warn("Error updating lead status:", err);
    }
  };

  const downloadMembersExport = () => {
    window.open("/api/join?export=csv", "_blank");
  };

  const handleOpenPasskeysModal = async () => {
    setIsAdminPasskeyModalOpen(true);
    setLoadingPasskeys(true);
    setPasskeyNotice(null);
    try {
      const res = await fetch("/api/admin/passkeys");
      const data = await res.json();
      if (res.ok && data.accounts) {
        setAdminPasskeyAccounts(data.accounts);
      } else {
        setPasskeyNotice({ msg: data.error || "Failed to load admin passkey data.", type: "error" });
      }
    } catch (e: any) {
      setPasskeyNotice({ msg: "Failed to load admin passkey data: " + e.message, type: "error" });
    } finally {
      setLoadingPasskeys(false);
    }
  };

  const handleUpdateAdminPasskey = async (targetCallsign: string) => {
    const val = (newPasskeyInputs[targetCallsign] || "").trim();
    if (!val || val.length < 4) {
      setPasskeyNotice({ msg: "Passkey must be at least 4 characters long.", type: "error" });
      return;
    }

    setUpdatingPasskeyCallsign(targetCallsign);
    setPasskeyNotice(null);

    try {
      const res = await fetch("/api/admin/passkeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCallsign, newPasskey: val }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasskeyNotice({ msg: data.message, type: "success" });
        // Refresh passkeys list
        const refRes = await fetch("/api/admin/passkeys");
        const refData = await refRes.json();
        if (refRes.ok && refData.accounts) {
          setAdminPasskeyAccounts(refData.accounts);
        }
        setNewPasskeyInputs((prev) => ({ ...prev, [targetCallsign]: "" }));
      } else {
        setPasskeyNotice({ msg: data.error || "Update failed.", type: "error" });
      }
    } catch (err: any) {
      setPasskeyNotice({ msg: err.message || "Network error updating passkey.", type: "error" });
    } finally {
      setUpdatingPasskeyCallsign(null);
    }
  };

  const handleOpenMemberModal = (member: SocietyMember) => {
    setSelectedMember(member);
    const shooter = shooterProfiles.find(
      (s) =>
        s.callsign?.toUpperCase() === member.callsign?.toUpperCase() ||
        s.id?.toLowerCase() === member.member_id?.toLowerCase() ||
        s.name?.toLowerCase() === member.full_name?.toLowerCase()
    );

    setMemberForm({
      member_id: member.member_id,
      full_name: member.full_name,
      callsign: member.callsign || (member.full_name ? member.full_name.split(" ")[0].toUpperCase() : "MARKSMAN"),
      email: member.email,
      state: member.state,
      experience_level: member.experience_level,
      rifle_setup: member.rifle_setup || (shooter?.rifleSetup?.action ? `${shooter.rifleSetup.action}${shooter.rifleSetup.optic ? ` / ${shooter.rifleSetup.optic}` : ""}` : ""),
      status: member.status || "ACTIVE",
      role: member.role,
      notes: member.notes || "",
      pin: member.pin || shooter?.pin || "",
      // Shooter blueprint specs
      shooterId: shooter?.id,
      division: shooter?.division || member.experience_level || "Open Division",
      ranking: shooter?.ranking || (member.role === "PRO_COMPETITOR" ? "Pro Competitor" : "Society Marksman"),
      podiums: shooter?.podiums ?? 0,
      homeRange: shooter?.homeRange || "The Hideout, Bristol TN",
      action: shooter?.rifleSetup?.action || "",
      barrel: shooter?.rifleSetup?.barrel || "",
      trigger: shooter?.rifleSetup?.trigger || "",
      chassis: shooter?.rifleSetup?.chassis || "",
      optic: shooter?.rifleSetup?.optic || "",
      ammoLot: shooter?.rifleSetup?.ammoLot || "",
      quote: shooter?.quote || "",
      accolades: shooter?.accolades || [],
      sponsors: shooter?.sponsors || [],
    });
    setMemberModalTab("DETAILS");
    setShowDeleteConfirm(false);
    setMemberActionNotice(null);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.member_id) return;
    setIsSavingMember(true);
    setMemberActionNotice(null);

    try {
      const res = await fetch("/api/join", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.member_id === memberForm.member_id ? data.member : m))
        );
        setSelectedMember(data.member);

        // Also sync shooter profile if one exists or if blueprint specs were updated
        const matchingShooter = shooterProfiles.find(
          (s) =>
            s.callsign?.toUpperCase() === memberForm.callsign.toUpperCase() ||
            s.id?.toLowerCase() === memberForm.member_id.toLowerCase() ||
            s.name?.toLowerCase() === memberForm.full_name.toLowerCase()
        );

        if (matchingShooter || memberForm.action || memberForm.optic || memberForm.shooterId || memberForm.role === "PRO_COMPETITOR") {
          try {
            const shooterPayload = {
              id: memberForm.shooterId || matchingShooter?.id || memberForm.callsign.toLowerCase().replace(/[^a-z0-9]/g, "_"),
              name: memberForm.full_name,
              callsign: memberForm.callsign,
              division: memberForm.division || memberForm.experience_level || "Open Division",
              ranking: memberForm.ranking || "Pro Competitor",
              podiums: Number(memberForm.podiums) || 0,
              homeRange: memberForm.homeRange || "The Hideout, Bristol TN",
              pin: memberForm.pin,
              rifleSetup: {
                action: memberForm.action || "",
                barrel: memberForm.barrel || "",
                trigger: memberForm.trigger || "",
                chassis: memberForm.chassis || "",
                optic: memberForm.optic || "",
                ammoLot: memberForm.ammoLot || "",
              },
              quote: memberForm.quote || "",
              accolades: memberForm.accolades || matchingShooter?.accolades || [],
              sponsors: memberForm.sponsors || matchingShooter?.sponsors || [],
              status: memberForm.status === "ACTIVE" ? "PUBLISHED" : "INACTIVE",
            };

            const sRes = await fetch("/api/shooters", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(shooterPayload),
            });
            const sData = await sRes.json();
            if (sRes.ok && sData.shooter) {
              setShooterProfiles((prev) => {
                const exists = prev.some((s) => s.id === sData.shooter.id);
                if (exists) return prev.map((s) => s.id === sData.shooter.id ? sData.shooter : s);
                return [sData.shooter, ...prev];
              });
            }
          } catch (sErr) {
            console.warn("Shooter sync warning:", sErr);
          }
        }

        setMemberActionNotice(`Member ${memberForm.member_id} updated successfully.`);
      } else {
        setMemberActionNotice(data.error || "Failed to update member.");
      }
    } catch (err: any) {
      setMemberActionNotice("Network error updating member: " + err.message);
    } finally {
      setIsSavingMember(false);
      setTimeout(() => setMemberActionNotice(null), 4000);
    }
  };

  const handleCopyFullMemberProfile = () => {
    if (!selectedMember) return;
    const lines = [
      `=== SUBSONIC SOCIETY MARKSMAN PROFILE ===`,
      `Member ID: ${memberForm.member_id || selectedMember.member_id}`,
      `Full Name: ${memberForm.full_name || selectedMember.full_name || "N/A"}`,
      `Callsign: ${memberForm.callsign || selectedMember.callsign || "N/A"}`,
      `Email: ${memberForm.email || selectedMember.email || "N/A"}`,
      `Home State: ${memberForm.state || selectedMember.state || "N/A"}`,
      `Role: ${memberForm.role || selectedMember.role || "MEMBER"}`,
      `Account Status: ${memberForm.status || selectedMember.status || "ACTIVE"}`,
      `Classification / Division: ${memberForm.division || memberForm.experience_level || selectedMember.experience_level || "N/A"}`,
      `Primary Rifle Rig: ${memberForm.rifle_setup || selectedMember.rifle_setup || "N/A"}`,
      memberForm.action ? `Rifle Action: ${memberForm.action}` : null,
      memberForm.barrel ? `Barrel: ${memberForm.barrel}` : null,
      memberForm.trigger ? `Trigger: ${memberForm.trigger}` : null,
      memberForm.chassis ? `Chassis: ${memberForm.chassis}` : null,
      memberForm.optic ? `Optic: ${memberForm.optic}` : null,
      memberForm.ammoLot ? `Ammo Lot: ${memberForm.ammoLot}` : null,
      memberForm.podiums !== undefined ? `Career Podiums: ${memberForm.podiums}` : null,
      memberForm.homeRange ? `Home Range: ${memberForm.homeRange}` : null,
      memberForm.accolades && memberForm.accolades.length > 0 ? `Accolades: ${memberForm.accolades.join(", ")}` : null,
      memberForm.sponsors && memberForm.sponsors.length > 0 ? `Sponsors: ${memberForm.sponsors.join(", ")}` : null,
      `Login PIN: ${memberForm.pin || selectedMember.pin || "N/A"}`,
      `Registered: ${selectedMember.created_at || "N/A"}`,
      memberForm.notes ? `Staff Notes: ${memberForm.notes}` : (selectedMember.notes ? `Staff Notes: ${selectedMember.notes}` : null),
      `Live Profile URL: https://subsonicsociety.com/shooters?id=${memberForm.shooterId || memberForm.member_id}`,
      `Portal Link: https://subsonicsociety.com/chat`,
      `========================================`
    ].filter(Boolean).join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(lines);
    }
    setCopiedFullProfile(true);
    setTimeout(() => setCopiedFullProfile(false), 3000);
  };

  const handleQuickStatusChange = async (
    memberId: string,
    newStatus: "ACTIVE" | "PAUSED" | "BANNED"
  ) => {
    try {
      const res = await fetch("/api/join", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.member_id === memberId ? data.member : m))
        );
        if (selectedMember && selectedMember.member_id === memberId) {
          setSelectedMember(data.member);
          setMemberForm((prev) => ({ ...prev, status: newStatus }));
        }
        setMemberActionNotice(`Member status updated to ${newStatus}.`);
      }
    } catch (err: any) {
      setMemberActionNotice("Error updating status: " + err.message);
    } finally {
      setTimeout(() => setMemberActionNotice(null), 4000);
    }
  };

  const handleAssignMemberRole = async (
    memberId: string,
    newRole: SocietyMember["role"]
  ) => {
    setIsAppointing(true);
    try {
      const res = await fetch("/api/join", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.member_id === memberId ? data.member : m))
        );
        if (selectedMember && selectedMember.member_id === memberId) {
          setSelectedMember(data.member);
          setMemberForm((prev) => ({ ...prev, role: newRole }));
        }
        setMemberActionNotice(`Security clearance updated: ${data.member.full_name} is now ${newRole || "MEMBER"}.`);
        setAppointMemberId("");
      } else {
        setMemberActionNotice(data.error || "Failed to update security clearance.");
      }
    } catch (err: any) {
      setMemberActionNotice("Error updating clearance role: " + err.message);
    } finally {
      setIsAppointing(false);
      setTimeout(() => setMemberActionNotice(null), 4500);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (memberId === "SS-2026-0001" || memberId === "SS-2026-0002") {
      setMemberActionNotice("Root executive accounts (Master Owner & Owner Admin) are protected and cannot be deleted.");
      setCardDeleteConfirmId(null);
      return;
    }

    const targetMember = members.find(
      (m) => m.member_id === memberId || m.callsign?.toLowerCase() === memberId.toLowerCase()
    );
    const targetCallsign = targetMember?.callsign;
    const targetName = targetMember?.full_name;

    // Permanently record in local storage deleted list so this browser never re-hydrates this user
    if (typeof window !== "undefined") {
      try {
        const deletedRaw = localStorage.getItem("subsonic_deleted_members");
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (memberId) deletedList.push(memberId.toLowerCase());
        if (targetCallsign) deletedList.push(targetCallsign.toLowerCase());
        if (targetName) deletedList.push(targetName.toLowerCase());
        localStorage.setItem("subsonic_deleted_members", JSON.stringify(Array.from(new Set(deletedList))));

        // Purge matching profiles from browser local storage
        for (const key of ["subsonic_member_profile", "subsonic_pro_full_profile", "subsonic_shooter_profile"]) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const pId = (parsed.member_id || parsed.id || "").toLowerCase();
            const pCallsign = (parsed.callsign || "").toLowerCase();
            const pName = (parsed.full_name || parsed.name || "").toLowerCase();
            const mid = memberId.toLowerCase();
            const tcs = (targetCallsign || "").toLowerCase();
            const tnm = (targetName || "").toLowerCase();

            if (
              (pId && (pId === mid || pId.includes(mid))) ||
              (pCallsign && (pCallsign === mid || pCallsign === tcs)) ||
              (pName && (pName === mid || pName === tnm))
            ) {
              localStorage.removeItem(key);
            }
          }
        }
      } catch (e) {
        console.warn("Storage purge error:", e);
      }
    }

    setIsDeletingMember(true);
    try {
      // 1. Delete from members API
      await fetch(`/api/join?member_id=${encodeURIComponent(memberId)}`, {
        method: "DELETE",
      }).catch(() => {});

      // 2. Cross-delete by callsign and ID from shooters API and chat messages
      if (targetCallsign) {
        fetch(`/api/shooters?id=${encodeURIComponent(targetCallsign)}`, { method: "DELETE" }).catch(() => {});
        fetch(`/api/join?member_id=${encodeURIComponent(targetCallsign)}`, { method: "DELETE" }).catch(() => {});
        fetch(`/api/chat/messages?purgeCallsign=${encodeURIComponent(targetCallsign)}`, { method: "DELETE" }).catch(() => {});
      }
      fetch(`/api/shooters?id=${encodeURIComponent(memberId)}`, { method: "DELETE" }).catch(() => {});
      fetch(`/api/chat/messages?purgeCallsign=${encodeURIComponent(memberId)}`, { method: "DELETE" }).catch(() => {});

      // 3. Unconditionally remove from local state
      setMembers((prev) =>
        prev.filter(
          (m) =>
            m.member_id !== memberId &&
            (!targetCallsign || m.callsign?.toLowerCase() !== targetCallsign.toLowerCase()) &&
            (!targetName || m.full_name?.toLowerCase() !== targetName.toLowerCase())
        )
      );
      setShooterProfiles((prev) =>
        prev.filter(
          (s) =>
            s.id !== memberId &&
            (!targetCallsign || s.callsign?.toLowerCase() !== targetCallsign.toLowerCase()) &&
            (!targetName || s.name?.toLowerCase() !== targetName.toLowerCase())
        )
      );

      setIsMemberModalOpen(false);
      setSelectedMember(null);
      setShowDeleteConfirm(false);
      setCardDeleteConfirmId(null);
      setMemberActionNotice(`Member ${targetName || targetCallsign || memberId} permanently deleted.`);
    } catch (err: any) {
      setMemberActionNotice("Error deleting member: " + err.message);
    } finally {
      setIsDeletingMember(false);
      setTimeout(() => setMemberActionNotice(null), 5000);
    }
  };

  const downloadRegistrationsExport = () => {
    window.open("/api/register?export=csv", "_blank");
  };

  const downloadLeadsExport = () => {
    window.open("/api/contact?export=csv", "_blank");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Active account check: if user is logged into the client as a non-admin (e.g. TEST-Pro, competitor, member)
        if (typeof window !== "undefined") {
          const rawShooter = localStorage.getItem("subsonic_shooter_profile");
          const rawMember = localStorage.getItem("subsonic_member_profile");
          const p = rawShooter ? JSON.parse(rawShooter) : rawMember ? JSON.parse(rawMember) : null;
          
          if (p) {
            const role = (p.role || "").toUpperCase();
            const callsign = (p.callsign || "").toUpperCase();
            const isExec = 
              role === "MASTER_OWNER" || 
              role === "OWNER_ADMIN" || 
              role === "DEV_ADMIN" || 
              role === "ADMIN" ||
              ["RADAR", "ROB", "LTDAN", "ALLEN", "AHURLEY", "HURLEY"].includes(callsign);

            if (!isExec) {
              setDetectedNonAdmin({ callsign: p.callsign || "Competitor", role: p.role || "PRO_COMPETITOR" });
              // Force invalidate any lingering server admin session cookie so non-admin cannot inherit it
              await fetch("/api/admin/logout", { method: "POST" });
              setIsAuthenticated(false);
              setAdminSession(null);
              return;
            }
          }
        }

        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (res.ok && data.authenticated && data.session) {
          setIsAuthenticated(true);
          setAdminSession(data.session);
          setDetectedNonAdmin(null);

          // Synchronize localStorage with active server session
          if (typeof window !== "undefined") {
            try {
              if (data.session.callsign === "ALLEN" || data.session.role === "OWNER_ADMIN") {
                const allenProfile = {
                  name: "Allen Hurley",
                  callsign: "ALLEN",
                  role: "OWNER_ADMIN",
                  division: "Owner Admin / Executive",
                  rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
                  badgeText: "OWNER ADMIN",
                  member_id: "SS-2026-0002",
                };
                const allenMember = {
                  member_id: "SS-2026-0002",
                  full_name: "Allen Hurley",
                  callsign: "ALLEN",
                  state: "TN",
                  experience_level: "Owner Admin / Executive",
                  rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
                  role: "OWNER_ADMIN",
                  created_at: "2026-07-04T12:00:00Z",
                };
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(allenProfile));
                localStorage.setItem("subsonic_member_profile", JSON.stringify(allenMember));
                localStorage.setItem("subsonic_chat_authenticated", "true");
              } else if (data.session.callsign === "RADAR" || data.session.role === "MASTER_OWNER") {
                const radarProfile = {
                  name: "Rob Neilson",
                  callsign: "RADAR",
                  role: "MASTER_OWNER",
                  division: "Master Admin",
                  rifleSetup: "Systems & Infrastructure Architecture (Non-Shooter)",
                  badgeText: "MASTER ADMIN",
                  member_id: "SS-2026-0001",
                };
                const radarMember = {
                  member_id: "SS-2026-0001",
                  full_name: "Rob Neilson",
                  callsign: "RADAR",
                  state: "TN",
                  experience_level: "Master Admin",
                  rifle_setup: "Smart Systems Integrations",
                  role: "MASTER_OWNER",
                  created_at: "2026-07-04T12:00:00Z",
                };
                localStorage.setItem("subsonic_shooter_profile", JSON.stringify(radarProfile));
                localStorage.setItem("subsonic_member_profile", JSON.stringify(radarMember));
                localStorage.setItem("subsonic_chat_authenticated", "true");
              }
              window.dispatchEvent(new Event("storage"));
            } catch {}
          }
        } else {
          setIsAuthenticated(false);
          setAdminSession(null);
        }
      } catch (e) {
        console.error("Session check failed", e);
        setIsAuthenticated(false);
        setAdminSession(null);
      }
    };
    checkSession();

    loadData();

    // Poll server for new telemetry events every 8 seconds while dashboard is open
    const pollInterval = setInterval(() => {
      loadData();
    }, 8000);

    // Listen for live new telemetry events fired by TelemetryProvider
    const handleNewEvent = () => {
      loadData();
    };

    const handleAbuseUpdate = () => {
      const updatedAlerts = getCommsAbuseAlerts();
      setAbuseAlerts(updatedAlerts);

      const flaggedFromAlerts: ChatMessage[] = updatedAlerts.map((a) => ({
        id: a.id,
        channelId: a.channel,
        type: "STANDARD",
        author: {
          id: `usr_${a.shooterCallsign.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          name: a.shooterName,
          callsign: a.shooterCallsign,
          role: a.shooterRole as any,
          badgeText: a.shooterRole,
          division: a.squad,
          rifleSetup: "Competition Rig",
        },
        content: a.messageContent,
        timestamp: new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reactions: [],
        moderationStatus: "FLAGGED",
        aiModerationReport: {
          toxicityScore: a.toxicityScore,
          threatScore: a.threatScore,
          policyScore: a.policyScore,
          sentiment: "TOXIC",
          flagReason: a.aiRationale,
          aiEngine: "Subsonic Sentinel",
        },
      }));
      setFlaggedMessages(flaggedFromAlerts);
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "subsonic_comms_abuse_alerts_v2") {
        handleAbuseUpdate();
      }
    };

    window.addEventListener("subsonic-telemetry-new-event", handleNewEvent);
    window.addEventListener("subsonic-comms-abuse-alert-updated", handleAbuseUpdate);
    window.addEventListener("subsonic-comms-abuse-kicked-up", handleAbuseUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("subsonic-telemetry-new-event", handleNewEvent);
      window.removeEventListener("subsonic-comms-abuse-alert-updated", handleAbuseUpdate);
      window.removeEventListener("subsonic-comms-abuse-kicked-up", handleAbuseUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim();
    if (!clean) return;
    
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: clean })
      });
      
      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setIsAuthenticated(true);
        setPasskeyError(false);
        setAdminSession(data.session);
        setDetectedNonAdmin(null);
        setPasskeyInput("");

        // Immediate synchronization of client profile so Dashboard & Navbar show Allen or Rob
        if (typeof window !== "undefined") {
          try {
            if (data.session.callsign === "ALLEN" || data.session.role === "OWNER_ADMIN") {
              const allenProfile = {
                name: "Allen Hurley",
                callsign: "ALLEN",
                role: "OWNER_ADMIN",
                division: "Owner Admin / Executive",
                rifleSetup: "Modacam Custom Precision V-22 / ZCO 527",
                badgeText: "OWNER ADMIN",
                member_id: "SS-2026-0002",
              };
              const allenMember = {
                member_id: "SS-2026-0002",
                full_name: "Allen Hurley",
                callsign: "ALLEN",
                state: "TN",
                experience_level: "Owner Admin / Executive",
                rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
                role: "OWNER_ADMIN",
                created_at: "2026-07-04T12:00:00Z",
              };
              localStorage.setItem("subsonic_shooter_profile", JSON.stringify(allenProfile));
              localStorage.setItem("subsonic_member_profile", JSON.stringify(allenMember));
              localStorage.setItem("subsonic_chat_authenticated", "true");
            } else if (data.session.callsign === "RADAR" || data.session.role === "MASTER_OWNER") {
              const radarProfile = {
                name: "Rob Neilson",
                callsign: "RADAR",
                role: "MASTER_OWNER",
                division: "Master Admin",
                rifleSetup: "Systems & Infrastructure Architecture (Non-Shooter)",
                badgeText: "MASTER ADMIN",
                member_id: "SS-2026-0001",
              };
              const radarMember = {
                member_id: "SS-2026-0001",
                full_name: "Rob Neilson",
                callsign: "RADAR",
                state: "TN",
                experience_level: "Master Admin",
                rifle_setup: "Smart Systems Integrations",
                role: "MASTER_OWNER",
                created_at: "2026-07-04T12:00:00Z",
              };
              localStorage.setItem("subsonic_shooter_profile", JSON.stringify(radarProfile));
              localStorage.setItem("subsonic_member_profile", JSON.stringify(radarMember));
              localStorage.setItem("subsonic_chat_authenticated", "true");
            }
            window.dispatchEvent(new Event("storage"));
          } catch {}
        }
      } else {
        setPasskeyError(true);
      }
    } catch (e) {
      setPasskeyError(true);
    }
  };

  const handleLock = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {}
    setIsAuthenticated(false);
    setAdminSession(null);
    setPasskeyInput("");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("subsonic_chat_authenticated");
        localStorage.removeItem("subsonic_shooter_profile");
        localStorage.removeItem("subsonic_member_profile");
        window.dispatchEvent(new Event("storage"));
      } catch {}
    }
  };

  const handleClearTelemetry = async () => {
    if (confirm("Reset telemetry event logs on both server storage and local buffer?")) {
      clearLocalTelemetry();
      try {
        await fetch("/api/telemetry?passkey=subsonic2026", { method: "DELETE" });
      } catch {}
      setEvents([]);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `subsonic_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSimulateTraffic = () => {
    setSimulating(true);
    const mockEvents = [
      { eventType: "page_landed" as const, targetElement: "Page: /bristol-pro", targetText: "Landed on /bristol-pro", targetCategory: "Page Landing", pageRoute: "/bristol-pro", isMember: true, memberId: "SS-2026-0003", memberCallsign: "LEIPOLD", memberName: "Erich Leipold" },
      { eventType: "click" as const, targetElement: "button_register_bristol_pro", targetText: "Register Squad ($275)", targetCategory: "Bristol Pro Portal", pageRoute: "/bristol-pro", isMember: true, memberId: "SS-2026-0003", memberCallsign: "LEIPOLD", memberName: "Erich Leipold" },
      { eventType: "page_landed" as const, targetElement: "Page: /dna", targetText: "Landed on /dna", targetCategory: "Page Landing", pageRoute: "/dna", isMember: false },
      { eventType: "click" as const, targetElement: "tab_ballistics_solver", targetText: "Mountain DOPE Solver", targetCategory: "Subsonic DNA Lab", pageRoute: "/dna", isMember: false },
      { eventType: "click" as const, targetElement: "button_claim_invite", targetText: "Claim Invite Code", targetCategory: "Membership & Registration", pageRoute: "/invite", isMember: false },
    ];
    mockEvents.forEach((item, idx) => {
      setTimeout(() => {
        recordTelemetryEvent(item);
      }, idx * 120);
    });
    setTimeout(() => {
      loadData();
      setSimulating(false);
    }, 750);
  };

  const stats = computeTelemetryAnalytics(events);

  // Filtered telemetry events for Live Telemetry table
  const filteredTelemetryEvents = React.useMemo(() => {
    return events.filter((e) => {
      const isPageLanded = e.eventType === "page_landed" || e.eventType === "pageview";
      const isClick = e.eventType === "click";

      if (telemetryTypeFilter === "PAGE_LANDED" && !isPageLanded) return false;
      if (telemetryTypeFilter === "CLICK" && !isClick) return false;

      if (telemetryAudienceFilter === "MEMBER" && !e.isMember) return false;
      if (telemetryAudienceFilter === "GUEST" && e.isMember) return false;

      if (telemetrySearch) {
        const q = telemetrySearch.toLowerCase();
        const matchesTarget = (e.targetElement || "").toLowerCase().includes(q);
        const matchesText = (e.targetText || "").toLowerCase().includes(q);
        const matchesCategory = (e.targetCategory || "").toLowerCase().includes(q);
        const matchesRoute = (e.pageRoute || "").toLowerCase().includes(q);
        const matchesMember = (e.memberId || "").toLowerCase().includes(q) ||
                              (e.memberCallsign || "").toLowerCase().includes(q) ||
                              (e.memberName || "").toLowerCase().includes(q);
        return matchesTarget || matchesText || matchesCategory || matchesRoute || matchesMember;
      }

      return true;
    });
  }, [events, telemetryTypeFilter, telemetryAudienceFilter, telemetrySearch]);

  // If not authenticated, show modern iOS passkey lock screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="ios-glass rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">
              ADMIN TELEMETRY PORTAL
            </h1>
            <p className="text-xs text-slate-300">
              Restricted executive system. Enter authorized Master Owner or Owner Admin security passkey to access.
            </p>
          </div>

          {detectedNonAdmin && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>RESTRICTED ACCESS</span>
              </div>
              <p>
                Currently authenticated on site as <strong className="text-white">[{detectedNonAdmin.callsign}]</strong> ({detectedNonAdmin.role}).
              </p>
              <p className="text-[11px] text-slate-400">
                Competitor and standard membership profiles cannot view the intelligence telemetry dashboard. Enter an authorized Master Owner or Owner Admin passkey to elevate clearance.
              </p>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                Owner / Master Admin Passkey
              </label>
              <input
                type="password"
                placeholder="Enter owner passkey..."
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
              {passkeyError && (
                <div className="text-[11px] text-red-400 font-mono mt-1">
                  Access Denied. Only authorized Master Owner & Owner Admin passkeys are accepted.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-tactical-glow transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate & Unlock Dashboard</span>
            </button>


          </form>
        </div>
      </div>
    );
  }

  const activeAbuseCount = abuseAlerts.filter((a) => a.status === "ACTIVE").length;
  const criticalAbuseCount = abuseAlerts.filter((a) => a.status === "ACTIVE" && a.severity === "CRITICAL").length;

  const staffMembers = members.filter((m) => {
    return (
      ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR", "MATCH_DIRECTOR", "OFFICIAL"].includes(m.role || "") ||
      m.member_id === "SS-2026-0001" ||
      m.member_id === "SS-2026-0002"
    );
  });

  const isStaffMember = (m: SocietyMember) => {
    return (
      ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR", "MATCH_DIRECTOR", "OFFICIAL"].includes(m.role || "") ||
      m.member_id === "SS-2026-0001" ||
      m.member_id === "SS-2026-0002"
    );
  };

  const filteredMembers = members.filter((m) => {
    // 1. Role filter: ALL, ADMINS, MEMBERS
    if (memberRoleFilter === "ADMINS" && !isStaffMember(m)) return false;
    if (memberRoleFilter === "MEMBERS" && isStaffMember(m)) return false;

    // 2. Status filter: ALL, ACTIVE, PAUSED, BANNED
    if (memberStatusFilter !== "ALL") {
      const status = m.status || "ACTIVE";
      if (status !== memberStatusFilter) return false;
    }

    // 3. Search query
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;

    // Also look up shooter profile specs for deep search
    const shooter = shooterProfiles.find(
      (s) =>
        s.callsign?.toLowerCase() === m.callsign?.toLowerCase() ||
        s.id?.toLowerCase() === m.member_id?.toLowerCase() ||
        s.name?.toLowerCase() === m.full_name?.toLowerCase()
    );

    return (
      m.full_name.toLowerCase().includes(q) ||
      (m.callsign && m.callsign.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      m.email.toLowerCase().includes(q) ||
      m.member_id.toLowerCase().includes(q) ||
      (m.rifle_setup && m.rifle_setup.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q)) ||
      (shooter?.division && shooter.division.toLowerCase().includes(q)) ||
      (shooter?.ranking && shooter.ranking.toLowerCase().includes(q)) ||
      (shooter?.homeRange && shooter.homeRange.toLowerCase().includes(q)) ||
      (shooter?.rifleSetup?.action && shooter.rifleSetup.action.toLowerCase().includes(q)) ||
      (shooter?.rifleSetup?.optic && shooter.rifleSetup.optic.toLowerCase().includes(q)) ||
      ((q === "radar" || q === "ltdan" || q === "dan" || q === "rob" || q === "robert" || q.includes("smart") || q.includes("systems")) && m.member_id === "SS-2026-0001")
    );
  });

  const filteredRegistrations = registrations.filter((r) => {
    const matchesMatch = regMatchFilter === "ALL" || r.match_id === regMatchFilter;
    const matchesDiv = regDivisionFilter === "ALL" || r.rifle_division === regDivisionFilter;
    const matchesSearch =
      !regSearch ||
      r.competitor_name.toLowerCase().includes(regSearch.toLowerCase()) ||
      (r.competitor_callsign && r.competitor_callsign.toLowerCase().includes(regSearch.toLowerCase())) ||
      r.competitor_email.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.ticket_number.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.rifle_model.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.match_title.toLowerCase().includes(regSearch.toLowerCase());
    return matchesMatch && matchesDiv && matchesSearch;
  });

  const filteredLeads = leads.filter((l) => {
    const matchesCat = leadCategoryFilter === "ALL" || l.category === leadCategoryFilter;
    const matchesStatus = leadStatusFilter === "ALL" || l.status === leadStatusFilter;
    const matchesSearch =
      !leadSearch ||
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.subject && l.subject.toLowerCase().includes(leadSearch.toLowerCase())) ||
      l.message.toLowerCase().includes(leadSearch.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 max-w-full overflow-x-hidden">
      {/* Member Management Toast Notice */}
      {memberActionNotice && (
        <div className="rounded-2xl bg-amber-500/20 border border-amber-500/40 p-3 sm:p-4 text-amber-300 text-xs sm:text-sm font-mono font-bold flex items-center justify-between shadow-tactical-glow animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{memberActionNotice}</span>
          </div>
          <button onClick={() => setMemberActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Persistent Comms Abuse Alert Banner */}
      {activeAbuseCount > 0 && !globalBannerDismissed && activeAdminTab !== "AI_MODERATION" && (
        <div className="rounded-2xl bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-2 border-red-500/70 p-4 sm:p-5 shadow-[0_0_25px_rgba(239,68,68,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                  🚨 {criticalAbuseCount > 0 ? "CRITICAL COMMS ABUSE ALERT" : "COMMS SAFETY VIOLATION"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-black">
                  {activeAbuseCount} ACTIVE
                </span>
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                Hostile transmission or unauthorized commerce flagged in competitor chat channels.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveAdminTab("AI_MODERATION")}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
            >
              <span>Inspect & Neutralize →</span>
            </button>
            <button
              onClick={() => setGlobalBannerDismissed(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-all"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Admin Hub
            </span>
            {adminSession && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 border ${
                adminSession.callsign === "ALLEN" || adminSession.role === "OWNER_ADMIN"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: adminSession.callsign === "ALLEN" || adminSession.role === "OWNER_ADMIN" ? "#10b981" : "#f59e0b" }} />
                <span>{adminSession.callsign === "ALLEN" || adminSession.role === "OWNER_ADMIN" ? "Owner Admin" : "Master Admin"}</span>
                <span className="text-white">· {adminSession.name} [{adminSession.callsign}]</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ADMIN TELEMETRY & <span className="amber-gradient-text">ENGAGEMENT</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Real-time tracking of visitor clicks, target elements, session duration, dwell times, and AI moderation defense. All events recorded persistently to server storage.
          </p>
        </div>

        {/* Global Actions — consistent pill style, grouped: Go to · Tools · Session */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Go to */}
          <Link
            href="/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Open the chat room in a new tab"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Enter Room</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          <span className="hidden md:block w-px h-6 bg-white/10 mx-0.5" />

          {/* Tools */}
          <button
            type="button"
            onClick={() => setIsBotCardOpen(true)}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              botsEnabled
                ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/40"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
            }`}
            title="Manage the test bot fleet"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Test Bots: <strong className={botsEnabled ? "text-cyan-300" : "text-slate-400"}>{botsEnabled ? "ON" : "OFF"}</strong></span>
          </button>

          <button
            onClick={() => downloadTelemetryExport("csv")}
            className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download CSV for Excel / Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download full JSON event dump"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={loadData}
            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearTelemetry}
            className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-colors"
            title="Clear local event buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <span className="hidden md:block w-px h-6 bg-white/10 mx-0.5" />

          {/* Session */}
          <button
            onClick={handleOpenPasskeysModal}
            className="h-9 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Configure Master Owner & Admin Passkeys"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Passkeys</span>
          </button>

          <button
            onClick={handleLock}
            className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Log out of the admin dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid: Strictly Page Landings, Items Clicked, and Member Tracking */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pages Landed On</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.totalPageLandings}
          </div>
          <div className="text-[11px] text-cyan-400/90 font-mono mt-1">
            {stats.memberLandings} by Members • {stats.guestLandings} by Guests
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Items Clicked On</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.totalItemsClicked}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono mt-1">
            {stats.memberClicks} by Members • {stats.guestClicks} by Guests
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Member Activity</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.memberEventsCount} <span className="text-sm font-normal text-emerald-400">({stats.memberPercentage}%)</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono mt-1">
            {stats.uniqueMembers} Unique Society Members
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Unique Audience</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.uniqueVisitors}
          </div>
          <div className="text-[11px] text-slate-300 font-mono mt-1">
            {stats.deviceBreakdown.mobilePercentage}% Mobile • {stats.deviceBreakdown.desktopPercentage}% Desktop
          </div>
        </div>
      </div>

      {/* Admin Navigation Command Deck — Modern Stacked Tactical Layout for Desktop & Mobile */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 bg-[#07090E]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        {/* DESKTOP (md & up): 3 Stacked Command Sectors — 100% visible, zero horizontal overflow */}
        <div className="hidden md:grid md:grid-cols-3 gap-2.5">
          {/* Sector 1: OPERATIVES & ROSTER */}
          <div className={`p-2.5 rounded-2xl border transition-all ${
            ["MEMBERS", "INVITES", "REGISTRATIONS"].includes(activeAdminTab)
              ? "bg-amber-500/[0.04] border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.06)]"
              : "bg-white/[0.02] border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>OPERATIVES &amp; ROSTER</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">3 MODULES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "MEMBERS", label: "Members & Shooters", icon: Users, badge: `${members.length}`, colSpan2: true },
                { id: "INVITES", label: "Invite Keys & VIP", icon: Key, badge: "INVITE ONLY", highlight: true },
                { id: "REGISTRATIONS", label: "Registrations", icon: Trophy, badge: `${registrations.length}` },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-all text-left ${
                      (tab as any).colSpan2 ? "col-span-2" : ""
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-tactical-glow"
                        : tab.highlight
                        ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                        : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate text-[11px]">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isActive ? "bg-black/25 text-black" : "bg-white/15 text-slate-300"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector 2: MATCHES & VAULT */}
          <div className={`p-2.5 rounded-2xl border transition-all ${
            ["EVENTS", "DOCUMENTS", "LEADS"].includes(activeAdminTab)
              ? "bg-blue-500/[0.04] border-blue-500/35 shadow-[0_0_15px_rgba(59,130,246,0.06)]"
              : "bg-white/[0.02] border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>MATCHES &amp; VAULT</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">3 MODULES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "EVENTS", label: "Match Schedule", icon: Calendar, badge: `${matches.length}` },
                { id: "DOCUMENTS", label: "Competition Vault", icon: FileText, badge: `${competitionDocs.length}` },
                { 
                  id: "LEADS", 
                  label: "Leads & Inquiries", 
                  icon: Mail, 
                  badge: leads.filter((l) => l.status === "NEW").length > 0 ? `${leads.filter((l) => l.status === "NEW").length} NEW` : undefined,
                  isAlert: leads.filter((l) => l.status === "NEW").length > 0,
                  colSpan2: true
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-all text-left ${
                      tab.colSpan2 ? "col-span-2" : ""
                    } ${
                      isActive
                        ? tab.isAlert
                          ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] font-extrabold"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-tactical-glow"
                        : tab.isAlert
                        ? "text-red-400 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40"
                        : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${tab.isAlert ? "text-red-300 animate-pulse" : ""}`} />
                      <span className="truncate text-[11px]">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isActive
                          ? "bg-black/25 text-black"
                          : tab.isAlert
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-white/15 text-slate-300"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector 3: COMMS & TELEMETRY */}
          <div className={`p-2.5 rounded-2xl border transition-all ${
            ["CHAT", "AI_MODERATION", "CLICKSTREAM", "PAGES_AND_CLICKS"].includes(activeAdminTab)
              ? "bg-emerald-500/[0.04] border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
              : "bg-white/[0.02] border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>COMMS &amp; SECURITY</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">4 MODULES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "CHAT", label: "Chat Comms", icon: MessageSquare },
                { 
                  id: "AI_MODERATION", 
                  label: "AI Defense", 
                  icon: ShieldAlert, 
                  badge: activeAbuseCount > 0 ? `${activeAbuseCount} ACTIVE` : undefined,
                  isAlert: activeAbuseCount > 0
                },
                { id: "CLICKSTREAM", label: "Live Telemetry", icon: MousePointerClick, badge: `${events.length}` },
                { id: "PAGES_AND_CLICKS", label: "Pages & Clicks", icon: Flame },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-all text-left ${
                      isActive
                        ? tab.isAlert
                          ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] font-extrabold"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-tactical-glow"
                        : tab.isAlert
                        ? "text-red-400 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40"
                        : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${tab.isAlert ? "text-red-300 animate-pulse" : ""}`} />
                      <span className="truncate text-[11px]">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isActive
                          ? "bg-black/25 text-black"
                          : tab.isAlert
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-white/15 text-slate-300"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MOBILE (< md): Clean Touch-Scrollable Row */}
        <div className="md:hidden overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 min-w-max pb-1">
            {[
              { id: "MEMBERS", label: "Members", icon: Users, badge: `${members.length}` },
              { id: "INVITES", label: "Invites & VIP", icon: Key, badge: "INVITE ONLY" },
              { id: "REGISTRATIONS", label: "Registrations", icon: Trophy, badge: `${registrations.length}` },
              { 
                id: "LEADS", 
                label: "Leads", 
                icon: Mail, 
                badge: leads.filter((l) => l.status === "NEW").length > 0 ? `${leads.filter((l) => l.status === "NEW").length} NEW` : undefined,
                isAlert: leads.filter((l) => l.status === "NEW").length > 0
              },
              { id: "DOCUMENTS", label: "Vault", icon: FileText, badge: `${competitionDocs.length}` },
              { id: "CHAT", label: "Chat", icon: MessageSquare },
              { id: "EVENTS", label: "Matches", icon: Calendar },
              { id: "CLICKSTREAM", label: "Telemetry", icon: MousePointerClick, badge: `${events.length}` },
              { id: "PAGES_AND_CLICKS", label: "Pages", icon: Flame },
              { 
                id: "AI_MODERATION", 
                label: "AI Defense", 
                icon: ShieldAlert, 
                badge: activeAbuseCount > 0 ? `${activeAbuseCount} ACTIVE` : undefined,
                isAlert: activeAbuseCount > 0
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id as any)}
                  className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? tab.isAlert 
                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold" 
                        : "bg-amber-500 text-black shadow-tactical-glow font-bold"
                      : tab.isAlert
                      ? "text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.isAlert ? "text-red-300 animate-pulse" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      tab.isAlert ? "bg-red-600 text-white animate-pulse" : "bg-white/20 text-white"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB: INVITATION CODES & VIP GENERATOR */}
      {activeAdminTab === "INVITES" && (
        <AdminInviteGeneratorTab />
      )}

      {/* TAB: ALL SOCIETY MEMBERS & SHOOTERS DIRECTORY */}
      {(activeAdminTab === "MEMBERS" || activeAdminTab === "SHOOTERS") && (
        <AdminMembersTab
          members={members}
          filteredMembers={filteredMembers}
          staffMembers={staffMembers}
          shooterProfiles={shooterProfiles}
          memberSearch={memberSearch}
          setMemberSearch={setMemberSearch}
          memberStateFilter={memberStateFilter}
          setMemberStateFilter={setMemberStateFilter}
          memberRoleFilter={memberRoleFilter}
          setMemberRoleFilter={setMemberRoleFilter}
          memberStatusFilter={memberStatusFilter}
          setMemberStatusFilter={setMemberStatusFilter}
          appointMemberId={appointMemberId}
          setAppointMemberId={setAppointMemberId}
          appointRole={appointRole}
          setAppointRole={setAppointRole}
          isAppointing={isAppointing}
          cardDeleteConfirmId={cardDeleteConfirmId}
          setCardDeleteConfirmId={setCardDeleteConfirmId}
          isDeletingMember={isDeletingMember}
          setMemberModalTab={setMemberModalTab}
          downloadMembersExport={downloadMembersExport}
          handleOpenMemberModal={handleOpenMemberModal}
          handleQuickStatusChange={handleQuickStatusChange}
          handleAssignMemberRole={handleAssignMemberRole}
          handleDeleteMember={handleDeleteMember}
          adminSession={adminSession}
        />
      )}

      {/* TAB: REGISTERED MATCH SHOOTERS */}
      {activeAdminTab === "REGISTRATIONS" && (
        <AdminRegistrationsTab
          registrations={registrations}
          filteredRegistrations={filteredRegistrations}
          regSearch={regSearch}
          setRegSearch={setRegSearch}
          regMatchFilter={regMatchFilter}
          setRegMatchFilter={setRegMatchFilter}
          regDivisionFilter={regDivisionFilter}
          setRegDivisionFilter={setRegDivisionFilter}
          downloadRegistrationsExport={downloadRegistrationsExport}
        />
      )}

      {/* TAB: CONTACT LEADS & INQUIRIES */}
      {activeAdminTab === "LEADS" && (
        <AdminLeadsTab
          leads={leads}
          filteredLeads={filteredLeads}
          leadSearch={leadSearch}
          setLeadSearch={setLeadSearch}
          leadCategoryFilter={leadCategoryFilter}
          setLeadCategoryFilter={setLeadCategoryFilter}
          leadStatusFilter={leadStatusFilter}
          setLeadStatusFilter={setLeadStatusFilter}
          handleUpdateLeadStatus={handleUpdateLeadStatus}
          downloadLeadsExport={downloadLeadsExport}
        />
      )}

      {/* TAB: Live Telemetry Stream (Page Landings & Items Clicked, Tracking Members & Guests) */}
      {activeAdminTab === "CLICKSTREAM" && (
        <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header & Filter Controls */}
          <div className="p-4 border-b border-white/10 bg-black/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Live Telemetry: Page Landings & Items Clicked
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Tracking {stats.memberEventsCount} Member &amp; {stats.guestEventsCount} Guest Events
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Event Type Filter */}
                <div className="flex items-center p-0.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono">
                  <button
                    onClick={() => setTelemetryTypeFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryTypeFilter === "ALL"
                        ? "bg-amber-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Events ({events.length})
                  </button>
                  <button
                    onClick={() => setTelemetryTypeFilter("PAGE_LANDED")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryTypeFilter === "PAGE_LANDED"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📍 Pages Landed ({stats.totalPageLandings})
                  </button>
                  <button
                    onClick={() => setTelemetryTypeFilter("CLICK")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryTypeFilter === "CLICK"
                        ? "bg-amber-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    👆 Items Clicked ({stats.totalItemsClicked})
                  </button>
                </div>

                {/* Audience Filter (Members vs Guests) */}
                <div className="flex items-center p-0.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono">
                  <button
                    onClick={() => setTelemetryAudienceFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryAudienceFilter === "ALL"
                        ? "bg-white/20 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Visitors
                  </button>
                  <button
                    onClick={() => setTelemetryAudienceFilter("MEMBER")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryAudienceFilter === "MEMBER"
                        ? "bg-emerald-500 text-black font-bold"
                        : "text-emerald-400 hover:text-emerald-300"
                    }`}
                  >
                    🎖️ Members Only ({stats.memberEventsCount})
                  </button>
                  <button
                    onClick={() => setTelemetryAudienceFilter("GUEST")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      telemetryAudienceFilter === "GUEST"
                        ? "bg-slate-700 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Guests Only ({stats.guestEventsCount})
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={telemetrySearch}
                  onChange={(e) => setTelemetrySearch(e.target.value)}
                  placeholder="Search item, route, member..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-400 font-mono border-b border-white/5">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Audience Status</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Target Element / Action</th>
                  <th className="p-3.5">Text / Identifier</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Page Route</th>
                  <th className="p-3.5">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredTelemetryEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No telemetry events matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTelemetryEvents.slice(0, 100).map((evt) => {
                    const isPageLanded = evt.eventType === "page_landed" || evt.eventType === "pageview";
                    return (
                      <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>

                        {/* Audience Status: Member vs Guest */}
                        <td className="p-3.5 whitespace-nowrap">
                          {evt.isMember ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>MEMBER</span>
                              {(evt.memberCallsign || evt.memberId) && (
                                <span className="text-amber-200/70 font-normal">
                                  ({evt.memberCallsign || evt.memberId})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10 text-[10px]">
                              Guest Visitor
                            </span>
                          )}
                        </td>

                        {/* Event Type: Page Landed vs Item Clicked */}
                        <td className="p-3.5 whitespace-nowrap">
                          {isPageLanded ? (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                              <Compass className="w-3 h-3 text-cyan-400" />
                              Page Landed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3 text-amber-400" />
                              Item Clicked
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-white font-bold whitespace-nowrap">
                          {evt.targetElement}
                        </td>
                        <td className="p-3.5 text-slate-200 max-w-xs truncate">
                          {evt.targetText || "—"}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">
                            {evt.targetCategory || "General"}
                          </span>
                        </td>
                        <td className="p-3.5 text-blue-400 font-medium whitespace-nowrap">
                          {evt.pageRoute}
                        </td>
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">
                          {evt.device?.isIOS ? "🍎 iOS" : evt.device?.isMobile ? "📱 Mobile" : "💻 Desktop"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Pages Landed On & Most Clicked Items (Breakdown by Members vs Guests) */}
      {activeAdminTab === "PAGES_AND_CLICKS" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Pages Landed On */}
          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Pages Landed On ({stats.totalPageLandings} Landings)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Ranked by landing volume
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Breakdown of user traffic landings and Member vs. Guest engagement per route.
            </p>

            <div className="space-y-3 pt-2">
              {stats.topLandedPages.length === 0 ? (
                <div className="text-slate-500 text-center py-6 font-mono text-xs">
                  No page landings recorded yet.
                </div>
              ) : (
                stats.topLandedPages.map((item) => (
                  <div key={item.route} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-bold">{item.route}</span>
                      <span className="text-white font-bold">{item.total} Landings</span>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((item.total / (stats.totalPageLandings || 1)) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-medium">
                        🎖️ {item.memberLandings} Member landings ({item.total > 0 ? Math.round((item.memberLandings / item.total) * 100) : 0}%)
                      </span>
                      <span className="text-slate-400">
                        {item.guestLandings} Guest landings
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Top Clicked Items */}
          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Top Clicked Buttons &amp; Links ({stats.totalItemsClicked} Clicks)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Ranked by click volume
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive elements clicked by users with Member vs. Guest interaction splits.
            </p>

            <div className="space-y-3 pt-2">
              {stats.topClickedElements.length === 0 ? (
                <div className="text-slate-500 text-center py-6 font-mono text-xs">
                  No items clicked yet.
                </div>
              ) : (
                stats.topClickedElements.map((item, idx) => (
                  <div
                    key={item.element}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white/10 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-white font-bold truncate max-w-xs">{item.text || item.element}</div>
                          <div className="text-[10px] text-slate-400">{item.element} • {item.category}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-amber-400 font-bold">{item.count} Clicks</div>
                        <div className="text-[10px] text-slate-400">
                          {Math.round((item.count / (stats.totalItemsClicked || 1)) * 100)}% of total
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span className="text-emerald-400 font-medium">
                        🎖️ {item.memberClicks} Member clicks
                      </span>
                      <span className="text-slate-400">
                        {item.guestClicks} Guest clicks
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CHAT MODERATION */}
      {activeAdminTab === "CHAT" && (
        <div className="space-y-6">
          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xl font-black text-white">Chat Moderation Center</h3>
                  <p className="text-xs text-slate-400">Review and moderate messages across all channels. Direct action on any transmission.</p>
                </div>
              </div>
              <Link
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow active:scale-95 transition-all"
              >
                <Radio className="w-3.5 h-3.5 fill-black animate-pulse" />
                <span>ENTER ROOM (NEW TAB)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-amber-400">{members.length}</div>
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Active Chatters</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-emerald-400">7</div>
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Active Channels</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-red-400">{flaggedMessages.length}</div>
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Flagged Messages</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className={`text-2xl font-black ${botsEnabled ? "text-cyan-400 animate-pulse" : "text-slate-400"}`}>
                  {botsEnabled ? "ON" : "OFF"}
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">Test Bot Fleet</div>
              </div>
            </div>

            {/* Autonomous Test Bot Fleet Controller (Off-Chat Control) */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Autonomous Test Bot Fleet (Off-Chat Controller)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    botsEnabled
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/10 text-slate-300 border border-white/10"
                  }`}>
                    {botsEnabled ? "SIMULATION ACTIVE" : "OFFLINE"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleBots}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      botsEnabled
                        ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {botsEnabled ? "STOP TEST BOTS" : "START TEST BOTS"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBotCardOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Fleet Card &amp; Audition</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-300">
                Simulates real-world match chat traffic, stage discussions, equipment DOPE cards, and tests AI Sentinel defense against bad actors and spam. Controlled entirely from Admin off chat.
              </p>
            </div>

            {/* Live Mobile Comms Beacon Controller & Broadcast Tester */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Mobile Lower Nav Comms Beacon (Live State: <span className={
                      commsBeaconLevel === "red" ? "text-red-400 font-black" :
                      commsBeaconLevel === "amber" ? "text-amber-400 font-black" :
                      commsBeaconLevel === "green" ? "text-emerald-400 font-black" :
                      "text-slate-400 font-bold"
                    }>{commsBeaconLevel.toUpperCase()}</span>)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Controls color-coded pulsing dot on mobile navigation bar
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCommsAlertLevel("green", "Live Stage Net Chatter", "Squad competitors are transmitting in active channels.");
                    setCommsBeaconLevel("green");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    commsBeaconLevel === "green"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">🟢 New Messages</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">Green Pulsing Dot</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCommsAlertLevel("amber", "Match Director Notice", "Stage 8 wind hold and COF briefing update posted.");
                    setCommsBeaconLevel("amber");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    commsBeaconLevel === "amber"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">🟡 Attention Notice</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">Amber Pulsing Dot</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCommsAlertLevel("red", "Range Safety Freeze", "Critical safety hold called across all stages.");
                    setCommsBeaconLevel("red");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    commsBeaconLevel === "red"
                      ? "bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">🔴 Red Alert</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">Red Pulsing Dot</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearCommsAlert();
                    setCommsBeaconLevel("none");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    commsBeaconLevel === "none"
                      ? "bg-white/15 border-white/40 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">⚪ Clear Beacon</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">Idle / Read State</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Recent Transmissions — All Channels</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {botActivityMessages.length + flaggedMessages.length} Logged
                </span>
              </div>
              <div className="flex items-center gap-2">
                {botActivityMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearBotActivityLog();
                      setBotActivityMessages([]);
                    }}
                    className="text-xs font-mono font-medium text-red-300 hover:text-red-200 underline"
                  >
                    Clear Bot Logs
                  </button>
                )}
                <span className="text-xs font-mono text-slate-300 font-medium">Last 50 messages</span>
              </div>
            </div>

            {flaggedMessages.length === 0 && botActivityMessages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-60" />
                <p className="text-sm text-slate-300 font-mono">No recent transmissions recorded.</p>
                <p className="text-xs text-slate-400">Transmissions and moderation flags will appear here in real time.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {[...flaggedMessages, ...botActivityMessages.filter((b) => !flaggedMessages.some((f) => f.id === b.id))].slice(0, 50).map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400">[{msg.author.callsign}]</span>
                          <span className="text-sm font-semibold text-white">{msg.author.name}</span>
                          <span className="text-xs text-slate-300">{msg.timestamp}</span>
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">#{msg.channelId}</span>
                          {msg.moderationStatus === "FLAGGED" && (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">FLAGGED</span>
                          )}
                          {msg.author.id.startsWith("bot-") && (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">BOT</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-200 break-words leading-relaxed">{msg.content}</p>
                        {msg.aiModerationReport?.flagReason && (
                          <p className="text-xs text-red-300 font-mono font-medium">⚠ {msg.aiModerationReport.flagReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setFlaggedMessages((prev) => prev.filter((m) => m.id !== msg.id));
                            setBotActivityMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Warn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(msg.author.id, "BANNED")}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-950/80 text-red-200 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Ban</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AI Comms Abuse Defense & Moderation Command Center */}
      {activeAdminTab === "AI_MODERATION" && (
        <CommsAbuseModerator />
      )}


      {/* TAB 5: Match Director Hub */}
      {activeAdminTab === "EVENTS" && (
        <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Competition Squad & Match Manager
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Monitor competitor registration capacity, entry receipts, and stage courses of fire.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {m.tier.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{m.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{m.location}</p>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div>
                    <div className="text-slate-400">REGISTERED</div>
                    <div className="text-sm font-black text-amber-400">
                      {m.registeredCount} / {m.maxCompetitors} Shooters
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">ENTRY FEE</div>
                    <div className="text-sm font-black text-white">${m.entryFee}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">PURSE</div>
                    <div className="text-sm font-black text-emerald-400">{m.prizePool.split(" ")[0]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* TAB: COMPETITION VAULT & DOCUMENTS */}
      {activeAdminTab === "DOCUMENTS" && (
        <div className="space-y-6">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-black text-white">
                    Competition Documents Vault ({competitionDocs.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Manage Course of Fire (COF) packets, match bylaws, cold range liability waivers, and elevation packets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>+ Register New Document</span>
                </button>

                <Link
                  href="/invitational"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>Open Invitational Packet</span>
                </Link>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents by title, category, match name, or file name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitionDocs
              .filter((d) => {
                const q = docSearch.toLowerCase().trim();
                return (
                  !q ||
                  d.title.toLowerCase().includes(q) ||
                  d.category.toLowerCase().includes(q) ||
                  d.description.toLowerCase().includes(q) ||
                  (d.matchTitle && d.matchTitle.toLowerCase().includes(q)) ||
                  d.fileName.toLowerCase().includes(q)
                );
              })
              .map((doc) => (
                <div
                  key={doc.id}
                  className="ios-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                          {doc.category}
                        </span>
                        {doc.isMandatory && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>MANDATORY</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {doc.version}
                      </span>
                    </div>

                    <div>
                      {doc.matchTitle && (
                        <div className="text-[10px] font-mono text-amber-400 font-semibold mb-0.5 truncate">
                          {doc.matchTitle}
                        </div>
                      )}
                      <h4 className="text-base font-black text-white">{doc.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{doc.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                      <span className="truncate">{doc.fileName}</span>
                      <span className="shrink-0">{doc.fileSize || "PDF"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-tactical-glow transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                      className="p-2 rounded-xl bg-red-600/10 hover:bg-red-600/25 border border-red-500/30 text-red-400 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ADD NEW COMPETITION DOCUMENT MODAL                                  */}
      {/* ==================================================================== */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto ios-glass-card rounded-3xl p-5 sm:p-7 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative space-y-5 my-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-black text-white">
                    REGISTER COMPETITION DOCUMENT
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Add Course of Fire packets, rules, cold-range waivers, or elevation maps to the vault.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Official Course of Fire Stage Briefs"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                    Category *
                  </label>
                  <select
                    value={newDocForm.category}
                    onChange={(e) => setNewDocForm((p) => ({ ...p, category: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="COF">Course of Fire (COF)</option>
                    <option value="RULES">Match Rules &amp; Bylaws</option>
                    <option value="WAIVER">Cold Range Waiver</option>
                    <option value="SCHEDULE">Squadding &amp; Flight</option>
                    <option value="RANGE_INTEL">Elevation &amp; Topo Intel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                    Version
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={newDocForm.version}
                    onChange={(e) => setNewDocForm((p) => ({ ...p, version: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                  Associated Match
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subsonic Society Invitational 2026"
                  value={newDocForm.matchTitle}
                  onChange={(e) => setNewDocForm((p) => ({ ...p, matchTitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                    File Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="official-cof-2026.pdf"
                    value={newDocForm.fileName}
                    onChange={(e) => setNewDocForm((p) => ({ ...p, fileName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                    File URL / Path *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/documents/official-cof-2026.pdf"
                    value={newDocForm.fileUrl}
                    onChange={(e) => setNewDocForm((p) => ({ ...p, fileUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis of stage counts, safety requirements, or elevation notes..."
                  value={newDocForm.description}
                  onChange={(e) => setNewDocForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-500/25">
                <input
                  type="checkbox"
                  id="mandatory-doc"
                  checked={newDocForm.isMandatory}
                  onChange={(e) => setNewDocForm((p) => ({ ...p, isMandatory: e.target.checked }))}
                  className="w-4 h-4 rounded text-red-500 focus:ring-red-400 border-white/20 bg-black/50"
                />
                <label htmlFor="mandatory-doc" className="text-xs text-red-300 font-mono font-bold cursor-pointer">
                  Mandatory Document (Competitors must review/sign prior to shooting)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                >
                  {isSubmittingDoc ? "Registering..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MEMBER PROFILE MANAGEMENT MODAL (EDIT, PAUSE, BAN, DELETE, PASS)    */}
      {/* ==================================================================== */}
      {isMemberModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto ios-glass-card rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-tactical-glow relative space-y-5 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white">
                    MEMBER PROFILE &amp; ACCESS CONTROL
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {memberForm.member_id}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Manage marksman credentials, competition classification, comms privileges, or purge record.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyFullMemberProfile}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Copy all contents of the shooter profile"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedFullProfile ? "✓ Profile Copied!" : "Copy Full Profile"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs: Edit Details vs Shooter Blueprint vs Digital Pass Preview */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setMemberModalTab("DETAILS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  memberModalTab === "DETAILS"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Account &amp; Access</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalTab("BLUEPRINT")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  memberModalTab === "BLUEPRINT"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Rifle Blueprint &amp; Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalTab("PASS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  memberModalTab === "PASS"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Live Digital Pass</span>
              </button>
            </div>

            {/* Tab 1: Form & Access Controls */}
            {memberModalTab === "DETAILS" ? (
              <form onSubmit={handleSaveMember} className="space-y-4 pt-1">
                {/* Account Status Switcher Strip */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center justify-between">
                    <span>Account Status &amp; Comms Privileges</span>
                    <span className="text-amber-400 font-normal">Controls Chat Access</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberForm((prev) => ({ ...prev, status: "ACTIVE" }))}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        memberForm.status === "ACTIVE" || !memberForm.status
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">🟢 ACTIVE</div>
                      <div className="text-[10px] text-slate-400">Full Access</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMemberForm((prev) => ({ ...prev, status: "PAUSED" }))}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        memberForm.status === "PAUSED"
                          ? "bg-amber-500/25 border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">⏸️ PAUSED</div>
                      <div className="text-[10px] text-slate-400">Temp Freeze</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMemberForm((prev) => ({ ...prev, status: "BANNED" }))}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        memberForm.status === "BANNED"
                          ? "bg-red-600/30 border-red-500 text-red-300 font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">🚫 BANNED</div>
                      <div className="text-[10px] text-slate-400">Revoked</div>
                    </button>
                  </div>
                </div>

                {/* Security Clearance & System Role Strip */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Security Clearance &amp; System Role</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      Promote to Admin or Mod
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {[
                      { role: "MASTER_OWNER" as const, label: "⚡ Master Admin", desc: "Root / Systems Admin", color: "from-amber-400 to-yellow-500", text: "text-black" },
                      { role: "OWNER_ADMIN" as const, label: "🎖️ Owner Admin", desc: "Executive Lead", color: "from-emerald-400 to-teal-500", text: "text-black" },
                      { role: "ADMIN" as const, label: "🛡️ Admin", desc: "System Ops", color: "from-cyan-500 to-blue-600", text: "text-black" },
                      { role: "MODERATOR" as const, label: "⚖️ Moderator", desc: "Comms & Chat", color: "from-purple-500 to-indigo-600", text: "text-white" },
                      { role: "MATCH_DIRECTOR" as const, label: "🎯 Director", desc: "Match Master", color: "from-amber-500 to-orange-500", text: "text-black" },
                      { role: "OFFICIAL" as const, label: "📋 Official", desc: "Safety Marshal", color: "from-slate-300 to-slate-400", text: "text-black" },
                      { role: "PRO_COMPETITOR" as const, label: "🏅 Pro Shooter", desc: "Verified Pro", color: "from-blue-500 to-indigo-500", text: "text-white" },
                      { role: "MEMBER" as const, label: "🎯 Member", desc: "Standard Shooter", color: "from-slate-600 to-slate-700", text: "text-white" },
                    ].map((item) => {
                      const isSelected = (memberForm.role || "MEMBER") === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setMemberForm((prev) => ({ ...prev, role: item.role }))}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? `bg-gradient-to-r ${item.color} ${item.text} font-black shadow-tactical-glow border-white/50 scale-[1.02]`
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="font-bold text-xs truncate">{item.label}</div>
                          <div className={`text-[9px] ${isSelected ? (item.text === "text-black" ? "text-black/80 font-bold" : "text-white/80") : "text-slate-400"}`}>
                            {item.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Inputs: Full Name & Callsign */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Marksman Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={memberForm.full_name || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <CallsignInput
                    value={memberForm.callsign || ""}
                    onChange={(val) => setMemberForm((prev) => ({ ...prev, callsign: val }))}
                    excludeMemberId={memberForm.member_id}
                    stateCode={memberForm.state}
                    label="Tactical Callsign / Handle *"
                    sublabel="Unique Network Identifier"
                  />
                </div>

                {/* Email & Home State */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={memberForm.email || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Home State
                    </label>
                    <select
                      value={memberForm.state || "TN"}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs font-mono focus:outline-none focus:border-amber-400"
                    >
                      {["TN", "VA", "NC", "KY", "WV", "GA", "SC", "AL", "FL", "PA", "OH", "TX", "OTHER"].map((st) => (
                        <option key={st} value={st} className="bg-[#0e131d]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Classification / Division & Rifle Rig */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Competition Classification
                    </label>
                    <input
                      type="text"
                      value={memberForm.experience_level || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, experience_level: e.target.value }))}
                      placeholder="e.g. Master / Pro Series"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Primary Rifle &amp; Optic Rig
                    </label>
                    <input
                      type="text"
                      value={memberForm.rifle_setup || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, rifle_setup: e.target.value }))}
                      placeholder="e.g. Vudoo V-22 / Bartlein / ZCO 527"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Member Password / Access PIN Reset Section */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-black/50 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Member Password / Access PIN</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Chat &amp; Stage Comms Login Key
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={pinMaxLength(memberForm.role)}
                        value={memberForm.pin || ""}
                        onChange={(e) =>
                          setMemberForm((prev) => ({
                            ...prev,
                            pin: e.target.value.replace(/[^0-9]/g, "").slice(0, pinMaxLength(prev.role)),
                          }))
                        }
                        placeholder={isAdminRole(memberForm.role) ? "Set 4–6 digit admin PIN..." : "Set 4-digit member PIN..."}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPin = generatePin(memberForm.role);
                        setMemberForm((prev) => ({ ...prev, pin: randomPin }));
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Generate PIN</span>
                    </button>
                  </div>

                  {memberForm.pin && (
                    <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-white/5">
                      <span className="text-[11px] font-mono text-emerald-400">
                        Configured PIN: <strong className="text-white tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">{memberForm.pin}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = `SUBSONIC SOCIETY ACCESS CREDENTIALS\nMember ID: ${memberForm.member_id}\nCallsign: ${memberForm.callsign}\nLogin PIN: ${memberForm.pin}\nComms Net: https://subsonicsociety.com/chat`;
                          navigator.clipboard.writeText(textToCopy);
                          setCopiedCredentialMemberId(memberForm.member_id);
                          setTimeout(() => setCopiedCredentialMemberId(null), 3000);
                        }}
                        className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 underline"
                      >
                        {copiedCredentialMemberId === memberForm.member_id ? "✓ Copied to Clipboard!" : "Copy Credential Card"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Internal Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Admin / Staff Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={memberForm.notes || ""}
                    onChange={(e) => setMemberForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Staff notes, squad placement, or range safety notes..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isSavingMember}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingMember ? "Saving Changes..." : "Save Member Changes"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyFullMemberProfile}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      title="Copy all contents of shooter profile"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>{copiedFullProfile ? "✓ Profile Copied!" : "Copy All Profile Data"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMemberModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Danger Zone: Delete Permanently */}
                  {memberForm.member_id === "SS-2026-0001" || memberForm.member_id === "SS-2026-0002" ? (
                    <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Root Executive Account (Protected)</span>
                    </div>
                  ) : !showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/25 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Member</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2 w-full sm:w-auto animate-fadeIn">
                      <span className="text-[11px] font-mono text-red-300 font-bold">Permanently delete?</span>
                      <button
                        type="button"
                        disabled={isDeletingMember}
                        onClick={() => handleDeleteMember(memberForm.member_id)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50"
                      >
                        {isDeletingMember ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            ) : memberModalTab === "BLUEPRINT" ? (
              /* Tab 2: Shooter Blueprint & Rig Specs */
              <form onSubmit={handleSaveMember} className="space-y-4 pt-1">
                {/* Blueprint Header Notice */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span>Rifle Rig Blueprint &amp; Competition DNA</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Syncs automatically to public shooter profiles and match DOPE telemetry.
                    </p>
                  </div>
                  {memberForm.shooterId && (
                    <Link
                      href={`/shooters?id=${memberForm.shooterId}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-mono flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                      <span>Public Card</span>
                    </Link>
                  )}
                </div>

                {/* Division, Ranking, Podiums, Home Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Shooting Division
                    </label>
                    <input
                      type="text"
                      value={memberForm.division || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, division: e.target.value }))}
                      placeholder="e.g. Open Division / Production"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Tier / Ranking
                    </label>
                    <input
                      type="text"
                      value={memberForm.ranking || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, ranking: e.target.value }))}
                      placeholder="e.g. Master Marksman / Pro Competitor"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Career Podiums Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={memberForm.podiums ?? 0}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, podiums: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Home Range / Club
                    </label>
                    <input
                      type="text"
                      value={memberForm.homeRange || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, homeRange: e.target.value }))}
                      placeholder="e.g. The Hideout, Bristol TN"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Rifle Blueprint Hardware Components */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    Precision Rifle Specs
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Action</label>
                      <input
                        type="text"
                        value={memberForm.action || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, action: e.target.value }))}
                        placeholder="e.g. Vudoo V-22 / RimX"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Optic</label>
                      <input
                        type="text"
                        value={memberForm.optic || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, optic: e.target.value }))}
                        placeholder="e.g. ZCO 527 5-27x56 MPCT2"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Barrel</label>
                      <input
                        type="text"
                        value={memberForm.barrel || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, barrel: e.target.value }))}
                        placeholder='e.g. 20" Bartlein Heavy Varmint'
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Trigger</label>
                      <input
                        type="text"
                        value={memberForm.trigger || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, trigger: e.target.value }))}
                        placeholder="e.g. Bix'n Andy TacSport PRO (8 oz)"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Chassis / Stock</label>
                      <input
                        type="text"
                        value={memberForm.chassis || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, chassis: e.target.value }))}
                        placeholder="e.g. MDT ACC Elite"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Ammo Lot</label>
                      <input
                        type="text"
                        value={memberForm.ammoLot || ""}
                        onChange={(e) => setMemberForm((prev) => ({ ...prev, ammoLot: e.target.value }))}
                        placeholder="e.g. Lapua Center-X Lot 39281"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Save & Actions */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isSavingMember}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingMember ? "Saving Specs..." : "Save Blueprint & Profile"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMemberModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Tab 2: Live Digital Member Pass Preview (QR & Barcode) */
              <div className="space-y-4 pt-1">
                <MemberCredentialCard
                  memberId={memberForm.member_id}
                  fullName={memberForm.full_name || "Verified Marksman"}
                  callsign={memberForm.callsign || "MARKSMAN"}
                  state={memberForm.state || "TN"}
                  experienceLevel={memberForm.experience_level || "Competitor"}
                  rifleSetup={memberForm.rifle_setup || "Custom Rimfire"}
                  accessLevel={memberForm.status === "BANNED" ? "REVOKED / BANNED" : memberForm.status === "PAUSED" ? "PAUSED" : "ACTIVE CHAT ACCESS"}
                  showDownload={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. ADMIN PASSKEY MANAGEMENT MODAL */}
      {/* ==================================================================== */}
      {isAdminPasskeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto ios-glass-card rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-tactical-glow relative space-y-5 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      ADMIN SECURITY PASSKEYS
                    </h3>
                    <p className="text-xs text-slate-300">
                      Configure master executive security passkeys for Rob Neilson and Allen Hurley.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAdminPasskeyModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passkeyNotice && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-mono border animate-fadeIn ${
                  passkeyNotice.type === "success"
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                    : "bg-red-950/60 border-red-500/50 text-red-300"
                }`}
              >
                {passkeyNotice.type === "success" ? "✓ " : "⚠️ "}
                {passkeyNotice.msg}
              </div>
            )}

            {loadingPasskeys ? (
              <div className="py-12 text-center space-y-2 font-mono text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400" />
                <p>Loading encrypted passkey registry...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminPasskeyAccounts.map((account) => {
                  const isUpdating = updatingPasskeyCallsign === account.callsign;
                  const currentInput = newPasskeyInputs[account.callsign] || "";

                  return (
                    <div
                      key={account.callsign}
                      className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {account.name}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              [{account.callsign}]
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {account.role}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Member ID: {account.memberId}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 block">
                            Active Passkey:
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                            {account.currentPasskey || "••••"}
                          </span>
                        </div>
                      </div>

                      {/* Passkey Input & Update Trigger */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <label className="text-[11px] font-mono text-slate-300 uppercase block">
                          Set New Passkey for {account.name.split(" ")[0]}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={currentInput}
                            onChange={(e) =>
                              setNewPasskeyInputs((prev) => ({
                                ...prev,
                                [account.callsign]: e.target.value,
                              }))
                            }
                            placeholder="Min 4 digits/characters..."
                            className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            disabled={isUpdating || !currentInput.trim()}
                            onClick={() => handleUpdateAdminPasskey(account.callsign)}
                            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-tactical-glow disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isUpdating ? "Saving..." : "Update Key"}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span>Last updated: {new Date(account.updatedAt).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const rand = String(Math.floor(1000 + Math.random() * 9000));
                              setNewPasskeyInputs((prev) => ({
                                ...prev,
                                [account.callsign]: rand,
                              }));
                            }}
                            className="text-amber-400 hover:underline"
                          >
                            Generate 4-Digit PIN
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAdminPasskeyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all"
              >
                Close Security Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bot Roster Card & Autonomous Fleet Controls (Off-Chat Control) */}
      <BotRosterCard
        isOpen={isBotCardOpen}
        onClose={() => setIsBotCardOpen(false)}
        messages={botActivityMessages}
        botsEnabled={botsEnabled}
        onToggleBots={handleToggleBots}
        botSpeed={botSpeed}
        onChangeSpeed={handleChangeBotSpeed}
        currentChannel="invitational"
        onAddBotMessage={(msg) => {
          logBotActivity(msg);
          setBotActivityMessages(getBotActivityLog());
        }}
        soundEnabled={false}
        badActorEnabled={badActorEnabled}
        onToggleBadActor={() => setBadActorEnabled((prev) => !prev)}
      />
    </div>
  );
}
