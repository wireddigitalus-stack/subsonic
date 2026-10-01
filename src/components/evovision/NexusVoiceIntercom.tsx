"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, X, Sparkles, Send, Radio, Terminal } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { playNexusCommsChirp } from "@/lib/chat-audio";

export type NexusVoiceState = "idle" | "listening" | "thinking" | "speaking";

interface NexusVoiceIntercomProps {
  onVoiceStateChange?: (state: NexusVoiceState) => void;
  externalTrigger?: number; // signal to initiate listening (e.g. from clicking NEXUS node)
  dashboardContext?: {
    activeFilter?: string;
    expandedCount?: number;
    totalNodes?: number;
    registeredCount?: number;
  };
}

export function NexusVoiceIntercom({
  onVoiceStateChange,
  externalTrigger,
  dashboardContext,
}: NexusVoiceIntercomProps) {
  const [voiceState, setVoiceState] = useState<NexusVoiceState>("idle");
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ role: "user" | "nexus"; text: string; timestamp: string }>
  >([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [fallbackInput, setFallbackInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);

  // Sync state upward to parent (for 3D/2D Canvas NEXUS sphere animations)
  useEffect(() => {
    if (onVoiceStateChange) {
      onVoiceStateChange(voiceState);
    }
  }, [voiceState, onVoiceStateChange]);

  // Speech Synthesis Hook (TTS)
  const {
    isSupported: isTtsSupported,
    voices,
    selectedVoiceUri,
    selectVoice,
    speak,
    stop: stopSpeaking,
    isSpeaking,
    rate,
    setRate,
    pitch,
    setPitch,
  } = useSpeechSynthesis();

  // Handle Query Submission to /api/nexus/voice
  const handleQuerySubmit = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) {
        setVoiceState("idle");
        return;
      }

      setVoiceState("thinking");
      setHudVisible(true);
      playNexusCommsChirp("ptt_off");

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTranscriptHistory((prev) => [
        ...prev.slice(-4),
        { role: "user", text: queryText, timestamp },
      ]);

      try {
        const res = await fetch("/api/nexus/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: queryText,
            context: dashboardContext,
          }),
        });

        if (!res.ok) {
          throw new Error("NEXUS Brain API failed");
        }

        const data = await res.json();
        const responseText =
          data.text ||
          "Telemetry link verified. Range Officer and Society systems are standing by.";

        playNexusCommsChirp("response");

        setTranscriptHistory((prev) => [
          ...prev.slice(-4),
          { role: "nexus", text: responseText, timestamp },
        ]);

        if (!isMuted) {
          setVoiceState("speaking");
          speak(responseText, () => {
            setVoiceState("idle");
          });
        } else {
          setVoiceState("idle");
        }
      } catch (err) {
        console.warn("NEXUS voice query error:", err);
        const errorText =
          "NEXUS telemetry uplink temporarily interrupted. Re-establishing connection.";
        setTranscriptHistory((prev) => [
          ...prev.slice(-4),
          { role: "nexus", text: errorText, timestamp },
        ]);
        setVoiceState("idle");
      }
    },
    [dashboardContext, isMuted, speak]
  );

  // Speech Recognition Hook (STT)
  const interimTranscriptRef = useRef("");

  const {
    isSupported: isSttSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalResult: (finalText) => {
      if (finalText.trim()) {
        handleQuerySubmit(finalText);
      } else {
        setVoiceState("idle");
      }
    },
  });

  interimTranscriptRef.current = interimTranscript;

  // Watch speech recognition state & auto-recover to idle
  useEffect(() => {
    if (isListening) {
      setVoiceState("listening");
      setHudVisible(true);
    } else if (voiceState === "listening") {
      // Stopped listening: if there is captured speech in interim ref, send it; otherwise return to idle within 400ms
      const timer = setTimeout(() => {
        setVoiceState((curr) => {
          if (curr === "listening") {
            const captured = interimTranscriptRef.current?.trim();
            if (captured) {
              handleQuerySubmit(captured);
              return "thinking";
            }
            return "idle";
          }
          return curr;
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isListening, voiceState, handleQuerySubmit]);

  // Safety timer: maximum 12s listening session
  useEffect(() => {
    if (voiceState === "listening") {
      const timeout = setTimeout(() => {
        stopListening();
        setVoiceState("idle");
      }, 12000);
      return () => clearTimeout(timeout);
    }
  }, [voiceState, stopListening]);

  const pttPressTimeRef = useRef<number>(0);

  // Handle Push-To-Talk Press
  const handlePttDown = useCallback(() => {
    pttPressTimeRef.current = Date.now();
    if (voiceState === "speaking") {
      stopSpeaking();
    }
    resetTranscript();
    playNexusCommsChirp("ptt_on");
    startListening();
  }, [voiceState, stopSpeaking, resetTranscript, startListening]);

  // Handle Push-To-Talk Release (for press & hold)
  const handlePttUp = useCallback(() => {
    const holdDuration = Date.now() - pttPressTimeRef.current;
    if (holdDuration > 350 && isListening) {
      stopListening();
    }
  }, [isListening, stopListening]);

  // Handle PTT Click (Tap to toggle on/off)
  const handlePttClick = useCallback(() => {
    if (voiceState === "speaking") {
      stopSpeaking();
      setVoiceState("idle");
      return;
    }
    if (voiceState === "listening") {
      stopListening();
      return;
    }
    if (voiceState === "idle") {
      handlePttDown();
    }
  }, [voiceState, stopSpeaking, stopListening, handlePttDown]);

  // Cancel listening manually
  const handleCancelListening = useCallback(() => {
    abortListening();
    playNexusCommsChirp("ptt_off");
    setVoiceState("idle");
  }, [abortListening]);

  // Stop speaking manually
  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setVoiceState("idle");
  }, [stopSpeaking]);

  // External trigger (e.g. clicking NEXUS sphere in canvas)
  const prevTriggerRef = useRef(externalTrigger);
  useEffect(() => {
    if (externalTrigger && externalTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = externalTrigger;
      setHudVisible(true);
      handlePttDown();
    }
  }, [externalTrigger, handlePttDown]);

  // Spacebar Push-To-Talk Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat && voiceState === "idle") {
        e.preventDefault();
        handlePttDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && voiceState === "listening") {
        e.preventDefault();
        handlePttUp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handlePttDown, handlePttUp, voiceState]);

  // Auto-scroll transcript container to bottom as messages flow in
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hudVisible && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptHistory, interimTranscript, voiceState, hudVisible]);

  // ESC key to close full-screen intercom terminal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hudVisible) {
        setHudVisible(false);
        if (isSpeaking) stopSpeaking();
        if (isListening) abortListening();
        setVoiceState("idle");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [hudVisible, isSpeaking, isListening, stopSpeaking, abortListening]);

  return (
    <>
      {/* ─── MINI FLOATING TRIGGER (When Intercom is Idle / Closed) ─────────── */}
      {!hudVisible && (
        <button
          type="button"
          onClick={() => {
            setHudVisible(true);
            handlePttDown();
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-[#070D18]/90 hover:bg-[#0A1628] backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2.5 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-95 transition-all select-none group cursor-pointer"
          title="Open NEXUS Holographic Voice Terminal"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="tracking-wider">NEXUS VOICE</span>
        </button>
      )}

      {/* ─── FULL-SCREEN IMMERSIVE HOLOGRAPHIC TERMINAL ──────────────────── */}
      {hudVisible && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300 overflow-hidden">
          {/* Ambient Radial Background Glow */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <div
              className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px] sm:w-[650px] h-[400px] sm:h-[500px] rounded-full blur-[140px] transition-all duration-700 ${
                voiceState === "listening"
                  ? "bg-cyan-500/25"
                  : voiceState === "thinking"
                  ? "bg-amber-500/20"
                  : voiceState === "speaking"
                  ? "bg-emerald-500/25"
                  : "bg-cyan-600/10"
              }`}
            />
          </div>

          {/* 1. Top Minimalist HUD Header */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between z-10 shrink-0">
            {/* Telemetry Status Pill */}
            <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/85 border border-white/10 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    voiceState === "listening"
                      ? "bg-cyan-400"
                      : voiceState === "thinking"
                      ? "bg-amber-400"
                      : voiceState === "speaking"
                      ? "bg-emerald-400"
                      : "bg-slate-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    voiceState === "listening"
                      ? "bg-cyan-400"
                      : voiceState === "thinking"
                      ? "bg-amber-400"
                      : voiceState === "speaking"
                      ? "bg-emerald-400"
                      : "bg-slate-500"
                  }`}
                />
              </span>
              <span className="font-mono text-xs font-black tracking-wider text-white uppercase">
                NEXUS UPLINK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-widest font-bold text-cyan-400">
                {voiceState === "listening"
                  ? "LISTENING"
                  : voiceState === "thinking"
                  ? "ANALYZING"
                  : voiceState === "speaking"
                  ? "SPEAKING"
                  : "READY"}
              </span>
            </div>

            {/* Header Action Buttons (Mute, Settings, Close) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full border transition-all ${
                  isMuted
                    ? "bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-md shadow-rose-950"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowVoiceModal(true)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-all"
                title="Voice Profile & Speed Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setHudVisible(false);
                  if (isSpeaking) stopSpeaking();
                  if (isListening) abortListening();
                  setVoiceState("idle");
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer"
                title="Close Comms Terminal (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Center Message Stream with Gradient Fade to Transparent at Top */}
          <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 flex flex-col justify-end overflow-hidden py-3 sm:py-6 relative min-h-0">
            <div className="overflow-y-auto space-y-4 pr-1 text-sm font-mono scrollbar-none nexus-transcript-mask">
              {/* Empty state: welcome & interactive tactical prompt chips */}
              {transcriptHistory.length === 0 && !interimTranscript && (
                <div className="text-center py-6 sm:py-10 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-mono text-cyan-300 font-bold uppercase tracking-wider">
                      NEXUS TACTICAL AI ONLINE
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Ask about competitors, squads, match operations, 300-yard DOPE, or Bristol weather.
                    </p>
                  </div>

                  {/* Interactive Quick-Prompt Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {[
                      { label: "Who is registered?", q: "Who is registered for the match?" },
                      { label: "Stage 8 DOPE", q: "What is the DOPE for Stage 8?" },
                      { label: "Bristol Range Weather", q: "What is the Bristol weather forecast?" },
                      { label: "Match Director Info", q: "Who is the Match Director?" },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleQuerySubmit(chip.q)}
                        className="px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-mono transition-all active:scale-95 cursor-pointer shadow-sm shadow-cyan-950"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Log Flow */}
              {transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`space-y-1.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                    item.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider ${
                      item.role === "user" ? "justify-end text-slate-400" : "text-cyan-400"
                    }`}
                  >
                    <span>{item.role === "user" ? "YOU" : "◆ NEXUS"}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{item.timestamp}</span>
                  </div>

                  <div
                    className={`inline-block p-3 sm:p-4 rounded-2xl leading-relaxed text-xs sm:text-sm max-w-[88%] text-left ${
                      item.role === "user"
                        ? "bg-slate-800/60 border border-slate-700/60 text-slate-100 rounded-br-none ml-auto"
                        : "bg-cyan-950/30 border border-cyan-500/30 text-cyan-50 rounded-bl-none shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}

              {/* Live Streaming Transcribing Preview */}
              {interimTranscript && (
                <div className="space-y-1.5 text-right animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-end gap-1.5">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>TRANSMITTING...</span>
                  </div>
                  <div className="inline-block p-3 sm:p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 text-cyan-200 text-xs sm:text-sm max-w-[88%] text-left animate-pulse">
                    {interimTranscript}
                  </div>
                </div>
              )}

              {/* Thinking / Analyzing Status */}
              {voiceState === "thinking" && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs sm:text-sm w-fit animate-in fade-in">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="font-mono">NEXUS analyzing tactical telemetry & records...</span>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* 3. Bottom Control Dock: Centered Large Mic Button & Controls */}
          <div className="w-full max-w-xl mx-auto px-4 pb-6 sm:pb-8 flex flex-col items-center gap-3 z-10 shrink-0">
            {/* Optional Slide-Up Text Input Fallback Bar */}
            {showTextFallback && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (fallbackInput.trim()) {
                    handleQuerySubmit(fallbackInput);
                    setFallbackInput("");
                  }
                }}
                className="w-full flex items-center gap-2 p-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 mb-1"
              >
                <input
                  type="text"
                  value={fallbackInput}
                  onChange={(e) => setFallbackInput(e.target.value)}
                  placeholder="Type tactical query for NEXUS..."
                  className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!fallbackInput.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-bold rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND</span>
                </button>
              </form>
            )}

            {/* Center Action Row: Centered Large Mic Button flanked by Cancel / Stop */}
            <div className="relative flex items-center justify-center gap-4 sm:gap-6 w-full">
              {/* Flanking Cancel button when listening */}
              {voiceState === "listening" && (
                <button
                  type="button"
                  onClick={handleCancelListening}
                  className="h-10 px-4 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>
              )}

              {/* Flanking Stop button when speaking */}
              {voiceState === "speaking" && (
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="h-10 px-4 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span>STOP</span>
                </button>
              )}

              {/* MAIN CENTERED PTT MIC BUTTON (w-20 h-20 sm:w-24 sm:h-24) */}
              <div className="relative flex items-center justify-center group">
                {/* Concentric Sonar Pulse Rings (when listening) */}
                {voiceState === "listening" && (
                  <>
                    <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-400 animate-sonar-pulse pointer-events-none" />
                    <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-cyan-400 animate-sonar-pulse-delayed pointer-events-none" />
                  </>
                )}

                {/* Ambient Glow */}
                <div
                  className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 ${
                    voiceState === "listening"
                      ? "bg-cyan-400 opacity-90"
                      : voiceState === "thinking"
                      ? "bg-amber-400 opacity-80 animate-spin"
                      : voiceState === "speaking"
                      ? "bg-emerald-400 opacity-90 animate-pulse"
                      : "bg-cyan-600/30 group-hover:bg-cyan-500/50 opacity-50"
                  }`}
                />

                {/* Large Circular Button */}
                <button
                  type="button"
                  onClick={handlePttClick}
                  onMouseDown={handlePttDown}
                  onMouseUp={handlePttUp}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePttDown();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handlePttUp();
                  }}
                  className={`w-20 h-20 sm:w-24 sm:h-24 relative rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-2xl active:scale-90 cursor-pointer select-none ${
                    voiceState === "listening"
                      ? "bg-gradient-to-tr from-cyan-400 to-cyan-200 text-slate-950 ring-4 ring-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                      : voiceState === "thinking"
                      ? "bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 ring-4 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.5)]"
                      : voiceState === "speaking"
                      ? "bg-gradient-to-tr from-emerald-400 to-teal-200 text-slate-950 ring-4 ring-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-gentle-breathe"
                      : "bg-[#0A1424] hover:bg-[#0E1E36] text-cyan-300 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
                  }`}
                >
                  {voiceState === "listening" ? (
                    <>
                      <Radio className="w-8 h-8 animate-pulse text-slate-950" />
                      <span className="text-[9px] font-mono font-black tracking-tight uppercase">SEND</span>
                    </>
                  ) : voiceState === "thinking" ? (
                    <>
                      <Sparkles className="w-8 h-8 animate-spin text-slate-950" />
                      <span className="text-[9px] font-mono font-black tracking-tight uppercase">AI</span>
                    </>
                  ) : voiceState === "speaking" ? (
                    <>
                      <Volume2 className="w-8 h-8 animate-pulse text-slate-950" />
                      <span className="text-[9px] font-mono font-black tracking-tight uppercase">MUTE</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-mono font-bold tracking-tight uppercase text-cyan-300">TALK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* State Label & Hints below Button */}
            <div className="text-center space-y-1">
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
                {voiceState === "listening"
                  ? "LISTENING • TAP OR RELEASE TO SEND"
                  : voiceState === "thinking"
                  ? "NEXUS IS PROCESSING..."
                  : voiceState === "speaking"
                  ? "NEXUS TRANSMITTING • TAP TO HALT"
                  : "TAP OR HOLD TO SPEAK"}
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowTextFallback(!showTextFallback)}
                  className="hover:text-cyan-400 flex items-center gap-1 transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  <Terminal className="w-3 h-3" />
                  <span>{showTextFallback ? "Hide keyboard" : "Type question"}</span>
                </button>
                <span>•</span>
                <span className="hidden sm:inline">SPACEBAR to talk</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">ESC to exit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VOICE SELECTION MODAL ─────────────────────────────────────── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#080E1C] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/80">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  NEXUS Voice Synthesizer
                </h3>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Select the voice profile synthesized from your device. NEXUS utilizes your operating system’s high-precision speech engine.
            </p>

            {/* Voices List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 mb-4 scrollbar-thin scrollbar-thumb-cyan-500/20 font-mono text-xs">
              {voices.length === 0 ? (
                <div className="text-slate-500 text-center py-4">
                  Detecting device audio synthesizers...
                </div>
              ) : (
                voices
                  .filter((v) => v.lang.startsWith("en") || !v.lang)
                  .map((voice) => {
                    const isSelected = voice.voiceURI === selectedVoiceUri;
                    return (
                      <button
                        key={voice.voiceURI}
                        onClick={() => {
                          selectVoice(voice.voiceURI);
                          speak("NEXUS voice synthesis calibrated. Standing by for telemetry queries.");
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950"
                            : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-850 hover:border-white/10"
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold">{voice.name}</span>
                          <span className="ml-2 text-[10px] text-slate-500 uppercase">
                            ({voice.lang || "en"})
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold uppercase">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })
              )}
            </div>

            {/* Voice Pitch & Rate Controls */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 font-mono text-xs text-slate-300">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Speed ({rate.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Pitch ({pitch.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.15"
                  step="0.02"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowVoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-colors"
              >
                Confirm Voice Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
