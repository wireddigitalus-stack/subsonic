"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  AlertTriangle,
  Unlock,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface ChatAuthGateProps {
  authShake: boolean;
  authError: string | null;
  loginCallsign: string;
  setLoginCallsign: (val: string) => void;
  loginPasscode: string;
  setLoginPasscode: (val: string) => void;
  handleUnlockRoom: (e: React.FormEvent) => void;
}

export function ChatAuthGate({
  authShake,
  authError,
  loginCallsign,
  setLoginCallsign,
  loginPasscode,
  setLoginPasscode,
  handleUnlockRoom,
}: ChatAuthGateProps) {
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [recognizedCallsign, setRecognizedCallsign] = useState<string>("");
  const [recognizedName, setRecognizedName] = useState<string>("");
  const [resetIdentifier, setResetIdentifier] = useState<string>("");
  const [resetVerification, setResetVerification] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [confirmNewPin, setConfirmNewPin] = useState<string>("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetNotFound, setResetNotFound] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Detect if this browser previously registered or signed in (via cookie or localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let foundCallsign = "";
      let foundName = "";

      const rawFull = localStorage.getItem("subsonic_pro_full_profile");
      if (rawFull) {
        const parsed = JSON.parse(rawFull);
        if (parsed?.callsign && parsed.callsign !== "GUEST") {
          foundCallsign = String(parsed.callsign).trim().toUpperCase();
          foundName = parsed.name || "";
        }
      }

      if (!foundCallsign) {
        const rawShooter = localStorage.getItem("subsonic_shooter_profile");
        if (rawShooter) {
          const parsed = JSON.parse(rawShooter);
          if (parsed?.callsign && parsed.callsign !== "GUEST") {
            foundCallsign = String(parsed.callsign).trim().toUpperCase();
            foundName = parsed.name || "";
          }
        }
      }

      if (!foundCallsign) {
        const cookieMatch = document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("subsonic_member_callsign="));
        if (cookieMatch) {
          const val = decodeURIComponent(cookieMatch.split("=")[1] || "")
            .trim()
            .toUpperCase();
          if (val && val !== "GUEST") {
            foundCallsign = val;
          }
        }
      }

      if (foundCallsign) {
        setRecognizedCallsign(foundCallsign);
        setRecognizedName(foundName);
        if (!loginCallsign) {
          setLoginCallsign(foundCallsign);
        }
        setResetIdentifier(foundCallsign);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCurrentDeviceMatch =
    Boolean(recognizedCallsign) &&
    (resetIdentifier.trim().toUpperCase() === recognizedCallsign ||
      loginCallsign.trim().toUpperCase() === recognizedCallsign);

  const isAuthErrorProfileNotFound = Boolean(
    authError &&
      (authError.toLowerCase().includes("no published shooter profile") ||
        authError.toLowerCase().includes("finish pro shooter sign-up"))
  );

  const handleOpenForgotPin = () => {
    setResetError(null);
    setResetNotFound(false);
    setResetSuccess(false);
    if (loginCallsign.trim()) {
      setResetIdentifier(loginCallsign.trim());
    } else if (recognizedCallsign) {
      setResetIdentifier(recognizedCallsign);
    }
    setShowForgotPin(true);
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetNotFound(false);

    const targetId = (resetIdentifier || loginCallsign || recognizedCallsign).trim();
    if (!targetId) {
      setResetError("Please enter your Callsign, Full Name, or Email Address.");
      return;
    }

    if (!/^\d{4}$/.test(newPin.trim())) {
      setResetError("Please enter a new 4-digit numeric PIN.");
      return;
    }

    if (newPin.trim() !== confirmNewPin.trim()) {
      setResetError("New 4-digit PINs do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/chat/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: targetId,
          newPin: newPin.trim(),
          verification: resetVerification.trim(),
          browserCallsign: recognizedCallsign,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        if (data.code === "PROFILE_NOT_FOUND") {
          setResetNotFound(true);
        }
        setResetError(
          data.error || "Could not verify account details. Please check your entry and try again."
        );
        setResetLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        try {
          if (data.profile) {
            localStorage.setItem("subsonic_shooter_profile", JSON.stringify(data.profile));
          }
          if (data.member) {
            localStorage.setItem("subsonic_member_profile", JSON.stringify(data.member));
          }
          localStorage.setItem("subsonic_chat_authenticated", "true");
        } catch {}
      }

      setResetSuccess(true);
      setResetLoading(false);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.replace("/");
        }
      }, 600);
    } catch {
      setResetError("Network error while resetting PIN. Please try again.");
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`w-full max-w-md rounded-3xl p-6 sm:p-8 bg-zinc-950/85 backdrop-blur-xl border border-white/10 space-y-5 text-center ${
            authShake ? "animate-shake" : ""
          }`}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20 mx-auto relative">
            <Image
              src="/images/SS-RWB-LOGO.png"
              alt="Subsonic Emblem"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <Lock className="w-3 h-3" />
              <span>Subsonic Society • Member Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {showForgotPin ? "RESET 4-DIGIT PIN" : "MEMBER LOGIN"}
            </h2>
            <p className="text-xs text-slate-300">
              {showForgotPin
                ? "Set a new 4-digit login PIN for your shooter profile."
                : "Enter your Callsign (or Full Name) and 4-digit PIN to sign in."}
            </p>
          </div>

          {/* Browser Device Recognition Badge */}
          {recognizedCallsign && !showForgotPin && (
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Welcome back, <strong>{recognizedName || recognizedCallsign}</strong> ({recognizedCallsign})
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenForgotPin}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline shrink-0"
              >
                Reset PIN
              </button>
            </div>
          )}

          {!showForgotPin ? (
            <>
              {authError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono text-left space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{authError}</span>
                  </div>

                  {isAuthErrorProfileNotFound ? (
                    <Link
                      href="/invite/pro?code=SS-PRO-ZKHZ&new=1"
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-sans font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Finish Pro Shooter Sign-Up →</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenForgotPin}
                      className="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-amber-300 font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Forgot PIN? Reset Your PIN Now</span>
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleUnlockRoom} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Callsign or Full Name *</span>
                    <span className="text-[10px] text-slate-500 font-normal">e.g. ZER0DEV or Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={loginCallsign}
                    onChange={(e) => setLoginCallsign(e.target.value.toUpperCase())}
                    placeholder="Enter Callsign or Full Name..."
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs font-bold uppercase focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Login PIN</label>
                    <button
                      type="button"
                      onClick={handleOpenForgotPin}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    placeholder="Enter your 4-digit PIN..."
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Unlock className="w-4 h-4 fill-black" />
                  <span>Member Login</span>
                </button>
              </form>
            </>
          ) : (
            /* ─── FORGOT PIN / INSTANT DEVICE RESET PANEL ─── */
            <form onSubmit={handleResetPinSubmit} className="space-y-4 text-left">
              {isCurrentDeviceMatch && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Browser recognized for <strong>{recognizedCallsign}</strong> — enter your new 4-digit PIN below.
                  </span>
                </div>
              )}

              {resetError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{resetError}</span>
                  </div>
                  {resetNotFound && (
                    <Link
                      href="/invite/pro?code=SS-PRO-ZKHZ&new=1"
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-sans font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Complete Pro Shooter Sign-Up →</span>
                    </Link>
                  )}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PIN updated! Signing you in now...</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Your Callsign, Full Name, or Email *
                </label>
                <input
                  type="text"
                  required
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="e.g. ZER0DEV or Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs font-bold focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {!isCurrentDeviceMatch && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Phone (Last 4 Digits) or Email *</span>
                    <span className="text-[10px] text-slate-500 font-normal">Used at sign-up</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={resetVerification}
                    onChange={(e) => setResetVerification(e.target.value)}
                    placeholder="Last 4 digits of phone OR email address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-emerald-400">New 4-Digit PIN *</label>
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="e.g. 4829"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono text-center tracking-widest text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-emerald-400">Confirm PIN *</label>
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Re-enter"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-mono text-center tracking-widest text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{resetLoading ? "Saving New PIN..." : "Save New PIN & Sign In"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPin(false);
                  setResetError(null);
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors text-center"
              >
                ← Back to Member Login
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              ← Return to Home
            </Link>
            <Link
              href="/invite/pro?code=SS-PRO-ZKHZ&new=1"
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Haven&apos;t finished signing up?</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
