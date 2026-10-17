"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  Crosshair,
  Trophy,
  Loader2,
  Check,
  Image as ImageIcon,
  User,
  Copy,
  ClipboardPaste,
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
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"PHOTOS" | "INTEL" | "RIG" | "SPONSORS">("PHOTOS");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

  // Form state
  const [shooterId, setShooterId] = useState("");
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [division, setDivision] = useState("Open Division Pro");
  const [ranking, setRanking] = useState("Pro Competitor");
  const [podiums, setPodiums] = useState<number>(0);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key handler so user can always close the modal with Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load profile upon opening
  useEffect(() => {
    if (!isOpen) return;

    setSaveSuccess(false);
    setIsSaving(false);
    setErrorMessage(null);
    setClipboardNotice(null);

    let targetCallsign = initialShooter?.callsign || initialShooter?.id || "";

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
      targetCallsign = "SUBX";
    }

    const loadProfile = async () => {
      // Populate immediately from initialShooter if provided so form is responsive
      if (initialShooter && (initialShooter.name || initialShooter.callsign)) {
        populateForm(initialShooter);
      }

      setIsLoading(true);
      try {
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

      if (initialShooter) {
        populateForm(initialShooter);
      } else if (typeof window !== "undefined") {
        try {
          const raw =
            localStorage.getItem("subsonic_pro_full_profile") ||
            localStorage.getItem("subsonic_shooter_profile");
          if (raw) populateForm(JSON.parse(raw));
        } catch {}
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [isOpen, initialShooter]);

  const populateForm = (p: any) => {
    setExistingProfileData(p);
    const call = (p.callsign || "").toUpperCase();
    const isRobUser =
      call === "RADAR" ||
      call === "ROB" ||
      call === "LTDAN" ||
      (p.name && p.name.toLowerCase().includes("neilson"));

    setShooterId(p.id || "");
    setName(p.name || (isRobUser ? "Rob Neilson" : "Allen Hurley"));
    setCallsign(call || (isRobUser ? "RADAR" : "SUBX"));
    setDivision(p.division || (isRobUser ? "Lead Developer & Tech Advisor" : "Open Division Pro"));
    setRanking(p.ranking || "Pro Competitor");
    setPodiums(typeof p.podiums === "number" ? p.podiums : Number(p.podiums) || 0);
    setHomeRange(p.homeRange || "The Hideout, Bristol, TN");
    setQuote(p.quote || "");
    setHeadshotPhoto(p.image && !p.image.includes("SS-RWB-LOGO") ? p.image : "");
    setActionPhoto(p.actionPhoto && !p.actionPhoto.includes("SS-RWB-LOGO") ? p.actionPhoto : "");
    setAvatarColor(p.avatarColor || "");

    const rig = typeof p.rifleSetup === "object" && p.rifleSetup !== null ? p.rifleSetup : {};
    const rigString = typeof p.rifleSetup === "string" ? p.rifleSetup : "";
    setRifleAction(rig.action || rigString || "");
    setBarrel(rig.barrel || "");
    setTrigger(rig.trigger || "");
    setChassis(rig.chassis || "");
    setOptic(rig.optic || "");
    setMount(rig.mount || "");
    setTuner(rig.tuner || "");
    setAmmoLot(rig.ammoLot || "");

    setAccoladesText(Array.isArray(p.accolades) ? p.accolades.join(", ") : "");
    setSponsorsText(Array.isArray(p.sponsors) ? p.sponsors.join(", ") : "");
  };

  // Format profile text for Copy/Paste pairing with Admin Dashboard
  const formatProfileClipboardText = () => {
    const lines = [
      `=== SUBSONIC SOCIETY SHOOTER PROFILE ===`,
      `Name: ${name || "N/A"}`,
      `Callsign: ${callsign || "N/A"}`,
      `Division: ${division || "Open Division"}`,
      `Ranking / Title: ${ranking || "Pro Competitor"}`,
      `Career Podiums: ${podiums ?? 0}`,
      `Home Range: ${homeRange || "The Hideout, Bristol TN"}`,
      `Accolades: ${accoladesText || "None"}`,
      `Sponsors: ${sponsorsText || "None"}`,
      `Rifle Action: ${rifleAction || "N/A"}`,
      `Barrel: ${barrel || "N/A"}`,
      `Trigger: ${trigger || "N/A"}`,
      `Chassis / Stock: ${chassis || "N/A"}`,
      `Optic: ${optic || "N/A"}`,
      `Ammo Lot: ${ammoLot || "N/A"}`,
      `Quote / Bio: "${quote || ""}"`,
      `Headshot Image: ${headshotPhoto || "None"}`,
      `Action Shot Banner: ${actionPhoto || "None"}`,
      `Profile URL: https://subsonic-omega.vercel.app/shooters/${shooterId || callsign.toLowerCase()}`,
      `========================================`,
    ];
    return lines.join("\n");
  };

  const handleCopyFullProfile = () => {
    const text = formatProfileClipboardText();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedProfile(true);
    setClipboardNotice("Full profile & images copied to clipboard!");
    setTimeout(() => {
      setCopiedProfile(false);
      setClipboardNotice(null);
    }, 3000);
  };

  const applyPastedProfileText = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;

    if (
      trimmed.startsWith("data:image/") ||
      /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(trimmed) ||
      trimmed.startsWith("/images/") ||
      trimmed.startsWith("/assets/")
    ) {
      if (!headshotPhoto) {
        setHeadshotPhoto(trimmed);
        setClipboardNotice("Pasted image into Headshot Portrait.");
      } else {
        setActionPhoto(trimmed);
        setClipboardNotice("Pasted image into Action Shot Banner.");
      }
      setTimeout(() => setClipboardNotice(null), 3000);
      return true;
    }

    if (
      !trimmed.includes("SUBSONIC SOCIETY") &&
      !trimmed.includes("Callsign:") &&
      !trimmed.includes("Rifle Action:") &&
      !trimmed.includes("Headshot Image:")
    ) {
      return false;
    }

    const extractLine = (label: string): string | undefined => {
      const regex = new RegExp(`^${label}:\\s*(.+)$`, "im");
      const match = trimmed.match(regex);
      if (!match) return undefined;
      const val = match[1].trim();
      if (val === "N/A" || val === "None") return "";
      return val;
    };

    const parsedName = extractLine("Name") ?? extractLine("Full Name");
    const parsedCallsign = extractLine("Callsign");
    const parsedDivision = extractLine("Division") ?? extractLine("Classification / Division");
    const parsedRanking = extractLine("Ranking / Title");
    const parsedPodiums = extractLine("Career Podiums");
    const parsedHomeRange = extractLine("Home Range");
    const parsedAccolades = extractLine("Accolades");
    const parsedSponsors = extractLine("Sponsors");
    const parsedAction = extractLine("Rifle Action");
    const parsedBarrel = extractLine("Barrel");
    const parsedTrigger = extractLine("Trigger");
    const parsedChassis = extractLine("Chassis / Stock") ?? extractLine("Chassis");
    const parsedOptic = extractLine("Optic");
    const parsedAmmo = extractLine("Ammo Lot");
    const parsedQuote = extractLine("Quote / Bio");
    const parsedHeadshot = extractLine("Headshot Image");
    const parsedActionShot = extractLine("Action Shot Banner");

    if (parsedName !== undefined) setName(parsedName);
    if (parsedCallsign !== undefined) setCallsign(parsedCallsign.toUpperCase());
    if (parsedDivision !== undefined) setDivision(parsedDivision);
    if (parsedRanking !== undefined) setRanking(parsedRanking);
    if (parsedPodiums !== undefined && !isNaN(Number(parsedPodiums))) setPodiums(Number(parsedPodiums));
    if (parsedHomeRange !== undefined) setHomeRange(parsedHomeRange);
    if (parsedAccolades !== undefined) setAccoladesText(parsedAccolades);
    if (parsedSponsors !== undefined) setSponsorsText(parsedSponsors);
    if (parsedAction !== undefined) setRifleAction(parsedAction);
    if (parsedBarrel !== undefined) setBarrel(parsedBarrel);
    if (parsedTrigger !== undefined) setTrigger(parsedTrigger);
    if (parsedChassis !== undefined) setChassis(parsedChassis);
    if (parsedOptic !== undefined) setOptic(parsedOptic);
    if (parsedAmmo !== undefined) setAmmoLot(parsedAmmo);
    if (parsedQuote !== undefined) setQuote(parsedQuote.replace(/^"|"$/g, ""));
    if (parsedHeadshot !== undefined && parsedHeadshot) setHeadshotPhoto(parsedHeadshot);
    if (parsedActionShot !== undefined && parsedActionShot) setActionPhoto(parsedActionShot);

    setClipboardNotice("Pasted full shooter profile & images from clipboard!");
    setTimeout(() => setClipboardNotice(null), 3000);
    return true;
  };

  const handlePasteFromClipboardButton = async (targetField?: "image" | "actionPhoto") => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      if (navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageType = item.types.find((t) => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              const result = await compressImageFile(blob);
              if (targetField === "actionPhoto") {
                setActionPhoto(result.dataUrl);
                setClipboardNotice("Pasted original image into Action Shot Banner.");
              } else if (targetField === "image") {
                setHeadshotPhoto(result.dataUrl);
                setClipboardNotice("Pasted original image into Headshot Portrait.");
              } else if (!headshotPhoto) {
                setHeadshotPhoto(result.dataUrl);
                setClipboardNotice("Pasted original image into Headshot Portrait.");
              } else {
                setActionPhoto(result.dataUrl);
                setClipboardNotice("Pasted original image into Action Shot Banner.");
              }
              setTimeout(() => setClipboardNotice(null), 3000);
              return;
            }
          }
        } catch {}
      }

      const text = await navigator.clipboard.readText();
      if (!text) return;
      if (
        targetField &&
        (text.trim().startsWith("data:image/") ||
          text.trim().startsWith("http") ||
          text.trim().startsWith("/"))
      ) {
        if (targetField === "actionPhoto") {
          setActionPhoto(text.trim());
          setClipboardNotice("Pasted Action Shot Banner.");
        } else {
          setHeadshotPhoto(text.trim());
          setClipboardNotice("Pasted Headshot Portrait.");
        }
        setTimeout(() => setClipboardNotice(null), 3000);
        return;
      }
      applyPastedProfileText(text);
    } catch {
      setErrorMessage("Press Cmd+V / Ctrl+V inside the modal to paste profile data or images.");
    }
  };

  const handleModalClipboardPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const result = await compressImageFile(file);
            if (!headshotPhoto) {
              setHeadshotPhoto(result.dataUrl);
              setClipboardNotice("Pasted original image into Headshot Portrait.");
            } else {
              setActionPhoto(result.dataUrl);
              setClipboardNotice("Pasted original image into Action Shot Banner.");
            }
            setTimeout(() => setClipboardNotice(null), 3000);
            return;
          }
        }
      }
    }

    const pastedText = e.clipboardData?.getData("text/plain") || "";
    if (
      pastedText &&
      (pastedText.includes("SUBSONIC SOCIETY") ||
        (pastedText.includes("Callsign:") && pastedText.includes("Rifle Action:")))
    ) {
      e.preventDefault();
      applyPastedProfileText(pastedText);
    }
  };

  // Image Upload Handlers (Original Unresized Image)
  const handleHeadshotFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingHeadshot(true);
    setErrorMessage(null);
    try {
      const result = await compressImageFile(file);
      setHeadshotPhoto(result.dataUrl);
      playTacticalChirp(1100);
    } catch {
      setErrorMessage("Could not load headshot image. Please try another photo.");
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
      const result = await compressImageFile(file);
      setActionPhoto(result.dataUrl);
      playTacticalChirp(1100);
    } catch {
      setErrorMessage("Could not load action photo. Please try another image.");
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

    const isRob =
      cleanCallsign === "RADAR" ||
      cleanCallsign === "ROB" ||
      cleanCallsign === "LTDAN" ||
      name.toLowerCase().includes("neilson");
    const isAllen =
      cleanCallsign === "SUBX" ||
      cleanCallsign === "ALLEN" ||
      name.toLowerCase().includes("hurley");

    const resolvedId =
      shooterId ||
      existingProfileData?.id ||
      initialShooter?.id ||
      (isRob
        ? "radar"
        : isAllen
        ? "subx"
        : cleanCallsign.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

    const payload = {
      id: resolvedId,
      name: name.trim(),
      callsign: cleanCallsign,
      isProfileUpdate: true,
      isIntake: false,
      division: division.trim() || "Open Division",
      ranking: ranking.trim() || (isRob ? "Owner • Lead Systems Developer" : isAllen ? "Founder • Subsonic Society" : "Verified Competitor"),
      podiums: Number(podiums) || existingProfileData?.podiums || 0,
      homeRange: homeRange.trim() || "The Hideout, Bristol, TN",
      email: existingProfileData?.email || initialShooter?.email,
      phone: existingProfileData?.phone || initialShooter?.phone,
      mailingAddress: existingProfileData?.mailingAddress || initialShooter?.mailingAddress,
      quote: quote.trim(),
      image: headshotPhoto || "",
      actionPhoto: actionPhoto || "",
      posterImage: existingProfileData?.posterImage || initialShooter?.posterImage,
      accolades: accolades.length > 0 ? accolades : existingProfileData?.accolades || [],
      sponsors: sponsors.length > 0 ? sponsors : existingProfileData?.sponsors || [],
      rifleSetup: {
        action: rifleAction.trim(),
        barrel: barrel.trim(),
        trigger: trigger.trim(),
        chassis: chassis.trim(),
        optic: optic.trim(),
        mount: mount.trim(),
        tuner: tuner.trim(),
        ammoLot: ammoLot.trim(),
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

      // Update LocalStorage if this is the currently logged-in user (or if no user is stored yet)
      if (typeof window !== "undefined") {
        try {
          const currentShooterRaw = localStorage.getItem("subsonic_shooter_profile");
          const currentShooter = currentShooterRaw ? JSON.parse(currentShooterRaw) : null;
          const isEditingSelf =
            !currentShooter ||
            !currentShooter.callsign ||
            currentShooter.callsign.toUpperCase() === cleanCallsign ||
            (initialShooter &&
              currentShooter.callsign.toUpperCase() === (initialShooter.callsign || "").toUpperCase());

          if (isEditingSelf) {
            const merged = {
              ...(currentShooter || {}),
              ...savedShooter,
              name: payload.name,
              callsign: payload.callsign,
              division: payload.division,
              image: payload.image,
              actionPhoto: payload.actionPhoto,
              avatarColor: avatarColor || currentShooter?.avatarColor,
              rifleSetup: `${payload.rifleSetup.action}${payload.rifleSetup.optic ? ` / ${payload.rifleSetup.optic}` : ""}`,
              badgeText: isRob
                ? "DEV ADVISOR"
                : isAllen
                ? "OWNER ADMIN"
                : currentShooter?.badgeText || "PRO SHOOTER",
              role: isRob
                ? "MASTER_OWNER"
                : isAllen
                ? "OWNER_ADMIN"
                : currentShooter?.role || "PRO_COMPETITOR",
            };

            localStorage.setItem("subsonic_shooter_profile", JSON.stringify(merged));
            localStorage.setItem(
              "subsonic_pro_full_profile",
              JSON.stringify({ ...savedShooter, avatarColor })
            );

            window.dispatchEvent(
              new CustomEvent("subsonic_profile_updated", {
                detail: merged,
              })
            );
          } else {
            window.dispatchEvent(
              new CustomEvent("subsonic_profile_updated", {
                detail: savedShooter,
              })
            );
          }
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
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const currentAvatarColorObj = getAvatarColor(avatarColor, callsign || name);

  const modalContent = (
    <div
      onPaste={handleModalClipboardPaste}
      onClick={() => onClose()}
      className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/60 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Edit Profile &amp; Photos
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {callsign || "SHOOTER"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Unified Competitor Editor • Paired with Admin Copy &amp; Paste
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePasteFromClipboardButton()}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Paste full profile or image from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullProfile}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Copy full profile & images to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedProfile ? "✓ Copied" : "Copy Profile"}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close Editor"
              title="Close Editor (Esc)"
              className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 bg-black/30 px-3 sm:px-5 gap-1 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("PHOTOS")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "SPONSORS"
                ? "border-amber-400 text-amber-300 bg-amber-500/5 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sponsors &amp; Bio</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {clipboardNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>{clipboardNotice}</span>
              <button
                type="button"
                onClick={() => setClipboardNotice(null)}
                className="underline ml-2 text-[11px]"
              >
                OK
              </button>
            </div>
          )}

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
                            Top-Aligned • Original Resolution
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Appears on your shooter profile card, chat badge, and navbar. Never cropped or resized.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          {isCompressingHeadshot ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              <span>Upload Original</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePasteFromClipboardButton("image")}
                          className="px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold cursor-pointer"
                        >
                          Paste
                        </button>

                        {headshotPhoto && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(headshotPhoto);
                                setClipboardNotice("Headshot image copied to clipboard.");
                                setTimeout(() => setClipboardNotice(null), 2500);
                              }}
                              className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-amber-300 font-mono text-xs font-bold cursor-pointer"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => setHeadshotPhoto("")}
                              title="Remove Photo"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black shrink-0 shadow-lg flex items-center justify-center">
                        {headshotPhoto ? (
                          <img
                            src={headshotPhoto}
                            alt="Headshot Preview"
                            className="w-full h-full object-cover object-top"
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

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="text-xs font-semibold text-slate-200">
                          {headshotPhoto ? "✓ Original Portrait Active (Top-Justified)" : "No Custom Portrait Uploaded"}
                        </div>
                        <input
                          type="text"
                          value={headshotPhoto}
                          onChange={(e) => setHeadshotPhoto(e.target.value)}
                          placeholder="Or paste image URL / data:image/..."
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Images are never cropped or resized and always align to the top so faces stay in frame.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slot 2: Action Shooting Image (Marketing / Admin Use) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-white uppercase tracking-wide">
                            Action Shooting Image
                          </label>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            Marketing / Admin Only
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Saved in Admin Dashboard for Subsonic Society marketing &amp; media (not shown on public profile).
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
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
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/15 disabled:opacity-50 cursor-pointer"
                        >
                          {isCompressingAction ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Upload Original</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePasteFromClipboardButton("actionPhoto")}
                          className="px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold cursor-pointer"
                        >
                          Paste
                        </button>

                        {actionPhoto && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(actionPhoto);
                                setClipboardNotice("Action shot banner copied to clipboard.");
                                setTimeout(() => setClipboardNotice(null), 2500);
                              }}
                              className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-amber-300 font-mono text-xs font-bold cursor-pointer"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionPhoto("")}
                              title="Remove Action Photo"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Photo Preview */}
                    {actionPhoto ? (
                      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/20 bg-black">
                        <img
                          src={actionPhoto}
                          alt="Action Rig Preview"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="w-full py-6 rounded-xl border border-dashed border-white/15 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
                        <span>No action shot banner uploaded yet</span>
                      </div>
                    )}

                    <input
                      type="text"
                      value={actionPhoto}
                      onChange={(e) => setActionPhoto(e.target.value)}
                      placeholder="Or paste action banner URL / data:image/..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Slot 3: Avatar Insignia Color */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Insignia Tone &amp; Initials Color
                    </label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {DARK_AVATAR_COLORS.map((c) => {
                        const isSelected = currentAvatarColorObj.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setAvatarColor(c.hex)}
                            title={c.name}
                            className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Division
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
                        Ranking / Title
                      </label>
                      <input
                        type="text"
                        value={ranking}
                        onChange={(e) => setRanking(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                        Career Podiums
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={podiums}
                        onChange={(e) => setPodiums(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                      Competitor Bio / Personal Motto
                    </label>
                    <textarea
                      rows={3}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="Competitor quote or bio..."
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
                        placeholder='e.g. 22" Custom Fluted Match Contour'
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
                        placeholder="e.g. MDT ACC Elite"
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
                        placeholder="e.g. Harmonic Tuner"
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
                        placeholder="e.g. Lapua Center-X"
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
                      Presenting Sponsors &amp; Partners (Comma-separated)
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
                      Accolades &amp; Career Honors (Comma-separated)
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
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile &amp; Photos Synced!</span>
              </span>
            ) : (
              <span className="hidden sm:inline">Original resolution preserved • Top-aligned</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              Close / Cancel
            </button>

            <button
              type="submit"
              form="profile-edit-form"
              disabled={isSaving || saveSuccess}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                saveSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-tactical-glow active:scale-95"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving...</span>
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

  return createPortal(modalContent, document.body);
}
