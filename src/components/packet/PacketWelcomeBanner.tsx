"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquare, UserCircle2, X, ArrowRight } from "lucide-react";

/**
 * Shown at the top of the Competitor Packet right after registration
 * (/competitor-packet?welcome=CALLSIGN). Gives new members their direct chat link.
 */
export function PacketWelcomeBanner() {
  const [callsign, setCallsign] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const welcome = params.get("welcome");
    if (welcome) setCallsign(welcome.toUpperCase());
  }, []);

  if (!callsign || dismissed) return null;

  const profileSlug = callsign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative p-5 sm:p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 animate-fadeIn">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss welcome message"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 flex-1 min-w-0 pr-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Registration complete
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Welcome to the Invitational, <span className="text-amber-400">{callsign}</span>
            </h2>
            <p className="text-sm text-slate-300">
              Everything you need for the match is below — schedule, Course of Fire and Bristol hotels.
              Your private Chat Room access is active.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            href="/chat"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enter Private Chat Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/shooters/${profileSlug}`}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <UserCircle2 className="w-4 h-4" />
            <span>My Shooter Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
