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

        if (!isMuted && isTtsSupported) {
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
    [dashboardContext, isMuted, isTtsSupported, speak]
  );

  // Speech Recognition Hook (STT)
  const {
    isSupported: isSttSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
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

  // Watch speech recognition state
  useEffect(() => {
    if (isListening) {
      setVoiceState("listening");
      setHudVisible(true);
    } else if (voiceState === "listening") {
      // Stopped listening but not yet thinking
    }
  }, [isListening, voiceState]);

  // Handle Push-To-Talk Press
  const handlePttDown = useCallback(() => {
    if (voiceState === "speaking") {
      stopSpeaking();
    }
    resetTranscript();
    playNexusCommsChirp("ptt_on");
    startListening();
  }, [voiceState, stopSpeaking, resetTranscript, startListening]);

  // Handle Push-To-Talk Release
  const handlePttUp = useCallback(() => {
    if (isListening) {
      stopListening();
    }
  }, [isListening, stopListening]);

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

  // Waveform Bar Animation Values
  const [waveAmplitudes, setWaveAmplitudes] = useState([8, 14, 20, 12, 16, 10]);
  useEffect(() => {
    if (voiceState === "listening" || voiceState === "speaking") {
      const interval = setInterval(() => {
        setWaveAmplitudes(
          Array.from({ length: 6 }, () => Math.floor(Math.random() * 24) + 6)
        );
      }, 90);
      return () => clearInterval(interval);
    } else {
      setWaveAmplitudes([4, 6, 8, 6, 8, 4]);
    }
  }, [voiceState]);

  return (
    <>
      {/* ─── FLOATING NEXUS INTERCOM HUD MEDALLION ───────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
        {/* Transcript / Response HUD Balloon */}
        {hudVisible && (
          <div className="w-[320px] sm:w-[380px] max-w-[92vw] bg-[#070D18]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-950/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
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
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  NEXUS TELEMETRY VOICE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 uppercase">
                  {voiceState}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => setShowVoiceModal(true)}
                  title="Voice Settings"
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400" />
                </button>
                <button
                  onClick={() => {
                    setHudVisible(false);
                    if (isSpeaking) stopSpeaking();
                  }}
                  title="Close HUD"
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs font-mono scrollbar-thin scrollbar-thumb-cyan-500/20">
              {transcriptHistory.length === 0 && !interimTranscript && (
                <div className="text-slate-400 text-center py-4 italic text-[11px]">
                  Press & hold the mic button or Spacebar to ask NEXUS about shooters, match ops, Bristol lodging, or DOPE.
                </div>
              )}

              {transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border ${
                    item.role === "user"
                      ? "bg-slate-900/60 border-slate-700/50 text-slate-200 ml-4"
                      : "bg-cyan-950/40 border-cyan-500/30 text-cyan-100 mr-4 shadow-sm shadow-cyan-900/40"
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-bold opacity-60 mb-0.5 uppercase">
                    <span>{item.role === "user" ? "MARKS-TRANS" : "NEXUS CORE"}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="leading-relaxed">{item.text}</div>
                </div>
              ))}

              {/* Live speech preview */}
              {interimTranscript && (
                <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-400/40 text-cyan-200 ml-4 animate-pulse">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
                    TRANSMITTING...
                  </div>
                  <div>{interimTranscript}</div>
                </div>
              )}

              {voiceState === "thinking" && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px] font-mono">Compiling range telemetry & response...</span>
                </div>
              )}
            </div>

            {/* Quick Text Fallback Input Toggle */}
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <button
                onClick={() => setShowTextFallback(!showTextFallback)}
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
              >
                <Terminal className="w-3 h-3" />
                <span>{showTextFallback ? "Hide Text Line" : "Type Question"}</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono">SPACE to talk</span>
            </div>

            {/* Text Input Row */}
            {showTextFallback && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (fallbackInput.trim()) {
                    handleQuerySubmit(fallbackInput);
                    setFallbackInput("");
                  }
                }}
                className="mt-2 flex gap-1.5"
              >
                <input
                  type="text"
                  value={fallbackInput}
                  onChange={(e) => setFallbackInput(e.target.value)}
                  placeholder="Ask NEXUS (e.g. 'Who is Leipold?')"
                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!fallbackInput.trim()}
                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold rounded-lg text-xs transition-colors flex items-center justify-center"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ─── PUSH TO TALK CONTROLLER MEDALLION ─────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Waveform indicator bars when active */}
          {(voiceState === "listening" || voiceState === "speaking") && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-black/80 border border-cyan-500/40 backdrop-blur-md shadow-lg shadow-cyan-500/20">
              {waveAmplitudes.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    voiceState === "speaking" ? "bg-amber-400" : "bg-cyan-400"
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] font-mono font-bold uppercase text-cyan-300">
                {voiceState === "speaking" ? "AI TRANSMITTING" : "VOICE UPLINK"}
              </span>
            </div>
          )}

          {/* Main PTT Button */}
          <div className="relative group">
            {/* Outer Sonar Pulse Glow Ring */}
            <div
              className={`absolute -inset-1 rounded-full blur-md transition-all duration-300 ${
                voiceState === "listening"
                  ? "bg-cyan-400 opacity-90 animate-pulse"
                  : voiceState === "thinking"
                  ? "bg-amber-400 opacity-80 animate-spin"
                  : voiceState === "speaking"
                  ? "bg-amber-400 opacity-90 animate-pulse"
                  : "bg-cyan-600/30 group-hover:bg-cyan-500/50 opacity-50"
              }`}
            />

            <button
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
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-full font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-2xl active:scale-95 ${
                voiceState === "listening"
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 ring-4 ring-cyan-400/40"
                  : voiceState === "thinking"
                  ? "bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 ring-4 ring-amber-400/40"
                  : voiceState === "speaking"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 ring-4 ring-amber-400/40"
                  : "bg-gradient-to-r from-slate-900 to-slate-950 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 hover:text-white"
              }`}
            >
              {voiceState === "listening" ? (
                <>
                  <Radio className="w-4 h-4 animate-pulse text-slate-950" />
                  <span>RELEASE TO SEND</span>
                </>
              ) : voiceState === "thinking" ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>PROCESSING...</span>
                </>
              ) : voiceState === "speaking" ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce text-slate-950" />
                  <span>NEXUS SPEAKING</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>PUSH TO TALK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── VOICE SELECTION MODAL ─────────────────────────────────────── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
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
