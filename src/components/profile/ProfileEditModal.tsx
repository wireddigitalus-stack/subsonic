"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  Crosshair,
  Shield,
  Trophy,
  Award,
  Loader2,
  Check,
  RefreshCw,
  Image as ImageIcon,
  User,
  Sliders,
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";
import { compressImageFile } from "@/lib/imageCompression";
import { getAvatarColor, getUserInitials, DARK_AVATAR_COLORS } from "@/lib/avatar-colors";
import { playTacticalChirp } from "@/lib/chat-audio";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedShooter: ShooterProfile) => void;
  initialShooter?: any;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSaved,
  initialShooter,
}: ProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<"PHOTOS" | "INTEL" | "RIG" | "SPONSORS">("PHOTOS");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [division, setDivision] = useState("Open Division Pro");
  const [homeRange, setHomeRange] = useState("The Hideout, Bristol, TN");
  const [quote, setQuote] = useState("");
  const [headshotPhoto, setHeadshotPhoto] = useState<string>("");
  const [actionPhoto, setActionPhoto] = useState<string>("");
  const [avatarColor, setAvatarColor] = useState<string>("");
  const [existingProfileData, setExistingProfileData] = useState<any>(null);

  // Rifle Setup
  const [rifleAction, setRifleAction] = useState("");
  const [barrel, setBarrel] = useState("");
  const [trigger, setTrigger] = useState("");
  const [chassis, setChassis] = useState("");
  const [optic, setOptic] = useState("");
  const [mount, setMount] = useState("");
  const [tuner, setTuner] = useState("");
  const [ammoLot, setAmmoLot] = useState("");

  // Accolades & Sponsors
  const [accoladesText, setAccoladesText] = useState("");
  const [sponsorsText, setSponsorsText] = useState("");

  // Image upload states
  const [isCompressingHeadshot, setIsCompressingHeadshot] = useState(false);
  const [isCompressingAction, setIsCompressingAction] = useState(false);

  const headshotInputRef = useRef<HTMLInputElement>(null);
  const actionInputRef = useRef<HTMLInputElement>(null);

  // Load profile upon opening
  useEffect(() => {
    if (!isOpen) return;

    let targetCallsign = initialShooter?.callsign || "";

    if (!targetCallsign && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("subsonic_shooter_profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          targetCallsign = parsed.callsign || "";
        }
      } catch {}
    }

    if (!targetCallsign) {
      targetCallsign = "SUBX"; // Default fallback
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        // Try fetching latest from API
        const res = await fetch(`/api/shooters?target=${encodeURIComponent(targetCallsign)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.shooter) {
            populateForm(data.shooter);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed fetching shooter from API:", err);
      }

      // Fallback to local storage or initialShooter
      if (initialShooter) {
        populateForm(initialShooter);
      } else if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("subsonic_pro_full_profile") || localStorage.getItem("subsonic_shooter_profile");
          if (raw) populateForm(JSON.parse(raw));
        } catch {}
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [isOpen, initialShooter]);

  const populateForm = (p: any) => {
    setExistingProfileData(p);
    setName(p.name || "Allen Hurley");
    setCallsign((p.callsign || "SUBX").toUpperCase());
    setDivision(p.division || "Owner Admin / Executive");
    setHomeRange(p.homeRange || "The Hideout, Bristol, TN");
    setQuote(p.quote || "We built The Hideout because rimfire precision deserves a home that doesn't cut corners. Said. Done.");
    setHeadshotPhoto(p.image && p.image !== "/images/SS-RWB-LOGO.png" ? p.image : "");
    setActionPhoto(p.actionPhoto && p.actionPhoto !== "/images/SS-RWB-LOGO.png" ? p.actionPhoto : "");
    setAvatarColor(p.avatarColor || "");

    const rig = (typeof p.rifleSetup === "object" && p.rifleSetup !== null) ? p.rifleSetup : {};
    const rigString = typeof p.rifleSetup === "string" ? p.rifleSetup : "";
    setRifleAction(rig.action || rigString || "Modacam Custom Precision V-22 Rimfire");
    setBarrel(rig.barrel || "22\" Custom Fluted Match Contour");
    setTrigger(rig.trigger || "TriggerTech Diamond Pro Curved (5 oz)");
    setChassis(rig.chassis || "MDT ACC Elite Carbon Inlay Custom");
    setOptic(rig.optic || "Zero Compromise Optic ZC527");
    setMount(rig.mount || "Spuhr 36mm Unimount");
    setTuner(rig.tuner || "Modacam Custom Harmonic Brake");
    setAmmoLot(rig.ammoLot || "Lapua Center-X Hand-Sorted (1,064 FPS)");

    setAccoladesText(Array.isArray(p.accolades) ? p.accolades.join(", ") : "FOUNDER 👑, MATCH HOST, OWNER ADMIN");
    setSponsorsText(Array.isArray(p.sponsors) ? p.sponsors.join(", ") : "Modacam Custom Rifles, Subsonic Society, Zero Compromise Optic, MDT");
  };

  // Image Upload Handlers with Automatic Compression
  const handleHeadshotFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingHeadshot(true);
    setErrorMessage(null);
    try {
      const result = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        targetAspectRatio: 1.0, // Square crop for headshot/avatar
      });
      setHeadshotPhoto(result.dataUrl);
      playTacticalChirp(1100);
    } catch (err: any) {
      setErrorMessage("Could not process headshot image. Please try another photo.");
    } finally {
      setIsCompressingHeadshot(false);
      if (headshotInputRef.current) headshotInputRef.current.value = "";
    }
  };

  const handleActionFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingAction(true);
    setErrorMessage(null);
    try {
      const result = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 0.85,
      });
      setActionPhoto(result.dataUrl);
      playTacticalChirp(1100);
    } catch (err: any) {
      setErrorMessage("Could not process action photo. Please try another image.");
    } finally {
      setIsCompressingAction(false);
      if (actionInputRef.current) actionInputRef.current.value = "";
    }
  };

  // Save changes to backend API + Local Storage + Broadcast
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !callsign.trim()) {
      setErrorMessage("Name and Callsign are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const cleanCallsign = callsign.trim().toUpperCase();
    const accolades = accoladesText.split(",").map((s) => s.trim()).filter(Boolean);
    const sponsors = sponsorsText.split(",").map((s) => s.trim()).filter(Boolean);

    const isAllen = cleanCallsign === "SUBX" || cleanCallsign === "ALLEN" || name.toLowerCase().includes("hurley");

    const payload = {
      id: isAllen ? "subx" : cleanCallsign.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: name.trim(),
      callsign: cleanCallsign,
      isProfileUpdate: true,
      isIntake: false,
      division: isAllen ? "Owner Admin / Executive" : division,
      ranking: isAllen ? "Founder • Subsonic Society" : "Verified Competitor",
      homeRange: homeRange.trim() || "The Hideout, Bristol, TN",
      email: existingProfileData?.email || initialShooter?.email || (isAllen ? "allen@modacamcustomrifles.com" : undefined),
      phone: existingProfileData?.phone || initialShooter?.phone || (isAllen ? "423-555-0100" : undefined),
      mailingAddress: existingProfileData?.mailingAddress || initialShooter?.mailingAddress || (isAllen ? "Bristol, TN" : undefined),
      quote: quote.trim() || "Precision rimfire in the Appalachian mountains requires absolute consistency and reading the true wind.",
      image: headshotPhoto || "/assets/subsonic-coin.jpg",
      actionPhoto: actionPhoto || headshotPhoto || "/assets/subsonic-coin.jpg",
      accolades: accolades.length > 0 ? accolades : ["COMPETITOR"],
      sponsors: sponsors.length > 0 ? sponsors : ["Subsonic Society"],
      rifleSetup: {
        action: rifleAction.trim() || "Precision Rimfire Action",
        barrel: barrel.trim() || "Match Contour",
        trigger: trigger.trim() || "Match Trigger",
        chassis: chassis.trim() || "Chassis",
        optic: optic.trim() || "Precision Scope",
        mount: mount.trim() || "Match Mount",
        tuner: tuner.trim() || "Brake/Tuner",
        ammoLot: ammoLot.trim() || "Subsonic Match",
      },
    };

    try {
      const res = await fetch("/api/shooters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      const savedShooter = data.shooter || payload;

      // Update LocalStorage for immediate cross-page sync
      if (typeof window !== "undefined") {
        try {
          const currentShooterRaw = localStorage.getItem("subsonic_shooter_profile");
          const currentShooter = currentShooterRaw ? JSON.parse(currentShooterRaw) : {};

          const merged = {
            ...currentShooter,
            ...savedShooter,
            name: payload.name,
            callsign: payload.callsign,
            division: payload.division,
            image: payload.image,
            actionPhoto: payload.actionPhoto,
            avatarColor: avatarColor || currentShooter.avatarColor,
            rifleSetup: `${payload.rifleSetup.action}${payload.rifleSetup.optic ? ` / ${payload.rifleSetup.optic}` : ""}`,
            badgeText: isAllen ? "OWNER ADMIN" : (currentShooter.badgeText || "PRO SHOOTER"),
            role: isAllen ? "OWNER_ADMIN" : (currentShooter.role || "PRO_COMPETITOR"),
          };

          localStorage.setItem("subsonic_shooter_profile", JSON.stringify(merged));
          localStorage.setItem("subsonic_pro_full_profile", JSON.stringify({ ...savedShooter, avatarColor }));

          // Cross-update member profile
          const memRaw = localStorage.getItem("subsonic_member_profile");
          const mem = memRaw ? JSON.parse(memRaw) : {};
          localStorage.setItem(
            "subsonic_member_profile",
            JSON.stringify({
              ...mem,
              member_id: isAllen ? "SS-PRO-SUBX" : (mem.member_id || `SS-PRO-${payload.callsign}`),
              full_name: payload.name,
              callsign: payload.callsign,
              experience_level: payload.division,
              rifle_setup: `${payload.rifleSetup.action} / ${payload.rifleSetup.optic}`,
              role: isAllen ? "OWNER_ADMIN" : (mem.role || "PRO_COMPETITOR"),
            })
          );

          // Dispatch event so Navbar, Chat, and Header re-render without page reload
          window.dispatchEvent(
            new CustomEvent("subsonic_profile_updated", {
              detail: merged,
            })
          );
        } catch (e) {
          console.warn("Storage sync warning:", e);
        }
      }

      setSaveSuccess(true);
      playTacticalChirp(1200);

      if (onSaved) {
        onSaved(savedShooter);
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentAvatarColorObj = getAvatarColor(avatarColor, callsign || name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Edit Profile & Photos
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {callsign || "SUBX"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Update your photos and competitor dossier across the entire platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 bg-black/20 px-3 sm:px-5 gap-1 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("PHOTOS")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "PHOTOS"
                ? "border-amber-400 text-amber-300 bg-amber-500/5 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Profile Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INTEL")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "INTEL"
                ? "border-amber-400 text-amber-300 bg-amber-500/5 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Shooter Intel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RIG")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "RIG"
                ? "border-amber-400 text-amber-300 bg-amber-500/5 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Rifle Rig</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SPONSORS")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "SPONSORS"
                ? "border-amber-400 text-amber-300 bg-amber-500/5 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sponsors & Bio</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage(null)} className="underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading competitor telemetry...</p>
            </div>
          ) : (
            <form id="profile-edit-form" onSubmit={handleSave} className="space-y-5">
              {/* TAB 1: PHOTOS */}
              {activeTab === "PHOTOS" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Slot 1: Headshot / Portrait Photo */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-white uppercase tracking-wide">
                            Headshot / Avatar Portrait
                          </label>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            Primary
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Appears on your chat badge, navbar profile, and shooter card.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={headshotInputRef}
                          onChange={handleHeadshotFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isCompressingHeadshot}
                          onClick={() => headshotInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isCompressingHeadshot ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Optimizing...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>

                        {headshotPhoto && (
                          <button
                            type="button"
                            onClick={() => setHeadshotPhoto("")}
                            title="Remove Photo"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black shrink-0 shadow-lg flex items-center justify-center">
                        {headshotPhoto ? (
                          <img
                            src={headshotPhoto}
                            alt="Headshot Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center text-white"
                            style={{ backgroundColor: currentAvatarColorObj.hex }}
                          >
                            <span className="font-mono font-black text-xl">
                              {getUserInitials(name, callsign)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="font-semibold text-slate-200">
                          {headshotPhoto ? "✓ Custom Photo Loaded" : "Default Tactical Insignia Active"}
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Mobile camera capture and standard gallery images are automatically compressed into ultra-fast WebP format (under 100KB) for instant loading.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slot 2: Action / Match Photo */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-white uppercase tracking-wide">
                            Match Action / Rig Photo
                          </label>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                            Spotlight Hero
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Featured on your full tournament spotlight page (/shooters/{callsign.toLowerCase()}).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={actionInputRef}
                          onChange={handleActionFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isCompressingAction}
                          onClick={() => actionInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/15 disabled:opacity-50"
                        >
                          {isCompressingAction ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Optimizing...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-blue-400" />
                              <span>Upload Action Shot</span>
                            </>
                          )}
                        </button>

                        {actionPhoto && (
                          <button
                            type="button"
                            onClick={() => setActionPhoto("")}
                            title="Remove Action Photo"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Photo Preview */}
                    {actionPhoto ? (
                      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden border border-white/20 bg-black">
                        <img
                          src={actionPhoto}
                          alt="Action Rig Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full py-6 rounded-xl border border-dashed border-white/15 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
                        <span>No action shot uploaded yet</span>
                        <span className="text-[10px] text-slate-600">Falls back to your headshot portrait</span>
                      </div>
                    )}
                  </div>

                  {/* Slot 3: Avatar Insignia Color (When no photo or fallback) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Insignia Tone & Initials Color
                    </label>
                    <p className="text-xs text-slate-400">
                      Select your signature color badge:
                    </p>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {DARK_AVATAR_COLORS.map((c) => {
                        const isSelected = currentAvatarColorObj.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setAvatarColor(c.hex)}
                            title={c.name}
                            className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                              isSelected
                                ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-105"
                                : "hover:scale-105 border border-white/15"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPETITOR INTEL */}
              {activeTab === "INTEL" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-amber-400 font-bold uppercase">
                        Tactical Callsign
                      </label>
                      <input
                        type="text"
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Division / Executive Title
                      </label>
                      <input
                        type="text"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Home Range Facility
                      </label>
                      <input
                        type="text"
                        value={homeRange}
                        onChange={(e) => setHomeRange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                      Competitor Bio / Personal Motto
                    </label>
                    <textarea
                      rows={3}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="e.g. Precision rimfire in the Appalachian mountains... Said. Done."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: RIFLE RIG */}
              {activeTab === "RIG" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Precision Action
                      </label>
                      <input
                        type="text"
                        value={rifleAction}
                        onChange={(e) => setRifleAction(e.target.value)}
                        placeholder="e.g. Modacam Custom Precision V-22"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Match Barrel
                      </label>
                      <input
                        type="text"
                        value={barrel}
                        onChange={(e) => setBarrel(e.target.value)}
                        placeholder="e.g. 22&quot; Custom Fluted Match Contour"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Competition Chassis / Stock
                      </label>
                      <input
                        type="text"
                        value={chassis}
                        onChange={(e) => setChassis(e.target.value)}
                        placeholder="e.g. MDT ACC Elite Carbon Inlay Custom"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Competition Optic
                      </label>
                      <input
                        type="text"
                        value={optic}
                        onChange={(e) => setOptic(e.target.value)}
                        placeholder="e.g. Zero Compromise Optic ZC527"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Trigger
                      </label>
                      <input
                        type="text"
                        value={trigger}
                        onChange={(e) => setTrigger(e.target.value)}
                        placeholder="e.g. TriggerTech Diamond Pro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Tuner / Brake
                      </label>
                      <input
                        type="text"
                        value={tuner}
                        onChange={(e) => setTuner(e.target.value)}
                        placeholder="e.g. Modacam Harmonic Brake"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Ammunition Lot
                      </label>
                      <input
                        type="text"
                        value={ammoLot}
                        onChange={(e) => setAmmoLot(e.target.value)}
                        placeholder="e.g. Lapua Center-X (1,064 FPS)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SPONSORS & ACCOLADES */}
              {activeTab === "SPONSORS" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                      Presenting Sponsors & Partners (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={sponsorsText}
                      onChange={(e) => setSponsorsText(e.target.value)}
                      placeholder="e.g. Modacam Custom Rifles, Subsonic Society, Zero Compromise Optic, MDT"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                      Accolades & Career Honors (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={accoladesText}
                      onChange={(e) => setAccoladesText(e.target.value)}
                      placeholder="e.g. FOUNDER 👑, TEAM USA 🇺🇸, NATIONAL CHAMPION, MATCH HOST"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile & Photos Synced to Database!</span>
              </span>
            ) : (
              <span className="hidden sm:inline">All changes sync live across desktop and mobile</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="profile-edit-form"
              disabled={isSaving || saveSuccess}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                saveSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-tactical-glow active:scale-95"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving to DB...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
