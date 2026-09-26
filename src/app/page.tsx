"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Unlock, 
  MessageSquare, 
  Radio, 
  ShieldCheck, 
  Crosshair, 
  ArrowRight, 
  Sparkles, 
  Key, 
  UserCheck, 
  Users, 
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  LayoutGrid,
  QrCode,
  X
} from "lucide-react";
import { FullHomePage } from "@/components/home/FullHomePage";
import { useDirectorMode } from "@/components/providers/DirectorModeProvider";
import { MemberCredentialCard } from "@/components/member/MemberCredentialCard";

interface ShooterPreset {
  name: string;
  callsign: string;
  division: string;
  rifleSetup: string;
  badgeText: string;
}

const SHOOTER_PRESETS: ShooterPreset[] = [
  {
    name: "Wyatt Sterling",
    callsign: "APEX-22",
    division: "Open Division Pro",
    rifleSetup: "Vudoo V-22 / Bartlein MTU 20\" / ZCO 527",
    badgeText: "PRO SHOOTER",
  },
  {
    name: "Kendra Cross",
    callsign: "COLDBORE",
    division: "Open Division Pro",
    rifleSetup: "RimX / Proof Carbon 22\" / Tangent Theta",
    badgeText: "TOP LADY PRO",
  },
  {
    name: "Eli McAllister",
    callsign: "DIALED",
    division: "Production Division",
    rifleSetup: "CZ 457 MTR / Vortex Razor Gen III",
    badgeText: "PRODUCTION",
  },
];

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

export default function HomePage() {
  const router = useRouter();

  // Shared Director Mode state (allows Allen to preview full site architecture)
  const { isDirectorMode, enableDirectorMode, disableDirectorMode } = useDirectorMode();

  // Form State
  const [callsign, setCallsign] = useState("APEX-22");
  const [shooterName, setShooterName] = useState("Wyatt Sterling");
  const [passcode, setPasscode] = useState("");
  const [division, setDivision] = useState("Open Division Pro");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formShake, setFormShake] = useState(false);

  // Digital Pass Modal State
  const [showPassModal, setShowPassModal] = useState(false);
  const [savedMemberData, setSavedMemberData] = useState<{
    memberId: string;
    fullName: string;
    callsign: string;
    state?: string;
    division?: string;
    rifleSetup?: string;
  } | null>(null);

  // Preload existing shooter profile if saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("subsonic_shooter_profile");
      const savedMember = localStorage.getItem("subsonic_member_profile");

      if (savedMember) {
        try {
          const parsed = JSON.parse(savedMember);
          setSavedMemberData({
            memberId: parsed.member_id || "SS-2026-0814",
            fullName: parsed.full_name || "Verified Marksman",
            callsign: parsed.callsign || "APEX-22",
            state: parsed.state || "TN",
            division: parsed.experience_level || "Open Division Pro",
            rifleSetup: parsed.rifle_setup || "Custom Precision Rimfire",
          });
        } catch {
          // ignore
        }
      }

      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.callsign) setCallsign(parsed.callsign);
          if (parsed.name) setShooterName(parsed.name);
          if (parsed.division) setDivision(parsed.division);

          if (!savedMember) {
            setSavedMemberData({
              memberId: parsed.member_id || "SS-2026-0814",
              fullName: parsed.name || "Wyatt Sterling",
              callsign: parsed.callsign || "APEX-22",
              state: "TN",
              division: parsed.division || "Open Division Pro",
              rifleSetup: parsed.rifleSetup || "Custom Precision Rimfire",
            });
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleSelectPreset = (preset: ShooterPreset) => {
    setCallsign(preset.callsign);
    setShooterName(preset.name);
    setDivision(preset.division);
    playTacticalChirp(1100);
  };

  const triggerFormError = (msg: string) => {
    setErrorMessage(msg);
    setFormShake(true);
    setTimeout(() => setFormShake(false), 600);
    playTacticalChirp(300);
  };

  const handleLoginToChat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!callsign.trim()) {
      triggerFormError("Please enter your tactical callsign or marksman handle.");
      return;
    }

    const VALID_PASSCODES = ["SUBSONIC2026", "subsonic2026"];
    if (!VALID_PASSCODES.includes(passcode.trim())) {
      triggerFormError("Invalid Member Key. Contact your Range Marshal for the access passcode.");
      return;
    }

    setIsSubmitting(true);
    playTacticalChirp(1200);

    const activeProfile = {
      name: shooterName.trim() || callsign.trim(),
      callsign: callsign.trim().toUpperCase(),
      role: "PRO_COMPETITOR",
      division,
      rifleSetup: "Custom Precision Rimfire",
      badgeText: division.includes("Production") ? "PRODUCTION" : "PRO SHOOTER",
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("subsonic_shooter_profile", JSON.stringify(activeProfile));
        localStorage.setItem("subsonic_chat_authenticated", "true");
        localStorage.setItem("subsonic_last_login", new Date().toISOString());
      } catch {
        // Fallback
      }
    }

    setTimeout(() => {
      router.push("/chat");
    }, 300);
  };


  // If Allen or team toggled full site preview
  if (isDirectorMode) {
    return (
      <div className="space-y-6">
        {/* Top Control Bar to switch back to focused view */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ios-glass rounded-2xl p-3 border border-amber-500/40 shadow-tactical-glow flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-amber-400 font-bold">DIRECTOR PREVIEW MODE:</span>
              <span className="text-white hidden sm:inline">Viewing Full Public Site Architecture</span>
            </div>
            <button
              onClick={() => disableDirectorMode()}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 fill-black" />
              <span>Back to Private Comms Portal</span>
            </button>
          </div>
        </div>

        <FullHomePage />
      </div>
    );
  }

  // FOCUSED EXPERIENCE: Clean Subsonic Landing with Login to Private Chat Room
  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative overflow-hidden">
      {/* Subtle Atmospheric Mountain Grid Background Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Brand Header & Challenge Coin Emblem */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.45)] bg-black mx-auto relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/assets/subsonic-coin.jpg"
                alt="Subsonic Society Official Challenge Coin"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>PRIVATE COMPETITOR NETWORK • BRISTOL, TN</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              SUBSONIC SOCIETY
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-widest text-amber-400 font-bold uppercase">
              PRECISION IS IN OUR DNA
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Encrypted match communications, stage DOPE drops, squad rotations, and real-time mountain firing alerts for verified marksmen.
          </p>
        </div>

        {/* Private Chat Room Login Card */}
        <div className={`ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow space-y-6 relative overflow-hidden transition-all ${formShake ? "animate-shake" : ""}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white">
                  PRIVATE CHAT ROOM LOGIN
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                  🟢 AES-256 SECURED COMMS LINK ACTIVE
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
              STAGE NET
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginToChat} className="space-y-4">
            {/* Callsign / Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                <span>Tactical Callsign / Handle *</span>
                <span className="text-[10px] text-amber-400 font-normal">Displays on Squad Line</span>
              </label>
              <div className="relative">
                <Crosshair className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                  placeholder="e.g. APEX-22 or GHOST"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-sm font-bold tracking-wider placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Shooter Legal / Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold">
                Marksman Full Name
              </label>
              <input
                type="text"
                value={shooterName}
                onChange={(e) => setShooterName(e.target.value)}
                placeholder="e.g. Wyatt Sterling"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Access Key / Passcode */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                <span>Member Access Passcode</span>
                <span className="text-[10px] text-slate-500 font-normal">Provided by Range Marshal</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Member Key..."
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Division Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold">
                Competition Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="Open Division Pro" className="bg-[#0e131d]">Open Division Pro</option>
                <option value="Production Division" className="bg-[#0e131d]">Production Division</option>
                <option value="Senior Division (55+)" className="bg-[#0e131d]">Senior Division (55+)</option>
                <option value="Ladies Rimfire Pro" className="bg-[#0e131d]">Ladies Rimfire Pro</option>
                <option value="Junior / Youth Division" className="bg-[#0e131d]">Junior / Youth Division</option>
              </select>
            </div>

            {/* Quick Shooter Preset Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Test Credentials:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SHOOTER_PRESETS.map((preset) => (
                  <button
                    key={preset.callsign}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      callsign === preset.callsign
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-slate-300"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold truncate">[{preset.callsign}]</div>
                    <div className="text-[9px] text-slate-400 truncate">{preset.name.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all mt-4"
            >
              <MessageSquare className="w-5 h-5 fill-black" />
              <span>{isSubmitting ? "AUTHENTICATING SQUAD LINE..." : "ENTER PRIVATE CHAT ROOM"}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </form>

          {/* Direct Access to Scannable Digital Member Pass & Barcode */}
          {savedMemberData && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playTacticalChirp(1050);
                  setShowPassModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all group"
              >
                <QrCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>VIEW MY DIGITAL MEMBER PASS &amp; QR CODE</span>
              </button>
            </div>
          )}

          {/* Card Footer Notes & Request Access */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            {/* Prominent Join CTA */}
            <Link
              href="/join"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-semibold text-xs transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>New here? Register for FREE Private Chat Access →</span>
            </Link>

            <div className="flex items-center justify-center text-xs text-slate-500">
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Range Marshal Assistance
              </Link>
            </div>
          </div>
        </div>


        {/* Discreet Director Mode Toggle for Allen's Laptop Review Tomorrow */}
        <div className="text-center pt-4 space-y-2">
          <button
            type="button"
            onClick={() => enableDirectorMode()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-all"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Director Preview: View Full Public Site</span>
          </button>
          <p className="text-[10px] font-mono text-slate-500">
            Subsonic Society • Holston Mountain Range • Bristol, Tennessee • Elev 3,420 FT
          </p>
        </div>
      </div>

      {/* Digital Member Pass Modal */}
      {showPassModal && savedMemberData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto ios-glass-card rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-tactical-glow relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  OFFICIAL DIGITAL MEMBER CREDENTIAL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberCredentialCard
              memberId={savedMemberData.memberId}
              fullName={savedMemberData.fullName}
              callsign={savedMemberData.callsign}
              state={savedMemberData.state || "TN"}
              experienceLevel={savedMemberData.division || "Open Division Pro"}
              rifleSetup={savedMemberData.rifleSetup}
              accessLevel="CHAT ACCESS"
              showDownload={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
