"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, Sparkles, Loader2, ShieldCheck, Tag } from "lucide-react";

interface CallsignInputProps {
  value: string;
  onChange: (callsign: string) => void;
  stateCode?: string;
  excludeMemberId?: string;
  onValidationChange?: (isAvailable: boolean, normalized: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  sublabel?: string;
}

export function CallsignInput({
  value,
  onChange,
  stateCode = "TN",
  excludeMemberId,
  onValidationChange,
  required = true,
  className = "",
  placeholder = "e.g. GHOST, APEX, REAPER",
  label = "Tactical Callsign *",
  sublabel = "Unique operative ID for chat & SEO profile",
}: CallsignInputProps) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "AVAILABLE" | "TAKEN" | "INVALID">("IDLE");
  const [message, setMessage] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanCallsign = (val: string) => {
    return val.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanCallsign(e.target.value);
    onChange(cleaned);
  };

  const selectSuggestion = (sug: string) => {
    const cleaned = cleanCallsign(sug);
    onChange(cleaned);
    setStatus("AVAILABLE");
    setMessage(`Callsign "${cleaned}" selected and verified!`);
    setSuggestions([]);
    if (onValidationChange) {
      onValidationChange(true, cleaned);
    }
  };

  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    const trimmed = value.trim();

    if (!trimmed) {
      setStatus("IDLE");
      setMessage("");
      setSuggestions([]);
      if (onValidationChange) onValidationChange(false, "");
      return;
    }

    if (trimmed.length < 2) {
      setStatus("INVALID");
      setMessage("Callsign must be at least 2 characters.");
      setSuggestions([]);
      if (onValidationChange) onValidationChange(false, trimmed);
      return;
    }

    setChecking(true);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          callsign: trimmed,
          state: stateCode,
        });
        if (excludeMemberId) {
          params.append("excludeMemberId", excludeMemberId);
        }

        const res = await fetch(`/api/callsigns/check?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isAvailable) {
            setStatus("AVAILABLE");
            setMessage(data.message || `Callsign "${data.normalized}" is available!`);
            setSuggestions([]);
            if (onValidationChange) onValidationChange(true, data.normalized);
          } else {
            setStatus("TAKEN");
            setMessage(data.message || `Callsign "${data.normalized}" is already taken.`);
            setSuggestions(data.suggestions || []);
            if (onValidationChange) onValidationChange(false, data.normalized);
          }
        } else {
          setStatus("IDLE");
        }
      } catch (err) {
        console.warn("Callsign check failed:", err);
      } finally {
        setChecking(false);
      }
    }, 320);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [value, stateCode, excludeMemberId]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </label>
        {sublabel && (
          <span className="text-[10px] text-slate-400 font-normal">
            {sublabel}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl bg-black/60 border font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all focus:outline-none ${
            status === "AVAILABLE"
              ? "border-emerald-500/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : status === "TAKEN"
              ? "border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : status === "INVALID"
              ? "border-red-500/60 text-red-300"
              : "border-white/10 text-white focus:border-amber-400"
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {checking && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          )}

          {!checking && status === "AVAILABLE" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-bold">AVAILABLE</span>
            </span>
          )}

          {!checking && status === "TAKEN" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-bold">TAKEN</span>
            </span>
          )}
        </div>
      </div>

      {/* Status Alert & Feedback Message */}
      {status === "TAKEN" && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-fadeIn">
          <div className="flex items-start gap-2 text-xs text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Callsign <strong className="text-white underline">{value}</strong> is already registered to an operative. Callsigns must be individual and unique.
            </span>
          </div>

          {suggestions.length > 0 && (
            <div className="pt-1.5 border-t border-amber-500/20 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Available Tactical Alternatives:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => selectSuggestion(sug)}
                    className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                  >
                    <span>+ {sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {status === "AVAILABLE" && (
        <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Callsign available for exclusive reservation across the Society network.</span>
        </p>
      )}

      {status === "INVALID" && (
        <p className="text-[11px] font-mono text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
