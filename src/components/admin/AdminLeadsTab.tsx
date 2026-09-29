"use client";

import React from "react";
import { Download, CheckCircle2, Mail, Search, Phone } from "lucide-react";
import { ContactLead } from "@/lib/types";

export interface AdminLeadsTabProps {

  leads: ContactLead[];
  filteredLeads: ContactLead[];
  leadSearch: string;
  setLeadSearch: (s: string) => void;
  leadCategoryFilter: string;
  setLeadCategoryFilter: (s: string) => void;
  leadStatusFilter: string;
  setLeadStatusFilter: (s: string) => void;
  handleUpdateLeadStatus: (id: string, s: any) => void;
  downloadLeadsExport: () => void;
}

export function AdminLeadsTab(props: AdminLeadsTabProps) {
  const { leads, filteredLeads, leadSearch, setLeadSearch, leadCategoryFilter, setLeadCategoryFilter, leadStatusFilter, setLeadStatusFilter, handleUpdateLeadStatus, downloadLeadsExport } = props;

  return (
<div className="space-y-6">
          {/* Header & Controls */}
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white">
                    Contact Leads & Inquiries ({filteredLeads.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Transmissions from potential sponsors, match hosts, range inquiries, and media.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadLeadsExport}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Leads CSV</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Inquiries</span>
                <span className="text-2xl font-black font-mono text-amber-400">{leads.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">New / Unanswered</span>
                <span className="text-2xl font-black font-mono text-red-400">
                  {leads.filter((l) => l.status === "NEW").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Sponsorship Leads</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {leads.filter((l) => l.category === "SPONSORSHIP").length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Match Host Proposals</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {leads.filter((l) => l.category === "MATCH_HOST").length}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, company, email, or message..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <select
                  value={leadCategoryFilter}
                  onChange={(e) => setLeadCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SPONSORSHIP">Sponsorship & Prize Table</option>
                  <option value="MATCH_HOST">Match Host Proposals</option>
                  <option value="SUBSONIC_DNA">Subsonic DNA Testing</option>
                  <option value="GENERAL">General & Membership</option>
                  <option value="MEDIA">Media & Press</option>
                </select>
              </div>

              <div>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW (Unread)</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="CONTACTED">CONTACTED / REPLIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Cards Grid */}
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`ios-glass rounded-3xl p-6 border transition-all space-y-4 ${
                  lead.status === "NEW"
                    ? "border-amber-500/50 shadow-tactical-glow bg-gradient-to-r from-amber-500/10 via-black/40 to-black/60"
                    : "border-white/10 hover:border-white/20 bg-black/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-base text-white">{lead.name}</span>
                    {lead.company && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {lead.company}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      lead.category === "SPONSORSHIP"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : lead.category === "MATCH_HOST"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : lead.category === "SUBSONIC_DNA"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    }`}>
                      {lead.category.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(lead.created_at).toLocaleString()}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border focus:outline-none ${
                        lead.status === "NEW"
                          ? "bg-amber-500 text-black border-amber-400"
                          : lead.status === "CONTACTED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : lead.status === "IN_REVIEW"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                          : "bg-black/60 text-slate-400 border-white/10"
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                {/* Subject & Message Content */}
                <div className="space-y-2">
                  {lead.subject && (
                    <h4 className="text-sm font-bold text-slate-100">
                      {lead.subject}
                    </h4>
                  )}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                    {lead.message}
                  </div>
                </div>

                {/* Contact Coordinates & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1.5 text-white hover:text-amber-400 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lead.email}</span>
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 text-white hover:text-amber-400 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lead.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject || "Subsonic Society Inquiry")}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>

                    {lead.status !== "CONTACTED" && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, "CONTACTED")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Contacted</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="ios-glass rounded-3xl p-12 text-center text-slate-400 border border-white/10 font-sans">
                No inquiries or leads matching selected filters.
              </div>
            )}
          </div>
        </div>
      
  );
}
