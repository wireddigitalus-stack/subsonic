"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Trophy,
  Target,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Upload,
  Camera,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Crosshair,
  AlertTriangle,
  Award,
  Zap,
  Share2,
  FileCheck,
  Check,
  FileText
} from "lucide-react";
import { compressImageFile, CompressionResult } from "@/lib/imageCompression";
import { CallsignInput } from "@/components/common/CallsignInput";

const POPULAR_SPONSORS = [
  "Modacam Custom Rifles",
  "Vudoo Gun Works",
  "Lapua Rimfire",
  "Zero Compromise Optic (ZCO)",
  "MDT ACC Elite",
  "RimX Precision",
  "Proof Research",
  "Tangent Theta",
  "Bix'n Andy",
  "Foundation Stocks",
  "SK Ammunition",
  "Vortex Optics",
  "Hawkins Precision",
  "Harrell Precision",
  "Leupold",
  "Spuhr",
];

const PRESET_ACCOLADES = [
  "TEAM USA 🇺🇸",
  "NATIONAL CHAMPION 🏆",
  "APPALACHIAN CUP 1ST 🥇",
  "REGIONAL PODIUM FINISHER ⭐",
  "TOP LADY MARKSMAN 🎯",
  "PRODUCTION CLASS WINNER 🎖️",
  "CERTIFIED RANGE OFFICER 🛡️",
  "MASTER CLASS SHOOTER 👑",
];

function ProInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [codeValid, setCodeValid] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [inviteMeta, setInviteMeta] = useState<any | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [isCallsignValid, setIsCallsignValid] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [division, setDivision] = useState("Open Division Pro");
  const [homeRange, setHomeRange] = useState("The Hideout, Bristol, TN");
  const [ranking, setRanking] = useState("");
  const [podiums, setPodiums] = useState<number>(0);
  const [accolades, setAccolades] = useState<string[]>([]);
  const [customAccolade, setCustomAccolade] = useState("");
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [customSponsor, setCustomSponsor] = useState("");

  // Photos & Compression
  const [headshotResult, setHeadshotResult] = useState<CompressionResult | null>(null);
  const [actionPhotoResult, setActionPhotoResult] = useState<CompressionResult | null>(null);
  const [compressingHeadshot, setCompressingHeadshot] = useState(false);
  const [compressingAction, setCompressingAction] = useState(false);

  // Submission State
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Validate invite code on mount if in URL
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
        setCodeValid(true);
        setInviteCode(clean);
        setInviteMeta(data);
        if (
          data.recipientName && 
          !fullName && 
          !data.recipientName.toLowerCase().includes("vip") && 
          !data.recipientName.toLowerCase().includes("competitor") && 
          !data.recipientName.toLowerCase().includes("invitational")
        ) {
          setFullName(data.recipientName);
        }
      }
    } catch (err: any) {
      setCodeError(err.message || "Network error validating invite code.");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleHeadshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressingHeadshot(true);
      // Compress with 1:1 aspect ratio targeting headshot portraits
      const result = await compressImageFile(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
        targetAspectRatio: 1.0,
      });
      setHeadshotResult(result);
    } catch (err) {
      alert("Error optimizing photo. Please try a different image.");
    } finally {
      setCompressingHeadshot(false);
    }
  };

  const handleActionPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressingAction(true);
      // Compress with wide aspect ratio targeting rifle rigs and barricades
      const result = await compressImageFile(file, {
        maxWidth: 1400,
        maxHeight: 900,
        quality: 0.84,
      });
      setActionPhotoResult(result);
    } catch (err) {
      alert("Error optimizing action photo. Please try a different image.");
    } finally {
      setCompressingAction(false);
    }
  };

  const toggleAccolade = (acc: string) => {
    setAccolades((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const addCustomAccolade = () => {
    if (!customAccolade.trim()) return;
    const clean = customAccolade.trim().toUpperCase();
    if (!accolades.includes(clean)) {
      setAccolades((prev) => [...prev, clean]);
      setCustomAccolade("");
    }
  };

  const toggleSponsor = (sp: string) => {
    setSponsors((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  const addCustomSponsor = () => {
    if (!customSponsor.trim()) return;
    const clean = customSponsor.trim();
    if (!sponsors.includes(clean)) {
      setSponsors((prev) => [...prev, clean]);
      setCustomSponsor("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !callsign.trim()) {
      setFormError("Please enter your Full Name and Tactical Callsign.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid Email Address. Email is required to complete sign up.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!phone.trim()) {
      setFormError("Please enter your Phone Number. Phone number is required to complete sign up.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!mailingAddress.trim()) {
      setFormError("Please enter your Mailing Address. A complete mailing address is required to complete sign up.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!isCallsignValid) {
      setFormError("The tactical callsign you entered is taken or reserved. Please choose an available callsign or select one of the suggested alternatives.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!/^\d{4}$/.test(pin.trim())) {
      setFormError("Please create a 4-digit login PIN code for chat access.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (pin.trim() !== pinConfirm.trim()) {
      setFormError("Login PIN codes do not match.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!agreeTerms) {
      setFormError("You must read and agree to the Terms of Use and platform conduct rules to publish your Pro Profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryImage = headshotResult?.dataUrl || "/images/SS-RWB-LOGO.png";
      const secondaryImage = actionPhotoResult?.dataUrl || primaryImage;

      // One server call does everything (invite check → profile → member → claim),
      // and only succeeds once the database has confirmed every step.
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inviteCode,
          fullName: fullName.trim(),
          callsign: callsign.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          mailingAddress: mailingAddress.trim(),
          pin: pin.trim(),
          division,
          homeRange,
          podiums: Number(podiums) || 0,
          ranking: ranking.trim(),
          accolades,
          sponsors,
          image: primaryImage,
          actionPhoto: secondaryImage,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (data.code === "CALLSIGN_TAKEN") setIsCallsignValid(false);
        throw new Error(data.error || "We couldn't finish creating your profile. Please try again.");
      }

      const savedShooter = data.shooter;
      const savedMember = data.member;

      // Save the session so the member lands in chat already signed in
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_authenticated", "true");
          localStorage.setItem("subsonic_pro_full_profile", JSON.stringify(savedShooter));
          localStorage.setItem(
            "subsonic_shooter_profile",
            JSON.stringify({
              name: savedShooter.name,
              callsign: savedShooter.callsign,
              division: savedShooter.division,
              rifleSetup: "",
              badgeText: "PRO SHOOTER",
              role: "PRO_COMPETITOR",
              image: savedShooter.image,
            })
          );
          localStorage.setItem("subsonic_member_profile", JSON.stringify(savedMember));
        } catch (e) { console.warn("localStorage profile warning:", e); }
      }

      // Straight to the Competitor Information Page, with a welcome banner + chat link
      router.push(`/competitor-packet?welcome=${encodeURIComponent(savedShooter.callsign)}`);
    } catch (err: any) {
      setFormError(err.message || "Failed generating your profile. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submissionSuccess) {
    const slug = submissionSuccess.id;
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 animate-fadeIn">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              PRO PROFILE GENERATED & PUBLISHED
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Welcome to The Society, <br />
              <span className="text-amber-400">{submissionSuccess.name}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Your official Pro Competitor Profile is now live with full AI-SEO indexing. 
              Your private chat key is active for the Chat Room.
            </p>
          </div>

          {/* Shooter Card Summary */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-400/50 bg-black shrink-0 relative">
              <img
                src={submissionSuccess.image}
                alt={submissionSuccess.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                  {submissionSuccess.callsign}
                </span>
                <span className="text-xs font-mono text-emerald-400">PIN: Saved</span>
              </div>
              <div className="font-bold text-white text-base truncate">{submissionSuccess.name}</div>
              <div className="text-xs text-slate-400 truncate">{submissionSuccess.division}</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/shooters/${slug}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <span>View Your Public SEO Profile</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <Link
              href="/competitor-packet"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300 hover:brightness-110 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 fill-black" />
              <span>Competitor Packet (Hotels & COF)</span>
            </Link>

            <Link
              href="/chat"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Enter Chat Room (Live)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shooters"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all text-center"
            >
              <span>View All Shooters</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GATE SCREEN: Must enter or validate invite code first
  if (!codeValid) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-tactical-glow space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
              PRO COMPETITOR VIP INVITATION ONLY
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              VIP MARKSMAN INTAKE
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              This onboarding area is reserved for competition shooters and sponsored pros. 
              Enter your invitation code to access the profile builder.
            </p>
          </div>

          {codeError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{codeError}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ENTER VIP CODE (e.g. SS-PRO-XXXX)"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/40 text-white font-mono text-sm tracking-wider uppercase text-center focus:outline-none focus:border-amber-400"
              />
            </div>

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
                  <span>Unlock VIP Profile Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
            Need an invite code? Contact match director{" "}
            <span className="text-white font-semibold">Allen Hurley</span> or email{" "}
            <a href="mailto:info@subsonicsociety.com" className="text-amber-400 hover:underline">
              info@subsonicsociety.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ONBOARDING QUESTIONNAIRE
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VIP Code Verified: {inviteCode}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-white/5 border border-white/10 text-slate-300">
            Auto-Generates /shooters/[callsign]
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          PRO COMPETITOR <br />
          <span className="amber-gradient-text">PROFILE BUILDER.</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Fill out your marksman questionnaire and profile details. Our engine automatically compresses 
          your photos, generates your private chat credentials, and publishes your dedicated SEO athlete profile.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs sm:text-sm font-mono flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Step 1: Tactical Identity & Personal Login PIN */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Section 1</span>
              <h2 className="text-lg font-black text-white">Shooter Identity & Chat Room Security</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Full Legal / Competition Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Wyatt Sterling"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <CallsignInput
              value={callsign}
              onChange={setCallsign}
              stateCode="TN"
              onValidationChange={(valid) => setIsCallsignValid(valid)}
              label="Tactical Callsign *"
              sublabel="Used in live chat & URL (/shooters/[callsign])"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center justify-between">
                <span>4-Digit Login PIN *</span>
                <span className="text-[10px] text-slate-400 font-normal">For logging into chat</span>
              </label>
              <input
                type="password"
                required
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="e.g. 7492"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono tracking-widest text-xs sm:text-sm text-center focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Confirm 4-Digit PIN *
              </label>
              <input
                type="password"
                required
                inputMode="numeric"
                maxLength={4}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="Re-enter PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono tracking-widest text-xs sm:text-sm text-center focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. shooter@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (423) 555-0192"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Mailing Address *
              </label>
              <input
                type="text"
                required
                value={mailingAddress}
                onChange={(e) => setMailingAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP Code"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Required for official competitor credentials and match registration.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Competition Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="Open Division Pro">Open Division Pro</option>
                <option value="Open Rimfire Pro">Open Rimfire Pro</option>
                <option value="Production Class">Production Class</option>
                <option value="Senior Division">Senior Division (55+)</option>
                <option value="Ladies Rimfire Division">Ladies Rimfire Division</option>
                <option value="Junior Marksman">Junior Marksman</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Home Club / Home Range
              </label>
              <input
                type="text"
                value={homeRange}
                onChange={(e) => setHomeRange(e.target.value)}
                placeholder="e.g. Holston Mountain Range, TN"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Regional or National Ranking
              </label>
              <input
                type="text"
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                placeholder="e.g. Southeast Champion • Rank #4"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-amber-400 uppercase">
                Career Podium Finishes
              </label>
              <input
                type="number"
                min={0}
                max={999}
                value={podiums}
                onChange={(e) => setPodiums(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-amber-400 font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Step 2: Smart Dual Photo Upload with AI Compression */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Section 2</span>
                <h2 className="text-lg font-black text-white">Smart Image Optimization (Up to 2 Photos)</h2>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Auto-Compress to &lt;150KB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo 1: Headshot Portrait */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  1. Marksman Portrait (1:1 Square)
                </span>
                {headshotResult && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>-{headshotResult.savingsPercent}% Reduced</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-zinc-950 shrink-0 relative flex items-center justify-center">
                  {headshotResult ? (
                    <img
                      src={headshotResult.dataUrl}
                      alt="Headshot Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-600" />
                  )}
                  {compressingHeadshot && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{headshotResult ? "Replace Headshot" : "Upload Headshot"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeadshotUpload}
                      className="hidden"
                    />
                  </label>

                  {headshotResult ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Size: <strong className="text-emerald-400">{headshotResult.compressedSizeFormatted}</strong> (was {headshotResult.originalSizeFormatted})</div>
                      <div>Resolution: {headshotResult.width}x{headshotResult.height}px WebP</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Smartphone photos will be automatically auto-cropped and compressed to 1:1 portrait.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Photo 2: Rifle Rig / Barricade Action */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                  2. Rifle Rig in Action (Wide)
                </span>
                {actionPhotoResult && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>-{actionPhotoResult.savingsPercent}% Reduced</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-zinc-950 shrink-0 relative flex items-center justify-center">
                  {actionPhotoResult ? (
                    <img
                      src={actionPhotoResult.dataUrl}
                      alt="Action Photo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Crosshair className="w-8 h-8 text-slate-600" />
                  )}
                  {compressingAction && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{actionPhotoResult ? "Replace Action Shot" : "Upload Action Shot"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleActionPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {actionPhotoResult ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Size: <strong className="text-emerald-400">{actionPhotoResult.compressedSizeFormatted}</strong> (was {actionPhotoResult.originalSizeFormatted})</div>
                      <div>Resolution: {actionPhotoResult.width}x{actionPhotoResult.height}px WebP</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Show your match jersey, barricade setup, or range action photo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Accolades & Sponsors */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Section 3</span>
              <h2 className="text-lg font-black text-white">Accolades & Official Sponsors</h2>
            </div>
          </div>

          {/* Accolades */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">
              Select Match Accolades & Titles
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ACCOLADES.map((acc) => {
                const selected = accolades.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccolade(acc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selected
                        ? "bg-amber-500 text-black shadow-tactical-glow"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    {acc}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1 max-w-md">
              <input
                type="text"
                value={customAccolade}
                onChange={(e) => setCustomAccolade(e.target.value)}
                placeholder="Add custom title (e.g. 2026 BRISTOL CHAMPION)"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomAccolade}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Sponsors */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">
              Select Factory & Equipment Sponsors
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SPONSORS.map((sp) => {
                const selected = sponsors.includes(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => toggleSponsor(sp)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      selected
                        ? "bg-blue-500 text-white font-bold shadow-tactical-glow"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1 max-w-md">
              <input
                type="text"
                value={customSponsor}
                onChange={(e) => setCustomSponsor(e.target.value)}
                placeholder="Add custom sponsor name..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:border-blue-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomSponsor}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Terms of Use & Platform Conduct Agreement */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-amber-500/50 bg-black/60 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer accent-amber-500 shrink-0"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              I agree to the{" "}
              <Link 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-400 font-bold hover:underline"
              >
                Subsonic Society Terms of Use &amp; Code of Conduct
              </Link>
              , including Cold Range safety rules and the strict zero-tolerance policy against buying, selling, or trading firearms or ammunition on this platform.
            </span>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-black text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>Ready to Publish Your Pro Profile?</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Instant Live</span>
            </div>
            <p className="text-xs text-slate-400">
              Your profile will be auto-generated at <code className="text-amber-400">/shooters/{callsign.toLowerCase() || "your-callsign"}</code> and your chat key activated.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !agreeTerms}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-tactical-glow flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Publishing Profile & Activating Chat Room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Publish Pro Profile & Enter Chat Room</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function ProInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading VIP Intake Portal...</p>
        </div>
      }
    >
      <ProInviteContent />
    </Suspense>
  );
}
