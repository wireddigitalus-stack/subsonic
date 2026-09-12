"use client";

import React, { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { INITIAL_FACEBOOK_POSTS } from "@/lib/initial-data";
import { FacebookPostItem } from "@/lib/types";

const FB_PAGE_URL = "https://www.facebook.com/p/Subsonic-Society-61578052196057/";

export function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPostItem[]>(INITIAL_FACEBOOK_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"FEED_CARDS" | "PAGE_EMBED">("FEED_CARDS");

  const handleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = likedPosts[id];
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
    }, 800);
  };

  return (
    <section id="facebook-feed" data-section="facebook-feed" className="py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live Social Media Feed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                Official Channel
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              SUBSONIC SOCIETY <span className="text-blue-400">FACEBOOK DISPATCH</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Real-time competition bulletins, stage walk-through teasers, match day photo galleries, and community discussion from our official Facebook presence.
            </p>
          </div>

          {/* Action Tools & Tabs */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="bg-black/60 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setActiveTab("FEED_CARDS")}
                data-telemetry="fb_tab_interactive_cards"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "FEED_CARDS"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Media Cards
              </button>
              <button
                onClick={() => setActiveTab("PAGE_EMBED")}
                data-telemetry="fb_tab_page_embed"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "PAGE_EMBED"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Facebook Embed
              </button>
            </div>

            <button
              onClick={handleRefresh}
              data-telemetry="fb_refresh_button"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh Facebook Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            </button>

            <a
              href={FB_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-telemetry="fb_visit_official_page"
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-tactical-blue hover:bg-blue-500 active:scale-95 transition-all"
            >
              <span>Follow @SubsonicSociety</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab 1: Interactive High-Res Feed Cards */}
        {activeTab === "FEED_CARDS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const isLiked = likedPosts[post.id];
              return (
                <article
                  key={post.id}
                  className="ios-glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Post Author Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-500/40 bg-black flex items-center justify-center">
                          <Image
                            src="/assets/subsonic-logo-round.png"
                            alt="Subsonic Society"
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">
                              Subsonic Society
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{post.publishedAt}</span>
                            <span>•</span>
                            <span>Bristol, TN</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-telemetry={`fb_post_ext_link_${post.id}`}
                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        title="View directly on Facebook"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Image Media */}
                    {post.imageUrl && (
                      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        <Image
                          src={post.imageUrl}
                          alt="Subsonic Society Post Media"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post Engagement Bar */}
                  <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        data-telemetry={`fb_like_click_${post.id}`}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          isLiked ? "text-blue-400 font-bold" : "hover:text-slate-200"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-blue-400" : ""}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-telemetry={`fb_comment_click_${post.id}`}
                        className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount} Comments</span>
                      </a>

                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-telemetry={`fb_share_click_${post.id}`}
                        className="hidden sm:flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.sharesCount} Shares</span>
                      </a>
                    </div>

                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-telemetry={`fb_read_on_fb_${post.id}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>Open on Facebook</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Tab 2: Embedded Facebook Page Frame */}
        {activeTab === "PAGE_EMBED" && (
          <div className="ios-glass rounded-2xl p-4 sm:p-6 border border-white/10 text-center space-y-4">
            <div className="max-w-xl mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Official Facebook Page Plugin
              </h3>
              <p className="text-xs text-slate-300">
                Connected to Subsonic Society (ID: 61578052196057). Click below to view directly inside the Facebook app or browser.
              </p>
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/15 bg-black/60 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-blue-950/30 border border-blue-500/20">
                <div className="flex items-center gap-3 text-left">
                  <Image
                    src="/assets/subsonic-logo-round.png"
                    alt="Subsonic Society"
                    width={48}
                    height={48}
                    className="rounded-xl border border-white/20"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">Subsonic Society</h4>
                    <p className="text-xs text-slate-300">Precision Rimfire Media & Competition</p>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified Sport Community
                    </span>
                  </div>
                </div>

                <a
                  href={FB_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-telemetry="fb_embed_open_full_profile"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-500 shadow-tactical-blue transition-all"
                >
                  <span>Follow on Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Notice for ad-blockers / iframe restrictions */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 text-left flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  For full uninterrupted streaming of Facebook video reels and match photos without Meta cross-site tracking blockers, switch to the <strong>Media Cards</strong> tab above or open the Facebook app directly.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
