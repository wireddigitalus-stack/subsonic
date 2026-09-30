"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  Target
} from "lucide-react";

export interface ChatTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayChirp?: (freq: number) => void;
}

export function ChatTermsModal({
  isOpen,
  onClose,
  onPlayChirp,
}: ChatTermsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onPlayChirp) onPlayChirp(600);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPlayChirp]);

  if (!isOpen) return null;

  const handleAcknowledge = () => {
    if (onPlayChirp) onPlayChirp(1200);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        if (onPlayChirp) onPlayChirp(600);
        onClose();
      }}
    >
      <div 
        className="ios-glass rounded-2xl md:rounded-3xl max-w-xl w-full border border-amber-500/40 shadow-2xl p-5 sm:p-7 space-y-4 max-h-[92dvh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            <span className="font-mono text-[11px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>PLATFORM GOVERNANCE &amp; SAFETY CODE</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onPlayChirp) onPlayChirp(600);
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span>TERMS OF USE &amp;</span>
            <span className="amber-gradient-text">CODE OF CONDUCT</span>
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            All competitors, Range Officers, and guests accessing the Subsonic Society comms net operate under strict community standards and range safety rules.
          </p>
        </div>

        {/* Zero Tolerance Warning Callout */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-950/50 border border-red-500/40 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>ZERO-TOLERANCE: COMMERCE PROHIBITION</span>
          </div>
          <p className="text-[11px] sm:text-xs text-red-200/90 leading-relaxed font-sans">
            Under no circumstances may this chat system or direct channels be used to buy, sell, trade, or transfer firearms, ammunition, or regulated items. Violations result in immediate permanent expulsion and credential revocation.
          </p>
        </div>

        {/* Policy Highlights Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Item 1: Decorum & Sportsmanship */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>1. Competitor Sportsmanship &amp; Decorum</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintain professional marksman etiquette. Harassment, abusive language, discrimination, or unsportsmanlike conduct across official match channels will not be tolerated.
            </p>
          </div>

          {/* Item 2: AI Sentinel & Active Moderation */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
              <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>2. Real-Time Safety &amp; AI Moderation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public squad comms and tactical rooms are scanned in real time by automated security sentinels and human Range Officers to preserve a safe, focused competition environment.
            </p>
          </div>

          {/* Item 3: Data & DOPE Card Integrity */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
              <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>3. DOPE Cards &amp; Ballistic Data Integrity</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shared DOPE drops, elevation tables, and wind calls are provided for match intelligence and education. Always verify your own chambering, bore height, and rifle safety parameters.
            </p>
          </div>

          {/* Item 4: Invitation Credentials */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs uppercase">
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>4. Invitation Pass &amp; Credential Security</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access is granted strictly by invitation pass. You are responsible for all transmissions originating from your registered tactical callsign and PIN key.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (onPlayChirp) onPlayChirp(1000);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Read Full Document (/terms)</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </Link>

          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-tactical-glow transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 fill-black text-amber-500" />
            <span>I UNDERSTAND &amp; AGREE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
