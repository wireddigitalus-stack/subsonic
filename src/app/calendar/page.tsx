"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Target, 
  Flame, 
  Clock, 
  Award, 
  User, 
  CheckCircle2, 
  X, 
  Download, 
  Share2, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { INITIAL_MATCHES } from "@/lib/initial-data";
import { MatchEvent } from "@/lib/types";

export default function CalendarPage() {
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [selectedMatch, setSelectedMatch] = useState<MatchEvent | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    division: "OPEN",
    rifleModel: "",
    squadPreference: "Squad 1 (Morning Flight)",
  });

  const filteredMatches = matches.filter((m) => {
    if (filterTier === "ALL") return true;
    return m.tier === filterTier;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    // Update match registration count
    setMatches((prev) =>
      prev.map((m) =>
        m.id === selectedMatch.id
          ? { ...m, registeredCount: m.registeredCount + 1 }
          : m
      )
    );

    setRegSuccess(true);
    setTimeout(() => {
      setIsRegistering(false);
      setRegSuccess(false);
    }, 2200);
  };

  const handleExportICS = (match: MatchEvent) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Subsonic Society//NONSGML Match Calendar//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${match.title}`,
      `DESCRIPTION:${match.subtitle}\\nDirector: ${match.matchDirector.name}\\nStages: ${match.stages}`,
      `LOCATION:${match.location}`,
      "DTSTART:20261017T120000Z",
      "DTEND:20261018T220000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${match.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Competition Schedule & Registration
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              2026 Season
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            PRECISION RIMFIRE <span className="amber-gradient-text">EVENT CALENDAR</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Register for sanctioned pro matches, regional qualifiers, and ballistics clinics held on the mountain ranges of Bristol, TN.
          </p>
        </div>

        {/* Filter Tier Tabs */}
        <div className="bg-black/60 p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1">
          {[
            { id: "ALL", label: "All Events" },
            { id: "PRO_SERIES", label: "Pro Series" },
            { id: "REGIONAL_QUALIFIER", label: "Regional" },
            { id: "CLINIC", label: "Clinics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id)}
              data-telemetry={`calendar_filter_${tab.id.toLowerCase()}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterTier === tab.id
                  ? "bg-amber-500 text-black shadow-tactical-glow font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => {
          const spotsLeft = match.maxCompetitors - match.registeredCount;
          const isPro = match.tier === "PRO_SERIES";

          return (
            <div
              key={match.id}
              className={`ios-glass-card rounded-3xl overflow-hidden border flex flex-col justify-between ${
                isPro
                  ? "border-amber-500/40 shadow-tactical-glow bg-amber-950/[0.08]"
                  : "border-white/10"
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Header Pills */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                      isPro
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {match.tier.replace("_", " ")}
                  </span>

                  <span
                    className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                      spotsLeft <= 30 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        spotsLeft <= 30 ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                      }`}
                    />
                    {spotsLeft} Spots Available
                  </span>
                </div>

                {/* Match Title */}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {match.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {match.subtitle}
                  </p>
                </div>

                {/* Date & Location */}
                <div className="space-y-2 text-xs text-slate-300 border-y border-white/5 py-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{match.date}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{match.location}</span>
                  </div>
                </div>

                {/* Key Match Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] font-mono text-slate-400">STAGES</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {match.stages}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] font-mono text-slate-400">ROUNDS</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {match.roundCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] font-mono text-slate-400">TARGETS</div>
                    <div className="text-xs font-mono font-bold text-amber-300 truncate">
                      {match.distanceRange}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 bg-black/40 border-t border-white/5 flex items-center gap-2">
                <button
                  onClick={() => setSelectedMatch(match)}
                  data-telemetry={`match_view_stages_${match.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stage Briefing</span>
                </button>

                <Link
                  href={`/register?match=${match.id}`}
                  data-telemetry={`match_register_button_${match.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-tactical-glow transition-all"
                >
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  <span>Enter (${match.entryFee})</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Detail Modal & Stage Briefs */}
      {selectedMatch && !isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {selectedMatch.tier.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedMatch.location}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedMatch.title}
                </h2>
                <p className="text-xs text-slate-300">
                  {selectedMatch.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview & Match Director */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Match Synopsis & Mountain Proving Ground
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedMatch.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <User className="w-4 h-4 text-blue-400" />
                  <div className="text-xs">
                    <span className="text-slate-400">Match Director: </span>
                    <strong className="text-white">{selectedMatch.matchDirector.name}</strong>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedMatch.matchDirector.email}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs">
                    <span className="text-slate-400">Prize Table: </span>
                    <strong className="text-emerald-400">{selectedMatch.prizePool}</strong>
                    <div className="text-[11px] text-slate-500">Cash Payouts & Sponsor Awards</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Previews */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Published Stage Courses of Fire ({selectedMatch.stageBriefs.length} Preview Stages)
              </h4>

              <div className="space-y-3">
                {selectedMatch.stageBriefs.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          STAGE {stage.stageNumber}
                        </span>
                        <span className="font-bold text-sm text-white">{stage.name}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {stage.timeLimit}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Distance: <strong className="text-white">{stage.distance}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-white">{stage.targetType}</strong></span>
                      <span>•</span>
                      <span>Rounds: <strong className="text-white">{stage.roundCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleExportICS(selectedMatch)}
                data-telemetry={`export_ics_${selectedMatch.id}`}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Add to Apple / Google Calendar (.ics)</span>
              </button>

              <Link
                href={`/register?match=${selectedMatch.id}`}
                data-telemetry={`open_registration_modal_${selectedMatch.id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-tactical-glow transition-all"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Proceed to Squad Registration (${selectedMatch.entryFee})</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Squad Registration Form Modal */}
      {selectedMatch && isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl max-w-lg w-full border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  Squad Registration
                </span>
                <h3 className="text-xl font-bold text-white">
                  {selectedMatch.title}
                </h3>
              </div>
              <button
                onClick={() => setIsRegistering(false)}
                className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">
                  Squad Slot Confirmed!
                </h4>
                <p className="text-xs text-slate-300">
                  Welcome to the firing line, <strong>{regForm.name}</strong>. Confirmation and stage DOPE packet sent to {regForm.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">
                    Competitor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wyatt Sterling"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="competitor@gmail.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">
                      Rifle Division
                    </label>
                    <select
                      value={regForm.division}
                      onChange={(e) => setRegForm({ ...regForm, division: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="OPEN">Open Division</option>
                      <option value="PRODUCTION">Production Class</option>
                      <option value="SENIOR">Senior Division</option>
                      <option value="LADIES">Ladies Precision</option>
                      <option value="YOUTH">Youth Marksman</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">
                      Flight / Squad
                    </label>
                    <select
                      value={regForm.squadPreference}
                      onChange={(e) => setRegForm({ ...regForm, squadPreference: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Squad 1">Squad 1 (Morning Flight)</option>
                      <option value="Squad 2">Squad 2 (Afternoon Flight)</option>
                      <option value="Squad 3">Squad 3 (Pro Squad)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">
                    Rifle / Action Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vudoo V-22 / RimX / CZ 457"
                    value={regForm.rifleModel}
                    onChange={(e) => setRegForm({ ...regForm, rifleModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Chamber safety flags required at all times. Standard velocity .22LR ammo only (subsonic maximum 1125 fps).
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    data-telemetry="submit_squad_registration"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-tactical-glow transition-all"
                  >
                    Confirm Registration (${selectedMatch.entryFee})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
