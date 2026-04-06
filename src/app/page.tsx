import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/landing/Hero"
import { BrandMessage } from "@/components/landing/BrandMessage"
import { ServiceTimes } from "@/components/landing/ServiceTimes"
import { RecentSermons } from "@/components/landing/RecentSermons"
import { KakaoMap } from "@/components/landing/KakaoMap"
import { QuickLinks } from "@/components/landing/QuickLinks"
import { CTA } from "@/components/landing/CTA"
import { JsonLd } from "@/components/seo/JsonLd"

async function getSettings() {
  const settings = await prisma.siteSetting.findMany()
  const map: Record<string, string> = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return map
}

export default async function HomePage() {
  const [settings, sermons] = await Promise.all([
    getSettings(),
    prisma.sermon.findMany({
      orderBy: { sermonDate: "desc" },
      take: 3,
    }),
  ])

  return (
    <>
      <JsonLd />
      <Navbar />
      <main>
        <Hero />
        <BrandMessage />
        <ServiceTimes settings={settings} />
        <RecentSermons sermons={sermons} />
        <QuickLinks
          youtubeUrl={settings.youtube_url}
          blogUrl={settings.blog_url}
        />
        <KakaoMap address={settings.church_address || "충북 청주시 상당구"} />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
