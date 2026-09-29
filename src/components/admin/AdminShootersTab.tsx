"use client";

import React from "react";
import Link from "next/link";
import { Users, Trash2, Trophy, Search, ExternalLink, Sparkles } from "lucide-react";
import { ShooterProfile } from "@/lib/types";

export interface AdminShootersTabProps {

  shooterProfiles: ShooterProfile[];
  shooterSearch: string;
  setShooterSearch: (s: string) => void;
  handleDeleteShooter: (id: string, name: string) => void;
}

export function AdminShootersTab(props: AdminShootersTabProps) {
  const { shooterProfiles, shooterSearch, setShooterSearch, handleDeleteShooter } = props;

  return (
<div className="space-y-6">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-black text-white">
                    Automated Competitor Profiles &amp; Rig Dossiers ({shooterProfiles.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Profiles generated automatically from competitor intake questionnaires. Real rig specs, accolades, and sponsors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/shooters/intake"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Intake Form</span>
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

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                    <Link
                      href={`/shooters?id=${shooter.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Live Card</span>
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
              ))}
          </div>
        </div>
      
  );
}
