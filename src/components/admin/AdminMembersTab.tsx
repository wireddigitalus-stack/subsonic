"use client";

import React from "react";
import { Download, Trash2, Lock, Play, UserCheck, Search, Filter, Sparkles, Pause, Ban, Edit3, AlertTriangle, QrCode, ShieldCheck, UserPlus, Shield, Key } from "lucide-react";
import { SocietyMember } from "@/lib/types";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";

export interface AdminMembersTabProps {
  staffMembers?: SocietyMember[];
  members?: SocietyMember[];
  filteredMembers: SocietyMember[];
  memberSearch: string;
  setMemberSearch: (s: string) => void;
  memberStateFilter?: string;
  setMemberStateFilter?: (s: string) => void;
  memberRoleFilter?: string;
  setMemberRoleFilter?: (s: any) => void;
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
    filteredMembers,
    memberSearch,
    setMemberSearch,
    cardDeleteConfirmId,
    setCardDeleteConfirmId,
    isDeletingMember,
    setMemberModalTab,
    downloadMembersExport,
    handleOpenMemberModal,
    handleQuickStatusChange,
    handleDeleteMember,
  } = props;

  return (
<div className="space-y-6">
      {/* Header & Single Search */}
      <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white">
                Invited Shooters ({filteredMembers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Single unified roster of invited shooters and verified marksmen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadMembersExport}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>

        {/* Single Search Bar */}
        <div className="pt-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invited shooters by callsign, name, email, member ID, or rifle rig..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

          {/* Members Zero-Side-Scroll Responsive Directory */}
          <div className="space-y-3 w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 text-xs font-mono text-slate-400">
              <span>Showing {filteredMembers.length} Invited Shooters</span>
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
                          <span className="text-slate-500 font-mono mr-1">
                            {m.member_id === "SS-2026-0001" || m.callsign === "RADAR" || m.role === "MASTER_OWNER" ? "TECH STACK:" : "RIG:"}
                          </span>
                          <span className="text-slate-200">
                            {m.rifle_setup || (m.role === "MASTER_OWNER" ? "Systems & Infrastructure Architecture (Non-Shooter)" : "Custom Precision Rimfire")}
                          </span>
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

                        {/* Quick PIN Reset Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMemberModal(m);
                            setMemberModalTab("DETAILS");
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                          title="Reset Member Password / Access PIN"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          <span>PIN</span>
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
