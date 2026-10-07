"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Lock,
  Radio,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  Scale,
  ShieldCheck,
  LogOut,
  QrCode,
  Radar,
  ChevronRight,
  MessageSquare,
  Camera
} from "lucide-react";
import { getUserInitials, getAvatarColor } from "@/lib/avatar-colors";

interface ChatMobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  shooterProfile: {
    name: string;
    callsign: string;
    role: string;
    division: string;
    rifleSetup: string;
    badgeText: string;
    image?: string;
    avatarColor?: string;
  };
  onOpenPass: () => void;
  onEditProfile?: () => void;
  onOpenChannels: () => void;
  onOpenDirectChats: () => void;
  unreadDmCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenTour: () => void;
  onOpenTerms: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export function ChatMobileMenuModal({
  isOpen,
  onClose,
  shooterProfile,
  onOpenPass,
  onEditProfile,
  onOpenChannels,
  onOpenDirectChats,
  unreadDmCount,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenTour,
  onOpenTerms,
  onLogout,
  isAdmin,
}: ChatMobileMenuModalProps) {
  if (!isOpen) return null;

  const isMasterOwner =
    shooterProfile.callsign === "RADAR" ||
    shooterProfile.callsign === "ROB" ||
    shooterProfile.role === "MASTER_OWNER";
  const isOwnerAdmin =
    shooterProfile.callsign === "SUBX" ||
    shooterProfile.callsign === "ALLEN" ||
    shooterProfile.role === "OWNER_ADMIN";

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm h-full bg-[#0B0F17] border-l border-white/10 flex flex-col justify-between p-4 sm:p-5 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                Tactical Chat Menu
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card with Shooter Pass CTA */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm ring-2 ring-white/20 shrink-0 overflow-hidden text-white shadow-sm"
                style={{
                  backgroundColor: getAvatarColor(shooterProfile.avatarColor, shooterProfile.callsign || shooterProfile.name).hex,
                }}
              >
                {shooterProfile.image ? (
                  <img
                    src={shooterProfile.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : isMasterOwner ? (
                  <Radar className="w-5 h-5 text-cyan-300 stroke-[2.2]" />
                ) : (
                  <span className="text-white font-bold tracking-wider text-xs">
                    {getUserInitials(shooterProfile.name, shooterProfile.callsign)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-white text-sm truncate">
                    {shooterProfile.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isMasterOwner
                        ? "text-cyan-300"
                        : isOwnerAdmin
                        ? "text-emerald-300"
                        : "text-amber-400"
                    }`}
                  >
                    [{shooterProfile.callsign}]
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                    {shooterProfile.badgeText}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPass();
                }}
                className="py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>MEMBER PASS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditProfile?.();
                }}
                className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>EDIT PROFILE</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
              Frequencies & Comms
            </span>

            {/* Direct Comms (1-on-1) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDirectChats();
              }}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Direct Comms (1-on-1)</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Private encrypted channels
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadDmCount > 0 && (
                  <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadDmCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </button>

            {/* Public Channel Selector */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChannels();
              }}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Match Channels</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Switch public rooms
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Tools & Utilities */}
          <div className="space-y-1 pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
              Match Tools & Intel
            </span>

            {/* Shooter Profiles Directory */}
            <Link
              href="/shooters"
              onClick={onClose}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Shooter Directory</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Verified match competitor profiles
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Tactical Audio FX</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Chirps and incoming alerts
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  soundEnabled
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {soundEnabled ? "ON" : "OFF"}
              </span>
            </button>

            {/* Fullscreen Handheld Mode */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onToggleFullscreen();
              }}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Handheld Fullscreen</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isFullscreen ? "Exit immersive view" : "Maximize screen space"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Guided Tour */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTour();
              }}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Interactive Tour</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Replay feature walkthrough
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Terms of Use & Safety Code of Conduct */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTerms();
              }}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Code of Conduct</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Match rules & safety policy
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Admin Console (Admin/Owner only) */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="w-full p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 text-emerald-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Admin Console</div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Master controls & roster
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Sign-out button */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Net</span>
          </button>
        </div>
      </div>
    </div>
  );
}
