import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { SITE_URL } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, columns] = await Promise.all([
    prisma.sermon.findMany({ select: { id: true, updatedAt: true } }),
    prisma.column.findMany({ select: { id: true, updatedAt: true } }),
  ])

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/sermons`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/praise`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/bulletin`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/columns`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ]

  const sermonPages = sermons.map((s) => ({
    url: `${SITE_URL}/sermons/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const columnPages = columns.map((c) => ({
    url: `${SITE_URL}/columns/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...sermonPages, ...columnPages]
}
