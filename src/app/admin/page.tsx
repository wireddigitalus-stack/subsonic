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
  Key
} from "lucide-react";
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
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";
import { AdminInviteGeneratorTab } from "@/components/admin/AdminInviteGeneratorTab";

const INITIAL_SOCIETY_MEMBERS: SocietyMember[] = [
  {
    member_id: "SS-2026-0001",
    full_name: "Rob Neilson",
    callsign: "RADAR",
    email: "rob@subsonicsociety.com",
    state: "TN",
    experience_level: "Lead Developer & Tech Advisor",
    rifle_setup: "Smart Systems Integrations",
    interests: ["Smart Systems Integrations", "Dev Operations", "AI & Telemetry", "Private Comms", "Tech Advisory"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "MASTER_OWNER",
    notes: "Master Owner, Lead Developer & Tech Advisor — Smart Systems Integrations (PIN: 2468 | Callsign: RADAR)",
  },
  {
    member_id: "SS-2026-0002",
    full_name: "Allen Hurley",
    callsign: "ALLEN",
    email: "allen@subsonicsociety.com",
    state: "TN",
    experience_level: "Owner Admin / Executive",
    rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
    interests: ["Society Leadership", "Executive Comms", "Match Operations", "The Hideout Bristol"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "OWNER_ADMIN",
    notes: "Owner Admin & Executive — Full Management Authority (PIN: 620620)",
  },
  {
    member_id: "SS-2026-1001",
    full_name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    email: "wyatt.sterling@precisionappalachia.com",
    state: "TN",
    experience_level: "Master / Pro Series",
    rifle_setup: "Vudoo V-22 / Bartlein 1:16 / MDT ACC Elite",
    interests: ["Competition", "Subsonic DNA", "Barricade Training"],
    created_at: "2026-08-01T14:22:10Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1042",
    full_name: "Kendra 'Coldbore' Cross",
    callsign: "COLDBORE",
    email: "kendra.cross@southeastrimfire.org",
    state: "VA",
    experience_level: "Master / Pro Series",
    rifle_setup: "RimX / Proof Carbon 20\" / Foundation Centurion",
    interests: ["Competition", "Subsonic DNA", "Youth Mentorship"],
    created_at: "2026-08-05T09:14:30Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1118",
    full_name: "Eli McAllister",
    callsign: "DIALED",
    email: "eli.mcallister@blueridgeprs.com",
    state: "NC",
    experience_level: "Production Champion",
    rifle_setup: "CZ 457 MTR / Area 419 Rail / Vortex Venom",
    interests: ["Competition", "Ammunition Testing"],
    created_at: "2026-08-11T18:45:00Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1205",
    full_name: "Garrett Vance",
    callsign: "VANCE-22",
    email: "garrett.vance@holstonprecision.net",
    state: "TN",
    experience_level: "Senior Master",
    rifle_setup: "Modacam Custom V-22 / Benchmark 22\" / MDT ACC",
    interests: ["Competition", "Appalachian Matches", "Gunsmithing"],
    created_at: "2026-08-18T11:30:15Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1330",
    full_name: "Sarah 'Apex' Jenkins",
    callsign: "APEX-LADY",
    email: "sarah.jenkins@precisionrimfire.io",
    state: "KY",
    experience_level: "Competitor",
    rifle_setup: "Vudoo V-22 / March FX 5-42 / KRG Whiskey-3",
    interests: ["Competition", "Long Range 400Yd", "Subsonic DNA"],
    created_at: "2026-08-25T16:02:40Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1412",
    full_name: "Mason Brooks",
    callsign: "BROOKS-TN",
    email: "mason.brooks@tennesseerimfire.com",
    state: "TN",
    experience_level: "Competitor",
    rifle_setup: "Tikka T1x / KRG Bravo / Bushnell Match Pro ED",
    interests: ["Competition", "Ballistics"],
    created_at: "2026-09-01T10:15:00Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1509",
    full_name: "Colton 'Dope' Reynolds",
    callsign: "DOPE-COLT",
    email: "c.reynolds@georgiaprecision.com",
    state: "GA",
    experience_level: "Marksman",
    rifle_setup: "Bergara B14R / Vortex Razor HD Gen III",
    interests: ["Subsonic DNA", "Ammunition Lot Testing"],
    created_at: "2026-09-05T13:40:22Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1620",
    full_name: "Trevor Vance",
    callsign: "TREV-WV",
    email: "trevor.vance@appalachianrimfire.com",
    state: "WV",
    experience_level: "Intermediate Competitor",
    rifle_setup: "CZ 457 Varmint / Arken EP5 5-25",
    interests: ["Competition", "Regional Matches"],
    created_at: "2026-09-08T08:20:10Z",
    status: "ACTIVE",
  },
];

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

  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [abuseAlerts, setAbuseAlerts] = useState<CommsAbuseAlert[]>([]);
  const [globalBannerDismissed, setGlobalBannerDismissed] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    "MEMBERS" | "INVITES" | "REGISTRATIONS" | "LEADS" | "SHOOTERS" | "DOCUMENTS" | "EVENTS" | "CLICKSTREAM" | "PAGES_AND_CLICKS" | "AI_MODERATION" | "CHAT"
  >("MEMBERS");
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);
  const [simulating, setSimulating] = useState(false);

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
    matchTitle: "The Subsonic Society Invitational 2026",
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
  const [memberRoleFilter, setMemberRoleFilter] = useState<"ALL" | "STAFF" | "COMPETITORS">("ALL");
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
  });
  const [memberModalTab, setMemberModalTab] = useState<"DETAILS" | "PASS">("DETAILS");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            const rawPro = localStorage.getItem("subsonic_pro_full_profile");
            if (rawPro) {
              const pro = JSON.parse(rawPro);
              if (pro?.name && !apiMembers.some((m) => m.callsign === pro.callsign || m.full_name === pro.name)) {
                apiMembers.unshift({
                  member_id: `SS-PRO-${pro.callsign || "VIP"}`,
                  full_name: pro.name,
                  callsign: pro.callsign,
                  email: `${pro.callsign?.toLowerCase()}@competitor.subsonicsociety.com`,
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
              if (mem?.full_name && !apiMembers.some((m) => m.callsign === mem.callsign || m.member_id === mem.member_id)) {
                apiMembers.unshift({
                  member_id: mem.member_id || `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  full_name: mem.full_name,
                  callsign: mem.callsign || "OPERATIVE",
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
          } catch (e) {
            console.warn("Local storage member merge error:", e);
          }
        }

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
            const rawPro = localStorage.getItem("subsonic_pro_full_profile");
            if (rawPro) {
              const pro = JSON.parse(rawPro);
              if (pro?.id && !list.some((s) => s.id === pro.id || s.callsign === pro.callsign)) {
                list.unshift(pro);
              }
            }
            const rawAll = localStorage.getItem("subsonic_all_shooters");
            if (rawAll) {
              const all = JSON.parse(rawAll);
              if (Array.isArray(all)) {
                for (const item of all) {
                  if (item?.id && !list.some((s) => s.id === item.id)) {
                    list.unshift(item);
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Local storage shooters merge error:", e);
          }
        }

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
        setShooterProfiles((prev) => prev.filter((s) => s.id !== id));
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
          matchTitle: "The Subsonic Society Invitational 2026",
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

  const handleOpenMemberModal = (member: SocietyMember) => {
    setSelectedMember(member);
    setMemberForm({
      member_id: member.member_id,
      full_name: member.full_name,
      callsign: member.callsign || (member.full_name ? member.full_name.split(" ")[0].toUpperCase() : "MARKSMAN"),
      email: member.email,
      state: member.state,
      experience_level: member.experience_level,
      rifle_setup: member.rifle_setup || "",
      status: member.status || "ACTIVE",
      role: member.role,
      notes: member.notes || "",
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
    setIsDeletingMember(true);
    try {
      const res = await fetch(`/api/join?member_id=${encodeURIComponent(memberId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.member_id !== memberId));
        setIsMemberModalOpen(false);
        setSelectedMember(null);
        setShowDeleteConfirm(false);
        setCardDeleteConfirmId(null);
        setMemberActionNotice(`Member ${memberId} has been permanently deleted.`);
      } else {
        const data = await res.json().catch(() => ({}));
        setMemberActionNotice(data.error || `Failed to delete member ${memberId}.`);
      }
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
    try {
      if (typeof window !== "undefined" && localStorage.getItem("subsonic_admin_authenticated") === "true") {
        setIsAuthenticated(true);
        const savedSession = localStorage.getItem("subsonic_admin_session");
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed.memberId === "SS-2026-0001" || parsed.callsign === "LTDAN" || parsed.callsign === "ROB") {
              parsed.callsign = "RADAR";
              parsed.name = "Rob Neilson";
              parsed.role = "MASTER_OWNER";
              localStorage.setItem("subsonic_admin_session", JSON.stringify(parsed));
            }
            setAdminSession(parsed);
          } catch {}
        } else {
          // Default to Master Owner Rob Neilson if previously authenticated
          setAdminSession({
            name: "Rob Neilson",
            callsign: "RADAR",
            role: "MASTER_OWNER",
            memberId: "SS-2026-0001",
          });
        }
      }
    } catch {}

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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim().toLowerCase();
    const VALID_ADMIN_KEYS = [
      "2468", 
      "620620", 
      "subsonic2026", 
      "admin",
      "allen",
      "allen 620620",
      "allen620620"
    ];
    if (VALID_ADMIN_KEYS.includes(clean)) {
      setIsAuthenticated(true);
      setPasskeyError(false);

      let session: {
        name: string;
        callsign: string;
        role: "MASTER_OWNER" | "DEV_ADMIN" | "OWNER_ADMIN" | "ADMIN";
        memberId: string;
      } = {
        name: "Rob Neilson",
        callsign: "RADAR",
        role: "MASTER_OWNER",
        memberId: "SS-2026-0001",
      };

      if (clean === "620620" || clean === "allen" || clean.includes("620620") || clean.includes("allen")) {
        session = {
          name: "Allen Hurley",
          callsign: "ALLEN",
          role: "OWNER_ADMIN",
          memberId: "SS-2026-0002",
        };
      } else if (clean === "subsonic2026" || clean === "admin") {
        session = {
          name: "System Administrator",
          callsign: "ADMIN",
          role: "ADMIN",
          memberId: "SS-ADMIN-SYS",
        };
      }

      setAdminSession(session);

      try {
        localStorage.setItem("subsonic_admin_authenticated", "true");
        localStorage.setItem("subsonic_admin_session", JSON.stringify(session));
      } catch {}
    } else {
      setPasskeyError(true);
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setAdminSession(null);
    try {
      localStorage.removeItem("subsonic_admin_authenticated");
      localStorage.removeItem("subsonic_admin_session");
    } catch {}
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
      { eventType: "page_landed" as const, targetElement: "Page: /bristol-pro", targetText: "Landed on /bristol-pro", targetCategory: "Page Landing", pageRoute: "/bristol-pro", isMember: true, memberId: "SS-2026-1044", memberCallsign: "GHOST_RIDER", memberName: "Wyatt Sterling" },
      { eventType: "click" as const, targetElement: "button_register_bristol_pro", targetText: "Register Squad ($275)", targetCategory: "Bristol Pro Portal", pageRoute: "/bristol-pro", isMember: true, memberId: "SS-2026-1044", memberCallsign: "GHOST_RIDER", memberName: "Wyatt Sterling" },
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
              Enter authorized security passkey to view clickstream telemetry, visitor dwell times, and AI moderation queues.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                Security Passkey
              </label>
              <input
                type="password"
                placeholder="Enter PIN (e.g. 620620 for Allen or 2468 for Rob)..."
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
              {passkeyError && (
                <div className="text-[11px] text-red-400 font-mono mt-1">
                  Invalid security passkey. Try PIN &quot;620620&quot; (Allen), &quot;2468&quot; (Rob), or &quot;subsonic2026&quot;.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-tactical-glow transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Dashboard</span>
            </button>

            {/* Instant Demo Access Button */}
            <button
              type="button"
              onClick={() => {
                const session = {
                  name: "Rob Neilson",
                  callsign: "RADAR",
                  role: "MASTER_OWNER" as const,
                  memberId: "SS-2026-0001",
                };
                setAdminSession(session);
                setIsAuthenticated(true);
                try {
                  localStorage.setItem("subsonic_admin_authenticated", "true");
                  localStorage.setItem("subsonic_admin_session", JSON.stringify(session));
                } catch {}
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs border border-white/10 transition-all"
            >
              Demo One-Click Access (Subsonic Admin)
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

  const filteredMembers = members.filter((m) => {
    const matchesState = memberStateFilter === "ALL" || m.state === memberStateFilter;
    const isStaff =
      ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR", "MATCH_DIRECTOR", "OFFICIAL"].includes(m.role || "") ||
      m.member_id === "SS-2026-0001" ||
      m.member_id === "SS-2026-0002";
    const matchesRole =
      memberRoleFilter === "ALL" ||
      (memberRoleFilter === "STAFF" && isStaff) ||
      (memberRoleFilter === "COMPETITORS" && !isStaff);
    const q = memberSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      (m.callsign && m.callsign.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      m.email.toLowerCase().includes(q) ||
      m.member_id.toLowerCase().includes(q) ||
      (m.rifle_setup && m.rifle_setup.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q)) ||
      ((q === "radar" || q === "ltdan" || q === "dan" || q === "rob" || q === "robert" || q.includes("smart") || q.includes("systems")) && m.member_id === "SS-2026-0001");
    return matchesState && matchesRole && matchesSearch;
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Live Site Intelligence & Admin Hub
            </span>
            {adminSession && (
              <span className={`text-[11px] px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 border shadow-sm ${
                adminSession.role === "MASTER_OWNER"
                  ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  : adminSession.role === "OWNER_ADMIN"
                  ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "bg-white/10 text-slate-300 border-white/20"
              }`}>
                <span>{adminSession.role === "MASTER_OWNER" ? "👑 MASTER OWNER:" : adminSession.role === "OWNER_ADMIN" ? "🎖️ OWNER ADMIN:" : "🛡️ ADMIN:"}</span>
                <span className="text-white font-extrabold">{adminSession.name} [{adminSession.callsign}]</span>
                <span className="text-[9px] opacity-75 font-normal">({adminSession.memberId})</span>
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Durable Storage: data/telemetry-events.jsonl ({events.length} Recorded)</span>
            </span>
            {isSupabaseConfigured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono flex items-center gap-1">
                <Database className="w-3 h-3 text-blue-400" />
                <span>Supabase Cloud Sync Active</span>
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

        {/* Global Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateTraffic}
            data-telemetry="admin_simulate_traffic"
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Simulate visitor clicks and dwell times"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? "animate-spin text-amber-400" : ""}`} />
            <span>{simulating ? "Generating Events..." : "Simulate Clicks"}</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/evos1.0"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            title="Launch EVOS 1.0 Dynamic Neural Network Topology"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>EVOS 1.0</span>
          </Link>

          <button
            onClick={() => downloadTelemetryExport("csv")}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Download CSV for Excel / Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
            title="Download full JSON event dump"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClearTelemetry}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
            title="Clear Local Event Buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleLock}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 hover:text-white"
          >
            Lock
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
          {/* Sector 1: OPERATIVES & SQUAD */}
          <div className={`p-2.5 rounded-2xl border transition-all ${
            ["MEMBERS", "INVITES", "SHOOTERS", "REGISTRATIONS"].includes(activeAdminTab)
              ? "bg-amber-500/[0.04] border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.06)]"
              : "bg-white/[0.02] border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>OPERATIVES &amp; SQUAD</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">4 MODULES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "MEMBERS", label: "Society Members", icon: UserCheck, badge: `${members.length}` },
                { id: "INVITES", label: "Invite Keys & VIP", icon: Key, badge: "INVITE ONLY", highlight: true },
                { id: "SHOOTERS", label: "Shooter Profiles", icon: Users, badge: `${shooterProfiles.length}` },
                { id: "REGISTRATIONS", label: "Registrations", icon: Trophy, badge: `${registrations.length}` },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-all text-left ${
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
              { id: "MEMBERS", label: "Members", icon: UserCheck, badge: `${members.length}` },
              { id: "INVITES", label: "Invites & VIP", icon: Key, badge: "INVITE ONLY" },
              { id: "REGISTRATIONS", label: "Shooters", icon: Trophy, badge: `${registrations.length}` },
              { 
                id: "LEADS", 
                label: "Leads", 
                icon: Mail, 
                badge: leads.filter((l) => l.status === "NEW").length > 0 ? `${leads.filter((l) => l.status === "NEW").length} NEW` : undefined,
                isAlert: leads.filter((l) => l.status === "NEW").length > 0
              },
              { id: "SHOOTERS", label: "Profiles", icon: Users, badge: `${shooterProfiles.length}` },
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

      {/* TAB: ALL SOCIETY MEMBERS DIRECTORY */}
      {activeAdminTab === "MEMBERS" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white">
                    Subsonic Society Members ({filteredMembers.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Verified digital pass holders, competitors, and ballistics testing community members.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadMembersExport}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Members CSV</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div 
                onClick={() => setMemberRoleFilter("ALL")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  memberRoleFilter === "ALL" 
                    ? "bg-amber-500/20 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]" 
                    : "bg-black/40 border-white/5 hover:border-white/20"
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Members</span>
                <span className="text-2xl font-black font-mono text-amber-400">{members.length}</span>
              </div>

              <div 
                onClick={() => setMemberRoleFilter("STAFF")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  memberRoleFilter === "STAFF" 
                    ? "bg-emerald-500/25 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "bg-black/40 border-white/5 hover:border-emerald-500/40"
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 block uppercase flex items-center justify-between">
                  <span>👑 Admins &amp; Staff</span>
                  <span className="text-[9px] text-emerald-400 font-bold">CLICK</span>
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">{staffMembers.length}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">States Represented</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {Array.from(new Set(members.map((m) => m.state))).length} States
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Pro / Master Class</span>
                <span className="text-2xl font-black font-mono text-purple-400">
                  {members.filter((m) => m.experience_level.toLowerCase().includes("pro") || m.experience_level.toLowerCase().includes("master")).length}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Appalachian Core</span>
                <span className="text-2xl font-black font-mono text-yellow-400">
                  {members.filter((m) => ["TN", "VA", "NC", "KY"].includes(m.state)).length}
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold mr-1">Roster Filter:</span>
                {[
                  { id: "ALL" as const, label: "All Members", count: members.length },
                  { id: "STAFF" as const, label: "👑 Admins & Staff", count: staffMembers.length },
                  { id: "COMPETITORS" as const, label: "🎯 Competitors Only", count: members.length - staffMembers.length },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMemberRoleFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      memberRoleFilter === f.id
                        ? "bg-amber-500 text-black shadow-tactical-glow"
                        : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${memberRoleFilter === f.id ? "bg-black/20 text-black font-black" : "bg-white/10 text-slate-300"}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search & State Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by shooter name, email, member ID, role, or rifle rig..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={memberStateFilter}
                    onChange={(e) => setMemberStateFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-amber-400 w-full sm:w-auto"
                  >
                    <option value="ALL">All States</option>
                    {Array.from(new Set(members.map((m) => m.state)))
                      .sort()
                      .map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED ADMIN & MODERATOR CLEARANCE HUB */}
          <div className="ios-glass rounded-3xl p-6 sm:p-7 border border-amber-500/30 bg-gradient-to-br from-black/85 via-[#0e131d]/90 to-amber-950/20 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <span>STAFF SECURITY CLEARANCE &amp; MODERATION COMMAND</span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        {staffMembers.length} Appointed
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Appoint trusted marksmen to Admin or Moderator clearance. Admins manage society data &amp; telemetry; Moderators enforce comms rules and neutralize toxicity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Sync Active</span>
                </span>
              </div>
            </div>

            {/* Quick Appoint Tool */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Appoint Member to Admin or Moderator</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 min-w-[240px]">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Select Marksman From Roster
                  </label>
                  <select
                    value={appointMemberId}
                    onChange={(e) => setAppointMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose Member to Appoint / Adjust Role --</option>
                    {members.map((m) => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.full_name} [{m.callsign || "SS"}] ({m.member_id}) - Role: {m.role || "MEMBER"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:w-64">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Select Clearance Role
                  </label>
                  <select
                    value={appointRole || "MODERATOR"}
                    onChange={(e) => setAppointRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option value="ADMIN">🛡️ System Administrator (Full Admin)</option>
                    <option value="MODERATOR">⚖️ Comms Moderator (Chat Defense)</option>
                    <option value="MATCH_DIRECTOR">🎯 Match Director (Match Ops)</option>
                    <option value="OFFICIAL">📋 Range Official (Safety Marshal)</option>
                    <option value="PRO_COMPETITOR">🏅 Pro Competitor (Open Pro)</option>
                    <option value="MEMBER">🎯 Standard Member (Revoke Clearance)</option>
                  </select>
                </div>

                <div className="sm:self-end">
                  <button
                    type="button"
                    disabled={!appointMemberId || isAppointing}
                    onClick={() => {
                      if (appointMemberId) {
                        handleAssignMemberRole(appointMemberId, appointRole);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-tactical-glow disabled:opacity-40 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAppointing ? "Assigning..." : "Grant Clearance"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Appointed Staff Roster */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Leadership, Admins &amp; Mods ({staffMembers.length})</span>
                <span className="text-amber-400/80 text-[10px]">Click any card to modify full credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffMembers.map((sm) => {
                  const isMasterOwner = sm.role === "MASTER_OWNER" || sm.member_id === "SS-2026-0001";
                  const isOwnerAdmin = sm.role === "OWNER_ADMIN" || sm.member_id === "SS-2026-0002";
                  const isAdmin = sm.role === "ADMIN";
                  const isMod = sm.role === "MODERATOR";
                  const isDirector = sm.role === "MATCH_DIRECTOR";

                  return (
                    <div
                      key={sm.member_id}
                      onClick={() => handleOpenMemberModal(sm)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                        isMasterOwner
                          ? "bg-amber-950/25 border-amber-400/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : isOwnerAdmin
                          ? "bg-emerald-950/25 border-emerald-400/60 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : isAdmin
                          ? "bg-cyan-950/25 border-cyan-400/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : isMod
                          ? "bg-purple-950/25 border-purple-400/60 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 truncate">
                            {sm.full_name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">
                            [{sm.callsign || "SS"}]
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {sm.member_id} · {sm.state}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border inline-block ${
                          isMasterOwner
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : isOwnerAdmin
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : isAdmin
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                            : isMod
                            ? "bg-purple-500/20 text-purple-300 border-purple-400/50"
                            : isDirector
                            ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                            : "bg-white/10 text-slate-300 border-white/20"
                        }`}>
                          {isMasterOwner
                            ? "👑 MASTER OWNER"
                            : isOwnerAdmin
                            ? "🎖️ OWNER ADMIN"
                            : isAdmin
                            ? "🛡️ ADMIN"
                            : isMod
                            ? "⚖️ MODERATOR"
                            : isDirector
                            ? "🎯 DIRECTOR"
                            : (sm.role || "OFFICIAL")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Members Zero-Side-Scroll Responsive Directory */}
          <div className="space-y-3 w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 text-xs font-mono text-slate-400">
              <span>Showing {filteredMembers.length} Verified Members</span>
              <span className="text-[11px] text-amber-400 font-bold">
                💡 Click any member card to Edit, Pause, Ban, Delete, or View Pass
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full max-w-full">
              {filteredMembers.map((m) => {
                const isBanned = m.status === "BANNED";
                const isPaused = m.status === "PAUSED";
                const isRoot = m.member_id === "SS-2026-0001" || m.member_id === "SS-2026-0002";
                const displayCallsign = m.callsign || (m.full_name ? m.full_name.split(" ")[0].toUpperCase() : "MARKSMAN");

                return (
                  <div
                    key={m.member_id}
                    className={`ios-glass-card rounded-2xl p-4 sm:p-5 border transition-all shadow-lg relative overflow-hidden flex flex-col justify-between gap-3 w-full max-w-full ${
                      isBanned
                        ? "border-red-500/50 bg-red-950/20"
                        : isPaused
                        ? "border-amber-500/50 bg-amber-950/20"
                        : m.role === "MASTER_OWNER"
                        ? "border-amber-400/60 bg-gradient-to-b from-amber-950/25 to-black/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        : m.role === "OWNER_ADMIN"
                        ? "border-emerald-400/60 bg-gradient-to-b from-emerald-950/25 to-black/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : m.role === "ADMIN"
                        ? "border-cyan-400/60 bg-gradient-to-b from-cyan-950/25 to-black/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        : m.role === "MODERATOR"
                        ? "border-purple-400/60 bg-gradient-to-b from-purple-950/25 to-black/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : m.role === "MATCH_DIRECTOR"
                        ? "border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-black/50"
                        : "border-white/10 hover:border-amber-400/60 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Top Row: Callsign Badge, Serialized ID, and Status */}
                    <div 
                      onClick={() => handleOpenMemberModal(m)}
                      className="cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors break-words">
                              {m.full_name}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              [{displayCallsign}]
                            </span>
                            {m.role === "MASTER_OWNER" && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0">
                                👑 MASTER OWNER
                              </span>
                            )}
                            {m.role === "OWNER_ADMIN" && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-gradient-to-r from-emerald-400 to-teal-500 text-black border border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0">
                                🎖️ OWNER ADMIN
                              </span>
                            )}
                            {m.role === "ADMIN" && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0">
                                🛡️ ADMIN
                              </span>
                            )}
                            {m.role === "MODERATOR" && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.4)] shrink-0">
                                ⚖️ MODERATOR
                              </span>
                            )}
                            {m.role === "MATCH_DIRECTOR" && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/50 shrink-0">
                                🎯 DIRECTOR
                              </span>
                            )}
                            {m.role === "OFFICIAL" && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-500/50 shrink-0">
                                📋 OFFICIAL
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono font-bold text-amber-400">
                            {m.member_id}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                            isBanned
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : isPaused
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {m.status || "ACTIVE"}
                        </span>
                      </div>

                      {/* Info Chips */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
                          {m.state}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-sans truncate max-w-[200px]">
                          {m.experience_level}
                        </span>
                      </div>

                      {/* Email & Rig Details (Guaranteed no overflow) */}
                      <div className="space-y-1 text-xs text-slate-300 pt-1">
                        <div className="text-[11px] text-slate-300 break-all">
                          <span className="text-slate-500 font-mono mr-1">EMAIL:</span>
                          <span className="text-slate-300">{m.email}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 break-words">
                          <span className="text-slate-500 font-mono mr-1">RIG:</span>
                          <span className="text-slate-200">{m.rifle_setup || "Custom Precision Rimfire"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer with Quick Controls */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Quick Pause / Activate */}
                        {isPaused ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusChange(m.member_id, "ACTIVE");
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="Unpause & Restore Member Access"
                          >
                            <Play className="w-3 h-3" />
                            <span>Unpause</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusChange(m.member_id, "PAUSED");
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="Temporarily Pause Member Access"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                        )}

                        {/* Quick Ban / Unban */}
                        {isBanned ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusChange(m.member_id, "ACTIVE");
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="Revoke Ban & Restore Access"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Unban</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusChange(m.member_id, "BANNED");
                            }}
                            className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="Ban Member & Revoke Comms"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Ban</span>
                          </button>
                        )}

                        {/* View Pass in Modal */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMemberModal(m);
                            setMemberModalTab("PASS");
                          }}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono flex items-center gap-1 transition-all"
                          title="View Digital Pass & QR Code"
                        >
                          <QrCode className="w-3 h-3 text-amber-400" />
                          <span>Pass</span>
                        </button>

                        {/* Quick Clearance / Role Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMemberModal(m);
                          }}
                          className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                          title="Assign Admin, Mod, or Staff Clearance"
                        >
                          <Shield className="w-3 h-3 text-blue-400" />
                          <span>Clearance</span>
                        </button>

                        {/* 2-Step Card Delete Button or Root Protection */}
                        {isRoot ? (
                          <span
                            className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center gap-1 select-none"
                            title="Root Executive Account (Protected from deletion)"
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>Protected</span>
                          </span>
                        ) : cardDeleteConfirmId === m.member_id ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 p-1 rounded-lg bg-red-950/90 border border-red-500/60 shadow-lg animate-fadeIn"
                          >
                            <div className="flex items-center gap-1 px-1 text-[10px] font-mono text-red-300 font-bold whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                              <span>Are you sure?</span>
                            </div>
                            <button
                              type="button"
                              disabled={isDeletingMember}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMember(m.member_id);
                              }}
                              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(239,68,68,0.5)] disabled:opacity-50 whitespace-nowrap"
                            >
                              {isDeletingMember ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardDeleteConfirmId(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-[10px] transition-all whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardDeleteConfirmId(m.member_id);
                            }}
                            className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="Permanently Delete Member Account"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>

                      {/* Primary Manage Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenMemberModal(m)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1 transition-all ml-auto"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Manage Profile</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="col-span-full ios-glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">No members found</p>
                  <p className="text-xs text-slate-500">No member matches the current search or state filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: REGISTERED MATCH SHOOTERS */}
      {activeAdminTab === "REGISTRATIONS" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white">
                    Registered Match Competitors ({filteredRegistrations.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Confirmed match competitors, squad assignments, rifle divisions, and registration revenues.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadRegistrationsExport}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Match Roster CSV</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Competitors</span>
                <span className="text-2xl font-black font-mono text-amber-400">{registrations.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Open Division Pro</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {registrations.filter((r) => r.rifle_division === "OPEN").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Production & Senior</span>
                <span className="text-2xl font-black font-mono text-purple-400">
                  {registrations.filter((r) => ["PRODUCTION", "SENIOR"].includes(r.rifle_division)).length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Entry Fees Collected</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${registrations.reduce((acc, r) => acc + (r.total_price || 275), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search competitor, callsign, ticket, rifle..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <select
                  value={regMatchFilter}
                  onChange={(e) => setRegMatchFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Matches</option>
                  <option value="subsonic-invitational-2026">The Subsonic Society Invitational ($7,500 Purse)</option>
                  <option value="300x-long-gong-challenge">300X Long Gong Challenge</option>
                  <option value="200x-mountain-match">200X Mountain Match</option>
                </select>
              </div>

              <div>
                <select
                  value={regDivisionFilter}
                  onChange={(e) => setRegDivisionFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Divisions</option>
                  <option value="OPEN">Open Division Pro</option>
                  <option value="PRODUCTION">Production Division</option>
                  <option value="SENIOR">Senior Division (55+)</option>
                  <option value="LADIES">Ladies Rimfire Pro</option>
                  <option value="YOUTH">Junior / Youth</option>
                </select>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="p-4">Pass Ticket #</th>
                    <th className="p-4">Competitor</th>
                    <th className="p-4">Match</th>
                    <th className="p-4">Division</th>
                    <th className="p-4">Squad & Flight</th>
                    <th className="p-4">Rifle & Optic Setup</th>
                    <th className="p-4">Ammunition</th>
                    <th className="p-4">Fee Paid</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredRegistrations.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-amber-400">
                        {r.ticket_number}
                      </td>
                      <td className="p-4 font-sans">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{r.competitor_name}</span>
                          {r.competitor_callsign && (
                            <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                              [{r.competitor_callsign}]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {r.competitor_email} {r.competitor_phone ? `• ${r.competitor_phone}` : ""}
                        </div>
                      </td>
                      <td className="p-4 font-sans text-xs text-slate-200 max-w-xs truncate">
                        {r.match_title}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.rifle_division === "OPEN"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : r.rifle_division === "PRODUCTION"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : r.rifle_division === "SENIOR"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {r.rifle_division}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-slate-300">
                        <div className="font-bold text-xs text-white">{r.squad_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.squad_flight}</div>
                      </td>
                      <td className="p-4 font-sans text-xs text-slate-300 max-w-xs">
                        <div className="font-semibold text-slate-200">{r.rifle_model}</div>
                        <div className="text-[10px] text-slate-400">{r.optic}</div>
                      </td>
                      <td className="p-4 text-[11px] text-slate-300">
                        {r.ammo_lot}
                      </td>
                      <td className="p-4 font-bold text-white">
                        ${r.total_price}
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {r.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                        No competitor registrations matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONTACT LEADS & INQUIRIES */}
      {activeAdminTab === "LEADS" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white">
                    Contact Leads & Inquiries ({filteredLeads.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Transmissions from potential sponsors, match hosts, range inquiries, and media.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadLeadsExport}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Leads CSV</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Inquiries</span>
                <span className="text-2xl font-black font-mono text-amber-400">{leads.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">New / Unanswered</span>
                <span className="text-2xl font-black font-mono text-red-400">
                  {leads.filter((l) => l.status === "NEW").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Sponsorship Leads</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {leads.filter((l) => l.category === "SPONSORSHIP").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Match Host Proposals</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {leads.filter((l) => l.category === "MATCH_HOST").length}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, company, email, or message..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <select
                  value={leadCategoryFilter}
                  onChange={(e) => setLeadCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SPONSORSHIP">Sponsorship & Prize Table</option>
                  <option value="MATCH_HOST">Match Host Proposals</option>
                  <option value="SUBSONIC_DNA">Subsonic DNA Testing</option>
                  <option value="GENERAL">General & Membership</option>
                  <option value="MEDIA">Media & Press</option>
                </select>
              </div>

              <div>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW (Unread)</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="CONTACTED">CONTACTED / REPLIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Cards Grid */}
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`ios-glass rounded-3xl p-6 border transition-all space-y-4 ${
                  lead.status === "NEW"
                    ? "border-amber-500/50 shadow-tactical-glow bg-gradient-to-r from-amber-500/10 via-black/40 to-black/60"
                    : "border-white/10 hover:border-white/20 bg-black/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-base text-white">{lead.name}</span>
                    {lead.company && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {lead.company}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      lead.category === "SPONSORSHIP"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : lead.category === "MATCH_HOST"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : lead.category === "SUBSONIC_DNA"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    }`}>
                      {lead.category.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(lead.created_at).toLocaleString()}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border focus:outline-none ${
                        lead.status === "NEW"
                          ? "bg-amber-500 text-black border-amber-400"
                          : lead.status === "CONTACTED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : lead.status === "IN_REVIEW"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                          : "bg-black/60 text-slate-400 border-white/10"
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                {/* Subject & Message Content */}
                <div className="space-y-2">
                  {lead.subject && (
                    <h4 className="text-sm font-bold text-slate-100">
                      {lead.subject}
                    </h4>
                  )}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                    {lead.message}
                  </div>
                </div>

                {/* Contact Coordinates & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1.5 text-white hover:text-amber-400 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lead.email}</span>
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 text-white hover:text-amber-400 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lead.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject || "Subsonic Society Inquiry")}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>

                    {lead.status !== "CONTACTED" && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, "CONTACTED")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Contacted</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="ios-glass rounded-3xl p-12 text-center text-slate-400 border border-white/10 font-sans">
                No inquiries or leads matching selected filters.
              </div>
            )}
          </div>
        </div>
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
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-xl font-black text-white">Chat Moderation Center</h3>
                <p className="text-xs text-slate-400">Review and moderate messages across all channels. Direct action on any transmission.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-amber-400">{members.length}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Active Chatters</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-emerald-400">7</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Active Channels</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-red-400">{flaggedMessages.length}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Flagged Messages</div>
              </div>
            </div>
          </div>

          <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Recent Transmissions — All Channels</span>
              <span className="text-[10px] font-mono text-slate-400">Last 50 messages</span>
            </div>

            {flaggedMessages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-60" />
                <p className="text-sm text-slate-400 font-mono">All channels clear — no flagged messages.</p>
                <p className="text-xs text-slate-500">Messages that require action will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {flaggedMessages.slice(0, 50).map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-amber-400">[{msg.author.callsign}]</span>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#{msg.channelId}</span>
                          {msg.moderationStatus === "FLAGGED" && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">FLAGGED</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 break-words">{msg.content}</p>
                        {msg.aiModerationReport?.flagReason && (
                          <p className="text-[10px] text-red-300 font-mono">⚠ {msg.aiModerationReport.flagReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setFlaggedMessages((prev) => prev.filter((m) => m.id !== msg.id))}
                          className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Warn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(msg.author.id, "BANNED")}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-950/80 text-red-200 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
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

      {/* TAB: SHOOTER PROFILES (AUTO-INTAKE & ROSTER) */}
      {activeAdminTab === "SHOOTERS" && (
        <div className="space-y-6">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-black text-white">
                    Automated Competitor Profiles &amp; Rig Dossiers ({shooterProfiles.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Profiles generated automatically from competitor intake questionnaires. Real rig specs, accolades, and sponsors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/shooters/intake"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Intake Form</span>
                </Link>

                <Link
                  href="/shooters"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>View Public Roster</span>
                </Link>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={shooterSearch}
                onChange={(e) => setShooterSearch(e.target.value)}
                placeholder="Search by marksman name, callsign, division, sponsor, or rifle action..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Shooters List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shooterProfiles
              .filter((s) => {
                const q = shooterSearch.toLowerCase().trim();
                return (
                  !q ||
                  s.name.toLowerCase().includes(q) ||
                  s.callsign.toLowerCase().includes(q) ||
                  s.division.toLowerCase().includes(q) ||
                  (s.sponsors && s.sponsors.some((sp) => sp.toLowerCase().includes(q))) ||
                  (s.rifleSetup?.action && s.rifleSetup.action.toLowerCase().includes(q))
                );
              })
              .map((shooter) => (
                <div
                  key={shooter.id}
                  className="ios-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/60 bg-black relative shrink-0">
                          {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") ? (
                            <img src={shooter.image} alt={shooter.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                              {shooter.callsign?.slice(0, 2) || "SS"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                              {shooter.callsign}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                              {shooter.division}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white">{shooter.name}</h4>
                          <p className="text-[11px] text-emerald-400">{shooter.ranking}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">PODIUMS</span>
                        <span className="text-base font-mono font-black text-amber-400">{shooter.podiums}</span>
                      </div>
                    </div>

                    {/* Accolades */}
                    {shooter.accolades && shooter.accolades.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {shooter.accolades.map((acc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Trophy className="w-2.5 h-2.5 text-amber-400" />
                            <span>{acc}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sponsors */}
                    {shooter.sponsors && shooter.sponsors.length > 0 && (
                      <div className="text-[10px] font-mono text-slate-400">
                        <span className="text-slate-500">Sponsors: </span>
                        {shooter.sponsors.join(" • ")}
                      </div>
                    )}

                    {/* Rifle Specs summary */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">ACTION:</span>
                        <span className="text-slate-200 truncate block">{shooter.rifleSetup?.action || "Custom"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">OPTIC:</span>
                        <span className="text-slate-200 truncate block">{shooter.rifleSetup?.optic || "Competition Glass"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">BARREL:</span>
                        <span className="text-slate-200 truncate block">{shooter.rifleSetup?.barrel || "Match"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">AMMO LOT:</span>
                        <span className="text-amber-400 truncate block">{shooter.rifleSetup?.ammoLot || "Standard"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                    <Link
                      href={`/shooters?id=${shooter.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Live Card</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteShooter(shooter.id, shooter.name)}
                      className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Delete Shooter Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                  Manage Course of Fire (COF) packets, match bylaws, cold range liability waivers, and elevation dossiers.
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
                  href="/documents"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>Open Public Hub</span>
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
                  placeholder="e.g. The Subsonic Society Invitational 2026"
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

              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Edit Details vs Digital Pass Preview */}
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
                <span>Edit Profile &amp; Access Controls</span>
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
                <span>Live Digital Pass (QR / Barcode)</span>
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
                      { role: "MASTER_OWNER" as const, label: "👑 Master Owner", desc: "Root / Dev Admin", color: "from-amber-400 to-yellow-500", text: "text-black" },
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

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      Tactical Callsign / Handle *
                    </label>
                    <input
                      type="text"
                      required
                      value={memberForm.callsign || ""}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, callsign: e.target.value.toUpperCase() }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono font-bold text-base sm:text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
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
    </div>
  );
}
