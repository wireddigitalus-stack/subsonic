"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  MessageSquare,
  ChevronRight,
  Radio,
  QrCode,
  Download
} from "lucide-react";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";

function StandardInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [codeValid, setCodeValid] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [inviteMeta, setInviteMeta] = useState<any | null>(null);

  // Form
  const [fullName, setFullName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [stateCode, setStateCode] = useState("TN");
  const [experienceLevel, setExperienceLevel] = useState("Club Match Competitor");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [memberResult, setMemberResult] = useState<any | null>(null);

  useEffect(() => {
    const queryCode = searchParams.get("code");
    if (queryCode) {
      validateCode(queryCode);
    }
  }, [searchParams]);

  const validateCode = async (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) {
      setCodeError("Please enter an invitation code.");
      return;
    }

    setValidatingCode(true);
    setCodeError(null);

    try {
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCodeValid(false);
        setCodeError(data.error || "Invalid or expired invite code.");
      } else {
        // If it's a PRO code, redirect them seamlessly to the PRO onboarding portal
        if (data.tier === "PRO") {
          router.push(`/invite/pro?code=${encodeURIComponent(clean)}`);
          return;
        }

        setCodeValid(true);
        setInviteCode(clean);
        setInviteMeta(data);
        if (data.recipientName && !fullName) {
          setFullName(data.recipientName);
        }
      }
    } catch (err: any) {
      setCodeError(err.message || "Network error validating code.");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !callsign.trim()) {
      setFormError("Please enter your Full Name and Tactical Callsign.");
      return;
    }

    if (pin.trim().length < 4) {
      setFormError("Please create a 4 to 6-digit login PIN code.");
      return;
    }

    if (pin.trim() !== pinConfirm.trim()) {
      setFormError("Login PIN codes do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const assignedCallsign = callsign.trim().toUpperCase();
      const memberId = `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Claim invite code
      try {
        await fetch("/api/invites/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: inviteCode,
            callsign: assignedCallsign,
            memberId,
          }),
        });
      } catch {}

      // 2. Build member profile
      const memberObj = {
        member_id: memberId,
        full_name: fullName.trim(),
        callsign: assignedCallsign,
        email: email.trim() || undefined,
        state: stateCode,
        experience_level: experienceLevel,
        rifle_setup: "Precision Rimfire",
        created_at: new Date().toISOString(),
      };

      // 3. Save to localStorage for instant Chat auth
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_authenticated", "true");
          localStorage.setItem(
            "subsonic_shooter_profile",
            JSON.stringify({
              name: fullName.trim(),
              callsign: assignedCallsign,
              division: experienceLevel,
              rifleSetup: "Precision Rimfire",
              badgeText: "SOCIETY MEMBER",
              role: "MEMBER",
              pin: pin.trim(),
            })
          );
          localStorage.setItem("subsonic_member_profile", JSON.stringify(memberObj));
        } catch {}
      }

      setMemberResult(memberObj);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setFormError(err.message || "Failed creating member credential. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (memberResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              INVITATION CLAIMED • CREDENTIAL ISSUED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Welcome, Marksman <span className="text-amber-400">{memberResult.callsign}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Your Subsonic Society membership is activated. Your digital badge and chat key have been generated.
            </p>
          </div>

          {/* Member Card Component */}
          <div className="max-w-md mx-auto py-2">
            <MemberCredentialCard
              memberId={memberResult.member_id}
              fullName={memberResult.full_name}
              callsign={memberResult.callsign}
              state={memberResult.state}
              accessLevel="INVITATION VERIFIED"
              experienceLevel={memberResult.experience_level}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/chat"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-tactical-glow active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Enter Private Squad Comms (Live)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/matches"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all text-center"
            >
              <span>View Match Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CODE GATE
  if (!codeValid) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
              MEMBERSHIP BY INVITATION ONLY
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              CLAIM YOUR INVITATION
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subsonic Society squad comms and competitor networks are strictly invitation-only. 
              Log in with your invitation credentials we sent you, or enter your invite code below to activate your marksman dossier.
            </p>
          </div>

          {codeError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{codeError}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ENTER INVITE CODE (e.g. SS-MBR-XXXX)"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/40 text-white font-mono text-sm tracking-wider uppercase text-center focus:outline-none focus:border-amber-400"
            />

            <button
              type="button"
              onClick={() => validateCode(inviteCode)}
              disabled={validatingCode || !inviteCode.trim()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-tactical-glow disabled:opacity-50 transition-all active:scale-95"
            >
              {validatingCode ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Unlock Member Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
            Have a Pro Competitor VIP invite?{" "}
            <Link href="/invite/pro" className="text-amber-400 hover:underline font-bold">
              Switch to Pro VIP Intake →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING FORM
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 text-center">
        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Invite Code Verified: {inviteCode}</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          MARKSMAN PROFILE SETUP
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Choose your tactical callsign and 6-digit login PIN to unlock the private network.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Chris Taylor"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center justify-between">
              <span>Tactical Callsign *</span>
              <span className="text-[10px] text-slate-400 font-normal">Shows in live chat room</span>
            </label>
            <input
              type="text"
              required
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              placeholder="e.g. RECON, APEX, ECHO"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs sm:text-sm uppercase focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-emerald-400 uppercase">
              Personal 4–6 Digit PIN *
            </label>
            <input
              type="password"
              required
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 582910"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono tracking-widest text-center text-xs sm:text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-emerald-400 uppercase">
              Confirm Login PIN *
            </label>
            <input
              type="password"
              required
              maxLength={6}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Re-enter PIN"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono tracking-widest text-center text-xs sm:text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">
              Home State
            </label>
            <input
              type="text"
              maxLength={2}
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value.toUpperCase())}
              placeholder="TN"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-center text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
            >
              <option value="Club Match Competitor">Club Match Competitor</option>
              <option value="Long Range Precision Enthusiast">Long Range Precision Enthusiast</option>
              <option value="PRS Rimfire Shooter">PRS Rimfire Shooter</option>
              <option value="Certified Range Officer">Certified Range Officer</option>
              <option value="Novice Marksman">Novice Marksman</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-tactical-glow flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Issuing Member Credential...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Activate Membership & Enter Chat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function StandardInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading Member Onboarding...</p>
        </div>
      }
    >
      <StandardInviteContent />
    </Suspense>
  );
}
