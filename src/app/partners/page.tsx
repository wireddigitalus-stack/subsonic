"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Award, 
  Sparkles, 
  Flame, 
  Trophy, 
  ExternalLink, 
  Mail, 
  CheckCircle2, 
  Crosshair, 
  ShieldCheck,
  Building2,
  ChevronRight
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  role: string;
  badge: string;
  description: string;
  tier: "PRESENTING" | "INDUSTRY_LEADER" | "TECHNICAL_COLLABORATOR";
  website: string;
  highlights: string[];
}

const PARTNERS_DATA: Partner[] = [
  {
    id: "modacam-custom-rifles",
    name: "Modacam Custom Rifles",
    role: "Title Sponsor — Subsonic Society Invitational ($7,500 Total Purse)",
    badge: "Official Presenting Sponsor",
    description: "Modacam Custom Rifles represents the absolute zenith of precision rimfire gunsmithing. Hand-crafted in America by master gunsmith Jonathan Elrod with blueprinted actions, single-point cut-rifled match barrels, and meticulous chamber leades, Modacam rifles are engineered to dominate high-stakes PRS and NRL22 podiums.",
    tier: "PRESENTING",
    website: "https://mcr-rifles.com",
    highlights: [
      "Sole Presenting Partner for the $7,500 Cash Purse Invitational",
      "Custom Match Rifle Build on Display at The Hideout",
      "Precision Match Chambering & Blueprinting for Subsonic Society Competitors",
    ],
  },
];

export default function PartnersPage() {
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryCompany, setInquiryCompany] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          company: inquiryCompany,
          email: inquiryEmail,
          category: "SPONSORSHIP",
          subject: `Sponsorship Inquiry from ${inquiryCompany || inquiryName}`,
          message: inquiryMessage,
        }),
      });
    } catch (err) {
      console.warn("Contact API error:", err);
    }
    setInquirySubmitted(true);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>TITLE SPONSOR &amp; INDUSTRY PARTNER</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              PRECISION RIMFIRE <span className="amber-gradient-text">REDEFINED.</span> <br />
              MODACAM CUSTOM RIFLES.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Precision rimfire rifles hand-crafted by master gunsmith Jonathan Elrod and used by the best shooters in the world. Official presenting partner of the Subsonic Society Invitational.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee Presenting Sponsor: Modacam Custom Rifles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-12 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-black/40 to-black/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black font-mono uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Official Title Sponsor</span>
              </div>

              <div className="pt-2 pb-1">
                <Image
                  src="/assets/modacam-logo-dark.png"
                  alt="MODACAM Custom Rifles"
                  width={380}
                  height={84}
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
                  priority
                />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                MODACAM CUSTOM RIFLES
              </h2>

              <p className="text-sm font-mono text-amber-400 font-bold">
                Precision Rimfire Rifles Used by the Best Shooters in the World
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Founded and operated by master gunsmith Jonathan Elrod, Modacam Custom Rifles is dedicated to redefining what a precision rimfire rifle can achieve. Every rifle is hand-crafted with blueprinted actions, single-point cut-rifled match barrels, meticulous chamber leades, and dialed harmonic balance to deliver unrivaled cold-bore consistency and podium finishes.
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Partnership Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>$7,500 Guaranteed Cash Purse Benefactor</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Official Subsonic Society Match Jersey Sleeve Sponsor</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Custom Match Rifle Build on Display at The Hideout</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Precision Match Chambering &amp; Blueprinting</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/matches"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <Trophy className="w-4 h-4 fill-black" />
                  <span>Explore The Invitational</span>
                </Link>

                <a
                  href="https://mcr-rifles.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <span>Visit Modacam Custom Rifles (mcr-rifles.com)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-8 rounded-3xl ios-glass-card border border-amber-500/40 text-center space-y-5 max-w-sm w-full relative overflow-hidden group shadow-tactical-glow">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
                
                {/* Official Logo Display */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
                  <Image
                    src="/assets/modacam-logo-dark.png"
                    alt="MODACAM Custom Rifles Official Logo"
                    width={320}
                    height={70}
                    className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(239,68,68,0.25)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase block">
                    MASTER GUNSMITH
                  </span>
                  <h3 className="text-lg font-black text-white">
                    JONATHAN ELROD
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Custom match-grade rimfire and centerfire platforms engineered specifically for extreme distance, high-angle winds, and precision consistency.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>CRAFT: <strong className="text-amber-400">MATCH .22LR</strong></span>
                  <span>DOMAIN: <strong className="text-white">MCR-RIFLES.COM</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner / Sponsor Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass-card rounded-3xl p-8 sm:p-10 border border-white/15 space-y-6">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Brand Alignment & Match Tables
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              PARTNER WITH SUBSONIC SOCIETY
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Reach the most dedicated precision rimfire shooters in the country. Inquire regarding match stage sponsorships, prize table contributions, and Subsonic DNA laboratory testing.
            </p>
          </div>

          {inquirySubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Partnership Inquiry Dispatched!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you for supporting precision rimfire sports. A member of Subsonic Society match directorate will contact you at <strong>{inquiryEmail}</strong> within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                    placeholder="e.g. Precision Armament LLC"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="e.g. sponsor@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Partnership Objectives & Match Interest</label>
                <textarea
                  rows={4}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Tell us about your products, match prize contributions, or laboratory testing interests..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  Submit Partnership Request
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
