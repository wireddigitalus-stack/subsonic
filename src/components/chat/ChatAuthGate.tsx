"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, AlertTriangle, Unlock, ChevronRight } from "lucide-react";

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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow space-y-6 text-center animate-fadeIn transition-all ${authShake ? "animate-shake" : ""}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-glow mx-auto relative">
          <Image
            src="/assets/subsonic-coin.jpg"
            alt="Subsonic Emblem"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Restricted Network • Member Key Required</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            PRIVATE CHAT ROOM
          </h2>
          <p className="text-xs text-slate-300">
            Enter your callsign and member key to access live squad comms and DOPE drops.
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
            <label className="text-xs font-mono text-slate-300 font-bold">Callsign *</label>
            <input
              type="text"
              required
              value={loginCallsign}
              onChange={(e) => setLoginCallsign(e.target.value.toUpperCase())}
              placeholder="e.g. ALLEN, ROB, or Callsign"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs font-bold uppercase focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>Member Key or Security PIN</span>
              <span className="text-[10px] text-amber-400/90 font-normal normal-case">PIN 620620 for ALLEN • 2468 for ROB</span>
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
          >
            <Unlock className="w-4 h-4 fill-black" />
            <span>UNLOCK PRIVATE CHAT ROOM</span>
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block tracking-wider">
              MEMBERSHIP & CHAT BY INVITATION ONLY
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

          <a href="/" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors text-center">
            ← Return to Main Portal
          </a>
        </div>
      </div>
    </div>
  );
}
