"use client";

import React, { useEffect, useState } from "react";
import { 
  Radio, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Crosshair,
  Lock,
  Unlock
} from "lucide-react";
import { playBotTelemetryChirp } from "@/lib/chat-audio";

interface HeroCrosshairLoaderProps {
  onComplete: () => void;
  durationMs?: number;
}

export function HeroCrosshairLoader({ 
  onComplete, 
  durationMs = 1400 
}: HeroCrosshairLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        try {
          playBotTelemetryChirp();
        } catch {
          // ignore audio restriction
        }
        setTimeout(() => {
          onComplete();
        }, 120);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  // Telemetry status text based on progress
  const getStatusText = () => {
    if (progress < 40) {
      return "ACQUIRING ENCRYPTED STAGE NET (462.5625 MHz)...";
    } else if (progress < 80) {
      return "TRUEING BALLISTIC TELEMETRY & ATMOSPHERICS...";
    } else {
      return "STAGE CLEARANCE VERIFIED • ENTERING TERMINAL";
    }
  };

  return (
    <div className="relative ios-glass-card rounded-3xl border-2 border-amber-500/40 shadow-tactical-glow overflow-hidden bg-gradient-to-b from-black/95 via-[#07090E]/95 to-black min-h-[290px] sm:min-h-[440px] flex flex-col justify-between transition-all select-none">
      
      {/* 1. Top HUD Bar */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 bg-black/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
            <span className="text-white font-black tracking-wider">RETICLE LOCK</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">CALIBRATING</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-cyan-400 font-semibold hidden sm:inline">1.4s PROTOCOL</span>
          </div>
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={onComplete}
          className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] font-mono flex items-center gap-1.5 transition-all active:scale-95 shadow-tactical-glow"
        >
          <span>SKIP LOCK</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Center Crosshair Reticle with Opposing Rotating Gapped Circles */}
      <div className="relative flex-1 flex flex-col items-center justify-center py-2 sm:py-8 overflow-hidden">
        {/* Ambient Radar Glow */}
        <div className="absolute w-48 h-48 sm:w-88 sm:h-88 rounded-full bg-amber-500/10 blur-2xl sm:blur-3xl pointer-events-none" />

        {/* Crosshair SVG Viewport */}
        <div className="relative w-40 h-40 sm:w-72 sm:h-72 flex items-center justify-center">
          
          {/* Static Corner Tactical Brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-amber-400/80" />
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-amber-400/80" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-amber-400/80" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-amber-400/80" />

          <svg
            className="w-full h-full"
            viewBox="0 0 280 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Grid Circles */}
            <circle
              cx="140"
              cy="140"
              r="130"
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
            <circle
              cx="140"
              cy="140"
              r="100"
              stroke="#ffffff"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
            <circle
              cx="140"
              cy="140"
              r="70"
              stroke="#ffffff"
              strokeOpacity="0.06"
              strokeWidth="1"
            />

            {/* Static Crosshair Axes (Fine Subtension Lines with Center Cutout) */}
            {/* Horizontal Line Left */}
            <line x1="20" y1="140" x2="120" y2="140" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.75" />
            {/* Horizontal Line Right */}
            <line x1="160" y1="140" x2="260" y2="140" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.75" />
            {/* Vertical Line Top */}
            <line x1="140" y1="20" x2="140" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.75" />
            {/* Vertical Line Bottom */}
            <line x1="140" y1="160" x2="140" y2="260" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.75" />

            {/* Subtension Hash Marks on Crosshairs */}
            {/* Horizontal Hashes */}
            {[-90, -70, -50, -30, 30, 50, 70, 90].map((offset) => (
              <line
                key={`h-${offset}`}
                x1={140 + offset}
                y1={offset % 20 === 0 ? 134 : 136}
                x2={140 + offset}
                y2={offset % 20 === 0 ? 146 : 144}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
            ))}
            {/* Vertical Hashes */}
            {[-90, -70, -50, -30, 30, 50, 70, 90].map((offset) => (
              <line
                key={`v-${offset}`}
                x1={offset % 20 === 0 ? 134 : 136}
                y1={140 + offset}
                x2={offset % 20 === 0 ? 146 : 144}
                y2={140 + offset}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
            ))}

            {/* RING 1 (OUTER): Rotating CLOCKWISE with Wide Distinct Gaps */}
            <g
              style={{
                transformOrigin: "140px 140px",
                animation: "spin 3.5s linear infinite"
              }}
            >
              <circle
                cx="140"
                cy="140"
                r="115"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeDasharray="95 35"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />
              {/* Outer Arc Pips */}
              <circle cx="140" cy="25" r="3" fill="#f59e0b" />
              <circle cx="140" cy="255" r="3" fill="#f59e0b" />
              <circle cx="25" cy="140" r="3" fill="#f59e0b" />
              <circle cx="255" cy="140" r="3" fill="#f59e0b" />
            </g>

            {/* RING 2 (MIDDLE): Rotating COUNTER-CLOCKWISE with Staggered Gaps */}
            <g
              style={{
                transformOrigin: "140px 140px",
                animation: "spin 2.6s linear infinite reverse"
              }}
            >
              <circle
                cx="140"
                cy="140"
                r="82"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="50 25"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />
              {/* Counter-rotating degree notches */}
              <circle cx="140" cy="58" r="2.5" fill="#38bdf8" />
              <circle cx="140" cy="222" r="2.5" fill="#38bdf8" />
            </g>

            {/* RING 3 (INNER): Rotating CLOCKWISE Faster with Segmented Dashes */}
            <g
              style={{
                transformOrigin: "140px 140px",
                animation: "spin 1.8s linear infinite"
              }}
            >
              <circle
                cx="140"
                cy="140"
                r="50"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="25 15"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
            </g>

            {/* Center Target Acquisition Pip (Center Dot & Reticle Core) */}
            <circle
              cx="140"
              cy="140"
              r="14"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            <circle
              cx="140"
              cy="140"
              r="4.5"
              fill={progress >= 90 ? "#10b981" : "#f59e0b"}
              className="animate-pulse"
            />
          </svg>

          {/* Center Coordinates & Mil Display */}
          <div className="absolute top-2 right-2 font-mono text-[9px] text-amber-400/90 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/30">
            0.1 MIL / CLK
          </div>
          <div className="absolute bottom-2 left-2 font-mono text-[9px] text-cyan-400/90 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            AZ: 285° MAG
          </div>
        </div>

        {/* Realtime Decrypt Readout */}
        <div className="mt-2 sm:mt-4 text-center space-y-0.5 sm:space-y-1.5 z-10 px-3 sm:px-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs text-amber-400 font-extrabold tracking-wider">
            {progress >= 90 ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
            <span>{getStatusText()}</span>
          </div>
          <div className="text-[9px] sm:text-[11px] font-mono text-slate-400">
            TARGET RANGE: 340 YDS • ELEV: +4.6 MIL • WIND: 0.7 MIL L
          </div>
        </div>
      </div>

      {/* 3. Bottom Progress Bar & Percentage */}
      <div className="relative w-full bg-black/80 px-3 sm:px-6 py-2 sm:py-2.5 border-t border-white/10 flex items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>TRUEING TRANSPONDER</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-24 sm:w-44 h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 transition-all duration-100 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono font-bold text-amber-400 text-xs w-8 text-right">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
