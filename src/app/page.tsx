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
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  Upcoming Match Spotlight
                </span>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 border border-white/10">
                  <span className="text-[11px] font-mono text-slate-400">Presented by</span>
                  <Link href="/partners" className="inline-flex items-center hover:opacity-80 transition-opacity">
                    <Image
                      src="/assets/modacam-logo-dark.png"
                      alt="MODACAM Custom Rifles"
                      width={120}
                      height={26}
                      className="h-4 w-auto object-contain"
                    />
                  </Link>
                </div>
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
                <div className="pt-3 border-t border-white/10 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Official Presenting Partner
                  </span>
                  <Link href="/partners" className="hover:opacity-80 transition-opacity">
                    <Image
                      src="/assets/modacam-logo-dark.png"
                      alt="MODACAM Custom Rifles"
                      width={160}
                      height={35}
                      className="h-6 w-auto object-contain"
                    />
                  </Link>
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
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Backlight Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              PRECISION POWERED BY INDUSTRY LEADERS
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              PRESENTING SPONSORS & INDUSTRY PARTNERS
            </h3>
          </div>

          {/* Marquee Presenting Sponsor Hero Card */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <Link
              href="/partners"
              className="group block p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-amber-500/40 hover:border-amber-400 shadow-tactical-glow transition-all duration-300 hover:shadow-glow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="flex flex-col items-center justify-center space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Premier Presenting Partner</span>
                </div>

                <div className="py-2 px-4 flex items-center justify-center">
                  <Image
                    src="/assets/modacam-logo-dark.png"
                    alt="MODACAM Custom Rifles"
                    width={400}
                    height={88}
                    className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
                    priority
                  />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-md font-medium leading-relaxed">
                  Hand-crafted match grade rimfire platforms & custom chambering. Presenting sponsor of the $7,500 Invitational Purse.
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold group-hover:text-amber-300 pt-1">
                  <span>Explore Modacam Match Builds</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Industry Collaborators Grid */}
          <div className="relative z-10 pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Official Match Providers & Technical Collaborators
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-blue-400 font-bold tracking-wider">OFFICIAL AMMUNITION</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">LAPUA</span>
                <span className="text-[10px] text-slate-400">Center-X / Midas+</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">PRECISION OPTICS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">VORTEX</span>
                <span className="text-[10px] text-slate-400">Razor HD Gen III</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-purple-400 font-bold tracking-wider">ACTIONS & REPEATERS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">VUDOO</span>
                <span className="text-[10px] text-slate-400">Gun Works V-22</span>
              </Link>

              <Link
                href="/partners"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-1 group"
              >
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">CHASSIS SYSTEMS</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">MDT</span>
                <span className="text-[10px] text-slate-400">ACC Elite</span>
              </Link>
            </div>
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
