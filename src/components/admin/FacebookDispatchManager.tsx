"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Radio, 
  Send, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Flame, 
  Sliders, 
  ShieldCheck, 
  Layers, 
  Eye,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { INITIAL_FACEBOOK_POSTS } from "@/lib/initial-data";

export function FacebookDispatchManager() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("https://www.facebook.com/p/Subsonic-Society-61578052196057/");
  const [category, setCategory] = useState<"ALL" | "MATCHES" | "BALLISTICS" | "MEDIA">("MATCHES");
  const [likesCount, setLikesCount] = useState(18);
  const [commentsCount, setCommentsCount] = useState(4);
  const [sharesCount, setSharesCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [livePosts, setLivePosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Load existing posts from Supabase
  const loadPosts = async () => {
    setIsLoadingPosts(true);
    if (!supabase) {
      setIsLoadingPosts(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLivePosts(data);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Quick Preset Templates
  const applyTemplate = (type: "MATCH" | "DOPE" | "COIN") => {
    if (type === "MATCH") {
      setContent(
        "🚨 BRISTOL PRO SHOOTOUT BULLETIN: Squad 4 and Squad 7 flight slots are now at 90% capacity! Stage 9 Know-Your-Limits (KYL) rack has been positioned on Ridge Sector 3. Competitors must verify zero at 50 yards prior to safety briefing. #BristolPro #PrecisionRimfire #Subsonic"
      );
      setImageUrl("/assets/subsonic-facebook-cover.jpg");
      setCategory("MATCHES");
      setLikesCount(34);
      setCommentsCount(8);
      setSharesCount(5);
    } else if (type === "DOPE") {
      setContent(
        "📊 BALLISTICS ADVISORY: Holston Mountain thermal wind shear detected at 270° WNW (12-16 MPH gusts). If shooting Lapua Center-X (1,065 FPS) past 300 yards, add +0.3 MIL right hold for transonic wobble. #DOPE #Ballistics #MountainPrecision"
      );
      setImageUrl("/assets/subsonic-coin.jpg");
      setCategory("BALLISTICS");
      setLikesCount(42);
      setCommentsCount(12);
      setSharesCount(7);
    } else if (type === "COIN") {
      setContent(
        "🪙 CHALLENGE COIN MINTING COMPLETE: The 2026 Bristol Pro commemorative solid-brass serialized coins have arrived from the mint. Every competitor registered in Open Pro and Production will receive their custom coin in their match packet. #SubsonicSociety #ChallengeCoin #AppalachianRimfire"
      );
      setImageUrl("/assets/subsonic-coin.jpg");
      setCategory("MEDIA");
      setLikesCount(56);
      setCommentsCount(15);
      setSharesCount(11);
    }
  };

  // Submit post to Supabase
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorToast("Please enter post text or announcement.");
      return;
    }

    setIsSubmitting(true);
    setErrorToast(null);

    // Auto extract tags
    const extractedTags = (content.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.replace("#", ""));
    const defaultTags = ["BristolPro", "PrecisionRimfire", "Subsonic"];
    const tags = extractedTags.length > 0 ? Array.from(new Set([...extractedTags, ...defaultTags])) : defaultTags;

    const newPost = {
      id: `fb_${Date.now()}`,
      post_id: `fb_${Date.now()}`,
      platform: "FACEBOOK",
      content: content.trim(),
      published_at: new Date().toISOString(),
      image_url: imageUrl.trim() || null,
      external_url: externalUrl.trim() || "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
      likes_count: Number(likesCount),
      comments_count: Number(commentsCount),
      shares_count: Number(sharesCount),
      tags,
      category,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from("social_posts")
        .insert([newPost]);

      if (error) {
        setErrorToast(`Supabase error: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    setSuccessToast("Dispatch broadcasted live! It is now streaming in the Subsonic Social feed window.");
    setContent("");
    setImageUrl("");
    loadPosts();
    setIsSubmitting(false);

    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Delete post from Supabase
  const handleDeletePost = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", id);

      if (!error) {
        setLivePosts((prev) => prev.filter((p) => p.id !== id));
        setSuccessToast("Post deleted from live feed.");
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err: any) {
      setErrorToast(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast notifications */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-mono flex items-center justify-between shadow-tactical-glow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
              Meta Dispatch Transmitter
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Facebook Page Live Feed Manager
          </h2>
          <p className="text-xs text-slate-300">
            Publish dispatches directly to the homepage Subsonic Social window (Page ID: <span className="text-blue-300 font-mono">61578052196057</span>). Bypasses third-party OAuth limits.
          </p>
        </div>

        <a
          href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Radio className="w-4 h-4" />
          <span>Open Facebook Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid: Transmitter on Left, Live Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Create & Broadcast Dispatch (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="ios-glass rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Compose Live Facebook Dispatch</h3>
              </div>

              {/* Quick Template Chips */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-slate-500 hidden sm:inline">Templates:</span>
                <button
                  onClick={() => applyTemplate("MATCH")}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                >
                  Match Alert
                </button>
                <button
                  onClick={() => applyTemplate("DOPE")}
                  className="px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  DOPE Sheet
                </button>
                <button
                  onClick={() => applyTemplate("COIN")}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  Coin Drop
                </button>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              {/* Content Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Dispatch Content / Announcement *</span>
                  <span className="text-[10px] text-slate-500">{content.length} characters</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type match updates, range condition warnings, or paste caption from Facebook..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Photo / Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Image URL (Facebook CDN, Imgur, or Local Asset)</span>
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/assets/subsonic-facebook-cover.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500/60 font-mono"
                />
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl("/assets/subsonic-facebook-cover.jpg")}
                    className="hover:text-amber-400 underline"
                  >
                    Mountain Range Cover
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl("/assets/subsonic-coin.jpg")}
                    className="hover:text-amber-400 underline"
                  >
                    Minted Coin Photo
                  </button>
                </div>
              </div>

              {/* External Facebook Post URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">
                  Facebook Post Permalink (optional)
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.facebook.com/p/Subsonic-Society-61578052196057/posts/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-white/30 font-mono"
                />
              </div>

              {/* Stream Category & Engagement Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Stream Filter</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="MATCHES">Bristol Pro</option>
                    <option value="BALLISTICS">Ballistics & DOPE</option>
                    <option value="MEDIA">Coins & Hardware</option>
                    <option value="ALL">All Dispatches</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Likes Count</label>
                  <input
                    type="number"
                    value={likesCount}
                    onChange={(e) => setLikesCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Comments</label>
                  <input
                    type="number"
                    value={commentsCount}
                    onChange={(e) => setCommentsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Shares</label>
                  <input
                    type="number"
                    value={sharesCount}
                    onChange={(e) => setSharesCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 hover:brightness-110 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-tactical-glow active:scale-[0.98] transition-all"
              >
                <Send className="w-4 h-4 fill-black" />
                <span>{isSubmitting ? "Broadcasting..." : "Broadcast Live to Subsonic Social Feed"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Pane: Live Cloud Database Feed List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Active Supabase Dispatches
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {livePosts.length} Live
              </span>
            </div>

            <button
              onClick={loadPosts}
              disabled={isLoadingPosts}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              title="Refresh List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto no-scrollbar">
            {livePosts.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/10 bg-black/40 text-center space-y-2">
                <Radio className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-mono text-slate-400">
                  No cloud dispatches found in Supabase yet.
                </div>
                <div className="text-[11px] text-slate-500">
                  Broadcast your first post above and it will show up here and live on the homepage!
                </div>
              </div>
            ) : (
              livePosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl border border-white/10 bg-black/60 hover:border-blue-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-blue-400 font-semibold">{post.category || "GENERAL"}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>

                  {post.image_url && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10">
                      <Image
                        src={post.image_url}
                        alt="Dispatch"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                    <div>
                      {post.likes_count} likes • {post.comments_count} comments
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={post.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-white flex items-center gap-0.5"
                      >
                        <span>FB Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Delete from Live Feed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
