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
  Sliders
} from "lucide-react";
import { 
  getLocalTelemetryEvents, 
  computeTelemetryAnalytics, 
  clearLocalTelemetry 
} from "@/lib/telemetry";
import { TelemetryEvent, MatchEvent, ChatMessage } from "@/lib/types";
import { INITIAL_MATCHES, INITIAL_CHAT_MESSAGES } from "@/lib/initial-data";

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState(false);

  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<"CLICKSTREAM" | "DWELL_TIME" | "HEATMAP" | "AI_MODERATION" | "EVENTS">("CLICKSTREAM");
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);

  // Load telemetry events from local ring buffer
  const loadData = () => {
    const evts = getLocalTelemetryEvents();
    setEvents(evts);

    // Also populate any flagged chat items
    const flagged = INITIAL_CHAT_MESSAGES.filter((m) => m.moderationStatus === "FLAGGED" || (m.aiModerationReport && m.aiModerationReport.toxicityScore > 30));
    setFlaggedMessages(flagged);
  };

  useEffect(() => {
    loadData();

    // Listen for live new telemetry events fired by TelemetryProvider
    const handleNewEvent = () => {
      loadData();
    };

    window.addEventListener("subsonic-telemetry-new-event", handleNewEvent);
    return () => window.removeEventListener("subsonic-telemetry-new-event", handleNewEvent);
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

  const handleClearTelemetry = () => {
    if (confirm("Reset local telemetry event logs?")) {
      clearLocalTelemetry();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Live Site Intelligence & Admin Hub
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Live Clickstream Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ADMIN TELEMETRY & <span className="amber-gradient-text">ENGAGEMENT</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Real-time tracking of visitor clicks, target elements, session duration, dwell times, and AI moderation defense.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs (JSON)</span>
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
          { id: "CLICKSTREAM", label: "Live Clickstream", icon: MousePointerClick },
          { id: "DWELL_TIME", label: "Dwell Time & Visits", icon: Clock },
          { id: "HEATMAP", label: "Most Clicked Elements", icon: Flame },
          { id: "AI_MODERATION", label: "AI Moderation Queue", icon: ShieldAlert, badge: flaggedMessages.length },
          { id: "EVENTS", label: "Match Director Hub", icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-tactical-glow font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

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

      {/* TAB 4: AI Moderation Command Center */}
      {activeAdminTab === "AI_MODERATION" && (
        <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                AI Content Moderation & Policy Queue
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Automated NLP reviews of competitor chat messages flagging toxicity, safety breaches, or illegal sales.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              {flaggedMessages.length} Review Items
            </span>
          </div>

          <div className="space-y-4">
            {flaggedMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No flagged messages currently in the review queue. All transmissions clear.
              </div>
            ) : (
              flaggedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-2xl bg-black/50 border border-red-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{msg.author.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {msg.author.badgeText}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono">Channel: #{msg.channelId}</span>
                    </div>
                    <span className="font-mono text-red-400 font-bold text-[11px]">
                      Toxicity: {msg.aiModerationReport?.toxicityScore || 65}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    &ldquo;{msg.content}&rdquo;
                  </p>

                  <div className="text-xs text-amber-300/90 font-mono flex items-center gap-1.5">
                    <span>AI Flag Rationale: {msg.aiModerationReport?.flagReason || "Unsportsmanlike conduct detected."}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setFlaggedMessages((prev) => prev.filter((m) => m.id !== msg.id));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Dismiss Flag</span>
                    </button>

                    <button
                      onClick={() => {
                        setFlaggedMessages((prev) => prev.filter((m) => m.id !== msg.id));
                        alert(`Message approved for broadcast.`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Transmission</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
