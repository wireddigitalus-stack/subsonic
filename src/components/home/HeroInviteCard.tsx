"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Trophy, 
  MessageSquare, 
  CheckCircle2, 
  Target, 
  Radio,
  Crosshair,
  Flame
} from "lucide-react";

export function HeroInviteCard() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inviteCode.trim().toUpperCase();

    if (!clean) {
      // If empty, navigate straight to the Pro invitation redemption page
      router.push("/invite/pro");
      return;
    }

    setValidating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setErrorMessage(data.error || "Invalid or expired invitation code. Please verify spelling.");
      } else {
        router.push(`/invite/pro?code=${encodeURIComponent(clean)}`);
      }
    } catch {
      // On network failure, forward to the redemption page with the code
      router.push(`/invite/pro?code=${encodeURIComponent(clean)}`);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Outer Tactical Glass Container with Amber Edge Glow */}
      <div className="ios-glass-card rounded-3xl p-6 sm:p-10 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-black/85 to-[#07090E]">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* 1. Header Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-black text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 fill-black" />
              <span>ACCESS PROTOCOL • INVITATION ONLY</span>
            </span>

            <span className="px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SINGLE TIER • 100% PRO COMPETITOR</span>
            </span>
          </div>

          {/* 2. Main Headline & Welcome Narrative */}
          <div className="space-y-4 max-w-4xl">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              WELCOME TO THE INVITATIONAL <br />
              <span className="amber-gradient-text">
                BY INVITATION ONLY.
              </span>
            </h2>

            <div className="space-y-3.5 text-slate-200">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                <strong className="text-amber-400 font-bold">Welcome to the Invitational!</strong> You’ve been selected as part of an elite group of shooters for the inaugural <strong className="text-white">Subsonic Society Invitational Match</strong>. Get ready for an epic weekend — we’ll start your journey with registration right here.
              </p>

              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-inner">
                <p>
                  Clear, simple prompts will lead you step-by-step through registration — <strong className="text-emerald-400 font-semibold">designed to be easy and hassle-free</strong>. You’ll choose your callsign, select your 4-digit PIN, and select your division.
                </p>
                <p>
                  When you finish, you’ll arrive directly at the official <strong className="text-white font-semibold">Competitor Information Page</strong>, giving you everything you need for the match: range schedule, Course of Fire briefings, and recommended Bristol hotel accommodations.
                </p>
                <p>
                  You’ll also receive a direct link straight into our <strong className="text-cyan-400 font-semibold">private Chat Room</strong>, which you can use for internal squad conversations, questions with match directors, and live DOPE coordination.
                </p>
                <div className="pt-1 flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <span>Let’s start your journey below:</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. 3-Step Guided Journey (Tech-friendly breakdown for first-time users) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-black text-sm flex items-center justify-center shrink-0 border border-amber-500/30">
                1
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white block">Step 1: Enter Invite Code</span>
                <span className="text-[11px] text-slate-400 block">Redeem your personalized invitation key below</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-cyan-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-black text-sm flex items-center justify-center shrink-0 border border-cyan-500/30">
                2
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white block">Step 2: Follow Quick Prompts</span>
                <span className="text-[11px] text-slate-400 block">Set your callsign, PIN & credentials</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-sm flex items-center justify-center shrink-0 border border-emerald-500/30">
                3
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white block">Step 3: Competitor Hub & Chat</span>
                <span className="text-[11px] text-slate-400 block">Match packet, hotels & private Chat Room</span>
              </div>
            </div>
          </div>

          {/* 4. Interactive Invite Redemption Bar */}
          <div className="p-4 sm:p-6 rounded-2xl bg-black/75 border border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <label htmlFor="hero-invite-code" className="font-mono text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Step 1: Enter Serialized Invitation Code</span>
              </label>
              <span className="font-mono text-[10px] text-amber-400/90 font-bold">
                100% PRO COMPETITOR GATEWAY
              </span>
            </div>

            <form onSubmit={handleRedeemInvite} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="hero-invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. SS-PRO-VIP2026 or Paste your code here"
                  className="w-full h-14 bg-black/90 border-2 border-white/15 focus:border-amber-400 rounded-2xl px-5 text-white text-sm sm:text-base font-mono font-bold tracking-wider outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  autoComplete="off"
                  spellCheck="false"
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={validating}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {validating ? (
                  <span>VERIFYING CODE...</span>
                ) : (
                  <>
                    <Key className="w-4 h-4 fill-black" />
                    <span>START REGISTRATION</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Links inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-400">Already have your Call Sign & PIN?</span>
                <Link
                  href="/chat"
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                >
                  <span>Enter Chat Room →</span>
                </Link>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-400">Need an invitation?</span>
                <Link
                  href="/contact"
                  className="text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  Contact Match Directorate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
