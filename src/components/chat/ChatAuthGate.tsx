"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, AlertTriangle, Unlock, ChevronRight, ChevronLeft, Scale } from "lucide-react";

export interface ChatAuthGateProps {
  authShake: boolean;
  authError: string | null;
  loginCallsign: string;
  setLoginCallsign: (val: string) => void;
  loginPasscode: string;
  setLoginPasscode: (val: string) => void;
  handleUnlockRoom: (e: React.FormEvent) => void;
}

export function ChatAuthGate({
  authShake,
  authError,
  loginCallsign,
  setLoginCallsign,
  loginPasscode,
  setLoginPasscode,
  handleUnlockRoom,
}: ChatAuthGateProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
      {/* Top Mobile/Headless PWA Breadcrumb Navigation */}
      <div className="w-full max-w-md mx-auto mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all group"
          title="Return to Main Portal"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold">HOME</span>
          <span className="text-white/30">/</span>
          <span className="text-amber-400 font-extrabold">CHAT ROOM</span>
        </Link>

        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded-lg bg-black/40 border border-white/5">
          RESTRICTED NET
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className={`w-full max-w-md ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 text-center animate-fadeIn transition-all ${authShake ? "animate-shake" : ""}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20 mx-auto relative">
          <Image
            src="/images/SS-RWB-LOGO.png"
            alt="Subsonic Emblem"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <Lock className="w-3 h-3" />
            <span>Restricted Network • Member Key Required</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            PRIVATE CHAT ROOM
          </h2>
          <p className="text-xs text-slate-300">
            Enter your callsign and member key to access the live Chat Room and DOPE drops.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono text-left flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleUnlockRoom} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Callsign *</label>
            <input
              type="text"
              required
              value={loginCallsign}
              onChange={(e) => setLoginCallsign(e.target.value.toUpperCase())}
              placeholder="e.g. SAID DONE, RADAR, or Callsign"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs font-bold uppercase focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Member Key or Security PIN</span>
              <span className="text-[10px] text-amber-400/90 font-normal normal-case">PIN 620620 for SAID DONE • 2468 for RADAR</span>
            </label>
            <input
              type="password"
              value={loginPasscode}
              onChange={(e) => setLoginPasscode(e.target.value)}
              placeholder="Enter PIN (e.g. 620620 or 2468)..."
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Unlock className="w-4 h-4 fill-black" />
            <span>Unlock Chat Room</span>
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-2">
            <span className="text-[11px] font-medium text-slate-300 block">
              Membership & Chat by Invitation Only
            </span>
            <p className="text-[11px] text-slate-300">
              Have an invitation code from Allen or a Range Officer?
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Link
                href="/invite"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 transition-all"
              >
                <span>Claim Member Code</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/invite/pro"
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-all"
              >
                <span>Pro VIP Intake</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs text-slate-500 pt-1">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Return to Main Portal
            </Link>
            <span className="hidden sm:inline text-slate-700">•</span>
            <Link 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400/80 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
            >
              <Scale className="w-3 h-3 text-amber-400" />
              <span>Terms of Use &amp; Code of Conduct</span>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
