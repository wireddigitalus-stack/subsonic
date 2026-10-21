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
import { compressImageFile, ensureCompressedDataUrl, CompressionResult } from "@/lib/imageCompression";
import { CallsignInput } from "@/components/common/CallsignInput";

const POPULAR_SPONSORS = [
  "Modacam Custom Rifles",
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

  const queryCodeParam = (searchParams.get("code") || "").trim().toUpperCase();
  const isInstantKnownCode =
    queryCodeParam === "SS-PRO-ZKHZ" ||
    queryCodeParam === "SS-PRO-V793" ||
    queryCodeParam === "SS-PRO-VIP2026" ||
    queryCodeParam === "SS-MBR-HIDE2026" ||
    (queryCodeParam.startsWith("SS-PRO-") && queryCodeParam.length >= 8) ||
    (queryCodeParam.startsWith("SS-MBR-") && queryCodeParam.length >= 8);

  const [inviteCode, setInviteCode] = useState(queryCodeParam);
  const [codeValid, setCodeValid] = useState(isInstantKnownCode);
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
  const [division, setDivision] = useState("Pro Shooter");
  const [homeRange, setHomeRange] = useState("The Hideout, Bristol, TN");
  const [ranking, setRanking] = useState("");
  const [podiums, setPodiums] = useState<number>(0);
  const [quote, setQuote] = useState("");

  // Rifle Build Specs (Required)
  const [rifleAction, setRifleAction] = useState("");
  const [barrel, setBarrel] = useState("");
  const [trigger, setTrigger] = useState("");
  const [chassis, setChassis] = useState("");
  const [optic, setOptic] = useState("");
  const [ammoLot, setAmmoLot] = useState("");

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

  // If user is already signed up / logged in on this device, verify profile still exists on server in the background
  useEffect(() => {
    if (typeof window === "undefined") return;
    const forceNew = searchParams.get("new") === "1";
    if (forceNew) {
      return;
    }

    const rawShooter = localStorage.getItem("subsonic_shooter_profile");
    const rawMember = localStorage.getItem("subsonic_member_profile");
    const rawFull = localStorage.getItem("subsonic_pro_full_profile");

    let savedProfileObj: any = null;
    try {
      for (const raw of [rawShooter, rawFull, rawMember]) {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.callsign && parsed.callsign !== "GUEST") {
            savedProfileObj = parsed;
            break;
          }
        }
      }
    } catch {}

    const cookieMatch = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("subsonic_member_callsign="));
    const cookieCallsign = cookieMatch ? decodeURIComponent(cookieMatch.split("=")[1] || "").trim().toUpperCase() : "";
    const candidateCallsign = (savedProfileObj?.callsign || cookieCallsign || "").trim().toUpperCase();

    if (candidateCallsign && candidateCallsign !== "GUEST") {
      if (["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN"].includes(candidateCallsign)) {
        localStorage.setItem("subsonic_chat_authenticated", "true");
        window.location.replace("/");
        return;
      }

      fetch(`/api/shooters?slug=${encodeURIComponent(candidateCallsign.toLowerCase())}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.shooter) {
            const s = data.shooter;
            const rigStr =
              typeof s.rifleSetup === "object" && s.rifleSetup
                ? [s.rifleSetup.action, s.rifleSetup.optic].filter(Boolean).join(" / ")
                : s.rifleSetup || "Precision Rimfire";
            try {
              localStorage.setItem(
                "subsonic_shooter_profile",
                JSON.stringify({
                  name: s.name || candidateCallsign,
                  callsign: (s.callsign || candidateCallsign).toUpperCase(),
                  role: "PRO_COMPETITOR",
                  division: s.division || "Open Division Pro",
                  rifleSetup: rigStr,
                  badgeText: "PRO SHOOTER",
                  image: s.image,
                })
              );
              const { actionPhoto: _omit, ...lightShooter } = s;
              localStorage.setItem("subsonic_pro_full_profile", JSON.stringify(lightShooter));
              localStorage.setItem("subsonic_chat_authenticated", "true");
            } catch {}
            window.location.replace("/");
          } else {
            // Profile was deleted on the server — clear stale local session so user can register fresh!
            try {
              localStorage.removeItem("subsonic_chat_authenticated");
              localStorage.removeItem("subsonic_shooter_profile");
              localStorage.removeItem("subsonic_member_profile");
              localStorage.removeItem("subsonic_pro_full_profile");
              document.cookie = "subsonic_member_callsign=; path=/; max-age=0";
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [router, searchParams]);

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

    // Instant client-side unlock for official Subsonic Society invite codes (especially master launch code SS-PRO-ZKHZ)
    const isKnownFormat =
      clean === "SS-PRO-ZKHZ" ||
      clean === "SS-PRO-V793" ||
      clean === "SS-PRO-VIP2026" ||
      clean === "SS-MBR-HIDE2026" ||
      (clean.startsWith("SS-PRO-") && clean.length >= 8) ||
      (clean.startsWith("SS-MBR-") && clean.length >= 8);

    if (isKnownFormat) {
      setCodeValid(true);
      setInviteCode(clean);
      setCodeError(null);
      setValidatingCode(false);
    } else {
      setValidatingCode(true);
      setCodeError(null);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      let localCallsign = "";
      if (typeof window !== "undefined") {
        try {
          const rawS = localStorage.getItem("subsonic_shooter_profile");
          if (rawS) localCallsign = JSON.parse(rawS)?.callsign || "";
        } catch {}
      }
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ code: clean, clientCallsign: localCallsign }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.staleSessionPurged && typeof window !== "undefined") {
        try {
          localStorage.removeItem("subsonic_chat_authenticated");
          localStorage.removeItem("subsonic_shooter_profile");
          localStorage.removeItem("subsonic_member_profile");
          localStorage.removeItem("subsonic_pro_full_profile");
        } catch {}
      }

      // If this device already registered and profile still exists, restore session & go straight to Home (/)
      if (data.alreadyClaimed && data.shooter) {
        if (typeof window !== "undefined") {
          try {
            const s = data.shooter;
            const rigStr =
              typeof s.rifleSetup === "object" && s.rifleSetup
                ? [s.rifleSetup.action, s.rifleSetup.optic].filter(Boolean).join(" / ")
                : s.rifleSetup || "Precision Rimfire";
            localStorage.setItem(
              "subsonic_shooter_profile",
              JSON.stringify({
                name: s.name || data.claimedCallsign,
                callsign: (s.callsign || data.claimedCallsign || "").toUpperCase(),
                role: "PRO_COMPETITOR",
                division: s.division || "Open Division Pro",
                rifleSetup: rigStr,
                badgeText: "PRO SHOOTER",
                image: s.image,
              })
            );
            const { actionPhoto: _omit, ...lightShooter } = s;
            localStorage.setItem("subsonic_pro_full_profile", JSON.stringify(lightShooter));
            localStorage.setItem("subsonic_chat_authenticated", "true");
          } catch {}
          window.location.replace("/");
          return;
        }
      }

      if (!res.ok || !data.valid) {
        if (!isKnownFormat) {
          setCodeValid(false);
          setCodeError(data.error || "Invalid or expired invite code.");
        }
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
      clearTimeout(timeoutId);
      if (!isKnownFormat) {
        setCodeError("Invalid or unrecognized invite code. Please check your code and try again.");
      }
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
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.80,
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
        maxWidth: 1100,
        maxHeight: 800,
        quality: 0.78,
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

    if (!ranking.trim()) {
      setFormError("Please enter your Experience Level or Match Title (e.g. PRS Competitor, Club Marksman). All profile fields are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!headshotResult?.dataUrl) {
      setFormError("A profile headshot photo is required. Please upload a clear photo of yourself to publish your competitor profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!actionPhotoResult?.dataUrl) {
      setFormError("An action shooting photo is required. Please upload both a headshot and an action shooting photo to publish your competitor profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!agreeTerms) {
      setFormError("You must read and agree to the Terms of Use and platform conduct rules to publish your Pro Profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const primaryImage =
        headshotResult.dataUrl.length < 520_000
          ? headshotResult.dataUrl
          : await ensureCompressedDataUrl(headshotResult.dataUrl, 900, 0.78);
      const secondaryImage =
        actionPhotoResult.dataUrl.length < 520_000
          ? actionPhotoResult.dataUrl
          : await ensureCompressedDataUrl(actionPhotoResult.dataUrl, 1100, 0.76);

      // One server call does everything (invite check → profile → member → claim),
      // and only succeeds once the database has confirmed every step.
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          code: inviteCode,
          fullName: fullName.trim(),
          callsign: callsign.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          mailingAddress: mailingAddress.trim(),
          pin: pin.trim(),
          division,
          homeRange: homeRange.trim(),
          podiums: Number(podiums) || 0,
          ranking: ranking.trim(),
          quote: quote.trim(),
          rifleSetup: {
            action: rifleAction.trim(),
            barrel: barrel.trim(),
            trigger: trigger.trim(),
            chassis: chassis.trim(),
            optic: optic.trim(),
            ammoLot: ammoLot.trim(),
          },
          accolades,
          sponsors,
          image: primaryImage,
          actionPhoto: secondaryImage,
        }),
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (data.code === "CALLSIGN_TAKEN") setIsCallsignValid(false);
        const fallbackMsg =
          res.status === 413
            ? "Your uploaded photo file size was too large. Please re-select your photo and submit again."
            : "We couldn't finish creating your profile. Please try again.";
        throw new Error(data.detail ? `${data.error} (${data.detail})` : (data.error || fallbackMsg));
      }

      const savedShooter = {
        ...data.shooter,
        image: data.shooter?.image || primaryImage,
      };
      const savedMember = data.member;

      // Save the session so the member lands in chat already signed in
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("subsonic_chat_authenticated", "true");
          localStorage.setItem(
            "subsonic_shooter_profile",
            JSON.stringify({
              name: savedShooter.name,
              callsign: savedShooter.callsign,
              division: savedShooter.division,
              rifleSetup: `${rifleAction.trim()} / ${optic.trim()}`,
              badgeText: "PRO SHOOTER",
              role: "PRO_COMPETITOR",
              image: primaryImage,
            })
          );
          localStorage.setItem("subsonic_member_profile", JSON.stringify(savedMember));
        } catch (e) {
          console.warn("localStorage session warning:", e);
        }
        try {
          const { actionPhoto: _omitActionPhoto, ...lightweightShooter } = savedShooter || {};
          localStorage.setItem("subsonic_pro_full_profile", JSON.stringify(lightweightShooter));
        } catch (e) {
          console.warn("localStorage full profile warning:", e);
        }
      }

      // Immediately show the success state and navigate to the Home / 2026 Invitational Page
      setSubmissionSuccess(savedShooter);
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        window.location.assign(`/?welcome=${encodeURIComponent(savedShooter.callsign)}`);
      } else {
        router.push(`/?welcome=${encodeURIComponent(savedShooter.callsign)}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err?.name === "AbortError";
      setFormError(
        isAbort
          ? "Connection timed out while uploading your photos. Please tap 'Publish Pro Profile' once more to finish."
          : err.message || "Failed generating your profile. Please try again."
      );
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-zinc-950/85 backdrop-blur-xl border-2 border-amber-500/40 shadow-tactical-glow space-y-6 text-center">
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

          <div className="pt-3 border-t border-white/10">
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Already Signed Up? Go to Home Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
                Regional or National Ranking / Title *
              </label>
              <input
                type="text"
                required
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                placeholder="e.g. Southeast Champion • PRS Rimfire Competitor"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-amber-400 uppercase">
                Career Podium Finishes *
              </label>
              <input
                type="number"
                required
                min={0}
                max={999}
                value={podiums}
                onChange={(e) => setPodiums(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-amber-400 font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                <span>Competitor Bio / Personal Quote</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional</span>
              </label>
              <textarea
                rows={2}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Share a brief competitor bio, shooting philosophy, or wind-reading quote for your spotlight card (optional)..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Competition Rifle Build & Ammunition Specs (Optional) */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Equipment Dossier (Optional)
                </span>
                <h3 className="text-sm sm:text-base font-black text-white uppercase">
                  Competition Rifle Build &amp; Ammunition
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-bold">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Rifle Action / Model
                </label>
                <input
                  type="text"
                  value={rifleAction}
                  onChange={(e) => setRifleAction(e.target.value)}
                  placeholder="e.g. RimX / Vudoo V-22 / CZ 457"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Barrel Specs
                </label>
                <input
                  type="text"
                  value={barrel}
                  onChange={(e) => setBarrel(e.target.value)}
                  placeholder="e.g. 22&quot; Bartlein / Modacam Custom"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Trigger
                </label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g. TriggerTech Diamond / Bix'n Andy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Chassis / Stock
                </label>
                <input
                  type="text"
                  value={chassis}
                  onChange={(e) => setChassis(e.target.value)}
                  placeholder="e.g. MDT ACC Elite / Foundation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Optic / Scope
                </label>
                <input
                  type="text"
                  value={optic}
                  onChange={(e) => setOptic(e.target.value)}
                  placeholder="e.g. ZCO 527 / Nightforce ATACR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Match Ammunition
                </label>
                <input
                  type="text"
                  value={ammoLot}
                  onChange={(e) => setAmmoLot(e.target.value)}
                  placeholder="e.g. Lapua Center-X / Eley Tenex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Shooter Headshot & Action Shooting Image Upload */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Section 2</span>
                <h2 className="text-lg font-black text-white">Shooter Photos (Headshot &amp; Action Shooting Image)</h2>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-bold">
              Both Photos Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo 1: Headshot Portrait */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    1. Shooter Headshot
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                    REQUIRED *
                  </span>
                </div>
                {headshotResult && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Uploaded</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 bg-zinc-950 shrink-0 relative flex items-center justify-center ${
                  headshotResult ? "border-emerald-500/60" : "border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                }`}>
                  {headshotResult ? (
                    <img
                      src={headshotResult.dataUrl}
                      alt="Headshot Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-amber-400 animate-pulse" />
                  )}
                  {compressingHeadshot && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-tactical-glow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{headshotResult ? "Replace Headshot Photo" : "Upload Headshot Photo *"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeadshotUpload}
                      className="hidden"
                    />
                  </label>

                  {headshotResult ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Size: <strong className="text-emerald-400">{headshotResult.compressedSizeFormatted}</strong></div>
                      <div>Resolution: {headshotResult.width}x{headshotResult.height}px</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-200/90 leading-snug">
                      <strong>Used on your public shooter profile:</strong> Upload a clear headshot photo of yourself.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Photo 2: Action Shooting Image */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                    2. Action Shooting Image
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                    REQUIRED *
                  </span>
                </div>
                {actionPhotoResult && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Uploaded</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 bg-zinc-950 shrink-0 relative flex items-center justify-center ${
                  actionPhotoResult ? "border-emerald-500/60" : "border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                }`}>
                  {actionPhotoResult ? (
                    <img
                      src={actionPhotoResult.dataUrl}
                      alt="Action Photo Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Crosshair className="w-8 h-8 text-blue-400 animate-pulse" />
                  )}
                  {compressingAction && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all shadow-tactical-glow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{actionPhotoResult ? "Replace Action Shooting Image" : "Upload Action Shooting Image *"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleActionPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {actionPhotoResult ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Size: <strong className="text-emerald-400">{actionPhotoResult.compressedSizeFormatted}</strong></div>
                      <div>Resolution: {actionPhotoResult.width}x{actionPhotoResult.height}px</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-blue-200/90 leading-snug">
                      <strong>Required for your profile &amp; media spotlight:</strong> Upload an action shooting photo of yourself on the firing line.
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
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProInviteContent />
    </Suspense>
  );
}
