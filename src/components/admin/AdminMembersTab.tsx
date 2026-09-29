"use client";

import React from "react";
import { Download, Trash2, Lock, Play, UserCheck, Search, Filter, Sparkles, Pause, Ban, Edit3, AlertTriangle, QrCode, ShieldCheck, UserPlus, Shield } from "lucide-react";
import { SocietyMember } from "@/lib/types";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";

export interface AdminMembersTabProps {
  staffMembers: SocietyMember[];

  members: SocietyMember[];
  filteredMembers: SocietyMember[];
  memberSearch: string;
  setMemberSearch: (s: string) => void;
  memberStateFilter: string;
  setMemberStateFilter: (s: string) => void;
  memberRoleFilter: string;
  setMemberRoleFilter: (s: any) => void;
  appointMemberId: string;
  setAppointMemberId: (id: string) => void;
  appointRole: any;
  setAppointRole: (role: any) => void;
  isAppointing: boolean;
  cardDeleteConfirmId: string | null;
  setCardDeleteConfirmId: (id: string | null) => void;
  isDeletingMember: boolean;
  setMemberModalTab: (tab: any) => void;
  downloadMembersExport: () => void;
  handleOpenMemberModal: (m: SocietyMember) => void;
  handleQuickStatusChange: (id: string, s: any) => void;
  handleAssignMemberRole: (id: string, r: any) => void;
  handleDeleteMember: (id: string) => void;
  adminSession?: any;
}

export function AdminMembersTab(props: AdminMembersTabProps) {
  const { staffMembers, members, filteredMembers, memberSearch, setMemberSearch, memberStateFilter, setMemberStateFilter, memberRoleFilter, setMemberRoleFilter, appointMemberId, setAppointMemberId, appointRole, setAppointRole, isAppointing, cardDeleteConfirmId, setCardDeleteConfirmId, isDeletingMember, setMemberModalTab, downloadMembersExport, handleOpenMemberModal, handleQuickStatusChange, handleAssignMemberRole, handleDeleteMember, adminSession } = props;

  return (
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
      
  );
}
