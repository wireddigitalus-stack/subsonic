"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Ban, 
  MicOff, 
  CheckCircle, 
  X, 
  Zap, 
  Radio, 
  Sliders, 
  Flame, 
  Eye, 
  RefreshCw, 
  Target,
  ShieldCheck,
  UserX,
  MessageSquareWarning,
  Info
} from "lucide-react";
import { CommsAbuseAlert } from "@/lib/types";
import { 
  getCommsAbuseAlerts, 
  updateCommsAbuseAlertStatus, 
  dismissCommsAbuseAlert,
  simulateAbuseAttack,
  playTacticalAbuseAlertSound,
  clearCommsAbuseAlerts
} from "@/lib/abuse-moderation";

export function CommsAbuseModerator() {
  const [alerts, setAlerts] = useState<CommsAbuseAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "ACTIVE" | "CRITICAL" | "SANCTIONED">("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeKickedUpAlert, setActiveKickedUpAlert] = useState<CommsAbuseAlert | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Policy switches
  const [policies, setPolicies] = useState({
    autoBlockSales: true,
    autoMuteThreats: true,
    autoKickRepeat: true,
    audioAlerts: true,
  });

  const loadAlerts = () => {
    const list = getCommsAbuseAlerts();
    setAlerts(list);

    // Pick top active critical alert for prominent banner
    const topActive = list.find((a) => a.status === "ACTIVE");
    if (topActive) {
      setActiveKickedUpAlert(topActive);
      setBannerDismissed(false);
    } else {
      setActiveKickedUpAlert(null);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Listen for cross-tab or chat-triggered alert updates
    const handleAlertsUpdated = () => {
      loadAlerts();
    };

    const handleKickedUp = (e: any) => {
      const newAlert: CommsAbuseAlert = e.detail;
      loadAlerts();
      setActiveKickedUpAlert(newAlert);
      setBannerDismissed(false);
      if (soundEnabled && policies.audioAlerts) {
        playTacticalAbuseAlertSound(newAlert.severity);
      }
    };

    window.addEventListener("subsonic-comms-abuse-alert-updated", handleAlertsUpdated);
    window.addEventListener("subsonic-comms-abuse-kicked-up", handleKickedUp);
    return () => {
      window.removeEventListener("subsonic-comms-abuse-alert-updated", handleAlertsUpdated);
      window.removeEventListener("subsonic-comms-abuse-kicked-up", handleKickedUp);
    };
  }, [soundEnabled, policies.audioAlerts]);

  const handleUpdateStatus = (id: string, status: CommsAbuseAlert["status"], label: string) => {
    updateCommsAbuseAlertStatus(id, status);
    loadAlerts();
    setActionNotice(label);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDismiss = (id: string) => {
    dismissCommsAbuseAlert(id);
    loadAlerts();
    setActionNotice("Alert archived from live queue.");
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSimulate = (type: "THREAT" | "WEAPON_SALE" | "PENCIL_WHIP" | "SPAM") => {
    const alert = simulateAbuseAttack(type);
    loadAlerts();
    setActiveKickedUpAlert(alert);
    setBannerDismissed(false);
    if (soundEnabled && policies.audioAlerts) {
      playTacticalAbuseAlertSound(alert.severity);
    }
  };

  // Metrics
  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const sanctionedCount = alerts.filter((a) => a.status === "MUTED" || a.status === "DISQUALIFIED").length;

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "ACTIVE") return a.status === "ACTIVE";
    if (filterSeverity === "CRITICAL") return a.severity === "CRITICAL";
    if (filterSeverity === "SANCTIONED") return a.status === "MUTED" || a.status === "DISQUALIFIED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. KICKED-UP ACTIVE ALERT BANNER (High Visibility Warning) */}
      {activeKickedUpAlert && !bannerDismissed && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/80 bg-gradient-to-r from-red-950/80 via-black/90 to-red-950/80 p-5 sm:p-6 shadow-[0_0_35px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/60 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[11px] font-black tracking-wider uppercase">
                    🚨 {activeKickedUpAlert.severity} COMMS ABUSE ALERT
                  </span>
                  <span className="text-xs font-mono text-red-300">
                    Channel: #{activeKickedUpAlert.channel}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(activeKickedUpAlert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Shooter:</span>
                  <span className="text-amber-400">{activeKickedUpAlert.shooterName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {activeKickedUpAlert.shooterCallsign}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">({activeKickedUpAlert.squad})</span>
                </div>

                <p className="text-xs sm:text-sm text-red-200 bg-black/60 px-3 py-2 rounded-xl border border-red-500/30 font-mono max-w-3xl">
                  &ldquo;{activeKickedUpAlert.messageContent}&rdquo;
                </p>

                <div className="text-[11px] text-amber-300 font-mono pt-1">
                  AI Guard: {activeKickedUpAlert.aiRationale}
                </div>
              </div>
            </div>

            {/* Quick Action Pills on Kicked Up Alert */}
            <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2 shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => handleUpdateStatus(activeKickedUpAlert.id, "WARNED", `Official Warning dispatched to ${activeKickedUpAlert.shooterName}`)}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Issue Warning</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(activeKickedUpAlert.id, "MUTED", `${activeKickedUpAlert.shooterName} has been muted for 30 minutes`)}
                className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Mute Shooter (30m)</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(activeKickedUpAlert.id, "DISQUALIFIED", `${activeKickedUpAlert.shooterName} Disqualified & Comms Revoked`)}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Disqualify / Ban</span>
              </button>

              <button
                onClick={() => setBannerDismissed(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-all"
                title="Acknowledge & Hide Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. OPERATIONAL STATUS & METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ios-glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>ACTIVE ALERTS</span>
            <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {activeCount} <span className="text-xs font-normal text-slate-400">Unresolved</span>
          </div>
          <div className="text-[10px] text-red-400 mt-1 font-mono">
            {criticalCount} Critical Threats
          </div>
        </div>

        <div className="ios-glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>ABUSE BLOCKED</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {alerts.length * 7 + 14}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Direct transmissions intercepted
          </div>
        </div>

        <div className="ios-glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>SANCTIONED SHOOTERS</span>
            <UserX className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {sanctionedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Muted or Disqualified
          </div>
        </div>

        <div className="ios-glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>COMMS HEALTH INDEX</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            98.4%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Stage Comms Integrity High
          </div>
        </div>
      </div>

      {/* 3. SIMULATION LAUNCHPAD & AUTOMATED DEFENSE POLICIES */}
      <div className="ios-glass rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Abuse Alert Simulation Engine & Defense Toggles
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate incoming hostile transmissions to test real-time alert sirens and automated suppression rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playTacticalAbuseAlertSound("MEDIUM");
              }}
              className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded-lg border text-[10px] sm:text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:bg-amber-500/30" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-300"
              }`}
              title={soundEnabled ? "Abuse Alert Siren: ON (Click to mute)" : "Abuse Alert Siren: OFF (Click to unmute)"}
              aria-label="Toggle Siren Audio"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3 text-amber-400 shrink-0" /> : <VolumeX className="w-3 h-3 text-slate-400 shrink-0" />}
              <span>{soundEnabled ? "Siren ON" : "Siren OFF"}</span>
            </button>
          </div>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => handleSimulate("THREAT")}
            className="p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-left transition-all group"
          >
            <div className="text-[11px] font-mono text-red-400 font-bold flex items-center justify-between">
              <span>SIMULATE THREAT</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Physical Threat / Harassment</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Stage 14 dispute targeting RO</div>
          </button>

          <button
            onClick={() => handleSimulate("WEAPON_SALE")}
            className="p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-left transition-all group"
          >
            <div className="text-[11px] font-mono text-amber-400 font-bold flex items-center justify-between">
              <span>SIMULATE SALE</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Illegal Weapon Mod Sale</div>
            <div className="text-[10px] text-slate-400 mt-0.5">No-paperwork / unverified trade</div>
          </button>

          <button
            onClick={() => handleSimulate("PENCIL_WHIP")}
            className="p-3 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-left transition-all group"
          >
            <div className="text-[11px] font-mono text-blue-400 font-bold flex items-center justify-between">
              <span>SIMULATE DISPUTE</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Pencil-Whip Accusation</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Public slander on match results</div>
          </button>

          <button
            onClick={() => handleSimulate("SPAM")}
            className="p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-left transition-all group"
          >
            <div className="text-[11px] font-mono text-purple-400 font-bold flex items-center justify-between">
              <span>SIMULATE SPAM</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Phishing / Telegram Bot</div>
            <div className="text-[10px] text-slate-400 mt-0.5">External crypto solicitation</div>
          </button>
        </div>

        {/* Defense Policy Rules */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Active Defense Rules:</span>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policies.autoBlockSales}
              onChange={(e) => setPolicies({ ...policies, autoBlockSales: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span className="text-slate-300">Auto-Drop Regulated Items (NFA/Ammo)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policies.autoMuteThreats}
              onChange={(e) => setPolicies({ ...policies, autoMuteThreats: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span className="text-slate-300">Auto-Mute Physical Threats &gt; 85%</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policies.autoKickRepeat}
              onChange={(e) => setPolicies({ ...policies, autoKickRepeat: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span className="text-slate-300">Disqualify Repeat Offenders</span>
          </label>
        </div>
      </div>

      {/* 4. REAL-TIME INCIDENT FEED & ACTION AUDIT */}
      <div className="ios-glass rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Live Comms Abuse Incidents ({filteredAlerts.length})
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Audited real-time transmissions flagged or terminated by the Subsonic Society AI Sentinel.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto text-xs font-mono">
            {(["ALL", "ACTIVE", "CRITICAL", "SANCTIONED"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterSeverity(filter)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSeverity === filter
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No incidents found under current filter. Click &ldquo;Simulate Threat&rdquo; to trigger live alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((incident) => {
              const isCritical = incident.severity === "CRITICAL";
              const isHigh = incident.severity === "HIGH";

              return (
                <div
                  key={incident.id}
                  className={`p-5 rounded-2xl bg-black/50 border transition-all ${
                    incident.status === "ACTIVE" 
                      ? isCritical ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-amber-500/40" 
                      : "border-white/5 opacity-85"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                        isCritical 
                          ? "bg-red-500/20 text-red-300 border border-red-500/40" 
                          : isHigh 
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      }`}>
                        {incident.severity} • {incident.category.replace("_", " ")}
                      </span>

                      <span className="text-xs font-bold text-white">{incident.shooterName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {incident.shooterCallsign}
                      </span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">#{incident.channel}</span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">{incident.squad}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        incident.status === "ACTIVE" 
                          ? "bg-red-600 text-white animate-pulse" 
                          : incident.status === "MUTED" 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : incident.status === "DISQUALIFIED"
                          ? "bg-red-950 text-red-400 border border-red-500/40"
                          : incident.status === "WARNED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        STATUS: {incident.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Offending Transmission */}
                  <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 font-mono text-xs text-slate-200">
                    <span className="text-slate-500 select-none">&gt; </span>
                    <span className="text-white font-medium">&ldquo;{incident.messageContent}&rdquo;</span>
                  </div>

                  {/* AI Risk Meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-400">TOXICITY SCORE</span>
                        <span className={`font-bold ${incident.toxicityScore > 50 ? "text-red-400" : "text-slate-300"}`}>
                          {incident.toxicityScore}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                          style={{ width: `${incident.toxicityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-400">THREAT LEVEL</span>
                        <span className={`font-bold ${incident.threatScore > 50 ? "text-red-400" : "text-slate-300"}`}>
                          {incident.threatScore}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                          style={{ width: `${incident.threatScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-400">POLICY BREACH</span>
                        <span className={`font-bold ${incident.policyScore > 80 ? "text-purple-400" : "text-slate-300"}`}>
                          {incident.policyScore}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${incident.policyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Sentinel Rationale & Automated Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1 pb-2">
                    <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px]">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{incident.aiRationale}</span>
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      Action: {incident.autoActionTaken}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5">
                    {incident.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(incident.id, "WARNED", `Official Warning sent to ${incident.shooterName}`)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Issue Warning</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(incident.id, "MUTED", `${incident.shooterName} muted for 30 minutes`)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <MicOff className="w-3 h-3" />
                          <span>Mute Comms (30m)</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(incident.id, "DISQUALIFIED", `${incident.shooterName} Disqualified from Match`)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Disqualify Shooter</span>
                        </button>
                      </>
                    )}

                    {incident.status !== "ACTIVE" && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, "ACTIVE", `Re-opened incident for ${incident.shooterName}`)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-open Incident</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(incident.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
                    >
                      <X className="w-3 h-3" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
