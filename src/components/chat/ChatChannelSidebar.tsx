"use client";

import React from "react";
import { MessageSquare, Flame, Crosshair } from "lucide-react";


export interface ChatChannelSidebarProps {
  activeNetTab: "PRO" | "PUBLIC";
  visibleChannels: any[];
  currentChannel: string;
  setCurrentChannel: (id: string) => void;
  channelEngagementMap: Record<string, { postCount: number; reactionCount: number; dopeCount: number }>;
  setIsDopeModalOpen: (val: boolean) => void;
}

export function ChatChannelSidebar({
  activeNetTab,
  visibleChannels,
  currentChannel,
  setCurrentChannel,
  channelEngagementMap,
  setIsDopeModalOpen,
}: ChatChannelSidebarProps) {
  return (
    <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0">
      <div className="ios-glass rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between px-1 mb-3 shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Official Match Frequency
          </span>
          <span className="text-[10px] font-mono text-amber-400">
            {visibleChannels.reduce((acc, c) => acc + c.activeUsers, 0)} Active Shooters
          </span>
        </div>

        {/* Channel Feed */}
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
          {visibleChannels.map((ch) => {
            const isActive = currentChannel === ch.id;
            const engagement = channelEngagementMap[ch.id] || { postCount: 0, reactionCount: 0, dopeCount: 0 };
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setCurrentChannel(ch.id)}
                data-telemetry={`chat_channel_${ch.id}`}
                className={`w-full p-3 rounded-2xl text-left transition-all border ${
                  isActive
                    ? "ios-glass bg-amber-500/15 border-amber-500/40 shadow-tactical-glow text-white"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                    <span className={isActive ? "text-amber-400" : "text-slate-500"}>#</span>
                    <span>{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Post Counter on any Card */}
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <MessageSquare className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{engagement.postCount} {engagement.postCount === 1 ? "post" : "posts"}</span>
                    </span>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                      isActive ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"
                    }`}>
                      {ch.badge}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400 line-clamp-1 flex-1">
                    {ch.desc}
                  </p>
                  {engagement.reactionCount > 0 && (
                    <span className="text-[9px] font-mono text-amber-300/80 flex items-center gap-0.5 shrink-0 font-bold">
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                      {engagement.reactionCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* DOPE Drop Action Box */}
        <div className="pt-3 border-t border-white/10 space-y-2 shrink-0 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              Tactical DOPE Card
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Holston 340y Spec</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDopeModalOpen(true)}
            data-telemetry="chat_open_dope_modal"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Crosshair className="w-4 h-4" />
            <span>DROP VERIFIED DOPE CARD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
