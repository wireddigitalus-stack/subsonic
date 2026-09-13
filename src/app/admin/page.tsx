"use client";

import React, { useState, useEffect } from "react";
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
  Tag
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
  ContactLead
} from "@/lib/types";
import { INITIAL_MATCHES, INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";
import { CommsAbuseModerator } from "@/components/admin/CommsAbuseModerator";
import { getCommsAbuseAlerts } from "@/lib/abuse-moderation";

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState(false);

  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [abuseAlerts, setAbuseAlerts] = useState<CommsAbuseAlert[]>([]);
  const [globalBannerDismissed, setGlobalBannerDismissed] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    "MEMBERS" | "REGISTRATIONS" | "LEADS" | "EVENTS" | "CLICKSTREAM" | "DWELL_TIME" | "HEATMAP" | "SESSIONS" | "AI_MODERATION"
  >("MEMBERS");
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);
  const [simulating, setSimulating] = useState(false);

  // Members, Registrations & Leads state
  const [members, setMembers] = useState<SocietyMember[]>([]);
  const [registrations, setRegistrations] = useState<MatchRegistration[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberStateFilter, setMemberStateFilter] = useState("ALL");

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

    // Also populate any flagged chat items
    const flagged = INITIAL_CHAT_MESSAGES.filter((m) => m.moderationStatus === "FLAGGED" || (m.aiModerationReport && m.aiModerationReport.toxicityScore > 30));
    setFlaggedMessages(flagged);

    // Fetch Society Members
    try {
      const res = await fetch("/api/join");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
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

  const downloadRegistrationsExport = () => {
    window.open("/api/register?export=csv", "_blank");
  };

  const downloadLeadsExport = () => {
    window.open("/api/contact?export=csv", "_blank");
  };

  useEffect(() => {
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
      setAbuseAlerts(getCommsAbuseAlerts());
    };

    window.addEventListener("subsonic-telemetry-new-event", handleNewEvent);
    window.addEventListener("subsonic-comms-abuse-alert-updated", handleAbuseUpdate);
    window.addEventListener("subsonic-comms-abuse-kicked-up", handleAbuseUpdate);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("subsonic-telemetry-new-event", handleNewEvent);
      window.removeEventListener("subsonic-comms-abuse-alert-updated", handleAbuseUpdate);
      window.removeEventListener("subsonic-comms-abuse-kicked-up", handleAbuseUpdate);
    };
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput.trim() === "subsonic2026" || passkeyInput.trim().toLowerCase() === "admin") {
      setIsAuthenticated(true);
      setPasskeyError(false);
    } else {
      setPasskeyError(true);
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
    const mockClicks = [
      { targetElement: "button_register_bristol_pro", targetText: "Register Squad ($275)", targetCategory: "Bristol Pro Portal", pageRoute: "/bristol-pro" },
      { targetElement: "tab_ballistics_solver", targetText: "Mountain DOPE Solver", targetCategory: "Ballistics", pageRoute: "/bristol-pro" },
      { targetElement: "fb_like_click_fb-post-01", targetText: "Like Post", targetCategory: "Facebook Feed", pageRoute: "/" },
      { targetElement: "chat_switch_channel_ballistics-and-gear", targetText: "#ballistics-and-gear", targetCategory: "Chat", pageRoute: "/chat" },
      { targetElement: "export_ics_bristol-pro-invitational-2026", targetText: "Add to Calendar (.ics)", targetCategory: "Event Calendar", pageRoute: "/calendar" },
    ];
    mockClicks.forEach((item, idx) => {
      setTimeout(() => {
        recordTelemetryEvent({
          eventType: "click",
          targetElement: item.targetElement,
          targetText: item.targetText,
          targetCategory: item.targetCategory,
          pageRoute: item.pageRoute,
        });
      }, idx * 100);
    });
    setTimeout(() => {
      recordTelemetryEvent({
        eventType: "dwell",
        targetElement: "page:/bristol-pro",
        targetText: "Stayed 84s on /bristol-pro",
        targetCategory: "Engagement",
        pageRoute: "/bristol-pro",
        dwellSeconds: 84,
      });
      loadData();
      setSimulating(false);
    }, 800);
  };

  const visitorJourneys = React.useMemo(() => {
    const map: Record<string, { visitorId: string; sessionId: string; device: any; events: TelemetryEvent[]; startTime: string; totalDwell: number }> = {};
    events.forEach((e) => {
      const key = e.sessionId || e.visitorId;
      if (!map[key]) {
        map[key] = {
          visitorId: e.visitorId,
          sessionId: e.sessionId,
          device: e.device,
          events: [],
          startTime: e.timestamp,
          totalDwell: 0,
        };
      }
      map[key].events.push(e);
      if (e.dwellSeconds) map[key].totalDwell += e.dwellSeconds;
    });
    return Object.values(map).slice(0, 20);
  }, [events]);

  const stats = computeTelemetryAnalytics(events);

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
                placeholder="Enter passkey..."
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
              {passkeyError && (
                <div className="text-[11px] text-red-400 font-mono mt-1">
                  Invalid security passkey. Try &quot;subsonic2026&quot; or use demo unlock.
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
              onClick={() => setIsAuthenticated(true)}
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

  const filteredMembers = members.filter((m) => {
    const matchesState = memberStateFilter === "ALL" || m.state === memberStateFilter;
    const matchesSearch =
      !memberSearch ||
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.member_id.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.rifle_setup && m.rifle_setup.toLowerCase().includes(memberSearch.toLowerCase()));
    return matchesState && matchesSearch;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 hover:text-white"
          >
            Lock
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Clicks Logged</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.totalClicks}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono mt-1">
            Across {stats.uniqueSessions} user sessions
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Page Dwell Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.avgDwellSeconds}s
          </div>
          <div className="text-[11px] text-blue-400/90 font-mono mt-1">
            Dwell duration per visitor
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Unique Marksmens</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {stats.uniqueVisitors}
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono mt-1">
            {stats.totalPageViews} Total page hits
          </div>
        </div>

        <div className="ios-glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Device Split</span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-3 text-sm font-mono font-bold text-white mt-1">
            <span className="text-purple-400">{stats.deviceBreakdown.mobilePercentage}% Mobile</span>
            <span className="text-slate-400">•</span>
            <span>{stats.deviceBreakdown.desktopPercentage}% Desktop</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {stats.deviceBreakdown.iosPercentage}% iOS Native
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-black/60 p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1">
        {[
          { id: "MEMBERS", label: "Society Members", icon: UserCheck, badge: `${members.length}` },
          { id: "REGISTRATIONS", label: "Registered Shooters", icon: Trophy, badge: `${registrations.length}` },
          { 
            id: "LEADS", 
            label: "Leads & Inquiries", 
            icon: Mail, 
            badge: leads.filter((l) => l.status === "NEW").length > 0 ? `${leads.filter((l) => l.status === "NEW").length} NEW` : undefined,
            isAlert: leads.filter((l) => l.status === "NEW").length > 0
          },
          { id: "EVENTS", label: "Match Schedule", icon: Calendar },
          { id: "CLICKSTREAM", label: "Live Telemetry", icon: MousePointerClick },
          { id: "DWELL_TIME", label: "Dwell Time & Visits", icon: Clock },
          { id: "HEATMAP", label: "Most Clicked Elements", icon: Flame },
          { id: "SESSIONS", label: "Visitor Journeys", icon: Route, badge: visitorJourneys.length },
          { 
            id: "AI_MODERATION", 
            label: "AI Comms Abuse Defense", 
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? tab.isAlert 
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold" 
                    : "bg-amber-500 text-black shadow-tactical-glow font-bold"
                  : tab.isAlert
                  ? "text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.isAlert ? "text-red-300 animate-pulse" : ""}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  tab.isAlert ? "bg-red-600 text-white animate-pulse" : "bg-white/20 text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Members</span>
                <span className="text-2xl font-black font-mono text-amber-400">{members.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">States Represented</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {Array.from(new Set(members.map((m) => m.state))).length} States
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Pro / Master Class</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {members.filter((m) => m.experience_level.toLowerCase().includes("pro") || m.experience_level.toLowerCase().includes("master")).length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Appalachian Core</span>
                <span className="text-2xl font-black font-mono text-purple-400">
                  {members.filter((m) => ["TN", "VA", "NC", "KY"].includes(m.state)).length}
                </span>
              </div>
            </div>

            {/* Search & State Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by shooter name, email, member ID, or rifle rig..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={memberStateFilter}
                  onChange={(e) => setMemberStateFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400 w-full sm:w-auto"
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

          {/* Members Table */}
          <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="p-4">Member ID</th>
                    <th className="p-4">Marksman Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">Primary Rifle Rig</th>
                    <th className="p-4">Interests</th>
                    <th className="p-4">Date Joined</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredMembers.map((m) => (
                    <tr key={m.member_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-amber-400">
                        {m.member_id}
                      </td>
                      <td className="p-4 font-sans font-bold text-white">
                        {m.full_name}
                      </td>
                      <td className="p-4 text-slate-300">
                        <a href={`mailto:${m.email}`} className="hover:text-amber-400 hover:underline">
                          {m.email}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                          {m.state}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-slate-200">
                        {m.experience_level}
                      </td>
                      <td className="p-4 font-sans text-xs text-slate-300 max-w-xs truncate">
                        {m.rifle_setup || "Custom Rimfire"}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(m.interests || []).map((int, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-sans">
                              {int}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {m.status || "ACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                        No members matching current search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

      {/* TAB 1: Live Clickstream Stream */}
      {activeAdminTab === "CLICKSTREAM" && (
        <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                Live Visitor Click Events ({events.filter((e) => e.eventType === "click").length} Clicks Captured)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Click any element on the site to see it log here in real-time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-400 font-mono border-b border-white/5">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Target Element</th>
                  <th className="p-3.5">Text / Identifier</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Page Route</th>
                  <th className="p-3.5">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {events.filter((e) => e.eventType === "click").length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No clicks recorded yet. Browse the site and click buttons/links to see telemetry stream in!
                    </td>
                  </tr>
                ) : (
                  events
                    .filter((e) => e.eventType === "click")
                    .slice(0, 50)
                    .map((evt) => (
                      <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3.5 text-amber-400 font-bold whitespace-nowrap">
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
                        <td className="p-3.5 text-blue-400 font-medium">
                          {evt.pageRoute}
                        </td>
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">
                          {evt.device.isIOS ? "🍎 iOS" : evt.device.isMobile ? "📱 Mobile" : "💻 Desktop"}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Dwell Time & Engagement */}
      {activeAdminTab === "DWELL_TIME" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Page Dwell Time Breakdown
            </h3>
            <p className="text-xs text-slate-300">
              Time spent on each specific page before navigating or exiting.
            </p>

            <div className="space-y-3 pt-2">
              {Object.entries(stats.pageViewMap).map(([route, count]) => (
                <div key={route} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">{route}</span>
                    <span className="text-slate-300">{count} Views</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, count * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Recent Dwell Records
            </h3>
            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
              {events
                .filter((e) => e.eventType === "dwell")
                .slice(0, 15)
                .map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{d.pageRoute}</div>
                      <div className="text-[10px] text-slate-400">{d.targetText}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">{d.dwellSeconds || 0}s</div>
                      <div className="text-[10px] text-slate-500">{new Date(d.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              {events.filter((e) => e.eventType === "dwell").length === 0 && (
                <div className="text-slate-500 text-center py-6">
                  Dwell times will record as visitors switch pages.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Heatmap / Most Clicked Elements */}
      {activeAdminTab === "HEATMAP" && (
        <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Top Clicked Buttons, Tabs & CTAs
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Hierarchical rank of what visitors interact with most across the Subsonic Society platform.
            </p>
          </div>

          <div className="space-y-3">
            {stats.topClickedElements.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                Click around the site to generate click rankings!
              </div>
            ) : (
              stats.topClickedElements.map((item, idx) => (
                <div
                  key={item.element}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/10 text-amber-400 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">{item.text || item.element}</div>
                      <div className="text-[10px] text-slate-400">Target: {item.element} • Category: {item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-base font-black text-amber-400">{item.count} Clicks</div>
                      <div className="text-[10px] text-slate-400">
                        {Math.round((item.count / (stats.totalClicks || 1)) * 100)}% of total
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: VISITOR JOURNEYS & SESSION REPLAY */}
      {activeAdminTab === "SESSIONS" && (
        <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-purple-400" />
              Visitor Journeys & Multi-Touch Click Paths
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Step-by-step audit of individual marksman sessions: what pages they entered, what they clicked, and where they spent their time.
            </p>
          </div>

          <div className="space-y-4">
            {visitorJourneys.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                No visitor sessions recorded yet. Click &quot;Simulate Clicks&quot; above or browse the site to view live session logs.
              </div>
            ) : (
              visitorJourneys.map((journey, idx) => (
                <div
                  key={journey.sessionId || idx}
                  className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-3 font-mono"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">Session #{idx + 1}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-mono text-[11px]">{journey.sessionId}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-purple-300">
                        {journey.device?.isIOS ? "🍎 iOS Mobile" : journey.device?.isMobile ? "📱 Mobile" : "💻 Desktop"}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      Dwell Total: <strong className="text-emerald-400">{journey.totalDwell}s</strong> • {journey.events.length} Interactions
                    </div>
                  </div>

                  {/* Step by step timeline */}
                  <div className="space-y-2 pt-1">
                    {journey.events.slice(0, 8).map((evt, eIdx) => (
                      <div key={evt.id || eIdx} className="flex items-start gap-3 text-xs">
                        <span className="text-slate-500 text-[10px] w-14 shrink-0 pt-0.5">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <div className="flex-1 text-slate-300">
                          <span className="text-white font-bold">{evt.eventType.toUpperCase()}: </span>
                          <span className="text-amber-300">{evt.targetElement}</span>
                          {evt.targetText && <span className="text-slate-400"> (&ldquo;{evt.targetText}&rdquo;)</span>}
                          <span className="text-blue-400 text-[10px] ml-2">on {evt.pageRoute}</span>
                          {evt.dwellSeconds && (
                            <span className="text-emerald-400 text-[10px] ml-2 font-bold">[{evt.dwellSeconds}s dwell]</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {journey.events.length > 8 && (
                      <div className="text-[11px] text-slate-500 pl-16">
                        + {journey.events.length - 8} more interaction steps in this session...
                      </div>
                    )}
                  </div>
                </div>
              ))
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
    </div>
  );
}
