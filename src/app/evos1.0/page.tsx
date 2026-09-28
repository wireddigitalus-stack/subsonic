"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EvoVisionCanvas } from "@/components/evovision/EvoVisionCanvas";
import { EvoNode, EVO_CLUSTERS, EVO_NODES } from "@/lib/evovision-data";
import {
  Activity,
  ArrowLeft,
  Bot,
  Compass,
  Crosshair,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Users,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";

export default function EvosDashboardPage() {
  const [selectedNode, setSelectedNode] = useState<EvoNode | null>(null);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(true);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020409] text-white font-mono flex flex-col select-none">
      {/* ─── TOP CYBER HEADER BAR ────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-cyan-500/20 bg-black/60 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
            title="Return to SubSonic Live Chat"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-bold">Back to Chat</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06B6D4]" />
            <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-pink-400 bg-clip-text text-transparent">
              EVOS 1.0 DASHBOARD
            </h1>
          </div>
          <span className="hidden md:inline-block text-[10px] text-slate-400 border-l border-white/10 pl-3">
            CHAT ROOM SYSTEM • DYNAMIC ADMINISTRATION
          </span>
        </div>

        {/* Global Cluster Filter Chips */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setActiveClusterFilter(null)}
            className={`px-2 py-1 rounded-md border transition-all ${
              activeClusterFilter === null
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            ALL CLUSTERS
          </button>
          <button
            onClick={() => setActiveClusterFilter("USERS")}
            className={`px-2 py-1 rounded-md border transition-all ${
              activeClusterFilter === "USERS"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            USERS (12)
          </button>
          <button
            onClick={() => setActiveClusterFilter("MODS")}
            className={`px-2 py-1 rounded-md border transition-all ${
              activeClusterFilter === "MODS"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            MOD TEAM (4)
          </button>
          <button
            onClick={() => setActiveClusterFilter("ADMIN")}
            className={`px-2 py-1 rounded-md border transition-all ${
              activeClusterFilter === "ADMIN"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            ADMIN (5)
          </button>
          <button
            onClick={() => setActiveClusterFilter("BOTS")}
            className={`px-2 py-1 rounded-md border transition-all ${
              activeClusterFilter === "BOTS"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 hover:bg-emerald-900/60 transition-colors"
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

      {/* ─── MAIN INTERACTIVE CANVAS VIEWPORT ────────────────────────── */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <EvoVisionCanvas
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
          activeFilter={activeClusterFilter}
        />

        {/* Floating Macro Legend & Status Key (Left Bottom) */}
        <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-[10px] space-y-1.5 pointer-events-none hidden sm:block shadow-2xl">
          <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>EVOS 1.0 Status Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
            <span className="text-slate-300">User Population / Groups</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
            <span className="text-slate-300">Moderator Team / Hosts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_#818CF8]" />
            <span className="text-slate-300">Admin Security Protocols</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            <span className="text-slate-300">AI Bots Simulation Fleet</span>
          </div>
        </div>

        {/* Floating Quick Hint (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 pointer-events-none hidden md:block">
          Drag to pan • Scroll to zoom • Click any node to focus & inspect
        </div>

        {/* ─── NODE INSPECTOR DRAWER (Right Side) ────────────────────── */}
        {selectedNode && (
          <aside className="absolute top-4 right-4 w-80 sm:w-96 max-h-[calc(100%-2rem)] flex flex-col rounded-3xl bg-[#090D18]/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden z-30 animate-fadeIn">
            {/* Drawer Header */}
            <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-lg border"
                  style={{
                    backgroundColor: `${selectedNode.color}25`,
                    borderColor: `${selectedNode.color}60`,
                    color: selectedNode.color,
                  }}
                >
                  {selectedNode.label.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {selectedNode.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    Cluster: {selectedNode.cluster}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Operational Status</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedNode.status === "ALERT"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : selectedNode.status === "AWAY"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {selectedNode.status || "ACTIVE"}
                </span>
              </div>

              {/* Latency & Ping */}
              {selectedNode.latencyMs !== undefined && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Link Latency</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {selectedNode.latencyMs} ms
                  </span>
                </div>
              )}

              {/* Sublabel / Role Description */}
              {selectedNode.sublabel && (
                <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200">
                  <span className="text-slate-400 block text-[9px] uppercase">Telemetry Info</span>
                  {selectedNode.sublabel}
                </div>
              )}

              {/* Metrics Readout */}
              {selectedNode.metrics && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Live Performance Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {selectedNode.metrics.accuracy !== undefined && (
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Accuracy</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {selectedNode.metrics.accuracy}%
                        </span>
                      </div>
                    )}
                    {selectedNode.metrics.learningProgress !== undefined && (
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Learning Progress</span>
                        <span className="text-sm font-bold text-amber-400">
                          {selectedNode.metrics.learningProgress}%
                        </span>
                      </div>
                    )}
                    {selectedNode.metrics.responseTimeMs !== undefined && (
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Response Time</span>
                        <span className="text-sm font-bold text-cyan-300">
                          {selectedNode.metrics.responseTimeMs} ms
                        </span>
                      </div>
                    )}
                    {selectedNode.metrics.activityLogMs !== undefined && (
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] text-slate-400 block">Activity Log</span>
                        <span className="text-sm font-bold text-rose-400">
                          {selectedNode.metrics.activityLogMs} ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Bad Actor Action Button */}
              {selectedNode.id === "bot-marcus-badactor" && (
                <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-red-300 font-bold text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>AI Moderator Stress Actor</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Marcus Webb is configured to occasionally test Plink AI Range Marshal and the Subsonic Safety Filter.
                  </p>
                  <Link
                    href="/chat"
                    className="block text-center w-full py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  >
                    Open Live Chat to Monitor ↗
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 p-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>Node ID: {selectedNode.id}</span>
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
