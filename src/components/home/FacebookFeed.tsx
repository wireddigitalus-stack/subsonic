"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Radio, 
  ExternalLink, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Maximize2,
  Minimize2,
  Search,
  Heart,
  X,
  Layers,
  Flame,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronUp,
  ChevronDown,
  ArrowUp
} from "lucide-react";
import { INITIAL_FACEBOOK_POSTS } from "@/lib/initial-data";
import { FacebookPostItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const FB_PAGE_URL = "https://www.facebook.com/p/Subsonic-Society-61578052196057/";

export function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPostItem[]>(INITIAL_FACEBOOK_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | "MATCHES" | "BALLISTICS" | "MEDIA">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLightboxPost, setActiveLightboxPost] = useState<FacebookPostItem | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Live Sync with /api/facebook/feed (Direct RSS Engine) & Supabase
  const fetchLivePosts = async () => {
    try {
      const res = await fetch("/api/facebook/feed");
      if (res.ok) {
        const json = await res.json();
        if (json.posts && json.posts.length > 0) {
          setPosts((prev) => {
            const liveIds = new Set(json.posts.map((p: FacebookPostItem) => p.id));
            const remaining = INITIAL_FACEBOOK_POSTS.filter((p) => !liveIds.has(p.id));
            return [...json.posts, ...remaining];
          });
          return;
        }
      }
    } catch (err) {
      console.warn("[FacebookFeed] Could not reach /api/facebook/feed, checking Supabase...", err);
    }

    // Direct Supabase fallback
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: FacebookPostItem[] = data.map((d: any) => ({
          id: d.id,
          content: d.content,
          publishedAt: new Date(d.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          imageUrl: d.image_url,
          externalUrl: d.external_url || FB_PAGE_URL,
          likesCount: d.likes_count || 0,
          commentsCount: d.comments_count || 0,
          sharesCount: d.shares_count || 0,
          tags: Array.isArray(d.tags) ? d.tags : [],
          category: d.category || "ALL"
        }));

        setPosts((prev) => {
          const liveIds = new Set(formatted.map((p) => p.id));
          const baseRemaining = INITIAL_FACEBOOK_POSTS.filter((p) => !liveIds.has(p.id));
          return [...formatted, ...baseRemaining];
        });
      }
    } catch (err) {
      console.error("[FacebookFeed] Live sync error:", err);
    }
  };

  useEffect(() => {
    fetchLivePosts();

    if (supabase) {
      const channel = supabase
        .channel("social_posts_feed_sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "social_posts" },
          () => {
            fetchLivePosts();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  // Custom UI Scroll Controller State (Replacing Browser Default)
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const handleFeedScroll = () => {
    if (!feedScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedScrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }
    const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
    setScrollProgress(progress);
    setCanScrollUp(scrollTop > 15);
    setCanScrollDown(scrollTop < maxScroll - 15);
  };

  const scrollFeed = (direction: "up" | "down" | "top") => {
    if (!feedScrollRef.current) return;
    if (direction === "top") {
      feedScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const offset = direction === "up" ? -350 : 350;
      feedScrollRef.current.scrollBy({ top: offset, behavior: "smooth" });
    }
  };

  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!feedScrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));
    const maxScroll = feedScrollRef.current.scrollHeight - feedScrollRef.current.clientHeight;
    feedScrollRef.current.scrollTo({ top: ratio * maxScroll, behavior: "smooth" });
  };

  useEffect(() => {
    // Recompute scroll limits when posts or expansion toggle change
    const timer = setTimeout(() => {
      handleFeedScroll();
    }, 150);
    return () => clearTimeout(timer);
  }, [posts, activeCategory, searchQuery, isExpanded]);

  const handleLike = (id: string) => {
    const isLiked = likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
        return p;
      })
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  const handleShare = (post: FacebookPostItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(post.externalUrl);
      setShareNotice("Facebook link copied to clipboard!");
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  // Filter posts based on category and search
  const filteredPosts = posts.filter((post) => {
    if (activeCategory === "MATCHES" && !post.tags.some(t => t.toLowerCase().includes("bristol") || t.toLowerCase().includes("match") || t.toLowerCase().includes("stage") || t.toLowerCase().includes("invitational"))) return false;
    if (activeCategory === "BALLISTICS" && !post.tags.some(t => t.toLowerCase().includes("ballistic") || t.toLowerCase().includes("dope") || t.toLowerCase().includes("kestrel") || t.toLowerCase().includes("wind"))) return false;
    if (activeCategory === "MEDIA" && !post.tags.some(t => t.toLowerCase().includes("gear") || t.toLowerCase().includes("shirt") || t.toLowerCase().includes("coin") || t.toLowerCase().includes("rifle") || t.toLowerCase().includes("vudoo") || t.toLowerCase().includes("modacam"))) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesContent = post.content.toLowerCase().includes(q);
      const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesContent && !matchesTags) return false;
    }
    return true;
  });

  return (
    <section id="facebook-feed" data-section="facebook-feed" className="py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live Social Media Station
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                Official Meta Channel
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              SUBSONIC SOCIETY <span className="text-blue-400">FACEBOOK DISPATCH</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Real-time competition bulletins, high-country stage walk-through teasers, and gear breakdown dispatches from our official Facebook page.
            </p>
          </div>

          <a
            href={FB_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-telemetry="fb_visit_official_page_top"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all self-start md:self-auto shrink-0 active:scale-95"
          >
            <span>Follow @SubsonicSociety</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ========================================================================= */}
        {/* FANCY MODERN iWINDOW (macOS / iOS 18 Glassmorphic App Window)             */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl border border-white/20 bg-[#07090E]/90 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(37,99,235,0.15)] overflow-hidden transition-all duration-300">
          
          {/* 1. iWINDOW TITLEBAR (Apple Traffic Lights & Controls) */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between gap-3 select-none">
            
            {/* Traffic Light Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPosts(INITIAL_FACEBOOK_POSTS)} 
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition-opacity" 
                title="Reset Feed"
              />
              <button 
                onClick={() => setIsExpanded(false)} 
                className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 transition-opacity" 
                title="Compact Window"
              />
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 transition-opacity" 
                title={isExpanded ? "Restore Split View" : "Maximize Feed within Window"}
              />

              <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-white/10 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span className="text-white font-semibold">Subsonic Social</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-300 text-[11px]">ID: 61578052196057</span>
              </div>
            </div>

            {/* Titlebar Search & Tools */}
            <div className="flex items-center gap-2">
              {/* Quick Filter Search */}
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter posts or tags..."
                  className="pl-8 pr-3 py-1 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-44 lg:w-56 font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                title="Fetch Latest Posts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
              </button>

              {/* Titlebar Custom UI Scroll Stepper */}
              <div className="hidden sm:flex items-center gap-0.5 bg-black/40 border border-white/10 rounded-xl p-0.5" title="Custom Feed Scroll Controls">
                <button
                  onClick={() => scrollFeed("up")}
                  disabled={!canScrollUp}
                  className={`p-1 rounded-lg transition-all ${
                    canScrollUp ? "text-slate-300 hover:text-white hover:bg-white/10 active:scale-95" : "text-slate-600 cursor-not-allowed"
                  }`}
                  title="Scroll Up"
                  aria-label="Scroll Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollFeed("down")}
                  disabled={!canScrollDown}
                  className={`p-1 rounded-lg transition-all ${
                    canScrollDown ? "text-slate-300 hover:text-white hover:bg-white/10 active:scale-95" : "text-slate-600 cursor-not-allowed"
                  }`}
                  title="Scroll Down"
                  aria-label="Scroll Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Maximize within Window Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all hidden sm:flex ${
                  isExpanded
                    ? "bg-blue-600/30 border-blue-500/50 text-blue-200 hover:bg-blue-600/50 hover:text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title={isExpanded ? "Restore Split View" : "Maximize Feed within Window"}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-semibold">Split View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-semibold">Maximize Feed</span>
                  </>
                )}
              </button>

              {/* Direct Facebook Link */}
              <a
                href={FB_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-600/50 text-xs font-mono font-bold flex items-center gap-1 transition-all"
              >
                <span>FB App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 2. DUAL-PANE / MAXIMIZED WINDOW CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[640px] sm:min-h-[720px]">
            
            {/* LEFT SIDEBAR: Official Profile & Filter Controls (4 Columns on LG, Hidden when Maximized) */}
            {!isExpanded && (
              <div className="lg:col-span-4 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40 space-y-5 animate-fadeIn flex flex-col justify-between">
                
                {/* Profile Card */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#131B2E] to-[#0A0E17] p-4 space-y-4">
                {/* Mini Cover Header */}
                <div className="relative h-20 -mx-4 -mt-4 overflow-hidden">
                  <Image
                    src="/assets/subsonic-facebook-cover.jpg"
                    alt="Subsonic Society Facebook Banner"
                    fill
                    className="object-cover object-center brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131B2E] via-transparent to-transparent" />
                </div>

                {/* Avatar & Verification */}
                <div className="flex items-end gap-3 -mt-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.4)] bg-black shrink-0 relative">
                    <Image
                      src="/assets/subsonic-coin.jpg"
                      alt="Subsonic Society"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">Subsonic Society</h3>
                      <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20 shrink-0" />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">@Subsonic-Society</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Precision rimfire shooting media and premier competition platform in the mountains of Bristol, Tennessee (3,420 FT).
                </p>

                {/* Channel Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-xs font-black text-amber-400">465 YDS</div>
                    <div className="text-[9px] text-slate-400 uppercase">Max Target</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-xs font-black text-blue-400">18 STAGES</div>
                    <div className="text-[9px] text-slate-400 uppercase">Pro Match</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-xs font-black text-emerald-400">$28.5K</div>
                    <div className="text-[9px] text-slate-400 uppercase">Prize Table</div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <a
                  href={FB_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-98 transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5 fill-white" />
                  <span>Follow Page on Facebook</span>
                </a>
              </div>

              {/* Feed Category Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Filter Feed Streams
                </span>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 font-mono text-xs">
                  {[
                    { id: "ALL", label: "All Dispatches", icon: Layers, count: posts.length },
                    { id: "MATCHES", label: "Bristol Pro Shootout", icon: Flame, count: 2 },
                    { id: "BALLISTICS", label: "Ballistics & DOPE", icon: Sliders, count: 2 },
                    { id: "MEDIA", label: "Apparel & Gear", icon: ShieldCheck, count: 1 },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all ${
                          active
                            ? "bg-blue-600/30 text-white border border-blue-500/40 shadow-sm"
                            : "bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-400" : "text-slate-500"}`} />
                          <span className="font-semibold text-[11px] sm:text-xs">{cat.label}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-blue-500/30 text-blue-200" : "bg-white/5 text-slate-500"}`}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verified Stream Info Card */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200/90 font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Live Dispatch Syncing</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  All match briefings, range photos, and DOPE sheets synchronize with our primary Facebook media channel.
                </p>
              </div>
            </div>
          )}

          {/* RIGHT MAIN STREAM: Scrollable Social Cards (8 Cols in Split, 12 Cols when Maximized within Window) */}
          <div className={`${isExpanded ? "lg:col-span-12" : "lg:col-span-8"} relative flex flex-col h-full transition-all duration-300`}>
            
            {/* In-Window Maximized Feed Header Bar */}
            {isExpanded && (
              <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn select-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Maximized Social Feed
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    Full Window View
                  </span>
                </div>

                {/* Horizontal Stream Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "ALL", label: "All Dispatches" },
                    { id: "MATCHES", label: "Bristol Pro" },
                    { id: "BALLISTICS", label: "Ballistics & DOPE" },
                    { id: "MEDIA", label: "Apparel & Gear" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                        activeCategory === cat.id
                          ? "bg-blue-600/40 text-white border border-blue-500/50 shadow-sm font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="ml-2 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-all active:scale-95"
                    title="Return to Split View"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Split View</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom UI Tactile Rail (No Browser Default - Full Top to Bottom) */}
            <div
              onClick={handleRailClick}
              className="hidden sm:block absolute top-2 bottom-2 right-1.5 w-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] transition-all cursor-pointer z-20 group/rail"
              title="Custom Scroll Track - Click to Navigate"
            >
              <div
                className="w-full rounded-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-100 group-hover/rail:brightness-125"
                style={{
                  height: "36px",
                  marginTop: `calc(${scrollProgress}% - ${(scrollProgress / 100) * 36}px)`,
                }}
              />
            </div>

            {/* Scroll Container with zero browser default scrollbar - Extends flush to the bottom */}
            <div
              ref={feedScrollRef}
              onScroll={handleFeedScroll}
              className={`flex-1 p-5 sm:p-6 pr-6 sm:pr-8 overflow-y-auto no-scrollbar scroll-smooth h-full ${
                isExpanded
                  ? "min-h-[780px] lg:min-h-[880px] max-h-[1050px]"
                  : "min-h-[640px] sm:min-h-[720px] lg:min-h-[760px] max-h-[820px]"
              } space-y-5`}
            >
              
              {/* Share Toast */}
              {shareNotice && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between animate-fade-in">
                  <span>{shareNotice}</span>
                  <button onClick={() => setShareNotice(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono text-xs">
                  No Facebook posts match the selected filter.
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isLiked = likedPosts[post.id];

                  return (
                    <article
                      key={post.id}
                      className="rounded-2xl border border-white/10 bg-black/50 hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="p-5 space-y-3.5">
                        
                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/40 bg-black flex items-center justify-center shrink-0">
                              <Image
                                src="/assets/subsonic-coin.jpg"
                                alt="Subsonic Society"
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                                  Subsonic Society
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>{post.publishedAt}</span>
                                <span>•</span>
                                <span className="text-blue-400">Bristol Mountain Draw</span>
                              </div>
                            </div>
                          </div>

                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-all"
                            title="Open this post on Facebook"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Post Body */}
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="text-[10px] font-mono text-blue-300/90 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/20 transition-all"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* High-Res Media Container */}
                        {post.imageUrl && (
                          <div 
                            onClick={() => setActiveLightboxPost(post)}
                            className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-white/10 bg-black/60 cursor-pointer group/media mt-2"
                          >
                            <Image
                              src={post.imageUrl}
                              alt="Subsonic Society Media"
                              fill
                              className="object-cover group-hover/media:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/media:bg-transparent transition-colors" />
                            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1 opacity-90 group-hover/media:opacity-100 transition-opacity">
                              <Eye className="w-3 h-3 text-blue-400" />
                              <span>Click to Expand</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action & Engagement Strip */}
                      <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                        <div className="flex items-center gap-4">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1.5 font-bold transition-all active:scale-125 ${
                              isLiked ? "text-blue-400" : "hover:text-slate-200"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-blue-400 text-blue-400" : ""}`} />
                            <span>{post.likesCount} Likes</span>
                          </button>

                          {/* Comments */}
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{post.commentsCount} Comments</span>
                          </a>

                          {/* Share */}
                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{post.sharesCount} Shares</span>
                          </button>
                        </div>

                        <a
                          href={post.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 text-[11px]"
                        >
                          <span>Open on FB</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </article>
                  );
                })
              )}
              </div>

              {/* Custom UI Floating Scroll Controller */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl ios-glass border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeIn">
                <button
                  onClick={() => scrollFeed("up")}
                  disabled={!canScrollUp}
                  className={`p-2 rounded-xl transition-all ${
                    canScrollUp
                      ? "bg-white/10 hover:bg-white/20 text-white active:scale-90"
                      : "bg-white/5 text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                  title="Scroll Up (Previous Dispatches)"
                  aria-label="Scroll Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollFeed("top")}
                  className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all group"
                  title="Jump to Latest / Top"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:animate-ping" />
                  <span>{Math.round(scrollProgress)}%</span>
                </button>

                <button
                  onClick={() => scrollFeed("down")}
                  disabled={!canScrollDown}
                  className={`p-2 rounded-xl transition-all ${
                    canScrollDown
                      ? "bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 hover:text-white border border-blue-500/40 active:scale-90 shadow-tactical-glow"
                      : "bg-white/5 text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                  title="Scroll Down (Next Dispatches)"
                  aria-label="Scroll Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE MEDIA LIGHTBOX MODAL                                          */}
        {/* ========================================================================= */}
        {activeLightboxPost && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
            onClick={() => setActiveLightboxPost(null)}
          >
            <div 
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-white/20 bg-[#0B0E14] shadow-[0_0_50px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Titlebar */}
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-slate-300 ml-2">Photo Inspection • Subsonic Media</span>
                </div>
                <button
                  onClick={() => setActiveLightboxPost(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Image */}
              <div className="relative w-full h-80 sm:h-[420px] bg-black">
                {activeLightboxPost.imageUrl && (
                  <Image
                    src={activeLightboxPost.imageUrl}
                    alt="Subsonic Media Lightbox"
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* Modal Details */}
              <div className="p-5 border-t border-white/10 space-y-3 bg-black/40">
                <p className="text-xs sm:text-sm text-slate-200">
                  {activeLightboxPost.content}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-amber-400">{activeLightboxPost.likesCount} Likes</span>
                    <span>•</span>
                    <span>{activeLightboxPost.commentsCount} Comments</span>
                  </div>

                  <a
                    href={activeLightboxPost.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>View Post on Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
