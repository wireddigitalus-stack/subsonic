"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Download,
  ArrowDown,
  Layers,
  Zap,
  MoreVertical
} from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
  canInstallNative: boolean;
  onPromptNative: () => void;
}

export function InstallAppModal({
  isOpen,
  onClose,
  isIOS: defaultIOS,
  isAndroid: defaultAndroid,
  canInstallNative,
  onPromptNative,
}: InstallAppModalProps) {
  const [activeTab, setActiveTab] = useState<"ios" | "android">(defaultIOS ? "ios" : "android");

  useEffect(() => {
    if (defaultIOS) {
      setActiveTab("ios");
    } else if (defaultAndroid) {
      setActiveTab("android");
    }
  }, [defaultIOS, defaultAndroid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0B0E14] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden z-10 space-y-5 animate-slideUp">
        {/* Subtle top gold highlight glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header & Close */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              WEB APP INSTALLATION
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Icon & Branding */}
        <div className="flex items-center gap-4 relative z-10 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/40 shadow-tactical-glow shrink-0">
            <Image
              src="/apple-touch-icon.png"
              alt="Subsonic Society App Icon"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-black text-white truncate">SUBSONIC SOCIETY</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-tight pt-0.5">
              Full-screen app experience • Zero browser bars • Instant comms
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "ios"
                ? "bg-amber-500 text-black shadow-tactical-glow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Apple iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "android"
                ? "bg-amber-500 text-black shadow-tactical-glow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Tab Content: iOS Walkthrough */}
        {activeTab === "ios" && (
          <div className="space-y-3.5 relative z-10 text-left">
            <p className="text-xs text-slate-300 font-medium">
              Apple requires Safari users to manually add the app to the home screen. Follow these 2 quick steps:
            </p>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="text-xs text-slate-200">
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    Tap the <strong className="text-blue-400 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/30">Share <Share className="w-3.5 h-3.5 inline" /></strong> button
                  </div>
                  <span className="text-slate-400">Located in the bottom navigation bar of Safari on iPhone.</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="text-xs text-slate-200">
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    Scroll down and tap <strong className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/30">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" /></strong>
                  </div>
                  <span className="text-slate-400">Then tap <strong className="text-white font-semibold">"Add"</strong> in the top-right corner of the confirmation sheet.</span>
                </div>
              </div>
            </div>

            {/* Downward indicator animation for iPhone users */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-400/80 animate-bounce">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Safari Share button is right below at the bottom of your screen</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Tab Content: Android / Chrome Walkthrough */}
        {activeTab === "android" && (
          <div className="space-y-4 relative z-10 text-left">
            <p className="text-xs text-slate-300 font-medium">
              Android supports instant 1-tap installation directly into your apps drawer and home screen.
            </p>

            {canInstallNative ? (
              <button
                type="button"
                onClick={onPromptNative}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm flex items-center justify-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 fill-black" />
                <span>INSTALL APP NOW (1 TAP)</span>
              </button>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-200">
                    <div className="font-bold flex items-center gap-1.5 text-white">
                      Tap the <strong className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/30">Three Dots <MoreVertical className="w-3.5 h-3.5 inline" /></strong> menu
                    </div>
                    <span className="text-slate-400">Located in the top-right corner of Chrome.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-200">
                    <div className="font-bold flex items-center gap-1.5 text-white">
                      Tap <strong className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/30">Install App</strong> or <strong className="text-emerald-400">Add to Home Screen</strong>
                    </div>
                    <span className="text-slate-400">The app will appear instantly in your phone's app list.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benefits Footnote */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faster loading & zero storage bloat</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:underline font-bold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
