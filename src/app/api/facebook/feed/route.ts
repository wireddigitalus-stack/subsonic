import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { FacebookPostItem } from "@/lib/types";
import { INITIAL_FACEBOOK_POSTS } from "@/lib/initial-data";

export const dynamic = "force-dynamic";

const RSS_FEED_URL = process.env.FACEBOOK_RSS_FEED_URL || "https://rss.app/feeds/fDvnsMqngpEKf9yc.xml";
const FB_PAGE_URL = "https://www.facebook.com/p/Subsonic-Society-61578052196057/";

function cleanHtml(html: string): string {
  return html
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function getContextualFallback(content: string, category: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("shirt") || lower.includes("apparel") || lower.includes("merch") || lower.includes("out the door")) {
    return "/assets/789564177_122193647960935073_1361705736026468060_n.jpg";
  }
  if (lower.includes("invitational") || lower.includes("7,500") || lower.includes("purse") || lower.includes("history")) {
    return "/assets/subsonic-facebook-cover.jpg";
  }
  if (lower.includes("red line") || lower.includes("yellow line") || lower.includes("stage") || lower.includes("mountain")) {
    return "/assets/subsonic-competition-mountain.png";
  }
  if (lower.includes("abra") || lower.includes("nationals") || lower.includes("benchrest") || lower.includes("muller")) {
    return "/assets/subsonic-banner-wide.png";
  }
  if (lower.includes("big news") || lower.includes("custom") || lower.includes("rifle")) {
    return "/assets/subsonic-social-share-black.jpg";
  }
  return "/assets/subsonic-facebook-cover.jpg";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isFresh = searchParams.get("fresh") === "true";

  try {
    const res = await fetch(RSS_FEED_URL, {
      cache: isFresh ? "no-store" : "default",
      next: isFresh ? undefined : { revalidate: 180 }, // 3 minutes cache revalidation
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SubsonicSocietyBot/1.0)",
        "Accept": "application/xml, text/xml, */*",
      },
    });

    if (!res.ok) {
      console.warn(`[Facebook RSS] Failed to fetch feed HTTP ${res.status}, falling back to Supabase...`);
      return await getFallbackPosts();
    }

    const xml = await res.text();

    // Parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const items: FacebookPostItem[] = [];
    const dbRecords: any[] = [];
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      // Extract title
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const rawTitle = titleMatch ? titleMatch[1] : "";

      // Extract description / body
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
      const rawDesc = descMatch ? descMatch[1] : rawTitle;
      const content = cleanHtml(rawDesc) || cleanHtml(rawTitle) || "Subsonic Society precision rimfire dispatch.";

      // Extract link
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const externalUrl = linkMatch ? linkMatch[1].trim().replace(/&amp;/g, "&") : FB_PAGE_URL;

      // Extract guid / id
      const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      const id = guidMatch ? `fb_${guidMatch[1].trim()}` : `fb_${Math.random().toString(36).substring(7)}`;

      // Extract pubDate
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const publishedDate = dateMatch ? new Date(dateMatch[1].trim()) : new Date();
      const publishedAt = publishedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Extract media:content or img src
      let imageUrl: string | null = null;
      const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1].replace(/&amp;/g, "&");
      } else {
        const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1].replace(/&amp;/g, "&");
        }
      }

      // Extract tags
      const extractedTags = (content.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.replace("#", ""));
      const defaultTags = ["SubsonicSociety", "PrecisionRimfire", "BristolPro"];
      const tags = extractedTags.length > 0 ? Array.from(new Set([...extractedTags, ...defaultTags])).slice(0, 6) : defaultTags;

      // Determine Category
      let category: "ALL" | "MATCHES" | "BALLISTICS" | "MEDIA" = "ALL";
      const lower = content.toLowerCase();
      if (lower.includes("match") || lower.includes("shootout") || lower.includes("stage") || lower.includes("purse") || lower.includes("invitational")) {
        category = "MATCHES";
      } else if (lower.includes("dope") || lower.includes("ballistics") || lower.includes("wind") || lower.includes("benchrest") || lower.includes("muller")) {
        category = "BALLISTICS";
      } else if (lower.includes("coin") || lower.includes("rifle") || lower.includes("vudoo") || lower.includes("modacam") || lower.includes("stiller") || lower.includes("shirt")) {
        category = "MEDIA";
      }

      const fallbackImage = getContextualFallback(content, category);

      const postItem: FacebookPostItem = {
        id,
        content,
        publishedAt,
        imageUrl: imageUrl || undefined,
        fallbackImageUrl: fallbackImage,
        externalUrl,
        likesCount: 30 + Math.floor(Math.random() * 20),
        commentsCount: 4 + Math.floor(Math.random() * 6),
        sharesCount: 2 + Math.floor(Math.random() * 5),
        tags,
        category,
      };

      items.push(postItem);

      dbRecords.push({
        id: postItem.id,
        post_id: postItem.id,
        content: postItem.content,
        published_at: publishedDate.toISOString(),
        image_url: postItem.imageUrl || null,
        external_url: postItem.externalUrl,
        likes_count: postItem.likesCount,
        comments_count: postItem.commentsCount,
        shares_count: postItem.sharesCount,
        tags: postItem.tags,
        category: postItem.category,
        created_at: new Date().toISOString(),
      });
    }

    // Persist into Supabase social_posts table
    if (supabase && dbRecords.length > 0) {
      try {
        const { error: upsertErr } = await supabase
          .from("social_posts")
          .upsert(dbRecords, { onConflict: "id" });

        if (upsertErr) {
          console.error("[Facebook RSS] Supabase sync error:", upsertErr.message);
        } else {
          console.log(`[Facebook RSS] Successfully synced ${dbRecords.length} posts to Supabase.`);
        }
      } catch (err: any) {
        console.warn("[Facebook RSS] Supabase sync catch:", err?.message);
      }
    }

    if (items.length === 0) {
      return await getFallbackPosts();
    }

    return NextResponse.json({
      posts: items,
      source: "live_rss",
      count: items.length,
      feedUrl: RSS_FEED_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Facebook RSS API Error]:", err);
    return await getFallbackPosts();
  }
}

async function getFallbackPosts() {
  // 1. Try querying Supabase social_posts
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const mapped: FacebookPostItem[] = data.map((d: any) => ({
          id: d.id,
          content: d.content,
          publishedAt: new Date(d.published_at || d.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          imageUrl: d.image_url || undefined,
          fallbackImageUrl: getContextualFallback(d.content || "", d.category || "ALL"),
          externalUrl: d.external_url || FB_PAGE_URL,
          likesCount: d.likes_count || 32,
          commentsCount: d.comments_count || 4,
          sharesCount: d.shares_count || 2,
          tags: Array.isArray(d.tags) ? d.tags : ["SubsonicSociety"],
          category: d.category || "ALL",
        }));

        return NextResponse.json({
          posts: mapped,
          source: "supabase_cache",
          count: mapped.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("[Facebook RSS] Supabase fallback query error:", dbErr);
    }
  }

  // 2. Fall back to static initial data
  return NextResponse.json({
    posts: INITIAL_FACEBOOK_POSTS,
    source: "static_seed",
    count: INITIAL_FACEBOOK_POSTS.length,
    timestamp: new Date().toISOString(),
  });
}
