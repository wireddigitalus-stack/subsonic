"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  Film, 
  Clock, 
  Eye, 
  Sparkles, 
  ExternalLink, 
  Radio, 
  Target, 
  Flame,
  ChevronRight,
  Maximize2
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  category: "SLOW_MO" | "MATCH_DAY" | "DNA_LAB" | "RIFLE_BUILDS";
  duration: string;
  views: string;
  published: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  tags: string[];
}

const VIDEOS_DATA: VideoItem[] = [
  {
    id: "vid-01",
    title: "300-Yard Rimfire Impact Trace in 4K Slow Motion (1,000 FPS)",
    category: "SLOW_MO",
    duration: "4:18",
    views: "18.4K",
    published: "3 days ago",
    description: "High-speed phantom camera footage capturing a 40gr Lapua Center-X bullet traveling through the Appalachian mountain air, showing atmospheric shock waves and instantaneous lead splatter upon a 6-inch steel gong.",
    thumbnail: "/assets/subsonic-facebook-cover.jpg",
    tags: ["SlowMotion", "300Yards", "Lapua", "Ballistics"],
  },
  {
    id: "vid-02",
    title: "The Subsonic Society Invitational: Official Match Day Teaser",
    category: "MATCH_DAY",
    duration: "2:45",
    views: "24.1K",
    published: "1 week ago",
    description: "Cinematic overview of the 18 stages awaiting shooters at The Hideout in Bristol, TN. Featuring $7,500 guaranteed cash purse presented by Modacam Custom Rifles.",
    thumbnail: "/assets/subsonic-competition-mountain.png",
    tags: ["Invitational", "CashPurse", "Modacam", "BristolTN"],
  },
  {
    id: "vid-03",
    title: "Subsonic DNA: Do Barrel Tuners Actually Shrink Rimfire Groups?",
    category: "DNA_LAB",
    duration: "11:20",
    views: "32.6K",
    published: "2 weeks ago",
    description: "Full empirical testing of Harrell, EC Tuner Brake, and Cortina tuners across 3 custom match barrels with Garmin Xero chronograph validation.",
    thumbnail: "/assets/subsonic-coin.jpg",
    tags: ["TunerTesting", "SubsonicDNA", "Accuracy", "Chrono"],
  },
  {
    id: "vid-04",
    title: "Building the Ultimate Match Rimfire: Vudoo V-22 in MDT ACC Elite",
    category: "RIFLE_BUILDS",
    duration: "14:52",
    views: "41.9K",
    published: "3 weeks ago",
    description: "Step-by-step gunsmithing breakdown: action torquing, Bartlein 1:16 barrel headspace verification, Bix'n Andy trigger tuning, and Zero Compromise Optic zeroing.",
    thumbnail: "/assets/subsonic-banner-wide.png",
    tags: ["Vudoo", "Gunsmithing", "ZCO", "MDTchassis"],
  },
  {
    id: "vid-05",
    title: "465-Yard Extreme Rimfire Glide: Flight Time & Drop Analysis",
    category: "SLOW_MO",
    duration: "6:30",
    views: "15.2K",
    published: "1 month ago",
    description: "What happens when a subsonic .22LR bullet is pushed past 400 yards? Watch over 1.8 seconds of bullet flight down the canyon valley at The Hideout.",
    thumbnail: "/assets/subsonic-facebook-cover.jpg",
    tags: ["465Yards", "ExtremeRimfire", "DOPE", "TheHideout"],
  },
  {
    id: "vid-06",
    title: "Stage Breakdown: The Bristol KYL Gauntlet (Clean Run)",
    category: "MATCH_DAY",
    duration: "3:15",
    views: "12.8K",
    published: "1 month ago",
    description: "Wyatt 'Ghost' Sterling walks through target transitions, natural point of aim, and breathing rhythm on the high-stress Know-Your-Limits rack.",
    thumbnail: "/assets/subsonic-logo-dark.png",
    tags: ["StageBreakdown", "ProTips", "KYL", "PRS"],
  },
];

export default function WatchPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  const filteredVideos = activeCategory === "ALL" 
    ? VIDEOS_DATA 
    : VIDEOS_DATA.filter((v) => v.category === activeCategory);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
            <Film className="w-3.5 h-3.5" />
            <span>SUBSONIC SOCIETY MEDIA HUB & CINEMATICS</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              WATCH PRECISION IN MOTION. <br />
              <span className="amber-gradient-text">SLOW-MO TRACE & MATCH DAY REELS.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience slow-motion bullet trace at 300 yards, competitor stage runs, Subsonic DNA laboratory trials, and custom rimfire rifle builds.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Video Player Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-red-500/10 via-black/40 to-black/60 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Video Thumbnail / Mock Player */}
            <div 
              onClick={() => setActiveVideoModal(VIDEOS_DATA[0])}
              className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden border border-white/15 cursor-pointer shadow-2xl group-hover:border-amber-500/50 transition-all"
            >
              <Image
                src="/assets/subsonic-facebook-cover.jpg"
                alt="Featured Video Preview"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-tactical-glow group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-black ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-white font-mono text-xs">
                4K ULTRA-HD • 1,000 FPS SLOW MOTION
              </div>
            </div>

            {/* Video Meta */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
                  FEATURED DISPATCH
                </span>
                <span className="text-xs font-mono text-slate-400">18.4K Views</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                300-Yard Rimfire Impact Trace in 4K Slow Motion
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Watch bullet trace carve through the Appalachian air before impacting steel at The Hideout. Filmed at 1,000 frames per second using high-magnification optics.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setActiveVideoModal(VIDEOS_DATA[0])}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow hover:brightness-110 transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play Featured Video</span>
                </button>

                <a
                  href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Radio className="w-4 h-4 text-blue-400" />
                  <span>Subsonic Social Channel</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 p-1.5 ios-glass rounded-2xl border border-white/10 overflow-x-auto">
          {[
            { id: "ALL", label: "All Videos" },
            { id: "SLOW_MO", label: "300-Yd Slow-Mo Trace" },
            { id: "MATCH_DAY", label: "Match Day & Stages" },
            { id: "DNA_LAB", label: "Subsonic DNA Lab" },
            { id: "RIFLE_BUILDS", label: "Custom Builds & Tuners" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-black shadow-tactical-glow"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Videos Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideoModal(video)}
              className="ios-glass rounded-3xl p-4 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center group-hover:scale-110 shadow-tactical-glow transition-transform">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px]">
                  {video.duration}
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-amber-400 font-bold uppercase">{video.category.replace("_", " ")}</span>
                  <span>{video.views} • {video.published}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {video.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {video.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                  {activeVideoModal.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Video Placeholder Box with Interactive Feel */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Image
                src={activeVideoModal.thumbnail}
                alt="Video"
                fill
                className="object-cover opacity-30"
              />
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-tactical-glow mx-auto">
                  <Play className="w-8 h-8 fill-black ml-1" />
                </div>
                <div className="text-white font-bold text-sm">
                  Subsonic Society 4K Slow-Motion Reel
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  High frame rate footage optimized for high-bandwidth streaming. Connect to our official Subsonic Social channel for raw 1,000 FPS clips.
                </p>
                <a
                  href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Open Video in Subsonic Social Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeVideoModal.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
              <span>Duration: {activeVideoModal.duration}</span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
