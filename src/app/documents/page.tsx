"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Mountain, 
  Calendar, 
  Target, 
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  Share2,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { CompetitionDocument } from "@/lib/types";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Documents" },
  { id: "COF", label: "Course of Fire (COF)" },
  { id: "RULES", label: "Match Rules & Bylaws" },
  { id: "WAIVER", label: "Cold Range Waivers" },
  { id: "SCHEDULE", label: "Squadding & Flight" },
  { id: "RANGE_INTEL", label: "Elevation & Intel" },
];

export default function CompetitionDocumentsPage() {
  const [documents, setDocuments] = useState<CompetitionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load competition documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCopyLink = (doc: CompetitionDocument) => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${doc.fileUrl}` : doc.fileUrl;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "ALL" || doc.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query || 
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      (doc.matchTitle && doc.matchTitle.toLowerCase().includes(query)) ||
      doc.fileName.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (cat: CompetitionDocument["category"]) => {
    switch (cat) {
      case "COF":
        return {
          label: "Course of Fire",
          color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
        };
      case "RULES":
        return {
          label: "Rules & Bylaws",
          color: "bg-blue-500/15 border-blue-500/30 text-blue-400",
        };
      case "WAIVER":
        return {
          label: "Safety & Waiver",
          color: "bg-red-500/15 border-red-500/30 text-red-400",
        };
      case "SCHEDULE":
        return {
          label: "Squad Schedule",
          color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        };
      case "RANGE_INTEL":
        return {
          label: "Topography Intel",
          color: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
        };
      default:
        return {
          label: "Document",
          color: "bg-white/10 border-white/20 text-slate-300",
        };
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>SUBSONIC VAULT • OFFICIAL COMPETITION DOSSIERS</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                COMPETITION <br />
                <span className="amber-gradient-text">DOCUMENTS & RANGE DOSSIERS.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Download verified Course of Fire stage packets, match rules, cold-range liability waivers, and Appalachian elevation intel for upcoming Subsonic Society shoots.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shooters/intake"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Shooter Profile</span>
              </Link>
              <Link
                href="/matches"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>Match Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Documents</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {documents.length}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Verified Official Packets
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Course of Fire</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              18 Stages
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              465-Yd High Angle COF
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Cold Range Waiver</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              Required
            </div>
            <div className="text-[11px] text-red-400 font-mono mt-0.5">
              Sign Prior to Squadding
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Elevation Reference</span>
              <Mountain className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              3,420 FT
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              Holston Mountain, TN
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Controls: Search & Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by stage, rules, title, or match..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{filteredDocs.length} of {documents.length} Documents</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = tab.id === "ALL" 
                ? documents.length 
                : documents.filter((d) => d.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-amber-500 text-black shadow-tactical-glow"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mandatory Waiver Alert Banner if any mandatory doc exists */}
        {documents.some((d) => d.isMandatory) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-950/30 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Mandatory Competitor Briefing & Range Waiver</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500 text-white font-black">ACTION REQUIRED</span>
                </h4>
                <p className="text-xs text-slate-300">
                  All match participants must download, sign, and submit the 2026 Cold Range Safety Waiver prior to squad flight briefing.
                </p>
              </div>
            </div>

            <a
              href="/documents/cold-range-safety-waiver-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-tactical-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Waiver</span>
            </a>
          </div>
        )}

        {/* Document Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading competition vault dossiers...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-20 text-center space-y-3 ios-glass rounded-3xl border border-white/10 p-8">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No documents found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No competition packets match the selected category &ldquo;{activeCategory}&rdquo; and query &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => {
                setActiveCategory("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              const badge = getCategoryBadge(doc.category);
              const isCopied = copiedId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="ios-glass rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {doc.isMandatory && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>MANDATORY</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {doc.version}
                      </span>
                    </div>

                    <div>
                      {doc.matchTitle && (
                        <div className="text-[11px] font-mono text-amber-400 font-semibold mb-0.5 truncate">
                          {doc.matchTitle}
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="truncate">{doc.fileName}</span>
                      <span className="shrink-0">{doc.fileSize || "PDF"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-tactical-glow transition-all active:scale-98"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Dossier</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(doc)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Copy direct download link"
                      >
                        {isCopied ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cross-Link Card to Shooters Questionnaire */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-black to-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              Automated Athlete Profiles
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Haven&rsquo;t Submitted Your Marksman Profile?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Takes under 2 minutes. Enter your rifle rig specs, competition accolades (Team USA, National Champion), sponsor tags, and photo to generate your official Subsonic Society card.
            </p>
          </div>

          <Link
            href="/shooters/intake"
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-tactical-glow shrink-0 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Profile Questionnaire</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
