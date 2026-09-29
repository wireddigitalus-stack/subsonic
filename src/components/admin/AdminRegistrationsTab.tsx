"use client";

import React from "react";
import { Download, Trophy, Search } from "lucide-react";
import { MatchRegistration } from "@/lib/types";

export interface AdminRegistrationsTabProps {

  registrations: MatchRegistration[];
  filteredRegistrations: MatchRegistration[];
  regSearch: string;
  setRegSearch: (s: string) => void;
  regMatchFilter: string;
  setRegMatchFilter: (s: string) => void;
  regDivisionFilter: string;
  setRegDivisionFilter: (s: string) => void;
  downloadRegistrationsExport: () => void;
}

export function AdminRegistrationsTab(props: AdminRegistrationsTabProps) {
  const { registrations, filteredRegistrations, regSearch, setRegSearch, regMatchFilter, setRegMatchFilter, regDivisionFilter, setRegDivisionFilter, downloadRegistrationsExport } = props;

  return (
<div className="space-y-6">
          {/* Header & Controls */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white">
                    Registered Match Competitors ({filteredRegistrations.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Confirmed match competitors, squad assignments, rifle divisions, and registration revenues.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadRegistrationsExport}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Match Roster CSV</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Competitors</span>
                <span className="text-2xl font-black font-mono text-amber-400">{registrations.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Open Division Pro</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {registrations.filter((r) => r.rifle_division === "OPEN").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Production & Senior</span>
                <span className="text-2xl font-black font-mono text-purple-400">
                  {registrations.filter((r) => ["PRODUCTION", "SENIOR"].includes(r.rifle_division)).length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Entry Fees Collected</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${registrations.reduce((acc, r) => acc + (r.total_price || 275), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search competitor, callsign, ticket, rifle..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <select
                  value={regMatchFilter}
                  onChange={(e) => setRegMatchFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Matches</option>
                  <option value="subsonic-invitational-2026">The Subsonic Society Invitational ($7,500 Purse)</option>
                  <option value="300x-long-gong-challenge">300X Long Gong Challenge</option>
                  <option value="200x-mountain-match">200X Mountain Match</option>
                </select>
              </div>

              <div>
                <select
                  value={regDivisionFilter}
                  onChange={(e) => setRegDivisionFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Divisions</option>
                  <option value="OPEN">Open Division Pro</option>
                  <option value="PRODUCTION">Production Division</option>
                  <option value="SENIOR">Senior Division (55+)</option>
                  <option value="LADIES">Ladies Rimfire Pro</option>
                  <option value="YOUTH">Junior / Youth</option>
                </select>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="ios-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="p-4">Pass Ticket #</th>
                    <th className="p-4">Competitor</th>
                    <th className="p-4">Match</th>
                    <th className="p-4">Division</th>
                    <th className="p-4">Squad & Flight</th>
                    <th className="p-4">Rifle & Optic Setup</th>
                    <th className="p-4">Ammunition</th>
                    <th className="p-4">Fee Paid</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredRegistrations.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-amber-400">
                        {r.ticket_number}
                      </td>
                      <td className="p-4 font-sans">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{r.competitor_name}</span>
                          {r.competitor_callsign && (
                            <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                              [{r.competitor_callsign}]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {r.competitor_email} {r.competitor_phone ? `• ${r.competitor_phone}` : ""}
                        </div>
                      </td>
                      <td className="p-4 font-sans text-xs text-slate-200 max-w-xs truncate">
                        {r.match_title}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.rifle_division === "OPEN"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : r.rifle_division === "PRODUCTION"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : r.rifle_division === "SENIOR"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {r.rifle_division}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-slate-300">
                        <div className="font-bold text-xs text-white">{r.squad_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.squad_flight}</div>
                      </td>
                      <td className="p-4 font-sans text-xs text-slate-300 max-w-xs">
                        <div className="font-semibold text-slate-200">{r.rifle_model}</div>
                        <div className="text-[10px] text-slate-400">{r.optic}</div>
                      </td>
                      <td className="p-4 text-[11px] text-slate-300">
                        {r.ammo_lot}
                      </td>
                      <td className="p-4 font-bold text-white">
                        ${r.total_price}
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {r.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                        No competitor registrations matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      
  );
}
