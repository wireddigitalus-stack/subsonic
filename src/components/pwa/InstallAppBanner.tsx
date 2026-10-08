"use client";

import React from "react";
import Image from "next/image";
import { X, Download, Share, Smartphone, PlusSquare } from "lucide-react";

interface InstallAppBannerProps {
  isVisible: boolean;
  isIOS: boolean;
  canInstallNative: boolean;
  onInstallClick: () => void;
  onDismiss: () => void;
}

export function InstallAppBanner({
  isVisible,
  isIOS,
  canInstallNative,
  onInstallClick,
  onDismiss,
}: InstallAppBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
      <div className="relative overflow-hidden rounded-2xl bg-[#090C12]/95 border border-amber-500/40 p-3.5 shadow-tactical-glow backdrop-blur-xl">
        {/* Subtle Ambient Backlight Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/20 blur-2xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          {/* App Icon */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-amber-400/50 shadow-md shrink-0">
            <Image
              src="/apple-touch-icon.png"
              alt="Subsonic App"
              fill
              className="object-cover"
            />
          </div>

          {/* Text Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-tight truncate">
                INSTALL SUBSONIC APP
              </span>
              <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                FAST
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate pt-0.5">
              {isIOS ? "Tap Share → Add to Home Screen" : "1-tap install for full-screen comms"}
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onInstallClick}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs shrink-0 shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {isIOS ? (
              <>
                <Share className="w-3.5 h-3.5 fill-black/20" />
                <span>HOW TO ADD</span>
              </>
            ) : canInstallNative ? (
              <>
                <Download className="w-3.5 h-3.5 fill-black" />
                <span>INSTALL</span>
              </>
            ) : (
              <>
                <PlusSquare className="w-3.5 h-3.5" />
                <span>ADD APP</span>
              </>
            )}
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install banner"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
