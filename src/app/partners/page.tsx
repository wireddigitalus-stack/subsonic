"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Sparkles, Trophy, ExternalLink, Phone, Mail, MapPin } from "lucide-react";

export default function PartnersPage() {
  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>OFFICIAL TITLE SPONSOR</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              MODACAM CUSTOM RIFLES
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Precision Rimfire Rifles used by the Best Shooters in the World.
            </p>
          </div>
        </div>
      </section>

      {/* Modacam Custom Rifles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-12 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-black/40 to-black/70">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black font-mono uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Presenting Sponsor</span>
            </div>

            <div className="pt-2 pb-1">
              <Image
                src="/assets/modacam-logo-dark.png"
                alt="MODACAM Custom Rifles"
                width={380}
                height={84}
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
                priority
              />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              Modacam Custom Rifles
            </h2>

            <p className="text-base sm:text-lg text-amber-400 font-bold">
              Precision Rimfire Rifles used by the Best Shooters in the World.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-slate-200 font-mono">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Address</div>
                  <div className="text-slate-300">6548 Denver Industrial Park Rd, Denver, NC 28037</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Phone</div>
                  <a href="tel:7047186336" className="text-slate-300 hover:text-amber-400 block">704-718-6336</a>
                  <a href="tel:7044898500" className="text-slate-300 hover:text-amber-400 block">704-489-8500</a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Email</div>
                  <a href="mailto:jelrod@modacam.com" className="text-slate-300 hover:text-amber-400 break-all">jelrod@modacam.com</a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href="https://mcr-rifles.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Visit Modacam Custom Rifles (mcr-rifles.com)</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>

              <Link
                href="/invitational"
                className="px-5 py-3 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>The 2026 Invitational</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
