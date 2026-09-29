"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Radio, 
  Sparkles,
  Maximize2
} from "lucide-react";

interface HeroVideoBannerProps {
  onComplete: () => void;
}

export function HeroVideoBanner({ onComplete }: HeroVideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(6.2);

  // Attempt autoplay immediately on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy fallback
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    setDuration(video.duration);
  };

  return (
    <div className="relative ios-glass-card rounded-3xl border-2 border-amber-500/40 shadow-tactical-glow overflow-hidden bg-gradient-to-b from-black/95 via-[#07090E]/95 to-black transition-all">
      {/* 1. Tactical HUD Header Bar */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 bg-black/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
            <span className="text-white font-black tracking-wider">BRIEFING FEED</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">SUBSONIC BANNER</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-cyan-400 font-semibold hidden sm:inline">1080p OP-ORD</span>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
              !isMuted
                ? "bg-amber-500 text-black shadow-tactical-glow"
                : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
            }`}
            title="Toggle Sound"
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{!isMuted ? "AUDIO ON" : "AUDIO MUTED"}</span>
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Replay Video"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Skip to Chat Button */}
          <button
            type="button"
            onClick={onComplete}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] flex items-center gap-1.5 transition-all active:scale-95 shadow-tactical-glow"
          >
            <span>SKIP TO COMMS</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Video Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isMuted}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={onComplete}
          className="w-full h-full object-cover select-none cursor-pointer"
          onClick={togglePlay}
        >
          <source src="/videos/ss-banner.m4v" type="video/mp4" />
          <source src="/images/ss-banner.m4v" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Ambient Corner Crosshairs for Tactical Subsonic Branding */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

        {/* Centered Play Pause indicator if paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/70 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-tactical-glow hover:scale-105 transition-all"
            title="Play Video"
          >
            <Play className="w-7 h-7 fill-amber-400 translate-x-0.5" />
          </button>
        )}

        {/* Live Status Overlay Pill */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-amber-400">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>SUBSONIC MEDIA REEL</span>
          </div>
        </div>
      </div>

      {/* 3. Sleek Telemetry Progress Bar & Auto-Transition Status */}
      <div className="relative w-full bg-black/80 px-4 sm:px-6 py-2 border-t border-white/10 flex items-center justify-between gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">
            {progress >= 95 ? (
              <span className="text-emerald-400 font-bold">Connecting to Stage Net...</span>
            ) : (
              <span>Streaming briefing • Live Comms unlock at end of reel</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-24 sm:w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
          >
            <span>Skip</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
