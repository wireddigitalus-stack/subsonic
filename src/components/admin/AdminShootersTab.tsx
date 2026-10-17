"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Trash2, 
  Trophy, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Edit3, 
  X, 
  Save, 
  Check, 
  Target, 
  ShieldCheck, 
  Key 
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

export interface AdminShootersTabProps {
  shooterProfiles: ShooterProfile[];
  shooterSearch: string;
  setShooterSearch: (s: string) => void;
  handleDeleteShooter: (id: string, name: string) => void;
  onShooterUpdated?: (updated: ShooterProfile) => void;
}

export function AdminShootersTab(props: AdminShootersTabProps) {
  const { 
    shooterProfiles, 
    shooterSearch, 
    setShooterSearch, 
    handleDeleteShooter,
    onShooterUpdated 
  } = props;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectingShooter, setInspectingShooter] = useState<ShooterProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<ShooterProfile>>({});
  const [isSavingShooter, setIsSavingShooter] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const readFileAsOriginalDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  };

  const formatShooterProfileText = (shooter: ShooterProfile | Partial<ShooterProfile>) => {
    const lines = [
      `=== SUBSONIC SOCIETY COMPETITOR PROFILE ===`,
      `ID: ${shooter.id || "N/A"}`,
      `Full Name: ${shooter.name || "N/A"}`,
      `Callsign: ${shooter.callsign || "N/A"}`,
      `Division: ${shooter.division || "Open Division Pro"}`,
      `Ranking: ${shooter.ranking || "PRO Competitor"}`,
      `Home Range: ${shooter.homeRange || "The Hideout, Bristol TN"}`,
      `Podiums: ${shooter.podiums ?? 0}`,
      shooter.pin ? `Chat Access PIN: ${shooter.pin}` : null,
      shooter.accolades && shooter.accolades.length > 0 ? `Accolades: ${shooter.accolades.join(", ")}` : null,
      shooter.sponsors && shooter.sponsors.length > 0 ? `Sponsors: ${shooter.sponsors.join(", ")}` : null,
      shooter.rifleSetup?.action ? `Rifle Action: ${shooter.rifleSetup.action}` : null,
      shooter.rifleSetup?.barrel ? `Barrel: ${shooter.rifleSetup.barrel}` : null,
      shooter.rifleSetup?.trigger ? `Trigger: ${shooter.rifleSetup.trigger}` : null,
      shooter.rifleSetup?.chassis ? `Chassis: ${shooter.rifleSetup.chassis}` : null,
      shooter.rifleSetup?.optic ? `Optic: ${shooter.rifleSetup.optic}` : null,
      shooter.rifleSetup?.ammoLot ? `Ammo Lot: ${shooter.rifleSetup.ammoLot}` : null,
      shooter.quote ? `Quote: "${shooter.quote}"` : null,
      shooter.image ? `Headshot Image: ${shooter.image}` : null,
      shooter.actionPhoto ? `Action Shot Banner: ${shooter.actionPhoto}` : null,
      shooter.posterImage ? `Poster Image: ${shooter.posterImage}` : null,
      `Status: ${shooter.status || "PUBLISHED"}`,
      `Registered: ${shooter.createdAt || "N/A"}`,
      `Live Profile URL: https://subsonicsociety.com/shooters?id=${shooter.id}`,
      `==========================================`
    ].filter(Boolean).join("\n");
    return lines;
  };

  const applyPastedProfileText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // If user pasted a direct image URL or data URL
    if (trimmed.startsWith("data:image/") || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i.test(trimmed) || trimmed.startsWith("/assets/") || trimmed.startsWith("/images/")) {
      setEditForm((prev) => ({
        ...prev,
        image: prev.image && prev.image !== "/images/SS-RWB-LOGO.png" ? prev.image : trimmed,
        actionPhoto: trimmed,
      }));
      setSaveNotice("Image pasted into shooter profile (original size preserved).");
      return;
    }

    const extractLine = (label: string): string | undefined => {
      const regex = new RegExp(`^${label}:\\s*(.+)$`, "mi");
      const m = trimmed.match(regex);
      return m ? m[1].trim() : undefined;
    };

    const fullName = extractLine("Full Name");
    const callsign = extractLine("Callsign");
    const division = extractLine("Division") || extractLine("Classification / Division");
    const ranking = extractLine("Ranking");
    const homeRange = extractLine("Home Range");
    const podiums = extractLine("Podiums") || extractLine("Career Podiums");
    const pin = extractLine("Chat Access PIN") || extractLine("Login PIN");
    const accolades = extractLine("Accolades");
    const sponsors = extractLine("Sponsors");
    const action = extractLine("Rifle Action") || extractLine("Primary Rifle Rig");
    const barrel = extractLine("Barrel");
    const trigger = extractLine("Trigger");
    const chassis = extractLine("Chassis");
    const optic = extractLine("Optic");
    const ammoLot = extractLine("Ammo Lot");
    const quoteRaw = extractLine("Quote");
    const headshotImg = extractLine("Headshot Image");
    const actionShotImg = extractLine("Action Shot Banner");
    const posterImg = extractLine("Poster Image");

    setEditForm((prev) => ({
      ...prev,
      name: fullName && fullName !== "N/A" ? fullName : prev.name,
      callsign: callsign && callsign !== "N/A" ? callsign.toUpperCase() : prev.callsign,
      division: division && division !== "N/A" ? division : prev.division,
      ranking: ranking && ranking !== "N/A" ? ranking : prev.ranking,
      homeRange: homeRange && homeRange !== "N/A" ? homeRange : prev.homeRange,
      podiums: podiums !== undefined ? parseInt(podiums, 10) || 0 : prev.podiums,
      pin: pin && pin !== "N/A" ? pin : prev.pin,
      accolades: accolades ? accolades.split(",").map((s) => s.trim()).filter(Boolean) : prev.accolades,
      sponsors: sponsors ? sponsors.split(",").map((s) => s.trim()).filter(Boolean) : prev.sponsors,
      quote: quoteRaw ? quoteRaw.replace(/^"|"$/g, "") : prev.quote,
      image: headshotImg || prev.image,
      actionPhoto: actionShotImg || prev.actionPhoto,
      posterImage: posterImg || prev.posterImage,
      rifleSetup: {
        action: action && action !== "N/A" ? action : prev.rifleSetup?.action || "",
        barrel: barrel && barrel !== "N/A" ? barrel : prev.rifleSetup?.barrel || "",
        trigger: trigger && trigger !== "N/A" ? trigger : prev.rifleSetup?.trigger || "",
        chassis: chassis && chassis !== "N/A" ? chassis : prev.rifleSetup?.chassis || "",
        optic: optic && optic !== "N/A" ? optic : prev.rifleSetup?.optic || "",
        ammoLot: ammoLot && ammoLot !== "N/A" ? ammoLot : prev.rifleSetup?.ammoLot || "",
      },
    }));
    setSaveNotice("Pasted profile & image data applied. Click Save Profile Changes to publish.");
  };

  const handlePasteFromClipboardButton = async (targetSlot?: "image" | "actionPhoto") => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageType = item.types.find((t) => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              const file = new File([blob], "pasted-image.png", { type: imageType });
              const dataUrl = await readFileAsOriginalDataUrl(file);
              if (targetSlot === "image") {
                setEditForm((prev) => ({ ...prev, image: dataUrl }));
                setSaveNotice("Headshot image pasted at original resolution (no resize).");
              } else if (targetSlot === "actionPhoto") {
                setEditForm((prev) => ({ ...prev, actionPhoto: dataUrl }));
                setSaveNotice("Action shot banner pasted at original resolution (no resize).");
              } else {
                setEditForm((prev) => ({
                  ...prev,
                  image: prev.image && prev.image !== "/images/SS-RWB-LOGO.png" ? prev.image : dataUrl,
                  actionPhoto: dataUrl,
                }));
                setSaveNotice("Image pasted from clipboard at original resolution.");
              }
              return;
            }
          }
        } catch {}
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (targetSlot && (text.trim().startsWith("data:image/") || text.trim().startsWith("http") || text.trim().startsWith("/"))) {
          setEditForm((prev) => ({ ...prev, [targetSlot]: text.trim() }));
          setSaveNotice(`${targetSlot === "image" ? "Headshot" : "Action shot banner"} pasted.`);
          return;
        }
        applyPastedProfileText(text);
      }
    } catch {
      setSaveNotice("Press Cmd+V / Ctrl+V anywhere in this window to paste profile or image.");
    }
  };

  const handleModalClipboardPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const dataUrl = await readFileAsOriginalDataUrl(file);
            setEditForm((prev) => ({
              ...prev,
              image: prev.image && prev.image !== "/images/SS-RWB-LOGO.png" ? prev.image : dataUrl,
              actionPhoto: dataUrl,
            }));
            setSaveNotice("Clipboard image pasted at original resolution (not edited or resized).");
            return;
          }
        }
      }
    }
    const text = e.clipboardData?.getData("text/plain");
    if (text && text.includes("=== SUBSONIC SOCIETY")) {
      e.preventDefault();
      applyPastedProfileText(text);
    }
  };

  const handleCopyShooterProfile = (shooter: ShooterProfile | Partial<ShooterProfile>, targetId?: string) => {
    const text = formatShooterProfileText(shooter);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    const idToMark = targetId || shooter.id || "modal";
    setCopiedId(idToMark);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleOpenEdit = (shooter: ShooterProfile) => {
    setInspectingShooter(shooter);
    setEditForm({ ...shooter });
    setSaveNotice(null);
  };

  const handleSaveShooter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.name || !editForm.callsign) return;

    setIsSavingShooter(true);
    setSaveNotice(null);

    try {
      const res = await fetch("/api/shooters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, isProfileUpdate: true }),
      });

      const data = await res.json();
      if (res.ok && data.shooter) {
        setSaveNotice("Profile & images saved successfully.");
        if (onShooterUpdated) {
          onShooterUpdated(data.shooter);
        }
        setInspectingShooter(data.shooter);
      } else {
        setSaveNotice(data.error || "Failed to update shooter profile.");
      }
    } catch (err: any) {
      setSaveNotice("Network error: " + err.message);
    } finally {
      setIsSavingShooter(false);
      setTimeout(() => setSaveNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-black text-white">
                Automated Competitor Profiles &amp; Rig Specs ({shooterProfiles.length})
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Profiles generated automatically from competitor registrations. View, edit, or copy &amp; paste full profile contents and original uncropped photos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/invite/pro"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch VIP Intake</span>
            </Link>

            <Link
              href="/shooters"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span>View Public Roster</span>
            </Link>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={shooterSearch}
            onChange={(e) => setShooterSearch(e.target.value)}
            placeholder="Search by marksman name, callsign, division, sponsor, or rifle action..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Shooters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shooterProfiles
          .filter((s) => {
            const q = shooterSearch.toLowerCase().trim();
            return (
              !q ||
              s.name.toLowerCase().includes(q) ||
              s.callsign.toLowerCase().includes(q) ||
              s.division.toLowerCase().includes(q) ||
              (s.sponsors && s.sponsors.some((sp) => sp.toLowerCase().includes(q))) ||
              (s.rifleSetup?.action && s.rifleSetup.action.toLowerCase().includes(q))
            );
          })
          .map((shooter) => (
            <div
              key={shooter.id}
              className="ios-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/60 bg-black relative shrink-0">
                      {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") || shooter.image?.startsWith("http") ? (
                        <img src={shooter.image} alt={shooter.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                          {shooter.callsign?.slice(0, 2) || "SS"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                          {shooter.callsign}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {shooter.division}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white">{shooter.name}</h4>
                      <p className="text-[11px] text-emerald-400">{shooter.ranking}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">PODIUMS</span>
                    <span className="text-base font-mono font-black text-amber-400">{shooter.podiums}</span>
                  </div>
                </div>

                {/* Action Shot Banner Preview in Admin Card if present */}
                {shooter.actionPhoto && !shooter.actionPhoto.includes("SS-RWB-LOGO") && (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black relative">
                    <img
                      src={shooter.actionPhoto}
                      alt={`${shooter.name} Action Banner`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}

                {/* Accolades */}
                {shooter.accolades && shooter.accolades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {shooter.accolades.map((acc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5 text-amber-400" />
                        <span>{acc}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Sponsors */}
                {shooter.sponsors && shooter.sponsors.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-400">
                    <span className="text-slate-500">Sponsors: </span>
                    {shooter.sponsors.join(" • ")}
                  </div>
                )}

                {/* Rifle Specs summary */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">ACTION:</span>
                    <span className="text-slate-200 truncate block">{shooter.rifleSetup?.action || "Custom"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">OPTIC:</span>
                    <span className="text-slate-200 truncate block">{shooter.rifleSetup?.optic || "Competition Glass"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">BARREL:</span>
                    <span className="text-slate-200 truncate block">{shooter.rifleSetup?.barrel || "Match"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AMMO LOT:</span>
                    <span className="text-amber-400 truncate block">{shooter.rifleSetup?.ammoLot || "Standard"}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Single-Click Copy Button */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/10 gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyShooterProfile(shooter, shooter.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    title="Copy all contents & images of shooter profile"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedId === shooter.id ? "✓ Copied!" : "Copy Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shooter)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Profile &amp; Photos</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/shooters/${shooter.id}`}
                    target="_blank"
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Card</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteShooter(shooter.id, shooter.name)}
                    className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors"
                    title="Delete Shooter Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* ==================================================================== */}
      {/* UNIFIED SHOOTER PROFILE & PHOTO EDITOR MODAL                         */}
      {/* ==================================================================== */}
      <ProfileEditModal
        isOpen={Boolean(inspectingShooter)}
        onClose={() => setInspectingShooter(null)}
        initialShooter={inspectingShooter}
        onSaved={(updated) => {
          if (onShooterUpdated) {
            onShooterUpdated(updated);
          }
          setInspectingShooter(null);
        }}
      />
    </div>
  );
}
