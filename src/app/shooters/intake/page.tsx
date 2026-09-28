"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  Upload, 
  ArrowRight, 
  ChevronRight, 
  Trophy, 
  Target, 
  Crosshair, 
  ShieldCheck, 
  Award, 
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

const POPULAR_SPONSORS = [
  "Modacam Custom Rifles",
  "Vudoo Gun Works",
  "Lapua",
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

export default function ShooterIntakePage() {
  const [formData, setFormData] = useState({
    name: "",
    callsign: "",
    division: "Open Division Pro",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 0,
    ranking: "",
    featuredMatch: "The Subsonic Society Invitational 2026",
    quote: "",
    accolades: [] as string[],
    sponsors: [] as string[],
    customAccolade: "",
    customSponsor: "",
    action: "Vudoo V-22 (3-Lug Rimfire)",
    barrel: "Bartlein MTU 20\" Match (1:16 Twist)",
    trigger: "Bix'n Andy TacSport PRO (4.2 oz)",
    chassis: "MDT ACC Elite Chassis with Weights",
    optic: "Zero Compromise Optic ZC527 MPCT3X",
    mount: "Spuhr QDP-4002 0 MOA with Level",
    tuner: "Harrell Precision Custom Rimfire Tuner",
    ammoLot: "Lapua Center-X (1,062 FPS)",
    headshotUrl: "/assets/subsonic-coin.jpg",
    actionPhotoUrl: "/assets/subsonic-coin.jpg",
    interviewQ1: "In sudden mountain wind shifts, what is your go-to holdover strategy?",
    interviewA1: "",
  });

  const [headshotPreview, setHeadshotPreview] = useState<string>("/assets/subsonic-coin.jpg");
  const [actionPhotoPreview, setActionPhotoPreview] = useState<string>("/assets/subsonic-coin.jpg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle accolades
  const toggleAccolade = (acc: string) => {
    setFormData((prev) => {
      const exists = prev.accolades.includes(acc);
      return {
        ...prev,
        accolades: exists ? prev.accolades.filter((a) => a !== acc) : [...prev.accolades, acc],
      };
    });
  };

  const addCustomAccolade = () => {
    if (!formData.customAccolade.trim()) return;
    const clean = formData.customAccolade.trim().toUpperCase();
    if (!formData.accolades.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        accolades: [...prev.accolades, clean],
        customAccolade: "",
      }));
    }
  };

  // Toggle sponsors
  const toggleSponsor = (sp: string) => {
    setFormData((prev) => {
      const exists = prev.sponsors.includes(sp);
      return {
        ...prev,
        sponsors: exists ? prev.sponsors.filter((s) => s !== sp) : [...prev.sponsors, sp],
      };
    });
  };

  const addCustomSponsor = () => {
    if (!formData.customSponsor.trim()) return;
    const clean = formData.customSponsor.trim();
    if (!formData.sponsors.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        sponsors: [...prev.sponsors, clean],
        customSponsor: "",
      }));
    }
  };

  // Handle image uploads (base64 data URL preview)
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, target: "headshot" | "actionPhoto") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image is larger than 8MB. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === "headshot") {
        setHeadshotPreview(dataUrl);
        setFormData((prev) => ({ ...prev, headshotUrl: dataUrl }));
      } else {
        setActionPhotoPreview(dataUrl);
        setFormData((prev) => ({ ...prev, actionPhotoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.callsign.trim()) {
      setErrorMessage("Please enter both your Full Name and Tactical Callsign.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        callsign: formData.callsign,
        division: formData.division,
        homeRange: formData.homeRange,
        podiums: Number(formData.podiums) || 0,
        ranking: formData.ranking || `${formData.division} Competitor`,
        featuredMatch: formData.featuredMatch,
        quote: formData.quote || "Precision rimfire demands absolute trust in your elevation DOPE and wind read.",
        accolades: formData.accolades.length > 0 ? formData.accolades : ["COMPETITOR"],
        sponsors: formData.sponsors.length > 0 ? formData.sponsors : ["Subsonic Society"],
        image: formData.headshotUrl,
        actionPhoto: formData.actionPhotoUrl,
        rifleSetup: {
          action: formData.action,
          barrel: formData.barrel,
          trigger: formData.trigger,
          chassis: formData.chassis,
          optic: formData.optic,
          mount: formData.mount,
          tuner: formData.tuner,
          ammoLot: formData.ammoLot,
        },
        interview: [
          {
            question: formData.interviewQ1,
            answer: formData.interviewA1 || "I focus on rear bag support, verify zero before the clock starts, and let the dope work.",
          }
        ],
      };

      const res = await fetch("/api/shooters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed saving shooter profile");
      }

      const data = await res.json();
      setSubmissionSuccess(data.shooter);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong saving the profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>OFFICIAL COMPETITOR PROFILE INTAKE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          BUILD YOUR <span className="amber-gradient-text">SHOOTER PROFILE</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome competitors. Complete this quick 2-minute questionnaire with your rifle rig, accolades, and sponsors. The system will auto-generate your official Subsonic Society digital shooter card.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {submissionSuccess && (
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-950/40 via-black/80 to-emerald-950/40 space-y-6 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ✓ PROFILE GENERATED SUCCESSFULLY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {submissionSuccess.name} <span className="text-amber-400">[{submissionSuccess.callsign}]</span>
              </h2>
              <p className="text-xs text-slate-300">
                Your profile has been published to the official Subsonic Marksmen roster.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/shooters?id=${submissionSuccess.id}`}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-tactical-glow transition-all"
            >
              <span>View Your Live Profile Card →</span>
            </Link>
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setFormData((prev) => ({
                  ...prev,
                  name: "",
                  callsign: "",
                  podiums: 0,
                  quote: "",
                  interviewA1: "",
                }));
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all"
            >
              Submit Another Shooter (+28 Batch)
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Shooter Identity */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Competitor Identity</h3>
              <p className="text-xs text-slate-400">Name, callsign, and division</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                FULL NAME <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wyatt Sterling"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                TACTICAL CALLSIGN / HANDLE <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.callsign}
                onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                placeholder="e.g. GHOST or APEX-22"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm font-mono uppercase focus:border-amber-400 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                COMPETITION DIVISION
              </label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none transition-colors"
              >
                <option value="Open Division Pro">Open Division Pro</option>
                <option value="Production Division">Production Division</option>
                <option value="Senior Master Class (55+)">Senior Master Class (55+)</option>
                <option value="Top Lady Marksman">Top Lady Marksman</option>
                <option value="Junior Competitor (&lt;18)">Junior Competitor (&lt;18)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                HOME RANGE & STATE
              </label>
              <input
                type="text"
                value={formData.homeRange}
                onChange={(e) => setFormData({ ...formData, homeRange: e.target.value })}
                placeholder="e.g. Holston Range, Bristol, TN"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Special Accolades & Accomplishments */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Accolades & Accomplishments</h3>
              <p className="text-xs text-slate-400">Team USA, national rankings, and podium finishes</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-300 font-bold block">
              SELECT PRESET ACCOLADES (Click to toggle badges)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ACCOLADES.map((acc) => {
                const isSelected = formData.accolades.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccolade(acc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-tactical-glow scale-105"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{acc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Accolade input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={formData.customAccolade}
                onChange={(e) => setFormData({ ...formData, customAccolade: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAccolade(); } }}
                placeholder="Or add custom accolade (e.g. 2025 VIRGINIA STATE CHAMPION)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
              <button
                type="button"
                onClick={addCustomAccolade}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                CAREER PODIUMS COUNT (1st / 2nd / 3rd)
              </label>
              <input
                type="number"
                min="0"
                value={formData.podiums}
                onChange={(e) => setFormData({ ...formData, podiums: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                HIGHLIGHT RANKING TITLE
              </label>
              <input
                type="text"
                value={formData.ranking}
                onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                placeholder="e.g. National Rank #4 • Appalachian Cup 1st"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Sponsors */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sponsors & Industry Affiliations</h3>
              <p className="text-xs text-slate-400">Give props to the brands supporting your shooting</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-300 font-bold block">
              SELECT SPONSORS (Click to add)
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SPONSORS.map((sp) => {
                const isSelected = formData.sponsors.includes(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => toggleSponsor(sp)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-sm scale-105"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{sp}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={formData.customSponsor}
                onChange={(e) => setFormData({ ...formData, customSponsor: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSponsor(); } }}
                placeholder="Or type custom sponsor name..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-amber-400 outline-none"
              />
              <button
                type="button"
                onClick={addCustomSponsor}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors"
              >
                + Add Sponsor
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Rifle Rig Specifications */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rifle Rig & Equipment Build</h3>
              <p className="text-xs text-slate-400">Detailed component review for the marksmen community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">ACTION</label>
              <input
                type="text"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="e.g. Vudoo V-22 / RimX / CZ 457"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">BARREL</label>
              <input
                type="text"
                value={formData.barrel}
                onChange={(e) => setFormData({ ...formData, barrel: e.target.value })}
                placeholder='e.g. Bartlein MTU 20" Match'
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">TRIGGER</label>
              <input
                type="text"
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                placeholder="e.g. Bix'n Andy / TriggerTech (4.5 oz)"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">CHASSIS / STOCK</label>
              <input
                type="text"
                value={formData.chassis}
                onChange={(e) => setFormData({ ...formData, chassis: e.target.value })}
                placeholder="e.g. MDT ACC Elite / Foundation"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">OPTIC</label>
              <input
                type="text"
                value={formData.optic}
                onChange={(e) => setFormData({ ...formData, optic: e.target.value })}
                placeholder="e.g. ZCO 527 / Tangent Theta / Razor"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">MATCH AMMUNITION</label>
              <input
                type="text"
                value={formData.ammoLot}
                onChange={(e) => setFormData({ ...formData, ammoLot: e.target.value })}
                placeholder="e.g. Lapua Center-X (1,062 FPS)"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-amber-300 text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Photos (Headshot + Action Rig) */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Photos (Portrait & Rifle Rig)</h3>
              <p className="text-xs text-slate-400">Upload 2 photos or snap directly from your phone camera</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Photo 1: Headshot */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4 text-center">
              <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
                PHOTO 1: SHOOTER HEADSHOT / PORTRAIT
              </span>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/80 mx-auto relative shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-black">
                <Image
                  src={headshotPreview}
                  alt="Headshot Preview"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Headshot Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e, "headshot")}
                  />
                </label>
                <p className="text-[10px] text-slate-400">JPG or PNG from phone or device</p>
              </div>
            </div>

            {/* Photo 2: Action Photo */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4 text-center">
              <span className="text-xs font-mono font-bold text-cyan-400 block uppercase">
                PHOTO 2: RIFLE RIG / BARRICADE ACTION
              </span>
              <div className="w-full h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/60 mx-auto relative shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-black">
                <Image
                  src={actionPhotoPreview}
                  alt="Action Photo Preview"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Rifle / Action Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e, "actionPhoto")}
                  />
                </label>
                <p className="text-[10px] text-slate-400">Match barricade, bipod zero, or rifle photo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Bio & Interview Quote */}
        <div className="ios-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              6
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Shooter Philosophy & Strategy</h3>
              <p className="text-xs text-slate-400">Your brief quote and match strategy advice</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                BRIEF BIO / QUOTE ON SUBSONIC SHOOTING
              </label>
              <textarea
                rows={3}
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="e.g. Subsonic rimfire in the mountains is pure discipline. Watch the trees, trust your level, and commit."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-bold block">
                INTERVIEW QUESTION: {formData.interviewQ1}
              </label>
              <textarea
                rows={3}
                value={formData.interviewA1}
                onChange={(e) => setFormData({ ...formData, interviewA1: e.target.value })}
                placeholder="Share your answer or advice for fellow competitors..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm font-mono tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>{isSubmitting ? "GENERATING SHOOTER CARD..." : "AUTO-GENERATE SHOOTER PROFILE CARD"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[11px] font-mono text-slate-500 mt-3">
            Submissions are instantly published to the Subsonic Society public roster.
          </p>
        </div>
      </form>
    </div>
  );
}
