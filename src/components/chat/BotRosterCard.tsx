"use client";

import React from "react";
import {
  BOT_PERSONAS,
  BotPersona,
  BotSpeed,
  computeBotStats,
  triggerSingleBotTransmission,
} from "@/lib/chat-bots";
import { ChatMessage } from "@/lib/types";
import {
  playRealCommsChirp,
  playBotTelemetryChirp,
  unlockAudio,
} from "@/lib/chat-audio";
import {
  X,
  Bot,
  Zap,
  Radio,
  Crosshair,
  Volume2,
  Activity,
  CheckCircle2,
  Sparkles,
  Users,
  Target,
  Sliders,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";

interface BotRosterCardProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  botsEnabled: boolean;
  onToggleBots: () => void;
  botSpeed: BotSpeed;
  onChangeSpeed: (speed: BotSpeed) => void;
  currentChannel: string;
  onAddBotMessage: (msg: ChatMessage) => void;
  soundEnabled: boolean;
  badActorEnabled?: boolean;
  onToggleBadActor?: () => void;
}

export function BotRosterCard({
  isOpen,
  onClose,
  messages,
  botsEnabled,
  onToggleBots,
  botSpeed,
  onChangeSpeed,
  currentChannel,
  onAddBotMessage,
  soundEnabled,
  badActorEnabled = true,
  onToggleBadActor,
}: BotRosterCardProps) {
  if (!isOpen) return null;

  const { totalBotMessages, totalDopeDrops, botStats } = computeBotStats(messages);

  const handleManualTrigger = (botId: string, forceDope?: boolean, forceViolation?: boolean) => {
    unlockAudio();
    const newMsg = triggerSingleBotTransmission(
      botId,
      currentChannel,
      { addMessage: onAddBotMessage },
      forceDope,
      forceViolation
    );
    if (newMsg && soundEnabled) {
      playBotTelemetryChirp();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090C14] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-wide">
                  TEST BOT FLEET (DEVELOPER QA & ONBOARDING)
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    botsEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      botsEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  {botsEnabled ? "6 TEST BOTS LIVE" : "TEST BOTS STANDBY"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                Onboarding stress test bots • Chat simulators & AI moderation testers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shrink-0"
            title="Close Card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fleet Master Control Bar & Audio Tone Station */}
        <div className="shrink-0 p-3 sm:p-4 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Global Metrics */}
          <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Total Bot Chats</span>
              <span className="text-base sm:text-lg font-bold text-cyan-300">{totalBotMessages}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">DOPE Drops</span>
              <span className="text-base sm:text-lg font-bold text-amber-400">{totalDopeDrops}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Target Channel</span>
              <span className="text-xs font-bold text-emerald-400 truncate max-w-[130px] block">
                #{currentChannel}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase">Fleet Comms</span>
              <span className="text-xs font-bold text-purple-300 block">
                6 Active Bots
              </span>
            </div>
          </div>

          {/* Controls: Master Toggle, Speed, and Tone Testing */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {/* Tone Station Buttons */}
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playRealCommsChirp();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] flex items-center gap-1.5 font-bold transition-all active:scale-95 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
              title="Audition Tactical VHF Radio Roger Tone (Real Human Chats)"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Chat Tone</span>
            </button>

            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playBotTelemetryChirp();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] flex items-center gap-1.5 font-bold transition-all active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              title="Audition Digital Synthetic Telemetry Tone (Bot Chats)"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bot Chat Tone</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <span className="text-slate-400 text-[10px]">Speed:</span>
              <select
                value={botSpeed}
                onChange={(e) => {
                  unlockAudio();
                  onChangeSpeed(e.target.value as BotSpeed);
                }}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="FAST" className="bg-slate-900 text-white">FAST (4-12s)</option>
                <option value="NORMAL" className="bg-slate-900 text-white">NORMAL (15-45s)</option>
                <option value="SLOW" className="bg-slate-900 text-white">SLOW (45-90s)</option>
              </select>
            </div>

            {/* AI Moderator Stress Test (Bad Actor) Toggle */}
            {onToggleBadActor && (
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  onToggleBadActor();
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
                  badActorEnabled
                    ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                }`}
                title="Toggle AI Moderator Stress Test (Causes bad actor bot to occasionally break guidelines to test Plink)"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${badActorEnabled ? "text-red-400" : "text-slate-500"}`} />
                <span>AI Mod Stress: {badActorEnabled ? "ON" : "OFF"}</span>
              </button>
            )}

            {/* Master Start / Pause Toggle */}
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                onToggleBots();
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                botsEnabled
                  ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              {botsEnabled ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Bots</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Bots</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Bots Roster Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 chat-scroll">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Autonomous Bot Personas (6 Active Marksmen)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Tap &ldquo;Transmit Now&rdquo; to test any bot instantly
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {BOT_PERSONAS.map((bot) => {
              const stat = botStats[bot.id];
              const isMatchDirector = bot.role === "MATCH_DIRECTOR";
              const isOpenPro = bot.badgeText.includes("PRO");

              return (
                <div
                  key={bot.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-3 ${
                    isMatchDirector
                      ? "bg-gradient-to-br from-amber-950/30 via-black/80 to-yellow-950/20 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : isOpenPro
                      ? "bg-gradient-to-br from-cyan-950/30 via-black/80 to-blue-950/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      : "bg-gradient-to-br from-purple-950/30 via-black/80 to-slate-950/40 border-purple-500/30"
                  }`}
                >
                  {/* Bot Header: Avatar, Name, Callsign, Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border shrink-0 ${
                          isMatchDirector
                            ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : isOpenPro
                            ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-black border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                            : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-300"
                        }`}
                      >
                        {bot.callsign.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">{bot.name}</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            [{bot.callsign}]
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase ${
                              isMatchDirector
                                ? "bg-amber-500 text-black"
                                : isOpenPro
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {bot.badgeText}
                          </span>
                          {bot.isBadActor && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1"
                              title="Designated AI Moderator Stress Test Actor"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                              AI MOD TESTER
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            {bot.division}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live status dot */}
                    <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          botsEnabled ? "bg-emerald-400 animate-ping" : "bg-slate-500"
                        }`}
                      />
                      <span className={botsEnabled ? "text-emerald-400" : "text-slate-500"}>
                        {botsEnabled ? "ON NET" : "STANDBY"}
                      </span>
                    </div>
                  </div>

                  {/* Rig Details */}
                  <div className="text-[11px] font-mono text-slate-300 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 truncate">
                    <span className="text-slate-400">Rig:</span> {bot.rifleSetup}
                  </div>

                  {/* Live Counts & Metrics */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase block">Chats Sent</span>
                      <span className="text-sm font-bold text-cyan-300">
                        {stat?.messageCount || 0}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase block">DOPE Drops</span>
                      <span className="text-sm font-bold text-amber-400">
                        {stat?.dopeCount || 0}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase block">Reactions</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {stat?.reactionCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Last Active & Manual Trigger Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {stat?.lastTimestamp ? (
                        <span>
                          Last in <strong className="text-slate-200">#{stat.lastChannel}</strong> at {stat.lastTimestamp}
                        </span>
                      ) : (
                        <span>Ready on primary frequencies</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {bot.isBadActor && (
                        <button
                          type="button"
                          onClick={() => handleManualTrigger(bot.id, false, true)}
                          className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 transition-all active:scale-95 flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.25)]"
                          title="Trigger a simulated rule violation from this bot to test Plink AI Moderator"
                        >
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>Test Violation</span>
                        </button>
                      )}

                      {bot.dopeDropRate > 0.1 && (
                        <button
                          type="button"
                          onClick={() => handleManualTrigger(bot.id, true)}
                          className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-[10px] font-mono font-bold text-amber-300 transition-all active:scale-95 flex items-center gap-1"
                          title="Trigger DOPE Drop from this bot"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>DOPE</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleManualTrigger(bot.id, false)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 transition-all active:scale-95 flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                        title="Transmit regular message from this bot now"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Transmit Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Footer Note */}
        <div className="shrink-0 p-3 sm:p-4 bg-black/80 border-t border-white/10 text-center font-mono text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            Real user transmissions use <strong className="text-amber-300">Tactical VHF Roger Burst</strong>. Bot transmissions use <strong className="text-cyan-300">Digital Cyber Telemetry</strong>.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
