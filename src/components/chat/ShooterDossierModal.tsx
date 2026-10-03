"use client";

import React from "react";
import Link from "next/link";
import { 
  X, 
  Lock, 
  Crosshair, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Compass,
  ArrowRight,
  Bot,
  Radar,
  Users,
  ExternalLink
} from "lucide-react";
import { DirectPartner } from "@/lib/types";

export interface ShooterDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  shooter: DirectPartner | null;
  onStartDirectComms: (shooter: DirectPartner) => void;
}

export function ShooterDossierModal({
  isOpen,
  onClose,
  shooter,
  onStartDirectComms,
}: ShooterDossierModalProps) {
  if (!isOpen || !shooter) return null;

  const isRO = shooter.callsign === "RO" || shooter.callsign === "RO BOT" || shooter.name === "RO" || shooter.name === "RO BOT" || shooter.id === "dm_ro";
  const isMasterOwner = shooter.role === "MASTER_OWNER" || shooter.callsign === "ROB" || shooter.callsign === "RADAR";
  const isOwnerAdmin = shooter.role === "OWNER_ADMIN" || shooter.callsign === "SAID DONE" || shooter.callsign === "ALLEN";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="ios-glass rounded-2xl md:rounded-3xl max-w-md w-full border border-amber-500/40 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${isRO ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-amber-400 animate-ping"}`} />
            <span className={`font-mono text-[11px] font-bold tracking-wider uppercase ${
              isRO ? "text-cyan-400" : "text-amber-400"
            }`}>
              {isRO 
                ? "AUTONOMOUS AI RANGE OFFICER PROFILE" 
                : isMasterOwner 
                ? "MASTER ADMIN PROFILE" 
                : isOwnerAdmin 
                ? "OWNER ADMIN PROFILE" 
                : "COMPETITOR PROFILE"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Identity Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-mono font-black border shrink-0 overflow-hidden ${
            isRO
              ? "bg-gradient-to-br from-cyan-900 via-cyan-950 to-black text-cyan-300 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : isMasterOwner
              ? "bg-gradient-to-br from-blue-700 via-indigo-900 to-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              : isOwnerAdmin
              ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-black border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              : "bg-black/60 text-amber-400 border-white/15"
          }`}>
            {shooter.image ? (
              <img src={shooter.image} alt="" className="w-full h-full object-cover" />
            ) : isRO ? (
              "🤖"
            ) : isMasterOwner ? (
              <Radar className="w-7 h-7 text-cyan-300 stroke-[2.2] drop-shadow-[0_0_12px_rgba(6,182,212,0.85)] animate-pulse" />
            ) : isOwnerAdmin ? (
              <span className="font-mono font-black text-2xl text-black">A</span>
            ) : (
              shooter.callsign?.slice(0, 2) || "SS"
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base truncate">
                {isRO ? "RO BOT" : shooter.name}
              </h3>
              <span className={`font-mono text-xs font-bold shrink-0 ${
                isRO ? "text-cyan-400" : isMasterOwner ? "text-blue-400" : "text-amber-400"
              }`}>
                [{isRO ? "RO BOT" : shooter.callsign}]
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black tracking-wide uppercase ${
                isRO
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                  : isMasterOwner
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  : isOwnerAdmin
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black border border-emerald-300"
                  : "bg-white/10 text-slate-300 border border-white/10"
              }`}>
                {isRO ? (
                  "🤖 AI Range Officer"
                ) : isMasterOwner ? (
                  <span className="inline-flex items-center gap-1">
                    <Radar className="w-2.5 h-2.5 text-cyan-200 stroke-[2.5]" />
                    <span>MASTER ADMIN</span>
                  </span>
                ) : (
                  shooter.badgeText || shooter.role
                )}
              </span>

              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {shooter.status === "on_range" ? "ON RANGE" : "ONLINE 24/7"}
              </span>
            </div>
          </div>
        </div>

        {/* Division & Tech / Rifle Specs */}
        <div className="space-y-2 text-xs font-mono">
          {isMasterOwner ? (
            <>
              <div className="p-2.5 rounded-xl bg-black/40 border border-blue-500/30 flex items-center justify-between">
                <span className="text-blue-400 font-bold uppercase text-[10px]">Role / System Function</span>
                <span className="font-bold text-white">Master Admin</span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-blue-500/30 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-blue-400 uppercase">
                  <span className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    Infrastructure &amp; Tech Stack
                  </span>
                  <span className="text-cyan-400 font-bold">Non-Shooter • Full Admin</span>
                </div>
                <p className="text-white text-xs font-bold truncate">Master Admin</p>
              </div>
            </>
          ) : (
            <>
              {shooter.division && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Division / Class</span>
                  <span className="font-bold text-slate-200">{shooter.division}</span>
                </div>
              )}

              {shooter.rifleSetup && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-amber-400" />
                      Primary Rifle Spec
                    </span>
                    <span className="text-emerald-400">Match Ready</span>
                  </div>
                  <p className="text-white text-xs font-bold truncate">{shooter.rifleSetup}</p>
                </div>
              )}
            </>
          )}

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Profile Brief</span>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              {isMasterOwner
                ? "Master Admin"
                : shooter.bio || "Registered competitor."}
            </p>
          </div>
        </div>

        {/* Master Admin Highlight */}
        {isMasterOwner && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs font-mono font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Master Admin</span>
          </div>
        )}

        {/* RO Special Capabilities / Direct Prompt shortcuts */}
        {isRO && (
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Autonomous AI Match Assistant · 24/7 Intel</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              RO BOT is Subsonic Society&apos;s official autonomous AI Range Officer. Available 24/7 in the private Chat Room to answer competitor inquiries regarding match check-in, the $2,500 cash side matches, Bristol hotels, top restaurants, or match rules.
            </p>
          </div>
        )}

        {/* Action Buttons: Direct Chat & Full Profile */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => onStartDirectComms(shooter)}
            className={`w-full py-3 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isRO
                ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]"
            }`}
          >
            <Lock className="w-4 h-4 text-black" />
            <span>Open Direct Chat with {shooter.callsign}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {!isRO && (
            <Link
              href={`/shooters?id=${shooter.id?.replace(/^dm_/, "") || shooter.callsign.toLowerCase()}`}
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>View Full Shooter Profile &rarr;</span>
            </Link>
          )}

          <p className="text-[10px] text-center text-slate-500 font-mono mt-2 flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            <span>Closed Net · Point-to-Point Transmission</span>
          </p>
        </div>
      </div>
    </div>
  );
}
