"use client";

import React, { RefObject } from "react";
import { Mic, Crosshair, Send } from "lucide-react";


export interface ChatInputBarProps {
  handleSendMessage: (e: React.FormEvent) => void;
  isListening: boolean;
  currentChannelData: { name: string };
  inputText: string;
  handleInputChange: (val: string) => void;
  messagesContainerRef: RefObject<HTMLDivElement>;
  handlePushToTalk: () => void;
  setIsDopeModalOpen: (val: boolean) => void;
  isAiScanning: boolean;
  shooterProfile: any;
  scrollContainerToBottom?: (smooth?: boolean) => void;
}

export function ChatInputBar({
  handleSendMessage,
  isListening,
  currentChannelData,
  inputText,
  handleInputChange,
  messagesContainerRef,
  handlePushToTalk,
  setIsDopeModalOpen,
  isAiScanning,
  shooterProfile,
  scrollContainerToBottom,
}: ChatInputBarProps) {
  return (
    <>
      {/* TRANSMITTER INPUT BAR */}
      <form id="tour-step-ptt" onSubmit={handleSendMessage} className="p-2 md:p-4 bg-black/85 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Main text input */}
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening…"
                : currentChannelData.name.startsWith("dm:")
                ? `Direct message to ${currentChannelData.name.replace("dm: ", "").toUpperCase()}...`
                : typeof window !== "undefined" && window.innerWidth < 768
                ? "Message..."
                : `Broadcast to #${currentChannelData.name}...`
            }
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              // When keyboard opens or input is focused, smoothly scroll upward so the newest bubble stays fully visible above text field
              setTimeout(() => {
                if (scrollContainerToBottom) {
                  scrollContainerToBottom(true);
                } else if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
              }, 120);
              setTimeout(() => {
                if (scrollContainerToBottom) {
                  scrollContainerToBottom(true);
                } else if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
              }, 320);
            }}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
            autoComplete="off"
            className="flex-1 min-w-0 px-3 py-2.5 md:px-4 md:py-3 rounded-full md:rounded-2xl bg-white/[0.06] border border-white/10 text-white text-sm md:text-base focus:border-amber-400 focus:outline-none placeholder:text-slate-400 placeholder:text-sm"
          />

          {/* Push-to-Talk mic button */}
          <button
            type="button"
            onClick={handlePushToTalk}
            className={`p-2.5 md:p-3 rounded-full md:rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? "bg-red-500 border-red-400 text-white animate-pulse"
                : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-300 hover:text-white"
            }`}
            title={isListening ? "Listening…" : "Voice input"}
          >
            <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isListening ? "text-white" : "text-slate-300"}`} />
          </button>

          {/* DOPE card button — desktop only */}
          <button
            id="tour-step-dope"
            type="button"
            onClick={() => setIsDopeModalOpen(true)}
            className="hidden md:flex p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-cyan-300 hover:text-cyan-200 transition-all items-center gap-1 text-sm font-mono shrink-0"
            title="Drop DOPE Card"
          >
            <Crosshair className="w-4 h-4" />
            <span>DOPE</span>
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={isAiScanning}
            data-telemetry="chat_send_button"
            className="p-2.5 md:p-3 md:px-5 rounded-full md:rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold active:scale-95 transition-all flex items-center gap-1.5 text-sm disabled:opacity-50 shrink-0"
            title="Send"
          >
            {isAiScanning ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden md:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Transmitting footer: Hidden on mobile */}
        <div className="hidden md:flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <span>
            Transmitting as: <strong className="text-slate-200">[{shooterProfile.callsign}]</strong>
          </span>
          {isListening && (
            <span className="flex items-center gap-1.5 text-red-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              LISTENING — speak now
            </span>
          )}
        </div>
      </form>
    </>
  );
}
