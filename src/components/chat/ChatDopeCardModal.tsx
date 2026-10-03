"use client";

import React from "react";
import { Crosshair, X } from "lucide-react";

export interface DopeFormData {
  targetDistance: string;
  targetDescription?: string;
  elevationMils: string;
  windHoldMils: string;
  windVelocity?: string;
  ammo?: string;
  notes?: string;
}

export interface ChatDopeCardModalProps {
  isDopeModalOpen: boolean;
  setIsDopeModalOpen: (val: boolean) => void;
  currentChannelData: { name: string };
  handleSendDopeCard: (e: React.FormEvent) => void;
  dopeFormData: DopeFormData;
  setDopeFormData: (data: DopeFormData) => void;
}

export function ChatDopeCardModal({
  isDopeModalOpen,
  setIsDopeModalOpen,
  currentChannelData,
  handleSendDopeCard,
  dopeFormData,
  setDopeFormData,
}: ChatDopeCardModalProps) {
  if (!isDopeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="ios-glass rounded-3xl max-w-lg w-full border border-cyan-500/40 shadow-2xl p-5 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Broadcast Ballistic DOPE Card
              </h3>
              <p className="text-xs text-slate-400">
                Transmits target parameters directly to #{currentChannelData.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDopeModalOpen(false)}
            className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSendDopeCard} className="space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Target Distance</label>
              <input
                type="text"
                value={dopeFormData.targetDistance}
                onChange={(e) => setDopeFormData({ ...dopeFormData, targetDistance: e.target.value })}
                placeholder="e.g. 340 YDS"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Target / Stage Name</label>
              <input
                type="text"
                value={dopeFormData.targetDescription}
                onChange={(e) => setDopeFormData({ ...dopeFormData, targetDescription: e.target.value })}
                placeholder="e.g. Stage 4 Diamond KYL"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-amber-400 font-bold">Elevation Dial / Hold</label>
              <input
                type="text"
                value={dopeFormData.elevationMils}
                onChange={(e) => setDopeFormData({ ...dopeFormData, elevationMils: e.target.value })}
                placeholder="e.g. 8.4 MIL"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-base sm:text-xs font-bold focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-cyan-400 font-bold">Wind Hold</label>
              <input
                type="text"
                value={dopeFormData.windHoldMils}
                onChange={(e) => setDopeFormData({ ...dopeFormData, windHoldMils: e.target.value })}
                placeholder="e.g. L 0.6 MIL"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-500/40 text-cyan-300 font-mono text-base sm:text-xs font-bold focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Wind Speed & Vector</label>
              <input
                type="text"
                value={dopeFormData.windVelocity}
                onChange={(e) => setDopeFormData({ ...dopeFormData, windVelocity: e.target.value })}
                placeholder="e.g. 9 MPH @ 260° WNW"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Ammunition Lot</label>
              <input
                type="text"
                value={dopeFormData.ammo}
                onChange={(e) => setDopeFormData({ ...dopeFormData, ammo: e.target.value })}
                placeholder="e.g. Lapua Center-X (1,062 FPS)"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Tactical Wind / Stage Notes</label>
            <textarea
              rows={2}
              value={dopeFormData.notes}
              onChange={(e) => setDopeFormData({ ...dopeFormData, notes: e.target.value })}
              placeholder="e.g. Watch for downdraft in canyon draw..."
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-base sm:text-xs focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDopeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-black font-medium text-xs flex items-center gap-2"
            >
              <Crosshair className="w-4 h-4" />
              <span>TRANSMIT DOPE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
