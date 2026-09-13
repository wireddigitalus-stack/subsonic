"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Target, 
  Mountain, 
  Flame, 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Compass, 
  Crosshair, 
  ChevronRight, 
  ShieldCheck, 
  Download,
  Search,
  Sliders,
  ExternalLink
} from "lucide-react";
import { BallisticsCalculator } from "@/components/competition/BallisticsCalculator";

const ALL_18_STAGES = [
  { num: 1, name: "Holston Gap High-Angle Sniper", dist: "185 – 340 YDS", rounds: 12, time: "90s", prop: "Natural Rock Outcropping (-22° angle)", notes: "Read the canyon mirage carefully. Wind pushes left-to-right at the notch." },
  { num: 2, name: "The Bristol KYL Gauntlet", dist: "85 & 150 YDS", rounds: 10, time: "75s", prop: "Know-Your-Limits 5-Paddle Racks (2.0\" to 0.25\")", notes: "Clean the near 85-yard rack before advancing. A miss zeroes the entire stage." },
  { num: 3, name: "Mountain Rooftop Positional", dist: "115 – 260 YDS", rounds: 12, time: "90s", prop: "Steep Corrugated Metal Roof Prop", notes: "Use large front support bag. Keep recoil impulse linear down the pitch." },
  { num: 4, name: "Subsonic 400-Yard Terminal Glide", dist: "425 – 465 YDS", rounds: 10, time: "100s", prop: "Prone Wooden Decking", notes: "Extreme .22LR distance. Flight time is ~1.5 seconds per round. Watch for the mid-valley updrafts." },
  { num: 5, name: "The Tank Trap Shuffle", dist: "95 YDS", rounds: 10, time: "90s", prop: "Welded Steel Tank Trap (5 pipe tips)", notes: "Fire 2 shots from each of the 5 tips. Fast transitions win this stage." },
  { num: 6, name: "Timber Crossing Barricade", dist: "140 – 210 YDS", rounds: 12, time: "90s", prop: "Stacked Railroad Ties & Logs", notes: "Variable heights. Check eye relief and level bubble on each station." },
  { num: 7, name: "Mountain Ravine Moving Steel", dist: "175 YDS", rounds: 8, time: "60s", prop: "Electronic Lateral Trolley (3.2 MPH)", notes: "Lead moving target by 1.2 Mils elevation hold with subsonic muzzle velocity." },
  { num: 8, name: "Offhand Steel Balance", dist: "50 & 75 YDS", rounds: 10, time: "75s", prop: "Unsupported Standing Post", notes: "Pure marksmanship fundamentals. No sling or barricade contact allowed." },
  { num: 9, name: "Cliffside Barricade Sweep", dist: "130 – 280 YDS", rounds: 12, time: "90s", prop: "Step Barricade (4 levels)", notes: "Engage near-to-far. Re-dial turret or use Christmas tree reticle holds." },
  { num: 10, name: "Downhill Boulder Positional", dist: "220 – 310 YDS", rounds: 10, time: "90s", prop: "Granite Boulder Natural Step", notes: "Footing is slick after morning dew. Ensure tripod or rear bag is wedged." },
  { num: 11, name: "Cable Spool Pyramid", dist: "105 – 190 YDS", rounds: 12, time: "90s", prop: "Double Wooden Wire Spools", notes: "Transition between the top rim and center axle hole." },
  { num: 12, name: "KYL 200 Extreme Challenge", dist: "200 YDS", rounds: 8, time: "75s", prop: "Extreme Distance KYL Rack (3\" down to 0.75\")", notes: "Only highest stage score shooters dare shoot the 0.75-inch paddle at 200 yards." },
  { num: 13, name: "The Mountain Culvert Pipe", dist: "110 – 245 YDS", rounds: 10, time: "90s", prop: "Heavy Corrugated Drainage Pipe", notes: "Crawl through prone and establish stable bipod placement inside the cylinder." },
  { num: 14, name: "Ridge Crosswind Gauntlet", dist: "330 YDS", rounds: 10, time: "90s", prop: "Prone Mat along Ridge Gap", notes: "High probability of crosswinds exceeding 12 mph across the valley saddle." },
  { num: 15, name: "Support-Side Weak Hand Transition", dist: "90 YDS", rounds: 10, time: "90s", prop: "Standard PRS 2x4 Barricade", notes: "Shoot 5 strong side, 5 weak side. Zero support hand cant." },
  { num: 16, name: "Iron Maiden Flasher Matrix", dist: "160 – 250 YDS", rounds: 12, time: "90s", prop: "Low Window Prop", notes: "Engage 4 reactive steel flashers in left-to-right sequence." },
  { num: 17, name: "Steep Gully Prone Drop", dist: "380 YDS", rounds: 10, time: "90s", prop: "Down-Angle Prone Berm (-24° drop)", notes: "Calculate cosine angle reduction on your Kestrel ballistic profile." },
  { num: 18, name: "The Subsonic Society Cup Finale", dist: "465 YDS", rounds: 10, time: "100s", prop: "Championship Finalist Platform", notes: "The ultimate proving ground. The round that rings this steel clinches the Subsonic Society Championship Cup." },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Wyatt 'Ghost' Sterling", division: "OPEN", squad: "Squad 1", rifle: "Vudoo V-22 / Bartlein", score: "168 / 180", matchPct: "100.0%", stageWins: 5 },
  { rank: 2, name: "Kendra 'Coldbore' Cross", division: "OPEN", squad: "Squad 1", rifle: "RimX / Proof Carbon", score: "164 / 180", matchPct: "97.6%", stageWins: 4 },
  { rank: 3, name: "Garrett Vance", division: "SENIOR", squad: "Squad 3", rifle: "Vudoo V-22 / MDT ACC", score: "159 / 180", matchPct: "94.6%", stageWins: 3 },
  { rank: 4, name: "Eli McAllister", division: "PRODUCTION", squad: "Squad 2", rifle: "CZ 457 MTR / Vortex", score: "154 / 180", matchPct: "91.6%", stageWins: 2 },
  { rank: 5, name: "Dustin 'Zero' Cole", division: "OPEN", squad: "Squad 2", rifle: "RimX / Tangent Theta", score: "151 / 180", matchPct: "89.8%", stageWins: 2 },
  { rank: 6, name: "Sarah 'Apex' Jenkins", division: "LADIES", squad: "Squad 4", rifle: "Vudoo V-22 / March FX", score: "148 / 180", matchPct: "88.0%", stageWins: 1 },
  { rank: 7, name: "Mason 'Dope' Brooks", division: "PRODUCTION", squad: "Squad 3", rifle: "Tikka T1x / KRG Bravo", score: "142 / 180", matchPct: "84.5%", stageWins: 1 },
];

export default function BristolProPortalPage() {
  const [selectedStage, setSelectedStage] = useState(ALL_18_STAGES[0]);
  const [leaderboardFilter, setLeaderboardFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"STAGES" | "BALLISTICS" | "LEADERBOARD" | "TRAVEL">("STAGES");

  const filteredLeaderboard = MOCK_LEADERBOARD.filter((shooter) => {
    const matchesDiv = leaderboardFilter === "ALL" || shooter.division === leaderboardFilter;
    const matchesSearch = shooter.name.toLowerCase().includes(searchQuery.toLowerCase()) || shooter.rifle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          <span>/</span>
          <Link href="/calendar" className="hover:text-amber-400">Competitions</Link>
          <span>/</span>
          <span className="text-amber-400">Bristol Mountain Pro Invitational</span>
        </div>

        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-tactical-glow relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                PRO SHOOTING CHAMPIONSHIP
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono">
                <span className="text-slate-400">Presented by</span>
                <Link href="/partners" className="inline-flex items-center hover:opacity-80 transition-opacity">
                  <Image
                    src="/assets/modacam-logo-dark.png"
                    alt="MODACAM Custom Rifles"
                    width={110}
                    height={24}
                    className="h-3.5 w-auto object-contain"
                  />
                </Link>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                BRISTOL, TN • 3,420 FT ELEVATION
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                OCTOBER 17-18, 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              APPALACHIAN MOUNTAIN <br />
              <span className="amber-gradient-text">RIMFIRE PRO INVITATIONAL</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              18 grueling high-angle stages stretching from 35 yards to an extreme 465-yard mountain valley glide. Compete for cash purses, custom rimfire hardware, and the coveted Subsonic Society Championship Cup.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register?match=match-001"
                data-telemetry="bristol_portal_register_cta"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Register Squad ($275)</span>
              </Link>

              <Link
                href="/chat"
                data-telemetry="bristol_portal_comms_cta"
                className="px-6 py-3 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
              >
                <span>#bristol-championship Comms</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="bg-black/60 p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1">
        {[
          { id: "STAGES", label: "18-Stage Course of Fire", icon: Target },
          { id: "BALLISTICS", label: "Mountain DOPE Solver", icon: Crosshair },
          { id: "LEADERBOARD", label: "Live Standings Matrix", icon: Trophy },
          { id: "TRAVEL", label: "Range Map & Logistics", icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              data-telemetry={`bristol_tab_${tab.id.toLowerCase()}`}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-tactical-glow font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 18-STAGE COURSE OF FIRE */}
      {activeTab === "STAGES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stage Selector Grid (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Select Stage Briefing (18 Total Stages)
            </h3>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {ALL_18_STAGES.map((stg) => {
                const isSelected = selectedStage.num === stg.num;
                return (
                  <button
                    key={stg.num}
                    onClick={() => setSelectedStage(stg)}
                    data-telemetry={`bristol_select_stage_${stg.num}`}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? "ios-glass bg-white/10 border-amber-500/40 shadow-tactical-glow text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                        isSelected ? "bg-amber-500 text-black" : "bg-black/60 text-amber-400 border border-white/5"
                      }`}>
                        {stg.num}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                          {stg.name}
                        </div>
                        <div className="text-[10px] text-amber-400/90 font-mono">
                          {stg.dist} • {stg.rounds} Rds • {stg.time}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stage Detail Showcase (7 cols) */}
          <div className="lg:col-span-7 ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    OFFICIAL COURSE OF FIRE • STAGE {selectedStage.num}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                    {selectedStage.name}
                  </h2>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-slate-300">
                  {selectedStage.time} Par Time
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Target Distances</div>
                  <div className="text-sm sm:text-base font-mono font-black text-amber-400 mt-1">
                    {selectedStage.dist}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Round Count</div>
                  <div className="text-sm sm:text-base font-mono font-black text-white mt-1">
                    {selectedStage.rounds} Rounds
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Time Limit</div>
                  <div className="text-sm sm:text-base font-mono font-black text-emerald-400 mt-1">
                    {selectedStage.time}
                  </div>
                </div>
              </div>

              {/* Prop & Shooting Position */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Physical Prop & Firing Position</span>
                </div>
                <p className="text-sm text-white font-medium">
                  {selectedStage.prop}
                </p>
              </div>

              {/* Match Director's Tactical Advisory */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="text-xs font-mono text-amber-300 font-bold uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Match Director Tactical DOPE Tip</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  &ldquo;{selectedStage.notes}&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span className="font-mono text-amber-300">
                Bristol Mountain Ridge Range Sector {Math.ceil(selectedStage.num / 4)}
              </span>
              <Link
                href="/register?match=match-001"
                className="text-white hover:text-amber-400 font-bold flex items-center gap-1"
              >
                <span>Register this Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOUNTAIN BALLISTICS SOLVER */}
      {activeTab === "BALLISTICS" && (
        <BallisticsCalculator />
      )}

      {/* TAB 3: LIVE STANDINGS MATRIX */}
      {activeTab === "LEADERBOARD" && (
        <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Live Competition Standings
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                APPALACHIAN PRO LEADERBOARD
              </h3>
            </div>

            {/* Division Filters & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter competitor or rifle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-black/60 p-1 rounded-xl border border-white/10 flex gap-1 text-xs">
                {["ALL", "OPEN", "PRODUCTION", "SENIOR", "LADIES"].map((div) => (
                  <button
                    key={div}
                    onClick={() => setLeaderboardFilter(div)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      leaderboardFilter === div ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Marksman</th>
                  <th className="p-3.5">Division</th>
                  <th className="p-3.5">Rifle Setup</th>
                  <th className="p-3.5">Total Points</th>
                  <th className="p-3.5 text-amber-400">Match %</th>
                  <th className="p-3.5">Stage Wins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeaderboard.map((row) => (
                  <tr key={row.rank} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3.5 font-black text-amber-400">
                      #{row.rank}
                    </td>
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {row.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{row.squad}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]">
                        {row.division}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">
                      {row.rifle}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {row.score}
                    </td>
                    <td className="p-3.5 font-black text-amber-400">
                      {row.matchPct}
                    </td>
                    <td className="p-3.5 text-emerald-400 font-semibold">
                      {row.stageWins} Wins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RANGE MAP & LOGISTICS */}
      {activeTab === "TRAVEL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Range Location & Gate Access
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The range is located 12 miles outside Bristol, Tennessee on the slopes of Holston Mountain. 4WD recommended during autumn rains.
            </p>

            <div className="space-y-3 font-mono text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">GPS COORDINATES:</span>
                <span className="text-white font-bold">36.5951° N, 82.1887° W</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">RANGE ELEVATION:</span>
                <span className="text-amber-400 font-bold">3,420 FT Above Sea Level</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">CHECK-IN GATE:</span>
                <span className="text-emerald-400 font-bold">Gate 3 (South Holston Access)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">NEAREST AIRPORT:</span>
                <span className="text-white font-bold">Tri-Cities Regional Airport (TRI) - 28 mi</span>
              </div>
            </div>
          </div>

          <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Match Weekend Timeline
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { time: "FRIDAY 01:00 PM", title: "Registration & Zero Bay Open", desc: "Doppler chronograph station verification and 50-yard paper zero checks." },
                { time: "SATURDAY 07:00 AM", title: "Shooter Safety Briefing", desc: "Mandatory safety meeting at the main pavilion. Squad assignments finalized." },
                { time: "SATURDAY 08:00 AM", title: "Stages 1 through 10 Firing", desc: "High-angle mountain canyon stages commence. Lunch provided on the ridge." },
                { time: "SUNDAY 08:00 AM", title: "Stages 11 through 18 Firing", desc: "Final 8 stages and the 465-yard Subsonic Society Cup finale." },
                { time: "SUNDAY 03:30 PM", title: "Awards Ceremony & Trophy Presentation", desc: "Presentation of guaranteed cash purse, division trophies, and champion awards." },
              ].map((item) => (
                <div key={item.time} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{item.time}</span>
                    <span className="text-white font-bold">{item.title}</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
