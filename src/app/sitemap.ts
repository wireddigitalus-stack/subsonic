import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://subsonicsociety.com";
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bristol-pro`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.95,
    },
  ];
}
