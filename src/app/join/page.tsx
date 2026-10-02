"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Sparkles
} from "lucide-react";

export default function JoinSocietyGatePage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidateAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inviteCode.trim().toUpperCase();
    if (!clean) {
      setErrorMessage("Please enter your invitation code.");
      return;
    }

    setValidating(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setErrorMessage(data.error || "Invalid or expired invitation code. Please check your credentials.");
      } else {
        router.push(`/invite/pro?code=${encodeURIComponent(clean)}`);
      }
    } catch (err: any) {
      setErrorMessage("Network error validating code. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-12 pb-32 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Protocol Header */}
      <section className="relative pt-6 pb-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>ACCESS PROTOCOL • INVITATION ONLY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          MEMBERSHIP BY <br />
          <span className="amber-gradient-text">INVITATION ONLY.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Log in with the invitation credentials sent to you, or enter your serialized invite code below to activate your marksman profile and private Chat Room access.
        </p>
      </section>

      {/* Main Dual-Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Enter Invitation Code */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>PRO INVITATION PASS</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                100% PRO TIER
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Enter Your Invite Code
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Received an invitation code via SMS or email? Enter it here to claim your unique tactical callsign and 6-digit access PIN.
              </p>
            </div>

            <form onSubmit={handleValidateAndClaim} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1 font-bold">
                  Invitation Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setErrorMessage("");
                    }}
                    placeholder="e.g. SS-PRO-VIP2026"
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider outline-none transition-all placeholder:text-slate-600"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={validating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {validating ? (
                  <span>VALIDATING INVITATION...</span>
                ) : (
                  <>
                    <span>CLAIM &amp; ACTIVATE PRO PROFILE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Single Tier Membership:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1 font-mono text-[10px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>100% PRO COMPETITOR</span>
            </span>
          </div>
        </div>

        {/* Card 2: Already Have Credentials (Login) */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EXISTING CREDENTIALS</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ACTIVE OPERATIVE
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Log In With Credentials
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Already claimed your tactical callsign and 6-digit access PIN? Sign directly into the Subsonic Chat Room.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>SQUAD NET SECURE CHAT ROOM</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time match chatter, live Doppler DOPE telemetry, stage notes, and verified competitor-to-competitor dispatches.
                </p>
              </div>

              <Link
                href="/chat"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>ENTER CHAT ROOM LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Need an invitation key?</span>
            <Link
              href="/contact"
              className="text-slate-300 hover:text-white font-bold underline"
            >
              Contact Squad Command
            </Link>
          </div>
        </div>
      </div>

      {/* Protocol Notice */}
      <section className="p-6 rounded-3xl ios-glass border border-white/10 text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>SUBSONIC SOCIETY ACCESS POLICY</span>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Subsonic Society maintains an invitation-only membership model to guarantee high-integrity ballistics data, authentic competitor interactions, and an uncompromised precision rifle environment. Invitations are issued directly by match directors, regional pros, and society leadership.
        </p>
      </section>
    </div>
  );
}
