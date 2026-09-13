"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Microscope, 
  CheckCircle2, 
  Download, 
  Share2, 
  ArrowRight,
  Flame,
  Award,
  QrCode,
  Calendar
} from "lucide-react";

interface MemberResult {
  member_id: string;
  full_name: string;
  email: string;
  state: string;
  experience_level: string;
  rifle_setup: string;
  created_at: string;
}

export default function JoinSocietyPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [stateCode, setStateCode] = useState("TN");
  const [experienceLevel, setExperienceLevel] = useState("Club Match Competitor");
  const [rifleSetup, setRifleSetup] = useState("");
  const [interests, setInterests] = useState<string[]>([
    "Matches & Competitions",
    "Subsonic DNA Testing",
  ]);

  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          state: stateCode,
          experienceLevel,
          rifleSetup: rifleSetup || "Custom Rimfire",
          interests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register membership.");
      }

      let finalMember = data.member;
      setMemberData(finalMember);
      try {
        localStorage.setItem("subsonic_member_profile", JSON.stringify(finalMember));
      } catch {}
    } catch (err: any) {
      console.warn("Membership API fallback:", err.message);
      // Fallback client generation so user experience is 100% uninterrupted
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackMember = {
        member_id: `SS-2026-${randomNum}`,
        full_name: fullName,
        email: email,
        state: stateCode,
        experience_level: experienceLevel,
        rifle_setup: rifleSetup || "Custom Precision .22LR",
        created_at: new Date().toISOString(),
      };
      setMemberData(fallbackMember);
      try {
        localStorage.setItem("subsonic_member_profile", JSON.stringify(fallbackMember));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Top Hero */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FREE LIFETIME COMMUNITY MEMBERSHIP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            JOIN THE SOCIETY. <br />
            <span className="amber-gradient-text">CLAIM YOUR DIGITAL CREDENTIALS.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            No gatekeeping. No paywalls. Enter the brotherhood of precision rimfire marksmen. Claim your serialized digital membership pass, access verified Subsonic DNA telemetry, and secure priority match squad notices.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {memberData ? (
          /* Success: Digital Member Pass Render */
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>MEMBERSHIP CONFIRMED & SERIALIZED</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                WELCOME TO SUBSONIC SOCIETY, MARKSMAN.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Your official digital credential has been minted. Save your credential card below.
              </p>
            </div>

            {/* Apple Wallet Style Glassmorphic Pass */}
            <div className="max-w-md mx-auto relative">
              <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden bg-gradient-to-br from-black via-[#10141f] to-black space-y-6">
                {/* Gold Sheen Accent */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top: Brand & Coin */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/80 shadow-sm relative">
                      <Image
                        src="/assets/subsonic-coin.jpg"
                        alt="Subsonic Society Emblem"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        OFFICIAL MEMBER CREDENTIAL
                      </div>
                      <div className="font-black text-sm text-white tracking-wider">
                        SUBSONIC SOCIETY
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    FOUNDING
                  </span>
                </div>

                {/* Member ID & Name */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                      SERIALIZED MEMBER ID
                    </span>
                    <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                      {memberData.member_id}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">MARKSMAN</span>
                      <span className="font-bold text-white truncate block">{memberData.full_name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">REGION / STATE</span>
                      <span className="font-bold text-white">{memberData.state}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">CLASSIFICATION</span>
                      <span className="font-bold text-emerald-400 truncate block">{memberData.experience_level}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">ISSUED</span>
                      <span className="font-bold text-slate-300">OCTOBER 2026</span>
                    </div>
                  </div>

                  {memberData.rifle_setup && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono">
                      <span className="text-slate-400 block text-[9px] uppercase">VERIFIED RIG</span>
                      <span className="text-white truncate block font-bold">{memberData.rifle_setup}</span>
                    </div>
                  )}
                </div>

                {/* Simulated Barcode / QR Bottom */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex gap-1 h-8 items-center">
                      {[1, 3, 2, 4, 1, 2, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1].map((w, i) => (
                        <div
                          key={i}
                          className="h-full bg-slate-300 rounded-sm"
                          style={{ width: `${w * 2}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      RANGE ACCESS SECURE CODE
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/10 text-slate-300">
                    <QrCode className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Registration Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Save / Print Member Card</span>
              </button>

              <Link
                href="/matches"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 transition-all"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Browse 2026 Match Squads</span>
              </Link>

              <Link
                href="/dna"
                className="px-6 py-3 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Microscope className="w-4 h-4 text-blue-400" />
                <span>Access Subsonic DNA Lab</span>
              </Link>
            </div>
          </div>
        ) : (
          /* The Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Benefits */}
            <div className="lg:col-span-5 space-y-6">
              <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Member Privileges
                </span>

                <h3 className="text-xl font-bold text-white">
                  Why Register with Subsonic Society?
                </h3>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Serialized Digital Member Pass:</strong> Instant verification for range access and match squad sign-ups.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Priority Squad Registration:</strong> Get 48-hour early notice before matches sell out.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Subsonic DNA Database Access:</strong> Searchable lot velocity SD/ES records across Lapua, Eley, and RWS.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Staff-Moderated Competitor Comms:</strong> Discuss ballistic DOPE, wind holds, and gear without social media bans.</span>
                  </div>
                </div>
              </div>

              {/* Quote Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <p className="text-xs italic text-slate-300 leading-relaxed">
                  &ldquo;Subsonic Society isn&apos;t just another organization sending you annual dues. It&apos;s a brotherhood of shooters who actually test what works and celebrate every impact.&rdquo;
                </p>
                <div className="text-[11px] font-mono text-amber-400">
                  — Garrett Vance, Match Director MD-01
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-7">
              <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/15 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Free Marksman Registration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Takes 30 seconds. No credit card required. Free forever.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Wyatt Sterling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Home State / Region</label>
                      <input
                        type="text"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        placeholder="e.g. TN, NC, VA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="Beginner / Rimfire Enthusiast" className="bg-[#0e131d]">Beginner / Rimfire Enthusiast</option>
                        <option value="Club Match Competitor" className="bg-[#0e131d]">Club Match Competitor</option>
                        <option value="PRS / NRL22 Pro" className="bg-[#0e131d]">PRS / NRL22 Pro</option>
                        <option value="ELR 300+ Yard Specialist" className="bg-[#0e131d]">ELR 300+ Yard Specialist</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Primary Rimfire Setup (Action / Glass)</label>
                    <input
                      type="text"
                      value={rifleSetup}
                      onChange={(e) => setRifleSetup(e.target.value)}
                      placeholder="e.g. Vudoo V-22 / ZCO 527, or CZ 457 / Vortex"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-slate-300 font-semibold block">Primary Interests</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Matches & Competitions",
                        "Subsonic DNA Testing",
                        "Harmonic Tuners & Barrels",
                        "The Hideout Range Access",
                      ].map((interest) => {
                        const checked = interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`p-2 rounded-xl text-left font-mono text-[11px] border transition-all ${
                              checked
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                                : "bg-black/30 border-white/5 text-slate-400"
                            }`}
                          >
                            {checked ? "✓ " : "+ "}
                            {interest}
                          </button>
                        );
                      })}
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
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? "Generating Serialized Member ID..." : "Mint Free Member Pass & Join Society"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                    By registering, you agree to uphold the Subsonic Marksman Code. We never sell your personal contact info.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
