"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EvoVisionCanvas } from "@/components/evovision/EvoVisionCanvas";
import { EvoNode, EVO_CLUSTERS, EVO_NODES } from "@/lib/evovision-data";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  Bot,
  CheckCircle2,
  Compass,
  Crosshair,
  ExternalLink,
  Flame,
  Layers,
  Lock,
  Maximize2,
  MessageSquare,
  Minimize2,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  Terminal,
  Users,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";

export default function EvosDashboardPage() {
  const [selectedNode, setSelectedNode] = useState<EvoNode | null>(null);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string | null>(null);
  const [transmissionSuccessNotice, setTransmissionSuccessNotice] = useState<string | null>(null);

  const handleSimulateTransmission = (node: EvoNode) => {
    setTransmissionSuccessNotice(`Dispatched live packet from [${node.callsign || node.label}] to Central Hub`);
    setTimeout(() => {
      setTransmissionSuccessNotice(null);
    }, 3500);
  };

  return (
    <div spellCheck={false} className="relative w-screen h-screen overflow-hidden bg-[#020409] text-white font-mono flex flex-col select-none">
      {/* ─── TOP CYBER HEADER BAR ────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-cyan-500/20 bg-black/70 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all group"
            title="Return to SubSonic Live Chat"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-bold">Back to Chat</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06B6D4]" />
            <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-pink-400 bg-clip-text text-transparent">
              EVOS 1.0 DASHBOARD
            </h1>
          </div>
          <span className="hidden xl:inline-block text-[10px] text-slate-400 border-l border-white/10 pl-3">
            DYNAMIC NEURAL TOPOLOGY • REAL DATA PROPAGATION
          </span>
        </div>

        {/* Global Cluster Filter Chips */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setActiveClusterFilter(null)}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              activeClusterFilter === null
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            ALL NODES ({EVO_NODES.length})
          </button>
          <button
            onClick={() => setActiveClusterFilter("USERS")}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              activeClusterFilter === "USERS"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.25)] font-bold"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            COMPETITORS (8)
          </button>
          <button
            onClick={() => setActiveClusterFilter("MODS")}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              activeClusterFilter === "MODS"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)] font-bold"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            MOD TEAM (6)
          </button>
          <button
            onClick={() => setActiveClusterFilter("ADMIN")}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              activeClusterFilter === "ADMIN"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.25)] font-bold"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            ADMIN (6)
          </button>
          <button
            onClick={() => setActiveClusterFilter("BOTS")}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              activeClusterFilter === "BOTS"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            AI BOTS (6)
          </button>
        </div>

        {/* Status / Quick Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Admin Hub</span>
          </Link>
          <button
            onClick={() => {
              const hub = EVO_NODES.find((n) => n.id === "hub-main");
              setSelectedNode(hub || null);
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
            title="Recenter Camera on Main Hub"
          >
            ⟲ RECENTER
          </button>
        </div>
      </header>

      {/* Toast Notice */}
      {transmissionSuccessNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] z-40 animate-fadeIn flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>{transmissionSuccessNotice}</span>
        </div>
      )}

      {/* ─── MAIN INTERACTIVE CANVAS VIEWPORT ────────────────────────── */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <EvoVisionCanvas
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
          activeFilter={activeClusterFilter}
        />

        {/* Floating Macro Legend & Status Key (Left Bottom) */}
        <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-[10px] space-y-1.5 pointer-events-none hidden sm:block shadow-2xl">
          <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>EVOS 1.0 System Registry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
            <span className="text-slate-300">Central Nexus & Telemetry Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38BDF8]" />
            <span className="text-slate-300">Competitors & Active Shooters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
            <span className="text-slate-300">Plink AI Sentinel & Moderator Rooms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_#818CF8]" />
            <span className="text-slate-300">Master Owner (RADAR) & Admin Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            <span className="text-slate-300">Autonomous Chat Bots (incl. Marcus Webb)</span>
          </div>
        </div>

        {/* Floating Quick Hint (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 pointer-events-none hidden md:block">
          Drag to pan • Scroll to zoom • Click any node to focus & inspect rich card
        </div>

        {/* ─── RICH NODE INSPECTOR CARD (Right Side) ──────────────────── */}
        {selectedNode && (
          <aside className="absolute top-4 right-4 w-84 sm:w-96 max-h-[calc(100%-2rem)] flex flex-col rounded-3xl bg-[#090D18]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)] overflow-hidden z-30 animate-fadeIn">
            {/* 1. Card Top Brand Bar */}
            <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/50 via-black to-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg border"
                  style={{
                    backgroundColor: `${selectedNode.color}25`,
                    borderColor: `${selectedNode.color}70`,
                    color: selectedNode.color,
                  }}
                >
                  {selectedNode.callsign ? selectedNode.callsign.slice(0, 3) : selectedNode.label.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-white truncate">
                      {selectedNode.label}
                    </h3>
                    {selectedNode.callsign && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-bold">
                        [{selectedNode.callsign}]
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <span>{selectedNode.memberId || selectedNode.id}</span>
                    <span>•</span>
                    <span className="text-cyan-300">{selectedNode.cluster}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shrink-0 ml-2"
                title="Close Inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
              {/* Badges: Status + Role + Latency */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">Status</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedNode.status === "ALERT"
                        ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                        : selectedNode.status === "AWAY"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : selectedNode.status === "STANDBY"
                        ? "bg-slate-500/20 text-slate-300 border-slate-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {selectedNode.status || "ACTIVE"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">Ping</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {selectedNode.latencyMs ?? 1} ms
                  </span>
                </div>
              </div>

              {/* Sublabel / Role Description */}
              {selectedNode.sublabel && (
                <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Deployment</span>
                    <span>{selectedNode.sublabel}</span>
                  </div>
                </div>
              )}

              {/* Equipment / Rifle Rig Specs */}
              {(selectedNode.rifleSetup || selectedNode.action || selectedNode.ammo) && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rifle Rig & Ballistics Setup</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {selectedNode.action && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">Action</span>
                        <span className="font-semibold text-right">{selectedNode.action}</span>
                      </div>
                    )}
                    {selectedNode.barrel && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">Barrel</span>
                        <span className="font-semibold text-right">{selectedNode.barrel}</span>
                      </div>
                    )}
                    {selectedNode.optic && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">Optic</span>
                        <span className="font-semibold text-right">{selectedNode.optic}</span>
                      </div>
                    )}
                    {selectedNode.chassis && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">Chassis</span>
                        <span className="font-semibold text-right">{selectedNode.chassis}</span>
                      </div>
                    )}
                    {selectedNode.ammo && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">Match Ammo</span>
                        <span className="font-bold text-amber-400 text-right">{selectedNode.ammo}</span>
                      </div>
                    )}
                    {!selectedNode.action && selectedNode.rifleSetup && (
                      <div className="text-slate-200 font-mono text-[10px] bg-black/40 p-2 rounded-lg border border-white/5">
                        {selectedNode.rifleSetup}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DOPE Card (If Athlete/Competitor has active DOPE) */}
              {selectedNode.dopeCard && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-bold text-[10px] uppercase flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verified DOPE Card</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-black">
                      {selectedNode.dopeCard.targetDistance}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 italic">
                    {selectedNode.dopeCard.targetDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-black/40 border border-amber-500/20">
                      <span className="text-[9px] text-slate-400 block uppercase">Elevation</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        {selectedNode.dopeCard.elevationMils}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-amber-500/20">
                      <span className="text-[9px] text-slate-400 block uppercase">Wind Hold</span>
                      <span className="text-sm font-black text-sky-300 font-mono">
                        {selectedNode.dopeCard.windHoldMils}
                      </span>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 pt-0.5">
                    <span>DA: {selectedNode.dopeCard.densityAltitude}</span>
                    {selectedNode.dopeCard.notes && (
                      <span className="block mt-1 text-slate-300">
                        Note: {selectedNode.dopeCard.notes}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Latest Live Chat Transmission */}
              {selectedNode.latestTransmission && (
                <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-sky-300 font-bold uppercase flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-sky-400" />
                      <span>Latest Comms Transmission</span>
                    </span>
                    <span className="text-slate-400">{selectedNode.latestTransmission.timestamp}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-200 leading-relaxed">
                    "{selectedNode.latestTransmission.content}"
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                      #{selectedNode.latestTransmission.channel}
                    </span>
                    {selectedNode.latestTransmission.reactionsCount !== undefined && (
                      <span>🎯 {selectedNode.latestTransmission.reactionsCount} reactions</span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Moderation & Sentinel Score */}
              {selectedNode.moderationData && (
                <div className={`p-3 rounded-2xl border space-y-2.5 ${
                  selectedNode.moderationData.standing === "FLAGGED"
                    ? "bg-red-950/30 border-red-500/40"
                    : "bg-emerald-950/20 border-emerald-500/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase flex items-center gap-1.5">
                      {selectedNode.moderationData.standing === "FLAGGED" ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Plink AI Moderation Sentinel</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                      selectedNode.moderationData.standing === "FLAGGED"
                        ? "bg-red-600 text-white"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {selectedNode.moderationData.standing}
                    </span>
                  </div>

                  {/* Toxicity Gauge Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Toxicity Metric</span>
                      <span className={`font-mono font-bold ${
                        selectedNode.moderationData.toxicityScore > 30 ? "text-red-400" : "text-emerald-400"
                      }`}>
                        {selectedNode.moderationData.toxicityScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedNode.moderationData.toxicityScore > 50
                            ? "bg-red-500 shadow-[0_0_8px_#EF4444]"
                            : selectedNode.moderationData.toxicityScore > 20
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.max(5, selectedNode.moderationData.toxicityScore)}%` }}
                      />
                    </div>
                  </div>

                  {selectedNode.moderationData.lastFlagReason && (
                    <div className="p-2 rounded-lg bg-red-900/30 border border-red-500/30 text-[10px] text-red-200">
                      Flag: {selectedNode.moderationData.lastFlagReason}
                    </div>
                  )}
                </div>
              )}

              {/* Bot Persona Engine Readout */}
              {selectedNode.botSpecs && (
                <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bot Simulation Specs</span>
                    </span>
                    {selectedNode.botSpecs.isBadActor && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] animate-pulse">
                        STRESS ACTOR
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Personality</span>
                      <span className="font-semibold text-white capitalize">
                        {selectedNode.botSpecs.personality.replace("-", " ")}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">DOPE Drop Rate</span>
                      <span className="font-semibold text-amber-300">
                        {Math.round(selectedNode.botSpecs.dopeDropRate * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[10px]">
                    <span className="text-[9px] text-slate-400 block mb-1">Favored Channels</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.botSpecs.primaryChannels.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 text-[9px]">
                          #{c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Master Telemetry Stats (For Master Owner or Core DB) */}
              {selectedNode.telemetryStats && (
                <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Recorded Site Telemetry</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                    {selectedNode.telemetryStats.totalClicks !== undefined && (
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Clicks</span>
                        <span className="text-sm font-bold text-cyan-300">
                          {selectedNode.telemetryStats.totalClicks}
                        </span>
                      </div>
                    )}
                    {selectedNode.telemetryStats.dwellSeconds !== undefined && (
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Dwell Time</span>
                        <span className="text-sm font-bold text-amber-400">
                          {Math.round(selectedNode.telemetryStats.dwellSeconds / 60)}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleSimulateTransmission(selectedNode)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transmit Synaptic Pulse</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/chat"
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <MessageSquare className="w-3 h-3 text-sky-400" />
                    <span>Live Chat</span>
                  </Link>

                  <Link
                    href="/admin"
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Admin Hub</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Card Footer */}
            <div className="shrink-0 p-3 border-t border-white/10 bg-black/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono truncate max-w-[180px]">ID: {selectedNode.id}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
