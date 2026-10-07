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
      `Status: ${shooter.status || "PUBLISHED"}`,
      `Registered: ${shooter.createdAt || "N/A"}`,
      `Live Profile URL: https://subsonicsociety.com/shooters?id=${shooter.id}`,
      `==========================================`
    ].filter(Boolean).join("\n");
    return lines;
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
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.shooter) {
        setSaveNotice("Profile saved successfully.");
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
              Profiles generated automatically from competitor registrations. View, edit, or copy full profile contents for admin operations.
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
                      {shooter.image?.startsWith("data:") || shooter.image?.startsWith("/") ? (
                        <img src={shooter.image} alt={shooter.name} className="w-full h-full object-cover" />
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
                    title="Copy all contents of shooter profile for easy use by admin"
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
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/shooters?id=${shooter.id}`}
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
      {/* SHOOTER PROFILE INSPECTION & EDIT MODAL (WITH ONE-CLICK COPY ALL)    */}
      {/* ==================================================================== */}
      {inspectingShooter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto ios-glass-card rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-tactical-glow relative space-y-5 my-auto">
            {/* Modal Header with Copy Profile Button */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white">
                    COMPETITOR PROFILE &amp; RIG SPECS
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {editForm.callsign || inspectingShooter.callsign}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Inspect and edit competitor profile details or copy entire record for administrative use.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyShooterProfile(editForm, "modal_header")}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Copy all contents of shooter profile"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedId === "modal_header" ? "✓ Profile Copied!" : "Copy Full Profile"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingShooter(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {saveNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                {saveNotice}
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveShooter} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Competitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Tactical Callsign *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.callsign || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, callsign: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Division
                  </label>
                  <input
                    type="text"
                    value={editForm.division || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, division: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Ranking / Title
                  </label>
                  <input
                    type="text"
                    value={editForm.ranking || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, ranking: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-amber-400 uppercase font-bold">
                    Podiums
                  </label>
                  <input
                    type="number"
                    value={editForm.podiums ?? 0}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, podiums: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-amber-400 font-mono text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">
                    Home Range
                  </label>
                  <input
                    type="text"
                    value={editForm.homeRange || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, homeRange: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chat PIN</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.pin || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, pin: e.target.value }))}
                    placeholder="4-digit numeric PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Accolades & Sponsors */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase">
                  Accolades (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editForm.accolades) ? editForm.accolades.join(", ") : ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, accolades: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase">
                  Sponsors (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editForm.sponsors) ? editForm.sponsors.join(", ") : ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, sponsors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSavingShooter}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingShooter ? "Saving..." : "Save Profile Changes"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShooterProfile(editForm, "modal_footer")}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    title="Copy all contents of shooter profile"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>{copiedId === "modal_footer" ? "✓ Profile Copied!" : "Copy All Profile Data"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingShooter(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
