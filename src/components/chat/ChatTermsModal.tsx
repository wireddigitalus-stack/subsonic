"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2
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
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="font-mono text-[11px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>PLATFORM TERMS</span>
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
            <span>TERMS OF</span>
            <span className="amber-gradient-text">USE</span>
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            The only platform restriction is no firearm or ammunition sales. All other requirements will be done with a waiver at the event.
          </p>
        </div>

        {/* Firearm Sales Restriction */}
        <div className="p-4 rounded-2xl bg-red-950/50 border-2 border-red-500/50 space-y-2.5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>RESTRICTION ON FIREARM &amp; AMMUNITION SALES</span>
          </div>
          <p className="text-xs text-red-100/90 leading-relaxed font-sans">
            Under no circumstances may this platform, chat system, or direct channels be used to <strong>buy, sell, trade, auction, or transfer firearms, ammunition, receivers, or regulated components</strong>. Any violation results in immediate removal.
          </p>
        </div>

        {/* Day-of-Event Waiver Notice */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ALL ELSE HANDLED BY WAIVER</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All other rules, safety protocols, and liability requirements will be done with a waiver <strong>in person on the day of the event</strong> during check-in.
          </p>
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
            <span>View Terms (/terms)</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </Link>

          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 text-black font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 fill-black text-amber-500" />
            <span>I UNDERSTAND &amp; AGREE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
