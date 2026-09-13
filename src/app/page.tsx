import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { FacebookFeed } from "@/components/home/FacebookFeed";
import { 
  Target, 
  Trophy, 
  Microscope, 
  Users, 
  Flame, 
  ChevronRight, 
  ArrowRight, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Play
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Cinematic Video Hero & Brand Statement */}
      <HeroSection />

      {/* 2. Upcoming Match Spotlight: The Subsonic Society Invitational */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border-2 border-amber-500/50 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-black/40 to-black/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  Upcoming Match Spotlight
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Presented by <strong className="text-white">Modacam Custom Rifles</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                THE SUBSONIC SOCIETY INVITATIONAL
              </h2>

              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>$7,500 GUARANTEED CASH PURSE</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                The premier precision rimfire shootout in the East Tennessee high country. 18 stages across rugged ridge terrain with steel stretched out to 465 yards. Open to top regional competitors and open lottery squads.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">DATES</span>
                  <span className="text-xs sm:text-sm font-bold text-white">Oct 17–18, 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">LOCATION</span>
                  <span className="text-xs sm:text-sm font-bold text-white">The Hideout, Bristol TN</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">COURSE OF FIRE</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-400">18 Stages / 465 Yds</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">AVAILABILITY</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">26 Squad Spots Left</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register?match=subsonic-invitational-2026"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <Flame className="w-4 h-4 fill-black" />
                  <span>Register Match Squad</span>
                </Link>

                <Link
                  href="/matches"
                  className="px-5 py-3 rounded-xl ios-glass text-white font-bold text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>View All 2026 Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-3xl ios-glass-card border border-amber-500/30 text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-glow mx-auto">
                  <Image
                    src="/assets/subsonic-coin.jpg"
                    alt="Subsonic Society Official Emblem"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">THE INVITATIONAL CUP</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Guaranteed $7,500 cash purse payouts across Open, Production, and Senior divisions, presented by Modacam Custom Rifles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subsonic DNA Lab Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold">
                <Microscope className="w-3.5 h-3.5" />
                <span>SUBSONIC DNA LAB PREVIEW</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                LATEST AMMUNITION LOT BENCHMARKS
              </h2>
            </div>

            <Link
              href="/dna"
              className="px-4 py-2 rounded-xl ios-glass text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 hover:bg-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>Explore Complete Testing Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                brand: "Lapua",
                ammo: "Center-X (Lot 32187)",
                avg: "1,062.4 FPS",
                sd: "4.8 FPS",
                group100: "0.38 MOA",
                status: "TOP MATCH LOT",
                accent: "text-amber-400",
              },
              {
                brand: "Lapua",
                ammo: "Midas+ (Lot 99120)",
                avg: "1,058.1 FPS",
                sd: "3.9 FPS",
                group100: "0.31 MOA",
                status: "OLYMPIC GRADE",
                accent: "text-emerald-400",
              },
              {
                brand: "Eley",
                ammo: "Tenex Flat Nose (Lot 1058)",
                avg: "1,066.8 FPS",
                sd: "5.2 FPS",
                group100: "0.42 MOA",
                status: "MATCH GRADE",
                accent: "text-blue-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{item.brand}</span>
                  <span className={`font-bold ${item.accent}`}>{item.status}</span>
                </div>
                <h4 className="text-base font-bold text-white">{item.ammo}</h4>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block">VELOCITY</span>
                    <span className="font-bold text-slate-200">{item.avg}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">SD (FPS)</span>
                    <span className={`font-bold ${item.accent}`}>{item.sd}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">100 YD</span>
                    <span className="font-bold text-white">{item.group100}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Shooter Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>FEATURED SHOOTER SPOTLIGHT</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white">
                WYATT &lsquo;GHOST&rsquo; STERLING
              </h2>

              <p className="text-xs sm:text-sm font-mono text-amber-400">
                National Rank #4 • Appalachian Cup 1st Place • Open Division Pro
              </p>

              <blockquote className="border-l-2 border-amber-500 pl-4 italic text-sm sm:text-base text-slate-200 leading-relaxed">
                &ldquo;In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2">
                <div className="p-2.5 rounded-xl bg-black/30">
                  <span className="text-[9px] text-slate-500 block">ACTION</span>
                  <span>Vudoo V-22 3-Lug</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30">
                  <span className="text-[9px] text-slate-500 block">BARREL</span>
                  <span>Bartlein MTU 20&quot;</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-500 block">OPTIC</span>
                  <span>Zero Compromise ZC527</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shooters"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span>Read Wyatt&apos;s Full Interview & Gear Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-black relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/assets/subsonic-coin.jpg"
                  alt="Wyatt 'Ghost' Sterling - Subsonic Society Pro"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Official Subsonic Social Feed (Live Facebook RSS Integration) */}
      <div id="facebook-feed">
        <FacebookFeed />
      </div>

      {/* 6. Presenting Sponsors Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Precision Powered By
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              PRESENTING SPONSORS & INDUSTRY PARTNERS
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center justify-center pt-2">
            <Link
              href="/partners"
              className="p-4 rounded-2xl bg-white/5 border border-amber-500/30 hover:bg-amber-500/10 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span className="text-xs font-mono text-amber-400 font-bold">PRESENTING</span>
              <span className="text-sm font-black text-white">MODACAM</span>
              <span className="text-[10px] text-slate-400">Custom Rifles</span>
            </Link>

            <Link
              href="/partners"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span className="text-xs font-mono text-blue-400 font-bold">AMMO</span>
              <span className="text-sm font-black text-white">LAPUA</span>
              <span className="text-[10px] text-slate-400">Center-X / Midas+</span>
            </Link>

            <Link
              href="/partners"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span className="text-xs font-mono text-emerald-400 font-bold">OPTICS</span>
              <span className="text-sm font-black text-white">VORTEX</span>
              <span className="text-[10px] text-slate-400">Razor HD Gen III</span>
            </Link>

            <Link
              href="/partners"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span className="text-xs font-mono text-purple-400 font-bold">ACTIONS</span>
              <span className="text-sm font-black text-white">VUDOO</span>
              <span className="text-[10px] text-slate-400">Gun Works V-22</span>
            </Link>

            <Link
              href="/partners"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 col-span-2 sm:col-span-1"
            >
              <span className="text-xs font-mono text-cyan-400 font-bold">CHASSIS</span>
              <span className="text-sm font-black text-white">MDT</span>
              <span className="text-[10px] text-slate-400">ACC Elite</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Free Society Membership CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-tactical-glow text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Join The Brotherhood
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              CLAIM YOUR FREE DIGITAL MEMBER CREDENTIAL
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instant Apple Wallet style digital pass, priority notice on match registrations, Subsonic DNA laboratory lot data, and AI-moderated competitor comms. No annual fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/join"
              data-telemetry="home_bottom_join_cta"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 fill-black" />
              <span>Join The Society — Free Forever</span>
            </Link>

            <Link
              href="/matches"
              data-telemetry="home_bottom_matches_cta"
              className="px-8 py-3.5 rounded-2xl ios-glass text-white font-bold text-sm flex items-center gap-2 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Browse 2026 Matches</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
