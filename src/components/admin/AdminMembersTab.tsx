"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Download, 
  Trash2, 
  Lock, 
  Play, 
  UserCheck, 
  Search, 
  Filter, 
  Sparkles, 
  Pause, 
  Ban, 
  Edit3, 
  AlertTriangle, 
  QrCode, 
  ShieldCheck, 
  Shield, 
  Key, 
  Users, 
  Trophy, 
  ExternalLink, 
  Target, 
  Copy, 
  X
} from "lucide-react";
import { SocietyMember, ShooterProfile } from "@/lib/types";

export interface AdminMembersTabProps {
  staffMembers?: SocietyMember[];
  members?: SocietyMember[];
  filteredMembers: SocietyMember[];
  memberSearch: string;
  setMemberSearch: (s: string) => void;
  memberStateFilter?: string;
  setMemberStateFilter?: (s: string) => void;
  memberRoleFilter: "ALL" | "ADMINS" | "MEMBERS";
  setMemberRoleFilter: (s: "ALL" | "ADMINS" | "MEMBERS") => void;
  memberStatusFilter?: "ALL" | "ACTIVE" | "PAUSED" | "BANNED";
  setMemberStatusFilter?: (s: "ALL" | "ACTIVE" | "PAUSED" | "BANNED") => void;
  shooterProfiles?: ShooterProfile[];
  appointMemberId?: string;
  setAppointMemberId?: (id: string) => void;
  appointRole?: any;
  setAppointRole?: (role: any) => void;
  isAppointing?: boolean;
  cardDeleteConfirmId: string | null;
  setCardDeleteConfirmId: (id: string | null) => void;
  isDeletingMember: boolean;
  setMemberModalTab: (tab: any) => void;
  downloadMembersExport: () => void;
  handleOpenMemberModal: (m: SocietyMember) => void;
  handleQuickStatusChange: (id: string, s: any) => void;
  handleAssignMemberRole?: (id: string, r: any) => void;
  handleDeleteMember: (id: string) => void;
  adminSession?: any;
}

export function AdminMembersTab(props: AdminMembersTabProps) {
  const {
    members = [],
    filteredMembers,
    memberSearch,
    setMemberSearch,
    memberRoleFilter,
    setMemberRoleFilter,
    memberStatusFilter = "ALL",
    setMemberStatusFilter,
    shooterProfiles = [],
    cardDeleteConfirmId,
    setCardDeleteConfirmId,
    isDeletingMember,
    setMemberModalTab,
    downloadMembersExport,
    handleOpenMemberModal,
    handleQuickStatusChange,
    handleDeleteMember,
  } = props;

  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // Helper to determine if an account is staff / admin
  const isStaffOrAdmin = (m: SocietyMember) => {
    return (
      ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR", "MATCH_DIRECTOR", "OFFICIAL"].includes(m.role || "") ||
      m.member_id === "SS-2026-0001" ||
      m.member_id === "SS-2026-0002"
    );
  };

  // Counts for live filter chips
  const totalCount = members.length;
  const adminCount = members.filter(isStaffOrAdmin).length;
  const memberShooterCount = members.filter((m) => !isStaffOrAdmin(m)).length;

  const activeCount = members.filter((m) => (m.status || "ACTIVE") === "ACTIVE").length;
  const pausedCount = members.filter((m) => m.status === "PAUSED").length;
  const bannedCount = members.filter((m) => m.status === "BANNED").length;

  const handleCopyCard = (m: SocietyMember, shooter?: ShooterProfile) => {
    const lines = [
      `=== SUBSONIC SOCIETY MARKSMAN ===`,
      `ID: ${m.member_id}`,
      `Name: ${m.full_name}`,
      `Callsign: ${m.callsign || "MARKSMAN"}`,
      `Role: ${m.role || "MEMBER"}`,
      `Status: ${m.status || "ACTIVE"}`,
      `Email: ${m.email}`,
      `State: ${m.state}`,
      `Division: ${shooter?.division || m.experience_level}`,
      shooter?.podiums !== undefined ? `Podiums: ${shooter.podiums}` : null,
      shooter?.homeRange ? `Home Range: ${shooter.homeRange}` : null,
      `Rifle Rig: ${m.rifle_setup || (shooter?.rifleSetup?.action ? `${shooter.rifleSetup.action} / ${shooter.rifleSetup.optic}` : "Precision Rig")}`,
      shooter?.pin ? `Chat PIN: ${shooter.pin}` : null,
      `Profile: https://subsonicsociety.com/shooters?id=${shooter?.id || m.member_id}`,
      `================================`
    ].filter(Boolean).join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(lines);
    }
    setCopiedCardId(m.member_id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="ios-glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white">
                Society Directory &amp; Marksmen Roster ({filteredMembers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Single unified directory combining society members, administrative executives, and invited competitor marksmen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/shooters/intake"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-tactical-glow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Launch Intake Form</span>
            </Link>

            <Link
              href="/shooters"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>Public Shooters Roster</span>
            </Link>

            <button
              onClick={downloadMembersExport}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Export roster to CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Unified Filter Deck */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          {/* Primary Role / Audience Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setMemberRoleFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  memberRoleFilter === "ALL"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Accounts</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${memberRoleFilter === "ALL" ? "bg-black/30 text-black font-black" : "bg-white/10 text-slate-300"}`}>
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMemberRoleFilter("ADMINS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  memberRoleFilter === "ADMINS"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admins &amp; Staff</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${memberRoleFilter === "ADMINS" ? "bg-black/30 text-black font-black" : "bg-white/10 text-slate-300"}`}>
                  {adminCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMemberRoleFilter("MEMBERS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  memberRoleFilter === "MEMBERS"
                    ? "bg-amber-500 text-black shadow-tactical-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Members &amp; Shooters</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${memberRoleFilter === "MEMBERS" ? "bg-black/30 text-black font-black" : "bg-white/10 text-slate-300"}`}>
                  {memberShooterCount}
                </span>
              </button>
            </div>

            {/* Status Quick Filter Chips */}
            {setMemberStatusFilter && (
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-slate-500 mr-1 hidden sm:inline">STATUS:</span>
                <button
                  type="button"
                  onClick={() => setMemberStatusFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    memberStatusFilter === "ALL"
                      ? "bg-white/15 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setMemberStatusFilter("ACTIVE")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    memberStatusFilter === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Active ({activeCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberStatusFilter("PAUSED")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    memberStatusFilter === "PAUSED"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Paused ({pausedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberStatusFilter("BANNED")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    memberStatusFilter === "BANNED"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40 font-bold"
                      : "text-slate-400 hover:text-red-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>Banned ({bannedCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by callsign, name, email, member ID, rifle rig, division, or notes..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {memberSearch && (
              <button
                type="button"
                onClick={() => setMemberSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="space-y-3 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 text-xs font-mono text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredMembers.length}</strong> of {totalCount} total society accounts
          </span>
          <span className="text-[11px] text-amber-400 font-bold">
            💡 Click any card to edit credentials, profile details, clearance, or view digital pass
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full max-w-full">
          {filteredMembers.map((m) => {
            const isBanned = m.status === "BANNED";
            const isPaused = m.status === "PAUSED";
            const isRoot = m.member_id === "SS-2026-0001" || m.member_id === "SS-2026-0002";
            const displayCallsign = m.callsign || (m.full_name ? m.full_name.split(" ")[0].toUpperCase() : "MARKSMAN");

            // Look up corresponding shooter profile if present
            const shooter = shooterProfiles.find(
              (s) =>
                s.callsign?.toUpperCase() === m.callsign?.toUpperCase() ||
                s.id?.toLowerCase() === m.member_id?.toLowerCase() ||
                s.name?.toLowerCase() === m.full_name?.toLowerCase()
            );

            const isProShooter = m.role === "PRO_COMPETITOR" || Boolean(shooter);

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
                    : isProShooter
                    ? "border-blue-500/30 hover:border-blue-400/60 bg-white/[0.02] hover:bg-blue-950/10"
                    : "border-white/10 hover:border-amber-400/60 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                {/* Clickable Header & Details */}
                <div 
                  onClick={() => handleOpenMemberModal(m)}
                  className="cursor-pointer space-y-2.5 group"
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

                        {/* Badges */}
                        {m.role === "MASTER_OWNER" && (
                          <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0">
                            ⚡ MASTER ADMIN
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
                        {m.role === "PRO_COMPETITOR" && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40 shrink-0">
                            🏅 PRO SHOOTER
                          </span>
                        )}
                        {(!m.role || m.role === "MEMBER") && shooter && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shrink-0">
                            🎯 SHOOTER
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
                      {shooter?.division || m.experience_level || "Marksman"}
                    </span>
                    {shooter?.podiums !== undefined && shooter.podiums > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>{shooter.podiums} Podiums</span>
                      </span>
                    )}
                    {shooter?.homeRange && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono text-[10px] truncate max-w-[180px]">
                        📍 {shooter.homeRange}
                      </span>
                    )}
                  </div>

                  {/* Rig Details & Email */}
                  <div className="space-y-1 text-xs text-slate-300 pt-1">
                    <div className="text-[11px] text-slate-300 break-all">
                      <span className="text-slate-500 font-mono mr-1">EMAIL:</span>
                      <span className="text-slate-300">{m.email}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 break-words">
                      <span className="text-slate-500 font-mono mr-1">
                        {m.member_id === "SS-2026-0001" || m.callsign === "RADAR" || m.role === "MASTER_OWNER" ? "TECH STACK:" : "RIG:"}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {m.rifle_setup || 
                          (shooter?.rifleSetup?.action 
                            ? `${shooter.rifleSetup.action}${shooter.rifleSetup.optic ? ` / ${shooter.rifleSetup.optic}` : ""}` 
                            : (m.role === "MASTER_OWNER" ? "Systems & Infrastructure Architecture (Non-Shooter)" : "Custom Precision Rimfire"))}
                      </span>
                    </div>

                    {/* Accolades preview if shooter */}
                    {shooter?.accolades && shooter.accolades.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {shooter.accolades.slice(0, 2).map((acc, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[220px]">
                            🏆 {acc}
                          </span>
                        ))}
                      </div>
                    )}
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


                    {/* One-click Copy Profile */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCard(m, shooter);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 text-[10px] font-mono flex items-center gap-1 transition-all"
                      title="Copy complete profile and rifle rig specs to clipboard"
                    >
                      <Copy className="w-3 h-3 text-amber-400" />
                      <span>{copiedCardId === m.member_id ? "Copied!" : "Copy"}</span>
                    </button>

                    {/* Link to public shooter profile if available */}
                    {shooter && (
                      <Link
                        href={`/shooters?id=${shooter.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono flex items-center gap-1 transition-all"
                        title="View Public Profile Page"
                      >
                        <ExternalLink className="w-3 h-3 text-purple-400" />
                        <span>Public</span>
                      </Link>
                    )}

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
                        title="Permanently Delete Member Account & Shooter Profile"
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
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="col-span-full ios-glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No accounts found</p>
              <p className="text-xs text-slate-500">No member matches the current search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
