import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://subsonicsociety.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot",
          "Bingbot",
        ],
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
