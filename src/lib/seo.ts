import { Metadata } from "next"

export const SITE_NAME = "동남 생명의 빛 교회"
export const SITE_DESCRIPTION =
  "청주시 상당구 가족 공동체, 동남 생명의 빛 교회. 이름을 불러주는 따뜻한 교회입니다."
export const SITE_URL = "https://dongnam.church"
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
  path?: string
): Metadata {
  const pageTitle = `${title} | ${SITE_NAME}`
  const pageDescription = description || SITE_DESCRIPTION

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: SITE_KEYWORDS,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: path ? `${SITE_URL}${path}` : SITE_URL,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
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
    founder: {
      "@type": "Person",
      name: "홍은익",
      jobTitle: "담임목사",
    },
  }
}
