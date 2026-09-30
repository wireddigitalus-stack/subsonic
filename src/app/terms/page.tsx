import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Lock, 
  Radio, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Flame,
  Target
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

      {/* Terms Sections */}
      <div className="space-y-6">
        {/* 1. Acceptance & Invitation-Only Access */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>1. Eligibility &amp; Invitation-Only Status</span>
          </div>
          <h2 className="text-lg font-bold text-white">Controlled Membership Network</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Access to Subsonic Society digital infrastructure is granted strictly by invitation pass. Members are issued a unique tactical callsign and personal security PIN. You agree to maintain the confidentiality of your PIN and are solely responsible for all dispatches, messages, and DOPE logs transmitted under your callsign. Sharing or transferring credentials without written authorization from Society Executive Command is strictly prohibited.
          </p>
        </div>

        {/* 2. Platform Usage & AI Moderation */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>2. Private Comms &amp; Automated Safety Moderation</span>
          </div>
          <h2 className="text-lg font-bold text-white">Sportsmanship, Decorum &amp; AI Sentinel</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All private comms rooms, DOPE card drops, and match telemetry feeds are monitored in real time by automated security sentinels (powered by Gemini AI and heuristic pattern matching) to evaluate compliance with community standards. You agree to interact with fellow marksmen professionally and respectfully. The following activities will trigger automated disarming and instant suspension:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 text-slate-300">
            <li className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>Harassment, bullying, or defamation</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>Hate speech or personal attacks</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>Commercial solicitation or spamming</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>Impersonating match directors or R.O.s</span>
            </li>
          </ul>
        </div>

        {/* 3. Range Safety & Cold Range Rule */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>3. Range Safety, Cold Range &amp; Chamber Flags</span>
          </div>
          <h2 className="text-lg font-bold text-white">Absolute Precision Firearm Safety Rules</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All registered competitors and attendees of Subsonic Society physical events (including matches hosted at The Hideout in Bristol, TN and regional partner venues) must strictly obey the Cold Range rule:
          </p>
          <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Illuminated Chamber Flags (Empty Chamber Indicator / ECI) must be inserted into all rimfire actions at all times, with magazines removed, until the Range Officer commands &ldquo;Make Ready&rdquo;.</span>
            </div>
            <div className="flex items-start gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Muzzle discipline is absolute. Any 180-degree rule violation or accidental discharge will trigger immediate match disqualification (DQ) without refund.</span>
            </div>
          </div>
        </div>

        {/* 4. Ballistics Telemetry & User Content */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>4. Ballistics Data, DOPE Drops &amp; Intellectual Property</span>
          </div>
          <h2 className="text-lg font-bold text-white">Community Knowledge Sharing</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            By sharing ballistic tables, DOPE card drops, chronograph data, rifle build specs, and match tips, you grant Subsonic Society a perpetual, non-exclusive license to index, display, and aggregate this data for community education and platform analytics. Ballistic data shared by users is for informational purposes only; each marksman is solely responsible for verifying their own elevation, windage, and firearm capabilities.
          </p>
        </div>

        {/* 5. Limitation of Liability */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>5. Assumption of Risk &amp; Limitation of Liability</span>
          </div>
          <h2 className="text-lg font-bold text-white">Sporting Participation &amp; Release</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Shooting sports and extreme long-range rimfire competition inherently involve risks. To the fullest extent permitted by applicable law, Subsonic Society, its founders, match directors, volunteers, and facility partners (including The Hideout Bristol) shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform, participation in matches, or reliance upon user-submitted ballistic data.
          </p>
        </div>

        {/* 6. Account Revocation & Modifications */}
        <div className="ios-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-slate-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-slate-400" />
            <span>6. Termination &amp; Right to Revoke</span>
          </div>
          <h2 className="text-lg font-bold text-white">Discretionary Credential Authority</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Subsonic Society reserves the right to modify these Terms of Use at any time. Continued access to the platform following notice of changes constitutes acceptance. We reserve the absolute right to revoke any member invitation, terminate credentials, or disqualify any competitor who violates range safety, sportsmanship standards, or platform rules.
          </p>
        </div>
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
