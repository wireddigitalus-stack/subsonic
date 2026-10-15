import React from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  ArrowLeft,
  Mail
} from "lucide-react";

export const metadata = {
  title: "Terms of Use & Code of Conduct | Subsonic Society",
  description: "Official terms of service, platform rules, and competitor code of conduct for Subsonic Society precision rimfire network.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-slate-300">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO HOME</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500">
          REVISION: 2026.1 • BRISTOL, TN
        </span>
      </div>

      {/* Header Banner */}
      <header className="ios-glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/30 space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>PLATFORM GOVERNANCE &amp; LEGAL CODE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          TERMS OF USE &amp; <br />
          <span className="amber-gradient-text">CODE OF CONDUCT</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          By redeeming an invitation pass, activating a tactical callsign, accessing the private comms network, or participating in Subsonic Society matches, you expressly accept and agree to these Terms of Use and Range Safety Policies.
        </p>
      </header>

      {/* Critical Zero Tolerance Notice */}
      <section className="p-6 rounded-3xl bg-red-950/40 border border-red-500/40 space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-mono font-black text-xs sm:text-sm uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>STRICT PROHIBITION ON FIREARM &amp; AMMUNITION COMMERCE</span>
        </div>
        <p className="text-xs sm:text-sm text-red-200/90 leading-relaxed">
          Subsonic Society is an educational, athletic, and ballistic research community. 
          <strong className="text-white font-bold"> Under no circumstances may this platform, its private chat channels, or its direct messaging be used to buy, sell, trade, broker, or solicit the transfer of firearms, ammunition, serialized firearm receivers, or restricted components.</strong> Any attempt to conduct commercial transactions for regulated items will result in immediate permanent account termination, forfeiture of invitation credentials, and notification of the appropriate authorities.
        </p>
      </section>

      {/* Day of Event Notice */}
      <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>Match Waivers &amp; Range Safety Protocols</span>
        </div>
        <h2 className="text-lg font-bold text-white">Day of Event In-Person Check-In</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          All competitor liability waivers, cold range safety protocols, and venue guidelines will be executed in person on the day of the event during morning check-in at The Hideout.
        </p>
      </div>

      {/* Legal & Inquiries Footer */}
      <div className="p-6 rounded-3xl ios-glass border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-white">Questions regarding our rules or governance?</div>
          <p className="text-slate-400">Direct all compliance and legal inquiries to Executive Command.</p>
        </div>
        <a 
          href="mailto:allen@subsonicsociety.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono font-bold tracking-wider transition-all"
        >
          <Mail className="w-4 h-4" />
          <span>CONTACT EXECUTIVE COMMAND</span>
        </a>
      </div>
    </div>
  );
}
