import { Metadata } from "next"

export const SITE_NAME = "동남 생명의 빛 교회"
export const SITE_DESCRIPTION =
  "청주시 상당구 가족 공동체, 동남 생명의 빛 교회. 이름을 불러주는 따뜻한 교회입니다."
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dongnam-llc.vercel.app").trim()
export const SITE_KEYWORDS = [
  "청주 상당구 교회",
  "청주 소규모 교회",
  "청주 가족같은 교회",
  "동남 생명의 빛 교회",
  "청주 교회 추천",
  "청주 따뜻한 교회",
]

export function generatePageMetadata(
  title: string,
  description?: string,
  path?: string,
  options?: { ogImage?: string }
): Metadata {
  const pageTitle = `${title} | ${SITE_NAME}`
  const pageDescription = description || SITE_DESCRIPTION

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: SITE_KEYWORDS,
    alternates: path ? { canonical: `${SITE_URL}${path}` } : undefined,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: path ? `${SITE_URL}${path}` : SITE_URL,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      ...(options?.ogImage && {
        images: [{ url: options.ogImage, width: 1280, height: 720 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      ...(options?.ogImage && { images: [options.ogImage] }),
    },
  }
}

export function churchJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "청주시",
      addressRegion: "충청북도",
      addressCountry: "KR",
      streetAddress: "상당구 중고개로125번길 29",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.6358,
      longitude: 127.4914,
    },
    founder: {
      "@type": "Person",
      name: "홍은익",
      jobTitle: "담임목사",
    },
    sameAs: [
      "https://www.youtube.com/@dongnamllc",
      "https://blog.naver.com/hey0190",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "11:00",
        closes: "13:00",
        description: "주일예배",
      },
    ],
  }
}

export function sermonJsonLd(sermon: {
  title: string
  scripture: string
  sermonDate: Date
  summary?: string | null
  youtubeId?: string | null
}) {
  if (!sermon.youtubeId) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: sermon.title,
      description: sermon.summary || `${sermon.title} - ${sermon.scripture}`,
      datePublished: sermon.sermonDate.toISOString(),
      author: { "@type": "Person", name: "홍은익" },
      publisher: { "@type": "Organization", name: SITE_NAME },
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: sermon.title,
    description: sermon.summary || `${sermon.title} - ${sermon.scripture}`,
    thumbnailUrl: `https://img.youtube.com/vi/${sermon.youtubeId}/maxresdefault.jpg`,
    uploadDate: sermon.sermonDate.toISOString(),
    contentUrl: `https://www.youtube.com/watch?v=${sermon.youtubeId}`,
    embedUrl: `https://www.youtube.com/embed/${sermon.youtubeId}`,
    publisher: { "@type": "Organization", name: SITE_NAME },
  }
}

export function columnJsonLd(column: {
  title: string
  scripture?: string | null
  createdAt: Date
  content: string
}) {
  const plainText = column.content.replace(/<[^>]*>/g, "").slice(0, 200)

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: column.title,
    description: plainText,
    datePublished: column.createdAt.toISOString(),
    author: { "@type": "Person", name: "홍은익" },
    publisher: { "@type": "Organization", name: SITE_NAME },
  }
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  }
}
