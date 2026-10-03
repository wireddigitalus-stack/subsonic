"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { EvoVisionCanvas } from "@/components/evovision/EvoVisionCanvas";
import { EvoNode, EVO_CLUSTERS, EVO_NODES, EVO_LINKS } from "@/lib/evovision-data";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Crosshair,
  ExternalLink,
  Flame,
  History,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Network,
  Radio,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Users,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { NexusVoiceIntercom, NexusVoiceState } from "@/components/evovision/NexusVoiceIntercom";

export default function EvosDashboardPage() {
  const [selectedNode, setSelectedNode] = useState<EvoNode | null>(null);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string | null>(null);
  const [transmissionSuccessNotice, setTransmissionSuccessNotice] = useState<string | null>(null);
  const [spacemanActive, setSpacemanActive] = useState<boolean>(true);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [recenterSignal, setRecenterSignal] = useState<number>(0);
  const [expandAllSignal, setExpandAllSignal] = useState<number>(0);
  const [contractAllSignal, setContractAllSignal] = useState<number>(0);
  const [nexusVoiceState, setNexusVoiceState] = useState<NexusVoiceState>("idle");
  const [externalVoiceTrigger, setExternalVoiceTrigger] = useState<number>(0);
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(false);
  const [constellationsEnabled, setConstellationsEnabled] = useState<boolean>(false);
  const [starsEnabled, setStarsEnabled] = useState<boolean>(false);
  const [expandStats, setExpandStats] = useState({
    expandedCount: 1,
    totalCount: EVO_NODES.length,
    isAllExpanded: false,
    isAllContracted: true,
  });

  // Directly linked synaptic peers for the active node
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const links = EVO_LINKS.filter(
      (l) => l.sourceId === selectedNode.id || l.targetId === selectedNode.id
    );
    return links
      .map((l) => {
        const peerId = l.sourceId === selectedNode.id ? l.targetId : l.sourceId;
        const peerNode = EVO_NODES.find((n) => n.id === peerId);
        return {
          link: l,
          peer: peerNode,
        };
      })
      .filter((item): item is { link: typeof item.link; peer: NonNullable<typeof item.peer> } =>
        Boolean(item.peer)
      );
  }, [selectedNode]);

  const handleSimulateTransmission = (node: EvoNode) => {
    setTransmissionSuccessNotice(`Comms ping dispatched to [${node.callsign || node.label}] • Signal Acknowledged (${node.latencyMs || 1}ms)`);
    setTimeout(() => {
      setTransmissionSuccessNotice(null);
    }, 3500);
  };

  return (
    <div spellCheck={false} className="relative w-screen h-screen overflow-hidden bg-[#020409] text-white font-mono flex flex-col select-none">
      {/* ─── TOP CYBER HEADER BAR ────────────────────────────────────── */}
      {/* ─── TOP CYBER HEADER BAR ────────────────────────────────────── */}
      <header className="shrink-0 pt-[env(safe-area-inset-top,0px)] border-b border-cyan-500/20 bg-black/80 backdrop-blur-md px-3 sm:px-6 z-20">
        {/* DESKTOP HEADER (lg and up) */}
        <div className="hidden lg:flex items-center justify-between min-h-14 py-1">
          <div className="flex items-center gap-3">
            {/* Breadcrumb Navigation: Home & Chat */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all group active:scale-95"
                title="Return to Main Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-bold">HOME</span>
              </Link>

              <span className="text-white/20 text-xs">/</span>

              <Link
                href="/chat"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition-all active:scale-95"
                title="Open Squad Comms"
              >
                <span className="text-amber-400 text-[10px]">💬</span>
                <span className="font-bold">COMMS</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06B6D4]" />
              <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-pink-400 bg-clip-text text-transparent">
                EVOS 1.0 DASHBOARD
              </h1>
            </div>
            <span className="hidden xl:inline-block text-[10px] text-slate-400 border-l border-white/10 pl-3">
              DYNAMIC NEURAL TOPOLOGY • REAL DATA PROPAGATION
            </span>
          </div>

          {/* Desktop Global Cluster Filter Chips */}
          <div className="flex items-center gap-1.5 text-[10px]">
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

          {/* Desktop Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5 shadow-inner">
              <button
                onClick={() => setExpandAllSignal((prev) => prev + 1)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  expandStats.isAllExpanded
                    ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Expand all clusters and satellites"
              >
                <span className="text-amber-400 font-extrabold text-xs">⊕</span>
                <span>EXPAND ALL</span>
              </button>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setContractAllSignal((prev) => prev + 1);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  expandStats.isAllContracted
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Contract all nodes back to NEXUS hub"
              >
                <span className="text-cyan-400 font-extrabold text-xs">⊖</span>
                <span>CONTRACT ALL</span>
              </button>
            </div>

            {/* 2D / 3D Switch */}
            <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5 shadow-inner">
              <button
                onClick={() => setIs3DMode(false)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  !is3DMode
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2D FLAT
              </button>
              <button
                onClick={() => setIs3DMode(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  is3DMode
                    ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🪐</span>
                <span>3D ORBIT</span>
              </button>
            </div>

            {is3DMode && (
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                  autoRotate
                    ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <span>{autoRotate ? "⏸" : "▶"}</span>
                <span>{autoRotate ? "REVOLVING" : "PAUSED"}</span>
              </button>
            )}

            <button
              onClick={() => setExternalVoiceTrigger((prev) => prev + 1)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                nexusVoiceState === "listening"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse"
                  : nexusVoiceState === "thinking"
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"
                  : nexusVoiceState === "speaking"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse"
                  : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
              }`}
              title="Initiate Push-to-Talk Voice Comms with NEXUS"
            >
              <Mic className="w-3 h-3 text-cyan-400" />
              <span>NEXUS VOICE</span>
            </button>

            <Link
              href="/shooters"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 hover:bg-emerald-900/60 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Shooters</span>
            </Link>
            <button
              onClick={() => {
                setSelectedNode(null);
                setRecenterSignal((prev) => prev + 1);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              title="Recenter Camera & Orientation"
            >
              ⟲ RECENTER
            </button>
          </div>
        </div>

        {/* MOBILE MODERN SINGLE-ROW HEADER (< lg) */}
        <div className="flex lg:hidden items-center justify-between min-h-12 py-1.5 w-full">
          {/* Left: Home, Comms, Title */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 active:scale-95"
              title="Return Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-[10px]">HOME</span>
            </Link>

            <Link
              href="/chat"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 active:scale-95"
              title="Open Squad Comms"
            >
              <span className="text-[10px]">💬</span>
              <span className="font-bold text-[10px]">COMMS</span>
            </Link>

            <div className="flex items-center gap-1.5 pl-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06B6D4]" />
              <span className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-pink-400 bg-clip-text text-transparent">
                EVOS
              </span>
            </div>
          </div>

          {/* Right: 2D/3D Switch, Voice Trigger, Expandable Menu Button */}
          <div className="flex items-center gap-1.5">
            {/* Quick 2D / 3D Toggle */}
            <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5 shadow-inner text-[10px]">
              <button
                onClick={() => setIs3DMode(false)}
                className={`px-2 py-1 rounded-md font-bold transition-all ${
                  !is3DMode
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400"
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setIs3DMode(true)}
                className={`px-2 py-1 rounded-md font-bold transition-all ${
                  is3DMode
                    ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50"
                    : "text-slate-400"
                }`}
              >
                3D
              </button>
            </div>

            {/* Quick NEXUS Voice Intercom Button */}
            <button
              onClick={() => setExternalVoiceTrigger((prev) => prev + 1)}
              className={`p-1.5 rounded-lg border transition-all ${
                nexusVoiceState !== "idle"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse"
                  : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
              }`}
              title="NEXUS Voice Intercom"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Modern Expandable Controls Drawer Button */}
            <button
              onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                mobileControlsOpen
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span className="hidden xs:inline">CONTROLS</span>
              {mobileControlsOpen ? (
                <ChevronUp className="w-3 h-3 text-cyan-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Expandable Controls Drawer */}
      {mobileControlsOpen && (
        <div className="lg:hidden shrink-0 bg-black/95 backdrop-blur-xl border-b border-cyan-500/30 px-3 py-2 space-y-2 z-10 text-[10px] animate-fadeIn">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setExpandAllSignal((prev) => prev + 1)}
              className="py-1.5 px-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-center shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            >
              ⊕ ALL
            </button>
            <button
              onClick={() => {
                setSelectedNode(null);
                setContractAllSignal((prev) => prev + 1);
              }}
              className="py-1.5 px-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-center shadow-[0_0_8px_rgba(6,182,212,0.2)]"
            >
              ⊖ NEXUS
            </button>
            <button
              onClick={() => {
                setSelectedNode(null);
                setRecenterSignal((prev) => prev + 1);
              }}
              className="py-1.5 px-2 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold text-center"
            >
              ⟲ RECENTER
            </button>
            <Link
              href="/shooters"
              className="py-1.5 px-2 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-bold text-center flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>SHOOTERS</span>
            </Link>
          </div>

          {/* Celestial & Constellation Layer Toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-white/10">
            <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">CELESTIAL:</span>
            <button
              onClick={() => setConstellationsEnabled(!constellationsEnabled)}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold flex items-center gap-1 ${
                constellationsEnabled
                  ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              <span>✨ LINES:</span>
              <span className={constellationsEnabled ? "text-cyan-300" : "text-slate-500"}>
                {constellationsEnabled ? "ON" : "OFF"}
              </span>
            </button>
            <button
              onClick={() => setStarsEnabled(!starsEnabled)}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold flex items-center gap-1 ${
                starsEnabled
                  ? "bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              <span>⭐ STARS:</span>
              <span className={starsEnabled ? "text-amber-300" : "text-slate-500"}>
                {starsEnabled ? "ON" : "OFF"}
              </span>
            </button>
            <button
              onClick={() => setSpacemanActive(!spacemanActive)}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold flex items-center gap-1 ${
                spacemanActive
                  ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              <span>👨‍🚀 ASTRONAUT:</span>
              <span className={spacemanActive ? "text-cyan-300" : "text-slate-500"}>
                {spacemanActive ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {/* 3D Revolution Control (if in 3D Mode) */}
          {is3DMode && (
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px]">
              <span className="text-slate-400 font-mono">3D REVOLUTION:</span>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-0.5 rounded font-bold ${
                  autoRotate ? "text-cyan-300 bg-cyan-500/20 border border-cyan-500/40" : "text-slate-400 bg-white/5"
                }`}
              >
                {autoRotate ? "▶ REVOLVING" : "⏸ PAUSED"}
              </button>
            </div>
          )}

          {/* Cluster Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-white/10">
            <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">CLUSTERS:</span>
            <button
              onClick={() => setActiveClusterFilter(null)}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold ${
                activeClusterFilter === null
                  ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              ALL ({EVO_NODES.length})
            </button>
            <button
              onClick={() => setActiveClusterFilter("USERS")}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold ${
                activeClusterFilter === "USERS"
                  ? "bg-sky-500/25 text-sky-300 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              COMPETITORS (8)
            </button>
            <button
              onClick={() => setActiveClusterFilter("MODS")}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold ${
                activeClusterFilter === "MODS"
                  ? "bg-rose-500/25 text-rose-300 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              MODS (6)
            </button>
            <button
              onClick={() => setActiveClusterFilter("ADMIN")}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold ${
                activeClusterFilter === "ADMIN"
                  ? "bg-indigo-500/25 text-indigo-300 border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              ADMIN (6)
            </button>
            <button
              onClick={() => setActiveClusterFilter("BOTS")}
              className={`px-2 py-1 rounded-md border shrink-0 transition-all font-mono font-bold ${
                activeClusterFilter === "BOTS"
                  ? "bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              AI BOTS (6)
            </button>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {transmissionSuccessNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] z-40 animate-fadeIn flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{transmissionSuccessNotice}</span>
        </div>
      )}

      {/* ─── MAIN INTERACTIVE CANVAS VIEWPORT ────────────────────────── */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <EvoVisionCanvas
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
          activeFilter={activeClusterFilter}
          spacemanEnabled={spacemanActive}
          onToggleSpaceman={setSpacemanActive}
          showConstellations={constellationsEnabled}
          onToggleConstellations={setConstellationsEnabled}
          showStars={starsEnabled}
          onToggleStars={setStarsEnabled}
          is3DMode={is3DMode}
          autoRotate={autoRotate}
          onToggle3D={setIs3DMode}
          onToggleAutoRotate={setAutoRotate}
          onDismissSelection={() => setSelectedNode(null)}
          recenterSignal={recenterSignal}
          expandAllSignal={expandAllSignal}
          contractAllSignal={contractAllSignal}
          nexusVoiceState={nexusVoiceState}
          onExpandStateChange={(count, total, isAllExp, isAllContr) => {
            setExpandStats({
              expandedCount: count,
              totalCount: total,
              isAllExpanded: isAllExp,
              isAllContracted: isAllContr,
            });
          }}
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
            <span className="text-slate-300">RO BOT AI Sentinel & Moderator Rooms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_#818CF8]" />
            <span className="text-slate-300">Master Admin (RADAR) & Admin Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            <span className="text-slate-300">Autonomous Chat Bots (incl. Marcus Webb)</span>
          </div>
        </div>

        {/* Floating Quick Hint (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 pointer-events-none hidden md:block">
          Drag to pan • Pinch / Scroll to zoom • Double-click blank space to close card
        </div>

        {/* ─── RICH NODE INSPECTOR CARD (Right Side / Mobile Bottom Sheet) ──── */}
        {selectedNode && (
          <aside className="fixed inset-x-2 bottom-2 max-h-[72vh] sm:static sm:absolute sm:inset-auto sm:top-4 sm:right-4 sm:w-96 sm:max-h-[calc(100%-2rem)] flex flex-col rounded-3xl bg-[#090D18]/98 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-30 animate-fadeIn">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2 sm:hidden shrink-0" />
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

              {/* Activity Sparkline */}
              {selectedNode.metrics?.sparkline && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Activity & Synaptic Velocity</span>
                    </span>
                    <span className="text-slate-400">7-Day Trend</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-10 pt-1 px-1 bg-black/40 rounded-xl border border-white/5">
                    {selectedNode.metrics.sparkline.map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-cyan-500/40 to-cyan-400 transition-all duration-300"
                          style={{ height: `${Math.max(15, val)}%` }}
                          title={`Period ${idx + 1}: ${val}%`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono px-0.5">
                    <span>-6D</span>
                    <span>-4D</span>
                    <span>-2D</span>
                    <span className="text-cyan-400 font-bold">LIVE</span>
                  </div>
                </div>
              )}

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

              {/* Competitive Standing & Rank Badge */}
              {selectedNode.rankBadge && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-black/40 to-slate-900/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-bold text-[10px] uppercase flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Competitive Standing</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[9px] border border-amber-500/30">
                      {selectedNode.rankBadge.tier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Rating</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        {selectedNode.rankBadge.rating}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Standing</span>
                      <span className="text-sm font-black text-sky-300 font-mono">
                        {selectedNode.rankBadge.percentile}
                      </span>
                    </div>
                  </div>
                  {selectedNode.rankBadge.regionalRank && (
                    <div className="text-[9px] text-amber-200/90 text-center font-bold">
                      🏆 {selectedNode.rankBadge.regionalRank}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Verified Matches */}
              {selectedNode.matchHistory && selectedNode.matchHistory.length > 0 && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-sky-300 font-bold uppercase flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-sky-400" />
                      <span>Recent Verified Matches</span>
                    </span>
                    <span className="text-slate-400">{selectedNode.matchHistory.length} Matches</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedNode.matchHistory.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px]"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-white truncate">{m.matchName}</div>
                          <div className="text-[9px] text-slate-400">
                            {m.date} • {m.division}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-emerald-400">{m.finish}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{m.points}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Range & Territory */}
              {selectedNode.homeRange && (
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>Home Range</span>
                  </span>
                  <span className="font-semibold text-white truncate max-w-[200px] text-right">
                    {selectedNode.homeRange}
                  </span>
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
                      <span>RO BOT AI Moderation Sentinel</span>
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

              {/* Enforcement Metrics (Moderation Sentinel Engine) */}
              {selectedNode.enforcementStats && (
                <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-rose-300 font-bold uppercase flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sentinel Enforcement Metrics</span>
                    </span>
                    <span className="text-[9px] text-rose-200 bg-rose-500/20 px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
                      {selectedNode.enforcementStats.cleanRate} Clean
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[8px] text-slate-400 block uppercase">Flags</span>
                      <span className="font-black text-rose-300">{selectedNode.enforcementStats.flagsProcessed}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[8px] text-slate-400 block uppercase">Warnings</span>
                      <span className="font-black text-amber-300">{selectedNode.enforcementStats.warnings}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[8px] text-slate-400 block uppercase">Mutes</span>
                      <span className="font-black text-slate-300">{selectedNode.enforcementStats.mutesIssued}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitored Comms Rooms */}
              {selectedNode.channelCoverage && selectedNode.channelCoverage.length > 0 && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-rose-300 font-bold uppercase flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      <span>Monitored Comms Rooms</span>
                    </span>
                    <span className="text-slate-400">{selectedNode.channelCoverage.length} Rooms</span>
                  </div>
                  <div className="space-y-1">
                    {selectedNode.channelCoverage.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 px-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[10px]"
                      >
                        <span className="text-slate-200">#{c.roomName}</span>
                        <span className="text-[9px] text-cyan-300 font-mono">{c.activeShooters} marksmen</span>
                      </div>
                    ))}
                  </div>
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

              {/* Autonomous Simulation Event Stream */}
              {selectedNode.simulationTimeline && selectedNode.simulationTimeline.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      <span>Autonomous Event Stream</span>
                    </span>
                    <span className="text-[9px] text-amber-300 font-bold">Sim Loop</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedNode.simulationTimeline.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between text-[10px] gap-2"
                      >
                        <div className="text-slate-200 leading-snug">{item.event}</div>
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Health & Node Engine */}
              {selectedNode.systemHealth && (
                <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      <span>System Health & Node Engine</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Uptime</span>
                      <span className="font-bold text-emerald-300">{selectedNode.systemHealth.uptime}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Throughput</span>
                      <span className="font-bold text-cyan-300">{selectedNode.systemHealth.throughput}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Memory</span>
                      <span className="font-bold text-amber-300">{selectedNode.systemHealth.memoryUsed}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-slate-400 block">DB Latency</span>
                      <span className="font-bold text-sky-300">{selectedNode.systemHealth.dbLag}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Audit Trail */}
              {selectedNode.securityLog && selectedNode.securityLog.length > 0 && (
                <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-indigo-300 font-bold uppercase flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Security Audit Trail</span>
                    </span>
                    <span className="text-[9px] text-indigo-200 bg-indigo-500/20 px-1.5 py-0.5 rounded font-bold border border-indigo-500/30">
                      PASSKEY
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedNode.securityLog.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between text-[10px] gap-2"
                      >
                        <div className="text-slate-200">{log.event}</div>
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Telemetry Stats (For Master Admin or Core DB) */}
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

              {/* Direct Synaptic Connections (Interactive Map) */}
              {connectedNodes.length > 0 && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Synaptic Peer Links</span>
                    </span>
                    <span className="text-slate-400">{connectedNodes.length} Links</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedNodes.map(({ link, peer }) => (
                      <button
                        key={peer.id}
                        onClick={() => setSelectedNode(peer)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/50 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all group shadow-sm"
                        title={`Jump camera to [${peer.callsign || peer.label}]`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: peer.color }}
                        />
                        <span className="font-bold">{peer.callsign || peer.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono group-hover:text-cyan-300">
                          {link.latencyLabel || "2ms"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {selectedNode.id === "hub-main" && (
                  <button
                    onClick={() => setExternalVoiceTrigger((prev) => prev + 1)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/60 text-cyan-200 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(6,182,212,0.35)]"
                  >
                    <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>OPEN NEXUS VOICE INTERCOM</span>
                  </button>
                )}

                <button
                  onClick={() => handleSimulateTransmission(selectedNode)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  title="Send a real-time comms check to this node"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ping Comms Link</span>
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
                    href="/shooters"
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    <span>Shooter Profiles</span>
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

        {/* ─── PUSH-TO-TALK NEXUS VOICE INTERCOM ───────────────────────── */}
        <NexusVoiceIntercom
          onVoiceStateChange={setNexusVoiceState}
          externalTrigger={externalVoiceTrigger}
          dashboardContext={{
            activeFilter: activeClusterFilter || undefined,
            expandedCount: expandStats.expandedCount,
            totalNodes: expandStats.totalCount,
            registeredCount: 94,
          }}
        />
      </main>
    </div>
  );
}
