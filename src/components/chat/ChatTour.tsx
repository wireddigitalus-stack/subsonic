"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import { 
  Radio, 
  Mic, 
  Crosshair, 
  Bot, 
  QrCode, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Sparkles,
  Compass
} from "lucide-react";

export interface TourStep {
  id: string;
  targetId: string;
  alternateTargetIds?: string[];
  badge: string;
  title: string;
  description: string;
  proTip: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "channels",
    targetId: "tour-step-channels",
    badge: "01 / INVITATIONAL NET",
    title: "Official Invitational Frequency",
    description:
      "Tune into #invitational — the dedicated frequency for the 2026 Subsonic Society Invitational. Coordinate match operations, verify Bristol lodging, explore top restaurants, and connect with squad mates.",
    proTip: "Ask RO for lodging, food, side matches, or schedule intel anytime.",
    icon: <Radio className="w-5 h-5 text-amber-400" />,
  },
  {
    id: "ptt",
    targetId: "tour-step-ptt",
    badge: "02 / VOICE COMMS",
    title: "Push-To-Talk & Voice Input",
    description:
      "Keep your hands on the rifle. Tap the 🎙️ Mic button to dictate messages hands-free. Real-time voice transcription fills your transmitter with built-in spellcheck.",
    proTip: "Tap once to speak, tap again to finish. Transcripts are reviewed before send.",
    icon: <Mic className="w-5 h-5 text-red-400" />,
  },
  {
    id: "dope",
    targetId: "tour-step-dope",
    badge: "03 / BALLISTICS",
    title: "Tactical DOPE Drop Cards",
    description:
      "Share real-time ballistic cards directly with your squad. Drop exact target yardages, elevation in MIL/MOA, wind holdoffs, and muzzle velocity notes.",
    proTip: "DOPE drops render as high-visibility tactical telemetry cards for fast reading.",
    icon: <Crosshair className="w-5 h-5 text-cyan-400" />,
  },
  {
    id: "plink",
    targetId: "tour-step-plink",
    badge: "04 / AI RANGE OFFICER",
    title: "RO BOT — 24/7 Autonomous AI Agent",
    description:
      "Meet RO BOT 🤖, your official 24/7 Autonomous AI Assistant and Range Officer for The Hideout Invitational. RO BOT knows all details from the Competitor Packet: match schedules, side matches, Bristol hotels, dining, and local entertainment. Say 'hey ro' or ask '@ro help' anytime.",
    proTip: "Ask RO BOT naturally about Bristol hotels, BBQ, stage timing, or fly fishing.",
    icon: <Bot className="w-5 h-5 text-amber-400" />,
  },
  {
    id: "pass",
    targetId: "tour-step-pass",
    alternateTargetIds: ["tour-step-pass-mobile"],
    badge: "05 / CREDENTIALS",
    title: "Digital Member Pass & QR",
    description:
      "Access your official Subsonic Society digital credentials. Tap your Pass or callsign pill to pull up your scannable check-in QR code, serial number, and rifle build specs.",
    proTip: "Your digital pass can be saved or printed for on-site match verification.",
    icon: <QrCode className="w-5 h-5 text-emerald-400" />,
  },
];

interface ChatTourProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayChirp?: (freq?: number) => void;
}

export function ChatTour({ isOpen, onClose, onPlayChirp }: ChatTourProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const maskId = useId();

  const step = TOUR_STEPS[currentStepIdx];
  const totalSteps = TOUR_STEPS.length;
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === totalSteps - 1;

  // Measure and scroll target into view
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !step) return;

    // Look for target element, testing main ID and alternates to pick the visible one
    const candidateIds = [step.targetId, ...(step.alternateTargetIds || [])];
    let visibleEl: HTMLElement | null = null;

    for (const id of candidateIds) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          visibleEl = el;
          break;
        }
      }
    }

    if (visibleEl) {
      // Smoothly bring target into view if needed
      visibleEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });

      const timer = setTimeout(() => {
        if (visibleEl) {
          const rect = visibleEl.getBoundingClientRect();
          setTargetRect(rect);
        }
      }, 120);

      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);

    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      } else if (e.key === "ArrowRight") {
        if (!isLast) handleNext();
      } else if (e.key === "ArrowLeft") {
        if (!isFirst) handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIdx, isFirst, isLast]);

  const handleNext = () => {
    if (onPlayChirp) onPlayChirp(1200);
    if (!isLast) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (onPlayChirp) onPlayChirp(900);
    if (!isFirst) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("subsonic_chat_tour_completed", "true");
      } catch {
        // ignore
      }
    }
    if (onPlayChirp) onPlayChirp(1400);
    onClose();
  };

  const handleStepClick = (index: number) => {
    if (onPlayChirp) onPlayChirp(1000);
    setCurrentStepIdx(index);
  };

  if (!isOpen) return null;

  // Smart Adaptive Positioning:
  // If highlighted element is in the bottom 45% of the screen, anchor card at TOP so target is fully visible!
  // If highlighted element is in the top 55% of the screen, anchor card at BOTTOM so target is fully visible!
  const isTargetInBottomHalf = targetRect
    ? targetRect.top > (typeof window !== "undefined" ? window.innerHeight * 0.48 : 360)
    : false;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none animate-fadeIn overflow-hidden">
      {/* 
        SVG CUTOUT MASK:
        Cuts a 100% transparent window directly above the highlighted element.
        The surrounding backdrop is dimmed with a clean, comfortable 45% dark tint (no blur).
        Through the cutout, the user sees the real app control in 100% natural, crisp clarity!
      */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[100]">
        <defs>
          <mask id={maskId}>
            {/* White area = dimmed overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black area = 100% transparent cut-out window */}
            {targetRect && (
              <rect
                x={Math.max(4, targetRect.left - 6)}
                y={Math.max(4, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Darkened overlay with the cut-out hole */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.50)"
          mask={`url(#${maskId})`}
          className="pointer-events-auto cursor-pointer"
          onClick={handleFinish}
        />
      </svg>

      {/* TACTICAL HUD RETICLE FRAME OVER THE HIGHLIGHTED TARGET */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out z-[101]"
          style={{
            top: Math.max(4, targetRect.top - 6),
            left: Math.max(4, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Glowing Amber Reticle Box */}
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.85),inset_0_0_15px_rgba(245,158,11,0.2)] animate-pulse" />

          {/* Tactical Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-300" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-300" />
          <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-300" />
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-300" />

          {/* Floating Focus Badge */}
          <div className="absolute -top-3.5 right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px] tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.9)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            <span>{step.badge.split("/")[1]?.trim() || "FOCUS"}</span>
          </div>
        </div>
      )}

      {/* 
        TOUR BRIEFING CARD CONTAINER:
        Dynamically docks at the TOP when target is at bottom (e.g. mic, DOPE button),
        or at the BOTTOM when target is at top (e.g. channels, pass).
        Ensures the card NEVER overlaps the highlighted element!
      */}
      <div 
        className={`fixed inset-x-0 inset-y-0 z-[102] pointer-events-none flex flex-col items-center p-3 sm:p-6 transition-all duration-300 ${
          isTargetInBottomHalf 
            ? "justify-start pt-14 sm:pt-20" 
            : "justify-end pb-3 sm:pb-8"
        }`}
      >
        <div 
          className="relative pointer-events-auto w-full max-w-lg ios-glass-card bg-[#0A0D14]/95 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] rounded-3xl p-5 sm:p-7 space-y-4 sm:space-y-5 animate-scaleUp"
        >
          {/* Card Header: Breadcrumb Navigation & Close */}
          <div className="space-y-3 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>INTERACTIVE CHAT TOUR</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Step <strong className="text-amber-300">{currentStepIdx + 1}</strong> of {totalSteps}
                </span>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                  title="Close Tour (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Breadcrumb Navigation Strip */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1">
              {TOUR_STEPS.map((s, idx) => {
                const isActive = idx === currentStepIdx;
                const isPast = idx < currentStepIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 rounded-lg transition-all text-center ${
                      isActive
                        ? "bg-amber-500/20 border border-amber-500/60 text-amber-300"
                        : isPast
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.03] text-slate-500 border border-transparent hover:bg-white/5"
                    }`}
                    title={`Jump to: ${s.title}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{
                        backgroundColor: isActive ? "#F59E0B" : isPast ? "#10B981" : "#475569"
                      }} />
                      <span className="text-[10px] font-mono font-bold hidden sm:inline truncate max-w-[65px]">
                        {s.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono font-bold sm:hidden">
                        {idx + 1}
                      </span>
                    </div>
                    {/* Progress bar line */}
                    <div className={`w-full h-0.5 rounded-full ${
                      isActive ? "bg-amber-400" : isPast ? "bg-emerald-400" : "bg-white/10"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Body: Feature Title & Explanation */}
          <div className="space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {step.badge}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {step.description}
            </p>

            {/* Pro Tip Box */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="text-amber-300 font-bold uppercase">Pro Tip: </strong>
                {step.proTip}
              </div>
            </div>
          </div>

          {/* Card Footer: Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleFinish}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-xs transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>{isLast ? "Finish Tour" : "Next Step"}</span>
                {isLast ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
