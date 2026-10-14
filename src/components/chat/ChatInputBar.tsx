"use client";

import React, { RefObject } from "react";
import { Mic, Crosshair, Send, Camera, X } from "lucide-react";


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
  pendingImage?: string | null;
  setPendingImage?: (val: string | null) => void;
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
  pendingImage = null,
  setPendingImage,
}: ChatInputBarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setPendingImage) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.78);
          setPendingImage(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <>
      {/* TRANSMITTER INPUT BAR */}
      <form id="tour-step-ptt" onSubmit={handleSendMessage} className="p-2 md:p-4 bg-black/85 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {/* Hidden photo file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Pending Image Attachment Preview */}
        {pendingImage && (
          <div className="mb-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 animate-fadeIn">
            <img
              src={pendingImage}
              alt="Photo preview"
              className="w-9 h-9 object-cover rounded-lg border border-amber-400/40 shrink-0"
            />
            <div className="text-left">
              <span className="text-xs font-mono font-bold text-amber-300 block">Photo Attached</span>
              <span className="text-[10px] text-slate-400 font-mono">Ready to transmit</span>
            </div>
            {setPendingImage && (
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="p-1 rounded-full hover:bg-black/40 text-slate-400 hover:text-white transition-colors ml-1"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Main text input */}
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening…"
                : pendingImage
                ? "Add an optional caption..."
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

          {/* Photo upload camera button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 md:p-3 rounded-full md:rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              pendingImage
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Attach target group, barricade, or rig photo"
          >
            <Camera className="w-4 h-4 md:w-5 md:h-5" />
          </button>

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
