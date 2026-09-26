"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Mountain, 
  MessageSquare, 
  Lock, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id") || "SS-2026-UNKNOWN";
  const callsign = searchParams.get("callsign") || "MARKSMAN";
  const name = searchParams.get("name") || "Verified Subsonic Marksman";

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-6 text-center animate-fadeIn">
        {/* Verification Checkmark Emblem */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OFFICIAL CREDENTIAL VERIFIED</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            MEMBER AUTHENTICATED
          </h1>
          <p className="text-xs text-slate-400">
            Digital credential successfully validated against Subsonic Society registry.
          </p>
        </div>

        {/* Member Details Card */}
        <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-3 text-left font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 text-[10px] uppercase">CALLSIGN</span>
            <span className="font-black text-emerald-400 text-base">[{callsign}]</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 text-[10px] uppercase">MEMBER SERIAL</span>
            <span className="font-bold text-amber-400">{memberId}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 text-[10px] uppercase">MARKSMAN</span>
            <span className="font-bold text-white">{name}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 text-[10px] uppercase">STATUS</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACTIVE & AUTHORIZED</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">ACCESS LEVEL</span>
            <span className="font-bold text-white">PRIVATE CHAT & COMMS</span>
          </div>
        </div>

        {/* Facility Info */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <Mountain className="w-3.5 h-3.5 text-amber-400" />
          <span>Holston Mountain Range • Bristol, TN • 3,420 FT</span>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/chat"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-black" />
            <span>ENTER PRIVATE CHAT ROOM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Return to Subsonic Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 font-mono text-xs">
        Validating credential payload...
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
