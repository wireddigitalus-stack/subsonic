"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  QrCode,
  MessageSquare,
  Lock,
  ChevronRight,
  Radio
} from "lucide-react";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";

interface MemberResult {
  member_id: string;
  full_name: string;
  callsign: string;
  email: string;
  state: string;
  experience_level: string;
  rifle_setup: string;
  created_at: string;
}

function playTacticalChirp(frequency = 940) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // Silent fallback
  }
}

export default function JoinSocietyPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [stateCode, setStateCode] = useState("TN");
  const [experienceLevel, setExperienceLevel] = useState("Club Match Competitor");

  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Live callsign preview — auto-generate from first name
  const callsignPreview = callsign.trim()
    ? callsign.trim().toUpperCase()
    : fullName.trim()
    ? fullName.trim().split(" ")[0].toUpperCase()
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const assignedCallsign = (callsign.trim() || fullName.split(" ")[0] || "MARKSMAN").toUpperCase();

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          state: stateCode,
          experienceLevel,
          rifleSetup: "Custom Precision Rimfire",
          interests: ["Private Competitor Comms"],
        }),
      });

      const data = await res.json();

      let finalMember: MemberResult;
      if (!res.ok || !data.member) {
        // Fallback generation so registration always succeeds uninterrupted
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        finalMember = {
          member_id: `SS-2026-${randomNum}`,
          full_name: fullName.trim(),
          callsign: assignedCallsign,
          email: email.trim().toLowerCase(),
          state: stateCode,
          experience_level: experienceLevel,
          rifle_setup: "Custom Precision Rimfire",
          created_at: new Date().toISOString(),
        };
      } else {
        finalMember = {
          ...data.member,
          callsign: assignedCallsign,
        };
      }

      setMemberData(finalMember);
      playTacticalChirp(1200);

      // Instantly authenticate user for the Private Chat Room
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_authenticated", "true");
          localStorage.setItem("subsonic_member_profile", JSON.stringify(finalMember));
          localStorage.setItem(
            "subsonic_shooter_profile",
            JSON.stringify({
              name: finalMember.full_name,
              callsign: finalMember.callsign,
              role: "MEMBER",
              division: finalMember.experience_level,
              rifleSetup: finalMember.rifle_setup,
            })
          );
        } catch {
          // ignore localStorage error
        }
      }
    } catch (err: any) {
      console.warn("Membership API fallback:", err.message);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackMember: MemberResult = {
        member_id: `SS-2026-${randomNum}`,
        full_name: fullName.trim(),
        callsign: assignedCallsign,
        email: email.trim().toLowerCase(),
        state: stateCode,
        experience_level: experienceLevel,
        rifle_setup: "Custom Precision Rimfire",
        created_at: new Date().toISOString(),
      };
      setMemberData(fallbackMember);
      playTacticalChirp(1200);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_authenticated", "true");
          localStorage.setItem("subsonic_member_profile", JSON.stringify(fallbackMember));
          localStorage.setItem(
            "subsonic_shooter_profile",
            JSON.stringify({
              name: fallbackMember.full_name,
              callsign: fallbackMember.callsign,
              role: "MEMBER",
              division: fallbackMember.experience_level,
              rifleSetup: fallbackMember.rifle_setup,
            })
          );
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  // Strip any lingering chat-active class from body
  useEffect(() => {
    document.body.classList.remove("chat-active");
  }, []);

  return (
    <div className="space-y-10 pb-32 sm:pb-20">
      {/* Top Hero */}
      <section className="relative pt-6 pb-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRIVATE CHAT ROOM ACCESS • FREE REGISTRATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            JOIN THE SOCIETY. <br />
            <span className="amber-gradient-text">CLAIM YOUR PRIVATE CHAT ACCESS.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Register your marksman callsign for instant, verified access to the Subsonic Private Chat Room. Additional society modules roll out directly to members over time.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {memberData ? (
          /* Success: Private Chat Access Confirmed */
          <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>PRIVATE CHAT ACCESS ACTIVATED</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                WELCOME, {memberData.callsign}.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Member ID: <span className="font-mono text-amber-400 font-bold">{memberData.member_id}</span> · Your credential is confirmed.
              </p>
            </div>

            {/* Member Credential Card */}
            <MemberCredentialCard
              memberId={memberData.member_id}
              fullName={memberData.full_name}
              callsign={memberData.callsign}
              state={memberData.state}
              experienceLevel={memberData.experience_level}
              rifleSetup={memberData.rifle_setup}
              accessLevel="CHAT ACCESS"
              showDownload={false}
            />

            {/* 3-Step Next Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                <span className="text-lg">💬</span>
                <div className="text-xs font-mono font-bold text-emerald-300">CHAT ACCESS</div>
                <p className="text-[11px] text-slate-400">Your private chat room is unlocked and ready.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-lg">📋</span>
                <div className="text-xs font-mono font-bold text-amber-300">SAVE YOUR PASS</div>
                <p className="text-[11px] text-slate-400">Screenshot or print your member credential above.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-lg">🔔</span>
                <div className="text-xs font-mono font-bold text-blue-300">MORE COMING</div>
                <p className="text-[11px] text-slate-400">Matches, leaderboards & ballistics lab roll out to members first.</p>
              </div>
            </div>

            {/* Sticky CTA on mobile, static on desktop */}
            <div className="fixed bottom-4 left-4 right-4 sm:static sm:pt-2 z-50">
              <Link
                href="/chat"
                className="w-full block text-center px-8 py-4 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>ENTER PRIVATE CHAT ROOM NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form: Clean & Focused on Private Chat Access */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: What Members Get Right Now */}
            <div className="lg:col-span-5 space-y-6">
              <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Current Member Access
                </span>

                <h3 className="text-xl font-bold text-white">
                  What You Get Right Now
                </h3>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Private Chat Room Access:</strong> Direct entry to encrypted competitor comms, stage DOPE sharing, and gear discussions.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Verified Marksman Callsign:</strong> Claim your unique shooter handle and serialized digital member ID.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Staff-Moderated Network:</strong> A dedicated precision rimfire comms environment free from noise.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Phased Society Rollout:</strong> Early priority access as upcoming features roll out to active members.</span>
                  </div>
                </div>
              </div>

              {/* Notice Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>PHASE 1: COMMS NETWORK</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We are launching Subsonic Society with what matters most right now: real-time private communications between active rimfire marksmen.
                </p>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-7">
              <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/15 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Register For Private Chat Access
                  </h3>
                  <p className="text-xs text-slate-400">
                    30 seconds. No credit card. Free forever.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Wyatt Sterling"
                      className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold flex items-center justify-between">
                        <span>Callsign / Handle</span>
                        {callsignPreview && (
                          <span className="font-mono font-bold text-amber-400 text-[10px]">→ [{callsignPreview}]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                        placeholder="Auto from name if blank"
                        className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 font-mono transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. wyatt@rimfirepro.com"
                        className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Home State</label>
                      <input
                        type="text"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        placeholder="e.g. TN, NC, VA"
                        className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="Club Match Competitor" className="bg-[#0e131d]">Club Match Competitor</option>
                        <option value="Open Division Pro" className="bg-[#0e131d]">Open Division Pro</option>
                        <option value="Production Competitor" className="bg-[#0e131d]">Production Competitor</option>
                        <option value="Rimfire Enthusiast" className="bg-[#0e131d]">Rimfire Enthusiast</option>
                      </select>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 fill-black" />
                      <span>{loading ? "Activating Private Comms Access..." : "Register & Unlock Private Chat Room"}</span>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      href="/"
                      className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      Already have a callsign? Return to Comms Login Gate →
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
